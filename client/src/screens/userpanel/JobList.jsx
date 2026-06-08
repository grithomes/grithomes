import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import { useNavigate } from 'react-router-dom';
import { ColorRing } from 'react-loader-spinner';
import Alertauthtoken from '../../components/Alertauthtoken';

export default function JobList() {
    const [loading, setLoading] = useState(true);
    const [jobs, setJobs] = useState([]);
    const [teamMembers, setTeamMembers] = useState([]);
    const [invoices, setInvoices] = useState([]);
    const [alertMessage, setAlertMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form state
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [selectedInvoice, setSelectedInvoice] = useState('');
    const [selectedMembers, setSelectedMembers] = useState([]);

    const navigate = useNavigate();
    const currentUserId = localStorage.getItem("userid");

    useEffect(() => {
        if (!localStorage.getItem("authToken") || localStorage.getItem("isTeamMember") === "true") {
            navigate("/");
            return;
        }
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const authToken = localStorage.getItem('authToken');
            
            // Fetch Jobs
            const jobsRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/jobs/list`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': authToken,
                },
                body: JSON.stringify({ userId: currentUserId, isTeamMember: false })
            });
            const jobsData = await jobsRes.json();
            if (jobsData.success) {
                setJobs(jobsData.jobs);
            } else if (jobsRes.status === 401) {
                setAlertMessage(jobsData.message);
                setLoading(false);
                return;
            }

            // Fetch Team Members
            const teamRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/teammemberdata/${currentUserId}`, {
                headers: { 'Authorization': authToken }
            });
            const teamData = await teamRes.json();
            if (Array.isArray(teamData)) setTeamMembers(teamData);

            // Fetch Invoices
            const invRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/invoicedata/${currentUserId}?limit=100`, {
                headers: { 'Authorization': authToken }
            });
            const invData = await invRes.json();
            if (invData && Array.isArray(invData.invoices)) {
                setInvoices(invData.invoices);
            } else if (Array.isArray(invData)) {
                setInvoices(invData);
            }

            setLoading(false);
        } catch (error) {
            console.error('Error fetching data:', error);
            setLoading(false);
        }
    };

    const handleMemberToggle = (memberId) => {
        setSelectedMembers(prev => 
            prev.includes(memberId) 
                ? prev.filter(id => id !== memberId)
                : [...prev, memberId]
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim()) return;

        setIsSubmitting(true);
        try {
            const authToken = localStorage.getItem('authToken');
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/jobs`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': authToken,
                },
                body: JSON.stringify({
                    userId: currentUserId,
                    title,
                    description,
                    invoiceId: selectedInvoice || '',
                    assignedTeamMembers: selectedMembers
                })
            });

            const data = await response.json();
            if (data.success) {
                setTitle('');
                setDescription('');
                setSelectedInvoice('');
                setSelectedMembers([]);
                fetchData(); // refresh list
            } else {
                setAlertMessage(data.message || 'Failed to create job');
            }
        } catch (error) {
            console.error(error);
            setAlertMessage('Server error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleViewJob = (jobId) => {
        navigate(`/userpanel/JobDetail/${jobId}`);
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
                                    <h1 className='text-3xl font-bold text-gray-800'>Job Groups</h1>
                                    <nav aria-label="breadcrumb">
                                        <ol className="flex text-sm text-gray-500 mt-2 space-x-2">
                                            <li><a href="/userpanel/Userdashboard" className='hover:text-primary transition-colors text-decoration-none'>Dashboard</a></li>
                                            <li><span className="mx-2">/</span></li>
                                            <li className="text-gray-800 font-semibold" aria-current="page">Jobs</li>
                                        </ol>
                                    </nav>
                                </div>
                            </div>

                            <div className="mx-4 mb-8 flex flex-col lg:flex-row gap-6">
                                {/* Create Job Form */}
                                <div className="w-full lg:w-1/3">
                                    <div className="card-standard p-6">
                                        <h4 className="text-xl font-bold text-gray-800 mb-6">Create New Job Group</h4>
                                        <form onSubmit={handleSubmit} className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Job Title *</label>
                                                <input 
                                                    type="text" 
                                                    className="input-standard w-full" 
                                                    placeholder="e.g. Plumbing at 123 Main St"
                                                    value={title}
                                                    onChange={(e) => setTitle(e.target.value)}
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                                <textarea 
                                                    className="input-standard w-full" 
                                                    placeholder="Job details..."
                                                    value={description}
                                                    onChange={(e) => setDescription(e.target.value)}
                                                ></textarea>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Link Invoice (Optional)</label>
                                                <select 
                                                    className="input-standard w-full"
                                                    value={selectedInvoice}
                                                    onChange={(e) => setSelectedInvoice(e.target.value)}
                                                >
                                                    <option value="">-- None --</option>
                                                    {invoices.map(inv => (
                                                        <option key={inv._id} value={inv._id}>
                                                            {inv.invoiceNumber} - {inv.customername}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Assign Team Members</label>
                                                <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-md p-2 space-y-2 bg-gray-50">
                                                    {teamMembers.length === 0 ? (
                                                        <p className="text-xs text-gray-500 p-2">No team members found.</p>
                                                    ) : (
                                                        teamMembers.map(member => (
                                                            <label key={member._id} className="flex items-center space-x-3 p-2 hover:bg-gray-100 rounded cursor-pointer">
                                                                <input 
                                                                    type="checkbox" 
                                                                    className="rounded text-primary focus:ring-primary h-4 w-4"
                                                                    checked={selectedMembers.includes(member._id)}
                                                                    onChange={() => handleMemberToggle(member._id)}
                                                                />
                                                                <span className="text-sm font-medium text-gray-700">{member.name} ({member.email})</span>
                                                            </label>
                                                        ))
                                                    )}
                                                </div>
                                            </div>
                                            <button 
                                                type="submit" 
                                                disabled={isSubmitting || !title.trim()} 
                                                className="btn-primary w-full py-2.5 mt-2"
                                            >
                                                {isSubmitting ? 'Creating...' : 'Create Job Group'}
                                            </button>
                                        </form>
                                    </div>
                                </div>

                                {/* Jobs List */}
                                <div className="w-full lg:w-2/3">
                                    <div className="card-standard p-6">
                                        <h4 className="text-xl font-bold text-gray-800 mb-6">Active Job Groups</h4>
                                        <div className="space-y-4">
                                            {jobs.length === 0 ? (
                                                <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                                    <p className="text-gray-500">No jobs created yet.</p>
                                                </div>
                                            ) : (
                                                jobs.map(job => (
                                                    <div key={job._id} className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow bg-white flex justify-between items-center">
                                                        <div>
                                                            <h5 className="font-bold text-lg text-gray-800">{job.title}</h5>
                                                            <p className="text-sm text-gray-500 mt-1">{job.description || 'No description'}</p>
                                                            <div className="flex gap-4 mt-3 text-xs text-gray-500 font-medium">
                                                                <span className="flex items-center bg-gray-100 px-2 py-1 rounded">
                                                                    <i className="fa-solid fa-users mr-1.5 text-primary"></i> 
                                                                    {job.assignedTeamMembers.length} Members
                                                                </span>
                                                                {job.invoiceId && (
                                                                    <span className="flex items-center bg-green-50 text-green-700 px-2 py-1 rounded border border-green-100">
                                                                        <i className="fa-solid fa-file-invoice mr-1.5"></i> 
                                                                        Invoice Linked
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <button 
                                                            onClick={() => handleViewJob(job._id)}
                                                            className="btn-secondary px-5 py-2 whitespace-nowrap"
                                                        >
                                                            Open Group <i className="fa-solid fa-arrow-right ml-2"></i>
                                                        </button>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
