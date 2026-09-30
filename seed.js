import "dotenv/config";
import mongoose from "mongoose";
import Product from "./models/Product.js";
import User from "./models/User.js";

const img = (seed) => `https://picsum.photos/seed/${seed}/400/300`;

const products = [
  { name: "Classic Watch", price: 120, category: "accessories", stock: 15, image: img("watch"), description: "Minimal steel watch." },
  { name: "Leather Wallet", price: 45, category: "accessories", stock: 30, image: img("wallet"), description: "Slim genuine leather wallet." },
  { name: "Running Shoes", price: 85, category: "shoes", stock: 20, image: img("shoes"), description: "Lightweight everyday runners." },
  { name: "Backpack", price: 60, category: "bags", stock: 25, image: img("backpack"), description: "Water-resistant 20L backpack." },
  { name: "Sunglasses", price: 35, category: "accessories", stock: 40, image: img("sunglasses"), description: "UV400 protection." },
  { name: "Hoodie", price: 55, category: "clothing", stock: 18, image: img("hoodie"), description: "Soft fleece hoodie." },
];

await mongoose.connect(process.env.MONGO_URI);
await Product.deleteMany();
await Product.insertMany(products);

if (!(await User.findOne({ email: "admin@shop.com" }))) {
  await User.create({ name: "Admin", email: "admin@shop.com", password: "admin123", isAdmin: true });
}

console.log("Seeded: 6 products + admin (admin@shop.com / admin123)");
process.exit(0);
