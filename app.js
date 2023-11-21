const express = require("express");
const { getTopics } = require("./controllers/topics-controllers");
const { getArticleById, getCommentsByArticleId } = require("./controllers/articles-controllers");
const { getApi } = require("./controllers/api-controllers");

const app = express();

app.use(express.json());

app.get("/api/topics", getTopics)

app.get("/api/articles/:article_id", getArticleById)

app.get("/api/articles/:article_id/comments", getCommentsByArticleId)

app.use((err, req, res, next) => {
    if (err.status) {
      res.status(err.status).send({ msg: err.msg });
    } else if (err.code === "22P02") {
      res.status(400).send({ msg: `Bad request` });
    } else {
      res.status(500).send({ msg: "Internal Server Error" });
    }
  });
app.get("/api", getApi)

module.exports = app