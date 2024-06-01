const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

const app = express();
const PORT = 3000;
const DB_FILE = "todos.json";

app.use(bodyParser.json());

const loadTodos = () => {
  if (fs.existsSync(DB_FILE)) {
    const data = fs.readFileSync(DB_FILE);
    return JSON.parse(data);
  }
  return [];
};

const saveTodos = (todos) => {
  fs.writeFileSync(DB_FILE, JSON.stringify(todos, null, 2));
};

app.get("/todos", (req, res) => {
  const todos = loadTodos();
  res.json(todos);
});

app.get("/todos/:id", (req, res) => {
  const todos = loadTodos();
  const todo = todos.find((t) => t.id === req.params.id);
  if (todo) {
    res.json(todo);
  } else {
    res.status(404).send("Todo not found");
  }
});

app.post("/todos", (req, res) => {
  const todos = loadTodos();
  const newTodo = {
    id: uuidv4(),
    title: req.body.title,
    description: req.body.description,
    dueDate: req.body.dueDate,
    createdDate: new Date().toISOString().split("T")[0],
    completed: false,
  };
  todos.push(newTodo);
  saveTodos(todos);
  res.status(201).json(newTodo);
});

app.put("/todos/:id", (req, res) => {
  const todos = loadTodos();
  const todoIndex = todos.findIndex((t) => t.id === req.params.id);
  if (todoIndex !== -1) {
    const updatedTodo = { ...todos[todoIndex], ...req.body };
    todos[todoIndex] = updatedTodo;
    saveTodos(todos);
    res.json(updatedTodo);
  } else {
    res.status(404).send("Todo not found");
  }
});

app.delete("/todos/:id", (req, res) => {
  let todos = loadTodos();
  const todoIndex = todos.findIndex((t) => t.id === req.params.id);
  if (todoIndex !== -1) {
    todos = todos.filter((t) => t.id !== req.params.id);
    saveTodos(todos);
    res.status(204).send();
  } else {
    res.status(404).send("Todo not found");
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
