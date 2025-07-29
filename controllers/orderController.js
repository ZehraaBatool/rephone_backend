import pool from "../db/connectDB.js";
import { validationResult } from "express-validator";
import bcrypt from 'bcrypt.js';

// checkout details
const createOrder = async (req, res) => {
  const {
    name, email, phoneNumber,
    city, area, street, houseNumber, nearestLandmark,
    items, paymentMethod
  } = req.body;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Insert User
    const userResult = await client.query(
      `INSERT INTO "User" 
         (name, email, "phoneNumber", city, area, street, "houseNumber", "nearestLandmark") 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
         RETURNING *`,
      [name, email, phoneNumber, city, area, street, houseNumber, nearestLandmark]
    );
    const userId = userResult.rows[0].userid;

    // 2. Fetch Product Data
    const productQuery = await client.query(
      `SELECT "productid", "price", "sellerId" 
         FROM "ListedProduct" 
         WHERE "productid" = ANY($1::uuid[])`,
      [items]
    );
    const products = productQuery.rows;
    if (products.length === 0) throw new Error("No products found");
    console.log("Products:", products);

    // 3. Group by Seller
    const sellerMap = {};
    for (const p of products) {
      if (!sellerMap[p.sellerId]) {
        sellerMap[p.sellerId] = [];
      }
      sellerMap[p.sellerId].push(p);
    }

    // 4. Compute Totals
    const platformFeeRate = 0.013;
    const deliveryFee = 1000; // fixed per entire order
    let baseTotal = 0;
    const saleTax = 0.17;
    for (const p of products) baseTotal += parseFloat(p.price);
    const platformFee = baseTotal * platformFeeRate;
    const tax= baseTotal * saleTax;
    const totalPrice = baseTotal + platformFee + deliveryFee + tax;

    // 5. Create Order
    const orderResult = await client.query(
      `INSERT INTO "Order" 
         ("userId", "baseTotal", "platformFee", "deliveryFee", "totalPrice") 
         VALUES ($1, $2, $3, $4, $5) 
         RETURNING *`,
      [userId, baseTotal, platformFee, deliveryFee, totalPrice]
    );
    const orderId = orderResult.rows[0].orderId;

    // 6. Create SubOrders and OrderItems
    for (const [sellerId, sellerProducts] of Object.entries(sellerMap)) {
      const subOrderResult = await client.query(
        `INSERT INTO "SubOrder" ("orderId", "sellerId") VALUES ($1, $2) RETURNING *`,
        [orderId, sellerId]
      );
      const subOrderId = subOrderResult.rows[0].subOrderId;
      console.log(subOrderId)

      for (const product of sellerProducts) {
        await client.query(
          `INSERT INTO "OrderItem" ("subOrderId", "productId", "unitPrice") 
             VALUES ($1, $2, $3)`,
          [subOrderId, product.productid, product.price]
        );
      }
    }

    // 7. Create Payment Record
    const paymentResult = await client.query(
      `INSERT INTO "Payment" ("orderId", "paymentMethod", "amount") 
         VALUES ($1, $2, $3) RETURNING *`,
      [orderId, paymentMethod, totalPrice]
    );
    const paymentId = paymentResult.rows[0].paymentId;
    console.log("Payment ID:", paymentId);

    // 8. Link Payment to Order
    await client.query(
      `UPDATE "Order" SET "paymentId" = $1 WHERE "orderId" = $2`,
      [paymentId, orderId]
    );

    await client.query('COMMIT');

    res.status(201).json({
      message: "Order created successfully",
      orderId,
      paymentId,
      paymentMethod,
      amount: totalPrice,
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error in createOrder:", error);
    res.status(500).json({ error: "Failed to create order" });
  } finally {
    if (client) client.release();
  }
};

// get an order details by orderId
const getOrderDetails = async (req, res) => {
  let client;
  try {
    const { orderId } = req.params;

    client = await pool.connect();
    const orderResult = await client.query(
      `SELECT * FROM "Order" WHERE "orderId" = $1`,
      [orderId]
    );
    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: "Order not found" });
    }

    const order = orderResult.rows[0];

    const userResult = await client.query(
      `SELECT name, email, "phoneNumber", city, area, street, "houseNumber", "nearestLandmark" 
         FROM "User" WHERE "userid" = $1`,
      [order.userId]
    );
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    order.buyer = userResult.rows[0];
    // Fetch related data (SubOrders, OrderItems, Payments)
    const subOrdersResult = await client.query(
      `SELECT * FROM "SubOrder" WHERE "orderId" = $1`,
      [orderId]
    );

    const subOrders = subOrdersResult.rows;

    for (const subOrder of subOrders) {
      const orderItemsResult = await client.query(
        `SELECT * FROM "OrderItem" WHERE "subOrderId" = $1`,
        [subOrder.subOrderId]
      );
      subOrder.items = orderItemsResult.rows;
    }

    res.status(200).json({ order, subOrders });

  } catch (error) {
    console.error("Error in getOrderDetails:", error);
    res.status(500).json({ error: "Failed to fetch order details" });
  } finally {
    client.release();
  }
};
  


export { createOrder, getOrderDetails }
