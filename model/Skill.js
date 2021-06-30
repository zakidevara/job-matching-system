const Model = require("./Model");
// UUID
const {v4: uuidv4 } = require('uuid');
const DB = require("../services/DB");

class Skill extends Model {
    // Property of skill (private)
    #id;
    #name;
    #uri;

    constructor(id='', name='', uri=''){
        super("id");
        this.#id = id;
        this.#name = name;
        this.#uri = uri;
    }

    constructFromObject(obj){
        let {
            id,
            name,
            uri
        } = obj;
        return new this.constructor(id, name, uri)
    }

    getID(){
        return this.#id;
    }

    getName(){
        return this.#name;
    }

    getUri(){
        return this.#uri;
    }

    toObject(){
        let objResult = {
            id: this.#id,
            name: this.#name,
            uri: this.#uri
        };
        return objResult;
    }

    async getParentNodes(){
        let listParents;
        try{
            listParents = await DB.query(
                `MATCH (:Skill {name: '${this.#name}'})-[:SUBJECT|BROADER*0..2]->(result:Skill) Return result`
            );

        }catch(e){
            console.log(e)
            throw e;
        }
        
        return listParents;
    }
    static async find(skillID){
        let query = `MATCH (s:Skill {id: '${skillID}'}) RETURN s`;
        try{
            let result = await DB.query(query);
            if(result.records.length > 0){
                let propSkill = result.records[0].get('s').properties;
                let skill = new Skill(propSkill.id, propSkill.name, propSkill.uri);
                return skill;
            } else {
                return null;
            }
        } catch(e){
        }
    }
    
    getTotalOfDifferenceSkill(firstArr, secondArr){
        var result = [];
        result = firstArr.filter((elements) => {
            return !secondArr.some(item => (item.name === elements.name) && (item.uri === elements.uri));
        });
        return result.length;
    }
    
    getIntersection(firstArr, secondArr){
        var result = [];
        result = firstArr.filter((elements) => {
            return secondArr.some(item => (item.name === elements.name) && (item.uri === elements.uri));
        });
        return result.length;
    }
    
    getGamma(firstArr, secondArr) {
        var result = 0;
        if(firstArr.length >= secondArr.length){
            result = secondArr.length / (firstArr.length + secondArr.length);
        } else {
            result = firstArr.length / (firstArr.length + secondArr.length);
        }
        return result;
    }

    async calculateSimilarity(secondSkill){
        // Fill up all parents from each skill
        let dataOfParentsFS = await this.getParentNodes();
        let listOfParentsFS = dataOfParentsFS.records;
        let dataOfParentsSS = await secondSkill.getParentNodes();
        let listOfParentsSS = dataOfParentsSS.records;

        let listOfObjFS = [];
        listOfParentsFS.forEach((item, index) => {
            let obj = {};
            obj['name'] = item.get('result').properties.name;
            obj['uri'] = item.get('result').properties.uri;
            listOfObjFS.push(obj);
        });
        let listOfObjSS = [];
        listOfParentsSS.forEach((item, index) => {
            let obj = {};
            obj['name'] = item.get('result').properties.name;
            obj['uri'] = item.get('result').properties.uri;
            listOfObjSS.push(obj);
        });

        // Remove duplicates
        let fsObject = listOfObjFS.map(JSON.stringify);
        let uniqueFSSet = new Set(fsObject);
        let finalFsList = Array.from(uniqueFSSet).map(JSON.parse);

        let ssObject = listOfObjSS.map(JSON.stringify);
        let uniqueSSSet = new Set(ssObject);
        let finalSsList = Array.from(uniqueSSSet).map(JSON.parse);

        // Get the difference and intersection (Sanchez)
        let totDifFS = this.getTotalOfDifferenceSkill(finalFsList, finalSsList);     // notasi --> listOfParentsFS \ listOfParentsSS
        let totDifSS = this.getTotalOfDifferenceSkill(finalSsList, finalFsList);     // notasi --> listOfParentsSS \ listOfParentsFS
        let intersection = this.getIntersection(finalFsList, finalSsList);           // notasi --> listOfParentsFS n listOfParentsSS

        let disimilarity = Math.log(1 + ((totDifFS+totDifSS)/(totDifFS+totDifSS+intersection))) / Math.log(2);
        let similarity = 1 - disimilarity;
        return similarity;

        // Get the difference and intersection (Rodriguez)
        // let totDifFS = getTotalOfDifferenceSkill(finalFsList, finalSsList);     // notasi --> listOfParentsFS \ listOfParentsSS
        // let totDifSS = getTotalOfDifferenceSkill(finalSsList, finalFsList);     // notasi --> listOfParentsSS \ listOfParentsFS
        // let intersection = getIntersection(finalFsList, finalSsList);           // notasi --> listOfParentsFS n listOfParentsSS
        // let gamma = getGamma(finalFsList, finalSsList);

        // console.log(totDifFS);
        // console.log(totDifSS);
        // console.log(intersection);
        // console.log(gamma);

        // let similarity = Math.log(1 + (intersection/(intersection+gamma*totDifFS+(1-gamma)*totDifSS))) / Math.log(2);
        // res.send({
        //     message: 'halo',
        //     similarity: similarity
        // });
    }
}

module.exports = Skill;