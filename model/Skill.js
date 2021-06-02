const Model = require("./Model");
const neo4j = require('neo4j-driver');
const user = 'neo4j';
const password = 'fakboi3';
const uri = 'bolt://localhost:7687';
const driver = neo4j.driver(uri, neo4j.auth.basic(user, password), {
    disableLosslessIntegers: true
});

class Skill extends Model {
    // Property of skill (private)
    #name;
    #uri;

    constructor(label = '', uri = ''){
        super('102');
        this.#name = label;
        this.#uri = uri;
    }

    getName(){
        return this.#name;
    }

    getUri(){
        return this.#uri;
    }

    toObject(){
        let objResult = {
            name: this.#name,
            uri: this.#uri
        };
        return objResult;
    }

    async getParentofNode(skillName){
        let replacedSkillName = skillName.replace(/\s/g,"_");
        console.log('replaced skillname: ', replacedSkillName);
        let session = driver.session();
        let listParents =  await session.run(
            'MATCH (:Resource {label: $skillName})-[:SUBJECT*0..1]->(:Resource)-[:BROADER*0..1]->(result:Resource) Return result',
            {
                skillName: skillName
            }
        );
        await session.close();
        return listParents;
    }
    
    getTotalOfDifferenceSkill(firstArr, secondArr){
        var result = [];
        result = firstArr.filter((elements) => {
            return !secondArr.some(item => (item.label === elements.label) && (item.uri === elements.uri));
        });
        return result.length;
    }
    
    getIntersection(firstArr, secondArr){
        var result = [];
        result = firstArr.filter((elements) => {
            return secondArr.some(item => (item.label === elements.label) && (item.uri === elements.uri));
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

    async calculateSimilarity(firstSkill, secondSkill){
        // Fill up all parents from each skill
        let dataOfParentsFS = await this.getParentofNode(firstSkill);
        let listOfParentsFS = dataOfParentsFS.records;
        let dataOfParentsSS = await this.getParentofNode(secondSkill);
        let listOfParentsSS = dataOfParentsSS.records;

        // Get only label from every node in array
        let listOfObjFS = [];
        listOfParentsFS.forEach((item, index) => {
            let obj = {};
            obj['label'] = item.get('result').properties.label;
            obj['uri'] = item.get('result').properties.uri;
            listOfObjFS.push(obj);
        });
        let listOfObjSS = [];
        listOfParentsSS.forEach((item, index) => {
            let obj = {};
            obj['label'] = item.get('result').properties.label;
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

        console.log('total parent of first skill : ',finalFsList.length);
        console.log('total parent of second skill : ', finalSsList.length);
        
        // Get the difference and intersection (Sanchez)
        let totDifFS = this.getTotalOfDifferenceSkill(finalFsList, finalSsList);     // notasi --> listOfParentsFS \ listOfParentsSS
        let totDifSS = this.getTotalOfDifferenceSkill(finalSsList, finalFsList);     // notasi --> listOfParentsSS \ listOfParentsFS
        let intersection = this.getIntersection(finalFsList, finalSsList);           // notasi --> listOfParentsFS n listOfParentsSS

        console.log(totDifFS);
        console.log(totDifSS);
        console.log(intersection);
        console.log('pembagi: ', totDifFS+totDifSS+intersection);
        console.log('pembilang: ', totDifFS+totDifSS);
        console.log('hasil bagi: ', 1 + ((totDifFS+totDifSS)/(totDifFS+totDifSS+intersection)));

        let disimilarity = Math.log(1 + ((totDifFS+totDifSS)/(totDifFS+totDifSS+intersection))) / Math.log(2);
        let similarity = 1 - disimilarity;
        return similarity;
    }
}

module.exports = Skill;