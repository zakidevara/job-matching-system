const express = require('express');
const router = express.Router();

const JobTypeController = require('../../application/controllers/JobTypeController');

// JobType Route
router.get('/', async function(req, res) {
    try{
        const jobTypeController = new JobTypeController();
        let result = await jobTypeController.getAll();
        
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

// Admin
router.post('/', async function(req, res) {
    const jobTypeData = req.body;
    try{
        const jobTypeController = new JobTypeController();
        let result = await jobTypeController.create(jobTypeData);

        res.status(400);
        res.send({ result });
    } catch(e){
        res.status(400);
        let {message} = e;
        res.send({message});
    }
});

// User
router.get('/:jobTypeId', async function(req, res) {
    const {jobTypeId} = req.params;
    try{
        const jobTypeController = new JobTypeController();
        let result = await jobTypeController.getByID(jobTypeId);

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

// Admin
router.put('/:jobTypeId', async function(req, res) {
    const {jobTypeId} = req.params;
    const jobTypeData = req.body;
    try{
        const jobTypeController = new JobTypeController();
        let result = await jobTypeController.update(jobTypeId, jobTypeData);

        res.status(200);
        res.send({ result });
    } catch(e){
        res.status(400);
        let {message} = e;
        res.send({message});
    }
});

router.get('/:jobTypeId', async function(req, res) {
    const {jobTypeId} = req.params;
    try{
        const jobTypeController = new JobTypeController();
        let result = await jobTypeController.delete(jobTypeId);

        res.status(200);
        res.send({ result });
    } catch(e){
        res.status(400);
        let {message} = e;
        res.send({message});
    }
});

module.exports = router;