const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
// import fetch from
const dotenv = require("dotenv");
dotenv.config();
const { MONGO_DB } = process.env;
const app = express();
app.use(express.json());
app.use(express.urlencoded());
app.use(cors());
var ObjectId = require("mongodb").ObjectId;
main().catch((err) => console.log(err));

async function main() {
  await mongoose.connect(
    "mongodb+srv://sborwankar:dHBD3ULAQFhb7wNg@counter.umy2rrk.mongodb.net/level2"
  );
}

const taskSchema = new mongoose.Schema({
  name: String,
  tasks: [
    { status: String, title: String, description: String, dueDate: String },
  ],
});
const UserTask = mongoose.model("tasks", taskSchema);

const userSchema = new mongoose.Schema({
  name: String,
  password: String,
});

const User = mongoose.model("user", userSchema);

// const user2 = new User({
//   name: "Liem",
//   password: "liem",
// });
// user2.save();
// const user1 = new UserTask({
//   name: "Saumya",
//   tasks: [
//     {
//       title: "Completing level 2 SESL",
//       description: "lol",
//       status: "inProgress",
//       dueDate: "1999-09-09",
//     },
//     {
//       title: "Completing level 2 SESL",
//       description: "lol",
//       status: "completed",
//       dueDate: "1999-09-09",
//     },
//   ],
// });
// user1.save();
app.get("/", (req, res) => {
  res.status(200).send("Hello from backend");
});

//Login
app.post("/login", (req, res) => {
  try {
    const { name, password } = req.body;
    console.info("login for ", name);
    try {
      User.findOne({ name: name }).then(async (entry) => {
        if (entry) {
          if (password === entry.password) {
            res.status(200).send({ message: name });
          }
        } else {
          res.status(250).send("wrong pass");
        }
      });
    } catch (err) {
      console.info(err);
      res.status(250).send("wrong pass");
    }
  } catch (err) {
    console.info(err);
    res.status(500).send({ message: "server error" });
  }
});

//Register
app.post("/register", (req, res) => {
  try {
    console.info(req.body);
    const { name, password } = req.body;
    console.info("register for ", name);
    User.findOne({ name: name }).then(async (entry) => {
      if (entry) {
        res.status(500).send({ message: "User already registered" });
      } else {
        const user2 = new User({
          name: name,
          password: password,
        });
        user2.save();
        const user1 = new UserTask({
          name: name,
          tasks: [
            {
              title: "",
              description: "",
              status: "deleted",
              dueDate: "",
            },
          ],
        });
        user1.save();
        res.status(200).send({ message: "User created" });
      }
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: "server error" });
  }
});

// log out button

// session managment
// sort kaise
// setTaskList ko kaise call kare

// update task
app.post("/editTask", async (req, res) => {
  try {
    const userName = req.body.name;
    console.info("edit task for ", userName);
    const { title, description, status, dueDate } = req.body.task;
    const _id = req.body.id;
    await UserTask.updateOne(
      { "tasks._id": _id },
      {
        $set: {
          "tasks.$.title": title,
          "tasks.$.description": description,
          "tasks.$.dueDate": dueDate,
          "tasks.$.status": status,
        },
      },
      { arrayFilters: [{ "xxx._id": _id }] }
    );
    UserTask.find({ name: userName }).then((entries) => {
      res.status(200).send({ message: entries });
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: "server error" });
  }
});
// delete task
app.post("/deleteTask", async (req, res) => {
  try {
    const userName = req.body.name;
    // const { title, description, status, dueDate } = req.body.task;
    const _id = req.body.id;
    console.log("delete task for ", userName);
    await UserTask.updateOne(
      { "tasks._id": _id },
      {
        $set: {
          "tasks.$.title": "",
          "tasks.$.description": "",
          "tasks.$.dueDate": "",
          "tasks.$.status": "deleted",
        },
      },
      { arrayFilters: [{ "xxx._id": _id }] }
    );
    UserTask.find({ name: userName }).then((entries) => {
      res.status(200).send({ message: entries });
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: "server error" });
  }
});

// get task list
app.post("/getTasks", (req, res) => {
  try {
    const userName = req.body.name;
    console.info("get task for", userName);
    UserTask.find({ name: userName }).then((entries) => {
      res.status(200).send({ message: entries });
    });
  } catch (err) {
    console.info(err);
    res.status(500).send({ message: "server error" });
  }
});
// Route for adding a new task and returning a list of updated tasks
app.post("/addTask", (req, res) => {
  try {
    // console.log(req.body);
    const userName = req.body.name;
    const { title, description, status, dueDate } = req.body.task;
    // console.log(userName, title, description, status, dueDate);
    console.info("add task for ", userName);
    UserTask.findOne({ name: userName }).then(async (entry) => {
      if (entry) {
        entry.tasks.push({
          title: title,
          description: description,
          status: status,
          dueDate: dueDate,
        });
        await entry.save();
        UserTask.find({ name: userName }).then((entries) => {
          res.status(200).send({ message: entries });
        });
      } else {
        res.status(250).send({ message: "no user found" });
      }
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: "server error" });
  }
});

app.listen(process.env.PORT || 9002, () => {
  console.log("Backend started at port 9002");
});
