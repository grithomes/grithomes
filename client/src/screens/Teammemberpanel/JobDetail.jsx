import React, { useState, useEffect, useRef } from 'react';
import Teamnavbar from './Teamnavbar';
import { useNavigate, useParams } from 'react-router-dom';
import { ColorRing } from 'react-loader-spinner';
import Alertauthtoken from '../../components/Alertauthtoken';

export default function JobDetail() {
    const { jobId } = useParams();
    const [loading, setLoading] = useState(true);
    const [job, setJob] = useState(null);
    const [messages, setMessages] = useState([]);
    const [content, setContent] = useState('');
    const [photo, setPhoto] = useState(null);
    const [alertMessage, setAlertMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const messagesEndRef = useRef(null);
    const navigate = useNavigate();

    const currentUserId = localStorage.getItem("userid");
    const isTeamMember = localStorage.getItem("isTeamMember") === "true";
    const currentUserName = localStorage.getItem("username") || "Team Member";

    useEffect(() => {
        if (!localStorage.getItem("authToken") || !isTeamMember) {
            navigate("/");
            return;
        }
        fetchData();
        
        const interval = setInterval(() => {
            fetchMessages();
        }, 10000);
        return () => clearInterval(interval);
    }, [jobId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const fetchData = async () => {
        try {
            const authToken = localStorage.getItem('authToken');
            
            const jobRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/jobs/${jobId}`, {
                headers: { 'Authorization': authToken }
            });
            const jobData = await jobRes.json();
            
            if (jobData.success) {
                setJob(jobData.job);
                await fetchMessages();
            } else {
                setAlertMessage(jobData.message || 'Job not found');
            }
            setLoading(false);
        } catch (error) {
            console.error('Error fetching job:', error);
            setLoading(false);
        }
    };

    const fetchMessages = async () => {
        try {
            const authToken = localStorage.getItem('authToken');
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/jobs/${jobId}/messages/list`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': authToken,
                },
                body: JSON.stringify({ userId: currentUserId, isTeamMember: true })
            });
            const data = await res.json();
            if (data.success) {
                setMessages(data.messages);
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    const handlePhotoChange = (e) => {
        setPhoto(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content.trim() && !photo) return;

        setIsSubmitting(true);
        const authToken = localStorage.getItem('authToken');
        
        const formData = new FormData();
        formData.append('content', content || (photo ? 'Sent a photo' : ''));
        formData.append('authorName', currentUserName);
        formData.append('authorId', currentUserId);
        formData.append('authorModel', 'team');
        if (photo) {
            formData.append('photo', photo);
        }

        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/jobs/${jobId}/messages`, {
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
                const fileInput = document.getElementById('photoInputTeam');
                if(fileInput) fileInput.value = '';
                fetchMessages();
            } else {
                setAlertMessage(data.message || 'Failed to post message.');
            }
        } catch (error) {
            console.error('Error posting message:', error);
            setAlertMessage('Server error.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) + ', ' + date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
    };

    return (
        <div className='bg'>
            {loading ? (
                <div className="flex justify-center items-center min-h-screen">
                    <ColorRing loading={loading} />
                </div>
            ) : (
                <div className='w-full h-screen flex flex-col overflow-hidden'>
                    <div className="flex flex-col md:flex-row h-full">
                        <div className="w-full md:w-64 flex-shrink-0 h-full overflow-y-auto">
                            <Teamnavbar />
                        </div>
                        <div className="flex-1 w-full mx-auto px-4 flex flex-col h-full py-4">
                            {alertMessage && <div className="mb-4"><Alertauthtoken message={alertMessage} onClose={() => setAlertMessage('')} /></div>}
                            
                            <div className='flex items-center justify-between py-4 px-6 bg-white shadow-sm rounded-t-xl border border-gray-100 flex-shrink-0'>
                                <div>
                                    <div className="flex items-center gap-3">
                                        <button onClick={() => navigate('/Teammemberpanel/MyJobs')} className="text-gray-400 hover:text-primary transition-colors">
                                            <i className="fa-solid fa-arrow-left text-xl"></i>
                                        </button>
                                        <h1 className='text-2xl font-bold text-gray-800'>{job?.title || 'Job Group'}</h1>
                                    </div>
                                    {job?.description && <p className="text-sm text-gray-500 mt-1 ml-8">{job.description}</p>}
                                </div>
                            </div>

                            <div className="flex-1 bg-gray-50 flex flex-col border-x border-gray-100 overflow-hidden relative">
                                <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
                                    {messages.length === 0 ? (
                                        <div className="h-full flex flex-col items-center justify-center text-center">
                                            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                                                <i className="fa-solid fa-comments text-2xl text-blue-300"></i>
                                            </div>
                                            <p className="text-gray-500 font-medium">No messages yet.</p>
                                            <p className="text-sm text-gray-400">Start the conversation with your team.</p>
                                        </div>
                                    ) : (
                                        messages.map((msg) => {
                                            const isMe = msg.authorId === currentUserId;
                                            return (
                                                <div key={msg._id} className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'}`}>
                                                    <div className={`max-w-[75%] md:max-w-[60%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                                        <span className="text-xs text-gray-500 mb-1 ml-1 font-medium">
                                                            {isMe ? 'You' : msg.authorName}
                                                        </span>
                                                        <div className={`p-3 rounded-2xl ${isMe ? 'bg-primary text-white rounded-tr-none' : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none shadow-sm'}`}>
                                                            {msg.photoUrl && (
                                                                <div className="mb-2">
                                                                    <a href={msg.photoUrl.startsWith('http') ? msg.photoUrl : `${import.meta.env.VITE_API_BASE_URL}${msg.photoUrl}`} target="_blank" rel="noreferrer">
                                                                        <img src={msg.photoUrl.startsWith('http') ? msg.photoUrl : `${import.meta.env.VITE_API_BASE_URL}${msg.photoUrl}`} alt="Attachment" className="rounded-lg max-h-60 object-contain" />
                                                                    </a>
                                                                </div>
                                                            )}
                                                            <p className="whitespace-pre-wrap leading-snug">{msg.content}</p>
                                                        </div>
                                                        <span className="text-[10px] text-gray-400 mt-1 mr-1">{formatDate(msg.createdAt)}</span>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>
                            </div>

                            <div className="bg-white p-4 rounded-b-xl border border-gray-100 flex-shrink-0">
                                <form onSubmit={handleSubmit} className="flex items-end gap-2">
                                    <label className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center cursor-pointer transition-colors text-gray-500 hover:text-primary">
                                        <i className="fa-solid fa-camera"></i>
                                        <input type="file" id="photoInputTeam" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                                    </label>
                                    
                                    <div className="flex-1 relative">
                                        {photo && (
                                            <div className="absolute bottom-full mb-2 left-0 bg-blue-50 text-blue-700 text-xs py-1 px-3 rounded-full flex items-center shadow-sm">
                                                <i className="fa-solid fa-image mr-2"></i> {photo.name}
                                                <button type="button" onClick={() => setPhoto(null)} className="ml-2 hover:text-red-500"><i className="fa-solid fa-xmark"></i></button>
                                            </div>
                                        )}
                                        <textarea 
                                            className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm focus:ring-0 resize-none" 
                                            placeholder="Type a message..."
                                            rows="1"
                                            value={content}
                                            onChange={(e) => setContent(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault();
                                                    handleSubmit(e);
                                                }
                                            }}
                                            style={{ minHeight: '44px', maxHeight: '120px' }}
                                        ></textarea>
                                    </div>
                                    
                                    <button 
                                        type="submit" 
                                        disabled={isSubmitting || (!content.trim() && !photo)} 
                                        className="flex-shrink-0 w-10 h-10 rounded-full bg-primary hover:bg-blue-700 text-white flex items-center justify-center transition-colors disabled:opacity-50"
                                    >
                                        {isSubmitting ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-paper-plane"></i>}
                                    </button>
                                </form>
                            </div>

                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
