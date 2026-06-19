// models/Question.js
const mongoose = require('mongoose');

const aiEvaluationSchema = new mongoose.Schema({
  score:       { type: Number, default: null },
  relevance:   { type: Number, default: null },
  clarity:     { type: Number, default: null },
  feedback:    { type: String, default: null },
}, { _id: false });

const questionSchema = new mongoose.Schema({
  questionText:  { type: String, required: true },
  category:      { type: String, enum: ['introduction', 'technical', 'behavioral', 'wrap-up'], required: true },
  difficulty:    { type: String, enum: ['easy', 'medium', 'hard'], required: true },
  orderIndex:    { type: Number, required: true },  // question number (1, 2, 3...)

  // candidate's response
  answerText:    { type: String, default: null },   // STT transcript
  recordingUrl:  { type: String, default: null },   // Cloudinary URL (audio+video)
  answeredAt:    { type: Date,   default: null },

  // ai scoring
  aiEvaluation:  { type: aiEvaluationSchema, default: null },
}, { _id: true });

module.exports = questionSchema;