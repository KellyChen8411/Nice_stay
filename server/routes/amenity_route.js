const router = require('express').Router();
const util = require('../../util/util');

const {
    selectAllAmenity
} = require('../controllers/amenity_controller');

router.route('/amenities/all')
    .get(util.wrapAsync(selectAllAmenity));

module.exports = router;