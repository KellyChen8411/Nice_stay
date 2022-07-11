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
    expiresIn: "180d",
  });

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
  }

  //generate token
  const token = jwt.sign(userInfo, process.env.JWTSECRET, {
    expiresIn: "180d",
  });

  res.json({ token });
};

const addBlackList = async (req, res) => {
  let blacklistInfo = req.body;
  await userQuery.addBlackList(blacklistInfo);
  res.json({ status: "succeed" });
};

const updateUserRole = async (req, res) => {
  const user_id = req.user.id;
  await userQuery.updateUserRole(user_id);
  //regenerate token
  delete req.user.iat;
  delete req.user.exp;
  req.user.role = 2;
  const new_token = jwt.sign(req.user, process.env.JWTSECRET, {
    expiresIn: "180d",
  });
  res.json({ new_token });
};

const checkUserBlacklist = async (req, res) => {
  const { landlord_id, renter_id } = req.query;
  const blacklistResult = await userQuery.checkUserBlacklist(landlord_id, renter_id);
  if(blacklistResult.length === 0){
    return res.json({inlist: false});
  }else{
    res.json({inlist: true});
  }
}

module.exports = {
  userSignUp,
  userSignIn,
  addBlackList,
  updateUserRole,
  checkUserBlacklist
};
