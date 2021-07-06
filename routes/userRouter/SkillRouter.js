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
router.get('/match', async function(req, res) {

    let {skill1,skill2} = req.query;
    try{
        let objSkill = new Skill(undefined, undefined, undefined);
        let s1 = await objSkill.findById(skill1);
        let s2 = await objSkill.findById(skill2);
        if(s1 == null) throw new Error(`Skill dengan id <${skill1}> tidak ditemukan`);
        if(s2 == null) throw new Error(`Skill dengan id <${skill2}> tidak ditemukan`);
        let result = await s1.calculateSimilarity(s2);
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
router.get('/search', async function(req, res) {
    let skillQuery = req.query.skillQuery;
    console.log(skillQuery);
    try{
        const skillController = new SkillController();
        let result = await skillController.searchByName(skillQuery);
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

