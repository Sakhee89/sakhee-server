const apiEndPoints = require("../endpoints.json")

exports.getApi = (req, res) => {
    res.status(200).send(apiEndPoints)
}