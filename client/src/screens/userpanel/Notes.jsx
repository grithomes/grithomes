import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import { useNavigate } from 'react-router-dom';
import { ColorRing } from 'react-loader-spinner';
import Alertauthtoken from '../../components/Alertauthtoken';

export default function Notes() {
    const [loading, setLoading] = useState(true);
    const [notes, setNotes] = useState([]);
    const [content, setContent] = useState('');
    const [photo, setPhoto] = useState(null);
    const [alertMessage, setAlertMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Edit state
    const [editingNoteId, setEditingNoteId] = useState(null);
    const [editContent, setEditContent] = useState('');

    const navigate = useNavigate();

    const currentUserId = localStorage.getItem("userid");
    const isTeamMember = localStorage.getItem("isTeamMember") === "true";
    const currentUserName = localStorage.getItem("username") || "Owner";

    useEffect(() => {
        if (!localStorage.getItem("authToken") || isTeamMember) {
            navigate("/");
            return;
        }
        fetchNotes();
    }, []);

    const fetchNotes = async () => {
        try {
            const authToken = localStorage.getItem('authToken');
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/notes/${currentUserId}`, {
                headers: {
                    'Authorization': authToken,
                }
            });

            if (response.status === 401) {
                const json = await response.json();
                setAlertMessage(json.message);
                setLoading(false);
                return;
            }

            const data = await response.json();
            if (data.success) {
                setNotes(data.notes);
            }
            setLoading(false);
        } catch (error) {
            console.error('Error fetching notes:', error);
            setLoading(false);
        }
    };

    const handlePhotoChange = (e) => {
        setPhoto(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content.trim()) return;

        setIsSubmitting(true);
        const authToken = localStorage.getItem('authToken');
        
        const formData = new FormData();
        formData.append('content', content);
        formData.append('authorName', currentUserName);
        formData.append('authorId', currentUserId);
        formData.append('authorModel', 'user');
        if (photo) {
            formData.append('photo', photo);
        }

        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/notes`, {
                method: 'POST',
                headers: {
                    'Authorization': authToken,
                },
                body: formData
            });

            const data = await response.json();
            if (data.success) {
                setContent('');
                setPhoto(null);
                // Clear file input
                const fileInput = document.getElementById('photoInput');
                if(fileInput) fileInput.value = '';
                fetchNotes();
            } else {
                setAlertMessage(data.message || 'Failed to post note.');
            }
        } catch (error) {
            console.error('Error posting note:', error);
            setAlertMessage('Server error.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (noteId) => {
        if (!window.confirm("Are you sure you want to delete this note?")) return;

        const authToken = localStorage.getItem('authToken');
        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/notes/delete/${noteId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': authToken,
                },
                body: JSON.stringify({
                    userId: currentUserId,
                    isTeamMember: isTeamMember
                })
            });

            const data = await response.json();
            if (data.success) {
                fetchNotes();
            } else {
                setAlertMessage(data.message || 'Failed to delete note.');
            }
        } catch (error) {
            console.error('Error deleting note:', error);
        }
    };

    const startEditing = (note) => {
        setEditingNoteId(note._id);
        setEditContent(note.content);
    };

    const cancelEditing = () => {
        setEditingNoteId(null);
        setEditContent('');
    };

    const submitEdit = async (noteId) => {
        if (!editContent.trim()) return;

        const authToken = localStorage.getItem('authToken');
        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/notes/update/${noteId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': authToken,
                },
                body: JSON.stringify({
                    userId: currentUserId,
                    isTeamMember: isTeamMember,
                    content: editContent
                })
            });

            const data = await response.json();
            if (data.success) {
                setEditingNoteId(null);
                setEditContent('');
                fetchNotes();
            } else {
                setAlertMessage(data.message || 'Failed to update note.');
            }
        } catch (error) {
            console.error('Error updating note:', error);
        }
    };

    // Owner can delete any note. Owner can edit only their own note or we let them edit any? 
    // Plan: owner can delete any. Team member delete/edit own. So owner can edit their own note.
    const canDelete = (note) => {
        // Owner can delete any
        return true;
    };

    const canEdit = (note) => {
        // Owner can edit any
        return true;
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className='bg'>
            {loading ? (
                <div className="flex justify-center items-center min-h-screen">
                    <ColorRing loading={loading} />
                </div>
            ) : (
                <div className='w-full'>
                    <div className="flex flex-col md:flex-row">
                        <Sidebar />
                        <div className="flex-1 w-full mx-auto px-4">
                            <div className='mt-6 mx-4'>
                                {alertMessage && <Alertauthtoken message={alertMessage} onClose={() => setAlertMessage('')} />}
                            </div>
                            
                            <div className='flex flex-wrap items-center justify-between py-6 px-4 mb-6 bg-white shadow-sm rounded-xl border border-gray-100 mx-4'>
                                <div>
                                    <p className='text-3xl font-bold text-gray-800'>Team Notes</p>
                                    <nav aria-label="breadcrumb">
                                        <ol className="flex text-sm text-gray-500 mt-2 space-x-2">
                                            <li><a href="/userpanel/Userdashboard" className='hover:text-primary transition-colors text-decoration-none'>Dashboard</a></li>
                                            <li><span className="mx-2">/</span></li>
                                            <li className="text-gray-800 font-semibold" aria-current="page">Notes</li>
                                        </ol>
                                    </nav>
                                </div>
                            </div>

                            <div className="mx-4 mb-8">
                                {/* Post a new note */}
                                <div className="card-standard p-6 mb-6">
                                    <h4 className="text-lg font-bold text-gray-800 mb-4">Post an Update</h4>
                                    <form onSubmit={handleSubmit}>
                                        <div className="mb-4">
                                            <textarea 
                                                className="input-standard w-full min-h-[100px] resize-y" 
                                                placeholder="Write an update or instruction for the team..."
                                                value={content}
                                                onChange={(e) => setContent(e.target.value)}
                                                required
                                            ></textarea>
                                        </div>
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <div className="flex items-center">
                                                <label className="cursor-pointer flex items-center gap-2 text-primary hover:text-blue-700 transition-colors font-medium">
                                                    <i className="fa-solid fa-camera text-xl"></i>
                                                    <span>{photo ? photo.name : 'Attach Photo'}</span>
                                                    <input 
                                                        type="file" 
                                                        id="photoInput"
                                                        accept="image/*" 
                                                        className="hidden" 
                                                        onChange={handlePhotoChange} 
                                                    />
                                                </label>
                                            </div>
                                            <button 
                                                type="submit" 
                                                disabled={isSubmitting || !content.trim()} 
                                                className="btn-primary disabled:opacity-50 px-8 py-2.5"
                                            >
                                                {isSubmitting ? 'Posting...' : 'Post Note'}
                                            </button>
                                        </div>
                                    </form>
                                </div>

                                {/* Feed */}
                                <div className="space-y-4">
                                    {notes.length === 0 ? (
                                        <div className="text-center py-12 card-standard">
                                            <div className="w-16 h-16 mx-auto bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                                <i className="fa-solid fa-note-sticky text-2xl text-gray-400"></i>
                                            </div>
                                            <h3 className="text-lg font-medium text-gray-900 mb-1">No notes yet</h3>
                                            <p className="text-gray-500">Post an update to start communicating with your team.</p>
                                        </div>
                                    ) : (
                                        notes.map((note) => (
                                            <div key={note._id} className="card-standard p-6 transition-all hover:shadow-md border-l-4 border-primary">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-primary font-bold uppercase">
                                                            {note.authorName.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-gray-800">{note.authorName} <span className="text-xs font-normal text-gray-500 ml-2 py-0.5 px-2 bg-gray-100 rounded-full">{note.authorModel === 'user' ? 'Owner' : 'Team'}</span></p>
                                                            <p className="text-xs text-gray-500">{formatDate(note.createdAt)}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        {canEdit(note) && (
                                                            <button onClick={() => startEditing(note)} className="p-2 text-gray-400 hover:text-blue-600 transition-colors" title="Edit Note">
                                                                <i className="fa-solid fa-pen"></i>
                                                            </button>
                                                        )}
                                                        {canDelete(note) && (
                                                            <button onClick={() => handleDelete(note._id)} className="p-2 text-gray-400 hover:text-red-600 transition-colors" title="Delete Note">
                                                                <i className="fa-solid fa-trash"></i>
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>

                                                {editingNoteId === note._id ? (
                                                    <div className="mt-2">
                                                        <textarea 
                                                            className="input-standard w-full mb-3" 
                                                            value={editContent}
                                                            onChange={(e) => setEditContent(e.target.value)}
                                                        ></textarea>
                                                        <div className="flex gap-2 justify-end">
                                                            <button onClick={cancelEditing} className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors text-sm font-bold">Cancel</button>
                                                            <button onClick={() => submitEdit(note._id)} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-bold">Save</button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                                                        {note.content}
                                                    </div>
                                                )}

                                                {note.photoUrl && (
                                                    <div className="mt-4 rounded-xl overflow-hidden border border-gray-100 max-w-lg">
                                                        <img src={note.photoUrl.startsWith('http') ? note.photoUrl : `${import.meta.env.VITE_API_BASE_URL}${note.photoUrl}`} alt="Attachment" className="w-full h-auto object-cover" />
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
