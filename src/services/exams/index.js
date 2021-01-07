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
  getAnwers,
  writeAnwers,
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

    // const userAnswers = [];
    // // initially users answers with empty strings
    // for (let i = 0; i < examQuestions.length; i++) {
    //   userAnswers.push("");
    // }

    // if (req.body.answers) {
    //   const submittedAnswers = req.body.answers;
    //   submittedAnswers.map((answer, index) => {
    //     userAnswers[index] = answer;
    //   });
    // }

    const newExam = {};

    let date = new Date();
    let dateWrapper = moment(date);
    newExam._id = uniqid(); // server generated
    newExam.candidateName = req.body.candidateName;
    newExam.examDate = dateWrapper;
    newExam.isCompleted = false;
    newExam.name = "Admission Test";

    // // Add answers provided by user to corresponding question on submitting
    // for (let i = 0; i < userAnswers.length; i++) {
    //   if (userAnswers[i] !== "") {
    //     examQuestions[i].providedAnswer = userAnswers[i];
    //     newExam.isCompleted = true;
    //   }
    // }

    newExam.questions = examQuestions;
    const currentExams = await getExams();

    await writeExams([...currentExams, newExam]);

    // Delete all the correct answers from the response
    for (let i = 0; i < newExam.questions.length; i++) {
      newExam.questions[i].answers.map((answer) => delete answer.isCorrect);
    }

    res.status(201).send(newExam);
  } catch (error) {
    console.log(error);
    const err = new Error("An error occurred while reading from the file");
    next(err);
  }
});

examsRouter.post("/:id/answer", async (req, res, next) => {
  try {
    // get exams from DB

    const exams = await getExams();

    const examFound = exams.find((exam) => exam._id === req.params.id);

    const examIndex = exams.findIndex((exam) => exam._id === req.params.id);

    if (examIndex !== -1) {
      // exam found
      examFound.questions.map((question, index) => {
        if (index === req.body.question && req.body.answer) {
          if (!examFound.providedAnswer) {
            examFound.questions[index].providedAnswer = req.body.answer;
          }
        }
      });

      const examUpdate = [
        ...exams.slice(0, examIndex),
        { ...exams[examIndex], ...examFound },
        ...exams.slice(examIndex + 1),
      ];

      await writeExams(examUpdate);
      res.send(examUpdate);
    } else {
      const err = new Error();
      err.httpStatusCode = 404;
      next(err);
    }

    // if (examFound) {
    //   examFound.questions.map((question, index) => {
    //     if (index === req.body.question && req.body.answer) {
    //       if (!examFound.providedAnswer) {
    //         examFound.questions[index].providedAnswer = req.body.answer;
    //       }
    //     }
    //   });

    //   const currentExams = await getExams();
    //   await writeExams([...currentExams, examFound]);

    //   res.send(examFound);
    // } else {
    //   const err = new Error();
    //   err.httpStatusCode = 404;
    //   next(err);
    // }
  } catch (error) {
    console.log(error);
    const err = new Error("An error occurred while reading from the file");
    next(err);
  }
});

module.exports = examsRouter;
