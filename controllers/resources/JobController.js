const ResourceController = require("./ResourceController");
const UserController = require('./UserController');
const User = require('../../model/User');
const neo4j = require('neo4j-driver');
const user = 'neo4j';
const password = 'fakboi3';
const uri = 'bolt://localhost:7687';
const driver = neo4j.driver(uri, neo4j.auth.basic(user, password));

class JobController extends ResourceController {
    
    async searchByTitle(titleName){
        let session = driver.session();
        let result = await session.run(`MATCH (res:Job) WHERE res.title CONTAUINS '$title' RETURN res`, {
            title: titleName
        });
        await session.close();
        return result.records;
    }

    async getJobRecommendation(userID){
        let session = driver.session();
        // Get all available job and user skill
        let result = await session.run(`MATCH (res:Job) WHERE n.status = '1' RETURN res`);
        let userObj = new UserController('User');
        let userSkills = await userObj.getUserSkill(userID);

        


    }
}

module.exports = JobController;