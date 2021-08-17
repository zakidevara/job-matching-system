const Skill = require('../../model/Skill');

class JobStudentMatcher {
    
    static async match(job, user){
        let resultMatcher = 0;
        let userSkills = await user.getSkills();
        if(userSkills.length < 1) return 0;
        let jobRequirements = job.getRequirements();
        let jobRequiredSkills = jobRequirements.getSkills();
        for(let i=0; i < jobRequiredSkills.length; i++){
            let maxSkillSimilarity = 0;
            let currSkillSimilarity = 0;
            for(let j=0; j < userSkills.length; j++){
                currSkillSimilarity = await jobRequiredSkills[i].calculateSimilarity(userSkills[j]);
                // console.log(`Similarity between <${userSkills[j].getName()}> and <${jobRequiredSkills[i].getName()}> :`, currSkillSimilarity)
                if(currSkillSimilarity > maxSkillSimilarity){
                    maxSkillSimilarity = currSkillSimilarity;
                }
            }
            resultMatcher += maxSkillSimilarity;
        }
        resultMatcher = resultMatcher/jobRequiredSkills.length;
        return resultMatcher;
    }
}

module.exports = JobStudentMatcher;