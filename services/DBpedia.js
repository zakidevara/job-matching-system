const sparqlCon = require('@comunica/actor-init-sparql').newEngine;
const DB = require('./DB');


class DBpedia{
    static engine = null;

    static getEngine(){
        if(this.engine == null){
            const engine = sparqlCon();   
            this.engine = engine;
        }
        return this.engine;    
    }    

    // Sends a SPARQL Request
    static async query(query, options, format){
        try{
            const engine = await this.getEngine();
            let result = await engine.query(query, options);
            let { data } = await engine.resultToString(result, format);
            let resultString = ``;
            
            // Data listener for resources
            data.on('data', (chunk) => {
                resultString += chunk;
            });
            
            // Response has been obtained
            // Wrap the end-listener in Promise
            return new Promise(async function(resolve, reject) {
                data.on('end', () => {
                    resolve(resultString);
                });
                data.on('error', reject);
            });
        } catch(error) {
            console.log('DBpedia Error:', error);
            // throw error;
        }
    }

    // Get subresources of a concept from DBpedia SPARQL endpoint
    // Returns an ontology in a form of Turtle
    static async getSubResource(concept){
        try{
            let turtle = await this.query(`
                PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
                PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
                PREFIX dct: <http://purl.org/dc/terms/>
                CONSTRUCT {
                    ?resource dct:subject ?subject .
                    ?subject rdfs:label ?subject_label .
                    ?resource rdf:type ?type .
                    ?resource rdfs:label ?resource_label
                }
                WHERE {
                    ?resource dct:subject ?subject . 
                    ?subject rdfs:label ?subject_label . filter(?subject_label = "${concept}"@en) .
                    ?resource rdf:type ?type . filter(?type = <http://dbpedia.org/ontology/Software> || ?type = <http://dbpedia.org/ontology/Language> || ?type = <http://dbpedia.org/ontology/ProgrammingLanguage>) .
                    ?resource rdfs:label ?resource_label . filter(lang(?resource_label)= "en")
                }
            `, {
                sources: [
                    { type: 'sparql', value: 'https://dbpedia.org/sparql' },
                ],
            }, 'text/turtle');

            return turtle;
        } catch(error) {
            console.log('DBpedia Error:', error);
            // throw error;
        }
    }

    // Get subconcepts of a concept from DBpedia SPARQL endpoint
    // Returns an ontology in a form of Turtle
    static async getSubConcept(concept){
        try{
            let turtle = await this.query(`
                PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
                PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
                CONSTRUCT {
                    ?sub_concepts skos:broader ?broader .
                    ?broader rdfs:label ?broader_label .
                    ?sub_concepts rdfs:label ?sub_concepts_label 
                }
                WHERE{
                    ?sub_concepts a skos:Concept . 
                    ?sub_concepts skos:broader ?broader . 
                    ?broader rdfs:label ?broader_label . filter(?broader_label = "${concept}"@en)                    
                    ?sub_concepts rdfs:label ?sub_concepts_label . filter(lang(?sub_concepts_label)= "en")
                }
            `, {
                sources: [
                    { type: 'sparql', value: 'https://dbpedia.org/sparql' },
                ],
            }, 'text/turtle');

            return turtle;
        } catch(error) {
            console.log('DBpedia Error:', error);
            // throw error;
        }
    }

    //Check if a term exists in dbpedia
    static async checkTerm(term){
        try{
            let isExists = await this.query(`
            PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
            PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
            PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
            ASK  { 
                ?x rdfs:label "${term}"@en . 
                ?x rdf:type ?type . filter(?type = skos:Concept || ?type = <http://dbpedia.org/ontology/Software> || ?type = <http://dbpedia.org/ontology/Language> || ?type = <http://dbpedia.org/ontology/ProgrammingLanguage>)}
            `, {
                sources: [
                    { type: 'sparql', value: 'https://dbpedia.org/sparql' },
                ],
            }, 'application/json');

            return JSON.parse(isExists);
        } catch(error) {
            console.log('DBpedia Error:', error);
            // throw error;
            // return false;
        }
    }
}

async function test(){
    try {
        let turtle = await DBpedia.checkTerm('Web development');
        console.log('result', turtle);
    
        return turtle;
    } catch (error) {
        console.log('DBpedia Error:', error);
        // throw error;
    }
}
test();

module.exports = DBpedia;