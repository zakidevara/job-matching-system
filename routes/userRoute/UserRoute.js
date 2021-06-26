const express = require('express');
const router = express.Router();

// Import controller
const UserController = require('../../application/controllers/UserController');
const JobController = require('../../application/controllers/JobController');
const SkillController = require('../../application/controllers/SkillController');

// User route
// Create new user
router.post('/user', async function(req, res) {
    let uC = new UserController('User');
    let newUser = await uC.create(req.body);
    res.send({ newUser });
});
// Get all user
router.get('/user', async function(req, res) {
    let uC = new UserController('User');
    let userList = await uC.all();
    res.send({ userList });
});

// Get user by ID
router.get('/user/:userID', async function(req, res) {
    let userID = req.params.userID;
    let uC = new UserController('User');
    let user = await uC.findByID(userID);
    res.send({ user });
});

// Update user data
router.put('/user/:userID', async function(req, res) {
    let userID = req.params.userID;
    let userData = req.body;
    let uC = new UserController('User');
    let result = await uC.updateData(userID, userData);
    if(result === null) {
        res.send({
            status: false,
            message: 'Gagal update'
        });
    } else {
        res.send({
            status: true,
            user: result,
            message: 'Berhasil update'
        });
    }
});

// Add new skill
router.post('/user/:userID/addSkill', async function(req, res) {
    let userID = req.params.userID;
    let skillList = req.body.skill_id;
    let uC = new UserController('User');
    let result = await uC.addSkill(userID, skillList);
    if(result === null){
        res.send({
            status: false,
            message: 'Gagal menambahkan skill'
        });
    } else {
        res.send({
            status: result.success.length > 0 ? true : false,
            skill: result.success,
            failedToAdd: result.failed
        });
    }
});

// Remove skill
router.post('/user/:userID/removeSkill', async function(req, res) {
    let userID = req.params.userID;
    let skillID = req.body.skill_id;
    let uC = new UserController('User');
    let result = await uC.removeSkill(userID, skillID);
    res.send({
        status: result
    });
});

// Get user skills
router.get('/user/:userID/skill', async function(req, res) {
    let userID = req.params.userID;
    let uC = new UserController('User');
    let userSkills = await uC.getUserSkills(userID);
    res.send({ userSkills });
});


// Recruiter Route
router.get('/applicant-recommendation', async function(req, res){
    let jobID = req.body.jobID;
    let result = await JobController.getApplicantRecommendation(jobID);
    res.send({
        status: 1,
        applicants: result
    });
});

// Job route
router.post('/jobs', async function(req, res) {
    let jobData = req.body;
    let jC = new JobController('Job');
    let result = await jC.create(jobData);
    res.send({ result });
});

router.get('/jobs', async function(req, res) {
    let jC = new JobController('Job');
    let result = await jC.all();
    res.send({ result });
});

router.get('/jobs/:jobID', async function(req, res) {
    let jC = new JobController('Job');
    let jobID = req.params.jobID;
    let result = await jC.find(jobID);
    res.send({ result });
});

router.delete('/jobs/:jobID', async function(req, res) {
    let jC = new JobController('Job');
    let jobID = req.params.jobID;
    let result = await jC.deleteJob(jobID);
    res.send({ result });
});

router.put('/jobs/:jobID', async function(req, res) {
    let jC = new JobController('Job');
    let jobID = req.params.jobID;
    let jobData = req.body;
    let result = await jC.update(jobID, jobData);
    res.send({ result });
});

router.post('/apply-job', async function(req, res){
    let userID = req.body.userID;
    let jobID = req.body.jobID;
    let result = await JobController.applyJob(jobID, userID);
    let message, status;
    if(result === 0){
        status = false;
        message = 'Gagal melamar'
    } else if(result === 2){
        status = false;
        message = 'Job tidak ditemukan';
    } else if(result === 3){
        status = false;
        message = 'User tidak ditemukan';
    } else if(result === 4){
        status = false;
        message = 'Job sudah tidak aktif';
    } else if(result === 5){
        status = false;
        message = 'User sudah pernah melamar ke lowongan pekerjaan yang dipilih';
    } else {
        status = true;
        message = 'Berhasil melamar'
    }

    res.send({
        status: status,
        message: message
    });
});
router.get('/job-recommendation', async function(req, res){
    let userID = req.body.userID;
    let limitJob = req.body.amount;
    let result = await JobController.getJobRecommendation(userID, limitJob);
    res.send({
        'result' : result
    });
});

// Skill route
router.get('/set-skillID', async function(req, res) {
    let sC = new SkillController('Skill');
    let result = await sC.setIDForNode();
    res.send({
        result
    });
});

module.exports = router;

