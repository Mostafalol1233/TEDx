import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name"),
  email: text("email"),
  points: integer("points").default(0).notNull(),
  isAdmin: boolean("is_admin").default(false).notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
  email: true,
});

// Product schema
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  category: text("category").notNull(),
  price: integer("price").notNull(),
  stock: integer("stock").default(0),
  unlimited: boolean("unlimited").default(false),
  type: text("type").notNull(), // "ticket" or "tshirt"
  createdAt: timestamp("created_at").defaultNow(),
  eventDate: timestamp("event_date"), // Only for tickets
  eventLocation: text("event_location"), // Only for tickets
  sizes: text("sizes"), // Only for t-shirts, stored as comma-separated values
});

export const insertProductSchema = createInsertSchema(products).pick({
  name: true,
  description: true,
  imageUrl: true,
  category: true,
  price: true,
  stock: true,
  unlimited: true,
  type: true,
  eventDate: true,
  eventLocation: true,
  sizes: true,
});

// Order schema
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  totalPoints: integer("total_points").notNull(),
  status: text("status").notNull().default("pending"), // pending, shipped, delivered, cancelled
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertOrderSchema = createInsertSchema(orders).pick({
  userId: true,
  totalPoints: true,
  status: true,
});

// Order item schema
export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull(),
  productId: integer("product_id").notNull(),
  quantity: integer("quantity").notNull(),
  size: text("size"), // Only for t-shirts
  pricePerItem: integer("price_per_item").notNull(),
});

export const insertOrderItemSchema = createInsertSchema(orderItems).pick({
  orderId: true,
  productId: true,
  quantity: true,
  size: true,
  pricePerItem: true,
});

// Message schema for user-admin communication
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  fromUserId: integer("from_user_id").notNull(),
  toUserId: integer("to_user_id").notNull(),
  content: text("content").notNull(),
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertMessageSchema = createInsertSchema(messages).pick({
  fromUserId: true,
  toUserId: true,
  content: true,
});

// Point Transfer schema for admin to user point transfers
export const pointTransfers = pgTable("point_transfers", {
  id: serial("id").primaryKey(),
  fromUserId: integer("from_user_id").notNull(),
  toUserId: integer("to_user_id").notNull(),
  points: integer("points").notNull(),
  reason: text("reason"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPointTransferSchema = createInsertSchema(pointTransfers).pick({
  fromUserId: true,
  toUserId: true,
  points: true, 
  reason: true,
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  orders: many(orders),
  sentMessages: many(messages, { relationName: "fromUser" }),
  receivedMessages: many(messages, { relationName: "toUser" }),
  sentPointTransfers: many(pointTransfers, { relationName: "fromUser" }),
  receivedPointTransfers: many(pointTransfers, { relationName: "toUser" }),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  fromUser: one(users, {
    fields: [messages.fromUserId],
    references: [users.id],
    relationName: "fromUser",
  }),
  toUser: one(users, {
    fields: [messages.toUserId],
    references: [users.id],
    relationName: "toUser",
  }),
}));

export const pointTransfersRelations = relations(pointTransfers, ({ one }) => ({
  fromUser: one(users, {
    fields: [pointTransfers.fromUserId],
    references: [users.id],
    relationName: "fromUser",
  }),
  toUser: one(users, {
    fields: [pointTransfers.toUserId],
    references: [users.id],
    relationName: "toUser",
  }),
}));

export const productsRelations = relations(products, ({ many }) => ({
  orderItems: many(orderItems),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id]
  }),
  orderItems: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id]
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id]
  }),
}));

// Type definitions
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;

export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;

export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

export type PointTransfer = typeof pointTransfers.$inferSelect;
export type InsertPointTransfer = z.infer<typeof insertPointTransferSchema>;
