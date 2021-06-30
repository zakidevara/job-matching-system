const dotenv = require('dotenv');
const express = require('express');
const cors = require('cors')
const app = express();
const port = 3000;
const UserRouter = require('./routes/userRouter/UserRouter');
const SkillRouter = require('./routes/userRouter/SkillRouter');
const AuthRouter = require('./routes/publicRouter/AuthRouter');
const bodyParser = require('body-parser');
const baseUrl = '/v1';

dotenv.config();
app.use(cors())
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(`${baseUrl}/auth`, AuthRouter);
app.use(`${baseUrl}/skills`, SkillRouter);
app.use(baseUrl, UserRouter);


app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});