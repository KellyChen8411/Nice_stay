const amenityQuery = require('../models/amenity_model');

const selectAllAmenity = async (req, res) => {
    const amenities = await amenityQuery.getAmenity();
    res.json(amenities);
}

module.exports = {
    selectAllAmenity
}