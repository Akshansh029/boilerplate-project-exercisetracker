const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const { v4: uuidv4 } = require("uuid");
const bodyParser = require("body-parser");

app.use(cors());
app.use(express.static("public"));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// In-memory storage
let users = [];
let exercises = [];

// Create a new user
app.post("/api/users", (req, res) => {
  const { username } = req.body;
  const newUser = {
    username,
    _id: uuidv4(),
  };
  users.push(newUser);
  res.json(newUser);
});

// Add an exercise
app.post("/api/users/:_id/exercises", (req, res) => {
  const userId = req.params._id;
  const { description, duration, date } = req.body;

  const user = users.find((u) => u._id === userId);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  const exerciseDate = date ? new Date(date) : new Date();
  const newExercise = {
    userId,
    description,
    duration: parseInt(duration),
    date: exerciseDate.toDateString(),
  };
  exercises.push(newExercise);

  res.json({
    username: user.username,
    description: newExercise.description,
    duration: newExercise.duration,
    date: newExercise.date,
    _id: userId,
  });
});

app.get("/api/users", (req, res) => {
  res.json(
    users.map((user) => ({
      username: user.username,
      _id: user._id,
    }))
  );
});

// Get user log
app.get("/api/users/:_id/logs", (req, res) => {
  const userId = req.params._id;
  const { from, to, limit } = req.query;

  const user = users.find((u) => u._id === userId);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  let userExercises = exercises.filter((e) => e.userId === userId);

  if (from) {
    const fromDate = new Date(from);
    userExercises = userExercises.filter((e) => new Date(e.date) >= fromDate);
  }

  if (to) {
    const toDate = new Date(to);
    userExercises = userExercises.filter((e) => new Date(e.date) <= toDate);
  }

  if (limit) {
    userExercises = userExercises.slice(0, parseInt(limit));
  }

  res.json({
    username: user.username,
    count: userExercises.length,
    _id: userId,
    log: userExercises.map((ex) => ({
      description: ex.description,
      duration: ex.duration,
      date: ex.date,
    })),
  });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
