const Interview = require("../../src/models/Interview");
const Result = require("../../src/models/Result");
const Admin = require("../../src/models/Admin");
const InterviewPost = require("../../src/models/interviewpost");

const finalizeInterview = async (interviewId) => {

  const interview =
    await Interview.findById(interviewId);

  if (!interview)
    throw new Error("Interview not found");

  if (interview.status === "completed")
    return;

  const existing =
    await Result.findOne({
      interviewId,
    });

  if (!existing){

    
    //   interview.status = "evaluating";
    
    //   await interview.save();
    
    let totalScore = 0;
    
    let answeredCount = 0;
    
  for (const question of interview.questions) {

    if (!question.answerText)
      continue;
    
    const evaluation = {
      score: 80,
      relevance: 82,
      clarity: 78,
      feedback:
      "Good answer with room for more technical depth.",
    };
    
    question.aiEvaluation = evaluation;
    
    totalScore += evaluation.score;
    
    answeredCount++;
    
  }
  
  const overallScore =
  answeredCount
  ? Math.round(totalScore / answeredCount)
  : 0;
  
  await interview.save();
  
  const summary = {
    strengths: [
      "Good communication skills",
      "Demonstrates basic technical knowledge",
    ],
    
    weaknesses: [
      "Needs deeper understanding of advanced concepts",
      "Could provide more structured answers",
    ],
    
    recommendation: "hire",
  };
  
  const recruiter =
  await Admin.findById(
    interview.recruiterId
  ).select("name");
  
  await Result.create({
    
    interviewId: interview._id,
    
    recruiter: recruiter.name,
    
    recruiterId: interview.recruiterId,
    
    candidateId: interview.candidateId,
    
    overallScore,
    
    summary: {
      
      totalQuestions:
      interview.questions.length,
      
      averageScore:
      overallScore,
      
      ...summary,
      
    },
    
    questions:
    interview.questions,
    
    evaluatedAt:
    new Date(),
    
  });
}
  
  await InterviewPost.findByIdAndDelete(
    interview.postId
  );
  
  interview.status = "completed";

  await interview.save();

  console.log(
    `Interview ${interview._id} finalized successfully`
  );

};

module.exports = finalizeInterview;