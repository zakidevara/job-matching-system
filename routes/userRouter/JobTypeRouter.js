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

module.exports = router;