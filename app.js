require('dotenv').config();
const express = require('express');
const app = express();
const port = 3000;
const UserRoute = require('./routes/userRoute/UserRoute');
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded());
app.use(bodyParser.json());
app.use('/api/v1', UserRoute);

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});