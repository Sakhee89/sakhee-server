const {
  selectArticlesById,
  selectArticle,
  insertNewComment,
} = require("../models/articles-models");

exports.getArticle = (req, res, next) => {
  selectArticle().then((articles) => {
    res.status(200).send({ articles });
  });
};

exports.getArticlesById = (req, res, next) => {
  const { article_id } = req.params;
  selectArticlesById(article_id)
    .then((article) => {
      res.status(200).send({ article });
    })
    .catch((err) => {
      next(err);
    });
};

exports.postCommentByArticleId = (req, res, next) => {
  const field = req.body;

  const { article_id } = req.params;
  if (!field.body || !field.username) {
    return res
      .status(400)
      .send({ msg: "body and username are required fields." });
  }
  insertNewComment(field, article_id)
    .then((newComment) => {
      res.status(201).send({ newComment });
    })
    .catch((err) => {
      next(err);
    });
};
