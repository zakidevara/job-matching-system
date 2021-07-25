const express = require('express');
const router = express.Router();


// Authentication Routes
router.get('/:filePath', async function(req, res) {
    let filePath = req.params.filePath;
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

