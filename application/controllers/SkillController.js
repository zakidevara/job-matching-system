const ResourceController = require("./ResourceController");
const neo4j = require('neo4j-driver');
const SkillModel = require('../../model/Skill');
const Skill = require("../../model/Skill");
const user = 'neo4j';
const password = 'fakboi3';
const uri = 'bolt://localhost:7687';
const driver = neo4j.driver(uri, neo4j.auth.basic(user, password));

class SkillController extends ResourceController {

    constructor(label = ''){
        super(label);
    }

    async setIDForNode(){
        let result = await Skill.setID();
        return result;
    }

}

module.exports = SkillController;