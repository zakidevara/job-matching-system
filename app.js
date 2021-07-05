const dotenv = require('dotenv');
const express = require('express');
const cors = require('cors')
const app = express();
const port = 3000;
const UserRouter = require('./routes/userRouter/UserRouter');
const SkillRouter = require('./routes/userRouter/SkillRouter');
const AuthRouter = require('./routes/publicRouter/AuthRouter');
const JobRouter = require('./routes/userRouter/JobRouter');
const JobTypeRouter = require('./routes/userRouter/JobTypeRouter');
const DegreeRouter = require('./routes/userRouter/DegreeRouter');
const ReligionRouter = require('./routes/userRouter/ReligionRouter');
const EducationRouter = require('./routes/userRouter/EducationRouter');
const bodyParser = require('body-parser');
const baseUrl = '/v1';

dotenv.config();
app.use(cors())
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(`${baseUrl}/jobs`, JobRouter);
app.use(`${baseUrl}/job-type`, JobTypeRouter);
app.use(`${baseUrl}/degrees`, DegreeRouter);
app.use(`${baseUrl}/religions`, ReligionRouter);
app.use(`${baseUrl}/auth`, AuthRouter);
app.use(`${baseUrl}/skills`, SkillRouter);
app.use(`${baseUrl}/educations`, EducationRouter);
app.use(baseUrl, UserRouter);


app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});