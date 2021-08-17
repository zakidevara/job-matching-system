const Skill = require("../model/Skill");

const Job = require("../model/Job");
const JobStudentMatcher = require("../application/matcher/JobStudentMatcher");
const JobRequirement = require("../model/JobRequirement");
const User = require("../model/User");
const util = require('util')


describe('Job Student Matcher Tests', () => {    
    const dummySkillsData = [
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
        {
            id: '9', 
            name:'Network Protocols', 
            uri: 'https://cso.kmi.open.ac.uk/topics/network_protocols',
            fiturTaksonomi: [
                {
                    id: '9', 
                    name:'Network Protocols', 
                    uri: 'https://cso.kmi.open.ac.uk/topics/network_protocols',
                },
                {
                    id: '23', 
                    name:'Computer Networks', 
                    uri: 'https://cso.kmi.open.ac.uk/topics/computer_networks',
                },
                {
                    id: '4', 
                    name:'Computer Science', 
                    uri: 'https://cso.kmi.open.ac.uk/topics/computer_science',
                },
            ],
        },
        {
            id: '10', 
            name:'Javascript', 
            uri: 'https://cso.kmi.open.ac.uk/topics/javascript',
            fiturTaksonomi: [
                {
                    id: '10', 
                    name:'Javascript', 
                    uri: 'https://cso.kmi.open.ac.uk/topics/javascript',
                },
                {
                    id: '24', 
                    name:'World Wide Web', 
                    uri: 'https://cso.kmi.open.ac.uk/topics/world_wide_web',
                },
                {
                    id: '25', 
                    name:'Scripting Languages', 
                    uri: 'https://cso.kmi.open.ac.uk/topics/scripting_languages',
                },
                {
                    id: '5', 
                    name:'High Level Languages', 
                    uri: 'https://cso.kmi.open.ac.uk/topics/high_level_languages',
                },
                {
                    id: '26', 
                    name:'Internet', 
                    uri: 'https://cso.kmi.open.ac.uk/topics/internet',
                },
            ],
        },
        {
            id: '11', 
            name:'Coding Theory', 
            uri: 'https://cso.kmi.open.ac.uk/topics/coding_theory',
            fiturTaksonomi: [
                {
                    id: '11', 
                    name:'Coding Theory', 
                    uri: 'https://cso.kmi.open.ac.uk/topics/coding_theory',
                },
            ],
        },
        {
            id: '12', 
            name:'Database Systems', 
            uri: 'https://cso.kmi.open.ac.uk/topics/database_systems',
            fiturTaksonomi: [
                {
                    id: '12', 
                    name:'Database Systems', 
                    uri: 'https://cso.kmi.open.ac.uk/topics/database_systems',
                },
            ],
        },
        {
            id: '13', 
            name:'Matlab', 
            uri: 'https://cso.kmi.open.ac.uk/topics/matlab',
            fiturTaksonomi: [
                {
                    id: '12', 
                    name:'Matlab', 
                    uri: 'https://cso.kmi.open.ac.uk/topics/matlab',
                },
            ],
        },
        {
            id: '14', 
            name:'Cloud Computing', 
            uri: 'https://cso.kmi.open.ac.uk/topics/cloud_computing',
            fiturTaksonomi: [
                {
                    id: '14', 
                    name:'Cloud Computing', 
                    uri: 'https://cso.kmi.open.ac.uk/topics/cloud_computing',
                },
            ],
        },
        {
            id: '15', 
            name:'HTTP', 
            uri: 'https://cso.kmi.open.ac.uk/topics/http',
            fiturTaksonomi: [
                {
                    id: '15', 
                    name:'HTTP', 
                    uri: 'https://cso.kmi.open.ac.uk/topics/http',
                },
                {
                    id: '27', 
                    name:'Client Computer Systems', 
                    uri: 'https://cso.kmi.open.ac.uk/topics/client_computer_systems',
                },
                {
                    id: '24', 
                    name:'World Wide Web', 
                    uri: 'https://cso.kmi.open.ac.uk/topics/world_wide_web',
                },
            ],
        },
        {
            id: '16', 
            name:'Web Applications', 
            uri: 'https://cso.kmi.open.ac.uk/topics/web_applications',
            fiturTaksonomi: [
                {
                    id: '16', 
                    name:'Web Applications', 
                    uri: 'https://cso.kmi.open.ac.uk/topics/web_applications',
                },
            ],
        },
        {
            id: '17', 
            name:'Operating Systems', 
            uri: 'https://cso.kmi.open.ac.uk/topics/operating_systems',
            fiturTaksonomi: [
                {
                    id: '17', 
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
        {
            id: '18', 
            name:'Distributed Computer Systems', 
            uri: 'https://cso.kmi.open.ac.uk/topics/distributed_computer_systems',
            fiturTaksonomi: [
                {
                    id: '18', 
                    name:'Distributed Computer Systems', 
                    uri: 'https://cso.kmi.open.ac.uk/topics/distributed_computer_systems',
                },
                {
                    id: '28', 
                    name:'Computer Systems', 
                    uri: 'https://cso.kmi.open.ac.uk/topics/computer_systems',
                },
                {
                    id: '4', 
                    name:'Computer Science', 
                    uri: 'https://cso.kmi.open.ac.uk/topics/computer_science',
                },
            ],
        },
        {
            id: '19', 
            name:'Bug Reports', 
            uri: 'https://cso.kmi.open.ac.uk/topics/bug_reports',
            fiturTaksonomi: [
                {
                    id: '19', 
                    name:'Bug Reports', 
                    uri: 'https://cso.kmi.open.ac.uk/topics/bug_reports',
                },
                {
                    id: '29', 
                    name:'Software Engineering', 
                    uri: 'https://cso.kmi.open.ac.uk/topics/software_engineering',
                },
                {
                    id: '4', 
                    name:'Computer Science', 
                    uri: 'https://cso.kmi.open.ac.uk/topics/computer_science',
                },
            ],
        },
        {
            id: '20', 
            name:'Semantic Web', 
            uri: 'https://cso.kmi.open.ac.uk/topics/semantic_web',
            fiturTaksonomi: [
                {
                    id: '20', 
                    name:'Semantic Web', 
                    uri: 'https://cso.kmi.open.ac.uk/topics/semantic_web',
                },
                {
                    id: '24', 
                    name:'World Wide Web', 
                    uri: 'https://cso.kmi.open.ac.uk/topics/world_wide_web',
                },
                {
                    id: '26', 
                    name:'Internet', 
                    uri: 'https://cso.kmi.open.ac.uk/topics/internet',
                },
            ],
        },
        {
            id: '21', 
            name:'Web Development', 
            uri: 'https://cso.kmi.open.ac.uk/topics/web_development',
            fiturTaksonomi: [
                {
                    id: '21', 
                    name:'Web Development', 
                    uri: 'https://cso.kmi.open.ac.uk/topics/web_development',
                },
            ],
        },
        {
            id: '22', 
            name:'Artificial Intelligence', 
            uri: 'https://cso.kmi.open.ac.uk/topics/artificial_intelligence',
            fiturTaksonomi: [
                {
                    id: '22', 
                    name:'Artificial Intelligence', 
                    uri: 'https://cso.kmi.open.ac.uk/topics/artificial_intelligence',
                },
            ],
        },
    ];

    const job1 = {
        id: '1',
        title: 'Software Engineer',
        requirements: {
            requiredSkills: ['7', '9', '2', '10']
        },
    };
    const student1 = {
        id: '1',
        name: 'Zaki',
        skillList: ['17', '2', '18', '19', '15', '20']
    };

    const convertSkillList = (arrayOfSkillId) => {
        return arrayOfSkillId.map((findId) => {
            let skillFound = dummySkillsData.find((skill) => skill.id == findId);
            let skillObj = new Skill(skillFound.id, skillFound.name, skillFound.uri);
            skillObj.setTaxonomyFeatures(skillFound.fiturTaksonomi.map((item) => new Skill(item.id, item.name, item.uri)))
            return skillObj;
        });
    }

    // UNIT TESTING
    let testId = 1;
    // calculateSkillSimilarity()
    test(`#${testId++} should be able to calculate similarity between job and student using sanchez skill similarity`, async () => {
        // expect.assertions(1);
        const jobObject = new Job();
        jobObject.setTitle(job1.title);
        jobObject.setId(job1.id);
        const job1Requirement = new JobRequirement(undefined, undefined, undefined, convertSkillList(job1.requirements.requiredSkills));
        jobObject.setRequirements(job1Requirement);
        // console.log(util.inspect(job1Requirement.getSkills().map(item => item.toObject()), {showHidden: true, depth: null}));

        const studentObject = new User(null, student1.name);
        studentObject.setSkillList(convertSkillList(student1.skillList));
        let temp = await studentObject.getSkills();
        // console.log(util.inspect(temp.map(item => item.toObject()), {showHidden: true, depth: null}));
        
        const actual = await JobStudentMatcher.match(jobObject, studentObject);
        const expected = 0.51;
        expect(actual).toBeCloseTo(expected);
        return;
    });     

});
