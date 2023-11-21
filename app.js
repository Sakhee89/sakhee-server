const express = require("express");
const { getTopics } = require("./controllers/topics-controllers");
const {
  getArticlesById,
  getArticle,
  postCommentByArticleId,
} = require("./controllers/articles-controllers");
const { getApi } = require("./controllers/api-controllers");

const app = express();

app.use(express.json());

app.get("/api/topics", getTopics);

app.get("/api/articles", getArticle);

app.get(`/api/articles/:article_id`, getArticlesById);

app.post("/api/articles/:article_id/comments", postCommentByArticleId);

app.get("/api", getApi);

app.use((err, req, res, next) => {
  if (err.status) {
    res.status(err.status).send({ msg: err.msg });
  } else next(err);
});
app.use((err, req, res, next) => {
  if (err.code === "22P02" || err.code === "23503") {
    res.status(400).send({ msg: `Bad request` });
  }
});

app.use((err, req, res, next) => {
  console.log(err);
  res.status(500).send({ msg: "Internal Server Error" });
});

module.exports = app;
