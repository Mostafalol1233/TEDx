// المخططات لقاعدة البيانات
const { pgTable, text, serial, integer, boolean, timestamp } = require('drizzle-orm/pg-core');
const { relations } = require('drizzle-orm');

// جدول المستخدمين
const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name"),
  email: text("email"),
  points: integer("points").default(0).notNull(),
  isAdmin: boolean("is_admin").default(false).notNull()
});

// جدول المنتجات
const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  category: text("category").notNull(),
  price: integer("price").notNull(),
  stock: integer("stock").default(0),
  unlimited: boolean("unlimited").default(false),
  type: text("type").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  eventDate: timestamp("event_date"),
  eventLocation: text("event_location"),
  sizes: text("sizes")
});

// جدول الطلبات
const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  totalPoints: integer("total_points").notNull(),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow()
});

// جدول عناصر الطلبات
const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull(),
  productId: integer("product_id").notNull(),
  quantity: integer("quantity").notNull(),
  size: text("size"),
  pricePerItem: integer("price_per_item").notNull()
});

// جدول الرسائل
const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  fromUserId: integer("from_user_id").notNull(),
  toUserId: integer("to_user_id").notNull(),
  content: text("content").notNull(),
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow()
});

// جدول تحويلات النقاط
const pointTransfers = pgTable("point_transfers", {
  id: serial("id").primaryKey(),
  fromUserId: integer("from_user_id").notNull(),
  toUserId: integer("to_user_id").notNull(),
  points: integer("points").notNull(),
  reason: text("reason"),
  createdAt: timestamp("created_at").defaultNow()
});

// تصدير المخططات
module.exports = {
  users,
  products,
  orders,
  orderItems,
  messages,
  pointTransfers
};