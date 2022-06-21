require('dotenv').config();
const express = require('express');
const app = express();


app.use(express.static('public'));

// API routes
app.use('/api/' + process.env.API_VERSION, [
    require('./server/routes/house_route'),
    require('./server/routes/city_route')
]);

app.listen(3000, async () => {
    console.log('Application is now running')
})

// https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=25.041038%2C121.551513&radius=1000&type=restaurant&key=${process.env.GOOGLEAPI_KEY}