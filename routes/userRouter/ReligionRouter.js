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

module.exports = router;