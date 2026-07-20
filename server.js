require("dotenv").config();

const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");

const connectDB = require("./config/db");

// ================= IMPORT ONLY DAY 2 ROUTES =================
const authRoutes = require("./routes/authRoutes");
const emailOtpRoutes = require("./routes/emailOtpRoutes");

const app = express();

// ================= DATABASE =================
connectDB();

console.log("\n═══════════════════════════════════");
console.log("🔥 SERVER INITIALIZATION");
console.log("Node version:", process.version);
console.log("PORT:", process.env.PORT || 5000);
console.log("═══════════════════════════════════\n");

// ================= MIDDLEWARE =================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
    console.log("\n📡 INCOMING REQUEST");
    console.log("Method:", req.method);
    console.log("Path:", req.path);

    if (req.body && Object.keys(req.body).length > 0) {
        console.log("Body:", req.body);
    } else {
        console.log("Body: {}");
    }

    next();
});

// ================= STATIC FILES =================
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static("uploads"));

// ================= MULTER =================
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, "uploads/"),
    filename: (req, file, cb) =>
        cb(null, Date.now() + "-" + file.originalname)
});

const upload = multer({ storage });

// ================= TEST ROUTE =================
app.get("/api/test", (req, res) => {
    res.json({
        success: true,
        message: "Authentication Module Running",
        timestamp: new Date()
    });
});

// ================= DAY 2 ROUTES =================
console.log("✅ Loading Authentication Module");

app.use("/api/auth", authRoutes);
app.use("/api/otp", emailOtpRoutes);

// ================= FILE UPLOAD =================
app.post("/api/upload", upload.single("file"), (req, res) => {
    res.json({
        message: "File uploaded successfully",
        file: req.file
    });
});

// ================= HOME PAGE =================
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ================= 404 =================
app.use((req, res) => {
    console.log("⚠️ Route Not Found:", req.path);

    if (req.path.startsWith("/api")) {
        return res.status(404).json({
            success: false,
            message: "API endpoint not found"
        });
    }

    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ================= ERROR HANDLER =================
app.use((err, req, res, next) => {
    console.error("💥 Server Error:", err);

    res.status(500).json({
        success: false,
        message: err.message
    });
});

// ================= START SERVER =================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log("═══════════════════════════════════");
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log("📌 Day 2 Module : Authentication");
    console.log("📌 Active Routes:");
    console.log("   /api/auth");
    console.log("   /api/otp");
    console.log("═══════════════════════════════════\n");
});