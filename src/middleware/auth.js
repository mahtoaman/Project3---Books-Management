const jwt = require("jsonwebtoken");

//===============================AUTHENTICATION=============================

const isAuthenticate = async function (req, res, next) {
  try {
    token = req.headers["x-api-key"];
    if (!token) {
      return res.status(400).send({
        status: false,
        message: "You're not logined, Your token is missing",
      });
    }
    decodedToken = jwt.verify(
      token,
      "authors-secret-key",
      (error, response) => {
        if (error) {
          return res
            .status(400)
            .send({ status: false, message: "Not a Valid Token" });
        }
        req.headers.authorId = response.authorId;
        next();
      }
    );
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

module.exports.isAuthenticate = isAuthenticate
