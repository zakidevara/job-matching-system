const express = require('express');
const router = express.Router();

// Import controller
const AuthController = require('../../application/controllers/AuthController');

// Authentication Routes
router.post('/login', async function(req, res) {
    const {email, password} = req.body;
    try{
        const authController = new AuthController();
        let result = await authController.login(email, password);

        res.status(200);
        res.send({
            message: "Login berhasil",
            result
        });
    }catch(e){
        res.status(400);
        let {message} = e;
        res.send({message});
    }
});

router.post('/register', async function(req, res) {

    const {nim, email, password} = req.body;
    try{
        const authController = new AuthController();
        let result = await authController.register(nim, email, password);

        res.status(200);
        res.send({
            message: "Registrasi akun berhasil",
            result
        });
    }catch(e){
        res.status(400);
        let {message} = e;
        res.send({message});
    }
});
router.post('/validateEmail', async function(req, res) {

    const {email, code} = req.body;
    try{
        const authController = new AuthController();
        let result = await authController.validateEmail(email, code);

        res.status(200);
        res.send({
            message: "Verifikasi email berhasil",
            result
        });
    }catch(e){
        res.status(400);
        let {message} = e;
        res.send({message});
    }
});


module.exports = router;

