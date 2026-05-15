import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';

import { useNavigate } from 'react-router-dom';
import { CountrySelect, StateSelect, CitySelect } from '@davzon/react-country-state-city';
import Alertauthtoken from '../../components/Alertauthtoken';

export default function Editprofile() {
    const [signupdata, setsignupdata] = useState({});
    const [alertMessage, setAlertMessage] = useState('');

    const [countryid, setcountryid] = useState(false);
    const [stateid, setstateid] = useState(false);
    const [cityid, setcityid] = useState(false);

    const [credentials, setCredentials] = useState({
        city: '',
        state: '',
        country: ''
    });

    let navigate = useNavigate();

    useEffect(() => {
        if (!localStorage.getItem("authToken") || localStorage.getItem("isTeamMember") === "true") {
            navigate("/");
        }
        fetchsignupdata();
    }, []);

    const fetchsignupdata = async () => {
        try {
            const userid = localStorage.getItem("userid");
            const authToken = localStorage.getItem('authToken');
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/getsignupdata/${userid}`, {
                headers: {
                    'Authorization': authToken,
                }
            });
            if (response.status === 401) {
                const json = await response.json();
                setAlertMessage(json.message);
                window.scrollTo(0, 0);
                return;
            } else {
                const json = await response.json();
                setsignupdata(json);
                console.log(json, "fetch function");
                // Parse the stored JSON strings
                const parsedCountry = JSON.parse(json.country);
                const parsedState = JSON.parse(json.state);
                const parsedCity = JSON.parse(json.city);

                console.log("parsedCountry", parsedCountry.id);

                setcountryid(parsedCountry.id);
                setstateid(parsedState.id);
                setcityid(parsedCity.id);

                setCredentials({
                    country: JSON.parse(json.country),
                    state: JSON.parse(json.state),
                    city: JSON.parse(json.city)
                });
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        if (name === 'city') {
            setsignupdata({ ...signupdata, [name]: JSON.parse(value) });
        } else {
            setsignupdata({ ...signupdata, [name]: value });
        }
    };
    const handleSaveClick = async () => {
        try {
            const userid = localStorage.getItem("userid");
            const authToken = localStorage.getItem('authToken');
            console.log("credentials:", credentials);
            const updatedsignupdata = {
                ...signupdata,
                country: JSON.stringify(credentials.country),
                state: JSON.stringify(credentials.state),
                city: JSON.stringify(credentials.city)
            };
            console.log("updatedsignupdata:->", updatedsignupdata);
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/updatesignupdata/${userid}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': authToken,
                },
                body: JSON.stringify(updatedsignupdata)
            });

            if (response.status === 401) {
                const json = await response.json();
                setAlertMessage(json.message);
                window.scrollTo(0, 0);
                return;
            } else {
                const json = await response.json();

                if (json.Success) {
                    navigate('/userpanel/Userdashboard');
                    localStorage.setItem("taxOptions", `[{"id":"${updatedsignupdata.TaxName}!${updatedsignupdata.taxPercentage}","name":"${updatedsignupdata.TaxName}","percentage":${updatedsignupdata.taxPercentage}}]`);
                    console.log(updatedsignupdata);
                } else {
                    console.error('Error updating Signupdata:', json.message);
                }
            }
        } catch (error) {
            console.error('Error updating Signupdata:', error);
        }
    };

    return (
        <div className='w-full '>
            <div className="flex flex-col md:flex-row">
                            <Sidebar />
                            <div className="flex-1 w-full mx-auto px-4">

                    <div className='mx-4 my-5'>
                        <div className='my-2'>
                                <div className='mt-6 mx-4'>
                                    {alertMessage && <Alertauthtoken message={alertMessage} onClose={() => setAlertMessage('')} />}
                                </div>
                                <section>
                                <form>
                                    <div className='flex flex-wrap items-center justify-between py-6 px-4 mb-6 bg-white shadow-sm rounded-xl border border-gray-100 mx-4'>
                                        <div>
                                            <p className='text-3xl font-bold text-gray-800'>Edit Profile</p>
                                            <nav aria-label="breadcrumb">
                                                <ol className="flex text-sm text-gray-500 mt-2 space-x-2">
                                                    <li><a href="/userpanel/Userdashboard" className='hover:text-primary transition-colors text-decoration-none'>Dashboard</a></li>
                                                    <li><span className="mx-2">/</span></li>
                                                    <li className="text-gray-800 font-semibold" aria-current="page">Profile Settings</li>
                                                </ol>
                                            </nav>
                                        </div>
                                        <div className="mt-4 md:mt-0">
                                            <button className='btn-primary' type="button" onClick={handleSaveClick}>Save Changes</button>
                                        </div>
                                    </div>

                                    <div className="card-standard p-6 mx-4 mb-8">
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* Business Details Section */}
                                            <div className="col-span-1 md:col-span-2 border-b border-gray-100 pb-2 mb-2">
                                                <h3 className="text-lg font-bold text-gray-800">Business Details</h3>
                                            </div>

                                            <div className="col-span-1">
                                                <div className="mb-4">
                                                    <label htmlFor="company_name" className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                                                    <input type="text" className="input-standard" name="company_name" value={signupdata.company_name} onChange={handleInputChange} placeholder="Company Name" id="exampleInputcompany_name" />
                                                </div>
                                            </div>

                                            <div className="col-span-1">
                                                <div className="mb-4">
                                                    <label htmlFor="Businesstype" className="block text-sm font-medium text-gray-700 mb-1">Business Type</label>
                                                    <select
                                                        className="input-standard"
                                                        name="Businesstype"
                                                        value={signupdata.Businesstype}
                                                        onChange={handleInputChange}
                                                        aria-label="Default select example"
                                                    >
                                                        <option value="">Select Business Type</option>
                                                        <option value="Art, Photography & Creative Services">Art, Photography & Creative Services</option>
                                                        <option value="Construction & Trades">Construction & Trades</option>
                                                        <option value="Cleaning & Property Maintenance">Cleaning & Property Maintenance</option>
                                                        <option value="Consulting & Professional Services">Consulting & Professional Services</option>
                                                        <option value="Hair, Spa & Beauty">Hair, Spa & Beauty</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="col-span-1">
                                                <div className="mb-4">
                                                    <label htmlFor="CurrencyType" className="block text-sm font-medium text-gray-700 mb-1">Currency Type</label>
                                                    <select
                                                        className="input-standard"
                                                        name="CurrencyType"
                                                        value={signupdata.CurrencyType}
                                                        onChange={handleInputChange}
                                                        aria-label="Default select example"
                                                    >
                                                        <option value="">Select Currency Type</option>
                                                        <option value="AUD"> AUD - Australian Dollar </option>
                                                        <option value="CAD"> CAD - Canadian Dollar </option>
                                                        <option value="INR"> INR - Indian Rupee </option>
                                                    </select>
                                                </div>
                                            </div>
                                            
                                            <div className="col-span-1">
                                                <div className="mb-4">
                                                    <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                                                    <input type="text" className="input-standard" name="website" value={signupdata.website} onChange={handleInputChange} placeholder="Website URL" />
                                                </div>
                                            </div>

                                            {/* Tax Details Section */}
                                            <div className="col-span-1 md:col-span-2 border-b border-gray-100 pb-2 mb-2 mt-4">
                                                <h3 className="text-lg font-bold text-gray-800">Tax Information</h3>
                                            </div>

                                            <div className="col-span-1 lg:col-span-1">
                                                <div className="mb-4">
                                                    <label htmlFor="TaxName" className="block text-sm font-medium text-gray-700 mb-1">Business Tax Name</label>
                                                    <input type="text" className="input-standard" name="TaxName" value={signupdata.TaxName || ''} onChange={handleInputChange} placeholder="e.g. GST, VAT" />
                                                </div>
                                            </div>

                                            <div className="col-span-1 lg:col-span-1">
                                                <div className="mb-4">
                                                    <label htmlFor="gstNumber" className="block text-sm font-medium text-gray-700 mb-1">Business Tax Number</label>
                                                    <input type="text" className="input-standard" name="gstNumber" value={signupdata.gstNumber} onChange={handleInputChange} placeholder="Tax ID / ABN" />
                                                </div>
                                            </div>

                                            <div className="col-span-1 lg:col-span-1">
                                                <div className="mb-4">
                                                    <label htmlFor="taxPercentage" className="block text-sm font-medium text-gray-700 mb-1">Default Tax Percentage (%)</label>
                                                    <input type="text" className="input-standard" name="taxPercentage" value={signupdata.taxPercentage || 'No'} onChange={handleInputChange} placeholder="e.g. 5" />
                                                </div>
                                            </div>

                                            {/* Primary Contact Section */}
                                            <div className="col-span-1 md:col-span-2 border-b border-gray-100 pb-2 mb-2 mt-4">
                                                <h3 className="text-lg font-bold text-gray-800">Primary Contact (User 1)</h3>
                                            </div>

                                            <div className="col-span-1">
                                                <div className="mb-4">
                                                    <label htmlFor="FirstName" className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                                                    <input type="text" className="input-standard" name="FirstName" value={signupdata.FirstName} onChange={handleInputChange} placeholder="First Name" />
                                                </div>
                                            </div>
                                            <div className="col-span-1">
                                                <div className="mb-4">
                                                    <label htmlFor="LastName" className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                                                    <input type="text" className="input-standard" name="LastName" value={signupdata.LastName} onChange={handleInputChange} placeholder="Last Name" />
                                                </div>
                                            </div>

                                            <div className="col-span-1">
                                                <div className="mb-4">
                                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Primary Email</label>
                                                    <input type="email" name="email" value={signupdata.email} onChange={handleInputChange} placeholder="Email Address" disabled className="input-standard bg-gray-50 cursor-not-allowed text-gray-500" title="Email cannot be changed" />
                                                </div>
                                            </div>

                                            <div className="col-span-1">
                                                <div className="mb-4">
                                                    <label htmlFor="User1_Mobile_Number" className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                                                    <input type="text" className="input-standard" name="User1_Mobile_Number" value={signupdata.User1_Mobile_Number} onChange={handleInputChange} placeholder="Mobile Number" />
                                                </div>
                                            </div>

                                            {/* Secondary Contact Section */}
                                            <div className="col-span-1 md:col-span-2 border-b border-gray-100 pb-2 mb-2 mt-4">
                                                <h3 className="text-lg font-bold text-gray-800">Secondary Contact (User 2) <span className="text-sm font-normal text-gray-500">(Optional)</span></h3>
                                            </div>

                                            <div className="col-span-1">
                                                <div className="mb-4">
                                                    <label htmlFor="User2FirstName" className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                                                    <input type="text" className="input-standard" name="User2FirstName" value={signupdata.User2FirstName} onChange={handleInputChange} placeholder="First Name" />
                                                </div>
                                            </div>
                                            <div className="col-span-1">
                                                <div className="mb-4">
                                                    <label htmlFor="User2LastName" className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                                                    <input type="text" className="input-standard" name="User2LastName" value={signupdata.User2LastName} onChange={handleInputChange} placeholder="Last Name" />
                                                </div>
                                            </div>

                                            <div className="col-span-1">
                                                <div className="mb-4">
                                                    <label htmlFor="User2_Mobile_Number" className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                                                    <input type="text" className="input-standard" name="User2_Mobile_Number" value={signupdata.User2_Mobile_Number} onChange={handleInputChange} placeholder="Mobile Number" />
                                                </div>
                                            </div>

                                            {/* Address Section */}
                                            <div className="col-span-1 md:col-span-2 border-b border-gray-100 pb-2 mb-2 mt-4">
                                                <h3 className="text-lg font-bold text-gray-800">Location Details</h3>
                                            </div>

                                            <div className="col-span-1 md:col-span-2">
                                                <div className="mb-4">
                                                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                                                    <textarea className="input-standard" name="address" value={signupdata.address} onChange={handleInputChange} placeholder="Full Address" id="exampleInputaddress" rows="3" />
                                                </div>
                                            </div>
                                            
                                            <div className="col-span-1">
                                                <div className="mb-4 country-select-container">
                                                    <label htmlFor="Country" className="block text-sm font-medium text-gray-700 mb-1">
                                                        Country
                                                    </label>
                                                    <CountrySelect
                                                        name="country"
                                                        defaultValue={credentials.country}
                                                        onChange={(val) => {
                                                            setcountryid(val.id);
                                                            setCredentials({ ...credentials, country: val });
                                                        }}
                                                        valueType="short"
                                                        className="w-full"
                                                        placeHolder="Select Country"
                                                    />
                                                </div>
                                            </div>

                                            <div className="col-span-1">
                                                <div className="mb-4 country-select-container">
                                                    <label htmlFor="State" className="block text-sm font-medium text-gray-700 mb-1">
                                                        State
                                                    </label>
                                                    <StateSelect
                                                        name="state"
                                                        defaultValue={credentials.state}
                                                        countryid={countryid}
                                                        onChange={(val) => {
                                                            setstateid(val.id);
                                                            setCredentials({ ...credentials, state: val });
                                                        }}
                                                        className="w-full"
                                                        placeHolder="Select State"
                                                    />
                                                </div>
                                            </div>

                                            <div className="col-span-1">
                                                <div className="mb-4 country-select-container">
                                                    <label htmlFor="City" className="block text-sm font-medium text-gray-700 mb-1">
                                                        City
                                                    </label>
                                                    <CitySelect
                                                        countryid={countryid}
                                                        defaultValue={credentials.city}
                                                        stateid={stateid}
                                                        onChange={(val) => {
                                                            setcityid(val.id);
                                                            setCredentials({ ...credentials, city: val });
                                                        }}
                                                        className="w-full"
                                                        placeHolder="Select City"
                                                    />
                                                </div>
                                            </div>

                                        </div>
                                    </div>
                                </form>
                                </section>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
