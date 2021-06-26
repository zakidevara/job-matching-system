const express = require('express');
const router = express.Router();

// Import controller
const UserController = require('../../application/controllers/UserController');
const JobController = require('../../application/controllers/JobController');
const SkillController = require('../../application/controllers/SkillController');

// User route
// Create new user
router.post('/users', async function(req, res) {
    let uC = new UserController('User');
    let newUser = await uC.create(req.body);
    res.send({ newUser });
});
// Get all user
router.get('/users', async function(req, res) {
    let uC = new UserController('User');
    try{
        let userList = await uC.all();
        res.send({ userList });
    }catch(e){
        res.status(400);
        res.send(e);
    }
});

// Get user by ID
router.get('/users/:userId', async function(req, res) {
    let userId = req.params.userId;
    let uC = new UserController('User');

    try{
        let user = await uC.findByID(userId);
        res.send({ user });        
    }catch(e){
        res.status(400);
        res.send(e);
    }
});

// Update user data
router.put('/users/:userId', async function(req, res) {
    let userId = req.params.userId;
    let userData = req.body;
    let uC = new UserController('User');

    try{
        let result = await uC.updateData(userId, userData);
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
    }catch(e){
        res.status(400);
        res.send(e);
    }
});

// Add new skill
router.post('/users/:userId/skills/add', async function(req, res) {
    let userId = req.params.userId;
    let skillList = req.body.skill_id;
    let uC = new UserController('User');

    try{
        let result = await uC.addSkill(userId, skillList);
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
    }catch(e){
        res.status(400);
        res.send(e);
    }
});

// Remove skill
router.post('/users/:userId/skills/remove', async function(req, res) {
    let userId = req.params.userId;
    let skillID = req.body.skill_id;
    let uC = new UserController('User');

    try{
        let result = await uC.removeSkill(userId, skillID);
        res.send({
            status: result
        });
    }catch(e){
        res.status(400);
        res.send(e);
    }
});

// Get user skills
router.get('/users/:userId/skills', async function(req, res) {
    let userId = req.params.userId;
    let uC = new UserController('User');

    try{
        let userSkills = await uC.getUserSkills(userId);
        res.send({ userSkills });
    }catch(e){
        res.status(400);
        res.send(e);
    }
});


// Recruiter Route
router.get('/applicant-recommendation', async function(req, res){
    let jobID = req.body.jobID;
    try{
        let result = await JobController.getApplicantRecommendation(jobID);
        res.send({
            status: 1,
            applicants: result
        });
    }catch(e){
        res.status(400);
        res.send(e);
    }
});

// Job route
router.post('/jobs', async function(req, res) {
    let jobData = req.body;
    let jC = new JobController('Job');

    try{
        let result = await jC.create(jobData);
        res.send({ result });
    }catch(e){
        res.status(400);
        res.send(e);
    }
});

router.get('/jobs', async function(req, res) {
    let jC = new JobController('Job');

    try{
        let result = await jC.all();
        res.send({ result });
    }catch(e){
        res.status(400);
        res.send(e);
    }
});

router.get('/jobs/:jobID', async function(req, res) {
    let jC = new JobController('Job');
    let jobID = req.params.jobID;
    try{
        let result = await jC.find(jobID);
        res.send({ result });
    }catch(e){
        res.status(400);
        res.send(e);
    }
});

router.delete('/jobs/:jobID', async function(req, res) {
    let jC = new JobController('Job');
    let jobID = req.params.jobID;

    try{
        let result = await jC.deleteJob(jobID);
        res.send({ result });
    }catch(e){
        res.status(400);
        res.send(e);
    }
});

router.put('/jobs/:jobID', async function(req, res) {
    let jC = new JobController('Job');
    let jobID = req.params.jobID;
    let jobData = req.body;

    try{
        let result = await jC.update(jobID, jobData);
        res.send({ result });
    }catch(e){
        res.status(400);
        res.send(e);
    }
});

router.post('/apply-job', async function(req, res){
    let userId = req.body.userId;
    let jobID = req.body.jobID;

    try{
        let result = await JobController.applyJob(jobID, userId);
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
    }catch(e){
        res.status(400);
        res.send(e);
    }
});
router.get('/job-recommendation', async function(req, res){
    let userId = req.body.userId;
    let limitJob = req.body.amount;

    try{
        let result = await JobController.getJobRecommendation(userId, limitJob);
        res.send({
            'result' : result
        });
    }catch(e){
        res.status(400);
        res.send(e);
    }
});

// Skill route
router.get('/set-skillID', async function(req, res) {
    let sC = new SkillController('Skill');

    try{
        let result = await sC.setIDForNode();
        res.send({
            result
        });
    }catch(e){
        res.status(400);
        res.send(e);
    }
});

module.exports = router;

