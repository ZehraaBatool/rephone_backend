import pool from "../db/connectDB.js";
import { validationResult } from "express-validator";
import bcrypt from 'bcrypt';
import generateTokenAndSetCookie from "../utils/generateTokenAndSetCookie.js";

// register seller
const registerSeller = async (req, res) => {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, phoneNumber, city, area, street, houseNumber, nearestLandmark, email, password, sellerType } = req.body;
    const profilePicture = req.file ? req.file.path : null;

    const client = await pool.connect();
    try {
        await client.query("BEGIN"); // Start transaction

        // Check if email already exists
        const existingUser = await client.query('SELECT * FROM "User" WHERE email = $1', [email]);
        if (existingUser.rows.length > 0) {
            return res.status(400).json({ error: "Email already registered" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert into user table
        const userResult = await client.query(
            `INSERT INTO "User" (name, "phoneNumber", city, area, street, "houseNumber", "nearestLandmark", email) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
             RETURNING userId`,
            [name, phoneNumber, city , area || null, street || null, houseNumber || null, nearestLandmark || null, email]
        );

        const userId = userResult.rows[0].userid;

        // Insert into seller table
        const sellerResult = await client.query(
            `INSERT INTO "Seller" ("userName", password, userid, "sellerType", "profilePic") 
             VALUES ($1, $2, $3, $4, $5) RETURNING sellerId`,
            [name, hashedPassword, userId, sellerType, profilePicture]
        );

        const sellerId = sellerResult.rows[0].sellerid;

        await client.query("COMMIT"); // Commit transaction

        // Generate token & set cookie
        // generateTokenAndSetCookie(userId, res);

        res.status(201).json({ message: "Seller registered successfully!", sellerId });
    } catch (error) {
        await client.query("ROLLBACK"); // Rollback on error
        console.error("Error during seller registration:", error);
        res.status(500).json({ error: "Registration failed. Please try again." });
    } finally {
        client.release();
    }
};

// login seller
const loginSeller = async (req, res) => {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    const client = await pool.connect();
    try {
        // Check if email exists
        const user = await client.query('SELECT * FROM "User" WHERE email = $1', [email]);
        if (user.rows.length === 0) {
            return res.status(400).json({ error: "Invalid email address." });
        }

        // Check if password is correct
        const seller = await client.query('SELECT * FROM "Seller" WHERE userid = $1', [user.rows[0].userid]);
        if (seller.rows.length === 0) {
            return res.status(400).json({ error: "Invalid credentials" });
        }

        const isPasswordValid = await bcrypt.compare(password, seller.rows[0].password);
        if (!isPasswordValid) {
            return res.status(400).json({ error: "Invalid Password!" });
        }

        // Generate token & set cookie
        generateTokenAndSetCookie(user.rows[0].userid, res);

        res.status(200).json({ message: "Login successful!" ,
            userId: user.rows[0].userid,
            sellerId: seller.rows[0].sellerid,      
        });
    } catch (error) {
        console.error("Error during seller login:", error);
        res.status(500).json({ error: "Login failed. Please try again." });
    } finally {
        client.release();
    }
};

// get seller profile
const getSellerProfile = async (req, res) => {
    const { query } = req.params;
    const client = await pool.connect();
    try {
        const seller = await client.query(
            `SELECT u.name, u."phoneNumber", u.city, u.area, u.street, u."houseNumber", u."nearestLandmark", u.email, s."sellerType", s."profilePic"
             FROM "User" u JOIN "Seller" s ON u.userid = s.userid 
             WHERE u.userid = $1`,
            [query]
        );

        if (seller.rows.length === 0) {
            return res.status(404).json({ error: "Seller not found" });
        }


        res.status(200).json(seller.rows[0]);
    } catch (error) {
        console.error("Error while fetching seller profile:", error);
        res.status(500).json({ error: "An error occurred while fetching seller profile" });
    } finally {
        client.release();
    }
};

// update seller profile
const updateSellerProfile = async (req, res) => {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { query } = req.params;
    const {
        name, phoneNumber, city, area,
        street, houseNumber, nearestLandmark,
        email, sellerType
    } = req.body;

    const profilePicture = req.file ? req.file.path : null;

    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        // Update "User" table
        const userFieldsToUpdate = [];
        const userValues = [];
        let userIndex = 1;

        if (name) {
            userFieldsToUpdate.push(`name = $${userIndex++}`);
            userValues.push(name);
        }
        if (phoneNumber) {
            userFieldsToUpdate.push(`"phoneNumber" = $${userIndex++}`);
            userValues.push(phoneNumber);
        }
        if (city) {
            userFieldsToUpdate.push(`city = $${userIndex++}`);
            userValues.push(city);
        }
        if (area) {
            userFieldsToUpdate.push(`area = $${userIndex++}`);
            userValues.push(area);
        }
        if (street) {
            userFieldsToUpdate.push(`street = $${userIndex++}`);
            userValues.push(street);
        }
        if (houseNumber) {
            userFieldsToUpdate.push(`"houseNumber" = $${userIndex++}`);
            userValues.push(houseNumber);
        }
        if (nearestLandmark) {
            userFieldsToUpdate.push(`"nearestLandmark" = $${userIndex++}`);
            userValues.push(nearestLandmark);
        }
        if (email) {
            userFieldsToUpdate.push(`email = $${userIndex++}`);
            userValues.push(email);
        }

        if (userFieldsToUpdate.length > 0) {
            userValues.push(query);
            const userUpdateQuery = `UPDATE "User" SET ${userFieldsToUpdate.join(", ")} WHERE userid = $${userIndex}`;
            await client.query(userUpdateQuery, userValues);
        }

        // Update "Seller" table
        const sellerFieldsToUpdate = [];
        const sellerValues = [];
        let sellerIndex = 1;

        if (sellerType) {
            sellerFieldsToUpdate.push(`"sellerType" = $${sellerIndex++}`);
            sellerValues.push(sellerType);
        }

        if (profilePicture) {
            sellerFieldsToUpdate.push(`"profilePic" = $${sellerIndex++}`);
            sellerValues.push(profilePicture);
        }

        if (sellerFieldsToUpdate.length > 0) {
            sellerValues.push(query);
            const sellerUpdateQuery = `UPDATE "Seller" SET ${sellerFieldsToUpdate.join(", ")} WHERE userid = $${sellerIndex}`;
            
            await client.query(sellerUpdateQuery, sellerValues);
        }

        await client.query("COMMIT");

        res.status(200).json({ message: "Seller profile updated successfully!" });
    } catch (error) {
        await client.query("ROLLBACK");
        console.error("Error during seller profile update:", error);
        res.status(500).json({ error: "Profile update failed. Please try again." });
    } finally {
        client.release();
    }
};


// delete seller profile
const deleteSellerProfile = async (req, res) => {
    const { query } = req.params;
    const client = await pool.connect();
    try {
        await client.query("BEGIN"); // Start transaction

        // Delete from seller table
        await client.query(`DELETE FROM "Seller" WHERE userid = $1`, [query]);

        // Delete from user table
        await client.query(`DELETE FROM "User" WHERE userid = $1`, [query]);

        await client.query("COMMIT"); // Commit transaction

        res.status(200).json({ message: "Seller profile deleted successfully!" });
    } catch (error) {
        await client.query("ROLLBACK"); // Rollback on error
        console.error("Error during seller profile deletion:", error);
        res.status(500).json({ error: "Profile deletion failed. Please try again." });
    } finally {
        client.release();
    }
}

// get all listed phones of a seller
const getSellerPhones = async (req, res) => {
    const { sellerId } = req.params;
    const client = await pool.connect();
    try {
        const phones = await client.query(
            `SELECT lp.*, 
            p.*
             FROM "ListedProduct" lp
             LEFT JOIN "Phone" p ON lp."phoneId" = p."phoneId"
             WHERE lp."sellerId" = $1`,
            [sellerId]
        );

        if (phones.rows.length === 0) {
            return res.status(404).json({ error: "No phones found for this seller" });
        }

        res.status(200).json(phones.rows);
    } catch (error) {
        console.error("Error while fetching seller phones:", error);
        res.status(500).json({ error: "An error occurred while fetching seller phones" });
    } finally {
        client.release();
    }
}

// get all orders of a seller
const getSellerOrders = async (req, res) => {
    const { sellerId } = req.params;
    const client = await pool.connect();
    try {
        const orders = await client.query(
            `SELECT
  o."orderId",
  o."orderStatus",
  o."orderDate",

  u."name" AS buyerName,
  u."email" AS buyerEmail,
  u."phoneNumber" AS buyerPhoneNumber,
  u."city" AS buyerCity,

  SUM(oi."unitPrice") AS sellerTotalPrice,

  json_agg(
    json_build_object(
      'productId', lp."productid",
      'color', lp."color",
      'status', lp."status",
      'isSold', lp."isSold",
      'phoneImages', lp."phoneImage",
      'imeiNo', lp."imeiNumber",
      'brand', p."phone_brand",        -- Now coming from Phone table
      'model', p."phone_model"         -- Now coming from Phone table
    )
  ) AS soldProducts

FROM "SubOrder" so
INNER JOIN "Order" o ON so."orderId" = o."orderId"
INNER JOIN "User" u ON o."userId" = u."userid"
INNER JOIN "OrderItem" oi ON oi."subOrderId" = so."subOrderId"
INNER JOIN "ListedProduct" lp ON oi."productId" = lp."productid"
INNER JOIN "Phone" p ON lp."phoneId" = p."phoneId"   -- new join with Phone

WHERE so."sellerId" = $1
GROUP BY o."orderId", o."orderStatus", o."orderDate", u."name", u."email", u."phoneNumber", u."city"
ORDER BY o."orderDate" DESC;
`,
            [sellerId]
        );

        if (orders.rows.length === 0) {
            return res.status(404).json({ error: "No orders found for this seller" });
        }

        res.status(200).json(orders.rows);
    } catch (error) {
        console.error("Error while fetching seller orders:", error);
        res.status(500).json({ error: "An error occurred while fetching seller orders" });
    } finally {
        client.release();
    }
}
// Get seller metrics
const getSellerMetrics = async (req, res) => {
    const { sellerId } = req.params;
    const client = await pool.connect();
    try {
        // Total listings
        const listingsQuery = await client.query(
            `SELECT COUNT(*) as total_listings 
             FROM "ListedProduct" 
             WHERE "sellerId" = $1`,
            [sellerId]
        );
        
        // Pending orders
        const pendingOrdersQuery = await client.query(
            `SELECT COUNT(DISTINCT so."subOrderId") as pending_orders
             FROM "SubOrder" so
             JOIN "Order" o ON so."orderId" = o."orderId"
             WHERE so."sellerId" = $1 AND o."orderStatus" = 'pending'`,
            [sellerId]
        );
        
        // Completed orders
        const completedOrdersQuery = await client.query(
            `SELECT COUNT(DISTINCT so."subOrderId") as completed_orders
             FROM "SubOrder" so
             JOIN "Order" o ON so."orderId" = o."orderId"
             WHERE so."sellerId" = $1 AND o."orderStatus" = 'completed'`,
            [sellerId]
        );
        
        // Total earnings
        const earningsQuery = await client.query(
            `SELECT COALESCE(SUM(oi."unitPrice"), 0) as total_earnings
             FROM "OrderItem" oi
             JOIN "SubOrder" so ON oi."subOrderId" = so."subOrderId"
             JOIN "Order" o ON so."orderId" = o."orderId"
             WHERE so."sellerId" = $1 AND o."orderStatus" = 'completed'`,
            [sellerId]
        );
        
        // Sales data for chart (last 30 days)
        const salesDataQuery = await client.query(
            `SELECT 
                DATE_TRUNC('day', o."orderDate") as day,
                COUNT(DISTINCT so."subOrderId") as order_count,
                SUM(oi."unitPrice") as daily_earnings
             FROM "Order" o
             JOIN "SubOrder" so ON o."orderId" = so."orderId"
             JOIN "OrderItem" oi ON so."subOrderId" = oi."subOrderId"
             WHERE so."sellerId" = $1 
                AND o."orderStatus" = 'completed'
                AND o."orderDate" >= NOW() - INTERVAL '30 days'
             GROUP BY day
             ORDER BY day ASC`,
            [sellerId]
        );

        res.status(200).json({
            totalListings: listingsQuery.rows[0].total_listings,
            pendingOrders: pendingOrdersQuery.rows[0].pending_orders,
            completedOrders: completedOrdersQuery.rows[0].completed_orders,
            totalEarnings: earningsQuery.rows[0].total_earnings,
            salesData: salesDataQuery.rows
        });
    } catch (error) {
        console.error("Error fetching seller metrics:", error);
        res.status(500).json({ error: "An error occurred while fetching seller metrics" });
    } finally {
        client.release();
    }
};

// Get listing status counts
const getListingStatusCounts = async (req, res) => {
    const { sellerId } = req.params;
    const client = await pool.connect();
    try {
        const result = await client.query(
            `SELECT 
                status,
                COUNT(*) as count
             FROM "ListedProduct"
             WHERE "sellerId" = $1
             GROUP BY status`,
            [sellerId]
        );
        
        res.status(200).json(result.rows);
    } catch (error) {
        console.error("Error fetching listing status counts:", error);
        res.status(500).json({ error: "An error occurred while fetching listing status counts" });
    } finally {
        client.release();
    }
};

export { 
    registerSeller, 
    loginSeller, 
    getSellerProfile , 
    updateSellerProfile, 
    deleteSellerProfile, 
    getSellerPhones,
    getSellerOrders,
    getSellerMetrics,
    getListingStatusCounts
};