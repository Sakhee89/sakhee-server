const { checkExists } = require("../utlis");
const {
  selectArticlesById,
  selectArticles,
  selectCommentsByArticleId,
  updateArticleById,
  insertNewCommentByArticleId,
  insertArticle,
} = require("../models/articles-models");

exports.getArticles = (req, res, next) => {
  const { topic, sort_by, order } = req.query;
  const articlePromises = [selectArticles(topic, sort_by, order)];

  if (topic) {
    articlePromises.push(checkExists("topics", "slug", topic));
  }

  Promise.all(articlePromises)
    .then((resolvedPromises) => {
      const articles = resolvedPromises[0];
      return res.status(200).send({ articles });
    })
    .catch((err) => {
      next(err);
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
  const articlePromises = [
    selectCommentsByArticleId(article_id),
    checkExists("articles", "article_id", article_id),
  ];

  Promise.all(articlePromises)
    .then((resolvedPromises) => {
      const comments = resolvedPromises[0];
      res.status(200).send({ comments });
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

exports.postCommentByArticleId = (req, res, next) => {
  const field = req.body;

  const { article_id } = req.params;
  if (!field.body || !field.username) {
    return res
      .status(400)
      .send({ msg: "Body and username are required fields." });
  }
  insertNewCommentByArticleId(field, article_id)
    .then((newComment) => {
      res.status(201).send({ newComment });
    })
    .catch((err) => {
      next(err);
    });
};

exports.postArticle = (req, res, next) => {
  const newArticle = req.body;
  insertArticle(newArticle)
    .then((newArticle) => {
      selectArticlesById(newArticle.article_id).then((article) => {
        res.status(201).send({ article });
      });
    })
    .catch((err) => {
      next(err);
    });
};
