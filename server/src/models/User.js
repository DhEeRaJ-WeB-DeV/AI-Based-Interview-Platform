

// const mongoose = require("mongoose");

// const userSchema = new mongoose.Schema({

//     name:{
//         type:String
//     },

//     email:{
//         type:String,
//         required:true,
//         unique:true
//     },

//     password:{
//         type:String,
//         required:true
//     },

//     resetPasswordOtp: { type: String },

//     resetPasswordOtpExpire: { type: Date },

//     canResetPassword: {type: Boolean},

//     role:{
//         type:String,
//         default:"candidate"
//     },

//    ph_no: { type: String },

//     skills:[String],

//     education:[String],

//     projects:[String],

//     experience:[String],

//     profileCompleted:{
//         type:Boolean,
//         default:false
//     }

// },{timestamps:true});

// module.exports = mongoose.model("User",userSchema);
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,

  email: {
    type: String,
    required: true,
    unique: true,
  },

  password: {
    type: String,
    required: true,
  },

  resetPasswordOtp: String,

  resetPasswordOtpExpire: Date,

  canResetPassword: Boolean,

  role: {
    type: String,
    default: "candidate",
  },

  ph_no: String,

  skills: [String],

  education: [
    {
      institution: String,
      degree: String,
      years: String,
      location: String,
      gpa: String,
    },
  ],

  projects: [
    {
      title: String,
      technologies: [String],
      description: String,
    },
  ],

  experience: [
    {
      designation: String,
      company: String,
      dates: String,
      description: [String],
    },
  ],

  profileCompleted: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);