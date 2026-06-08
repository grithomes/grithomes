const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const Job = require('../models/Job');
const JobMessage = require('../models/JobMessage');
const User = require('../models/User');
const Team = require('../models/Team');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = 'uploads/';
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir)
    },
    filename: function (req, file, cb) {
        cb(null, 'jobmsg-' + Date.now() + '-' + file.originalname)
    }
});
const upload = multer({ storage: storage });

const resolveOwnerId = async (userId) => {
    try {
        const user = await User.findById(userId);
        if (user) return userId;
        const team = await Team.findById(userId);
        if (team) return team.userid;
        return null;
    } catch(err) {
        return null;
    }
};

// Get all jobs for a business (Owner sees all, team member sees assigned)
router.post('/jobs/list', async (req, res) => {
    try {
        const { userId, isTeamMember } = req.body;
        const ownerId = await resolveOwnerId(userId);
        if (!ownerId) return res.status(404).json({ success: false, message: 'Owner not found' });

        let jobs;
        if (isTeamMember === "false" || isTeamMember === false) {
            jobs = await Job.find({ ownerId }).sort({ createdAt: -1 });
        } else {
            jobs = await Job.find({ ownerId, assignedTeamMembers: userId }).sort({ createdAt: -1 });
        }
        
        res.json({ success: true, jobs });
    } catch (error) {
        console.error('Error fetching jobs:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Get a single job
router.get('/jobs/:jobId', async (req, res) => {
    try {
        const job = await Job.findById(req.params.jobId);
        if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
        res.json({ success: true, job });
    } catch (error) {
        console.error('Error fetching job:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Create Job (Owner only)
router.post('/jobs', async (req, res) => {
    try {
        const { userId, title, description, invoiceId, assignedTeamMembers } = req.body;
        
        // Ensure user is an owner
        const user = await User.findById(userId);
        if (!user) return res.status(403).json({ success: false, message: 'Only admin can create jobs' });

        const newJob = new Job({
            title,
            description,
            ownerId: userId,
            invoiceId,
            assignedTeamMembers: assignedTeamMembers || []
        });

        await newJob.save();
        res.json({ success: true, job: newJob });
    } catch (error) {
        console.error('Error creating job:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Edit Job (Owner only)
router.put('/jobs/:jobId', async (req, res) => {
    try {
        const { userId, title, description, invoiceId, assignedTeamMembers, status } = req.body;
        
        const user = await User.findById(userId);
        if (!user) return res.status(403).json({ success: false, message: 'Only admin can edit jobs' });

        const job = await Job.findByIdAndUpdate(req.params.jobId, {
            title, description, invoiceId, assignedTeamMembers, status
        }, { new: true });

        res.json({ success: true, job });
    } catch (error) {
        console.error('Error updating job:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Get messages for a job
router.post('/jobs/:jobId/messages/list', async (req, res) => {
    try {
        const { userId, isTeamMember } = req.body;
        const jobId = req.params.jobId;

        const job = await Job.findById(jobId);
        if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

        if (isTeamMember === "true" || isTeamMember === true) {
            if (!job.assignedTeamMembers.includes(userId)) {
                return res.status(403).json({ success: false, message: 'Access denied to this job' });
            }
        } else {
            const ownerId = await resolveOwnerId(userId);
            if (job.ownerId.toString() !== ownerId.toString()) {
                return res.status(403).json({ success: false, message: 'Access denied' });
            }
        }

        const messages = await JobMessage.find({ jobId }).sort({ createdAt: 1 });
        res.json({ success: true, messages });

    } catch (error) {
        console.error('Error fetching job messages:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Post a message in a job
router.post('/jobs/:jobId/messages', upload.single('photo'), async (req, res) => {
    try {
        const { authorId, authorName, authorModel, content } = req.body;
        const jobId = req.params.jobId;

        if (!content || !authorId || !authorName || !authorModel) {
            return res.status(400).json({ success: false, message: 'Missing fields' });
        }

        let photoUrl = "";
        
        if (req.file) {
            if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_CLOUD_NAME !== 'placeholder') {
                try {
                    const result = await cloudinary.uploader.upload(req.file.path, {
                        folder: "invoice_jobs",
                    });
                    photoUrl = result.secure_url;
                    fs.unlinkSync(req.file.path);
                } catch(cloudErr) {
                    console.error("Cloudinary upload error:", cloudErr);
                    return res.status(500).json({ success: false, message: 'Failed to upload photo' });
                }
            } else {
                photoUrl = `/${req.file.path.replace(/\\/g, '/')}`;
            }
        }

        const newMessage = new JobMessage({
            jobId,
            authorId,
            authorName,
            authorModel,
            content,
            photoUrl
        });

        await newMessage.save();
        res.json({ success: true, message: newMessage });

    } catch (error) {
        console.error('Error posting job message:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
