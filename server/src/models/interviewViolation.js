const mongoose = require("mongoose");


const interviewViolationSchema = new mongoose.Schema({

   interviewId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Interview', required: true, unique: true },

    fullscreen: {
        type: Number,
        default: 0,
    },
    tabSwitch: {
        type: Number,
        default: 0,
    },

})


module.exports = mongoose.model('interviewViolation', interviewViolationSchema);