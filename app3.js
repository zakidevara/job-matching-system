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
    let validateConcept = true;
    let i = 0;
    // Enter loop
    while(processQueue.length > 0){
        i++;
        // Pop first element of array
        //console.log(processQueue);
        let concept = processQueue.shift();
        validateConcept = false;

        // Validate value of resource in subConceptChecked
        if(subConceptChecked.length > 0){
            validateConcept = subConceptChecked.includes(concept);
        }
        
        if(!validateConcept){
            // Add current resource to subConceptChecked
            subConceptChecked.push(concept);
            console.log('current concept: ', concept);

            // Resource section
            // #1 async
            const resultResource = async (concept) => {
                try{
                    var queryResource = await myEngine.query(`
                        PREFIX dbc: <http://dbpedia.org/resource/Category:>
                        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
                        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
                        PREFIX dct: <http://purl.org/dc/terms/>
                        CONSTRUCT {
                            ?resource dct:subject ?subject .
                            ?resource rdf:type ?type .
                            ?resource rdfs:label ?resource_label
                        }
                        WHERE {
                            ?resource dct:subject ?subject . filter(?subject = <http://dbpedia.org/resource/Category:${concept}>) .
                            ?resource rdf:type ?type . filter(?type = <http://dbpedia.org/ontology/Software> || ?type = <http://dbpedia.org/ontology/Language> || ?type = <http://dbpedia.org/ontology/ProgrammingLanguage>) .
                            ?resource rdfs:label ?resource_label . filter(lang(?resource_label)= "en")
                        }
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
                    // Wrap the end-listener in Promise
                    var endResource = new Promise(function(resolve, reject) {
                        data.on('end', () => {
                            turtle = turtle.replace(/"|'/g, function (x) {
                                return '\\'.concat(x);
                            });
                            turtle = turtle.replace(/\\\\"/g, function (x) {
                                return '\\"';
                            });
                            var cypherResource = `CALL n10s.rdf.import.inline(
                                "${turtle}",
                                'Turtle'
                            ) yield triplesLoaded RETURN triplesLoaded`;
                            let session = driver.session();
                            var writeTxResultPromise = session.writeTransaction( async txc => {
                                try{
                                    var result = await txc.run(cypherResource);
                                    return result;
                                } catch(error){
                                    console.log('Error transaction rsc: ', error);
                                }
                            });
    
                            writeTxResultPromise.then(result => {
                                let resultTL = result.records;
                                resolve(resultTL[0].get('triplesLoaded').low);
                            }).catch(error => {
                                console.log('err rsc: ', error)
                            }).then(() => {session.close()});
                        });
                        data.on('error', reject);
                    });
                    var countRscInserted = await endResource;
                    return countRscInserted;
                } catch(error) {
                    console.log('Catch error rsc: ', error);
                }
            };

            // Sub concept section
            // #2 async
            const resultSubConcept = async (concept) => {
                try{
                    var querySubConcept = await myEngine.query(`
                        PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
                        PREFIX dbc: <http://dbpedia.org/resource/Category:>
                        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
                        CONSTRUCT {
                            ?sub_concepts skos:broader ?broader .
                            ?sub_concepts rdfs:label ?sub_concepts_label 
                        }
                        WHERE{
                            ?sub_concepts skos:broader ?broader . filter(?broader = <http://dbpedia.org/resource/Category:${concept}>)
                            ?sub_concepts rdfs:label ?sub_concepts_label . filter(lang(?sub_concepts_label)= "en")
                        }
                    `, {
                        sources: [
                            { type: 'sparql', value: 'https://dbpedia.org/sparql'}
                        ],
                    });
                    var { data }  =  await myEngine.resultToString(querySubConcept, 'text/turtle');
                    let turtle = ``;

                    // Data listener for sub concept
                    data.on('data', (chunk) => {
                        turtle += chunk;
                    });

                    //Response has been obtained
                    // Wrap end-listener in Promise
                    var endSubConcept = new Promise(function(resolve, reject) {
                        data.on('end', () => {
                            turtle = turtle.replace(/"|'/g, function (x) {
                                return '\\'.concat(x);
                            });
                            var cypherSubConcept = `CALL n10s.rdf.import.inline(
                                "${turtle}",
                                'Turtle'
                            ) yield triplesLoaded RETURN triplesLoaded`;
                            let session = driver.session();
                            var writeTxResultPromise = session.writeTransaction( async txc => {
                                try{
                                    var result = await txc.run(cypherSubConcept);
                                    return result;
                                } catch(error){
                                    console.log('Error transaction sc: ', error);
                                }
                            });
    
                            writeTxResultPromise.then(result => {
                                let resultTL = result.records;
                                resolve(resultTL[0].get('triplesLoaded').low);
                            }).catch(error => {
                                console.log('err rsc: ', error)
                            }).then(() => {session.close()});
                        });
                        data.on('error', reject);
                    });
                    await endSubConcept;
                } catch(error) {
                    console.log('Catch error sc: ', error);
                }
            };

            // Update the processQueue
            // #3 async
            const updateProcessQueue = async _ => {
                let session = driver.session();
                let getCurrentSubConcept = await session.run("MATCH (n:Resource)-[:BROADER]->(:Resource {uri: $rsc}) RETURN n", {rsc : `http://dbpedia.org/resource/Category:${concept}`});
                let records = getCurrentSubConcept.records;
                let extractedValue = [];

                records.forEach((item, index) => {
                    let sc = item.get('n').properties.uri;
                    // Get name of the category of subconcept
                    let newSC = sc.split(':')[2];
                    extractedValue.push(newSC);
                });
                var promise = Promise.resolve(extractedValue);
                await session.close();
                return promise;
            };

            const buildOntology = async (concept) => {
                try {
                    // Trigger the promise
                    // Input all resource to database
                    let resultRsc = await resultResource(concept);

                    if(resultRsc > 0){
                        // Trigger the promise
                        // Input sub concept to database
                        await resultSubConcept(concept);

                        let updatePQ = await updateProcessQueue();

                        // Check all item in processQueue
                        // If items are already in subConceptChecked
                        // Items will be deleted from processQueue
                        processQueue = processQueue.concat(updatePQ);
                        processQueue = processQueue.filter(function (elements) {
                            return !subConceptChecked.includes(elements);
                        });
                    }
                } catch(error) {
                    console.log('error: ', error);
                }
            };

            await buildOntology(concept);
        } else {
            console.log('pass next concept');
        }
    }

    // Validate item in subConceptChecked (remove duplicates act)
    var setSCC = new Set(subConceptChecked);
    if(setSCC.size !== subConceptChecked.length){
        console.log('Array is contained duplicates value');
    } else {
        console.log('Array is clear');
    }
    console.log('Total iterasi:', i);

    // Set label for root node
    let session = driver.session();
    let setLabelForRootNode = session.writeTransaction(async txc => {
        var result = await txc.run("MATCH (n:Resource {uri: 'http://dbpedia.org/resource/Category:Software_engineering'}) SET n.label = 'Software engineering' RETURN n");
        return result;
    });
    setLabelForRootNode.then(result => {
        //console.log('result set label: ', result);
        if(result.records.length > 0){
            res.send({message: "success"});
        } else {
            res.send({message: "failed"});
        }
    }).catch(error => {
        console.log('error set label: ', error);
    }).then(() => {
        session.close();
    });
});

// Skill Similarity
app.post("/skill-similarity", async (req, res) => {
    // Get required skills
    let firstSkill = req.body.fs;
    let secondSkill = req.body.ss;

    // Fill up all parents from each skill
    let dataOfParentsFS = await getParentofNode(firstSkill);
    let listOfParentsFS = dataOfParentsFS.records;
    let dataOfParentsSS = await getParentofNode(secondSkill);
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
    let totDifFS = getTotalOfDifferenceSkill(finalFsList, finalSsList);     // notasi --> listOfParentsFS \ listOfParentsSS
    let totDifSS = getTotalOfDifferenceSkill(finalSsList, finalFsList);     // notasi --> listOfParentsSS \ listOfParentsFS
    let intersection = getIntersection(finalFsList, finalSsList);           // notasi --> listOfParentsFS n listOfParentsSS

    console.log(totDifFS);
    console.log(totDifSS);
    console.log(intersection);
    console.log('pembagi: ', totDifFS+totDifSS+intersection);
    console.log('pembilang: ', totDifFS+totDifSS);
    console.log('hasil bagi: ', 1 + ((totDifFS+totDifSS)/(totDifFS+totDifSS+intersection)));

    let disimilarity = Math.log(1 + ((totDifFS+totDifSS)/(totDifFS+totDifSS+intersection))) / Math.log(2);
    let similarity = 1 - disimilarity;
    res.send({
        message: 'halo',
        similarity: similarity,
        disimilarity: disimilarity
    });

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
});

async function getParentofNode(skillName){
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

function getTotalOfDifferenceSkill(firstArr, secondArr){
    var result = [];
    result = firstArr.filter((elements) => {
        return !secondArr.some(item => (item.label === elements.label) && (item.uri === elements.uri));
    });
    return result.length;
}

function getIntersection(firstArr, secondArr){
    var result = [];
    result = firstArr.filter((elements) => {
        return secondArr.some(item => (item.label === elements.label) && (item.uri === elements.uri));
    });
    return result.length;
}

function getGamma(firstArr, secondArr) {
    var result = 0;
    if(firstArr.length >= secondArr.length){
        result = secondArr.length / (firstArr.length + secondArr.length);
    } else {
        result = firstArr.length / (firstArr.length + secondArr.length);
    }
    return result;
}

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});