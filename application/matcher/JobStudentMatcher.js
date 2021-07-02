const Skill = require('../../model/Skill');

class JobStudentMatcher {
    
    static async match(job, user){
        let resultMatcher = 0;
        let userSkills = await user.getSkills();
        if(userSkills.length < 1) return 0;
        let jobRequirements = job.getRequirements();
        let jobRequiredSkills = jobRequirements.getSkills();
        for(let i=0; i < userSkills.length; i++){
            let maxSkillSimilarity = 0;
            let currSkillSimilarity = 0;
            for(let j=0; j < jobRequiredSkills.length; j++){
                let objSkill = new Skill('', '');
                currSkillSimilarity = await userSkills[i].calculateSimilarity(jobRequiredSkills[j]);
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