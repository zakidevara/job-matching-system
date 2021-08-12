const WorkExperience = require("../../model/WorkExperience");
const ResourceController = require("./ResourceController");
const Validator = require('validatorjs');
class WorkExperienceController extends ResourceController{

    constructor(){
        super(WorkExperience);
    }

    validate(workExpData){
        let rules = {
            title: 'required|string',
            companyName: 'required|string',
            workExperienceType: {
                name: 'required|string'
            },
            startDate: 'required|date',
            endDate: 'after:startDate|date'
        };
        let validator = new Validator(workExpData, rules);
        if(validator.passes()){
            return true;
        } else {
            return validator.errors;
        }
    }

    async create(obj){
        let validInput = this.validate(obj);
        if(validInput !== true){
            return validInput;
        }

        return await super.create(obj);
    }
    async update(obj){
        let validInput = this.validate(obj);
        if(validInput !== true){
            return validInput;
        }

        return await super.update(obj);
    }

    
}

module.exports = WorkExperienceController;