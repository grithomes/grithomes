import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';

import Alertauthtoken from '../../components/Alertauthtoken';
import { ColorRing } from 'react-loader-spinner';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

export default function Edititem() {
    const [loading, setloading] = useState(true);
    const location = useLocation();
    const navigate = useNavigate();
    const [alertMessage, setAlertMessage] = useState('');

    const itemId = location.state.itemId;

    const [item, setitem] = useState({
        itemname: '',
        description: '',
        price: '',
        unit: '',
    });

    useEffect(() => {
        if (!localStorage.getItem("authToken") || localStorage.getItem("isTeamMember") == "true") {
            navigate("/");
        }
        fetchitemData();
    }, [])

    const fetchitemData = async () => {
        try {
            const authToken = localStorage.getItem('authToken');
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/getitems/${itemId}`, {
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
                    setitem(json.item);
                } else {
                    console.error('Error fetching itemdata:', json.message);
                }
                console.log(item);
                setloading(false);
            }

        } catch (error) {
            console.error('Error fetching itemdata:', error);
        }
    };

    const handleSaveClick = async () => {
        try {
            const updateditemdata = {
                ...item
            };
            const authToken = localStorage.getItem('authToken');
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/updateitemdata/${itemId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': authToken,
                },
                body: JSON.stringify(updateditemdata)
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
                    navigate('/userpanel/itemlist');
                    console.log(updateditemdata);
                } else {
                    console.error('Error updating itemdata:', json.message);
                }
            }


        } catch (error) {
            console.error('Error updating itemdata:', error);
        }
    };

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setitem({ ...item, [name]: value });
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
                                            <p className='text-3xl font-bold text-gray-800'>Edit Item</p>
                                            <nav aria-label="breadcrumb">
                                                <ol className="flex text-sm text-gray-500 mt-2 space-x-2">
                                                    <li><a href="/userpanel/Userdashboard" className='hover:text-primary transition-colors text-decoration-none'>Dashboard</a></li>
                                                    <li><span className="mx-2">/</span></li>
                                                    <li><a href="/userpanel/itemlist" className='hover:text-primary transition-colors text-decoration-none'>Items</a></li>
                                                    <li><span className="mx-2">/</span></li>
                                                    <li className="text-gray-800 font-semibold" aria-current="page">Edit Item</li>
                                                </ol>
                                            </nav>
                                        </div>
                                        <div className="mt-4 md:mt-0">
                                            <button className='btn-primary' type="button" onClick={handleSaveClick}>Save Changes</button>
                                        </div>
                                    </div>

                                    <div className="card-standard p-6 mx-4 mb-8">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                            {/* Item Name */}
                                            <div className="col-span-1 md:col-span-2 lg:col-span-1">
                                                <div className="mb-4">
                                                    <label htmlFor="itemname" className="block text-sm font-medium text-gray-700 mb-1">
                                                        Item Name
                                                    </label>
                                                    <input
                                                        type="text"
                                                        className="input-standard"
                                                        name="itemname"
                                                        value={item.itemname}
                                                        onChange={handleInputChange}
                                                        placeholder="Item Name"
                                                        id="itemname"
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            {/* Price */}
                                            <div className="col-span-1 md:col-span-2 lg:col-span-1">
                                                <div className="mb-4">
                                                    <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                                                        Price
                                                    </label>
                                                    <input
                                                        type="number"
                                                        name="price"
                                                        value={item.price}
                                                        className="input-standard"
                                                        onChange={handleInputChange}
                                                        placeholder="Price"
                                                        id="price"
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            {/* Unit */}
                                            <div className="col-span-1 md:col-span-2 lg:col-span-1">
                                                <div className="mb-4">
                                                    <label htmlFor="unit" className="block text-sm font-medium text-gray-700 mb-1">
                                                        Unit
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="unit"
                                                        value={item.unit}
                                                        className="input-standard"
                                                        onChange={handleInputChange}
                                                        placeholder="e.g. hrs, pcs, kg"
                                                        id="unit"
                                                    />
                                                </div>
                                            </div>

                                            {/* Description */}
                                            <div className="col-span-1 md:col-span-2">
                                                <div className="mb-4">
                                                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                                                        Description
                                                    </label>
                                                    <div className="prose-editor">
                                                        <CKEditor
                                                            editor={ClassicEditor}
                                                            data={item.description}
                                                            onChange={(event, editor) => {
                                                                const data = editor.getData();
                                                                setitem({ ...item, description: data });
                                                            }}
                                                        />
                                                    </div>
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
