const { selectArticlesById, selectArticle } = require("../models/articles-models");

exports.getArticle = (req, res, next) => {
    selectArticle().then((articles) => {
        res.status(200).send({articles})
    })
}

exports.getArticlesById = (req, res, next) => {
    const {article_id} = req.params;
    selectArticlesById(article_id)
    .then((article) => {
        res.status(200).send({article});
    }).catch((err) => {
        next(err);
    })
}