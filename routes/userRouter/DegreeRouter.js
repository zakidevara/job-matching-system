const express = require('express');
const DegreeController = require('../../application/controllers/DegreeController');
const router = express.Router();

router.get('/', async function(req, res) {
    try{
        const degreeController = new DegreeController();
        let result = await degreeController.getAll();

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
    const degreeData = req.body;
    try{
        const degreeController = new DegreeController();
        let result = await degreeController.create(degreeData);

        res.status(200);
        res.send({ result });
    } catch(e){
        res.status(400);
        let {message} = e;
        res.send({message});
    }
});

router.get('/:degreeId', async function(req, res) {
    const {degreeId} = req.params;
    try{
        const degreeController = new DegreeController();
        let result = await degreeController.getByID(degreeId);

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
router.put('/:degreeId', async function(req, res) {
    const {degreeId} = req.params;
    const degreeData = req.body;
    try{
        const degreeController = new DegreeController();
        let result = await degreeController.update(degreeId, degreeData);

        res.status(200);
        res.send({ result });
    } catch(e){
        res.status(400);
        let {message} = e;
        res.send({message});
    }
});

router.delete('/:degreeId', async function(req, res) {
    const {degreeId} = req.params;
    try{
        const degreeController = new DegreeController();
        let result = await degreeController.delete(degreeId);

        res.status(200);
        res.send({ result });
    } catch(e){
        res.status(400);
        let {message} = e;
        res.send({message});
    }
});

module.exports = router;