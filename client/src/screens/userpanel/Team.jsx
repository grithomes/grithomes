import React, { useState, useEffect } from 'react'
import Sidebar from './Sidebar';
import { useNavigate } from 'react-router-dom';
import { ColorRing } from 'react-loader-spinner'
import { format } from 'date-fns';

import Alertauthtoken from '../../components/Alertauthtoken';

export default function Team() {

    const [teammembers, setTeammembers] = useState([]);
    const [selectedteammembers, setselectedteammembers] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setloading] = useState(true);
    const [currentPage, setCurrentPage] = useState(0);
    const [alertMessage, setAlertMessage] = useState('');
    const entriesPerPage = 10;

    const navigate = useNavigate();

    const handleAddClick = () => {
        navigate('/userpanel/Addteam');
    }

    useEffect(() => {
        if (!localStorage.getItem("authToken") || localStorage.getItem("isTeamMember") == "true") {
            navigate("/");
        }
        // setloading(true)
        fetchdata();
    }, [])

    // useEffect(() => {
    //     fetchdata();
    // }, []);

    const handleTimeViewClick = (team) => {
        let teamid = team._id;
        navigate('/userpanel/Timeview', { state: { teamid } });
    };


    const fetchdata = async () => {
        try {
            const userid = localStorage.getItem("userid");
            const authToken = localStorage.getItem('authToken');
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/teammemberdata/${userid}`, {
                headers: {
                    'Authorization': authToken,
                }
            });
            if (response.status === 401) {
                const json = await response.json();
                setAlertMessage(json.message);
                setloading(false);
                window.scrollTo(0, 0);
                return; // Stop further execution
            }
            else {
                const json = await response.json();

                if (Array.isArray(json)) {
                    setTeammembers(json);
                }
                setloading(false);
            }

        } catch (error) {
            console.error('Error fetching data:', error);
            setloading(false);
        }
    }

    const handleEditClick = (team) => {
        setselectedteammembers(team);
        let teamid = team._id;
        navigate('/userpanel/Editteam', { state: { teamid } });
    };

    const handleDeleteClick = async (teamid) => {
        try {
            const authToken = localStorage.getItem('authToken');
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/delteammember/${teamid}`, {
                method: 'GET',
                headers: {
                    'Authorization': authToken,
                }
            });

            if (response.status === 401) {
                const json = await response.json();
                setAlertMessage(json.message);
                setloading(false);
                window.scrollTo(0, 0);
                return; // Stop further execution
            }
            else {
                const json = await response.json();

                if (json.Success) {
                    fetchdata(); // Refresh the teams list
                } else {
                    console.error('Error deleting teammember:', json.message);
                }
            }
        } catch (error) {
            console.error('Error deleting teammember:', error);
        }
    };

    // Filtering function
    const filteredTeamMembers = teammembers.filter(team =>
        team.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getPageCount = () => Math.ceil(filteredTeamMembers.length / entriesPerPage);

    const getCurrentPageItems = () => {
        const startIndex = currentPage * entriesPerPage;
        const endIndex = startIndex + entriesPerPage;
        return filteredTeamMembers.slice(startIndex, endIndex);
    };

    const handlePrevPage = () => {
        if (currentPage > 0) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handleNextPage = () => {
        if ((currentPage + 1) * entriesPerPage < teammembers.length) {
            setCurrentPage(currentPage + 1);
        }
    };

    return (
        <div className='bg'>
            <div className='w-full '>

                {
                    loading ?
                        <div className="flex flex-col md:flex-row">
                            <ColorRing
                                // width={200}
                                loading={loading}
                                // size={500}
                                display="flex"
                                justify-content="center"
                                align-items="center"
                                aria-label="Loading Spinner"
                                data-testid="loader"
                            />
                        </div> :
                        <div className="flex flex-col md:flex-row">
                            <Sidebar />
                            <div className="flex-1 w-full mx-auto px-4">

                                <div className='mt-8 mx-4'>
                                    {alertMessage && <Alertauthtoken message={alertMessage} onClose={() => setAlertMessage('')} />}
                                </div>
                                <div className='flex flex-wrap items-center justify-between py-6 px-4 mb-6 bg-white shadow-sm rounded-xl border border-gray-100 mx-4'>
                                    <div>
                                        <p className='text-3xl font-bold text-gray-800'>Team</p>
                                        <nav aria-label="breadcrumb">
                                            <ol className="flex text-sm text-gray-500 mt-2 space-x-2">
                                                <li><a href="/Userpanel/Userdashboard" className='hover:text-primary transition-colors text-decoration-none'>Dashboard</a></li>
                                                <li><span className="mx-2">/</span></li>
                                                <li className="text-gray-800 font-semibold" aria-current="page">Team</li>
                                            </ol>
                                        </nav>
                                    </div>
                                    <div className="mt-4 md:mt-0 flex flex-wrap gap-4">
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <i className="fa-solid fa-search text-gray-400"></i>
                                            </div>
                                            <input
                                                type="text"
                                                className="input-standard pl-10 w-full sm:w-64"
                                                placeholder="Search by name"
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                            />
                                        </div>
                                        <button className='btn-primary' onClick={handleAddClick}>
                                            <i className="fa-solid fa-plus mr-2"></i> Create Member
                                        </button>
                                    </div>
                                </div>

                                <div className="card-standard mx-4 mb-8 overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="bg-gray-50 border-b border-gray-100 text-sm text-gray-500">
                                                    <th className="px-6 py-4 font-medium">ID</th>
                                                    <th className="px-6 py-4 font-medium">Name</th>
                                                    <th className="px-6 py-4 font-medium">Email</th>
                                                    <th className="px-6 py-4 font-medium">Phone Number</th>
                                                    <th className="px-6 py-4 font-medium text-center">View</th>
                                                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {getCurrentPageItems().map((team, index) => (
                                                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                                                        <td className="px-6 py-4 text-sm text-gray-500">
                                                            #{currentPage * entriesPerPage + index + 1}
                                                        </td>
                                                        <td className="px-6 py-4 text-sm font-medium text-gray-800">
                                                            {team.name}
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-gray-500">
                                                            {team.email}
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-gray-500">
                                                            {team.number}
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-center">
                                                            <button 
                                                                className="text-gray-400 hover:text-primary transition-colors"
                                                                onClick={() => handleTimeViewClick(team)}
                                                                title="View Details"
                                                            >
                                                                <i className="fa-solid fa-eye"></i>
                                                            </button>
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-right">
                                                            <div className="flex justify-end gap-2">
                                                                <button
                                                                    className="p-2 text-primary hover:bg-indigo-50 rounded-lg transition-colors"
                                                                    onClick={() => handleEditClick(team)}
                                                                    title="Edit"
                                                                >
                                                                    <i className="fa-solid fa-pen"></i>
                                                                </button>
                                                                <button
                                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                                    onClick={() => handleDeleteClick(team._id)}
                                                                    title="Delete"
                                                                >
                                                                    <i className="fa-solid fa-trash"></i>
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>

                                        {filteredTeamMembers.length === 0 && (
                                            <div className="text-center py-12">
                                                <div className="w-16 h-16 mx-auto bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                                    <i className="fa-solid fa-users text-2xl text-gray-400"></i>
                                                </div>
                                                <h3 className="text-lg font-medium text-gray-900 mb-1">No team members found</h3>
                                                <p className="text-gray-500">Get started by creating a new team member.</p>
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Pagination */}
                                    {getPageCount() > 1 && (
                                        <div className='flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50'>
                                            <span className="text-sm text-gray-500">
                                                Showing {currentPage * entriesPerPage + 1} to {Math.min((currentPage + 1) * entriesPerPage, filteredTeamMembers.length)} of {filteredTeamMembers.length} entries
                                            </span>
                                            <div className="flex gap-2">
                                                <button 
                                                    onClick={handlePrevPage} 
                                                    className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${currentPage === 0 ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`} 
                                                    disabled={currentPage === 0}
                                                >
                                                    Previous
                                                </button>
                                                <button
                                                    onClick={handleNextPage}
                                                    className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${((currentPage + 1) * entriesPerPage >= teammembers.length) ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                                                    disabled={(currentPage + 1) * entriesPerPage >= teammembers.length}
                                                >
                                                    Next
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                }
            </div>
        </div>
    )
}
