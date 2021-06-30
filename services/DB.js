const neo4j = require('neo4j-driver');
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

    static async query(query){
        let driver = this.getDriver();
        let session = driver.session();

        try{
            let queryResult = await session.run(query);
            await session.close();
            return queryResult;
        }catch(e){
            await session.close();
            console.log("DB error: ", e);
            throw e;
        }
    }
}

module.exports = DB;