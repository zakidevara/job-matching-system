const ResourceController = require("./ResourceController");
const User = require('../../model/User');
const Job = require("../../model/Job");
const JobStudentMatcher = require("../matcher/JobStudentMatcher");
const {v4: uuidv4 } = require('uuid');
const JobRequirement = require("../../model/JobRequirement");
const JobType = require("../../model/JobType");

class JobController extends ResourceController {

    constructor(){
        super(Job);
    }

    async all(userId){
        try{
            let jobModel = new Job();
            let jobList = await jobModel.getAll(userId);
            let finalJobList = [];
            
            if(jobList.length > 0){
                for(let i=0; i < jobList.length; i++){
                    let value = jobList[i];
                    let requirements = value.getRequirements();
        
                    try{
                        await requirements.init();
                    } catch(e){
                        throw e;
                    }
    
                    value.setRequirements(requirements);
                    let objJob = value.toObject();
                    finalJobList.push(objJob);
                }
            }
            return finalJobList;
        } catch(e){
            console.log(e);
            throw e;
        }
    }

    async create(jobData){
        let userId = jobData.userId;

        let newJobReq = new JobRequirement(jobData.requirements.classYearRequirement, jobData.requirements.studyProgramRequirement, jobData.requirements.documentRequirement, jobData.requirements.requiredSkills, jobData.requirements.softSkillRequirement, jobData.requirements.maximumAge, jobData.requirements.requiredReligion, jobData.requirements.requiredGender, jobData.requirements.description);
        try{
            await newJobReq.init();
            try{
                let jobTypeModel = new JobType();
                let jobType = await jobTypeModel.findById(jobData.jobType);
                let newJob = new Job(uuidv4(), userId, jobData.title, jobData.quantity, jobData.location, jobData.contact, jobData.benefits, jobData.description, jobData.duration, jobData.remote, jobData.companyName, jobData.endDate, jobData.minSalary, jobData.maxSalary, true, newJobReq, jobType);
                try{
                    let resultSave = await newJob.save();
                    if(resultSave){
                        return newJob.toObject();
                    } else {
                        return null;
                    }
                } catch(e){
                    throw e;
                }
            } catch(e) {
                throw e;
            }
        } catch(e){
            throw e;
        }
    }

    async find(jobId){
        try{
            let jobModel = new Job();
            let job = await jobModel.findById(jobId);
            if(job === null) throw new Error('Data job tidak ditemukan');

            return job.toObject();
        } catch(e){
            throw e;
        }
    }

    async update(jobId, updatedJobData){
        try{
            let jobModel = new Job();
            let jobData = await jobModel.findById(jobId);
            if(jobData === null) throw new Error('Data job tidak ditemukan');
            try{
                let updatedJob = await jobData.update(updatedJobData);
                return updatedJob.toObject();
            } catch(e){
                throw e;
            }
        } catch(e){
            throw e;
        }
    }

    async deleteJob(jobId){
        try{
            let jobModel = new Job();
            let jobData = await jobModel.findById(jobId);
            if(jobData === null) throw new Error('Data job tidak ditemukan');
            try{
                let result = await jobData.delete();
                return result;
            } catch(e){
                throw e;
            }
        } catch(e){
            throw e;
        }
    }

    async searchByName(title){
        try{
            let jobModel = new Job();
            let jobList = await jobModel.searchByName(title);
            let finalJobList = [];
    
            if(jobList.length > 0){
                for(let i=0; i < jobList.length; i++){
                    let value = jobList[i];
                    let requirements = value.getRequirements();
        
                    try{
                        await requirements.init();
                    } catch(e){
                        throw e;
                    }
                    value.setRequirements(requirements);
        
                    let objJob = value.toObject();
                    finalJobList.push(objJob);
                }
            }
            return finalJobList;
        } catch(e){
            throw e;
        }
    }

    async applyJob(jobId, userId){
        // Validate user and job in database
        try{
            let jobModel = new Job();
            let job = await jobModel.findById(jobId);
            if(job === null) return 2;  // Job not found
            try{
                let userModel = new User();
                let user = await userModel.findById(userId);
                if(user === null) return 3; // User not found
                try{
                    let result = await job.apply(user);
                    return result;
                } catch(e){
                    throw e;
                }
            } catch(e){
                throw e;
            }
        } catch(e){
            throw e;
        }
    }
    
    async getJobRecommendation(userID, amount){
        
        try{
            // Get all available job with requires skill
            let jobModel = new Job();
            let listJob = await jobModel.getAll(undefined);
            try{
                // Get user data
                let userModel = new User();
                let userData = await userModel.findById(userID);
                // Create new object including Job item and value similarity and push it into a new array
                let newListJob = [];
                listJob.forEach((item) => {
                    let objHelper = {};
                    objHelper['job'] = item;
                    objHelper['value_similarity'] = 0;
                    newListJob.push(objHelper);
                });
                
                // Calculate similarity
                for(let i=0; i < newListJob.length; i++){
                    try{
                        let similarity = await JobStudentMatcher.match(newListJob[i].job, userData);
                        newListJob[i].value_similarity = similarity;
                    } catch(e){
                        console.log(e);
                        throw e;
                    }
                }
                // Sort job based on value similarity (descending)
                newListJob.sort((a, b) => {
                    return b.value_similarity - a.value_similarity;
                });

                // Change Job to Object
                newListJob.forEach((item, index) => {
                    let newJobObj = item.job.toObject();
                    newListJob[index].job = newJobObj;
                });

                if(newListJob.length > amount){
                    let finalListJob = [];
                    for(let i=0; i < amount; i++){
                        let current = newListJob[i];
                        finalListJob.push(current);
                    }
                    return finalListJob;
                } else {
                    return newListJob;
                }
            } catch(e){
                console.log(e);
                throw e;
            }
        } catch(e){
            console.log(e);
            throw e;
        }
    }

    async getJobApplicant(jobId){
        try{
            let jobModel = new Job();
            let jobData = await jobModel.findById(jobId);
            if(jobData === null) throw new Error('Data job tidak ditemukan');
            try{
                let applicant = await jobData.getApplicant();
                let listApplicant = [];
                applicant.forEach((item) => {
                    let apl = item.toObject();
                    listApplicant.push(apl);
                });

                return listApplicant;
            } catch(e){
                throw e;
            }
        } catch(e){
            throw e;
        }
    }

    async accApplicant(jobId, applicantData){
        try{
            let jobModel = new Job();
            let jobData = await jobModel.findById(jobId);
            if(jobData === null) throw new Error('Data job tidak ditemukan');
            try{
                let result = await jobData.acceptApplicant(applicantData);
                return result;
            } catch(e){
                console.log(e);
                throw e;
            }
        } catch(e){
            console.log(e);
            throw e;
        }
    }

    async refApplicant(jobId, applicantData){
        try{
            let jobModel = new Job();
            let jobData = await jobModel.findById(jobId);
            if(jobData === null) throw new Error('Data job tidak ditemukan');
            try{
                let result = await jobData.refuseApplicant(applicantData);
                return result;
            } catch(e){
                throw e;
            }
        } catch(e){
            throw e;
        }
    }

    async getApplicantRecommendation(jobId){
        // Find Job in database
        try{
            let jobModel = new Job();
            let jobData = await jobModel.findById(jobId);
            if(jobData === null) throw new Error('Data job tidak ditemukan');
    
            // Get applicants of selected job and match the required skills
            try{
                let applicants = await jobData.getApplicant();
                for(let i=0; i < applicants.length; i++){
                    try{
                        let similarity = await JobStudentMatcher.match(jobData, applicants[i].getUser());
                        applicants[i].setSimilarity(similarity);
                    } catch(e){
                        throw e;
                    }
                }
        
                // Sort applicants based on value similarity (descending)
                applicants.sort((a,b) => {
                    return b.getSimilarity() - a.getSimilarity();
                });
        
                applicants.forEach((item, index) => {
                    let newApplObj = item.toObject();
                    applicants[index] = newApplObj;
                });
        
                return applicants;
            } catch(e){
                throw e;
            }
        } catch(e){
            throw e;
        }
    }
}

module.exports = JobController;