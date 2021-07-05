const express = require('express');
const EducationController = require('../../application/controllers/EducationController');
const UserController = require('../../application/controllers/UserController');
const router = express.Router();

const isUser = require('../../middleware/isUser');

router.use(isUser);

router.get('/', async function(req, res) {
    try{
        const educationController = new EducationController();
        let userId = req.query.userId;
        let result = await educationController.all(userId);

        res.status(200);
        res.send({ result });
    } catch(e){
        res.status(400);
        let {message} = e;
        res.send({ message });
    }
});

router.post('/', async function(req, res) {
    const eduData = req.body;
    let userId = req.user.nim;
    eduData.userId = userId;
    try{
        const userController = new UserController();
        let result = await userController.addEducation(eduData);

        res.status(200);
        res.send({ result });
    } catch(e){
        res.status(400);
        let {message} = e;
        res.send({ message });
    }
});

router.get('/:educationId', async function(req, res) {
    const {educationId} = req.params;
    try{
        const educationController = new EducationController();
        let result = await educationController.find(educationId);

        res.status(200);
        res.send({ result });
    } catch(e){
        res.status(400);
        let {message} = e;
        res.send({ message });
    }
});

router.delete('/:educationId', async function(req, res) {
    const {educationId} = req.params;
    try{
        let userController = new UserController();
        let result = await userController.deleteEducation(educationId);

        res.status(200);
        res.send({ result });
    } catch(e){
        res.status(400);
        let {message} = e;
        res.send({ message });
    }
});

router.put('/:educationId', async function(req, res) {
    const {educationId} = req.params;
    const educationData = req.body;
    try{
        const userController = new UserController();
        let result = await userController.updateEducation(educationId, educationData);

        res.status(200);
        res.send({ result });
    } catch(e){
        res.status(400);
        let {message} = e;
        res.send({ message });
    } 
});

module.exports = router;
