const Skill = require("../model/Skill");
const DB = require("../services/DB");
const {v4: uuidv4 } = require('uuid');

describe('Skill Model Tests', () => {
    let classObj = new Skill('', '');
    const dummyData = [
        {
            id: '1', 
            name:'PHP', 
            uri: 'http://dbpedia.org/resource/PHP'
        },
        {
            id: '2', 
            name:'JavaScript', 
            uri: 'http://dbpedia.org/resource/JavaScript'
        },
        {
            id: '3', 
            name:'Python (programming language)', 
            uri: 'http://dbpedia.org/resource/Python_(programming_language)'
        },
        {
            id: '4', 
            name:'Machine learning', 
            uri: 'http://dbpedia.org/resource/Machine_learning'
        },
        {
            id: '5', 
            name:'Android software development', 
            uri: 'http://dbpedia.org/resource/Android_software_development'
        },
    ];

    // SETUPS AND TEARDOWN
    const initializeSkillDatabase = async () => {     
        try {
            let clearStatus = await clearSkillDatabase();
            if(clearStatus){
                let promiseArr = [];
                for(const data of dummyData){
                    promiseArr.push(await DB.query(`CREATE (sk:Skill:Dummy {id: '${data.id}', name: '${data.name}', uri: '${data.uri}'})`));
                }
                await Promise.all(promiseArr);
            }
            return clearStatus;
        } catch (error) {
            return false;
        }
    };

    const clearSkillDatabase = async () => {
        try {
            await DB.query("MATCH (sk:Skill:Dummy) DETACH DELETE sk");
            return true;
        } catch (error) {
            return false;
        }
    };

    beforeEach(async () => {
        try {
            await initializeSkillDatabase();
            return true;
        } catch (error) {
            return false;
        }
    });
      
    afterEach(async () => {
        try {
            await clearSkillDatabase();
            return true;
        } catch (error) {
            return false;
        }
    });

    // UNIT TESTING
    let testId = 1;
    // toObject()
    test(`#${testId++} should be able to convert to JavaScript Object`, async () => {
        expect.assertions(1);
        const data = dummyData[0];
        const obj = new Skill(data.id, data.name, data.uri);
        expect(obj.toObject()).toStrictEqual(data);
        return;
    });
    // constructFromObject()
    test(`#${testId++} should be able to construct object from JavaScript Object`, async () => {
        expect.assertions(2);
        const data = dummyData[0];
        const obj = new Skill(data.id, data.name);
        expect(classObj.constructFromObject(data)).toStrictEqual(obj);
        expect(obj.getName()).toStrictEqual(data.name);
        return;
    });
    // getAttributes()
    test(`#${testId++} should be able to get all class Attributes`, async () => {
        expect.assertions(1);
        expect(classObj.getAttributes()).toStrictEqual(Object.keys(classObj.toObject()));
        return;
    });
    // all()
    test(`#${testId++} should be able to get all data as an array of Skill from DB`, async () => {
        expect.assertions(1);
        const allData = await classObj.all();
        expect(allData).toEqual(expect.arrayContaining(dummyData.map((item) => classObj.constructFromObject(item))));
        return;
    });
    // findById()
    test(`#${testId++} should be able to get data by id from DB`, async () => {
        expect.assertions(1);
        const id = '1';
        const actual = await classObj.findById(id);
        const expectedObj = dummyData.find((element) => element.id == id);
        expect(actual).toStrictEqual(classObj.constructFromObject(expectedObj));
        return;
    });
    test(`#${testId++} should throw an error if the requested data id doesnt exist`, async () => {
        const id = '99';
        
        try {
            const actual = await classObj.findById(id);
        } catch (error) {
            expect(error.message).toMatch(`${classObj.constructor.name} dengan id <${id}> tidak ditemukan`);
        }
        return;
    });
    // create()
    // test(`#${testId++} should be able to insert new data to DB`, async () => {

    //     const id = '5';
    //     const testDummy = {id: id, name: "Test"};
    //     let createResult = await classObj.create(testDummy);
    //     let findByIdData = await classObj.findById(id);

    //     // Check the return type from create() method and inserted data in DB
    //     expect(createResult).toStrictEqual(classObj.constructFromObject(testDummy));
    //     expect(findByIdData).toStrictEqual(classObj.constructFromObject(testDummy));
    //     return;
    // });
    // find()
    test(`#${testId++} should be able to find data based on attributes query`, async () => {
        expect.assertions(1);
        const query = {
            name: 'PHP'
        };
        const actual = await classObj.find(query);
        const expectedObj = dummyData.find((element) => element.name == query.name);
        expect(actual.map(item => item.toObject())).toContainEqual(expectedObj);
        return;
    });
    // update()
    test(`#${testId++} should be able to update data from JavaScript Object`, async () => {

        let testDummy = dummyData[0];
        testDummy.name = 'Updated Name';
        let updateResult = await classObj.update(testDummy);
        let findByIdData = await classObj.findById(testDummy.id);

        // Check the return type from update() method and updated data in DB
        expect(updateResult).toStrictEqual(classObj.constructFromObject(testDummy));
        expect(findByIdData).toStrictEqual(classObj.constructFromObject(testDummy));
        return;
    });
    // deleteById()
    test(`#${testId++} should be able to delete data by id`, async () => {
        expect.assertions(2);
        const id = '1';
        const deletedObj = dummyData.find((element) => element.id == id);
        const deleteResult = await classObj.deleteById(id);
        const allData = await classObj.all();
        expect(deleteResult).toBeTruthy();
        expect(allData.map((item) => item.toObject())).not.toContainEqual(deletedObj);
        return;
    });
    // delete()
    test(`#${testId++} should be able to delete data from instantiated object`, async () => {
        // expect.assertions(2);
        const id = '1';
        const deletedObj = dummyData.find((element) => element.id == id);
        const obj = classObj.constructFromObject(deletedObj);
        const deleteResult = await obj.delete();
        const allData = await classObj.all();
        expect(deleteResult).toBeTruthy();
        expect(allData.map((item) => item.toObject())).not.toContainEqual(deletedObj);
        return;
    });
    // save()
    test(`#${testId++} should be able to save data from instantiated object`, async () => {
        // expect.assertions(2);
        const id = '1';
        let savedObj = dummyData.find((element) => element.id == id);
        savedObj.name = 'Updated Saved Name';
        let obj = classObj.constructFromObject(savedObj);
        obj.setName(savedObj.name);
        const saveResult = await obj.save();
        const allData = await classObj.all();
        expect(saveResult).toBeTruthy();
        expect(allData.map((item) => item.toObject())).toContainEqual(savedObj);
        return;
    });
    

});
