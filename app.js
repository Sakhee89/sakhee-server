const express = require("express");

const { getTopics } = require("./controllers/topics-controllers");

const {
  getArticlesById,
  getArticles,
  getCommentsByArticleId,
  patchArticleById,
  postCommentByArticleId,
} = require("./controllers/articles-controllers");

const { getApis } = require("./controllers/api-controllers");

const { deleteCommentById } = require("./controllers/comments-controllers");

const app = express();

app.use(express.json());

app.get("/api", getApis);

app.get("/api/topics", getTopics);

app.get("/api/articles", getArticles);

app.get(`/api/articles/:article_id`, getArticlesById);

app.get("/api/articles/:article_id/comments", getCommentsByArticleId);

app.patch("/api/articles/:article_id", patchArticleById);

app.post("/api/articles/:article_id/comments", postCommentByArticleId);

app.delete("/api/comments/:comment_id", deleteCommentById);

app.use((err, req, res, next) => {
  if (err.status) {
    res.status(err.status).send({ msg: err.msg });
  } else next(err);
});

app.use((err, req, res, next) => {
  if (err.code === "22P02") {
    res.status(400).send({ msg: `Bad request` });
  } else next(err);
});

app.use((err, req, res, next) => {
  if (err.code === "23503") {
    res.status(404).send({ msg: "not found" });
  } else next(err);
});

app.use((err, req, res, next) => {
  console.log(err);
  res.status(500).send({ msg: "Internal Server Error" });
});

module.exports = app;
