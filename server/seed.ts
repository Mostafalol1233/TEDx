import { storage } from "./storage";
import { InsertProduct } from "@shared/schema";

// Seed initial data into the database
async function seedDatabase() {
  try {
    console.log("Seeding database...");

    // Create admin user
    await storage.createUser({
      username: "admin",
      password: "admin123", // This would be hashed in auth.ts
      name: "Administrator",
      email: "admin@redseastem.com",
    });
    console.log("Admin user created");

    // Create TEDx event tickets
    const tedxTicket: InsertProduct = {
      name: "TEDx Youth Red Sea STEM Ticket",
      description: "Join us for an inspiring day of talks, workshops, and networking at TEDx Youth Red Sea STEM. Experience innovative ideas and breakthrough technologies.",
      imageUrl: "https://via.placeholder.com/800x400/FF0000/FFFFFF?text=TEDx+Youth+Red+Sea+STEM+Ticket",
      category: "Event",
      price: 1500,
      stock: 150,
      unlimited: false,
      type: "ticket",
      eventDate: new Date("2023-12-15T09:00:00"),
      eventLocation: "Red Sea STEM School, Cairo"
    };
    await storage.createProduct(tedxTicket);
    console.log("TEDx ticket created");

    // Create TEDx t-shirts
    const tedxShirt: InsertProduct = {
      name: "TEDx Youth Red Sea STEM T-Shirt",
      description: "Official TEDx Youth Red Sea STEM event t-shirt. Made from premium cotton with the event logo.",
      imageUrl: "https://via.placeholder.com/800x400/FF0000/FFFFFF?text=TEDx+Youth+Red+Sea+STEM+T-Shirt",
      category: "Merchandise",
      price: 800,
      stock: 100,
      unlimited: false,
      type: "tshirt",
      sizes: "S,M,L,XL"
    };
    await storage.createProduct(tedxShirt);
    console.log("TEDx t-shirt created");
    
    // Create TEDx classic red t-shirts
    const tedxRedShirt: InsertProduct = {
      name: "TEDx Classic Red T-Shirt",
      description: "Classic TEDx red t-shirt with the iconic TEDx logo. A must-have for TEDx enthusiasts.",
      imageUrl: "https://via.placeholder.com/800x400/FF0000/FFFFFF?text=TEDx+Classic+Red+T-Shirt",
      category: "Classic",
      price: 950,
      stock: 75,
      unlimited: false,
      type: "tshirt",
      sizes: "S,M,L,XL,XXL"
    };
    await storage.createProduct(tedxRedShirt);
    console.log("TEDx red t-shirt created");

    // Create workshop tickets
    const workshopTicket: InsertProduct = {
      name: "TEDx Innovation Workshop",
      description: "A hands-on workshop focused on developing creative problem-solving skills. Limited spots available.",
      imageUrl: "/assets/workshop.jpg",
      category: "Workshop",
      price: 750,
      stock: 30,
      unlimited: false,
      type: "ticket",
      eventDate: new Date("2023-12-16T13:00:00"),
      eventLocation: "Innovation Lab, Red Sea STEM School"
    };
    await storage.createProduct(workshopTicket);
    console.log("Workshop ticket created");
    
    // Create VIP ticket
    const vipTicket: InsertProduct = {
      name: "TEDx Youth Red Sea STEM VIP Ticket",
      description: "VIP access to all TEDx Youth Red Sea STEM event activities, including exclusive networking sessions with speakers, premium seating, and a special gift bag.",
      imageUrl: "/assets/tedx-vip.jpg",
      category: "VIP",
      price: 3000,
      stock: 20,
      unlimited: false,
      type: "ticket",
      eventDate: new Date("2023-12-15T09:00:00"),
      eventLocation: "Red Sea STEM School, Cairo"
    };
    await storage.createProduct(vipTicket);
    console.log("VIP ticket created");

    console.log("Database seeding complete!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

// Run the seed function
seedDatabase();