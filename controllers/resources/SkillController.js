const ResourceController = require("./ResourceController");
const neo4j = require('neo4j-driver');
const SkillModel = require('../../model/Skill');
const user = 'neo4j';
const password = 'fakboi3';
const uri = 'bolt://localhost:7687';
const driver = neo4j.driver(uri, neo4j.auth.basic(user, password));

class SkillController extends ResourceController {

    constructor(label = ''){
        super(label);
    }

    async searchByName(skillName){
        let session = driver.session();
        let result = await session.run(`MATCH (n:Resource) WHERE n.label CONTAINS '$skill' RETURN n`, {
            skill: skillName
        });
        await session.close();
        return result.records;
    }

    async calculateSimilarity(firstSkill, secondSkill){
        let objSKill = new SkillModel();
        let result = await objSKill.skillSimilarity(firstSkill, secondSkill);
        return result;
    }
}

module.exports = SkillController;