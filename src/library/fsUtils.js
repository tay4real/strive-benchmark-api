const { readJSON, writeJSON } = require("fs-extra");
const path = require("path");

const examsDBPath = path.join(__dirname, "../services/exams/exams.json");
const questionsDBPath = path.join(
  __dirname,
  "../data/questions/questions.json"
);

const readDB = async (filePath) => {
  try {
    const fileJson = await readJSON(filePath);
    return fileJson;
  } catch (error) {
    throw new Error(error);
  }
};

const writeDB = async (filePath, fileContent) => {
  try {
    await writeJSON(filePath, fileContent);
  } catch (error) {
    throw new Error(error);
  }
};

const getArrayLength = async (array) => {
  return array.length;
};

// Shuffles an array
const shuffleArray = async (array) => {
  let currentIndex = array.length,
    temporaryValue,
    randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
};

module.exports = {
  getQuestions: async () => readDB(questionsDBPath),
  writeQuestions: async (questionsData) =>
    writeDB(questionsDBPath, questionsData),
  getExams: async () => readDB(examsDBPath),
  writeExams: async (examsData) => writeDB(examsDBPath, examsData),
  getTotalQuestions: async (questions) => getArrayLength(questions),
  shuffleQuestions: async (questions) => shuffleArray(questions)
};
