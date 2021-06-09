const express = require('express');
const JobController = require('../../controllers/resources/JobController');
const router = express.Router();

// Import controller
const skillController = require('../../controllers/resources/SkillController');
const UserController = require('../../controllers/resources/UserController');

// User route
// router.post('/add-new-skill', function(req, res) {
//     let uC = new userController('User');
//     let skill = req.body.skill;
//     let userID = req.body.userID;
//     uC.addSkill(skill, userID);
// });

// Get all user
router.get('/user', async function(req, res) {
    let userList = await UserController.all();
    res.send({ userList });
});

// Get user by ID
router.get('/user/:userID', async function(req, res) {
    let userID = req.params.userID;
    let user = await UserController.findByID(userID);
    res.send({ user });
});

router.get('/applicant-recommendation', async function(req, res){
    let jobID = req.body.jobID;
    let result = await JobController.getApplicantRecommendation(jobID);
    res.send({
        status: 1,
        applicants: result
    });
});

// Job route
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

module.exports = router;

