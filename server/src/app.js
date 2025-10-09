import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import employeeRoutes from "./routes/employee.routes.js";
import coaRoutes from "./routes/coa.routes.js";
import journalRoutes from "./routes/journal.routes.js";
import ledgerRoutes from "./routes/ledger.routes.js";
import trialBalanceRoutes from "./routes/trialBalance.routes.js";
import incomeStatementRoutes from "./routes/incomeStatement.routes.js";
import balanceSheetRoutes from "./routes/balanceSheet.routes.js";
import cashFlowRoutes from "./routes/cashFlow.routes.js";












const app = express();

app.use(cors());
app.use(cors({
  origin: "http://localhost:5173", // frontend URL
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));
app.use(express.json());

// Static folder serve for uploaded images
app.use("/uploads", express.static("uploads"));


//Commom Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/employees", employeeRoutes);

//Accounts Routes
app.use("/api/accounts", coaRoutes);
app.use("/api/journal", journalRoutes);
app.use("/api/ledger", ledgerRoutes);

//Accounts Reports Routes
app.use("/api/trial-balance", trialBalanceRoutes);
app.use("/api/income-statement", incomeStatementRoutes);
app.use("/api/balance-sheet", balanceSheetRoutes);
app.use("/api/cash-flow", cashFlowRoutes);


app.get("/", (req, res) => {
  res.send("✅ Accounting Backend Running...");
});

export default app;
