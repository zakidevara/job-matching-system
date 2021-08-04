async function setId(){
    const {v4: uuidv4 } = require('uuid');
    const neo4j = require('neo4j-driver');
    const driver = neo4j.driver('neo4j://165.22.102.112:7687', neo4j.auth.basic('neo4j', 'passwordzk'), {
        disableLosslessIntegers: true
    });
    
    let session = driver.session();

    let queryGetSkill  = `MATCH (s:Skill) Return s`;
    let resSkills = await session.run(queryGetSkill);
    let listSkills = [];

    resSkills.records.forEach((item) => {
        let propSkill = item.get('s').properties;
        let objHelper = {
            name: propSkill.name,
            uri: propSkill.uri
        };
        listSkills.push(objHelper);
    });

    for(let i=0; i < listSkills.length; i++){
        let value = listSkills[i];
        let id = uuidv4();
        let querySetId = `MATCH (s:Skill {name: '${value.name}'}) SET s.id = '${id}' RETURN s`;
        let result = await session.run(querySetId);
        console.log('current skill: ', result.records[0].get('s').properties.name);
    }
    await session.close();
    return true;
}

async function main(){
    let result = await setId();
    console.log('apakah berhasil? ', result);
}

main();