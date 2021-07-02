const Religion = require("../../model/Religion");
const ResourceController = require("./ResourceController");

class ReligionController extends ResourceController{
    constructor(){
        super(Religion);
    }
}

module.exports = ReligionController;