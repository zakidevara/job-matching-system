const ResourceController = require("./ResourceController");
const User = require('../../model/User');
const Job = require("../../model/Job");
const Skill = require("../../model/Skill");
const JobStudentMatcher = require("../matcher/JobStudentMatcher");

class JobController extends ResourceController {

    constructor(label){
        super(label);
    }

    async all(){
        let jobList = await Job.getAllAvailableJob();
        return jobList;
    }

    async create(jobData){
        let newJob = await Job.create(jobData);
        return newJob;
    }

    async find(jobID){
        let jobData = await Job.find(jobID);
        let job = jobData.job.toObject();
        let jobTypeF = jobData.jobType.toObject();
        let jobReq = jobData.jobReq.toObject();

        let requirements = {
            studyProgramReq: jobReq.studyProgramRequirement,
            classYearRequirement: jobReq.classYearRequirement,
            documentsRequirement: jobReq.documentsRequirement,
            requiredSkills: jobReq.requiredSkills,
            softSkillRequirment: jobReq.softSkillRequirment,
            maximumAge: jobReq.maximumAge,
            requiredReligion: jobReq.requiredReligion,
            requiredGender: jobReq.requiredGender,
            description: jobReq.description
        };

        let resultObj = {
            jobID: job.jobID,
            title: job.title,
            description: job.description,
            jobType: jobTypeF,
            companyName: job.companyName,
            remote: job.remote,
            location: job.location,
            duration: job.duration,
            benefits: job.benefits,
            contact: job.contact,
            quantity: job.quantity,
            minSalary: job.minSalary,
            maxSalary: job.maxSalary,
            endDate: job.endDate,
            requirements: requirements,
            status: job.status
        };
        return resultObj;
    }

    async update(jobID, updatedJobData){
        let jobData = await Job.find(jobID);
        if(jobData === null) return null;

        let updateResult = await jobData.job.update(updatedJobData, jobData.jobReq, jobData.jobType);
    }

    async deleteJob(jobID){
        let jobData = await Job.find(jobID);
        let job = jobData.job;
        let result = await job.delete();
        return result;
    }

    static async applyJob(jobID, userID){
        // Validate user and job in database
        let job = await Job.find(jobID);
        if(job === null) return 2;  // Job not found
        if(!job.validateJobStatus()){
            return 4;   // Job not available
        }
        let user = await User.find(userID);
        if(user === null) return 3; // User not found

        let result = await job.apply(user);
        // return result;
    }
    
    static async getJobRecommendation(userID, amount){
        // Get all available job with requires skill
        let listJob = await Job.getAllAvailableJob();
        
        // Get user data
        let userData = await User.find(userID);

        // Create new object including Job item and value similarity and push it into a new array
        let newListJob = [];
        listJob.forEach((item, index) => {
            let objHelper = {};
            objHelper['job'] = item;
            objHelper['value_similarity'] = 0;
            newListJob.push(objHelper) 
        });
        
        // Calculate similarity
        for(let i=0; i < newListJob.length; i++){
            let similarity = await JobStudentMatcher.match(newListJob[i].job, userData);
            newListJob[i].value_similarity = similarity;
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
    }

    static async getApplicantRecommendation(jobID){
        // Find Job in database
        let job = await Job.find(jobID);
        if(job == null) return null;

        // Get applicants of selected job and match the required skills
        let applicants = await job.getApplicant();
        for(let i=0; i < applicants.length; i++){
            let objUser = await User.find(applicants[i].getUserID());
            let similarity = await JobStudentMatcher.match(job, objUser);
            applicants[i].setSimilarity(similarity);
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

    }
}

module.exports = JobController;