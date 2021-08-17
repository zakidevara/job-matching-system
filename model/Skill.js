const Model = require("./Model");
// UUID
const {v4: uuidv4 } = require('uuid');
const DB = require("../services/DB");
const DBpedia = require("../services/DBpedia");
const { performance } = require("perf_hooks");

class Skill extends Model {
    // Property of skill (private)
    #id;
    #name;
    #uri;
    #taxonomyFeatures;

    constructor(id='', name='', uri=''){
        super("id");
        this.#id = id;
        this.#name = name;
        this.#uri = uri;
    }

    toObject(){
        let objResult = {
            id: this.#id,
            name: this.#name,
            uri: this.#uri,
            taxonomyFeatures: this.#taxonomyFeatures ? this.#taxonomyFeatures.map((item) => item.toObject()) : []
        };
        return objResult;
    }
    constructFromObject(obj){
        let {
            id,
            name,
            uri,
        } = obj;
        return new this.constructor(id, name, uri)
    }

    // GETTER
    getId(){
        return this.#id;
    }

    getName(){
        return this.#name;
    }

    getUri(){
        return this.#uri;
    }
    async getTaxonomyFeatures(){
        if(this.#taxonomyFeatures=== undefined){
            let features = await this.getParentNodes();
            this.setTaxonomyFeatures(features);
        }else{
            return this.#taxonomyFeatures;
        }
    }

    

    // SETTER
    setName(name){
        this.#name = name;
    }
    setTaxonomyFeatures(features){
        this.#taxonomyFeatures = features;
    }

    async getParentNodes(){
        let listParents;
        try{
            listParents = await DB.query(
                `MATCH (:Skill {name: '${this.#name}'})-[:SUPER_TOPIC_OF*0..2]->(result:Skill) Return result`
            );

            let listOfParentsFS = listParents.records;

            let listOfObjFS = [];
            listOfParentsFS.forEach((item, index) => {
                let obj = {};
                obj['id'] = item.get('result').properties.id;
                obj['name'] = item.get('result').properties.name;
                obj['uri'] = item.get('result').properties.uri;
                listOfObjFS.push(obj);
            });

            
            // Remove duplicates
            let fsObject = listOfObjFS.map(JSON.stringify);
            let uniqueFSSet = new Set(fsObject);
            let finalFsList = Array.from(uniqueFSSet).map(JSON.parse);
            
            let skillList = finalFsList.map((item) => new Skill(item.id, item.name, item.uri));
            this.setTaxonomyFeatures(skillList);
            return skillList;
        }catch(e){
            console.log(e)
            throw e;
        }
        
    }
    async findById(skillID){
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

    calculateSanchezSimilarity(featureOne, featureTwo){
        featureOne = featureOne.map((item) => item.toObject());
        featureTwo = featureTwo.map((item) => item.toObject());
        // Get the difference and intersection
        let differenceOne = this.getTotalOfDifferenceSkill(featureOne, featureTwo);     // notasi --> listOfParentsFS \ listOfParentsSS
        let differenceTwo = this.getTotalOfDifferenceSkill(featureTwo, featureOne);     // notasi --> listOfParentsSS \ listOfParentsFS
        let intersection = this.getIntersection(featureOne, featureTwo);           // notasi --> listOfParentsFS n listOfParentsSS

        let dissimilarity = Math.log(1 + ((differenceOne+differenceTwo)/(differenceOne+differenceTwo+intersection))) / Math.log(2);
        let similarity = 1 - dissimilarity;
        return similarity;

    }
    async calculateSimilarity(secondSkill){
        // Fill up all parents from each skill
        let dataOfParentsFS = await this.getTaxonomyFeatures();
        let dataOfParentsSS = await secondSkill.getTaxonomyFeatures();


        // Get the difference and intersection (Sanchez)
        return this.calculateSanchezSimilarity(dataOfParentsFS, dataOfParentsSS);

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

    async create(obj){
        let {name} = obj;

        try {
            //Check if skill is already in the database
            let findResult = await this.find({name: name});
            let isExists = findResult.length > 0;
            if(isExists) throw new Error(`${this.constructor.name} ${name} sudah ada di dalam basis data`);
            
            //Check if skill exists in DBpedia Ontology
            let isExistsDBpedia = await DBpedia.checkTerm(name);
            if(!isExistsDBpedia) throw new Error(`${this.constructor.name} ${name} tidak dapat ditambahkan karena tidak terdaftar dalam DBpedia`);
    
            // Build Cypher Query
            // Run Query in Database
            let addedNodes = await this.buildOntology(name);
            return addedNodes;
        } catch (error) {
            console.log('Skill Model Error: ', error);
            return null;
        }
    }

    async update(obj){
        let {id, name} = obj;
        let result = await super.update({id, name});
        return result;
    }

    // Ontology Builder
    async buildOntology(rootConcept){
        var checkedConcept = [];
        let addedNodes = new Set();
        var processQueue = [];
        processQueue = [rootConcept];
        console.log('processQueue: ', processQueue);
        let i = 0;
        // Enter loop
        while(processQueue.length > 0){
            i++;
            // Pop first element of array
            // let concept = processQueue.shift();
            let promiseAll = processQueue.map(async (concept) => {
                
                console.log('current concept: ', concept); 
                // let isExist = await this.find({name: concept});
                // isExist = isExist.length > 0;
    
                try {
                    // Insert subresource to database
                    let subResourceTurtle = await DBpedia.getSubResource(concept);
                    let subResourcesNodesInserted = await DB.importTurtle(subResourceTurtle);
    
                    // Set name for concept
                    let setNameConcept = await DB.query(`MATCH (n:Resource {name: $concept}) SET n:Concept, n:Skill, n.name = $concept RETURN n`,{concept : concept});
                    addedNodes.add(concept);
                    checkedConcept.push(concept);

                    //Get all subresource an add to added nodes
                    let getCurrentSubResource = await DB.query(`MATCH (n:Resource)-[:SUBJECT]->(:Concept {name: $concept}) SET n:Skill RETURN n`, {concept : concept});
                    let subResourceNames = getCurrentSubResource.records.map((item) => {
                        let name = item.get('n').properties.name;
                        addedNodes.add(name);
                        return name;
                    });
    
                    if(subResourcesNodesInserted > 0){
                        // Insert sub concept to database
                        let subConceptTurtle = await DBpedia.getSubConcept(concept);
                        let subConceptNodesInserted = await DB.importTurtle(subConceptTurtle);
    
                        //Update the process queue
                        let getCurrentSubConcept = await DB.query(`MATCH (n:Resource)-[:BROADER]->(:Resource {name: $concept}) SET n:Concept, n:Skill RETURN n`,{concept : concept});
                        let subConceptNames = getCurrentSubConcept.records.map((item) => {
                            let name = item.get('n').properties.name;
                            addedNodes.add(name);
                            return name;
                        });
    
                        // Check all item in processQueue
                        // If items are already in subConceptChecked
                        // Items will be deleted from processQueue
                        
                        processQueue = processQueue.concat(subConceptNames);                
                    }
                } catch(error) {
                    console.log(`Error On Concept ${concept}: `, error);
                    checkedConcept = checkedConcept.filter((value) => value !== concept);
                }
                
            })
            await Promise.all(promiseAll);
            processQueue = processQueue.filter(function (element) {
                return !checkedConcept.includes(element);
            });
            console.log('processQueue: ', {processQueue, length: processQueue.length});        

        }

        console.log('Total iterasi:', i);
        console.log('Added nodes:', {addedNodes, length: addedNodes.size});

        //Assign UUID to every added nodes
        let unassignedIdNodes = Array.from(addedNodes);
        let completedNodes = [];
        addedNodes = [];
        do {
            completedNodes = unassignedIdNodes.map(async (name) => {
                let id = uuidv4();
                try {
                    await DB.query(`MATCH (s:Skill {name: $name}) SET s.id=$id`, {name, id});
                    unassignedIdNodes = unassignedIdNodes.filter((val) => val !== name);
                    return {id, name};
                } catch (error) {
                    unassignedIdNodes.push(name);                
                }
            });
            let resolvedResults = await Promise.all(completedNodes);
            addedNodes.concat(resolvedResults);
        } while (unassignedIdNodes.length > 0);
        return addedNodes;
    }

}

// TEST FUNCTION
// Test Command: `node model/Skill.js`
async function test(){
    let skill = new Skill('', '');

    // TESTING CREATE NEW DATA FUNCTIONALITY
    // let t0 = performance.now();
    // let createResult = await skill.create({name: "Software engineering"});
    // console.log(createResult);
    // let t1 = performance.now();
    // console.log('Execution time: ', (t1-t0)/1000, ' s');

    // TESTING GET ALL DATA FUNCTIONALITY
    // let getAllResult = await skill.all();
    // console.log(getAllResult.map((item) => item.toObject()));
    
    // TESTING FIND DATA FUNCTIONALITY
    // let getFindResult = await skill.find({name: "Software engineering"});
    // console.log(getFindResult.map((item) => item.toObject()));

    // TESTING GET BY ID FUNCTIONALITY
    // let getFindByIdResult = await skill.findById('0dc26471-d458-4456-b428-32b6e750fd4a');
    // console.log(getFindByIdResult.toObject());

    // TESTING UPDATE DATA FUNCTIONALITY
    // Original Skill name: Streaming algorithms
    // let updateResult = await skill.update({id: '0dc26471-d458-4456-b428-32b6e750fd4a', name: "Streaming"});
    // console.log(updateResult);

    // TESTING SAVE DATA FUNCTIONALITY
    // let newObj = skill.constructFromObject({id: uuidv4(), name: 'TestSkill'});
    // let saveResult = await newObj.save();
    // console.log(saveResult);
}
test();
module.exports = Skill;