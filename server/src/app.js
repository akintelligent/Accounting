import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";

const app = express();

app.use(cors({
  origin: "http://localhost:5173", // frontend URL
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/dashboard", dashboardRoutes);


app.get("/", (req, res) => {
  res.send("✅ Accounting Backend Running...");
});

export default app;
