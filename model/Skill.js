const Model = require("./Model");
// UUID
const {v4: uuidv4 } = require('uuid');
const DB = require("../services/DB");

class Skill extends Model {
    // Property of skill (private)
    #id;
    #name;
    #uri;

    constructor(id, name, uri){
        super();
        this.#id = id;
        this.#name = name;
        this.#uri = uri;
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

    // Database Related

    // Set UUID for every Skill node
    static async setID(){
        
        let query = `MATCH (s:Skill) RETURN s`;
        let result = await DB.query(query);
        
        let skillData = [];
        result.records.forEach((item) => {
            let value = item.get('s').properties;
            let skill = new Skill(value.name, value.uri);
            skillData.push(skill);
        });

        let exampleData = {};
        for(let i=0; i < skillData.length; i++){
            let skillID = uuidv4();
            let value = skillData[i];
            console.log('curr skill: ', value.getName());
            let query = `MATCH (s:Skill {uri: "${value.getUri()}"}) SET s.id = '${skillID}' RETURN s`;
            let result = await DB.query(query);
            if(result.records.length > 0){
                if(i === 0){
                    let value = result.records[0].get('s').properties;
                    exampleData['id'] = value.id;
                    exampleData['name'] = value.name;
                    exampleData['uri'] = value.uri;
                } else {
                    continue;
                }
            }
        }
        return exampleData;
    }

    static async find(skillID){
        
        let query = `MATCH (res:Skill) WHERE ID(res) = ${skillID} RETURN res`;
        let resultSkill = await DB.query(query);
        if(resultSkill.records.length > 0){
            let value = resultSkill.records[0].get('res');
            let properties = value.properties;
            let skillData = new Skill(properties.name, properties.uri);
            
            return skillData;
        } else {
            
            return null;
        }
    }

    static async getParentofNode(skillName){
        let listParents;
        try{
            listParents = await DB.query(
                `MATCH (:Skill {name: '${skillName}'})-[:SUBJECT*0..1]->(:Skill)-[:BROADER*0..1]->(result:Skill) Return result`
            );

        }catch(e){
            console.log(e)
            throw e;
        }
        
        return listParents;
    }
    
    static getTotalOfDifferenceSkill(firstArr, secondArr){
        var result = [];
        result = firstArr.filter((elements) => {
            return !secondArr.some(item => (item.name === elements.name) && (item.uri === elements.uri));
        });
        return result.length;
    }
    
    static getIntersection(firstArr, secondArr){
        var result = [];
        result = firstArr.filter((elements) => {
            return secondArr.some(item => (item.name === elements.name) && (item.uri === elements.uri));
        });
        return result.length;
    }
    
    static getGamma(firstArr, secondArr) {
        var result = 0;
        if(firstArr.length >= secondArr.length){
            result = secondArr.length / (firstArr.length + secondArr.length);
        } else {
            result = firstArr.length / (firstArr.length + secondArr.length);
        }
        return result;
    }

    static async calculateSimilarity(firstSkill, secondSkill){
        // Fill up all parents from each skill
        let dataOfParentsFS = await this.getParentofNode(firstSkill);
        let listOfParentsFS = dataOfParentsFS.records;
        let dataOfParentsSS = await this.getParentofNode(secondSkill);
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