const userModel = require("../models/userModel");
const jwt = require("jsonwebtoken");
const {
  isValidBody,
  isValidName,
  isValidNumber,
  isValidEmail,
  isValidPassword,
  isValidPin,
  isValid,
} = require("../validators/validator");

const createUser = async function (req, res) {
  try {
    let data = req.body;
    let { title, name, phone, email, password, address } = data;

    if (!isValidBody(data)) {
      return res
        .status(400)
        .send({ status: false, message: "Body cannot be empty" });
    }

    if (!title || (title != "Mr" && title != "Mrs" && title != "Miss"))
      return res.status(400).send({
        status: false,
        message: `Title is required in given format, format: "Mr","Mrs" or "Miss`
      });

    if (!name || !isValid(name) || !isValidName(name))
      return res.status(400).send({
        status: false,
        message: "Name is required in a valid format",
      });

    if (!phone || !isValidNumber(phone))
      return res.status(400).send({
        status: false,
        message:
          "Enter phone in valid format, a valid phone number starts with 6,7,8 or 9, also spaces are not allowed",
      });
      
    let isUniquePhone = await userModel.findOne({ phone: phone });
    if (isUniquePhone)
      return res.status(400).send({
        status: false,
        message: "This Phone Nubmer is already registered",
      });

    if (!email || !isValidEmail(email)) {
      return res
        .status(400)
        .send({ status: false, message: "email is required in a valid format" });
    }

    let isUniqueEmail = await userModel.findOne({ email: email });
    if (isUniqueEmail)
      return res
        .status(400)
        .send({ status: false, message: "Provided email is already registered" });

    if (!password || !isValidPassword(password))
      return res.status(400).send({
        status: false,
        message: "Password is required with these conditions: at least one upperCase, lowerCase letter, one number and one special character, min 8 char, max 15 char",
      });

    if (address) {
      if (!isValidBody(address))
        return res
          .status(400)
          .send({ status: false, message: "Please enter valid address" });

      let { street, city, pincode } = address;
      if (!street || street.length == 0)
        return res.status(400).send({
          status: false,
          message: "Please enter a valid street",
        });

      if (!city || !isValid(city) || !isValidName(city))
        return res
          .status(400)
          .send({ status: false, message: "Please enter a valid city name" });

      if (!pincode || !isValidPin(pincode))
        return res
          .status(400)
          .send({ status: false, message: "Please enter a valid Pincode" });
    }

    let savedData = await userModel.create(data);
    return res.status(201).send({ status: true, message: "success", data:savedData });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

//===============================LOGIN USER===============================================

const login = async function (req, res) {
  try {
    let data = req.body;
    let { email, password } = data;

    if (!email || !password) {
      return res
        .status(400)
        .send({ status: false, message: "email and passwrod are required" });
    }

    if (!email || !isValidEmail(email)) {
      return res
        .status(400)
        .send({ status: false, message: "Email is required in a valid format" });
    }

    let loginUser = await userModel.findOne({ email: email });
    if (!loginUser) {
      return res
        .status(400)
        .send({ status: false, message: "You are not registered" });
    }

    if (password != loginUser.password)
      return res.status(400).send({
        status: false,
        message: "Incorrect password",
      });

    let token = jwt.sign(
      {
        userId: loginUser._id.toString(),
        userStatus: "active",
        app: "user of this book management system",
      },
      "i'm as calm as the sea",
      { expiresIn: "2Hr" }
    );
    return res.status(200).send({ status: true, data: {token:token} });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

module.exports.createUser = createUser;
module.exports.login = login;
