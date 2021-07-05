const WorkExperienceType = require("../../model/WorkExperienceType");
const ResourceController = require("./ResourceController");

class WorkExperienceTypeController extends ResourceController{

    constructor(){
        super(WorkExperienceType);
    }

    
}

module.exports = WorkExperienceTypeController;