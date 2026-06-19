// models/Result.js
const mongoose = require('mongoose');
const questionSchema  = require('./question')
const summarySchema = new mongoose.Schema({
  totalQuestions:  { type: Number },
  averageScore:    { type: Number },
  strengths:       [{ type: String }],
  weaknesses:      [{ type: String }],
  recommendation:  { type: String, enum: ['hire','reject'] },
}, { _id: false });

const resultSchema = new mongoose.Schema({
  interviewId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Interview', required: true, unique: true },
  candidateId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  overallScore: { type: Number, default: null },   // 0–100
  summary:      { type: summarySchema, default: null },

  evaluatedAt:  { type: Date, default: null },
  questions:    [questionSchema],
}, { timestamps: true });

module.exports = mongoose.model('Result', resultSchema);