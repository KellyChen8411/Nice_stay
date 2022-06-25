require("dotenv").config();
const userQuery = require("../models/user_model");
const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userSignUp = async (req, res) => {
  const { signup_name, signup_email, signup_password } = req.body;
  let userID;
  //validate user input
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array() });
  }

  //check if user exist
  const checkUser = await userQuery.checkUserExist(signup_email);
  if (checkUser.length == 0) {
    let salt = bcrypt.genSaltSync(10);
    let hashPassword = bcrypt.hashSync(signup_password, salt);
    console.log(hashPassword);
    const insertResult = await userQuery.createNativeUser([
      [signup_email, signup_name, hashPassword, 1, 1],
    ]);
    userID = insertResult.insertId;
  } else {
    const err = Error("使用者已存在");
    err.type = "userExist";
    throw err;
  }

  //generate token
  const userInfo = {
    id: userID,
    name: signup_name,
    email: signup_email,
    role: 1,
  };
  const token = jwt.sign(userInfo, process.env.JWTSECRET, {
    expiresIn: 60 * 60,
  });
  console.log(token);

  res.json({ token });
};

const userSignIn = async (req, res) => {
  const { signin_email, signin_password } = req.body;
  let userInfo;

  //validate user input
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array() });
  }
  //check if user exist
  const checkUser = await userQuery.checkUserExist(signin_email);
  if (checkUser.length === 0) {
    const err = Error("使用者不存在，請註冊");
    err.type = "userExist";
    throw err;
  } else {
    const userDataFromDB = checkUser[0];
    if (!bcrypt.compareSync(signin_password, userDataFromDB.password)) {
      const err = Error("密碼錯誤");
      err.type = "userExist";
      throw err;
    }
    userInfo = {
      id: userDataFromDB.id,
      name: userDataFromDB.name,
      email: userDataFromDB.email,
      role: userDataFromDB.user_role,
    };
    console.log(userInfo);
  }

  //generate token
  const token = jwt.sign(userInfo, process.env.JWTSECRET, {
    expiresIn: 60 * 60,
  });

  res.json({ token });
};

module.exports = {
  userSignUp,
  userSignIn,
};
