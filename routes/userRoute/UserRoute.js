const express = require('express');
const router = express.Router();

// Import controller
const userController = require('../../controllers/resources/UserController');
const jobController = require('../../controllers/resources/JobController');
const skillController = require('../../controllers/resources/SkillController');

// User route
router.post('/add-new-skill', function(req, res) {
    let uC = new userController('User');
    let skill = req.body.skill;
    let userID = req.body.userID;
    uC.addSkill(skill, userID);
});
router.get('/applicant-recommendation', async function(req, res){
    let jobID = req.body.jobID;
    let result = await jobController.getApplicantRecommendation(jobID);
    res.send({
        status: 1,
        applicants: result
    });
});

// Job route
router.post('/apply-job', async function(req, res){
    let userID = req.body.userID;
    let jobID = req.body.jobID;
    let result = await jobController.applyJob(jobID, userID);
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
    let result = await jobController.getJobRecommendation(userID, limitJob);
    res.send({
        'result' : result
    });
});

module.exports = router;

