require('dotenv').config();
const express = require('express');
const cors = require('cors')
const app = express();
const port = 3000;
const UserRoute = require('./routes/userRoute/UserRoute');
const bodyParser = require('body-parser');

app.use(cors())
app.use(bodyParser.urlencoded());
app.use(bodyParser.json());
app.use('/v1', UserRoute);

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});