const Education = require('../../model/Education');
const ResourceController = require('./ResourceController');
const Validator = require('validatorjs');

class EducationController extends ResourceController{
    constructor(){
        super(Education);
    }

    validate(eduData){
        let rules = {
            educationId: 'required|string',
            nim: 'required|string',
            schoolName: 'required|string',
            degreeId: 'required|string',
            fieldOfStudy: 'string',
            startYear: 'required|integer',
            endYear: 'integer'
        };
        let validator = new Validator(eduData, rules);
        if(validator.passes()){
            return true;
        } else {
            return validator.errors;
        }
    }

    async all(userId){
        try{
            let eduModel = new Education();
            let eduList = await eduModel.all(userId);
            eduList.forEach((item, index, array) => {
                let value = item.toObject();
                array[index] = value;
            });
            return eduList;
        } catch(e){
            throw e;
        }
    }

    async find(educationId){
        try{
            let eduModel = new Education();
            let result = await eduModel.findById(educationId);
            if(result === null) throw new Error('Data pendidikan tidak ditemukan');

            return result.toObject();
        } catch(e){
            throw e;
        }
    }
}

module.exports = EducationController;