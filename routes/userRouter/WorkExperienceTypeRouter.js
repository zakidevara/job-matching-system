const express = require('express');
const WorkExperienceTypeController = require('../../application/controllers/WorkExperienceTypeController');
const router = express.Router();

router.get('/', async function(req, res) {
    try{
        const workExpTypeController = new WorkExperienceTypeController();
        let result = await workExpTypeController.getAll();

        res.status(200);
        res.send({
            message: "Berhasil",
            result
        });
    } catch(e){
        res.status(400);
        let {message} = e;
        res.send({message});
    }
});

// Admin section
router.post('/', async function(req, res) {
    const data = req.body;
    try{
        const workExpTypeController = new WorkExperienceTypeController();
        let result = await workExpTypeController.create(data);

        res.status(200);
        res.send({ result });
    } catch(e){
        res.status(400);
        let {message} = e;
        res.send({message});
    }
});

router.get('/:workExperienceTypeId', async function(req, res) {
    const {workExperienceTypeId} = req.params;
    try{
        const workExpTypeController = new WorkExperienceTypeController();
        let result = await workExpTypeController.getByID(workExperienceTypeId);

        res.status(200);
        res.send({
            message: "Berhasil",
            result
        });
    } catch(e){
        res.status(400);
        let {message} = e;
        res.send({message});
    }
});

// Admin section
router.put('/:workExperienceTypeId', async function(req, res) {
    const {workExperienceTypeId} = req.params;
    let data = req.body;
    data.id = workExperienceTypeId;
    try{
        const workExpTypeController = new WorkExperienceTypeController();
        let result = await workExpTypeController.update(data);

        res.status(200);
        res.send({ result });
    } catch(e){
        res.status(400);
        let {message} = e;
        res.send({message});
    }
});

router.delete('/:workExperienceTypeId', async function(req, res) {
    const {workExperienceTypeId} = req.params;
    try{
        const workExpTypeController = new WorkExperienceTypeController();
        let result = await workExpTypeController.delete(workExperienceTypeId);

        res.status(200);
        res.send({ result });
    } catch(e){
        res.status(400);
        let {message} = e;
        res.send({message});
    }
});

module.exports = router;