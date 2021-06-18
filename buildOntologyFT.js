// Configure environment
// Lib
const sparqlCon = require('@comunica/actor-init-sparql').newEngine;
const myEngine = sparqlCon();

// Database
const neo4j = require('neo4j-driver');
const user = 'neo4j';
const password = 'seminar';
const uri = 'bolt://localhost:7687';
const driver = neo4j.driver(uri, neo4j.auth.basic(user, password));

// Ontology Builder
async function buildOntology(qConcept){
    var subConceptChecked = [];
    var processQueue = [];
    processQueue = [qConcept];
    let validateConcept = true;
    let i = 0;
    // Enter loop
    while(processQueue.length > 0){
        i++;
        // Pop first element of array
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
                let getCurrentSubConcept = await session.run("MATCH (n:Resource)-[:skos__broader]->(:Resource {uri: $rsc}) RETURN n", {rsc : `http://dbpedia.org/resource/Category:${concept}`});
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
    let session = driver.session();
    let resultSetLabel = await session.run(`MATCH (n:Resource {uri: 'http://dbpedia.org/resource/Category:${qConcept}'}) SET n.label = '${qConcept}' RETURN n`);
    if(resultSetLabel.records.length > 0){
        return 'Success';
    } else {
        return 'Failed';
    }
}

async function main(){
    let result = await buildOntology('HTML');
    console.log('result: ', result);
}

main();