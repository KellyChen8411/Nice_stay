require("dotenv").config();
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const pug = require("pug");
const s3 = require("./S3");

const util = {};

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
  const payload = jwt.verify(token, `${process.env.JWTSECRET}`);
  let user_id = payload.id;
  let role = payload.role;
  let name = payload.name;

  let updateToken = JSON.parse(req.query.updateToken);

  if (updateToken === true) {
    //update token for user
    delete payload.iat;
    delete payload.exp;
    const new_token = jwt.sign(payload, process.env.JWTSECRET, {
      expiresIn: "180d",
    });
    return res.json({ new_token, user_id, role, name });
  } else {
    res.json({ user_id, role, name });
  }
};

util.checkLoginMiddleware = (req, res, next) => {
  try {
    let AuthorizationHeader = req.get("Authorization");
    const token = AuthorizationHeader.split(" ")[1];

    const payload = jwt.verify(token, `${process.env.JWTSECRET}`);
    req.user = payload;

    return next();
  } catch (err) {
    const error = Error("token過期,請重新登入");
    err.type = "tokenExpire";
    next(err);
  }
};

util.sendBookingEmail = async (renter_name, renter_email, bookingInfo) => {
  const {
    checkin_date,
    checkout_date,
    room_price,
    clean_fee,
    tax_fee,
    amount_fee,
  } = bookingInfo;

  let transporter = nodemailer.createTransport({
    service: "Gmail",
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      type: "OAuth2",
      user: process.env.ACCOUNT,
      clientId: process.env.CLINENTID,
      clientSecret: process.env.CLINENTSECRET,
      refreshToken: process.env.REFRESHTOKEN,
      accessToken: process.env.ACCESSTOKEN,
    },
  });

  let info = await transporter.sendMail({
    from: "kellychen841106@gmail.com", // sender address
    to: renter_email, // list of receivers
    subject: "Hello ✔", // Subject line
    text: "Hello world?", // plain text body
    html: pug.renderFile(`${process.cwd()}/views/booking.pug`, {
      name: renter_name,
      checkin_date,
      checkout_date,
      room_price,
      clean_fee,
      tax_fee,
      amount_fee,
    }), // html body
  });

  console.log("Message sent: %s", info.messageId);
};

util.uploadImageToS3 = async (files, imageFieldName) => {
  let fileExtend = files[imageFieldName][0].originalname.split(".")[1];
  let uploadPath;

  if (imageFieldName === "mainImg") {
    uploadPath = `Nice_stay/main/main_${Date.now()}.${fileExtend}`;
  } else if (imageFieldName === "sideImg1") {
    uploadPath = `Nice_stay/side_image/${Date.now()}_1.${fileExtend}`;
  } else if (imageFieldName === "sideImg2") {
    uploadPath = `Nice_stay/side_image/${Date.now()}_2.${fileExtend}`;
  }

  try {
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: uploadPath, // File name you want to save as in S3
      ContentType: files[imageFieldName][0].minetype,
      Body: files[imageFieldName][0].buffer,
    };

    const uploadedImage = await s3.upload(params).promise();
    const uploadFilename = uploadedImage.key;

    return uploadFilename;
  } catch (error) {
    error.type = "S3error";
    throw error;
  }
};

util.uploadImageToS3Multi = async (files, imageIndices) => {
  const imageUploadType = ["mainImg", "sideImg1", "sideImg2"];
  try {
    const uploadImagePromises = imageIndices.map(
      async (imageIndex) =>
        await util.uploadImageToS3(files, imageUploadType[imageIndex])
    );
    const newFileNames = await Promise.all(uploadImagePromises);
    return newFileNames;
  } catch (error) {
    error.type = "S3error";
    throw error;
  }
};

util.deleteImageFromS3 = async (image_path) => {
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: image_path, //if any sub folder-> path/of/the/folder.ext
  };

  try {
    await s3.headObject(params).promise();
    try {
      await s3.deleteObject(params).promise();
      console.log("delete image on S3");
    } catch (err) {
      console.log("There is error happened when delete image on S3");
      return;
    }
  } catch (err) {
    console.log("There is error happened when delete image on S3");
    return;
  }
};

util.deleteImageFromS3Multi = async (deleteImageList) => {
  console.log("enter deleteImageFromS3Multi");
  try {
    const deleteImagePromises = deleteImageList.map(
      async (deleteImagePath) => await util.deleteImageFromS3(deleteImagePath)
    );
    await Promise.all(deleteImagePromises);
    return;
  } catch (error) {
    console.log("There is error happened when delete image on S3");
    return;
  }
};

util.getImagePathOnS3 = (imageWholePath) => {
  return imageWholePath.slice(process.env.CLOUDFRONT_DOMAIN.length);
};

util.concateImageURL = () => {};

module.exports = util;
