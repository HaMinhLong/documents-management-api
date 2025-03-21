import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import userRoutes from "./routes/user.router.js";

const app = express();
const PORT = process.env.PORT || 8000;

app.use(morgan("dev"));
app.use(cors());
app.use(helmet());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Documents Management System");
});

app.use("/api/v1", userRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
