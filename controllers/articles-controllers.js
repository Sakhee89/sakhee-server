const { checkExists } = require("../utlis");
const {
  selectArticlesById,
  selectArticle,
  selectCommentsByArticleId,
  updateArticleById,
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

exports.getCommentsByArticleId = (req, res, next) => {
  const { article_id } = req.params;

  checkExists("articles", "article_id", article_id)
    .then(() => {
      selectCommentsByArticleId(article_id)
        .then((comments) => {
          res.status(200).send({ comments });
        })
        .catch((err) => {
          next(err);
        });
    })
    .catch((err) => {
      next(err);
    });
};

exports.patchArticleById = (req, res, next) => {
  const { article_id } = req.params;
  const { inc_votes } = req.body;

  updateArticleById(article_id, inc_votes)
    .then((article) => {
      res.status(200).send({ article });
    })
    .catch((err) => {
      next(err);
    });
};
