import { 
  User, 
  InsertUser, 
  Product, 
  InsertProduct, 
  Order, 
  InsertOrder, 
  OrderItem, 
  InsertOrderItem,
  users,
  products,
  orders,
  orderItems
} from "@shared/schema";
import { db, pool } from "./db";
import { eq } from "drizzle-orm";
import connectPg from "connect-pg-simple";
import session from "express-session";
import { IStorage } from "./storage";

// Create PostgreSQL session store
const PostgresSessionStore = connectPg(session);

// Define database storage implementation
export class DatabaseStorage implements IStorage {
  public sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool, 
      createTableIfMissing: true
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return db.select().from(users);
  }

  async updateUserPoints(id: number, points: number): Promise<void> {
    await db
      .update(users)
      .set({ points })
      .where(eq(users.id, id));
  }

  async updateUserAdmin(id: number, isAdmin: boolean): Promise<void> {
    await db
      .update(users)
      .set({ isAdmin })
      .where(eq(users.id, id));
  }

  // Product operations
  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async getAllProducts(): Promise<Product[]> {
    return db.select().from(products);
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const [product] = await db.insert(products).values(insertProduct).returning();
    return product;
  }

  async updateProductStock(id: number, stock: number): Promise<void> {
    await db
      .update(products)
      .set({ stock })
      .where(eq(products.id, id));
  }

  // Order operations
  async getOrder(id: number): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order;
  }

  async getUserOrders(userId: number): Promise<Order[]> {
    return db.select().from(orders).where(eq(orders.userId, userId));
  }

  async getAllOrders(): Promise<Order[]> {
    return db.select().from(orders);
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const [order] = await db.insert(orders).values(insertOrder).returning();
    return order;
  }

  async updateOrderStatus(id: number, status: string): Promise<void> {
    await db
      .update(orders)
      .set({ status })
      .where(eq(orders.id, id));
  }

  // Order item operations
  async getOrderItem(id: number): Promise<OrderItem | undefined> {
    const [orderItem] = await db.select().from(orderItems).where(eq(orderItems.id, id));
    return orderItem;
  }

  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    return db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
  }

  async createOrderItem(insertOrderItem: InsertOrderItem): Promise<OrderItem> {
    const [orderItem] = await db.insert(orderItems).values(insertOrderItem).returning();
    return orderItem;
  }
}