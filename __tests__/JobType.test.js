const JobType = require("../model/JobType");
const DB = require("../services/DB");
const {v4: uuidv4 } = require('uuid');

describe('JobType Model Tests', () => {
    let classObj = new JobType('', '');
    const dummyData = [
        {
            id: '1', 
            name:'Full-time',
        },
        {
            id: '2', 
            name:'Project', 
        },
    ];

    // SETUPS AND TEARDOWN
    const initializeJobTypeDatabase = async () => {     
        try {
            let clearStatus = await clearJobTypeDatabase();
            if(clearStatus){
                let promiseArr = [];
                for(const data of dummyData){
                    promiseArr.push(await DB.query(`CREATE (d:JobType {id: '${data.id}', name: '${data.name}'})`));
                }
                await Promise.all(promiseArr);
            }
            return clearStatus;
        } catch (error) {
            return false;
        }
    };

    const clearJobTypeDatabase = async () => {
        try {
            await DB.query("MATCH (d:JobType) DETACH DELETE d");
            return true;
        } catch (error) {
            return false;
        }
    };

    beforeEach(async () => {
        try {
            await initializeJobTypeDatabase();
            return true;
        } catch (error) {
            return false;
        }
    });
      
    afterEach(async () => {
        try {
            await clearJobTypeDatabase();
            return true;
        } catch (error) {
            return false;
        }
    });

    // UNIT TESTING
    let testId = 1;
    // toObject()
    test(`#${testId++} should be able to convert to JavaScript Object`, async () => {
        
        const data = dummyData[0];
        const obj = new JobType(data.id, data.name);
        expect(obj.toObject()).toStrictEqual(data);
        return;
    });
    // constructFromObject()
    test(`#${testId++} should be able to construct object from JavaScript Object`, async () => {
        const data = dummyData[0];
        const obj = new JobType(data.id, data.name);
        expect(classObj.constructFromObject(data)).toStrictEqual(obj);
        expect(obj.getName()).toStrictEqual(data.name);
        return;
    });
    // getAttributes()
    test(`#${testId++} should be able to get all class Attributes`, async () => {
        
        expect(classObj.getAttributes()).toStrictEqual(Object.keys(classObj.toObject()));
        return;
    });
    // all()
    test(`#${testId++} should be able to get all data as an array of JobType from DB`, async () => {
        
        const allData = await classObj.all();
        expect(allData).toEqual(expect.arrayContaining(dummyData.map((item) => classObj.constructFromObject(item))));
        return;
    });
    // findById()
    test(`#${testId++} should be able to get data by id from DB`, async () => {
        
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
    test(`#${testId++} should be able to insert new data to DB`, async () => {

        const id = '99';
        const testDummy = {id: id, name: "Test JobType"};
        let createResult = await classObj.create(testDummy);
        let findByIdData = await classObj.findById(id);

        // Check the return type from create() method and inserted data in DB
        expect(createResult).toStrictEqual(classObj.constructFromObject(testDummy));
        expect(findByIdData).toStrictEqual(classObj.constructFromObject(testDummy));
        return;
    });
    // find()
    test(`#${testId++} should be able to find data based on attributes query`, async () => {
        
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
