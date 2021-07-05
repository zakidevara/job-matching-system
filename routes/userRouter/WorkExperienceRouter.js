const express = require('express');
const WorkExperienceController = require('../../application/controllers/WorkExperienceController');
const UserController = require('../../application/controllers/UserController');
const isUser = require('../../middleware/isUser');
const router = express.Router();

router.use(isUser);
router.get('/', async function(req, res) {
    try{
        const workExpController = new WorkExperienceController();
        let userId = !req.params ? undefined : req.params.userId;
        let result = await workExpController.getAll(userId);

        res.status(200);
        res.send({ result });
    } catch(e){
        res.status(400);
        let {message} = e;
        res.send({ message });
    }
});

router.post('/', async function(req, res) {
    let workExpData = req.body;
    let userId = req.user.nim;
    workExpData.workExperienceType = {
        id: workExpData.workExperienceTypeId,
    };
    try{
        const userController = new UserController();
        let result = await userController.addWorkExperience(workExpData, userId);

        res.status(200);
        res.send({ result });
    } catch(e){
        res.status(400);
        let {message} = e;
        res.send({ message });
    }
});

router.get('/:workExperienceId', async function(req, res) {
    const {workExperienceId} = req.params;
    try{
        const workExpController = new WorkExperienceController();
        let result = await workExpController.getByID(workExperienceId);

        res.status(200);
        res.send({ result });
    } catch(e){
        res.status(400);
        let {message} = e;
        res.send({ message });
    }
});

router.delete('/:workExperienceId', async function(req, res) {
    const {workExperienceId} = req.params;
    try{
        let workExpController = new WorkExperienceController();
        let result = await workExpController.delete(workExperienceId);

        res.status(200);
        res.send({ result });
    } catch(e){
        res.status(400);
        let {message} = e;
        res.send({ message });
    }
});

router.put('/:workExperienceId', async function(req, res) {
    const {workExperienceId} = req.params;
    let workExpData = req.body;
    workExpData.id = workExperienceId;
    
    workExpData.workExperienceType = {
        id: workExpData.workExperienceTypeId,
    };
    try{
        
        let workExpController = new WorkExperienceController();
        let result = await workExpController.update(workExpData);

        res.status(200);
        res.send({ result });
    } catch(e){
        res.status(400);
        let {message} = e;
        res.send({ message });
    } 
});

module.exports = router;