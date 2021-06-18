// Database
const neo4j = require('neo4j-driver');
const userDb = 'neo4j';
const passwordDb = 'fakboi3';
const uri = 'bolt://localhost:7687';
const driver = neo4j.driver(uri, neo4j.auth.basic(userDb, passwordDb));

class ResourceController {
    // Property of controller (private)
    #dataLabel;

    constructor(label){
        this.#dataLabel = label;
        if(new.target == ResourceController){
            throw new TypeError("Jangan langsung ke sini bruh");
        }
    }

    // Validate target of class
    validate(Model){
        if(Model == ResourceController){
            return false;
        }
        return true;
    }

    // Return all data based on label
    async getAll(){
        let session = driver.session();
        let query = `MATCH (res:${this.#dataLabel}) RETURN res`;
        let result = await session.run(query);
        await session.close();
        return result.records;
    }

    // Get data by id
    async getByID(idName, idData){
        let session = driver.session();
        let query = `MATCH (res:${this.#dataLabel} {${idName}: '${idData}'}) RETURN res`;
        let result = await session.run(query);
        await session.close();
        return result.records;
    }

    // Create new data to database based on Model
    async create(Model){
        if(Model !== ModelClass){
            throw new TypeError("Type nya salah bruh");
        }
    }

    // Update selection data to database based on Model
    async update(Model){
        if(Model !== ModelClass){
            throw new TypeError("Type nya salah bruh");
        }
    }

    async delete(idName, idData){
        let session = driver.session();
        let result = await session.run(`MATCH (res:$label {$idName: $idData}) DELETE res`, {
            label: this.#dataLabel,
            idName: idName,
            idData: idData
        });
        // Belum tau kembalian dari neo4j gimana kalo delete
    }


}

module.exports = ResourceController;