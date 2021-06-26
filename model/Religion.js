const { Model, driver } = require("./Model");

class Religion extends Model{
    // Property of religion (private)
    #id;
    #name;

    constructor(id, name){
        super();
        this.#id = id;
        this.#name = name;
    }

    getReligionID(){
        return this.#id;
    }
    getName(){
        return this.#name;
    }
    toObject(){
        let resultObj = {
            id: this.#id,
            name: this.#name
        };
        return resultObj;
    }

    static async getAll(){
        let session = driver.session();
        let query = `MATCH (r:Religion) RETURN r`;
        let result = await session.run(query);
        let fResult = [];
        result.records.forEach((item, iedex) => {
            let value = item.get('r').properties;
            let obj = new Religion(value.id, value.name);
            fResult.push(obj);
        });
        await session.close();
        return fResult;
    }

    static async find(id){
        let session = driver.session();
        let query = `MATCH (r:Religion {id: ${id}}) RETURN r`;
        let result = await session.run(query);
        if(result.records.length > 0){
            let value = result.records[0].get('r').properties;
            let obj = new Religion(value.id, value.name);
            await session.close();
            return obj;
        } else {
            await session.close();
            return null;
        }
    }
}

module.exports = Religion;