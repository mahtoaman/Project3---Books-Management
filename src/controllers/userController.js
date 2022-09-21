const userModel = require("../models/userModel");
const jwt = require("jsonwebtoken");
const { isValidBody,isValidName,isValidNumber,isValidEmail,isValidPassword } = require("../validators/validator");

const createUser = async function (req, res) {
  try {
    let data = req.body;
    let { title, name, phone, email, password } = data;

    if (!isValidBody(data)) {
      return res
        .status(400)
        .send({ status: false, message: "Body cannot be empty" });
    }

    if (!title || (title != "Mr" && title != "Mrs" && title != "Miss"))
      return res.status(400).send({
        status: false,
        msg: `Title is required in given format, format: "Mr","Mrs" or "Miss`,
      });

    if (!name || !isValidName(name.trim()))
      return res.status(400).send({
        status: false,
        msg: "Name is required in a valid format",
      });

    if (!phone || !isValidNumber(phone.trim()))
      return res.status(400).send({
        status: false,
        message:
          "Enter phone in valid format, a valid phone number starts with 6,7,8 or 9",
      });
    let isUniquePhone = await userModel.findOne({ phone: phone });
    if (isUniquePhone)
      return res.status(400).send({
        status: false,
        message: "This Phone Nubmer is already registered",
      });

    if (!email || !isValidEmail(email.trim())) {
      return res
        .status(400)
        .send({ status: false, msg: "email is required in a valid format" });
    }

    let isUniqueEmail = await userModel.findOne({ email: email });
    if (isUniqueEmail)
      return res
        .status(400)
        .send({ status: false, msg: "Provided email is already registered" });

    if (!password || !isValidPassword(password.trim()))
      return res.status(400).send({
        status: false,
        msg: "Password is required with these conditions: at least one upperCase, lowerCase letter, one number and one special character, min 8 char, max 15 char",
      });

    let savedData = await userModel.create(data);
    return res.status(201).send({ status: true, msg: savedData });
  } catch (err) {
    return res.status(500).send({ status: false, msg: err.message });
  }
};


//===============================LOGIN USER===============================================

const login = async function (req, res) {
  try {
    let emailId = req.body.email;
    let password = req.body.password;

    let emptyBody = Object.assign({}, emailId, password);
    if (Object.keys(emptyBody).length == 0) {
      return res
        .status(400)
        .send({ status: false, msg: "all fields are required" });
    }

    if (!emailId || !isValidEmail(emailId.trim())) {
      return res.status(400).send({ status: false, msg: "email is required" });
    }

    if (!password || !isValidPassword(password.trim()))
      return res.status(400).send({
        status: false,
        msg: "Password is required with these conditions: at least one upperCase, lowerCase letter, one number and one special character, min 8 char, max 15 char",
      });

    let loginUser = await userModel.findOne({
      email: emailId,
      password: password,
    });
    if (!loginUser) {
      return res.status(404).send({ status: false, msg: "invalid login user" });
    }

    let token = jwt.sign(
      {
        loginId: loginUser._id.toString(),
        userStatus: "active",
        app: "user of this book management system",
      },

      "bhai tera token generate hogya!!!!"
    );
    return res.status(200).send({ status: true, data: token });
  } catch (err) {
    return res.status(500).send({ status: false, msg: err.message });
  }
};

module.exports.createUser = createUser;
module.exports.login = login;
