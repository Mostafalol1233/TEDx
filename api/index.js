const express = require('express');
const { createServer } = require('http');
const { WebSocketServer } = require('ws');
const { Pool } = require('@neondatabase/serverless');
const { drizzle } = require('drizzle-orm/postgres-js');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const crypto = require('crypto');
const path = require('path');
const { eq } = require('drizzle-orm');
const schema = require('./schema');

// إعداد Express
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// إعداد قاعدة البيانات
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool, { schema });

// إعداد الجلسات
const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET || 'dev_session_secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
  }
});
app.use(sessionMiddleware);

// إعداد المصادقة
app.use(passport.initialize());
app.use(passport.session());

async function hashPassword(password) {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(16).toString('hex');
    crypto.pbkdf2(password, salt, 1000, 64, 'sha512', (err, derivedKey) => {
      if (err) return reject(err);
      resolve(salt + ':' + derivedKey.toString('hex'));
    });
  });
}

async function comparePasswords(supplied, stored) {
  return new Promise((resolve, reject) => {
    const [salt, key] = stored.split(':');
    crypto.pbkdf2(supplied, salt, 1000, 64, 'sha512', (err, derivedKey) => {
      if (err) return reject(err);
      resolve(key === derivedKey.toString('hex'));
    });
  });
}

passport.use(new LocalStrategy(
  async (username, password, done) => {
    try {
      const users = await db.select().from(schema.users).where(eq(schema.users.username, username));
      if (users.length === 0) {
        return done(null, false, { message: 'Incorrect username.' });
      }
      
      const user = users[0];
      const passwordValid = await comparePasswords(password, user.password);
      
      if (!passwordValid) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const users = await db.select().from(schema.users).where(eq(schema.users.id, id));
    if (users.length === 0) {
      return done(null, false);
    }
    done(null, users[0]);
  } catch (err) {
    done(err);
  }
});

// إعداد الطرق API
app.get('/api/user', (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  const user = { ...req.user };
  delete user.password;
  res.json(user);
});

app.post('/api/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).json({ message: info.message || 'Authentication failed' });
    }
    req.login(user, (err) => {
      if (err) {
        return next(err);
      }
      const userResponse = { ...user };
      delete userResponse.password;
      return res.json(userResponse);
    });
  })(req, res, next);
});

app.post('/api/logout', (req, res) => {
  req.logout(() => {
    res.json({ success: true });
  });
});

app.get('/api/products', async (req, res) => {
  try {
    const products = await db.select().from(schema.products);
    res.json(products);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ message: 'Error fetching products' });
  }
});

// في وضع الانتاج، خدمة الملفات الثابتة
if (process.env.NODE_ENV === 'production') {
  const staticPath = path.join(process.cwd(), 'dist');
  app.use(express.static(staticPath));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(staticPath, 'index.html'));
  });
}

// إعداد معالج الأخطاء
app.use((err, _req, res, _next) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  res.status(status).json({ message });
});

// إنشاء خادم HTTP
const server = createServer(app);

// إعداد WebSocket
const wss = new WebSocketServer({ server, path: '/ws' });

wss.on('connection', (ws) => {
  console.log('WebSocket client connected');
  
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      console.log('Received message:', data);
      
      // معالجة رسائل المنتجات
      if (data.type === 'getProducts') {
        db.select().from(schema.products)
          .then(products => {
            ws.send(JSON.stringify({
              type: 'products',
              data: products
            }));
          })
          .catch(err => {
            console.error('Error fetching products for WebSocket:', err);
          });
      }
      
      // معالجة رسائل ping
      if (data.type === 'ping') {
        ws.send(JSON.stringify({ type: 'pong' }));
      }
    } catch (e) {
      console.error('Error processing WebSocket message:', e);
    }
  });
  
  ws.on('close', () => {
    console.log('WebSocket client disconnected');
  });
});

// في حالة الإستضافة على Vercel
if (process.env.VERCEL) {
  module.exports = app;
} else {
  // تشغيل الخادم محليًا
  const port = process.env.PORT || 5000;
  server.listen(port, '0.0.0.0', () => {
    console.log(`Server running on port ${port}`);
  });
}