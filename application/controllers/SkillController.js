const ResourceController = require("./ResourceController");
const Skill = require("../../model/Skill");

class SkillController extends ResourceController {
    constructor(){
        super(Skill);
    }   

    async create(obj){
        return null;
    }
    async searchByName(name){

        try {
            let skillModel = new Skill();
            let results = await skillModel.find({name});
            return results.map((item) => item.toObject());
        } catch (error) {
            console.log(error);
            throw error;
        }
    }
}

module.exports = SkillController;