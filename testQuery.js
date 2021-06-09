async function test(){
    const neo4j = require('neo4j-driver');
    const user = "neo4j";
    const password = "fakboi3";
    const uri = "bolt://localhost:7687";
    const driver = neo4j.driver(uri, neo4j.auth.basic(user, password), {
        disableLosslessIntegers: true
    });
    
    let session = driver.session();
    let query = `MATCH (res:User {userID: 1}) RETURN res`;
    let result = await session.run(query);

    console.log(result.records[0].get('res'));
}
test();