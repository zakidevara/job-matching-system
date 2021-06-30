const JobType = require("../../model/JobType");
const ResourceController = require("./ResourceController");

class JobTypeController extends ResourceController{

    constructor(label){
        super(label);
    }

    async all(){
        let jobTypeList = await JobType.getAllJobType();
        return jobTypeList;
    }

    async create(jobTypeName){
        let newJobType = await JobType.create(jobTypeName);
        return newJobType;
    }

    async findByID(jobTypeID){
        let jobType = await JobType.find(jobTypeID);
        return jobType.toObject();
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