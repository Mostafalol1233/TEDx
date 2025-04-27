import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { 
  Order, 
  OrderItem,
  Product,
  Message,
  PointTransfer,
  insertProductSchema, 
  insertOrderSchema,
  insertOrderItemSchema,
  insertMessageSchema,
  insertPointTransferSchema
} from "@shared/schema";
import { z } from "zod";
import { WebSocketServer, WebSocket } from "ws";

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
      res.status(500).json({ message: "Failed to fetch products", error: err instanceof Error ? err.message : String(err) });
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

  // Messages API
  app.get("/api/messages", isAuthenticated, async (req, res) => {
    try {
      const messages = await storage.getUserMessages(req.user.id);
      res.json(messages);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.get("/api/messages/conversation/:userId", isAuthenticated, async (req, res) => {
    try {
      const otherUserId = parseInt(req.params.userId);
      const conversation = await storage.getConversation(req.user.id, otherUserId);
      res.json(conversation);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch conversation" });
    }
  });

  app.post("/api/messages", isAuthenticated, async (req, res) => {
    try {
      const parseResult = insertMessageSchema.safeParse(req.body);
      
      if (!parseResult.success) {
        return res.status(400).json({ message: "Invalid message data" });
      }
      
      const messageData = parseResult.data;
      
      // Ensure user can only send messages from themselves
      if (messageData.fromUserId !== req.user.id) {
        return res.status(403).json({ message: "Cannot send message as another user" });
      }
      
      // Check if recipient exists
      const recipient = await storage.getUser(messageData.toUserId);
      if (!recipient) {
        return res.status(404).json({ message: "Recipient not found" });
      }
      
      // Create message
      const message = await storage.createMessage(messageData);
      
      res.status(201).json(message);
    } catch (err) {
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  app.patch("/api/messages/:id/read", isAuthenticated, async (req, res) => {
    try {
      const messageId = parseInt(req.params.id);
      const message = await storage.getMessage(messageId);
      
      if (!message) {
        return res.status(404).json({ message: "Message not found" });
      }
      
      // Ensure user can only mark messages addressed to them as read
      if (message.toUserId !== req.user.id) {
        return res.status(403).json({ message: "Cannot mark this message as read" });
      }
      
      await storage.markMessageAsRead(messageId);
      
      res.status(200).json({ success: true });
    } catch (err) {
      res.status(500).json({ message: "Failed to mark message as read" });
    }
  });

  // Point Transfer API
  app.get("/api/point-transfers", isAuthenticated, async (req, res) => {
    try {
      const transfers = await storage.getUserPointTransfers(req.user.id);
      res.json(transfers);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch point transfers" });
    }
  });

  app.post("/api/point-transfers", isAuthenticated, async (req, res) => {
    try {
      const parseResult = insertPointTransferSchema.safeParse(req.body);
      
      if (!parseResult.success) {
        return res.status(400).json({ message: "Invalid point transfer data" });
      }
      
      const transferData = parseResult.data;
      
      // Ensure user can only send points from themselves
      if (transferData.fromUserId !== req.user.id) {
        return res.status(403).json({ message: "Cannot send points as another user" });
      }
      
      // Check if recipient exists
      const recipient = await storage.getUser(transferData.toUserId);
      if (!recipient) {
        return res.status(404).json({ message: "Recipient not found" });
      }
      
      // Check if user has enough points (admins are exempt)
      if (!req.user.isAdmin && req.user.points < transferData.points) {
        return res.status(400).json({ message: "Insufficient points" });
      }
      
      // Create point transfer
      const transfer = await storage.createPointTransfer(transferData);
      
      res.status(201).json(transfer);
    } catch (err) {
      res.status(500).json({ message: "Failed to transfer points" });
    }
  });

  // Get admin users for non-admin users to contact
  app.get("/api/users/admins", isAuthenticated, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      const adminUsers = users.filter(user => user.isAdmin);
      res.json(adminUsers);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch admin users" });
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

  // Admin Product API routes
  app.post("/api/admin/products", isAdmin, async (req, res) => {
    try {
      const parseResult = insertProductSchema.safeParse(req.body);
      
      if (!parseResult.success) {
        return res.status(400).json({ 
          message: "Invalid product data", 
          errors: parseResult.error.errors 
        });
      }
      
      const productData = parseResult.data;
      
      // Create product
      const product = await storage.createProduct(productData);
      
      res.status(201).json(product);
    } catch (err) {
      console.error("Error creating product:", err);
      res.status(500).json({ 
        message: "Failed to create product", 
        error: err instanceof Error ? err.message : String(err) 
      });
    }
  });
  
  app.patch("/api/admin/products/:id", isAdmin, async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      
      // Get existing product
      const existingProduct = await storage.getProduct(productId);
      if (!existingProduct) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      // Validate update data (partial schema)
      const productUpdateSchema = z.object({
        name: z.string().optional(),
        description: z.string().nullable().optional(),
        price: z.number().optional(),
        category: z.string().optional(),
        imageUrl: z.string().nullable().optional(),
        stock: z.number().nullable().optional(),
        unlimited: z.boolean().nullable().optional(),
        eventDate: z.date().nullable().optional(),
        eventLocation: z.string().nullable().optional(),
        sizes: z.string().nullable().optional(),
      });
      
      const parseResult = productUpdateSchema.safeParse(req.body);
      
      if (!parseResult.success) {
        return res.status(400).json({ 
          message: "Invalid product update data", 
          errors: parseResult.error.errors 
        });
      }
      
      // Update product using the storage method
      const updatedProduct = await storage.updateProduct(productId, parseResult.data);
      
      if (!updatedProduct) {
        return res.status(404).json({ message: "Failed to update product" });
      }
      
      res.json(updatedProduct);
    } catch (err) {
      console.error("Error updating product:", err);
      res.status(500).json({ 
        message: "Failed to update product", 
        error: err instanceof Error ? err.message : String(err) 
      });
    }
  });
  
  app.delete("/api/admin/products/:id", isAdmin, async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      
      // Use the deleteProduct method
      const success = await storage.deleteProduct(productId);
      
      if (!success) {
        return res.status(404).json({ message: "Product not found or could not be deleted" });
      }
      
      res.json({ success: true, message: "Product deleted successfully" });
    } catch (err) {
      console.error("Error deleting product:", err);
      res.status(500).json({ 
        message: "Failed to delete product", 
        error: err instanceof Error ? err.message : String(err) 
      });
    }
  });

  const httpServer = createServer(app);
  
  // Setup WebSocket server on a different path to avoid conflicts with Vite's WebSocket
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  // Connected clients
  const clients = new Map();
  
  wss.on('connection', (ws) => {
    const clientId = Date.now();
    clients.set(clientId, ws);
    console.log(`WebSocket client connected: ${clientId}`);
    
    // Send initial data to client
    sendToClient(ws, { type: 'connection', message: 'Connected to server', clientId });
    
    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString());
        console.log(`Received message from client ${clientId}:`, data);
        
        // Handle different message types
        switch (data.type) {
          case 'getProducts':
            const products = await storage.getAllProducts();
            sendToClient(ws, { type: 'products', data: products });
            break;
            
          case 'getOrders':
            if (data.userId) {
              const orders = await storage.getUserOrders(data.userId);
              sendToClient(ws, { type: 'orders', data: orders });
            }
            break;
            
          case 'getMessages':
            if (data.userId) {
              const messages = await storage.getUserMessages(data.userId);
              sendToClient(ws, { type: 'messages', data: messages });
            }
            break;
          
          case 'messageSent':
            // When a message is sent, notify all connected clients
            if (data.data) {
              // Broadcast the message to all clients to ensure real-time updates
              broadcast({ type: 'newMessage', data: data.data });
            }
            break;
            
          case 'getConversation':
            if (data.userId && data.otherUserId) {
              const conversation = await storage.getConversation(data.userId, data.otherUserId);
              sendToClient(ws, { type: 'conversation', data: conversation });
            }
            break;
            
          case 'ping':
            // Reply with pong to keep the connection alive
            sendToClient(ws, { type: 'pong', timestamp: Date.now() });
            break;
            
          default:
            sendToClient(ws, { type: 'error', message: 'Unknown message type' });
        }
      } catch (err) {
        console.error('Error handling WebSocket message:', err);
        sendToClient(ws, { type: 'error', message: 'Failed to process message' });
      }
    });
    
    ws.on('close', () => {
      clients.delete(clientId);
      console.log(`WebSocket client disconnected: ${clientId}`);
    });
  });
  
  // Helper function to send data to a client
  function sendToClient(client, data) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  }
  
  // Helper function to broadcast to all clients
  function broadcast(data) {
    clients.forEach((client) => {
      sendToClient(client, data);
    });
  }
  
  // Update all clients when data changes
  const originalCreateOrder = storage.createOrder;
  storage.createOrder = async function(orderData) {
    const order = await originalCreateOrder.call(storage, orderData);
    broadcast({ type: 'orderCreated', data: order });
    return order;
  };
  
  const originalCreateMessage = storage.createMessage;
  storage.createMessage = async function(messageData) {
    const message = await originalCreateMessage.call(storage, messageData);
    broadcast({ type: 'messageCreated', data: message });
    return message;
  };
  
  const originalCreateProduct = storage.createProduct;
  storage.createProduct = async function(productData) {
    const product = await originalCreateProduct.call(storage, productData);
    broadcast({ type: 'productCreated', data: product });
    return product;
  };

  return httpServer;
}
