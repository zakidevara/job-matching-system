const ResourceController = require("./ResourceController");
const User = require('../../model/User');
const Job = require("../../model/Job");
const Skill = require("../../model/Skill");
const JobStudentMatcher = require("../matcher/JobStudentMatcher");

class JobController extends ResourceController {

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
        console.log('list job: ', listJob.length);

        // Get required skills for every job based on jobID (current userID)
        for(let i=0; i < listJob.length; i++){
            let listSkill = await Job.getJobRequiredSkill(listJob[i].getJobID());
            listJob[i].setRequiredSkills(listSkill);
        }
        
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