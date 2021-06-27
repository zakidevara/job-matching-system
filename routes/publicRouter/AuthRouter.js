const express = require('express');
const router = express.Router();

// Import controller
const AuthController = require('../../application/controllers/AuthController');

// Authentication Routes
router.post('/login', async function(req, res) {
    const {email, password} = req.body;
    try{
        let result = await AuthController.login(email, password);

        res.status(200);
        res.send({
            result
        });
    }catch(e){
        console.log(e);
        res.status(400);
        res.send(e);
    }
});

router.post('/register', async function(req, res) {

    const {email, password} = req.body;
    try{
        let result = await AuthController.register(email, password);

        res.status(200);
        res.send({
            result
        });
    }catch(e){
        console.log(e);
        res.status(400);
        res.send(e);
    }
});


module.exports = router;

