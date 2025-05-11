import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import sellerRoutes from './routes/sellerRoutes.js';
import productRoutes from './routes/productRoutes.js';
import buyerRoutes from './routes/buyerRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';


dotenv.config();

const PORT = process.env.PORT || 5000;

const app = express();

app.use(cors({
    origin: ['https://rephone-client.vercel.app','https://rephone-admin.vercel.app'],
    credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Routes
app.use("/api/seller", sellerRoutes)
app.use("/api/buyer", buyerRoutes)
app.use("/api/product", productRoutes)
app.use("/api/admin", adminRoutes)
app.use("/api/order", orderRoutes)
app.use("/api/payment", paymentRoutes)


app.listen(PORT, () => {console.log(`Server is running on port ${PORT}`)});
export default app;