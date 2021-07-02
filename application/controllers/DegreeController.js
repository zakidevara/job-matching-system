const Degree = require("../../model/Degree");
const ResourceController = require("./ResourceController");

class DegreeController extends ResourceController{
    constructor(){
        super(Degree);
    }
}

module.exports = DegreeController;