// Configure environment
// Lib
const express = require("express");
const app = express();
const port = 3000;
const sparqlCon = require("@comunica/actor-init-sparql").newEngine;
const myEngine = sparqlCon();
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded());
app.use(bodyParser.json());
// Database
const neo4j = require('neo4j-driver');
const user = "neo4j";
const password = "fakboi3";
const uri = "bolt://localhost:7687";
const driver = neo4j.driver(uri, neo4j.auth.basic(user, password));

// Ontology Builder
app.post("/", async (req, res) => {
    var subConceptChecked = [];
    var processQueue = [];
    processQueue = [req.body.qConcept];
    let validateResource = true;
    let i = 0;
    // Enter loop
    while(processQueue.length > 0){
        i++;
        // Pop first element of array
        //console.log(processQueue);
        let resource = processQueue.shift();
        validateResource = true;

        // Validate value of resource in subConceptChecked
        if(subConceptChecked.length > 0){
            subConceptChecked.forEach((item, index) => {
                if(item == resource){
                    validateResource = false;
                }
            });
        }
        
        if(validateResource){
            // Add current resource to subConceptChecked
            subConceptChecked.push(resource);
            console.log(resource);

            // Resource section
            // Wrap request resource function in Promise
            const resultResource = async (resource) => {
                let queryResource = await myEngine.query(`
                    PREFIX dbc: <http://dbpedia.org/resource/Category:>
                    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
                    PREFIX foaf: <http://xmlns.com/foaf/0.1/>
                    PREFIX dct: <http://purl.org/dc/terms/>
                    CONSTRUCT {
                        ?resource dct:subject ?subject .
                        ?resource rdf:type ?type .
                        ?resource foaf:name ?resource_label
                    }
                    WHERE {
                        ?resource dct:subject ?subject . filter(?subject = dbc:${resource}) .
                        ?resource rdf:type ?type . filter(?type = <http://dbpedia.org/ontology/Software> || ?type = <http://dbpedia.org/ontology/ProgrammingLanguage>) .
                        ?resource foaf:name ?resource_label
                    } LIMIT 100
                `, {
                    sources: [
                        { type: 'sparql', value: 'https://dbpedia.org/sparql' },
                    ],
                });
                var { data } = await myEngine.resultToString(queryResource, 'text/turtle');
                let turtle = ``;

                // Data listener for resources
                data.on('data', (chunk) => {
                    turtle += chunk;
                });
                
                // Response has been obtained
                data.on('end', async () => {
                    turtle = turtle.replace(/"/g,'\\"');        // replace to prevent of error in ""
                    var cypherResource = `CALL n10s.rdf.import.inline(
                        "${turtle}",
                        'Turtle'
                    )`;
                    let session = driver.session();
                    await session.run(cypherResource);
                    await session.close();
                });
            };

            // Trigger the promise
            // Input all resource to database
            await resultResource(resource).then(res => {
                console.log('Resource obtained');
            });
            
            // Sub concept section
            const resultSubConcept = async (resource) => {
                let querySubConcept = await myEngine.query(`
                    PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
                    PREFIX dbc: <http://dbpedia.org/resource/Category:>
                    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
                    CONSTRUCT {
                        ?sub_concepts skos:broader ?broader .
                        ?sub_concepts rdfs:label ?concept_label
                    }
                    WHERE{
                        ?sub_concepts skos:broader ?broader . filter(?sub_concepts = dbc:${resource})
                        ?sub_concepts rdfs:label ?concept_label
                    } LIMIT 100
                `, {
                    sources: [
                        { type: 'sparql', value: 'https://dbpedia.org/sparql'}
                    ],
                });
                var { data }  =  await myEngine.resultToString(querySubConcept, 'text/turtle');
                let turtle = '';

                // Data listener for sub concept
                data.on('data', (chunk) => {
                    turtle += chunk;
                });

                //Response has been obtained
                data.on('end', async () => {
                    var cypherSubConcept = `CALL n10s.rdf.import.inline(
                        '${turtle}',
                        'Turtle'
                    )`;
                    let session = driver.session();
                    await session.run(cypherSubConcept);
                    await session.close();
                });
            };

            // Trigger the promise
            // Input sub concept to database
            await resultSubConcept(resource).then(res => {
                console.log('Sub concept obtained');
            });

            // Update the processQueue
            const updateProcessQueue = async _ => {
                console.log('after sub concept obtained');
                let session = driver.session();
                let getCurrentSubConcept = await session.run('MATCH (:Resource)-[:skos__broader]->(Resource) RETURN Resource');
                let records = getCurrentSubConcept.records;
                console.log('sub concept from db',records);
                let extractedValue = [];

                records.forEach((item, index) => {
                    let sc = item.get('Resource').properties.uri;
                    // Get name of the category of subconcept
                    let newSC = sc.split(':')[2];
                    extractedValue.push(newSC);
                });
                await session.close();
                var promise = Promise.resolve(extractedValue);
                return promise;
            };

            await updateProcessQueue().then(result => {
                console.log('Hasil sub concept from db: ',result);
                // Compare processQueue and subConceptChecked
                // If there are items in the processQueue but already in subConceptChecked
                // Item will be deleted form processQueue
                processQueue = result;
                processQueue.forEach((item, index) => {
                    var validateItem = true;
                    subConceptChecked.forEach((xItem, xIndex) => {
                        if(item == xItem){
                            validateItem = false;
                        }
                    });
                    if(!validateItem){
                        processQueue.splice(index, 1);
                    }
                });
                console.log('Setelah update process queue: ', processQueue);
            });
        }
    }
    console.log('Array sub concept checked: ',subConceptChecked);
    console.log('Array process queue: ',processQueue);
    console.log('Total iterasi:', i);
    res.send({message: "halllo"});
});

async function runDb(param){
    let session = driver.session();
    await session.run(param, {});
    await session.close();
}

async function updateProcessQueue(){
    let session = driver.session();
    const getCurrentSubConcept = await session.run('MATCH (:Resource)-[:skos__broader]->(Resource) RETURN Resource', {});
    await session.close();
    //console.log(getCurrentSubConcept);
    let records = getCurrentSubConcept.records;
    console.log(records);
    records.forEach((item, index) => {
        let sc = item.get('Resource').properties.uri;
        // Get name of the category of subconcept
        let newSC = sc.split(':')[2];
        processQueue.push(newSC);
    });
    // Compare processQueue and subConceptChecked
    // If there are items in the processQueue but already in subConceptChecked
    // Item will be deleted form processQueue
    processQueue.forEach((item, index) => {
        //console.log("hi im here");
        var curItem = item;
        var validateItem = true;
        subConceptChecked.forEach((xItem, xIndex) => {
            if(curItem == xItem){
                validateItem = false;
            }
        });
        if(!validateItem){
            processQueue.splice(index, 1);
        }
    });
    console.log(processQueue);
}

// Skill Similarity
app.post("/skill-similarity", async (req, res) => {
    // Get required skills
    let firstSkill = req.body.fs;
    let secondSkill = req.body.ss;

    // Fill up all parents from each skill
    let dataOfParentsFS = getParentofNode(firstSkill);
    let listOfParentsFS = (await dataOfParentsFS).records;
    let dataOfParentsSS = getParentofNode(secondSkill);
    let listOfParentsSS = (await dataOfParentsSS).records;

    //console.log(listOfParentsFS);
    //console.log(listOfParentsSS);
    
    // Get the difference and intersection
    let totDifFS = getTotalOfDifferenceSkill(listOfParentsFS, listOfParentsSS);     // notasi --> listOfParentsFS \ listOfParentsSS
    let totDifSS = getTotalOfDifferenceSkill(listOfParentsSS, listOfParentsFS);     // notasi --> listOfParentsSS \ listOfParentsFS
    let intersection = getIntersection(listOfParentsFS, listOfParentsSS);           // notasi --> listOfParentsFS n listOfParentsSS

    console.log(totDifFS);
    console.log(totDifSS);
    console.log(intersection);

    let similarity = Math.log(1 + ((totDifFS+totDifSS)/(totDifFS+totDifSS+intersection)));
    res.send({
        message: 'halo',
        value: similarity
    });

});

async function getParentofNode(skillName){
    let session = driver.session();
    let listParents =  await session.run(
        'MATCH (:Resource {ns1__name: $skillName})-[:dct__subject*0..1]->(:Resource)<-[:skos__broader*0..]-(result:Resource) Return result',
        {
            skillName: skillName
        }
    );
    await session.close();
    return listParents;
}

function getTotalOfDifferenceSkill(firstArr, secondArr){
    var result = [];
    // Compare all item in firstArr in secondArr
    // Return final total length of firstArr
    var nameOfSkill = '';
    firstArr.forEach((item, index) => {
        let curItem = item.get('result');
        if(curItem.properties.hasOwnProperty('ns1__name')){
            nameOfSkill = curItem.properties.ns1__name;
        } else {
            nameOfSkill = curItem.properties.rdfs__label;
        }

        // Compare of nameOfSkill in secondArr
        var validateSkill = true;
        secondArr.forEach((item, index) => {
            let curItem = item.get('result');
            if(curItem.properties.hasOwnProperty('ns1__name')){
                if(nameOfSkill == curItem.properties.ns1__name){
                    validateSkill = false;
                }
            } else {
                if(nameOfSkill == curItem.properties.rdfs__label){
                    validateSkill = false;
                }
            }
        });

        // nameOfSkill not exist in secondArr
        if(validateSkill){
            result.push(item);
        }
    });
    return result.length;
}

function getIntersection(firstArr, secondArr){
    var result = [];
    var nameOfSkill = '';

    firstArr.forEach((item, index) => {
        let curItem = item.get('result');
        if(curItem.properties.hasOwnProperty('ns1__name')){
            nameOfSkill = curItem.properties.ns1__name;
        } else {
            nameOfSkill = curItem.properties.rdfs__label;
        }

        // Compare nameOfSkill with secondArr
        var validateSkill = true;
        secondArr.forEach((item, index) => {
            let curScdItem = item.get('result');
            if(curScdItem.properties.hasOwnProperty('ns1__name')){
                if(nameOfSkill == curScdItem.properties.ns1__name){
                    validateSkill = false;
                }
            } else {
                if(nameOfSkill == curScdItem.properties.rdfs__label){
                    validateSkill = false;
                }
            }
        });

        if(!validateSkill){
            result.push(item);
        }
    });
    return result.length;
}

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});