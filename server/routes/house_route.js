const router = require('express').Router();
const util = require('../../util/util');

const {
    createHouse,
    selectAllHouse,
    houseSearch,
    houseDatail,
    houseNearby
} = require('../controllers/house_controllers');

// router.route('/houses/create')
//     .get(util.wrapAsync(createHouse));

router.route('/houses/all')
    .get(util.wrapAsync(selectAllHouse));

router.route('/houses/search')
    .get(util.wrapAsync(houseSearch));

router.route('/houses/detail/:id')
    .get(util.wrapAsync(houseDatail));

router.route('/houses/nearby')
    .get(util.wrapAsync(houseNearby));

module.exports = router;