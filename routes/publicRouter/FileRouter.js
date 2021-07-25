const express = require('express');
const router = express.Router();
const path = require('path');


// Authentication Routes
router.get('/', async function(req, res) {
    let filePath = req.query.filePath;
    try{

        res.status(200);
        
        res.sendFile(path.join(__dirname, '../../' , filePath), (err) => console.log(err));    
    }catch(e){
        res.status(400);
        let {message} = e;
        res.send({message});
    }
});

module.exports = router;

