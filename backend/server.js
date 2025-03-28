const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const jwt = require("jsonwebtoken");
const session = require("express-session");
const cron = require("node-cron");
const pool = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const profileRoutes = require("./routes/profileRoutes");
const transferRoutes = require("./routes/transferRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const creditCardRoutes = require("./routes/creditCardRoutes");
const adminRoutes = require("./routes/adminRoutes");
const loanRoutes = require("./routes/loanRoutes"); // ✅ Loan Routes

dotenv.config();
const app = express();
app.use(express.json());

// ✅ Fix CORS - Allow Frontend Access
const allowedOrigins = [
  "https://bigbank-frontend.redwave-8bcf09a2.eastus.azurecontainerapps.io",
  "http://localhost:3000"
];

app.use(
  cors({
    origin: allowedOrigins,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
    allowedHeaders: "Content-Type,Authorization",
  })
);

// ✅ Session Middleware for Admin
app.use(
  session({
    secret: process.env.SESSION_SECRET || "bigbanksecret",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

// ✅ User ID Middleware for Authentication
app.use((req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET); // ✅ Use environment variable
      req.userId = decoded.id;
      req.userEmail = decoded.email;
      console.log("✅ Extracted User ID:", req.userId);
    } catch (err) {
      console.warn("⚠️ Invalid or expired token.");
    }
  }
  next();
});

// ✅ Serve Static Frontend Files
const frontendPath = path.join(__dirname, "../frontend/public");
app.use(express.static(frontendPath));

// ✅ Serve Main Index Page
app.get("/", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

// ✅ Serve Other Static Pages
const pages = [
  "customer.html",
  "adminLogin.html",
  "adminDashboard.html",
  "dashboard.html",
  "profile.html",
  "signup.html",
  "login.html"
];
pages.forEach((page) => {
  app.get(`/${page}`, (req, res) => {
    res.sendFile(path.join(frontendPath, page));
  });
});

// ✅ API Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", profileRoutes);
app.use("/api/transfer", transferRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/credit", creditCardRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/loans", loanRoutes);

// ✅ Health Check Route
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "OK", message: "Backend is running" });
});

// ✅ Connect to PostgreSQL
pool
  .connect()
  .then(() => console.log("✅ Connected to PostgreSQL database"))
  .catch((err) => console.error("❌ Database connection error:", err));

// ✅ Cron Job to Reset Daily Transaction Count at Midnight
cron.schedule("0 0 * * *", async () => {
  console.log("🔄 Resetting daily transaction count...");
  try {
    await pool.query("UPDATE users SET transaction_count = 0");
    console.log("✅ Daily transaction count reset.");
  } catch (error) {
    console.error("❌ Failed to reset transaction count:", error);
  }
});

// ✅ Cron Job for Monthly EMI Deduction
cron.schedule("0 0 1 * *", async () => {
  console.log("💰 Processing Monthly EMI Deduction...");
  try {
    const activeLoans = await pool.query(
      `SELECT * FROM loan_subscriptions WHERE status = 'active'`
    );

    for (const loan of activeLoans.rows) {
      const monthlyEMI = (loan.loan_amount * (1 + loan.interest_rate / 100)) / loan.loan_term;
      const userBalance = await pool.query("SELECT balance FROM users WHERE id = $1", [loan.user_id]);

      if (userBalance.rows[0].balance >= monthlyEMI) {
        await pool.query("UPDATE users SET balance = balance - $1 WHERE id = $2", [monthlyEMI, loan.user_id]);
        console.log(`✅ EMI of $${monthlyEMI.toFixed(2)} deducted for user ID: ${loan.user_id}`);
      } else {
        await pool.query(
          `INSERT INTO notifications (user_id, message, created_at)
           VALUES ($1, '⚠️ Low balance! Unable to deduct EMI. Please add funds.', NOW())`,
          [loan.user_id]
        );
        console.warn(`⚠️ EMI deduction failed due to low balance for user ID: ${loan.user_id}`);
      }
    }

    console.log("✅ Monthly EMI Deduction Completed.");
  } catch (error) {
    console.error("❌ EMI Deduction Error:", error);
  }
});

// ✅ 404 Error Handling
app.use((req, res) => {
  res.status(404).json({ error: "❌ Route not found!" });
});

// ✅ Start Server
const PORT = process.env.PORT || 80;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
});