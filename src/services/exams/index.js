const express = require("express");
const moment = require("moment");
const uniqid = require("uniqid");

const { join } = require("path");

const { createReadStream } = require("fs-extra");

const {
  getQuestions,
  getExams,
  writeExams,
  getTotalQuestions,
  shuffleQuestions,
} = require("../../library/fsUtils");

const examsRouter = express.Router();

examsRouter.post("/start", async (req, res, next) => {
  try {
    // get questions from DB
    const questions = await getQuestions();

    // Shuffle the Questioons
    const shuffleQues = await shuffleQuestions(questions);

    // Pick the first five questions
    const examQuestions = shuffleQues.slice(0, 5);

    const userAnswers = [];
    // initially users answers with empty strings
    for (let i = 0; i < examQuestions.length; i++) {
      userAnswers.push("");
    }

    if (req.body.answers) {
      const submittedAnswers = req.body.answers;
      submittedAnswers.map((answer, index) => {
        userAnswers[index] = answer;
      });
    }

    const newExam = {};

    let date = new Date();
    let dateWrapper = moment(date);
    newExam._id = uniqid(); // server generated
    newExam.candidateName = req.body.candidateName;
    newExam.examDate = dateWrapper;
    newExam.isCompleted = false;
    newExam.name = "Admission Test";

    // Add answers provided by user to corresponding question on submitting
    for (let i = 0; i < userAnswers.length; i++) {
      if (userAnswers[i] !== "") {
        examQuestions[i].providedAnswer = userAnswers[i];
        newExam.isCompleted = true;
      }
    }

    // Delete all the correct answers from the questions
    for (let i = 0; i < examQuestions.length; i++) {
      examQuestions[i].answers.map((answer) => delete answer.isCorrect);
    }

    newExam.questions = examQuestions;
    const currentExams = await getExams();
    console.log(userAnswers);

    delete req.body.id;
    await writeExams([...currentExams, newExam]);

    res.status(201).send(newExam);
  } catch (error) {
    console.log(error);
    const err = new Error("An error occurred while reading from the file");
    next(err);
  }
});

module.exports = examsRouter;
