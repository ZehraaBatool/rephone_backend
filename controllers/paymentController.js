import pool from "../db/connectDB.js";
import crypto from 'crypto';
import querystring from 'querystring';
import safepay from '@sfpy/node-core';
import axios from 'axios';


const safepayClient = safepay(process.env.SAFEPAY_SECRET_KEY, {
    authType: 'secret',
    host: 'https://sandbox.api.getsafepay.com' 
});

// Safepay payment initiation
const initiatePayment = async (req, res) => {
    const { orderId } = req.params;

    try {
        const orderResult = await pool.query(
            'SELECT * FROM "Order" WHERE "orderId" = $1',
            [orderId]
        );
        const order = orderResult.rows[0];
        if (!order) {
            return res.status(404).json({ error: "Order not found" });
        }

        // 1. Setup Safepay Session
        const sessionResult = await safepayClient.payments.session.setup({
            merchant_api_key: process.env.SAFEPAY_API_KEY,
            intent: "CYBERSOURCE",
            mode: "payment",
            amount: Math.round(order.totalPrice * 100), // amount in paisa
            currency: "PKR",
            metadata: { 
                "order_id": orderId, 
                "source" : "rephone"
             } // Pass orderId as metadata
        });

        const tracker = sessionResult.data.tracker.token;

        // 2. Auth token
        const response = await safepayClient.client.passport.create();
        const passport = response.data
        // console.log("Passport response:", passport);

        // 3. Build checkout URL 
        // ********************************* FRONTEND: Add the order confirmation and cancellation page url here ********************************
        const checkoutURL = `https://sandbox.api.getsafepay.com/embedded/?env=sandbox&tracker=${tracker}&tbt=${passport}&environment=sandbox&source=mywebsite.com&orderId=${orderId}&cancelUrl=${encodeURIComponent(`${process.env.FRONTEND_URL}/payment-cancel/${orderId}`)}&redirectUrl=${encodeURIComponent(`${process.env.FRONTEND_URL}`)}&webhooks=true`;

        // 4. Send URL back to frontend
        return res.status(200).json({ redirectUrl: checkoutURL });

    } catch (error) {
        console.error("Safepay Initiate Payment Error:", error);
        res.status(500).json({ error: "Failed to initiate Safepay payment" });
    }
};

const paymentNotification = async (req, res) => {
    try {
      res.status(200).send('OK');
  
      const data = req.body.data;
      // console.log("Safepay webhook received:", data);
  
      const { state, tracker, metadata } = data;
      const orderId = metadata.order_id; 
  
      if (state === "TRACKER_ENDED" || state === "TRACKER_AUTHORIZED") { // Safepay state when payment completes
        const client = await pool.connect();
            try {
                await client.query('BEGIN');

                await client.query(
                    `UPDATE "Payment" SET "paymentStatus" = 'Paid', "transactionId" = $1 WHERE "paymentId" = (
              SELECT "paymentId" FROM "Order" WHERE "orderId" = $2
            )`,
                    [tracker, orderId]
                );

                await client.query(
                    `UPDATE "Order" SET "orderStatus" = 'in_progress' WHERE "orderId" = $1`,
                    [orderId]
                );

                // After marking payment and order as Paid
                const soldProductsResult = await client.query(
                    `SELECT oi."productId"
     FROM "OrderItem" oi
     INNER JOIN "SubOrder" so ON oi."subOrderId" = so."subOrderId"
     INNER JOIN "Order" o ON so."orderId" = o."orderId"
     WHERE o."orderId" = $1`,
                    [orderId]
                );

                const soldProductIds = soldProductsResult.rows.map(p => p.productId);

                // Mark all sold products as "sold"
                await client.query(
                    `UPDATE "ListedProduct" SET "isSold" = true WHERE "productid" = ANY($1::uuid[])`,
                    [soldProductIds]
                );

                const sellerEmailsResult = await client.query(
                    `SELECT DISTINCT u.email
                     FROM "ListedProduct" lp
                     INNER JOIN "Seller" s ON lp."sellerId" = s."sellerid"
                     INNER JOIN "User" u ON s."userid" = u."userid"
                     WHERE lp."productid" = ANY($1::uuid[])`,
                    [soldProductIds]
                );


                // send emails or notifications to these sellers
                for (let i = 0; i < sellerEmailsResult.rows.length; i++) {
                    const email = sellerEmailsResult.rows[i].email;
                    const productId = soldProductIds[i];

                    console.log(`Notify seller ${email}: Your product with Product ID ${productId} has been sold.`);
                }

                await client.query('COMMIT');
                console.log(`Payment for Order ${orderId} is successful.`);
            } catch (error) {
                await client.query('ROLLBACK');
                console.error("Error during payment processing:", error);
            } finally {
                client.release();
            }
      } else {
        console.warn(`Payment not completed. Current state: ${state}`);
      }
  
    } catch (error) {
      console.error("Error in payment notification:", error);
    }
  };
  
//   get payment status
const getPaymentStatus = async (req, res) => {
    const { orderId } = req.params;

    try {
        const orderResult = await pool.query(
            'SELECT * FROM "Order" WHERE "orderId" = $1',
            [orderId]
        );
        const order = orderResult.rows[0];
        if (!order) {
            return res.status(404).json({ error: "Order not found" });
        }

        // 1. Get payment status
        const paymentResult = await pool.query(
            'SELECT * FROM "Payment" WHERE "paymentId" = $1',
            [order.paymentId]
        );
        const payment = paymentResult.rows[0];

        if (!payment) {
            return res.status(404).json({ error: "Payment not found" });
        }

        res.status(200).json({ status: payment.paymentStatus });

    } catch (error) {
        console.error("Error getting payment status:", error);
        res.status(500).json({ error: "Failed to get payment status" });
    }
}
  

// payfast payment initiation
// const initiatePayment = async (req, res) => {
//     const { orderId } = req.params;

//     try {
//         const orderResult = await pool.query(
//             'SELECT * FROM "Order" WHERE "orderId" = $1',
//             [orderId]
//         );
//         const order = orderResult.rows[0];
//         if (!order) {
//             return res.status(404).json({ error: "Order not found" });
//         }

//         const merchant_id = process.env.PAYFAST_MERCHANT_ID;
//         const merchant_key = process.env.PAYFAST_MERCHANT_KEY;
//         const payfast_url = process.env.PAYFAST_SANDBOX_URL;
//         const passphrase = process.env.PAYFAST_PASSPHRASE;

//         const returnUrl = `${process.env.FRONTEND_URL}/payment-success/${orderId}`;
//         const cancelUrl = `${process.env.FRONTEND_URL}/payment-cancel/${orderId}`;
//         const notifyUrl = `${process.env.BACKEND_URL}/api/payment/notify`;

//         // Build ONLY the fields PayFast requires (no merchant_key here)
//         const paymentData = {
//             merchant_id,
//             merchant_key,
//             return_url: returnUrl,
//             cancel_url: cancelUrl,
//             notify_url: notifyUrl,
//             m_payment_id: orderId,
//             amount: order.totalPrice.toFixed(2),
//             item_name: "RePhone Order"
//         };

//         // **Manual Field Ordering (PayFast Required Order)**
//         const orderedFields = [
//             'merchant_id',
//             'merchant_key',
//             'return_url',
//             'cancel_url',
//             'notify_url',
//             'm_payment_id',
//             'amount',
//             'item_name'
//         ];

//         // Build signature string based on this exact order
//         let signatureString = orderedFields.map(key => {
//             const value = paymentData[key];
//             const encodedValue = encodeURIComponent(value).replace(/%20/g, '+');
//             return `${key}=${encodedValue}`;
//         }).join('&');

//         // Add passphrase if it exists
//         if (passphrase) {
//             signatureString += `&passphrase=${encodeURIComponent(passphrase).replace(/%20/g, '+')}`;
//         }

//         // console.log("Signature string before hashing:", signatureString);

//         // Create MD5 hash
//         const signature = crypto.createHash('md5').update(signatureString).digest('hex');
//         // console.log("Generated signature:", signature);

//         // Build final Payment Data (add merchant_key now manually for sandbox)
//         const finalPaymentData = {
//             ...paymentData,
//             signature
//         };

//         // Build final redirect URL
//         const redirectUrl = `${payfast_url}?${querystring.stringify(finalPaymentData)}`;

//         res.status(200).json({ redirectUrl });

//     } catch (error) {
//         console.error("Payment Initiation Error:", error);
//         res.status(500).json({ error: "Failed to initiate payment" });
//     }
// };

// const paymentNotification = async (req, res) => {
//     try {
//         res.status(200).send('OK'); // immediately respond 200 OK

//         const {
//             payment_status,
//             m_payment_id,
//             pf_payment_id
//         } = req.body;

//         // console.log("Received PayFast Notification:", req.body);

//         if (payment_status === 'COMPLETE') {
//             const client = await pool.connect();
//             try {
//                 await client.query('BEGIN');

//                 await client.query(
//                     `UPDATE "Payment" SET "paymentStatus" = 'Paid', "transactionId" = $1 WHERE "paymentId" = (
//               SELECT "paymentId" FROM "Order" WHERE "orderId" = $2
//             )`,
//                     [pf_payment_id, m_payment_id]
//                 );

//                 await client.query(
//                     `UPDATE "Order" SET "orderStatus" = 'in_progress' WHERE "orderId" = $1`,
//                     [m_payment_id]
//                 );

//                 // After marking payment and order as Paid
//                 const soldProductsResult = await client.query(
//                     `SELECT oi."productId"
//      FROM "OrderItem" oi
//      INNER JOIN "SubOrder" so ON oi."subOrderId" = so."subOrderId"
//      INNER JOIN "Order" o ON so."orderId" = o."orderId"
//      WHERE o."orderId" = $1`,
//                     [m_payment_id]
//                 );

//                 const soldProductIds = soldProductsResult.rows.map(p => p.productId);

//                 // Mark all sold products as "sold"
//                 await client.query(
//                     `UPDATE "ListedProduct" SET "isSold" = true WHERE "productid" = ANY($1::uuid[])`,
//                     [soldProductIds]
//                 );

//                 const sellerEmailsResult = await client.query(
//                     `SELECT DISTINCT u.email
//                      FROM "ListedProduct" lp
//                      INNER JOIN "Seller" s ON lp."sellerId" = s."sellerid"
//                      INNER JOIN "User" u ON s."userid" = u."userid"
//                      WHERE lp."productid" = ANY($1::uuid[])`,
//                     [soldProductIds]
//                 );


//                 // send emails or notifications to these sellers
//                 for (let i = 0; i < sellerEmailsResult.rows.length; i++) {
//                     const email = sellerEmailsResult.rows[i].email;
//                     const productId = soldProductIds[i];

//                     console.log(`Notify seller ${email}: Your product with Product ID ${productId} has been sold.`);
//                 }

//                 await client.query('COMMIT');
//                 console.log(`Payment for Order ${m_payment_id} is successful.`);
//             } catch (error) {
//                 await client.query('ROLLBACK');
//                 console.error("Error during payment processing:", error);
//             } finally {
//                 client.release();
//             }
//         } else {
//             console.warn(`Payment not complete for Order ${m_payment_id}. Status: ${payment_status}`);
//         }
//     } catch (error) {
//         console.error("Error in payment notification:", error);
//     }
// };





export { initiatePayment, paymentNotification, getPaymentStatus };