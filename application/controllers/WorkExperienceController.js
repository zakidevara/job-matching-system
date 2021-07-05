const WorkExperience = require("../../model/WorkExperience");
const ResourceController = require("./ResourceController");

class WorkExperienceController extends ResourceController{

    constructor(){
        super(WorkExperience);
    }

    
}

module.exports = WorkExperienceController;