const ResourceController = require("./ResourceController");
const Skill = require("../../model/Skill");

class SkillController extends ResourceController {
    constructor(){
        super(Skill);
    }   

    async create(obj){
        return null;
    }
}

module.exports = SkillController;