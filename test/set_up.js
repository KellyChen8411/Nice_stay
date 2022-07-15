const app = require('../app');
const chai = require('chai');
const deepEqualInAnyOrder = require('deep-equal-in-any-order');
const chaiHttp = require('chai-http');
const {NODE_ENV} = process.env;

chai.use(chaiHttp);
chai.use(deepEqualInAnyOrder);
const expect = chai.expect;
const requester = chai.request(app).keepOpen();

module.exports = {
    expect,
    requester,
};