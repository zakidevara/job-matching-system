
// Database
const neo4j = require('neo4j-driver');
const driver = neo4j.driver(process.env.NEO4J_HOST, neo4j.auth.basic(process.env.NEO4J_USERNAME, process.env.NEO4J_PASSWORD), {
    disableLosslessIntegers: true
});

// UUID
const {v4: uuidv4 } = require('uuid');

class Model {
    constructor(){
        if(this.constructor === Model){
            throw new Error('Abstract class "Model" cannot be instantiated directly');
        }
    }
}

module.exports = {Model, driver, uuidv4};