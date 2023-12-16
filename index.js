import express from "express";
import bodyParser from "body-parser";
import pg from 'pg';

const app = express();
const port = 3000;

const client = new pg.Client({
  host: 'localhost',
  port: 5433,
  user: 'postgres',
  password: 'jesus',
  database: 'world'
})


let totalCorrect = 0;
let quiz = fetchQuestions() || [];

async function fetchQuestions() {
  try {
    client.connect()
    const resp = await client.query("SELECT * FROM public.flags ORDER BY id ASC ")
    quiz = resp.rows;
    client.end();
  } catch (error) {
    console.error(error);
  }

}


// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let currentQuestion = {};

// GET home page
app.get("/", (req, res) => {
  totalCorrect = 0;
  nextQuestion();
  res.render("index.ejs", { question: currentQuestion });
});

// POST a new post
app.post("/submit", (req, res) => {
  let answer = req.body.answer.trim();
  let isCorrect = false;
  console.log(currentQuestion, answer)
  if (currentQuestion.name.toLowerCase() === answer.toLowerCase()) {
    totalCorrect++;
    console.log(totalCorrect);
    isCorrect = true;
  }

  nextQuestion();
  res.render("index.ejs", {
    question: currentQuestion,
    wasCorrect: isCorrect,
    totalScore: totalCorrect,
  });
});

function nextQuestion() {
  const randomCountry = quiz[Math.floor(Math.random() * quiz.length)];
  currentQuestion = randomCountry;
  console.log(currentQuestion);
}

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
