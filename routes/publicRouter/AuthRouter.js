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

        // gagal validasi data
        if(result.status !== undefined && result.status === 2){
            res.status(400);
            res.send(result.err);
            return;
        }

        if(result.photo === ""){
            delete result['photo'];
        }else{
            result.photo = `${process.env.APP_URL}/v1/file?filePath=` + result.photo.replace('.', '');  
        }
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

        // gagal validasi data
        if(result.status !== undefined && result.status === 2){
            res.status(400);
            res.send(result.err);
            return;
        }

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

        // gagal validasi data
        if(result.status !== undefined && result.status === 2){
            res.status(400);
            res.send(result.err);
            return;
        }

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

// Create new user
router.post('/users', async function(req, res) {
    let uC = new UserController();
    let userData = req.body;
    
    let userPhoto = null;
    if(req.files){
        userPhoto = req.files.photo;
    }
    userData.photo = userPhoto;
    try{
        let newUser = await uC.create(userData);

        res.status(200);
        res.send({ newUser });
    } catch(e){
        res.status(400);
        let {message} = e;
        res.send({message});
    }
});


module.exports = router;

