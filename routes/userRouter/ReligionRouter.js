const express = require('express');
const ReligionController = require('../../application/controllers/ReligionController');
const router = express.Router();

router.get('/', async function(req, res) {
    try{
        const religionController = new ReligionController();
        let result = await religionController.getAll();

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
    const religionData = req.body;
    try{
        const religionController = new ReligionController();
        let result = await religionController.create(religionData);

        res.status(200);
        res.send({ result });
    } catch(e){
        res.status(400);
        let {message} = e;
        res.send({message});
    }
});

router.get('/:religionId', async function(req, res) {
    const {religionId} = req.params;
    try{
        const religionController = new ReligionController();
        let result = await religionController.getByID(religionId);

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
router.put('/:religionId', async function(req, res) {
    const {religionId} = req.params;
    const religionData = req.body;
    try{
        const religionController = new ReligionController();
        let result = await religionController.update(religionId, religionData);

        res.status(200);
        res.send({ result });
    } catch(e){
        res.status(400);
        let {message} = e;
        res.send({message});
    }
});

router.delete('/:religionId', async function(req, res) {
    const {religionId} = req.params;
    try{
        const religionController = new ReligionController();
        let result = await religionController.delete(religionId);

        res.status(200);
        res.send({ result });
    } catch(e){
        res.status(400);
        let {message} = e;
        res.send({message});
    }
});

module.exports = router;