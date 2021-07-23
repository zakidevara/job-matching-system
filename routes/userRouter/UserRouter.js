const express = require('express');
const router = express.Router();
const isUser = require('../../middleware/isUser');

// Import controller
const UserController = require('../../application/controllers/UserController');
const SkillController = require('../../application/controllers/SkillController');



router.use(isUser);
// User route
// Create new user
router.post('/users', async function(req, res) {
    let uC = new UserController();
    let userData = req.body;
    let userPhoto = req.files.photo;
    userData.photo = userPhoto;
    try{
        let newUser = await uC.create(userData);

        res.status(200);
        res.send({ newUser });
    } catch(e){
        res.status(400);
        res.send(e);
    }
});
// Get all user
router.get('/users',  async function(req, res) {
    let uC = new UserController();
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
    let uC = new UserController();

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
    let uC = new UserController();
    let userPhoto = req.files.photo;
    userData.photo = userPhoto;
    try{
        let result = await uC.update(userId, userData);
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
    let skillList = req.body.skillId;
    let uC = new UserController();

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
    let uC = new UserController();

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
    let uC = new UserController();

    try{
        let userSkills = await uC.getUserSkills(userId);
        res.send({ userSkills });
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

