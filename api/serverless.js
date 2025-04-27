// ملف Vercel Serverless Function للنشر

const express = require('express');
const { Pool, neonConfig } = require('@neondatabase/serverless');
const { drizzle } = require('drizzle-orm/neon-serverless');
const session = require('express-session');
const passport = require('passport');
const { Strategy: LocalStrategy } = require('passport-local');
const { scrypt, randomBytes, timingSafeEqual } = require('crypto');
const { promisify } = require('util');
const path = require('path');
const { eq, or, and, desc } = require('drizzle-orm');
const connectPg = require('connect-pg-simple');
const ws = require('ws');

// إعداد Neon لاستخدام WebSockets
neonConfig.webSocketConstructor = ws;

// إنشاء تطبيق Express جديد
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// توصيل قاعدة البيانات
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL must be set. Did you forget to provision a database?');
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// استيراد المخططات
const schema = require('./schema.js');
const db = drizzle(pool, { schema });

// إعداد الجلسات ومكتبة Passport للمصادقة
const scryptAsync = promisify(scrypt);
const PostgresSessionStore = connectPg(session);
const sessionStore = new PostgresSessionStore({
  pool,
  createTableIfMissing: true
});

const sessionMiddleware = session({
  store: sessionStore,
  secret: process.env.SESSION_SECRET || 'dev-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    maxAge: 1000 * 60 * 60 * 24 * 7 // أسبوع واحد
  }
});

app.use(sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session());

// وظائف لتشفير ومقارنة كلمات المرور
async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString('hex')}.${salt}`;
}

async function comparePasswords(password, hashedPassword) {
  const [hashedPart, salt] = hashedPassword.split('.');
  const hashedBuffer = Buffer.from(hashedPart, 'hex');
  const suppliedBuffer = await scryptAsync(password, salt, 64);
  return timingSafeEqual(hashedBuffer, suppliedBuffer);
}

// إعداد إستراتيجية المصادقة المحلية
passport.use(new LocalStrategy(async (username, password, done) => {
  try {
    const users = await db.select().from(schema.users).where(eq(schema.users.username, username));
    
    if (users.length === 0) {
      return done(null, false, { message: 'المستخدم غير موجود' });
    }
    
    const user = users[0];
    const isPasswordValid = await comparePasswords(password, user.password);
    
    if (!isPasswordValid) {
      return done(null, false, { message: 'كلمة المرور غير صحيحة' });
    }
    
    return done(null, user);
  } catch (error) {
    return done(error);
  }
}));

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
  } catch (error) {
    done(error);
  }
});

// إعداد محاور API
app.get('/api/products', async (req, res) => {
  try {
    const products = await db.select().from(schema.products);
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'حدث خطأ أثناء جلب المنتجات' });
  }
});

app.get('/api/user', (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'غير مصرح' });
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
      return res.status(401).json({ message: info.message || 'فشل المصادقة' });
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

// مسارات API إضافية
app.get('/api/messages', async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'غير مصرح' });
  }
  
  try {
    const messages = await db.select().from(schema.messages).where(
      or(
        eq(schema.messages.fromUserId, req.user.id),
        eq(schema.messages.toUserId, req.user.id)
      )
    );
    
    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'حدث خطأ أثناء جلب الرسائل' });
  }
});

app.post('/api/messages', async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'غير مصرح' });
  }
  
  const { toUserId, content } = req.body;
  
  if (!toUserId || !content) {
    return res.status(400).json({ message: 'بيانات غير كاملة' });
  }
  
  try {
    const [message] = await db.insert(schema.messages).values({
      fromUserId: req.user.id,
      toUserId,
      content,
      isRead: false,
      createdAt: new Date()
    }).returning();
    
    res.status(201).json(message);
  } catch (error) {
    console.error('Error creating message:', error);
    res.status(500).json({ message: 'حدث خطأ أثناء إنشاء الرسالة' });
  }
});

// في وضع الإنتاج، نقدم الملفات الثابتة
if (process.env.NODE_ENV === 'production') {
  const staticPath = path.join(process.cwd(), 'dist');
  app.use(express.static(staticPath));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(staticPath, 'index.html'));
  });
}

// إضافة دعم WebSocket
const { WebSocketServer } = require('ws');

let wss;
// إذا لم نكن في Vercel Serverless (تشغيل محلي)، قم بإعداد خادم WebSocket
if (!process.env.VERCEL) {
  const server = require('http').createServer(app);
  
  wss = new WebSocketServer({ server, path: '/ws' });
  
  wss.on('connection', (ws) => {
    console.log('WebSocket client connected');
    
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message);
        console.log('Received message:', data);
        
        // معالجة رسائل ping
        if (data.type === 'ping') {
          ws.send(JSON.stringify({ type: 'pong' }));
        }
        
        // معالجة رسائل getProducts
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
      } catch (e) {
        console.error('Error processing WebSocket message:', e);
      }
    });
    
    ws.on('close', () => {
      console.log('WebSocket client disconnected');
    });
  });
  
  // تشغيل الخادم على المنفذ المطلوب
  const port = process.env.PORT || 5000;
  server.listen(port, '0.0.0.0', () => {
    console.log(`Server running on port ${port}`);
  });
}

// إعداد معالج الأخطاء
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'production' ? {} : err
  });
});

// دالة للتعامل مع طلبات Vercel Serverless Functions
const handler = (req, res) => {
  // إذا كان طلب WebSocket، يتم معالجته بشكل خاص
  if (req.headers.upgrade && req.headers.upgrade.toLowerCase() === 'websocket') {
    // هنا يمكن إضافة معالجة خاصة لطلبات WebSocket إذا لزم الأمر
    return;
  }
  
  // إعادة الطلبات العادية إلى إطار Express
  return app(req, res);
};

// تصدير الدالة للاستخدام في Vercel Serverless Functions
module.exports = process.env.VERCEL ? handler : app;