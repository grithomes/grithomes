const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const Note = require('../models/Note');
const User = require('../models/User');
const Team = require('../models/Team');

// Cloudinary Configuration
// The user should set these in their .env file
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'placeholder', 
  api_key: process.env.CLOUDINARY_API_KEY || 'placeholder', 
  api_secret: process.env.CLOUDINARY_API_SECRET || 'placeholder' 
});

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = 'uploads/';
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir)
    },
    filename: function (req, file, cb) {
        cb(null, 'note-' + Date.now() + '-' + file.originalname)
    }
});
const upload = multer({ storage: storage });

// Helper to resolve owner ID
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

// Fetch all notes for a business
router.get('/notes/:userId', async (req, res) => {
    try {
        const ownerId = await resolveOwnerId(req.params.userId);
        if (!ownerId) {
            return res.status(404).json({ success: false, message: 'Owner not found' });
        }
        
        const notes = await Note.find({ ownerId }).sort({ createdAt: -1 });
        res.json({ success: true, notes });
    } catch (error) {
        console.error('Error fetching notes:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Create a new note
router.post('/notes', upload.single('photo'), async (req, res) => {
    try {
        const { content, authorName, authorId, authorModel } = req.body;

        if (!content || !authorName || !authorId || !authorModel) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        const ownerId = await resolveOwnerId(authorId);
        if (!ownerId) {
            return res.status(404).json({ success: false, message: 'Owner not found' });
        }

        let photoUrl = "";
        
        if (req.file) {
            if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_CLOUD_NAME !== 'placeholder') {
                try {
                    const result = await cloudinary.uploader.upload(req.file.path, {
                        folder: "invoice_notes",
                    });
                    photoUrl = result.secure_url;
                    // Clean up local file after upload
                    fs.unlinkSync(req.file.path);
                } catch(cloudErr) {
                    console.error("Cloudinary upload error:", cloudErr);
                    return res.status(500).json({ success: false, message: 'Failed to upload photo to Cloudinary' });
                }
            } else {
                // Fallback to local upload if cloudinary is not configured
                photoUrl = `/${req.file.path.replace(/\\/g, '/')}`;
            }
        }

        const newNote = new Note({
            content,
            authorName,
            authorId,
            authorModel,
            ownerId,
            photoUrl
        });

        await newNote.save();
        res.json({ success: true, note: newNote });

    } catch (error) {
        console.error('Error creating note:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Delete a note
router.post('/notes/delete/:noteId', async (req, res) => {
    try {
        const { userId, isTeamMember } = req.body;
        const noteId = req.params.noteId;

        const note = await Note.findById(noteId);
        if (!note) {
            return res.status(404).json({ success: false, message: 'Note not found' });
        }

        // Permissions:
        // Owner can delete any note.
        // Team member can only delete their own note.
        
        let canDelete = false;
        if (isTeamMember === "false" || isTeamMember === false) {
            // Is owner. Can delete any note within their organization.
            const ownerId = await resolveOwnerId(userId);
            if (ownerId && ownerId.toString() === note.ownerId.toString()) {
                canDelete = true;
            }
        } else {
            // Is team member. Can only delete if they are the author.
            if (note.authorId.toString() === userId.toString()) {
                canDelete = true;
            }
        }

        if (!canDelete) {
            return res.status(403).json({ success: false, message: 'Not authorized to delete this note' });
        }

        await Note.findByIdAndDelete(noteId);
        res.json({ success: true, message: 'Note deleted successfully' });

    } catch (error) {
        console.error('Error deleting note:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Update a note
router.post('/notes/update/:noteId', async (req, res) => {
    try {
        const { userId, isTeamMember, content } = req.body;
        const noteId = req.params.noteId;

        const note = await Note.findById(noteId);
        if (!note) {
            return res.status(404).json({ success: false, message: 'Note not found' });
        }

        // Permissions: Team members can edit their own. Owner can edit any.
        let canEdit = false;
        if (isTeamMember === "false" || isTeamMember === false) {
            const ownerId = await resolveOwnerId(userId);
            if (ownerId && ownerId.toString() === note.ownerId.toString()) {
                canEdit = true;
            }
        } else {
            if (note.authorId.toString() === userId.toString()) {
                canEdit = true;
            }
        }

        if (!canEdit) {
            return res.status(403).json({ success: false, message: 'Not authorized to edit this note' });
        }

        note.content = content;
        await note.save();
        res.json({ success: true, note });

    } catch (error) {
        console.error('Error updating note:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
