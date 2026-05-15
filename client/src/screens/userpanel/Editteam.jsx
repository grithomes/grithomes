import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';

import { ColorRing } from 'react-loader-spinner';
import Alertauthtoken from '../../components/Alertauthtoken';

export default function Editteam() {
    const [loading, setloading] = useState(true);
    const location = useLocation();
    const navigate = useNavigate();
    const [alertMessage, setAlertMessage] = useState('');

    const teamid = location.state.teamid;

    const [team, setteam] = useState({
        name: '',
        email: '',
        number: '',
    });

    useEffect(() => {
        if (!localStorage.getItem("authToken") || localStorage.getItem("isTeamMember") == "true") {
            navigate("/");
        }
        fetchteamData();
    }, [])

    const fetchteamData = async () => {
        try {
            const authToken = localStorage.getItem('authToken');
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/getteamdata/${teamid}`, {
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
                    setteam(json.team);
                } else {
                    console.error('Error fetching teamdata:', json.message);
                }
                console.log(team);
                setloading(false);
            }

        } catch (error) {
            console.error('Error fetching teamdata:', error);
        }
    };

    const handleSaveClick = async () => {
        try {
            const updatedteamdata = {
                ...team
            };
            const authToken = localStorage.getItem('authToken');
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/updateteamdata/${teamid}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': authToken,
                },
                body: JSON.stringify(updatedteamdata)
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
                    navigate('/userpanel/Team');
                    console.log(updatedteamdata);
                } else {
                    console.error('Error updating teamdata:', json.message);
                }
            }


        } catch (error) {
            console.error('Error updating teamdata:', error);
        }
    };

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setteam({ ...team, [name]: value });
    };

    return (
        <div className='bg'>
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
                    <div className='w-full '>
                        <div className="flex flex-col md:flex-row">
                            <Sidebar />
                            <div className="flex-1 w-full mx-auto px-4">

                                <div className='mt-6 mx-4'>
                                    {alertMessage && <Alertauthtoken message={alertMessage} onClose={() => setAlertMessage('')} />}
                                </div>
                                <form>
                                    <div className='flex flex-wrap items-center justify-between py-6 px-4 mb-6 bg-white shadow-sm rounded-xl border border-gray-100 mx-4'>
                                        <div>
                                            <p className='text-3xl font-bold text-gray-800'>Edit Team</p>
                                            <nav aria-label="breadcrumb">
                                                <ol className="flex text-sm text-gray-500 mt-2 space-x-2">
                                                    <li><a href="/userpanel/Userdashboard" className='hover:text-primary transition-colors text-decoration-none'>Dashboard</a></li>
                                                    <li><span className="mx-2">/</span></li>
                                                    <li><a href="/userpanel/teamlist" className='hover:text-primary transition-colors text-decoration-none'>Team Members</a></li>
                                                    <li><span className="mx-2">/</span></li>
                                                    <li className="text-gray-800 font-semibold" aria-current="page">Edit Team</li>
                                                </ol>
                                            </nav>
                                        </div>
                                        <div className="mt-4 md:mt-0">
                                            <button className='btn-primary' type="button" onClick={handleSaveClick}>Save Changes</button>
                                        </div>
                                    </div>

                                    <div className="card-standard p-6 mx-4 mb-8">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                            <div className="col-span-1 md:col-span-2 lg:col-span-1">
                                                <div className="mb-4">
                                                    <label htmlFor="exampleInputtext1" className="block text-sm font-medium text-gray-700 mb-1">
                                                        Member Name
                                                    </label>
                                                    <input
                                                        type="text"
                                                        className="input-standard"
                                                        name="name"
                                                        value={team.name}
                                                        onChange={handleInputChange}
                                                        placeholder="Member Name"
                                                        id="exampleInputtext1"
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <div className="col-span-1 md:col-span-2 lg:col-span-1">
                                                <div className="mb-4">
                                                    <label htmlFor="exampleInputEmail1" className="block text-sm font-medium text-gray-700 mb-1">
                                                        Contact Email
                                                    </label>
                                                    <input
                                                        type="email"
                                                        className="input-standard"
                                                        name="email"
                                                        value={team.email}
                                                        onChange={handleInputChange}
                                                        placeholder="Contact Email"
                                                        id="email"
                                                        aria-describedby="emailHelp"
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <div className="col-span-1 md:col-span-2 lg:col-span-1">
                                                <div className="mb-4">
                                                    <label htmlFor="Number" className="block text-sm font-medium text-gray-700 mb-1">
                                                        Phone Number
                                                    </label>
                                                    <input
                                                        type="number"
                                                        name="number"
                                                        value={team.number}
                                                        className="input-standard"
                                                        onChange={handleInputChange}
                                                        placeholder="Phone Number"
                                                        id="phonenumber"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
            }
        </div>
    );
}
