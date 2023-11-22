const express = require("express");
const { getTopics } = require("./controllers/topics-controllers");
const {
  getArticlesById,
  getArticle,
  getCommentsByArticleId,
  patchArticleById,
} = require("./controllers/articles-controllers");
const { getApi } = require("./controllers/api-controllers");

const app = express();

app.use(express.json());

app.get("/api", getApi);

app.get("/api/topics", getTopics);

app.get("/api/articles", getArticle);

app.get(`/api/articles/:article_id`, getArticlesById);

app.get("/api/articles/:article_id/comments", getCommentsByArticleId);

app.patch("/api/articles/:article_id", patchArticleById);

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
  console.log(err);
  res.status(500).send({ msg: "Internal Server Error" });
});

module.exports = app;
