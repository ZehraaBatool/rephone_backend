// Desc: Middleware to protect routes
import jwt from 'jsonwebtoken';
import pool from "../db/connectDB.js";

const protect = async (req, res, next) => {
    try {
        const token = req.cookies.jwt;

        const client = await pool.connect();
    
        if (!token) {
          return res.status(401).json({ message: "Unauthorized: No token provided" });
        }
    
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
        const user = await client.query(
            `SELECT u.userid, u.name, u.email, s."userName",s.sellerid, s."sellerType", s."profilePic" 
             FROM "User" u 
             LEFT JOIN "Seller" s ON u.userid = s.userid
             WHERE u.userId = $1`,
            [decoded.userId]
        );

        if (user.rows.length === 0) {
            return res.status(401).json({ message: "Unauthorized: User not found" });
        }
        
        const userInfo = user.rows[0];
    
        if (!user) {
          return res.status(401).json({ message: "Unauthorized: User not found" });
        }
        await client.release();
    
        req.user = userInfo;
        next();
      } catch (err) {
        console.log("Error in protectRoute:", err.message);
        res.status(500).json({ message: err.message });
      }
};

const protectAdmin = async (req, res, next) => {
    try {
        const token = req.cookies.jwt;
        const client = await pool.connect();
    
        if (!token) {
          return res.status(401).json({ message: "Unauthorized: No token provided" });
        }
    
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
        const admin = await client.query(
            `SELECT * FROM "Admin" WHERE "adminId" = $1`,
            [decoded.userId]
        );
    
        if (admin.rows.length === 0) {
            return res.status(401).json({ message: "Unauthorized: Admin not found" });
        }
        
        const adminInfo = admin.rows[0];
    
        if (!admin) {
          return res.status(401).json({ message: "Unauthorized: Admin not found" });
        }
        await client.release();
    
        req.admin = adminInfo;
        next();
      } catch (err) {
        console.log("Error in protectRoute:", err.message);
        res.status(500).json({ message: err.message });
      }
}


export { protect , protectAdmin};