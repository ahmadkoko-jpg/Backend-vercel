import Order from "../models/Order.js";
import Product from "../models/Product.js";

// Prices are read from the DB, never trusted from the client.
export const createOrder = async (req, res) => {
  try {
    const { items, address } = req.body; // items: [{ productId, qty }]
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const orderItems = [];
    let total = 0;

    for (const { productId, qty } of items) {
      const product = await Product.findById(productId);
      if (!product) return res.status(404).json({ message: "A product no longer exists" });
      if (!Number.isInteger(qty) || qty < 1) {
        return res.status(400).json({ message: "Invalid quantity" });
      }
      if (product.stock < qty) {
        return res.status(400).json({ message: `Not enough stock for ${product.name}` });
      }
      orderItems.push({ product: product._id, name: product.name, price: product.price, qty });
      total += product.price * qty;
    }

    // reduce stock only after all checks passed
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.qty } });
    }

    const order = await Order.create({ user: req.user._id, items: orderItems, total, address });
    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getMyOrders = async (req, res) => {
  try {
    res.json(await Order.find({ user: req.user._id }).sort({ createdAt: -1 }));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    res.json(await Order.find().populate("user", "name email").sort({ createdAt: -1 }));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true, runValidators: true }
    );
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
