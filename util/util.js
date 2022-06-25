const util = {};
const jwt = require("jsonwebtoken");

util.wrapAsync = (fn) => {
  return function (req, res, next) {
    // Make sure to `.catch()` any errors and pass them along to the `next()`
    // middleware in the chain, in this case the error handler.
    fn(req, res, next).catch(next);
  };
};

util.checkLogin = (req, res, next) => {
  let AuthorizationHeader = req.get("Authorization");
  const token = AuthorizationHeader.split(" ")[1];
  const payload = jwt.verify(token, `${process.env.jwtsecret}`);
  let { role } = payload;
  res.json({ role });
};

module.exports = util;
