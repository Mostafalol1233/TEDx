import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { 
  Order, 
  OrderItem,
  Product,
  insertProductSchema, 
  insertOrderSchema,
  insertOrderItemSchema
} from "@shared/schema";
import { z } from "zod";

// Middleware to check if user is authenticated
const isAuthenticated = (req: any, res: any, next: any) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
};

// Middleware to check if user is admin
const isAdmin = (req: any, res: any, next: any) => {
  if (req.isAuthenticated() && req.user.isAdmin) {
    return next();
  }
  res.status(403).json({ message: "Forbidden" });
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // Products API
  app.get("/api/products", async (req, res) => {
    try {
      const products = await storage.getAllProducts();
      res.json(products);
    } catch (err) {
      console.error("Error fetching products:", err);
      res.status(500).json({ message: "Failed to fetch products", error: err.message });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const product = await storage.getProduct(id);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.json(product);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  // Orders API
  app.get("/api/orders", isAuthenticated, async (req, res) => {
    try {
      const orders = await storage.getUserOrders(req.user.id);
      res.json(orders);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.get("/api/orders/:id/details", isAuthenticated, async (req, res) => {
    try {
      const orderId = parseInt(req.params.id);
      const order = await storage.getOrder(orderId);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      // Check if user is admin or order owner
      if (!req.user.isAdmin && order.userId !== req.user.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const orderItems = await storage.getOrderItems(orderId);
      
      if (orderItems.length === 0) {
        return res.status(404).json({ message: "Order items not found" });
      }
      
      const product = await storage.getProduct(orderItems[0].productId);
      const user = await storage.getUser(order.userId);
      
      res.json({
        orderId: order.id,
        username: user?.username || "Unknown",
        userId: order.userId,
        productName: product?.name || "Unknown product",
        productId: orderItems[0].productId,
        quantity: orderItems[0].quantity,
        size: orderItems[0].size,
        totalPoints: order.totalPoints,
        status: order.status,
        createdAt: order.createdAt
      });
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch order details" });
    }
  });

  app.post("/api/orders", isAuthenticated, async (req, res) => {
    try {
      const parseResult = insertOrderSchema.safeParse(req.body);
      
      if (!parseResult.success) {
        return res.status(400).json({ message: "Invalid order data" });
      }
      
      const orderData = parseResult.data;
      
      // Ensure user can only create orders for themselves
      if (orderData.userId !== req.user.id) {
        return res.status(403).json({ message: "Cannot create order for another user" });
      }
      
      // Check if user has enough points
      if (req.user.points < orderData.totalPoints) {
        return res.status(400).json({ message: "Insufficient points" });
      }
      
      // Create order
      const order = await storage.createOrder(orderData);
      
      // Deduct points from user
      await storage.updateUserPoints(req.user.id, req.user.points - orderData.totalPoints);
      
      res.status(201).json(order);
    } catch (err) {
      res.status(500).json({ message: "Failed to create order" });
    }
  });

  app.post("/api/order-items", isAuthenticated, async (req, res) => {
    try {
      const parseResult = insertOrderItemSchema.safeParse(req.body);
      
      if (!parseResult.success) {
        return res.status(400).json({ message: "Invalid order item data" });
      }
      
      const orderItemData = parseResult.data;
      
      // Get the order to check if it belongs to the user
      const order = await storage.getOrder(orderItemData.orderId);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      if (order.userId !== req.user.id) {
        return res.status(403).json({ message: "Cannot add items to another user's order" });
      }
      
      // Get product to check availability
      const product = await storage.getProduct(orderItemData.productId);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      // Check if product is in stock
      if (!product.unlimited && product.stock < orderItemData.quantity) {
        return res.status(400).json({ message: "Product out of stock" });
      }
      
      // Create order item
      const orderItem = await storage.createOrderItem(orderItemData);
      
      // Update product stock if not unlimited
      if (!product.unlimited) {
        await storage.updateProductStock(
          product.id, 
          product.stock - orderItemData.quantity
        );
      }
      
      res.status(201).json(orderItem);
    } catch (err) {
      res.status(500).json({ message: "Failed to create order item" });
    }
  });

  // Admin API
  app.get("/api/admin/users", isAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.get("/api/admin/orders", isAdmin, async (req, res) => {
    try {
      const orders = await storage.getAllOrders();
      res.json(orders);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.post("/api/admin/users/:id/add-points", isAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const pointsSchema = z.object({
        points: z.number().min(1, "Points must be at least 1")
      });
      
      const parseResult = pointsSchema.safeParse(req.body);
      
      if (!parseResult.success) {
        return res.status(400).json({ message: "Invalid points data" });
      }
      
      const { points } = parseResult.data;
      
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      await storage.updateUserPoints(userId, user.points + points);
      
      const updatedUser = await storage.getUser(userId);
      
      res.json(updatedUser);
    } catch (err) {
      res.status(500).json({ message: "Failed to add points" });
    }
  });

  app.patch("/api/admin/users/:id", isAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const adminSchema = z.object({
        isAdmin: z.boolean()
      });
      
      const parseResult = adminSchema.safeParse(req.body);
      
      if (!parseResult.success) {
        return res.status(400).json({ message: "Invalid admin data" });
      }
      
      const { isAdmin } = parseResult.data;
      
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      await storage.updateUserAdmin(userId, isAdmin);
      
      const updatedUser = await storage.getUser(userId);
      
      res.json(updatedUser);
    } catch (err) {
      res.status(500).json({ message: "Failed to update user admin status" });
    }
  });

  app.post("/api/products", isAdmin, async (req, res) => {
    try {
      const parseResult = insertProductSchema.safeParse(req.body);
      
      if (!parseResult.success) {
        return res.status(400).json({ message: "Invalid product data" });
      }
      
      const productData = parseResult.data;
      
      // Create product
      const product = await storage.createProduct(productData);
      
      res.status(201).json(product);
    } catch (err) {
      res.status(500).json({ message: "Failed to create product" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
