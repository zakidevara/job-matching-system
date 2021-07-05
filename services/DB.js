const neo4j = require('neo4j-driver');
const dotenv = require('dotenv');

dotenv.config();
class DB{
    static driver = null;

    static getDriver(){
        if(this.driver == null){
            const driver = neo4j.driver(process.env.NEO4J_HOST, neo4j.auth.basic(process.env.NEO4J_USERNAME, process.env.NEO4J_PASSWORD), {
                disableLosslessIntegers: true
            });   
            this.driver = driver;
        }
        return this.driver;    
    }

    static async query(query, param = {}){
        let driver = this.getDriver();
        let session = driver.session();

        try{
            let queryResult = await session.run(query, param);
            return queryResult;
        }catch(e){
            console.log("DB Error: ", e);
            throw e;
        }finally{
            await session.close();
        }
    }
    static async writeTransaction(query){
        let driver = this.getDriver();
        let session = driver.session();

        try {
            let writeTxResultPromise = await session.writeTransaction( async txc => {
                try{
                    let result = await txc.run(query);
                    return result;
                } catch(error){
                    console.log(error);
                    throw error;
                }
            });
    
            return writeTxResultPromise;
        } catch (error) {
            console.log('DB Error:', error);
            // throw error;
        }finally{
            await session.close();

        }

    }
    static async importTurtle(turtle){
        turtle = turtle.replace(/"|'/g, function (x) {
            return '\\'.concat(x);
        });
        turtle = turtle.replace(/\\\\"/g, function (x) {
            return '\\"';
        });
        let importQuery = `CALL n10s.rdf.import.inline(
            '${turtle}',
            'Turtle'
            ) yield triplesLoaded RETURN triplesLoaded`;
            
        try {
            let writeTxResultPromise = await this.writeTransaction(importQuery);
            let nodesCreated = writeTxResultPromise.records[0].get('triplesLoaded');
            return nodesCreated;
        } catch (error) {
            console.log('DB Error:', error);
            // throw error;
        }        
    }
}



module.exports = DB;