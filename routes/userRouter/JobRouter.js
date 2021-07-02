const express = require('express');
const router = express.Router();

const JobController = require('../../application/controllers/JobController');

// router.use(isUser);
// Job route
// Create new job
router.post('/', async function(req, res) {
    try{
        const jobController = new JobController();
        let jobData = req.body;
        jobData.userId = req.user.nim;
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
    try{
        const jobController = new JobController();
        let result = await jobController.all();

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
    try{
        const jobController = new JobController();
        let title = req.query.title;
        let result = await jobController.searchByName(title);

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
        let result = await jobController.deleteJob(jobId);
        
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
    const {jobId} = req.params;
    const userId = req.user.nim;
    try{
        const jobController = new JobController();
        let result = await jobController.applyJob(jobId, userId);
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
        } else {
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
        let result = await jobController.getJobApplicant(jobId);
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
    const {applicantId} = req.body;
    try{
        const jobController = new JobController();
        let result = await jobController.accApplicant(jobId, applicantId);

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
    const {applicantId} = req.body;
    try{
        const jobController = new JobController();
        let result = await jobController.refApplicant(jobId, applicantId);

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