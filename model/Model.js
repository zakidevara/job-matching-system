
// Database
const neo4j = require('neo4j-driver');
const driver = neo4j.driver(process.env.NEO4J_HOST, neo4j.auth.basic(process.env.NEO4J_USERNAME, process.env.NEO4J_PASSWORD), {
    disableLosslessIntegers: true
});

class Model {
    #id;
    constructor(id){
        this.#id = id;
    }

    setID(newID){
        this.#id = newID;
    }

    getID(){
        return this.#id;
    }
    
    static async all(){}
    static async find(){}
    static async findById(){}
    static async create(){}
    static async update(){}
    static async deleteByID(){}
    async delete(){}
    async save(){}
}

module.exports = {Model, driver};