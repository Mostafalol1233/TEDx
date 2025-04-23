import { 
  User, 
  InsertUser, 
  Product, 
  InsertProduct, 
  Order, 
  InsertOrder, 
  OrderItem, 
  InsertOrderItem,
  Message,
  InsertMessage,
  PointTransfer,
  InsertPointTransfer,
  users 
} from "@shared/schema";
import createMemoryStore from "memorystore";
import session from "express-session";

// Create memory store for session
const MemoryStore = createMemoryStore(session);

// Define storage interface with CRUD operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  updateUserPoints(id: number, points: number): Promise<void>;
  updateUserAdmin(id: number, isAdmin: boolean): Promise<void>;
  
  // Product operations
  getProduct(id: number): Promise<Product | undefined>;
  getAllProducts(): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProductStock(id: number, stock: number): Promise<void>;
  
  // Order operations
  getOrder(id: number): Promise<Order | undefined>;
  getUserOrders(userId: number): Promise<Order[]>;
  getAllOrders(): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: number, status: string): Promise<void>;
  
  // Order item operations
  getOrderItem(id: number): Promise<OrderItem | undefined>;
  getOrderItems(orderId: number): Promise<OrderItem[]>;
  createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem>;
  
  // Message operations
  getMessage(id: number): Promise<Message | undefined>;
  getUserMessages(userId: number): Promise<Message[]>;
  getConversation(user1Id: number, user2Id: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  markMessageAsRead(id: number): Promise<void>;
  
  // Point transfer operations
  getPointTransfer(id: number): Promise<PointTransfer | undefined>;
  getUserPointTransfers(userId: number): Promise<PointTransfer[]>;
  createPointTransfer(pointTransfer: InsertPointTransfer): Promise<PointTransfer>;
  
  // Session store
  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private products: Map<number, Product>;
  private orders: Map<number, Order>;
  private orderItems: Map<number, OrderItem>;
  private messages: Map<number, Message>;
  private pointTransfers: Map<number, PointTransfer>;
  
  public sessionStore: session.Store;
  
  private userIdCounter: number;
  private productIdCounter: number;
  private orderIdCounter: number;
  private orderItemIdCounter: number;
  private messageIdCounter: number;
  private pointTransferIdCounter: number;

  constructor() {
    this.users = new Map();
    this.products = new Map();
    this.orders = new Map();
    this.orderItems = new Map();
    this.messages = new Map();
    this.pointTransfers = new Map();
    
    this.userIdCounter = 1;
    this.productIdCounter = 1;
    this.orderIdCounter = 1;
    this.orderItemIdCounter = 1;
    this.messageIdCounter = 1;
    this.pointTransferIdCounter = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });
    
    // Create admin user by default
    const adminUser: User = {
      id: this.userIdCounter++,
      username: "admin",
      password: "admin123", // This would be hashed in the auth.ts
      name: "Administrator",
      email: "admin@ticktee.com",
      points: 10000,
      isAdmin: true
    };
    this.users.set(adminUser.id, adminUser);
    console.log("Admin user created");
    
    // Create some initial products
    this.addInitialProducts();
  }
  
  private async addInitialProducts() {
    // Event tickets
    await this.createProduct({
      name: "حفل الفنان محمد حماقي",
      description: "استمتع بأمسية رائعة مع الفنان محمد حماقي في حفل غنائي يقدم فيه أحدث أغانيه وأشهر أعماله الفنية.",
      imageUrl: "https://images.unsplash.com/photo-1523580494863-6f3031224c94",
      category: "حفل موسيقي",
      price: 1500,
      stock: 50,
      unlimited: false,
      type: "ticket",
      eventDate: new Date("2023-12-25T20:00:00"),
      eventLocation: "قاعة المؤتمرات الكبرى - القاهرة"
    });
    
    await this.createProduct({
      name: "مباراة النهائي - الأهلي vs الزمالك",
      description: "احضر المباراة النهائية بين الأهلي والزمالك في الدوري المصري.",
      imageUrl: "https://images.unsplash.com/photo-1459865264687-595d652de67e",
      category: "مباراة رياضية",
      price: 2000,
      stock: 100,
      unlimited: false,
      type: "ticket",
      eventDate: new Date("2023-12-30T18:00:00"),
      eventLocation: "استاد القاهرة"
    });
    
    await this.createProduct({
      name: "مؤتمر التكنولوجيا السنوي",
      description: "حضور مؤتمر التكنولوجيا السنوي الذي يجمع أبرز الخبراء في مجالات التكنولوجيا المختلفة.",
      imageUrl: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2",
      category: "مؤتمر",
      price: 1200,
      stock: 200,
      unlimited: false,
      type: "ticket",
      eventDate: new Date("2024-01-10T09:00:00"),
      eventLocation: "دبي - مركز المؤتمرات"
    });
    
    await this.createProduct({
      name: "معرض الفن التشكيلي",
      description: "زيارة معرض الفن التشكيلي الذي يضم لوحات لأشهر الفنانين العرب والعالميين.",
      imageUrl: "https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac",
      category: "معرض فني",
      price: 800,
      stock: 500,
      unlimited: true,
      type: "ticket",
      eventDate: new Date("2024-01-15T10:00:00"),
      eventLocation: "الرياض - صالة الفنون"
    });
    
    // T-shirts
    await this.createProduct({
      name: "تيشيرت قطن أسود بتصميم خاص",
      description: "تيشيرت قطني أسود بتصميم حصري للمنصة، مصنوع من أجود أنواع القطن.",
      imageUrl: "https://images.unsplash.com/photo-1576566588028-4147f3842f27",
      category: "حصري",
      price: 750,
      stock: 100,
      unlimited: false,
      type: "tshirt",
      sizes: "M,L,XL"
    });
    
    await this.createProduct({
      name: "تيشيرت أبيض بشعار المنصة",
      description: "تيشيرت أبيض مع شعار المنصة، مناسب للاستخدام اليومي.",
      imageUrl: "https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9",
      category: "أساسي",
      price: 600,
      stock: 150,
      unlimited: false,
      type: "tshirt",
      sizes: "S,M,L"
    });
    
    await this.createProduct({
      name: "تيشيرت نادي الأهلي الرسمي",
      description: "تيشيرت رسمي لنادي الأهلي المصري للموسم الحالي، مصنوع بجودة عالية.",
      imageUrl: "https://images.unsplash.com/photo-1503341504253-dff4815485f1",
      category: "رياضي",
      price: 950,
      stock: 75,
      unlimited: false,
      type: "tshirt",
      sizes: "M,L,XXL"
    });
    
    await this.createProduct({
      name: "تيشيرت قطني بألوان متعددة",
      description: "تيشيرت قطني بتصميم عصري وألوان متعددة، مريح للغاية.",
      imageUrl: "https://images.unsplash.com/photo-1586790170083-2f9ceadc732d",
      category: "عصري",
      price: 700,
      stock: 120,
      unlimited: false,
      type: "tshirt",
      sizes: "S,M,XL"
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { 
      id,
      username: insertUser.username,
      password: insertUser.password,
      name: insertUser.name || null,
      email: insertUser.email || null,
      points: 0, // Default points
      isAdmin: false // Default isAdmin status
    };
    this.users.set(id, user);
    return user;
  }
  
  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }
  
  async updateUserPoints(id: number, points: number): Promise<void> {
    const user = await this.getUser(id);
    if (user) {
      user.points = points;
      this.users.set(id, user);
    }
  }
  
  async updateUserAdmin(id: number, isAdmin: boolean): Promise<void> {
    const user = await this.getUser(id);
    if (user) {
      user.isAdmin = isAdmin;
      this.users.set(id, user);
    }
  }
  
  // Product operations
  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }
  
  async getAllProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }
  
  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = this.productIdCounter++;
    const product: Product = { 
      ...insertProduct, 
      id,
      createdAt: new Date()
    };
    this.products.set(id, product);
    return product;
  }
  
  async updateProductStock(id: number, stock: number): Promise<void> {
    const product = await this.getProduct(id);
    if (product) {
      product.stock = stock;
      this.products.set(id, product);
    }
  }
  
  // Order operations
  async getOrder(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }
  
  async getUserOrders(userId: number): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(
      (order) => order.userId === userId
    );
  }
  
  async getAllOrders(): Promise<Order[]> {
    return Array.from(this.orders.values());
  }
  
  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = this.orderIdCounter++;
    const order: Order = { 
      ...insertOrder, 
      id,
      createdAt: new Date()
    };
    this.orders.set(id, order);
    return order;
  }
  
  async updateOrderStatus(id: number, status: string): Promise<void> {
    const order = await this.getOrder(id);
    if (order) {
      order.status = status;
      this.orders.set(id, order);
    }
  }
  
  // Order item operations
  async getOrderItem(id: number): Promise<OrderItem | undefined> {
    return this.orderItems.get(id);
  }
  
  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    return Array.from(this.orderItems.values()).filter(
      (item) => item.orderId === orderId
    );
  }
  
  async createOrderItem(insertOrderItem: InsertOrderItem): Promise<OrderItem> {
    const id = this.orderItemIdCounter++;
    const orderItem: OrderItem = { 
      ...insertOrderItem, 
      id 
    };
    this.orderItems.set(id, orderItem);
    return orderItem;
  }

  // Message operations
  async getMessage(id: number): Promise<Message | undefined> {
    return this.messages.get(id);
  }

  async getUserMessages(userId: number): Promise<Message[]> {
    return Array.from(this.messages.values()).filter(
      (message) => message.toUserId === userId || message.fromUserId === userId
    );
  }

  async getConversation(user1Id: number, user2Id: number): Promise<Message[]> {
    return Array.from(this.messages.values()).filter(
      (message) => 
        (message.fromUserId === user1Id && message.toUserId === user2Id) ||
        (message.fromUserId === user2Id && message.toUserId === user1Id)
    ).sort((a, b) => {
      if (!a.createdAt || !b.createdAt) return 0;
      return a.createdAt.getTime() - b.createdAt.getTime();
    });
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = this.messageIdCounter++;
    const message: Message = {
      ...insertMessage,
      id,
      isRead: false,
      createdAt: new Date()
    };
    this.messages.set(id, message);
    return message;
  }

  async markMessageAsRead(id: number): Promise<void> {
    const message = await this.getMessage(id);
    if (message) {
      message.isRead = true;
      this.messages.set(id, message);
    }
  }

  // Point transfer operations
  async getPointTransfer(id: number): Promise<PointTransfer | undefined> {
    return this.pointTransfers.get(id);
  }

  async getUserPointTransfers(userId: number): Promise<PointTransfer[]> {
    return Array.from(this.pointTransfers.values()).filter(
      (transfer) => transfer.toUserId === userId || transfer.fromUserId === userId
    );
  }

  async createPointTransfer(insertPointTransfer: InsertPointTransfer): Promise<PointTransfer> {
    const id = this.pointTransferIdCounter++;
    const pointTransfer: PointTransfer = {
      ...insertPointTransfer,
      id,
      createdAt: new Date()
    };
    this.pointTransfers.set(id, pointTransfer);

    // Update user points
    const fromUser = await this.getUser(insertPointTransfer.fromUserId);
    const toUser = await this.getUser(insertPointTransfer.toUserId);

    if (fromUser && toUser) {
      // Only deduct points from sender if they are not an admin
      if (!fromUser.isAdmin) {
        fromUser.points -= insertPointTransfer.points;
        this.users.set(fromUser.id, fromUser);
      }

      // Add points to receiver
      toUser.points += insertPointTransfer.points;
      this.users.set(toUser.id, toUser);
    }

    return pointTransfer;
  }
}

// Import database storage implementation
import { DatabaseStorage } from "./storage-db";

// Use DatabaseStorage instead of MemStorage
export const storage = new DatabaseStorage();
