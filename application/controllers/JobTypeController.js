const JobType = require("../../model/JobType");
const ResourceController = require("./ResourceController");

class JobTypeController extends ResourceController{

    constructor(){
        super(JobType);
    }

    async update(updatedJobType){
        let jobTypeU = await JobType.update(updatedJobType);
        return jobTypeU.toObject();
    }

    async delete(jobTypeID){
        let result = await JobType.delete(jobTypeID);
        return result;
    }
}

module.exports = JobTypeController;