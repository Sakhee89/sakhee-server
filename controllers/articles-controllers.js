const { checkExists } = require("../utlis");
const {
  selectArticlesById,
  selectArticle,
  selectCommentsByArticleId,
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

exports.getCommentsByArticleId = (req, res, next) => {
  const { article_id } = req.params;

  const articlePromises = [selectCommentsByArticleId(article_id)];

  if (article_id) {
    articlePromises.push(checkExists("articles", "article_id", article_id));
  }

  Promise.all(articlePromises)
    .then((resolvedPromises) => {
      const comments = resolvedPromises[0];
      res.status(200).send({ comments });
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
