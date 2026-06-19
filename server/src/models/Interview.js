// models/Interview.js
const mongoose = require('mongoose');
const questionSchema = require('./question');

const interviewSchema = new mongoose.Schema({
  candidateId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  jobRole:      { type: String, required: true },
  jobDescription: { type: String, default: null },
  skills:       [{ type: String }],               // e.g. ['React', 'Node.js']
  difficulty:   { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
postId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "inter_portal_posts"
},

recruiterId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User"
},
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'evaluated'],
    default: 'pending'
  },

  questions:    [questionSchema],                  // embedded questions array

  startedAt:    { type: Date, default: null },
  submittedAt:  { type: Date, default: null },
}, { timestamps: true });

module.exports = mongoose.model('Interview', interviewSchema);