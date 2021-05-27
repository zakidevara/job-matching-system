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

module.exports = router;

