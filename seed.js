import { storage } from "./server/storage.ts";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64));
  return `${buf.toString("hex")}.${salt}`;
}

// Seed initial data into the database
async function seedDatabase() {
  try {
    console.log("Seeding database...");

    // Create admin user
    await storage.createUser({
      username: "admin",
      password: await hashPassword("admin123"), 
      name: "Administrator",
      email: "admin@ticktee.com",
      points: 10000,
      isAdmin: true
    });
    console.log("Admin user created");

    // Create regular user
    await storage.createUser({
      username: "user",
      password: await hashPassword("user123"), 
      name: "Regular User",
      email: "user@example.com",
      points: 5000,
      isAdmin: false
    });
    console.log("Regular user created");

    // Create TEDx event tickets
    const tedxTicket = {
      name: "TEDx Youth Red Sea STEM Ticket",
      description: "Join us for an inspiring day of talks, workshops, and networking at TEDx Youth Red Sea STEM. Experience innovative ideas and breakthrough technologies.",
      imageUrl: "https://i.imgur.com/CiKvA72.jpg",
      category: "Event",
      price: 1500,
      stock: 150,
      unlimited: false,
      type: "ticket",
      eventDate: new Date("2025-08-15T09:00:00"),
      eventLocation: "Red Sea STEM School, Cairo"
    };
    await storage.createProduct(tedxTicket);
    console.log("TEDx ticket created");

    // Create TEDx t-shirts
    const tedxShirt = {
      name: "TEDx Youth Red Sea STEM T-Shirt",
      description: "Official TEDx Youth Red Sea STEM t-shirt. Made from 100% high-quality cotton with the event logo printed on the front.",
      imageUrl: "https://i.imgur.com/8Nx43Pn.jpg",
      category: "Merchandise",
      price: 800,
      stock: 100,
      unlimited: false,
      type: "tshirt",
      sizes: "S,M,L,XL"
    };
    await storage.createProduct(tedxShirt);
    console.log("TEDx t-shirt created");

    const tedxRedShirt = {
      name: "TEDx Youth Limited Edition Red T-Shirt",
      description: "Limited edition red TEDx t-shirt with special design only available for event attendees.",
      imageUrl: "https://i.imgur.com/6a6ZRXP.jpg",
      category: "Limited Edition",
      price: 1200,
      stock: 50,
      unlimited: false,
      type: "tshirt",
      sizes: "M,L,XL"
    };
    await storage.createProduct(tedxRedShirt);
    console.log("TEDx red t-shirt created");

    // Create workshop tickets
    const workshopTicket = {
      name: "TEDx Innovation Workshop",
      description: "A hands-on workshop focused on developing creative problem-solving skills. Limited spots available.",
      imageUrl: "https://i.imgur.com/u4aVQm3.jpg",
      category: "Workshop",
      price: 750,
      stock: 30,
      unlimited: false,
      type: "ticket",
      eventDate: new Date("2025-08-16T13:00:00"),
      eventLocation: "Innovation Lab, Red Sea STEM School"
    };
    await storage.createProduct(workshopTicket);
    console.log("Workshop ticket created");
    
    // Create VIP ticket
    const vipTicket = {
      name: "TEDx Youth Red Sea STEM VIP Ticket",
      description: "VIP access to all TEDx Youth Red Sea STEM event activities, including exclusive networking sessions with speakers, premium seating, and a special gift bag.",
      imageUrl: "https://i.imgur.com/FXRzQYG.jpg",
      category: "VIP",
      price: 3000,
      stock: 20,
      unlimited: false,
      type: "ticket",
      eventDate: new Date("2025-08-15T09:00:00"),
      eventLocation: "Red Sea STEM School, Cairo"
    };
    await storage.createProduct(vipTicket);
    console.log("VIP ticket created");

    // Create music event ticket
    const musicTicket = {
      name: "حفل الفنان محمد حماقي",
      description: "استمتع بأمسية رائعة مع الفنان محمد حماقي في حفل غنائي يقدم فيه أحدث أغانيه وأشهر أعماله الفنية.",
      imageUrl: "https://i.imgur.com/K3dzE98.jpg",
      category: "حفل موسيقي",
      price: 1500,
      stock: 50,
      unlimited: false,
      type: "ticket",
      eventDate: new Date("2025-09-25T20:00:00"),
      eventLocation: "قاعة المؤتمرات الكبرى - القاهرة"
    };
    await storage.createProduct(musicTicket);
    console.log("Music event ticket created");

    // Create black t-shirt
    const blackShirt = {
      name: "TEDx Classic Black T-Shirt",
      description: "Classic black TEDx t-shirt with minimalist design suitable for all occasions.",
      imageUrl: "https://i.imgur.com/1QYt70s.jpg",
      category: "Casual",
      price: 600,
      stock: 80,
      unlimited: true,
      type: "tshirt",
      sizes: "XS,S,M,L,XL,XXL"
    };
    await storage.createProduct(blackShirt);
    console.log("Black t-shirt created");

    console.log("Database seeding complete!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

// Run the seed function
seedDatabase();