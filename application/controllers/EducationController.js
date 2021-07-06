const Education = require('../../model/Education');
const ResourceController = require('./ResourceController');

class EducationController extends ResourceController{
    constructor(){
        super(Education);
    }

    async all(userId){
        try{
            let eduModel = new Education();
            let eduList = await eduModel.getEdu(userId);
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