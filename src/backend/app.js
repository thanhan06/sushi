require("dotenv").config();

const express = require("express");
const app = express();

const cors = require("cors");
require("express-async-errors");
const path = require("path");

const router = require("./routes");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use('/', router);

app.use((req, res) => {
  res.status(404).send({ error: "Not found" });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send({ error: "An error occurred." });
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
