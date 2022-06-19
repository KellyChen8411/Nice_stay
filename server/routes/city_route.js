const router = require('express').Router();
const util = require('../../util/util');

const {
    selectAllCity
} = require('../controllers/city_controller');

router.route('/citys/all')
    .get(util.wrapAsync(selectAllCity));

module.exports = router;