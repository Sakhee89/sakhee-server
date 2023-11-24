const articlesRouter = require("express").Router();
const {
  getArticlesById,
  getArticles,
  getCommentsByArticleId,
  patchArticleById,
  postCommentByArticleId,
} = require("../controllers/articles-controllers");

articlesRouter
  .route("/:article_id")
  .get(getArticlesById)
  .patch(patchArticleById);

articlesRouter
  .route("/:article_id/comments")
  .get(getCommentsByArticleId)
  .post(postCommentByArticleId);

articlesRouter.get("/", getArticles);

module.exports = articlesRouter;
