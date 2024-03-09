const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

let users = [];
let exercises = [];

app.post("/api/users", (req, res) => {
  const { username } = req.body;
  users.push(username);
  exercises.push([]);
  res.json({ username, _id: (users.length - 1).toString() });
});

app.get("/api/users", (req, res) => {
  res.json(users.map((user, i) => ({ username: user, _id: i.toString() })));
});

app.post("/api/users/:_id/exercises", (req, res) => {
  const { description, duration, date } = req.body;
  const { _id } = req.params;
  let d;
  if (!date) {
    let dateFormatted = new Date();
    d = dateFormatted.toDateString();
  } else {
    let dateFormatted = new Date(date);
    d = dateFormatted.toDateString();
  }
  let newExercise = {
    description: String(description),
    duration: Number(duration),
    date: d,
  };
  exercises[_id].push(newExercise);
  res.json({
    username: users[_id],
    _id,
    ...newExercise,
  });
});

app.get("/api/users/:_id/logs", (req, res) => {
  const { _id } = req.params;
  console.log("query: ", req.query);
  const { from, to, limit } = req.query;
  let responseObj;
  if (!from && !to && !limit) {
    responseObj = {
      username: users[_id],
      count: exercises[_id].length,
      _id,
      log: exercises[_id],
    };
  } else {
    let filteredExercises = exercises[_id].filter((ex) => {
      let dObj = new Date(ex.date);
      let fromDate = from ? new Date(from) : new Date(0);
      let toDate = to ? new Date(to) : new Date();
      return dObj >= fromDate && dObj <= toDate;
    });
    console.log("filtered: ", filteredExercises);

    responseObj = {
      username: users[_id],
      count: exercises[_id].length,
      _id,
      log: limit ? filteredExercises.slice(0, limit) : filteredExercises,
    };
  }
  console.log("response: ", responseObj);
  res.json(responseObj);
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
