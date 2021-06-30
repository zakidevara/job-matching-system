const ResourceController = require("./ResourceController");
const Skill = require("../../model/Skill");

class SkillController extends ResourceController {
    constructor(){
        super(Skill);
    }   

}

module.exports = SkillController;