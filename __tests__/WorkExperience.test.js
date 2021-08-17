const WorkExperience = require("../model/WorkExperience");
const DB = require("../services/DB");
const {v4: uuidv4 } = require('uuid');

describe('Work Experience Model Tests', () => {
    let classObj = new WorkExperience('', '');
    const dummyData = [
        {
            id: '1', 
            title:'Software engineer',
            workExperienceType: {
                name: 'Full-time',
            },
            companyName:'Tokopedia',
            startDate:'2018-01-23',
            endDate:'2019-07-15',
        },
        {
            id: '2', 
            title:'Software tester',
            workExperienceType: {
                name: 'Part-time',
            },
            companyName:'Traveloka',
            startDate:'2019-01-23',
            endDate:'2020-07-15',
        },
        {
            id: '3', 
            title:'Head of engineering',
            workExperienceType: {
                name: 'Full-time',
            },
            companyName:'Bukalapak',
            startDate:'2014-01-23',
            endDate:'2017-07-15',
        },
    ];
    const toClassObjectArray = async (data) => {
        let promises = data.map(async (item) => {
            let obj = classObj.constructFromObject(item);
            await obj.init();
            return obj;
        });
        let result = await Promise.all(promises);
        return result;
    };
    const toClassObject = async (data) => {
        let obj = classObj.constructFromObject(data);
        await obj.init();
        return obj;
    };
    // SETUPS AND TEARDOWN
    const initializeWorkExpDatabase = async () => {     
        try {
            let clearStatus = await clearWorkExpDatabase();
            if(clearStatus){
                let promiseArr = dummyData.map(async (data) => {
                    let promise = await DB.query(
                        `CREATE (w:WorkExperience {id: '${data.id}', title: '${data.title}', companyName: '${data.companyName}', startDate: '${data.startDate}', endDate: '${data.endDate}'}),
                        (wt:WorkExperienceType {name: '${data.workExperienceType.name}'}),
                        (w)-[:CLASSIFIED]->(wt)`
                    );
                    return promise;
                });
                await Promise.all(promiseArr);
            }
            
            return clearStatus;
        } catch (error) {
            return false;
        }
    };

    const clearWorkExpDatabase = async () => {
        try {
            await DB.query("MATCH (w:WorkExperience)-[:CLASSIFIED]->(wt:WorkExperienceType) DETACH DELETE w, wt");
            return true;
        } catch (error) {
            return false;
        }
    };

    beforeEach(async () => {
        try {
            await initializeWorkExpDatabase();
            return true;
        } catch (error) {
            return false;
        }
    });
      
    afterEach(async () => {
        try {
            await clearWorkExpDatabase();
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
        const obj = new WorkExperience(data.id, data.title, data.workExperienceType, data.companyName, data.startDate, data.endDate);
        // await obj.init();
        expect(obj.toObject()).toStrictEqual(data);
        return;
    });
    // constructFromObject()
    test(`#${testId++} should be able to construct object from JavaScript Object`, async () => {
        
        const data = dummyData[0];
        const obj = new WorkExperience(data.id, data.title, data.workExperienceType, data.companyName, data.startDate, data.endDate);
        await obj.init();
        expect(classObj.constructFromObject(data)).toStrictEqual(obj);
        expect(obj.getTitle()).toStrictEqual(data.title);
        return;
    });
    // getAttributes()
    test(`#${testId++} should be able to get all class Attributes`, async () => {
        
        expect(classObj.getAttributes()).toStrictEqual(Object.keys(classObj.toObject()));
        return;
    });
    // all()
    test(`#${testId++} should be able to get all data as an array of WorkExperience from DB`, async () => {
        
        const allData = await classObj.all();
        const expected = await toClassObjectArray(dummyData);
        expect(allData).toStrictEqual(expected);
        return;
    });
    // findById()
    test(`#${testId++} should be able to get data by id from DB`, async () => {
        
        const id = '1';
        const actual = await classObj.findById(id);
        let expectedObj = dummyData.find((element) => element.id == id);
        expectedObj = await toClassObject(expectedObj);
        expect(actual).toStrictEqual(expectedObj);
        return;
    });
    test(`#${testId++} should throw an error if the requested data id doesnt exist`, async () => {
        const id = '99';
        
        try {
            const actual = await classObj.findById(id);
        } catch (error) {
            expect(error.message).toMatch(`${classObj.constructor.title} dengan id <${id}> tidak ditemukan`);
        }
        return;
    });
    // create()
    test(`#${testId++} should be able to insert new data to DB`, async () => {

        const id = '5';
        const testDummy = {
            id: id, 
            title:'Vice President',
            workExperienceType: {
                id: '1',
                name: 'Full-time',
            },
            companyName:'Amazon',
            startDate:'2018-01-23',
            endDate:'2019-07-15',
        };
        let createResult = await classObj.create(testDummy);
        let findByIdData = await classObj.findById(id);
        let expectedObj = await toClassObject(testDummy);

        // Check the return type from create() method and inserted data in DB
        expect(createResult).toStrictEqual(expectedObj);
        expect(findByIdData).toStrictEqual(expectedObj);
        return;
    });
    // find()
    test(`#${testId++} should be able to find data based on attributes query`, async () => {
        
        const query = {
            title: 'Software engineer'
        };
        const actual = await classObj.find(query);
        const expectedObj = dummyData.find((element) => element.title == query.title);
        expect(actual.map(item => item.toObject())).toContainEqual(expectedObj);
        return;
    });
    // update()
    test(`#${testId++} should be able to update data from JavaScript Object`, async () => {

        let testDummy = dummyData[0];
        testDummy.title = 'Updated Title';
        let updateResult = await classObj.update(testDummy);
        let findByIdData = await classObj.findById(testDummy.id);
        const expected = await toClassObject(testDummy);
        console.log('TEST DUMMY', expected);

        // Check the return type from update() method and updated data in DB
        expect(updateResult).toStrictEqual(expected);
        expect(findByIdData).toStrictEqual(expected);
        return;
    });
    // deleteById()
    test(`#${testId++} should be able to delete data by id`, async () => {
        const id = '1';
        const deletedObj = dummyData.find((element) => element.id == id);
        const deleteResult = await classObj.deleteById(id);
        let allData = await classObj.all();
        expect(deleteResult).toBeTruthy();
        expect(allData.map((item) => item.toObject())).not.toContainEqual(deletedObj);
        return;
    });
    // delete()
    test(`#${testId++} should be able to delete data from instantiated object`, async () => {
    
        const id = '1';
        const deletedObj = dummyData.find((element) => element.id == id);
        let obj = await toClassObject(deletedObj);
        const deleteResult = await obj.delete();
        let allData = await classObj.all();
        expect(deleteResult).toBeTruthy();
        expect(allData.map((item) => item.toObject())).not.toContainEqual(deletedObj);
        return;
    });
    // save()
    test(`#${testId++} should be able to save data from instantiated object`, async () => {
        // 
        const id = '1';
        let savedObj = dummyData.find((element) => element.id == id);
        let obj = await toClassObject(savedObj);
        obj.setTitle('Updated Saved Title');
        savedObj.title = 'Updated Saved Title';
        const saveResult = await obj.save();
        const allData = await classObj.all();
        expect(saveResult).toBeTruthy();
        expect(allData.map((item) => item.toObject())).toContainEqual(savedObj);
        return;
    });

});
