const JobController = require('../resources/JobController');
const UserController = require('../resources/UserController');
const SkillController = require('../resources/SkillController');
const JobModel = require('../../model/Job');
const UserModel = require('../../model/User');
const userDb = 'neo4j';
const passwordDb = 'fakboi3';
const uri = 'bolt://localhost:7687';
const driver = neo4j.driver(uri, neo4j.auth.basic(userDb, passwordDb)); 

class JobStudentMatcher {
    
    async match(job, user){
        if(job != JobModel || user != UserModel){
            return -1;
        }
        let resultMatcher = 0;
        for(i=0; i < user.skills.length; i++){
            let maxSkillSimilarity = 0;
            let currSkillSimilarity = 0;
            for(j=0; j < job.requiredSkills.length; j++){
                let skillObj = new SkillController();
                currSkillSimilarity = await skillObj.calculateSimilarity(user.skills[i], job.requiredSkills[j]);
                if(currSkillSimilarity > maxSkillSimilarity){
                    maxSkillSimilarity = currSkillSimilarity;
                }
            }
            resultMatcher += maxSkillSimilarity;
        }
        resultMatcher /= user.skills.length;
        return resultMatcher;
    }
}

module.exports = JobStudentMatcher;