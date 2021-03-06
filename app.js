const dotenv = require('dotenv');
const express = require('express');
const cors = require('cors')
const app = express();
const port = 3000;
const fileUpload = require('express-fileupload');
const UserRouter = require('./routes/userRouter/UserRouter');
const SkillRouter = require('./routes/userRouter/SkillRouter');
const AuthRouter = require('./routes/publicRouter/AuthRouter');
const FileRouter = require('./routes/publicRouter/FileRouter');
const JobRouter = require('./routes/userRouter/JobRouter');
const JobTypeRouter = require('./routes/userRouter/JobTypeRouter');
const DegreeRouter = require('./routes/userRouter/DegreeRouter');
const ReligionRouter = require('./routes/userRouter/ReligionRouter');
const WorkExperienceTypeRouter = require('./routes/userRouter/WorkExperienceTypeRouter');
const WorkExperienceRouter = require('./routes/userRouter/WorkExperienceRouter');
const EducationRouter = require('./routes/userRouter/EducationRouter');
const bodyParser = require('body-parser');
const logger = require('./utils/logger');
const morgan = require('morgan');
const baseUrl = '/v1';

dotenv.config();
app.use(cors());
app.use(logger());
app.use(morgan('myformat'));
app.use(fileUpload({createParentPath: true}));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(`${baseUrl}/auth`, AuthRouter);
app.use(`${baseUrl}/file`, FileRouter);
app.use(`${baseUrl}/jobs`, JobRouter);
app.use(`${baseUrl}/job-type`, JobTypeRouter);
app.use(`${baseUrl}/degrees`, DegreeRouter);
app.use(`${baseUrl}/religions`, ReligionRouter);
app.use(`${baseUrl}/skills`, SkillRouter);
app.use(`${baseUrl}/work-experience-type`, WorkExperienceTypeRouter);
app.use(`${baseUrl}/work-experience`, WorkExperienceRouter);
app.use(`${baseUrl}/educations`, EducationRouter);
app.use(baseUrl, UserRouter);


app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});