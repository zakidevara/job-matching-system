const {Model, driver} = require("./Model");

class Skill extends Model {
    // Property of skill (private)
    #name;
    #uri;

    constructor(skillID, name, uri){
        super(skillID);
        this.#name = name;
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
            id: super.getID(),
            name: this.#name,
            uri: this.#uri
        };
        return objResult;
    }

    static async find(skillID){
        let session = driver.session();
        let query = `MATCH (res:Skill) WHERE ID(res) = ${skillID} RETURN res`;
        let resultSkill = await session.run(query);
        if(resultSkill.records.length > 0){
            let value = resultSkill.records[0].get('res');
            let properties = value.properties;
            let skillData = new Skill(value.identity, properties.name, properties.uri);
            await session.close();
            return skillData;
        } else {
            await session.close();
            return null;
        }
    }

    async getParentofNode(skillName){
        let session = driver.session();
        let listParents =  await session.run(
            'MATCH (:Skill {name: $skillName})-[:SUBJECT*0..1]->(:Skill)-[:BROADER*0..1]->(result:Skill) Return result',
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

    async calculateSimilarity(firstSkill, secondSkill){
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