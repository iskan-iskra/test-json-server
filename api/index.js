const express = require("express");
import prisma from "../lib/prisma.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/api/test-connection", async (req, res) => {
  try {
    await prisma.$connect();
    res.send("Database connection successful!");
  } catch (error) {
    res.status(500).send(`Database connection failed: ${error.message}`);
  }
});

// Обработчик для получения списка задач
app.get("/api/todos", async (req, res) => {
  const todos = await prisma.todo.findMany();
  res.json(todos);
});

// Обработчик для создания новой задачи
app.post("/api/todos", async (req, res) => {
  const { title, description, completed, dueDate } = req.body;
  const todo = await prisma.todo.create({
    data: {
      title,
      description,
      completed,
      dueDate,
    },
  });
  res.json(todo);
});

// Обработчик для удаления задачи
app.delete("/api/todos/:id", async (req, res) => {
  const { id } = req.params;
  const todo = await prisma.todo.delete({
    where: {
      id: parseInt(id),
    },
  });
  res.json(todo);
});

const PORT = process.env.PORT || 3000;

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
