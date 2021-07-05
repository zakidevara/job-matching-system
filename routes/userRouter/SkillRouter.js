const express = require('express');
const SkillController = require('../../application/controllers/SkillController');
const UserController = require('../../application/controllers/UserController');
const Skill = require('../../model/Skill');
const router = express.Router();

// router.use(isUser);
// Authentication Routes
router.get('/', async function(req, res) {
    try{
        const skillController = new SkillController();
        let result = await skillController.getAll();

        res.status(200);
        res.send({
            message: "Berhasil",
            result
        });
    }catch(e){
        res.status(400);
        let {message} = e;
        res.send({message});
    }
});
router.post('/match', async function(req, res) {

    let {s1,s2} = req.body;
    try{
        let objSkill = new Skill(undefined, undefined, undefined);
        let skill1 = await objSkill.findById(s1);
        let skill2 = await objSkill.findById(s2);
        let result = await skill1.calculateSimilarity(skill2);
        res.send({
            message: "Berhasil",
            result
        });
    }catch(e){
        console.log(e);
        res.status(400);
        res.send(e);
    }
});

router.get('/:skillId', async function(req, res) {
    const {skillId} = req.params;
    try{
        const skillController = new SkillController();
        let result = await skillController.getByID(skillId);

        res.status(200);
        res.send({
            message: "Berhasil",
            result
        });
    }catch(e){
        res.status(400);
        let {message} = e;
        res.send({message});
    }
});
router.put('/:skillId', async function(req, res) {
    const {skillId} = req.params;
    const {name} = req.body;
    try{
        const skillController = new SkillController();
        let result = await skillController.update({id: skillId, name});

        res.status(200);
        res.send({
            message: "Berhasil",
            result
        });
    }catch(e){
        res.status(400);
        let {message} = e;
        res.send({message});
    }
});
router.delete('/:skillId', async function(req, res) {
    const {skillId} = req.params;
    try{
        const skillController = new SkillController();
        let result = await skillController.delete(skillId);

        res.status(200);
        res.send({
            message: "Berhasil",
            result
        });
    }catch(e){
        res.status(400);
        let {message} = e;
        res.send({message});
    }
});


module.exports = router;

