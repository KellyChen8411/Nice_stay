const app = require("../app");
const chai = require("chai");
const deepEqualInAnyOrder = require("deep-equal-in-any-order");
const chaiHttp = require("chai-http");
const { NODE_ENV } = process.env;
const { truncateData, insertFakeDate } = require("./fakedataFunction");

//inport fake data
const fakeDatas = require("./fakedata");

chai.use(chaiHttp);
chai.use(deepEqualInAnyOrder);
const expect = chai.expect;
const requester = chai.request(app).keepOpen();

before(async function () {
  if (NODE_ENV === "test") {
    console.time("truncate");
    await truncateData();
    console.timeEnd("truncate");
    await insertFakeDate(fakeDatas);
  }
});

module.exports = {
  expect,
  requester,
};
