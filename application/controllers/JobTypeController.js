const JobType = require("../../model/JobType");
const ResourceController = require("./ResourceController");
const {v4: uuidv4 } = require('uuid');

class JobTypeController extends ResourceController{

    constructor(){
        super(JobType);
    }

    // Admin section
    async create(jobTypeData){
        let jobType = new JobType(uuidv4(), jobTypeData.name);
        try{
            let result = await jobType.save();
            if(result){
                return jobType.toObject();
            } else {
                throw new Error('Gagal membuat tipe pekerjaan');
            }
        } catch(e){
            throw e;
        }
    }

    async update(jobTypeId, updatedJobType){
        try{
            let jobType = await JobType.find(jobTypeId);
            if(jobType === null) throw new Error('Tipe pekerjaan tidak ditemukan');
    
            try{
                let resultUpdate = await jobType.update(updatedJobType);
                if(resultUpdate === null) throw new Error('Tipe pekerjaan gagal diperbarui');

                return resultUpdate.toObject();
            } catch(e){
                throw e;
            }
        } catch(e){
            throw e;
        }
    }

    async delete(jobTypeId){
        try{
            let jobType = await JobType.find(jobTypeId);
            if(jobType === null) throw new Error('Tipe pekerjaan tidak ditemukan');

            try{
                let result = await jobType.delete();
                return result;
            } catch(e){
                throw e;
            }
        } catch(e){
            throw e;
        }
    }

   
}

module.exports = JobTypeController;