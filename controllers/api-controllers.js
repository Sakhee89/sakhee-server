const apiEndPoints = require("../endpoints.json");

exports.getApis = (req, res) => {
  res.status(200).send({ apiEndPoints });
};
