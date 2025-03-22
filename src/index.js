import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { fileURLToPath } from "url";
import path, { dirname } from "path";
import "dotenv/config";

import authRoutes from "./routes/auth.router.js";
import userRoutes from "./routes/user.router.js";
import orderRoutes from "./routes/order.router.js";
import transactionRoutes from "./routes/transaction.router.js";
import referralHistoryRoutes from "./routes/referralHistory.router.js";
import documentRoutes from "./routes/document.router.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8000;

app.use(morgan("dev"));
app.use(cors());
app.use(helmet());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Documents Management System");
});

console.log("router", express.static(path.join(__dirname, "uploads")));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/v1", authRoutes);
app.use("/api/v1", userRoutes);
app.use("/api/v1", orderRoutes);
app.use("/api/v1", transactionRoutes);
app.use("/api/v1", referralHistoryRoutes);
app.use("/api/v1", documentRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
