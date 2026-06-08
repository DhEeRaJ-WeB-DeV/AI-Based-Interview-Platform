require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./src/config/db");

const app = express();

connectDB();

app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true
}));
app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

app.use("/api/auth",
    require("./src/routes/authRoutes")
);

// const PORT = process.env.PORT || 5000;

app.listen(5000, () => {
    console.log(`Server running on port 5000`);
});
