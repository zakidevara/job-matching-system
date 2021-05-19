async function test(){
    const neo4j = require('neo4j-driver');
    const user = "neo4j";
    const password = "fakboi3";
    const uri = "bolt://localhost:7687";
    const driver = neo4j.driver(uri, neo4j.auth.basic(user, password));
    const session = driver.session();
    const personName = 'Alice';
    var label = 'JQuery';
    // var getSubConcept = session.readTransaction( txc => {
    //     var result = txc.run('MATCH (res:Resource {rdfs__label: $labelResource}) Return res', { labelResource: label});
    //     return result;
    // });
    
    // getSubConcept.then(result => {
    //     console.log(result);
    // });
    try {
    const result = await session.run(
        `Match (n:Resource {uri: $uri}) Return n`,
        {
            uri: 'http://dbpedia.org/resource/Category:Software_engineering'
        }
    );
    //console.log(result);
    const singleRecord = result.records;
    // singleRecord.forEach((item, index) => {
    //     console.log(index + '. ', item.get('result').properties.rdfs__label);
    // })
    console.log(singleRecord.length);
    //console.log(singleRecord.get('Resource').properties);
    } finally {
        await session.close()
    }

    // on application exit:
}
test();