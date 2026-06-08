const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true,
        unique: true
    },

    ph_no: {
        type: String,
        required: true,
        unique: true,
        match: [/^\d{10}$/, "Please enter a valid phone number"]
    },

    password: {
        type: String,
        required: true
    },

    role: {
        type: String,
        required: true,
        trim: true
    },

    profile_photo: {
        data: Buffer,
        contentType: String
    },

    resetPasswordOtp: {
        type: String
    },

    resetPasswordOtpExpire: {
        type: Date
    }
}, {
    timestamps: true
});

module.exports = mongoose.model("User", userSchema);
