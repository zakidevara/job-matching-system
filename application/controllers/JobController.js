const ResourceController = require("./ResourceController");
const User = require('../../model/User');
const Job = require("../../model/Job");
const JobStudentMatcher = require("../matcher/JobStudentMatcher");
const {v4: uuidv4 } = require('uuid');
const JobRequirement = require("../../model/JobRequirement");
const Validator = require('validatorjs');
const moment = require('moment');

class JobController extends ResourceController {

    constructor(){
        super(Job);
    }

    validate(jobData){
        let rules = {
            jobId: 'required|string',
            nim: 'string',
            title: 'required|string',
            quantity: 'required|integer',
            jobType: 'required|integer',
            location: 'string',
            benefits: 'string',
            minSalary: 'string',
            maxSalary: 'string',
            contact: 'required|string',
            endDate: 'required|date',
            remote: 'boolean',
            description: 'string',
            companyName: 'string',
            duration: 'string',
            requirements: {
                studyProgramRequirement: 'array',
                classYearRequirement: 'array',
                documentRequirement: 'string',
                requiredSkills: 'required|array',
                softSkillRequirement: 'string',
                maximumAge: 'integer',
                requiredReligion: 'array',
                requiredGender: 'array',
                description: 'string'
            }
        };
        let validator = new Validator(jobData, rules);
        if(validator.passes()){
            return true;
        } else{
            //console.log(jobValidator.errors);
            return validator.errors;
        }
    }

    validateJobRecommendationInput(inputData){
        let rules = {
            userId: 'required|string',
            limitJob: 'required|integer'
        };
        let validator = new Validator(inputData, rules);
        if(validator.passes()){
            return true;
        } else {
            return validator.errors;
        }
    }

    validateApplicantRecommendation(inputData){
        let rules = {
            jobId: 'required|string'
        };
        let validator = new Validator(inputData, rules);
        if(validator.passes()){
            return true;
        } else {
            return validator.errors;
        }
    }

    validateManageApplicantInput(inputData){
        let rules = {
            jobId: 'required|string',
            applicantId: 'required|string',
            message: 'string'
        };
        let validator = new Validator(inputData, rules);
        if(validator.passes()){
            return true;
        } else {
            return validator.errors;
        }
    }

    async all(userId){
        try{
            let jobModel = new Job();
            let jobList = await jobModel.all(userId);
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
        let jobId = uuidv4();
        jobData.jobId = jobId;
        let validInput = this.validate(jobData);
        if(validInput !== true){
            return validInput;
        }

        let userId = jobData.userId;
        let newJobReq = new JobRequirement(jobData.requirements.classYearRequirement, jobData.requirements.studyProgramRequirement, jobData.requirements.documentRequirement, jobData.requirements.requiredSkills, jobData.requirements.softSkillRequirement, jobData.requirements.maximumAge, jobData.requirements.requiredReligion, jobData.requirements.requiredGender, jobData.requirements.description);
        try{
            await newJobReq.init();
            try{
                // let jobTypeModel = new JobType();
                // let jobType = await jobTypeModel.findById(jobData.jobType);
                let newJobType = parseInt(jobData.jobType);
                let newJob = new Job(jobId, userId, jobData.title, jobData.quantity, jobData.location, jobData.contact, jobData.benefits, jobData.description, jobData.duration, jobData.remote, jobData.companyName, '',  jobData.endDate, jobData.minSalary, jobData.maxSalary, true, newJobReq, newJobType);
                let pathLogo = '';
                let isLogoValid = false;
                if(jobData.companyLogo !== null){
                    pathLogo = newJob.saveCompanyLogo(jobData.companyLogo);
                    if(pathLogo !== null){
                        newJob.setCompanyLogo(pathLogo);
                        isLogoValid = true;
                    }
                }
                if(!isLogoValid) newJob.setCompanyLogo(pathLogo);

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
        let jobData = updatedJobData;
        jobData.jobId = jobId;
        let validInput = this.validate(jobData);
        if(validInput !== true){
            return validInput;
        }

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

    async delete(jobId){
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

    async search(query){
        try{
            let jobModel = new Job();
            let userModel = new User();
            let result = await jobModel.find(query);
            let jobList = result.searchResult;
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
                    let recruiter = await userModel.findById(value.getUserID());
                    let jobApplicants = await value.getApplicant();
                    objJob['applicantCount'] = jobApplicants.length;
                    objJob.postedBy = {
                        nim: recruiter.getId(),
                        name: recruiter.getName(),
                    };

                    if(objJob.companyLogo === ""){
                        delete objJob['companyLogo'];
                    }else{
                        objJob.companyLogo = `${process.env.APP_URL}/v1/file?filePath=` + objJob.companyLogo.replace('.', '');  
                    }

                    finalJobList.push(objJob);
                }
            }
            return {
                pagination: result.pagination,
                searchResult: finalJobList
            };
        } catch(e){
            throw e;
        }
    }

    async applyJob(jobId, userId, applicantDocuments){
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
                    let result = await job.apply(user, applicantDocuments);
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
    
    async getJobRecommendation(userId, amount){
        let inputData = {
            userId: userId,
            limitJob: amount
        };
        let validInput = this.validateJobRecommendationInput(inputData);
        if(validInput !== true){
            return validInput;
        }

        try{
            try{
                // Get user data
                let userModel = new User();
                let userData = await userModel.findById(userId);
                let userReligion = await userData.getReligion();
                console.log(userData.getStudyProgram());
                // Get all available job with requires skill
                let jobModel = new Job();
                let filteredJob = await jobModel.find({
                    fStudyProgram: [userData.getStudyProgram().id],
                    fClassYear: [userData.getClassYear()],
                    fGender: [userData.getGender().id],
                    // fReligion: userReligion !== undefined ? [userReligion.name]: [],
                    fAge: Math.abs(moment(userData.getBirthDate()).diff(moment(new Date()), 'years')),
                    itemPerPage: amount,
                });

                let listJob = filteredJob.searchResult;
                // Create new object including Job item and value similarity and push it into a new array
                let newListJob = [];

                for(let i = 0; i < listJob.length; i++){
                    let objHelper = {};
                    objHelper['job'] = listJob[i];
                    let jobApplicants = await listJob[i].getApplicant();
                    let recruiter = await userModel.findById(listJob[i].getUserID());
                    objHelper['postedBy'] = {
                        nim: recruiter.getId(),
                        name: recruiter.getName(),
                    };
                    objHelper['applicantCount'] = jobApplicants.length;
                    objHelper['value_similarity'] = 0;
                    newListJob.push(objHelper);
                }
                
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

    async getJobApplicants(jobId){
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
        let inputData = applicantData;
        inputData.jobId = jobId;
        let validInput = this.validateManageApplicantInput(inputData);
        if(validInput !== true){
            return validInput;
        }

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
        let inputData = applicantData;
        inputData.jobId = jobId;
        let validInput = this.validateManageApplicantInput(inputData);
        if(validInput !== true){
            return validInput;
        }

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
        let validInput = this.validateApplicantRecommendation({jobId: jobId});
        if(validInput !== true){
            return validInput;
        }

        // Find Job in database
        try{
            let jobModel = new Job();
            let jobData = await jobModel.findById(jobId);
            if(jobData === null) throw new Error('Data job tidak ditemukan');
    
            // Get applicants of selected job and match the required skills
            try{
                let applicants = await jobData.getApplicant();
                let nlApplicants = [];
                if(applicants.length < 1) return nlApplicants;

                applicants.forEach((item) => {
                    let objHelper = {};
                    objHelper['similarity'] = 0;
                    objHelper['applicant'] = item;
                    nlApplicants.push(objHelper);
                });

                for(let i=0; i < nlApplicants.length; i++){
                    try{
                        let similarity = await JobStudentMatcher.match(jobData, nlApplicants[i].applicant.getUser());
                        nlApplicants[i].similarity = similarity;
                    } catch(e){
                        console.log(e);
                        throw e;
                    }
                }
        
                // Sort applicants based on value similarity (descending)
                nlApplicants.sort((a,b) => {
                    return b.similarity - a.similarity;
                });
        
                nlApplicants.forEach((item, index, array) => {
                    let newApplObj = item.applicant.toObject();
                    if(newApplObj.user.photo === ""){
                        delete newApplObj.user['photo'];
                    }else{
                        newApplObj.user.photo = `${process.env.APP_URL}/v1/file?filePath=` + newApplObj.user.photo.replace('.', '');  
                    }
                    array[index].applicant = newApplObj;
                });
        
                return nlApplicants;
            } catch(e){
                console.log(e);
                throw e;
            }
        } catch(e){
            console.log(e);
            throw e;
        }
    }
}

module.exports = JobController;