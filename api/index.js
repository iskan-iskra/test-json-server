const express = require("express");
const cors = require("cors");
import prisma from "../lib/prisma.js";

const app = express();

app.use(cors());
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
app.get("/api/todo", async (req, res) => {
  const todos = await prisma.todo.findMany({
    orderBy: {
      createdAt: "asc", // 'asc' для сортировки по возрастанию, 'desc' для сортировки по убыванию
    },
  });
  res.json(todos);
});

// Обработчик для создания новой задачи
app.post("/api/todo", async (req, res) => {
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

// Обработчик для обновления задачи
app.patch("/api/todo/:id", async (req, res) => {
  const { id } = req.params;
  const { title, description, completed, dueDate } = req.body;
  const todo = await prisma.todo.update({
    where: { id: parseInt(id) },
    data: {
      ...(title !== undefined && { title }),
      ...(completed !== undefined && { completed }),
      ...(description !== undefined && { description }),
      ...(dueDate !== undefined && { dueDate }),
    },
  });
  res.json(todo);
});

// Обработчик для удаления задачи
app.delete("/api/todo/:id", async (req, res) => {
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
