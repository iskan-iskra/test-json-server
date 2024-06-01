const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const app = express();
const PORT = process.env.PORT || 3000;

// Подключение к MongoDB Atlas
mongoose.connect(
  "mongodb+srv://test:test@cluster0.wzjsmhv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

const Todo = mongoose.model(
  "Todo",
  {
    title: String,
    description: String,
    completed: Boolean,
    createdAt: { type: Date, default: Date.now },
    completedAt: Date,
  },
  { collection: "todo_v2" }
);

app.use(bodyParser.json());

// Swagger опции
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Todo API",
      version: "1.0.0",
      description: "API for managing Todo items",
    },
  },
  apis: ["server.js"], // Файлы с описанием роутов API
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

const CSS_URL =
  "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.6.1/swagger-ui.min.css";

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customCssUrl: CSS_URL,
  })
);

// Роуты для операций с Todo
/**
 * @swagger
 * /todos:
 *   get:
 *     summary: Получить список всех Todo
 *     responses:
 *       '200':
 *         description: Успешный запрос. Возвращает список всех Todo.
 *       '500':
 *         description: Ошибка сервера. Не удалось получить список Todo.
 */
app.get("/todos", async (req, res) => {
  try {
    const todos = await Todo.find();
    res.json(todos);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch todos" });
  }
});

/**
 * @swagger
 * /todos:
 *   post:
 *     summary: Создать новую Todo
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               completed:
 *                 type: boolean
 *     responses:
 *       '201':
 *         description: Успешное создание. Возвращает созданную Todo.
 *       '500':
 *         description: Ошибка сервера. Не удалось создать Todo.
 */
app.post("/todos", async (req, res) => {
  try {
    const todo = new Todo(req.body);
    await todo.save();
    res.status(201).json(todo);
  } catch (error) {
    res.status(500).json({ error: "Failed to create todo" });
  }
});

/**
 * @swagger
 * /todos/{id}:
 *   put:
 *     summary: Обновить существующую Todo по ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               completed:
 *                 type: boolean
 *     responses:
 *       '200':
 *         description: Успешное обновление. Возвращает обновленную Todo.
 *       '500':
 *         description: Ошибка сервера. Не удалось обновить Todo.
 */
app.put("/todos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const todo = await Todo.findByIdAndUpdate(id, req.body, { new: true });
    res.json(todo);
  } catch (error) {
    res.status(500).json({ error: "Failed to update todo" });
  }
});

/**
 * @swagger
 * /todos/{id}:
 *   delete:
 *     summary: Удалить существующую Todo по ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '204':
 *         description: Успешное удаление. Не возвращает контент.
 *       '500':
 *         description: Ошибка сервера. Не удалось удалить Todo.
 */
app.delete("/todos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await Todo.findByIdAndDelete(id);
    res.sendStatus(204);
  } catch (error) {
    res.status(500).json({ error: "Failed to delete todo" });
  }
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
