const express = require('express');
const router = express.Router();

const JobController = require('../../application/controllers/JobController');
const isUser = require('../../middleware/isUser');
router.use(isUser);
// Job route
// Create new job
router.post('/', async function(req, res) {
    let jobData = req.body;
    let stringReq = jobData.requirements;
    let requirements = null;
    if(typeof stringReq === 'string'){
        let parsedJson = JSON.parse(stringReq);
        requirements = parsedJson;
        jobData.requirements = requirements;
    }
    let companyLogo = null;
    if(req.files){
        companyLogo = req.files.companyLogo;
    }
    jobData.companyLogo = companyLogo;
    jobData.userId = req.user.nim;
    try{
        const jobController = new JobController();
        let result = await jobController.create(jobData);

        res.status(200);
        res.send({ result });
    }catch(e){
        res.status(400);
        let {message} = e;
        res.send({message});
    }
});

// Get all job
router.get('/', async function(req, res) {
    const userId = req.query.userId;
    try{
        const jobController = new JobController();
        let result = await jobController.all(userId);

        res.status(200);
        res.send({ result });
    }catch(e){
        res.status(400);
        let {message} = e;
        res.send({message});
    }
});

// Search job
router.get('/search', async function(req, res) {
    const {
        page = 1,
        keyword,
        sort = 'similarity',
        fJobType,
        fStudyProgram,
        fClassYear,
        fMinSalary,
        fMaxSalary,
        fRemoteStatus,
        fAge,
    } = req.query;
    const query = {
        page,
        keyword,
        sort,
        fJobType: fJobType instanceof Array || fJobType === undefined ? fJobType : Array(fJobType),
        fStudyProgram: fStudyProgram instanceof Array || fStudyProgram === undefined ? fStudyProgram : Array(fStudyProgram),
        fClassYear: fClassYear instanceof Array || fClassYear === undefined ? fClassYear : Array(fClassYear),
        fMinSalary,
        fMaxSalary,
        fAge,
        fRemoteStatus: fRemoteStatus instanceof Array || fRemoteStatus === undefined ? fRemoteStatus : Array(fRemoteStatus),
    };
    console.log(query);
    try{
        const jobController = new JobController();
        let result = await jobController.search(query);

        res.status(200);
        res.send({ result });
    }catch(e){
        res.status(400);
        let {message} = e;
        res.send({message});
    }
});

// Recommendation job
router.get('/recommendation', async function(req, res) {
    const userId = req.user.nim;
    let limitJob = 20;
    try{
        const jobController = new JobController();
        let result = await jobController.getJobRecommendation(userId, limitJob);

        res.status(200);
        res.send({ result });
    }catch(e){
        res.status(400);
        let {message} = e;
        res.send({message});
    }
});

// Get job by id
router.get('/:jobId', async function(req, res) {
    const {jobId} = req.params;
    try{
        const jobController = new JobController();
        let result = await jobController.find(jobId);

        res.status(200);
        res.send({ result });
    }catch(e){
        res.status(400);
        let {message} = e;
        res.send({message});
    }
});
// Delete job
router.delete('/:jobId', async function(req, res) {
    const {jobId} = req.params;
    try{
        const jobController = new JobController();
        let result = await jobController.delete(jobId);
        
        res.status(200);
        res.send({ result });
    }catch(e){
        res.status(400);
        let {message} = e;
        res.send({message});
    }
});
// Update job
router.put('/:jobId', async function(req, res) {
    const {jobId} = req.params;
    const jobData = req.body;
    let stringReq = jobData.requirements;
    let requirements = null;
    if(typeof stringReq === 'string'){
        let parsedJson = JSON.parse(stringReq);
        requirements = parsedJson;
        jobData.requirements = requirements;
    }
    let companyLogo = null;
    if(req.files){
        companyLogo = req.files.companyLogo;
    }
    jobData.companyLogo = companyLogo;

    try{
        const jobController = new JobController();
        let result = await jobController.update(jobId, jobData);

        res.status(200);
        res.send({ result });
    }catch(e){
        res.status(400);
        let {message} = e;
        res.send({message});
    }
}); 
// Apply job
router.post('/:jobId/apply', async function(req, res){
    const {
        jobId,
    } = req.params;
    let applicantDocuments = null;
    if(req.files){
        applicantDocuments = req.files.applicantDocuments;
    }
    const userId = req.user.nim;

    try{
        const jobController = new JobController();
        let result = await jobController.applyJob(jobId, userId, applicantDocuments);
        let message, status;
        if(result === 0){
            status = false;
            message = 'Gagal melamar'
        } else if(result === 2){
            status = false;
            message = 'Job tidak ditemukan';
        } else if(result === 3){
            status = false;
            message = 'User tidak ditemukan';
        } else if(result === 4){
            status = false;
            message = 'Job sudah tidak aktif';
        } else if(result === 5){
            status = false;
            message = 'User sudah pernah melamar ke lowongan pekerjaan yang dipilih';
        } else if (result === 6){ 
            status = false;
            message = 'Dokumen yang dimasukkan harus berekstensi zip';
        }else {
            status = true;
            message = 'Berhasil melamar'
        }
    
        res.status(200);
        res.send({
            status: status,
            message: message
        });
    }catch(e){
        res.status(400);
        let {message} = e;
        res.send({message});
    }
});
// Get applicant
router.get('/:jobId/applicants', async function(req, res) {
    const {jobId} = req.params;
    try{
        const jobController = new JobController();
        let result = await jobController.getJobApplicants(jobId);

        result = result.map(item => {
            if(item.applicantDocuments === ""){
                delete item['applicantDocuments'];
            }else{
                item.applicantDocuments = `${process.env.APP_URL}/v1/file?filePath=` + user.applicantDocuments.replace('.', '');  
            }
            return item;
        })

        res.send({ result });
    }catch(e){
        res.status(400);
        let {message} = e;
        res.send({message});
    }
});
// Accept applicant
router.post('/:jobId/applicants/accept', async function(req, res) {
    const {jobId} = req.params;
    const applicantData = req.body;
    try{
        const jobController = new JobController();
        let result = await jobController.accApplicant(jobId, applicantData);

        res.status(200);
        res.send({ result });
    } catch(e){
        res.status(400);
        let {message} = e;
        res.send({message});
    }
});
// Refuse applicant
router.post('/:jobId/applicants/refuse', async function(req, res) {
    const {jobId} = req.params;
    const applicantData = req.body;
    try{
        const jobController = new JobController();
        let result = await jobController.refApplicant(jobId, applicantData);

        res.status(200)
        res.send({ result });
    } catch(e){
        res.status(400);
        let {message} = e;
        res.send({message});
    }
});
// Recommendation applicant
router.get('/:jobId/applicants/recommendation', async function(req, res){
    const {jobId} = req.params;
    try{
        const jobController = new JobController();
        let result = await jobController.getApplicantRecommendation(jobId);

        res.status(200);
        res.send({
            status: 1,
            applicants: result
        });
    }catch(e){
        res.status(400);
        let {message} = e;
        res.send({message});
    }
});

module.exports = router;