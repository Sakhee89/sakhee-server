const articlesRouter = require("express").Router();
const {
  getArticlesById,
  getArticles,
  getCommentsByArticleId,
  patchArticleById,
  postCommentByArticleId,
  postArticle,
} = require("../controllers/articles-controllers");

articlesRouter.route("/").get(getArticles).post(postArticle);

articlesRouter
  .route("/:article_id")
  .get(getArticlesById)
  .patch(patchArticleById);

articlesRouter
  .route("/:article_id/comments")
  .get(getCommentsByArticleId)
  .post(postCommentByArticleId);

module.exports = articlesRouter;
