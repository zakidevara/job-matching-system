const DB = require("../services/DB");

class Model {
    #idName;
    constructor(idName){
        this.#idName = idName;
        if(this.constructor === Model){
            throw new Error(`Abstract class "${this.constructor.name}" cannot be instantiated directly`);
        }
        if(this.all === undefined){
            throw new TypeError(`Classes extending the "${this.constructor.name}" abstract class`);
        }
        if(this.find === undefined){
            throw new TypeError(`Classes extending the "${this.constructor.name}" abstract class`);
        }
        if(this.findById === undefined){
            throw new TypeError(`Classes extending the "${this.constructor.name}" abstract class`);
        }
        if(this.create === undefined){
            throw new TypeError(`Classes extending the "${this.constructor.name}" abstract class`);
        }
        if(this.update === undefined){
            throw new TypeError(`Classes extending the "${this.constructor.name}" abstract class`);
        }
        if(this.deleteById === undefined){
            throw new TypeError(`Classes extending the "${this.constructor.name}" abstract class`);
        }
        if(this.delete === undefined){
            throw new TypeError(`Classes extending the "${this.constructor.name}" abstract class`);
        }
        if(this.save === undefined){
            throw new TypeError(`Classes extending the "${this.constructor.name}" abstract class`);
        }
        if(this.getAttributes === undefined){
            throw new TypeError(`Classes extending the "${this.constructor.name}" abstract class`);
        }
        if(this.toObject === undefined){
            throw new TypeError(`Classes extending the "${this.constructor.name}" abstract class`);
        }
        if(this.constructFromObject === undefined){
            throw new TypeError(`Classes extending the "${this.constructor.name}" abstract class`);
        }
    }

    async create(obj){}
    async find(obj){}
    async update(obj){}
    async delete(){}
    async save(){}
    toObject(){}
    constructFromObject(obj){}

    getAttributes(){
        return Object.keys(this.toObject());
    }

    async all(){
        let query = `MATCH (res:${this.constructor.name}) RETURN res{`;
        this.getAttributes().forEach((val, index, arr) => {
            if(index+1 !== arr.length){
                query += `.${val}, `;
            }else{
                query += `.${val}}`;
            }
        });
        
        try {
            let result = await DB.query(query);
            if(result.records.length <= 0){
                throw new Error(`Tidak ada data ${this.constructor.name}`);
            }
            result = result.records.map((value, index, array) => {
                let obj = value.get('res');            
                return this.constructFromObject(obj);
            });
            return result;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }
    async findById(id){
        let query = `MATCH (res:${this.constructor.name} {${this.#idName}: "${id}"}) RETURN res{`;
        this.getAttributes().forEach((val, index, arr) => {
            if(index+1 !== arr.length){
                query += `.${val}, `;
            }else{
                query += `.${val}} LIMIT 1`;
            }
        });

        try {
            let result = await DB.query(query);
            if(result.records.length <= 0){
                throw new Error(`${this.constructor.name} dengan id <${id}> tidak ditemukan`);
            }
            result = result.records.map((value, index, array) => {
                let obj = value.get('res');
                return this.constructFromObject(obj);
            });
            return result[0];
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    async deleteById(id){
        try {
            let query = `MATCH (res:${this.constructor.name} {${this.#idName}: "${id}"}) DETACH DELETE res`;
            let result = await DB.query(query);
            let nodesDeleted = result.summary.counters._stats.nodesDeleted;

            if(nodesDeleted <= 0 ) throw new Error(`Tidak ada data ${this.constructor.name} yang dihapus`);
            return nodesDeleted > 0;          
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

}

module.exports = Model;
