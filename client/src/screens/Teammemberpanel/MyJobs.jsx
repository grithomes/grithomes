import React, { useState, useEffect } from 'react';
import Teamnavbar from './Teamnavbar';
import { useNavigate } from 'react-router-dom';
import { ColorRing } from 'react-loader-spinner';
import Alertauthtoken from '../../components/Alertauthtoken';

export default function MyJobs() {
    const [loading, setLoading] = useState(true);
    const [jobs, setJobs] = useState([]);
    const [alertMessage, setAlertMessage] = useState('');

    const navigate = useNavigate();
    const currentUserId = localStorage.getItem("userid");
    const isTeamMember = localStorage.getItem("isTeamMember") === "true";

    useEffect(() => {
        if (!localStorage.getItem("authToken") || !isTeamMember) {
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
                body: JSON.stringify({ userId: currentUserId, isTeamMember: true })
            });
            const jobsData = await jobsRes.json();
            if (jobsData.success) {
                setJobs(jobsData.jobs);
            } else if (jobsRes.status === 401) {
                setAlertMessage(jobsData.message);
                setLoading(false);
                return;
            }

            setLoading(false);
        } catch (error) {
            console.error('Error fetching jobs:', error);
            setLoading(false);
        }
    };

    const handleViewJob = (jobId) => {
        navigate(`/Teammemberpanel/JobDetail/${jobId}`);
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
                        <div className="w-full md:w-64 flex-shrink-0">
                            <Teamnavbar />
                        </div>
                        <div className="flex-1 w-full mx-auto px-4 mt-8 md:mt-0">
                            <div className='mt-6 mx-4'>
                                {alertMessage && <Alertauthtoken message={alertMessage} onClose={() => setAlertMessage('')} />}
                            </div>
                            
                            <div className='flex flex-wrap items-center justify-between py-6 px-4 mb-6 bg-white shadow-sm rounded-xl border border-gray-100 mx-4'>
                                <div>
                                    <h1 className='text-3xl font-bold text-gray-800'>My Jobs</h1>
                                    <nav aria-label="breadcrumb">
                                        <ol className="flex text-sm text-gray-500 mt-2 space-x-2">
                                            <li><a href="/Teammemberpanel/Teammenberdashboard" className='hover:text-primary transition-colors text-decoration-none'>Dashboard</a></li>
                                            <li><span className="mx-2">/</span></li>
                                            <li className="text-gray-800 font-semibold" aria-current="page">Jobs</li>
                                        </ol>
                                    </nav>
                                </div>
                            </div>

                            <div className="mx-4 mb-8">
                                <div className="card-standard p-6">
                                    <h4 className="text-xl font-bold text-gray-800 mb-6">Assigned Job Groups</h4>
                                    <div className="space-y-4">
                                        {jobs.length === 0 ? (
                                            <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                                <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                                    <i className="fa-solid fa-briefcase text-2xl text-gray-400"></i>
                                                </div>
                                                <h3 className="text-lg font-medium text-gray-900 mb-1">No jobs assigned</h3>
                                                <p className="text-gray-500">You are not assigned to any active jobs right now.</p>
                                            </div>
                                        ) : (
                                            jobs.map(job => (
                                                <div key={job._id} className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow bg-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                                    <div>
                                                        <h5 className="font-bold text-lg text-gray-800">{job.title}</h5>
                                                        <p className="text-sm text-gray-500 mt-1">{job.description || 'No description'}</p>
                                                        <div className="flex gap-4 mt-3 text-xs text-gray-500 font-medium">
                                                            <span className="flex items-center bg-gray-100 px-2 py-1 rounded text-gray-600">
                                                                <i className="fa-regular fa-clock mr-1.5"></i> 
                                                                Assigned
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <button 
                                                        onClick={() => handleViewJob(job._id)}
                                                        className="btn-primary px-5 py-2 whitespace-nowrap"
                                                    >
                                                        Enter Group Chat <i className="fa-solid fa-arrow-right ml-2"></i>
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
            )}
        </div>
    );
}
