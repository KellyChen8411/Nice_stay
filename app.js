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