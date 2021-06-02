const JobModel = require('../../model/Job');
const UserModel = require('../../model/User');
const Skill = require('../../model/Skill');

class JobStudentMatcher {
    
    static async match(job, user){
        let resultMatcher = 0;
        let userSkills = await user.getSkills();
        let jobRequiredSkills = await job.getRequiredSkills();
        for(let i=0; i < userSkills.length; i++){
            let maxSkillSimilarity = 0;
            let currSkillSimilarity = 0;
            for(let j=0; j < jobRequiredSkills.length; j++){
                let objSkill = new Skill('', '');
                currSkillSimilarity = await objSkill.calculateSimilarity(userSkills[i].getName(), jobRequiredSkills[j].getName());
                if(currSkillSimilarity > maxSkillSimilarity){
                    maxSkillSimilarity = currSkillSimilarity;
                }
            }
            resultMatcher += maxSkillSimilarity;
        }
        resultMatcher /= userSkills.length;
        return resultMatcher;
    }
}

module.exports = JobStudentMatcher;