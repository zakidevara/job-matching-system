const DB = require("../services/DB");
const {v4: uuidv4 } = require('uuid');

// Deskripsi:
// Class ini adalah abstract class dari semua class Model yang memungkinkan subclassnya untuk melakukan operasi manipulasi pada database 
// seperti create, read, update, dan delete. Class ini sudah mendefinisikan perilaku default dari semua operasi tersebut. Jika ada perbedaan
// perilaku, maka method dapat di override pada subclassnya.

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

    // Abstract method untuk mengambil id dari suatu class
    // Output:
    // nilai ID dari class
    getId(){
        // ---- DIIMPLEMENTASI DI SUBCLASS ----
    }

    // Abstract method untuk mengubah instansi objek dari suatu class ke bentuk objek JavaScript
    // Output:
    // Objek JavaScript representasi dari class Model
    toObject(){
        // ---- DIIMPLEMENTASI DI SUBCLASS ----
    }

    // Abstract method untuk menginstansiasi objek class Model dari objek JavaScript
    // Parameter:
    // - obj = Objek JavaScript berisi properti dari node Model yang akan diinstansiasikan
    // Output:
    // Objek instansiasi dari class Model
    constructFromObject(obj){
        // ---- DIIMPLEMENTASI DI SUBCLASS ----
    }

    // Method untuk mengambil semua nama atribut dari class Model
    // Output:
    // Array of string berisi nama-nama atribut dalam class Model
    getAttributes(){
        return Object.keys(this.toObject());
    }

    // Method untuk mengambil semua data Model dari DB
    // Output:
    // Array of Model semua node yang memiliki label Model
    async all(){
        // Build Cypher Query
        let query = `MATCH (res:${this.constructor.name}) RETURN res{`;
        this.getAttributes().forEach((val, index, arr) => {
            if(index+1 !== arr.length){
                query += `.${val}, `;
            }else{
                query += `.${val}}`;
            }
        });

        // Run Query in Database
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
            console.log('Model Error:', error);
            return [];
        }
    }

    // Method untuk mengambil satu data Model berdasarkan id
    // Parameter:
    // - id = key dari Model yang ingin diambil datanya
    // Output:
    // Objek instansiasi dari Model
    async findById(id){
        // Build Cypher Query
        let query = `MATCH (res:${this.constructor.name} {${this.#idName}: "${id}"}) RETURN res{`;
        this.getAttributes().forEach((val, index, arr) => {
            if(index+1 !== arr.length){
                query += `.${val}, `;
            }else{
                query += `.${val}} LIMIT 1`;
            }
        });

        // Run Query in Database
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
            console.log('Model Error:', error);
            return null;
        }
    }

    // Method untuk membuat node Model baru ke database
    // Parameter:
    // - obj = Objek JavaScript berisi properti dari node Model yang akan dibuat
    // Output:
    // Objek Model yang dibuat
    async create(obj){
        // Build Cypher Query
        let id = uuidv4();
        let query = `CREATE (res:${this.constructor.name} {${this.#idName}: '${id}', `;
        this.getAttributes().forEach((val, index, arr) => {
            if(obj[val] == undefined) return;
            if(index+1 !== arr.length){
                if(typeof obj[val] == "string"){
                    query += `${val}: '${obj[val]}', `;
                }else{
                    query += `${val}: ${obj[val]}, `;
                }
            }else{
                if(typeof obj[val] == "string"){
                    query += `${val}: '${obj[val]}'})`;
                }else{
                    query += `${val}: ${obj[val]}})`;
                }
            }
        });
        query += ' RETURN res';

        // Run Query in Database
        try {
            let result = await DB.query(query);
            if(result.records.length <= 0){
                throw new Error(`Data ${this.constructor.name} gagal dimasukkan`);
            }
            let nodesCreated = result.summary.counters._stats.nodesCreated;
            console.log(`${nodesCreated} node of ${this.constructor.name} created in the database`);

            let obj = result.records[0].get('res').properties;
            return this.constructFromObject(obj);
        } catch (error) {
            console.log('Model Error:', error);
            return null;
        }
    }

    // Method untuk mencari node Model yang memenuhi kriteria parameter obj
    // Parameter:
    // - queryObj = Objek JavaScript berisi query properti dari node Model yang harus dipenuhi kriterianya
    // Output:
    // Array of Model hasil pencarian
    async find(queryObj){
        // Build Cypher Query
        let query = `MATCH (res:${this.constructor.name}) `;

        if(queryObj && Object.keys(queryObj).length > 0){
            query = `MATCH (res:${this.constructor.name} `
            query += "{";
            Object.keys(queryObj).forEach((val, index, arr) => {
                if(queryObj[val] == undefined) return;
                if(index+1 !== arr.length){
                    if(typeof queryObj[val] == "string"){
                        query += `${val}: '${queryObj[val]}', `;
                    }else{
                        query += `${val}: ${queryObj[val]}, `;
                    }
                }else{
                    if(typeof queryObj[val] == "string"){
                        query += `${val}: '${queryObj[val]}'`;
                    }else{
                        query += `${val}: ${queryObj[val]}`;
                    }
                }
            });
            
            //remove the last comma
            query = query.replace(/,\s*$/, "");
            query += '}) RETURN res{';
            this.getAttributes().forEach((val, index, arr) => {
                if(index+1 !== arr.length){
                    query += `.${val}, `;
                }else{
                    query += `.${val}}`;
                }
            });
        }else{
            query += ') RETURN res{';
            this.getAttributes().forEach((val, index, arr) => {
                if(index+1 !== arr.length){
                    query += `.${val}, `;
                }else{
                    query += `.${val}}`;
                }
            });
        }

        console.log('QUERY', queryObj);
        // Run Query in Database
        try {
            let result = await DB.query(query);
            if(result.records.length <= 0){
                return [];
            }
            result = result.records.map((value, index, array) => {
                let obj = value.get('res');            
                return this.constructFromObject(obj);
            });
            return result;
        } catch (error) {
            console.log('Model Error:', error);
            return [];
        }
    }

    // Method untuk update node Model di database
    // Parameter:
    // - obj = Objek JavaScript berisi properti dari node Model yang akan diupdate
    // Output:
    // Objek Model yang dibuat
    async update(obj){
        // Build Cypher Query
        let id = obj[this.#idName];
        let query = `MATCH (res:${this.constructor.name} {${this.#idName}: '${id}'}) SET `;
        Object.keys(obj).forEach((val, index, arr) => {
            if(obj[val] == undefined) return;
            if(obj[val] == null) return;
            if(val == this.#idName) return;
            
            if(typeof obj[val] == "string"){
                query += `res.${val} = '${obj[val]}'`;
            }else{
                query += `res.${val} = ${obj[val]}`;
            }
            
            if(index+1 !== arr.length){
                query += ', ';
            }
        });
        //remove the last comma
        query = query.replace(/,\s*$/, "");
        query += ' RETURN res';

        // Run Query in Database
        try {
            let result = await DB.query(query);
            if(result.records.length <= 0){
                throw new Error(`Data ${this.constructor.name} dengan id <${id}> gagal diupdate`);
            }
            let propertiesSet = result.summary.counters._stats.propertiesSet;
            console.log(`${propertiesSet} properties of ${this.constructor.name} is set in the database`);

            let obj = result.records[0].get('res').properties;
            return this.constructFromObject(obj);
        } catch (error) {
            console.log('Model Error:', error);
            return null;
        }
    }

    // Method untuk menghapus data Model berdasarkan id
    // Parameter:
    // - id = Key dari data yang akan dihapus
    // Output:
    // Boolean status berhasil atau tidaknya penghapusan
    async deleteById(id){
        // Build Cypher Query
        let query = `MATCH (res:${this.constructor.name} {${this.#idName}: '${id}'}) DETACH DELETE res RETURN res`;

        // Run Query in Database
        try {
            let result = await DB.query(query);
            let nodesDeleted = result.summary.counters._stats.nodesDeleted;
            if(nodesDeleted <= 0 ) throw new Error(`Tidak ada data ${this.constructor.name} yang dihapus`);
            return nodesDeleted > 0;          
        } catch (error) {
            console.log('Model Error:', error);
            return false;
        }
    }

    // Method untuk menghapus objek yang sedang diinstansiasi saat ini
    // Output:
    // Boolean status berhasil atau tidaknya penghapusan
    async delete(){
        // Build Cypher Query
        const id = this.getId();
        let query = `MATCH (res:${this.constructor.name} {${this.#idName}: '${id}'}) DETACH DELETE res RETURN res`;

        // Run Query in Database
        try {
            let result = await DB.query(query);
            let nodesDeleted = result.summary.counters._stats.nodesDeleted;
            if(nodesDeleted <= 0 ) throw new Error(`Tidak ada data ${this.constructor.name} yang dihapus`);
            return nodesDeleted > 0;          
        } catch (error) {
            console.log('Model Error:', error);
            return false;
        }
    }

    // Method untuk menyimpan objek yang sedang diinstansiasi saat ini ke DB
    // Output:
    // Boolean status berhasil atau tidaknya penyimpanan
    async save(){
        let query = `MERGE (res:${this.constructor.name} {${this.#idName}: '${this.getId()}', `;
        let obj = this.toObject();
        this.getAttributes().forEach((val, index, arr) => {
            if(obj[val] == undefined) return;
            if(obj[val] == null) return;
            if(index+1 !== arr.length){
                if(typeof obj[val] == "string"){
                    query += `${val}: '${obj[val]}', `;
                }else{
                    query += `${val}: ${obj[val]}, `;
                }
            }else{
                if(typeof obj[val] == "string"){
                    query += `${val}: '${obj[val]}'`;
                }else{
                    query += `${val}: ${obj[val]}`;
                }
            }
        });
        query += '}) RETURN res';
        try{
            let result = await DB.query(query);
            let nodesCreated = result.summary.counters._stats.nodesCreated;
            return nodesCreated > 0 ? true : false;
        } catch(e){
            console.log('Model Error:', error);
            return false;
        }
    }

    
}



module.exports = Model;
