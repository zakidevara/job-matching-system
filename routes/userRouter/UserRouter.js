const express = require('express');
const router = express.Router();
const isUser = require('../../middleware/isUser');

const path = require('path');
// Import controller
const UserController = require('../../application/controllers/UserController');
const SkillController = require('../../application/controllers/SkillController');
const { env } = require('process');



router.use(isUser);
// User route
// Get all user
router.get('/users',  async function(req, res) {
    let uC = new UserController();
    try{
        let userList = await uC.all();
        userList = userList.map(user => {
            if(user.photo === ""){
                delete user['photo'];
            }else{
                user.photo = `${process.env.APP_URL}/v1/file?filePath=` + user.photo.replace('.', '');  
            }
            return user;
        })
        res.send({ userList });
    }catch(e){
        res.status(400);
        let {message} = e;
        res.send({message});
    }
});

// Get user by ID
router.get('/users/:userId', async function(req, res) {
    let userId = req.params.userId;
    let uC = new UserController();

    try{
        let user = await uC.findByID(userId);  
        if(user.photo === ""){
            delete user['photo'];
        }else{
            user.photo = `${env.APP_URL}/v1/file?filePath=` + user.photo.replace('.', '');  
        }
        res.send({ user });
    }catch(e){
        res.status(400);
        let {message} = e;
        res.send({message});
    }
});

//delete user
router.delete('/users/:userId', async function(req, res) {
    const {userId} = req.params;
    try{
        let userController = new UserController();
        let result = await userController.delete(userId);

        res.status(200);
        res.send({ result });
    } catch(e){
        res.status(400);
        let {message} = e;
        res.send({ message });
    }
});

// Update user data
router.put('/users/:userId', async function(req, res) {
    let userId = req.params.userId;
    let userData = req.body;
    let uC = new UserController();
    
    let userPhoto = null;
    if(req.files){
        userPhoto = req.files.photo;
    }
    userData.photo = userPhoto;
    try{
        let result = await uC.update(userId, userData);
        if(typeof result === Error){
            res.status(400);
            res.send({ result });
        } else if(result.status === 2){
            res.status(400);
            res.send(result.err);
        } else if(result === null){
            res.status(400);
            res.send({ message: 'Gagal update'  });
        } else {
            res.status(200);
            res.send({
                user: result,
                message: 'Berhasil update'
            });
        }
    }catch(e){
        res.status(400);
        let {message} = e;
        res.send({message});
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
        let {message} = e;
        res.send({message});
    }
});

// Remove skill
router.post('/users/:userId/skills/remove', async function(req, res) {
    let userId = req.params.userId;
    let skillID = req.body.skillId;
    let uC = new UserController();

    try{
        let result = await uC.removeSkill(userId, skillID);
        res.send({
            status: result
        });
    }catch(e){
        res.status(400);
        let {message} = e;
        res.send({message});
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
        let {message} = e;
        res.send({message});
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
        let {message} = e;
        res.send({message});
    }
});



module.exports = router;

