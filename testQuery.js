const {v4: uuidv4 } = require('uuid');
async function test(){
    const neo4j = require('neo4j-driver');
    const driver = neo4j.driver('neo4j://165.22.102.112:7687', neo4j.auth.basic('neo4j', 'passwordzk'), {
        disableLosslessIntegers: true
    });
    
    let session = driver.session();
    let query = `MATCH (d:Degree) RETURN d`;
    let result = await session.run(query);

    let list = [];
    if(result.records.length > 0){
        result.records.forEach((item) => {
            let value = item.get('d').properties;
            let obj = {
                id: value.id,
                name: value.name
            };
            list.push(obj);
        });

        for(let i=0; i < list.length; i++){
            let value = list[i];
            let id = uuidv4();
            let query = `MATCH (d:Degree {name: '${value.name}'}) SET d.id = '${id}' RETURN d`;
            let result = await session.run(query);
            console.log(result.records[0].get('d').properties.name);
        }
    }
}
test();