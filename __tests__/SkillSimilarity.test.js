const Skill = require("../model/Skill");
const DB = require("../services/DB");
const {v4: uuidv4 } = require('uuid');

describe('Skill Similarity Tests', () => {
    const dummyData = [
        {
            id: '1', 
            name:'Object Oriented Programming', 
            uri: 'https://cso.kmi.open.ac.uk/topics/object_oriented_programming',
            fiturTaksonomi: [
                {
                    id: '1', 
                    name:'Object Oriented Programming', 
                    uri: 'https://cso.kmi.open.ac.uk/topics/object_oriented_programming',
                },
                {
                    id: '3', 
                    name:'Computer Programming', 
                    uri: 'https://cso.kmi.open.ac.uk/topics/computer_programming',
                },
                {
                    id: '4', 
                    name:'Computer Science', 
                    uri: 'https://cso.kmi.open.ac.uk/topics/computer_science',
                },
            ],
        },
        {
            id: '2', 
            name:'Java', 
            uri: 'https://cso.kmi.open.ac.uk/topics/java',
            fiturTaksonomi: [
                {
                    id: '2', 
                    name:'Java', 
                    uri: 'https://cso.kmi.open.ac.uk/topics/java',
                },
                {
                    id: '1', 
                    name:'Object Oriented Programming', 
                    uri: 'https://cso.kmi.open.ac.uk/topics/object_oriented_programming',
                },
                {
                    id: '5', 
                    name:'High Level Languages', 
                    uri: 'https://cso.kmi.open.ac.uk/topics/high_level_languages',
                },
                {
                    id: '6', 
                    name:'Computer Programming Languages', 
                    uri: 'https://cso.kmi.open.ac.uk/topics/computer_programming_languages',
                },
                {
                    id: '3', 
                    name:'Computer Programming', 
                    uri: 'https://cso.kmi.open.ac.uk/topics/computer_programming',
                },
            ],
        },
        {
            id: '7', 
            name:'Linux', 
            uri: 'https://cso.kmi.open.ac.uk/topics/linux',
            fiturTaksonomi: [
                {
                    id: '7', 
                    name:'Linux', 
                    uri: 'https://cso.kmi.open.ac.uk/topics/linux',
                },
                {
                    id: '8', 
                    name:'Operating Systems', 
                    uri: 'https://cso.kmi.open.ac.uk/topics/operating_systems',
                },
                {
                    id: '4', 
                    name:'Computer Science', 
                    uri: 'https://cso.kmi.open.ac.uk/topics/computer_science',
                },
            ],
        },
    ];

    // UNIT TESTING
    let testId = 1;
    // calculateSkillSimilarity()
    test(`#${testId++} should be able to calculate sanchez similarity between 2 skills`, async () => {
        

        const s1 = dummyData[0];
        const s2 = dummyData[1];
        const skill1 = new Skill(s1.id, s1.name, s1.uri);
        skill1.setTaxonomyFeatures(s1.fiturTaksonomi.map((item) => new Skill(item.id, item.name, item.uri)));

        const skill2 = new Skill(s2.id, s2.name, s2.uri);
        skill2.setTaxonomyFeatures(s2.fiturTaksonomi.map((item) => new Skill(item.id, item.name, item.uri)));
        
        const actual = await skill1.calculateSimilarity(skill2);
        const expected = 0.26;

        expect(actual).toBeCloseTo(expected);
        return;
    });   
    test(`#${testId++} should return 1 if the two skills are the same`, async () => {
        
        const s1 = dummyData[0];
        const s2 = dummyData[0];
        const skill1 = new Skill(s1.id, s1.name, s1.uri);
        skill1.setTaxonomyFeatures(s1.fiturTaksonomi.map((item) => new Skill(item.id, item.name, item.uri)));

        const skill2 = new Skill(s2.id, s2.name, s2.uri);
        skill2.setTaxonomyFeatures(s2.fiturTaksonomi.map((item) => new Skill(item.id, item.name, item.uri)));
        
        const actual = await skill1.calculateSimilarity(skill2);
        const expected = 1;
        expect(actual).toEqual(expected);
        return;
    });   
    test(`#${testId++} should return 0 if the two skills doesn't have any similarity`, async () => {
        
        const s1 = dummyData[1];
        const s2 = dummyData[2];
        const skill1 = new Skill(s1.id, s1.name, s1.uri);
        skill1.setTaxonomyFeatures(s1.fiturTaksonomi.map((item) => new Skill(item.id, item.name, item.uri)));

        const skill2 = new Skill(s2.id, s2.name, s2.uri);
        skill2.setTaxonomyFeatures(s2.fiturTaksonomi.map((item) => new Skill(item.id, item.name, item.uri)));
        
        const actual = await skill1.calculateSimilarity(skill2);
        const expected = 0;
        expect(actual).toEqual(expected);
        return;
    });   

});
