// هذا ملف مبسط للنشر على Vercel باستخدام Serverless Functions

const express = require('express');
const { Pool } = require('@neondatabase/serverless');
const { drizzle } = require('drizzle-orm/neon-serverless');
const session = require('express-session');
const path = require('path');

// إنشاء تطبيق Express جديد
const app = express();
app.use(express.json());

// إعداد الخادم والجلسة
const sessionSecret = process.env.SESSION_SECRET || 'dev-session-secret';
app.use(session({
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production' }
}));

// توصيل قاعدة البيانات
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// سكيما قاعدة البيانات المبسطة
const schema = {
  users: { id: 'id', username: 'username', password: 'password', isAdmin: 'is_admin', points: 'points' },
  products: { id: 'id', name: 'name', description: 'description', price: 'price', category: 'category', imageUrl: 'image_url', stock: 'stock' },
  orders: { id: 'id', userId: 'user_id', status: 'status', totalPrice: 'total_price' },
  messages: { id: 'id', fromUserId: 'from_user_id', toUserId: 'to_user_id', content: 'content', read: 'read' }
};

// إعداد محاور API الأساسية
app.get('/api/products', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM products');
    res.json(rows);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

app.get('/api/user', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  const { password, ...user } = req.session.user;
  res.json(user);
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  
  try {
    const { rows } = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const user = rows[0];
    // هنا ستكون هناك مقارنة حقيقية لكلمات المرور
    
    req.session.user = user;
    const { password: _, ...safeUser } = user;
    
    res.json(safeUser);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

// في وضع الإنتاج، نقدم الملفات الثابتة
if (process.env.NODE_ENV === 'production') {
  const staticPath = path.join(process.cwd(), 'dist');
  app.use(express.static(staticPath));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(staticPath, 'index.html'));
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

// تصدير الدالة للاستخدام في Vercel Serverless Functions
module.exports = app;