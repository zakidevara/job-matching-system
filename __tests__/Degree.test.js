const Degree = require("../model/Degree");
const DB = require("../services/DB");
const {v4: uuidv4 } = require('uuid');

describe('Degree Model Tests', () => {
    let classObj = new Degree('', '');
    const dummyData = [
        {
            name:'SMK/SMA',
        },
        {
            name:'Diploma III', 
        },
        {
            name:'Diploma IV', 
        },
        {
            name:'Strata I', 
        },
        {
            name:'Strata II', 
        },
    ];

    // SETUPS AND TEARDOWN
    const initializeDegreeDatabase = async () => {     
        try {
            let clearStatus = await clearDegreeDatabase();
            if(clearStatus){
                let promiseArr = [];
                for(const data of dummyData){
                    promiseArr.push(await DB.query(`CREATE (d:Degree {name: '${data.name}'})`));
                }
                await Promise.all(promiseArr);
            }
            return clearStatus;
        } catch (error) {
            return false;
        }
    };

    const clearDegreeDatabase = async () => {
        try {
            await DB.query("MATCH (d:Degree) DETACH DELETE d");
            return true;
        } catch (error) {
            return false;
        }
    };

    beforeEach(async () => {
        try {
            await initializeDegreeDatabase();
            return true;
        } catch (error) {
            return false;
        }
    });
      
    afterEach(async () => {
        try {
            await clearDegreeDatabase();
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
        const obj = new Degree(data.name);
        expect(obj.toObject()).toStrictEqual(data);
        return;
    });
    // constructFromObject()
    test(`#${testId++} should be able to construct object from JavaScript Object`, async () => {
        const data = dummyData[0];
        const obj = new Degree(data.name);
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
    test(`#${testId++} should be able to get all data as an array of Degree from DB`, async () => {
        
        const allData = await classObj.all();
        expect(allData).toEqual(expect.arrayContaining(dummyData.map((item) => classObj.constructFromObject(item))));
        return;
    });
    // findById()
    test(`#${testId++} should be able to get data by id from DB`, async () => {
        
        const id = 'SMK/SMA';
        const actual = await classObj.findById(id);
        const expectedObj = dummyData.find((element) => element.name == id);
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

        const testDummy = {name: "Test Degree"};
        let createResult = await classObj.create(testDummy);
        let findByIdData = await classObj.findById(testDummy.name);

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
        let findByIdData = await classObj.findById(testDummy.name);

        // Check the return type from update() method and updated data in DB
        expect(updateResult).toStrictEqual(classObj.constructFromObject(testDummy));
        expect(findByIdData).toStrictEqual(classObj.constructFromObject(testDummy));
        return;
    });
    // deleteById()
    test(`#${testId++} should be able to delete data by id`, async () => {
        const id = 'SMK/SMA';
        const deletedObj = dummyData.find((element) => element.name == id);
        const deleteResult = await classObj.deleteById(id);
        const allData = await classObj.all();
        expect(deleteResult).toBeTruthy();
        expect(allData.map((item) => item.toObject())).not.toContainEqual(deletedObj);
        return;
    });
    // delete()
    test(`#${testId++} should be able to delete data from instantiated object`, async () => {
        
        const id = 'SMK/SMA';
        const deletedObj = dummyData.find((element) => element.name == id);
        const obj = classObj.constructFromObject(deletedObj);
        const deleteResult = await obj.delete();
        const allData = await classObj.all();
        expect(deleteResult).toBeTruthy();
        expect(allData.map((item) => item.toObject())).not.toContainEqual(deletedObj);
        return;
    });
    // save()
    test(`#${testId++} should be able to save data from instantiated object`, async () => {
        
        const id = 'SMK/SMA';
        let savedObj = dummyData.find((element) => element.name == id);
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
