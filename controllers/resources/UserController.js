const UserModel = require('../../model/User');
const ResourceController = require('./ResourceController');
const neo4j = require('neo4j-driver');
const User = require('../../model/User');
const userDb = 'neo4j';
const passwordDb = 'fakboi3';
const uri = 'bolt://localhost:7687';
const driver = neo4j.driver(uri, neo4j.auth.basic(userDb, passwordDb));

class UserController extends ResourceController{

    constructor(label){
        super(label);
    }

    update(){}

    async addSkill(skillName, userID){
        let userData = await super.getByID('name', userID);
        let userSkill = await this.getUserSkill(userID);
        let user = new UserModel(userData[0].get('res').properties.name, userData[0].get('res').properties.email, userData[0].get('res').properties.address, 
                                 userData[0].get('res').properties.number, userData[0].get('res').properties.program_studi, userData[0].get('res').properties.angkatan, userSkill.get('res'));
    }
    removeSkill(){}
    async getUserSkill(userID){
        let session = driver.session();
        let query = `MATCH (n:User {name: '${userID}'})-[:SKILLED_IN]->(res:Resource) RETURN res,n`;
        let result = await session.run(query);
        return result.records;
    }
}

module.exports = UserController;
