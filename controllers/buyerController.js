import pool from "../db/connectDB.js";

// get all buyers (users that are not sellers)
const getAllBuyers = async (req, res) => {
    const client = await pool.connect();
    try {
        const buyers = await client.query(`SELECT * FROM "User" WHERE userid NOT IN (SELECT userid FROM "Seller")`);

        if (buyers.rows.length === 0) {
            return res.status(404).json({ error: "No buyers found" });
        }

        res.status(200).json(buyers.rows);
    } catch (error) {
        console.error("Error while fetching all buyers:", error);
        res.status(500).json({ error: "An error occurred while fetching all buyers" });
    } finally {
        client.release();
    }
}

// insert a new buyer
const addBuyer = async (req, res) => {
    const { name, email, phoneNumber, city, area, street, houseNumber, nearestLandmark } = req.body;

    const client = await pool.connect();
    try {

        // Check if the user already exists
        const existingUser = await client.query(`SELECT * FROM "User" WHERE email = $1`, [email]);
        if (existingUser.rows.length > 0) {
           return res.status(400).json({ error: "User already exists" }); 
        }

        const result = await client.query(`INSERT INTO "User" (name, email, "phoneNumber", city, area, street, "houseNumber", "nearestLandmark") 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`, 
            [name, email, phoneNumber, city, area, street, houseNumber, nearestLandmark]);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error("Error while inserting buyer:", error);
        res.status(500).json({ error: "An error occurred while inserting the buyer" });
    } finally {
        client.release();
    }
}
export { getAllBuyers , addBuyer};