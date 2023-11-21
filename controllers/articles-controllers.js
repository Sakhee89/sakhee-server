const { selectArticleById, selectCommentsByArticleId } = require("../models/articles-models");

exports.getArticleById = (req, res, next) => {
    const {article_id} = req.params;
    selectArticleById(article_id)
    .then((article) => {
        res.status(200).send({article});
    }).catch((err) => {
        next(err);
    })
}

exports.getCommentsByArticleId = (req, res,next) => {
    const {article_id} = req.params
    selectCommentsByArticleId()
}