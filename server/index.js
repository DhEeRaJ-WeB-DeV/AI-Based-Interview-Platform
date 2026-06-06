require("dotenv").config();

const express = require("express");
const connectDB = require("./src/config/db");

const app = express();

connectDB();

app.use(express.json());

app.use("/api/auth",
    require("./src/routes/authRoutes")
);

app.listen(5000, () => {
    console.log("Server running");
});
