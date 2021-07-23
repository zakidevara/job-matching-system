const DB = require("../services/DB");
const Model = require("./Model");
const WorkExperienceType = require("./WorkExperienceType");
const {v4: uuidv4 } = require('uuid');

class WorkExperience extends Model{
    // Property of work experience (private)
    #id;
    #title;
    #workExperienceType;
    #companyName;
    #startDate;
    #endDate;

    constructor(id, title, workExperienceType, companyName,  startDate, endDate){
        super('id');
        this.#id = id;
        this.#title = title;
        this.#workExperienceType = workExperienceType;
        this.#companyName = companyName;
        this.#startDate = startDate;
        this.#endDate = endDate;
    }

    // Setter
    setTitle(newTitle){
        this.#title = newTitle;
    }
    setWorkExpType(newType){
        this.#workExperienceType = newType;
    }
    setCompanyName(newName){
        this.#companyName = newName;
    }    
    setStartDate(newDate){
        this.#startDate = newDate;
    }
    setEndDate(newDate){
        this.#endDate = newDate;
    }


    // Getter
    getId(){
        return this.#id;
    }

    getTitle(){
        return this.#title;
    }
    getWorkExpType(){
        return this.#workExperienceType;
    }
    getCompanyName(){
        return this.#companyName;
    }
    getStartDate(){
        return this.#startDate;
    }
    getEndDate(){
        return this.#endDate;
    }

    toObject(){
        
        let objResult = {
            id: String(this.#id),
            title: this.#title,
            workExperienceType: this.#workExperienceType,
            companyName: this.#companyName,
            startDate: this.#startDate,
            endDate: this.#endDate,
        };
        if(objResult.workExperienceType == undefined || objResult.workExperienceType == null) delete objResult.workExperienceType;
        if(objResult.workExperienceType instanceof WorkExperienceType) objResult.workExperienceType = objResult.workExperienceType.toObject();
        return objResult;
    }
    constructFromObject(obj){
        let {
            id, 
            title,
            workExperienceType,
            companyName,
            startDate,
            endDate,
        } = obj;

        let result = new this.constructor(id, title, workExperienceType, companyName, startDate, endDate);
        return result;
    }
    async init(){
        if(typeof this.#workExperienceType !== "WorkExperienceType" && this.#workExperienceType !== undefined){
            try {
                let workExpTypeObj = new WorkExperienceType('', '');
                this.#workExperienceType = await workExpTypeObj.findById(this.#workExperienceType.id);
                return this;
            } catch (error) {
                console.log('WorkExperience Model Error: ', error);
            }
        }
    }
    async all(userId){
        // Build Cypher Query
        let query = '';
        if(userId){
            query += `MATCH (u:User {nim: '${userId}'})-[:WORKED_AT]->(res:${this.constructor.name})-[:CLASSIFIED]->(wt:WorkExperienceType) RETURN wt{.*}, res{`;
        }else{
            query += `MATCH (res:${this.constructor.name})-[:CLASSIFIED]->(wt:WorkExperienceType) RETURN wt{.*}, res{`;
        }
        this.getAttributes().forEach((val, index, arr) => {
            if(index+1 !== arr.length){
                query += `.${val}, `;
            }else{
                query += `.${val}}`;
            }
        });
        console.log(query);

        // Run Query in Database
        try {
            let result = await DB.query(query);
            if(result.records.length <= 0){
                throw new Error(`Tidak ada data ${this.constructor.name}`);
            }
            let promises = result.records.map(async (value, index, array) => {
                let obj = value.get('res');     
                let wt = value.get('wt');
                wt = new WorkExperienceType(wt.id, wt.name);
                obj = this.constructFromObject(obj);
                obj.setWorkExpType(wt);
                return obj;
            });

            result = await Promise.all(promises);
            return result;
        } catch (error) {
            console.log('WorkExperience Model Error:', error);
            return [];
        }
    }
    async find(queryObj){
        // Build Cypher Query
        let query = `MATCH (wt:WorkExperienceType)<-[:CLASSIFIED]-(res:${this.constructor.name} `;

        if(queryObj && Object.keys(queryObj).length > 0){
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
                        query += `${val}: '${queryObj[val]}'})`;
                    }else{
                        query += `${val}: ${queryObj[val]}})`;
                    }
                }
            });
            query += ' RETURN wt{.*}, res{';
            this.getAttributes().forEach((val, index, arr) => {
                if(index+1 !== arr.length){
                    query += `.${val}, `;
                }else{
                    query += `.${val}}`;
                }
            });
        }else{
            query += ') RETURN wt{.*}, res{';
            this.getAttributes().forEach((val, index, arr) => {
                if(index+1 !== arr.length){
                    query += `.${val}, `;
                }else{
                    query += `.${val}}`;
                }
            });
        }

        // Run Query in Database
        try {
            let result = await DB.query(query);
            if(result.records.length <= 0){
                return [];
            }
            let promises = result.records.map(async (value, index, array) => {
                let obj = value.get('res');     
                let wt = value.get('wt');
                wt = new WorkExperienceType(wt.id, wt.name);
                obj = this.constructFromObject(obj);
                obj.setWorkExpType(wt);
                return obj;
            });

            result = await Promise.all(promises);
            return result;
        } catch (error) {
            console.log('WorkExperience Model Error:', error);
            return [];
        }
    }
    async create(obj){
        try {
            // Build Cypher Query
            let id = uuidv4();
            let {workExperienceType} = obj;
            if(workExperienceType == undefined || !workExperienceType.id) throw new Error("ID Work Experience Type harus diisi");

            let query = `CREATE (res:${this.constructor.name} {id: '${id}', `;
            this.getAttributes().forEach((val, index, arr) => {
                if(obj[val] == undefined) return;
                
                if(val == 'workExperienceType') return;
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
            query += ` 
            WITH res MATCH (wt:WorkExperienceType {id: '${workExperienceType.id}'})
            CREATE (res)-[:CLASSIFIED]->(wt) RETURN res{.*}, wt{.*}`;

            // Run Query in Database        
            let result = await DB.query(query);
            if(result.records.length <= 0){
                throw new Error(`Data ${this.constructor.name} gagal dimasukkan`);
            }
            let nodesCreated = result.summary.counters._stats.nodesCreated;
            console.log(`${nodesCreated} node of ${this.constructor.name} created in the database`);

            let objResult = result.records[0].get('res');
            let wt = result.records[0].get('wt');
            wt = new WorkExperienceType(wt.id, wt.name);
            objResult = this.constructFromObject(obj);
            objResult.setWorkExpType(wt);
            return objResult;
        } catch (error) {
            console.log('WorkExperience Model Error:', error);
            return null;
        }
    }
    async update(obj){
        // Build Cypher Query
        let workExperienceType = obj.workExperienceType;
        let id = obj.id;

        // Update model property query
        let query = `MATCH (res:${this.constructor.name} {id: '${id}'})-[:CLASSIFIED]->(wt:WorkExperienceType) SET `;
        Object.keys(obj).forEach((val, index, arr) => {
            if(obj[val] == undefined) return;
            if(val == 'id') return;
            if(val == 'workExperienceType') return;
            if(index+1 !== arr.length){
                if(typeof obj[val] == "string"){
                    query += `res.${val} = '${obj[val]}', `;
                }else{
                    query += `res.${val} = ${obj[val]}, `;
                }
            }else{
                if(typeof obj[val] == "string"){
                    query += `res.${val} = '${obj[val]}'`;
                }else{
                    query += `res.${val} = ${obj[val]}`;
                }
            }
        });
        
        // remove the last comma
        query = query.replace(/,\s*$/, "");
        // update work experience type query
        if(workExperienceType !== undefined && workExperienceType.id){
            query += ` WITH res 
            MATCH 
                (res)-[rel:CLASSIFIED]->(w:WorkExperienceType),   
                (wt:WorkExperienceType {id: '${workExperienceType.id}'}) 
            CREATE (res)-[:CLASSIFIED]->(wt)
            DELETE rel`;
            query += ' RETURN res{.*}, wt{.*}';
        }else{
            query += ' RETURN res{.*}, wt{.*}';
        }
                
        console.log('UPDATE QUERY', query);
        // Run Query in Database
        try {
            let result = await DB.query(query);
            if(result.records.length <= 0){
                throw new Error(`Data ${this.constructor.name} dengan id <${id}> gagal diupdate`);
            }
            let propertiesSet = result.summary.counters._stats.propertiesSet;
            console.log(`${propertiesSet} properties of ${this.constructor.name} is set in the database`);

            let obj = result.records[0].get('res');
            let wt = result.records[0].get('wt');
            wt = new WorkExperienceType(wt.id, wt.name);
            obj = this.constructFromObject(obj);
            obj.setWorkExpType(wt);
            console.log('UPDATE', obj);
            return obj;
        } catch (error) {
            console.log('Model Error:', error);
            return null;
        }
    }
    async save(){
        
        try {
            await this.init();
            let obj = this.toObject();
            let isExist = await this.findById(obj.id);
            isExist = isExist !== null;

            let result;
            if(isExist){
                result = await this.update(obj);
            }else{
                result = await this.create(obj);
            }
            
            return result !== null;
        } catch (error) {
            console.log('WorkExperience Model Error: ', error);
            return false;
        }
    }
    async findById(id){
        // Build Cypher Query
        let query = `MATCH (res:${this.constructor.name} {id: "${id}"})-[:CLASSIFIED]->(wt:WorkExperienceType) RETURN wt{.*}, res{`;
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
            result = result.records[0]
            let obj = result.get('res');
            let wt = result.get('wt');
            wt = new WorkExperienceType(wt.id, wt.name);
            obj = this.constructFromObject(obj);
            obj.setWorkExpType(wt);
            return obj;
        } catch (error) {
            console.log('Model Error:', error);
            return null;
        }
    }
}

module.exports = WorkExperience;