import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/Product.js';
import Order from './models/Order.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/petcare';

async function diagnose() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get all products with provider info
    const products = await Product.find({}).select('name provider createdAt').lean();
    console.log(`📦 Total products: ${products.length}`);
    
    if (products.length > 0) {
      console.log('\n📋 Products with their providers:');
      for (const p of products) {
        console.log(`  - ${p.name} | Provider: ${p.provider}`);
      }
    }

    // Get all orders
    const orders = await Order.find({}).select('user products totalAmount status createdAt').lean();
    console.log(`\n🛒 Total orders: ${orders.length}`);
    
    if (orders.length > 0) {
      console.log('\n📋 Orders breakdown:');
      for (const order of orders) {
        console.log(`  - Order #${order._id.toString().slice(-6)} | Items: ${order.products.length} | Amount: ₹${order.totalAmount} | Status: ${order.status}`);
        console.log(`    Products: ${order.products.map(p => p.product?.toString().slice(-6)).join(', ')}`);
      }
    } else {
      console.log('\n⚠️  NO ORDERS FOUND in database!');
      console.log('👉 Have you placed an order from the main website?');
    }

    // Check if any products match orders
    if (products.length > 0 && orders.length > 0) {
      const productIds = products.map(p => p._id.toString());
      const orderProductIds = orders.flatMap(o => o.products.map(p => p.product?.toString()));
      
      const matchingIds = productIds.filter(id => orderProductIds.includes(id));
      
      if (matchingIds.length > 0) {
        console.log(`\n✅ Found ${matchingIds.length} products that have been ordered`);
      } else {
        console.log('\n❌ No orders contain any of the existing products');
        console.log('👉 The products in orders don\'t match any products created by providers');
      }
    }

    mongoose.disconnect();
    console.log('\n✅ Done');
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

diagnose();
