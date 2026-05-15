import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { CountrySelect, StateSelect, CitySelect } from '@davzon/react-country-state-city';
import "@davzon/react-country-state-city/dist/react-country-state-city.css";

import Alertauthtoken from '../../components/Alertauthtoken';
import { ColorRing } from 'react-loader-spinner'

export default function Editcustomer() {
    const [loading, setloading] = useState(true);
    const location = useLocation();
    const [alertMessage, setAlertMessage] = useState('');
    const navigate = useNavigate();

    const customerId = location.state.customerId;

    const [customer, setcustomer] = useState({
        name: '',
        emails: [''],
        number: '',
        citydata: '',
        statedata: '',
        countrydata: '',
        information: '',
        address1: '',
        address2: '',
        post: '',
    });

    useEffect(() => {
        if (!localStorage.getItem("authToken") || localStorage.getItem("isTeamMember") == "true") {
            navigate("/");
        }
        fetchCustomerData();
    }, [])
    const handleEmailChange = (index, value) => {
        const updatedEmails = [...customer.emails];
        updatedEmails[index] = value;
        setcustomer(prev => ({ ...prev, emails: updatedEmails }));
    };

    const addEmailField = () => {
        setcustomer(prev => ({ ...prev, emails: [...(prev.emails || []), ''] }));
    };

    const removeEmailField = (index) => {
        const updatedEmails = [...customer.emails];
        updatedEmails.splice(index, 1);
        setcustomer(prev => ({ ...prev, emails: updatedEmails }));
    };
    const fetchCustomerData = async () => {
        try {
            const authToken = localStorage.getItem('authToken');
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/getcustomers/${customerId}`, {
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
                    setcustomer(json.customer);
                } else {
                    console.error('Error fetching Customerdata:', json.message);
                }
                console.log(customer);
                setloading(false);
            }

        } catch (error) {
            console.error('Error fetching Customerdata:', error);
        }
    };

    const handleSaveClick = async () => {
        try {
            const updatedcustomerdata = {
                ...customer
            };
            const authToken = localStorage.getItem('authToken');
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/updatecostomerdata/${customerId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': authToken,
                },
                body: JSON.stringify(updatedcustomerdata)
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
                    navigate('/userpanel/Customerlist');
                    console.log(updatedcustomerdata);
                } else {
                    console.error('Error updating Customerdata:', json.message);
                }
            }


        } catch (error) {
            console.error('Error updating Customerdata:', error);
        }
    };

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setcustomer({ ...customer, [name]: value });
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
                                            <p className='text-3xl font-bold text-gray-800'>Edit Customer</p>
                                            <nav aria-label="breadcrumb">
                                                <ol className="flex text-sm text-gray-500 mt-2 space-x-2">
                                                    <li><a href="/userpanel/Userdashboard" className='hover:text-primary transition-colors text-decoration-none'>Dashboard</a></li>
                                                    <li><span className="mx-2">/</span></li>
                                                    <li><a href="/userpanel/Customerlist" className='hover:text-primary transition-colors text-decoration-none'>Customers</a></li>
                                                    <li><span className="mx-2">/</span></li>
                                                    <li className="text-gray-800 font-semibold" aria-current="page">Edit Customer</li>
                                                </ol>
                                            </nav>
                                        </div>
                                        <div className="mt-4 md:mt-0">
                                            <button className='btn-primary' type="button" onClick={handleSaveClick}>Save Changes</button>
                                        </div>
                                    </div>

                                    <div className="card-standard p-6 mx-4 mb-8">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                            {/* Customer Name */}
                                            <div className="col-span-1 md:col-span-2 lg:col-span-1">
                                                <div className="mb-4">
                                                    <label htmlFor="exampleInputtext1" className="block text-sm font-medium text-gray-700 mb-1">
                                                        Customer Name
                                                    </label>
                                                    <input
                                                        type="text"
                                                        className="input-standard"
                                                        name="name"
                                                        value={customer.name}
                                                        onChange={handleInputChange}
                                                        placeholder="Customer Name"
                                                        id="exampleInputtext1"
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            {/* Phone Number */}
                                            <div className="col-span-1 md:col-span-2 lg:col-span-1">
                                                <div className="mb-4">
                                                    <label htmlFor="Number" className="block text-sm font-medium text-gray-700 mb-1">
                                                        Phone Number
                                                    </label>
                                                    <input
                                                        type="number"
                                                        name="number"
                                                        value={customer.number}
                                                        className="input-standard"
                                                        onChange={handleInputChange}
                                                        placeholder="Phone Number"
                                                        id="phonenumber"
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            {/* Contact Emails */}
                                            <div className="col-span-1 md:col-span-2">
                                                <div className="mb-4">
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Emails</label>
                                                    <div className="space-y-3">
                                                        {customer.emails && customer.emails.map((email, index) => (
                                                            <div className="flex items-center gap-2" key={index}>
                                                                <input
                                                                    type="email"
                                                                    className="input-standard flex-1"
                                                                    name="emails"
                                                                    value={email}
                                                                    onChange={(e) => handleEmailChange(index, e.target.value)}
                                                                    placeholder={`Contact Email #${index + 1}`}
                                                                    required
                                                                />
                                                                <button
                                                                    type="button"
                                                                    className="px-3 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-md border border-red-200 transition-colors disabled:opacity-50"
                                                                    onClick={() => removeEmailField(index)}
                                                                    disabled={customer.emails.length === 1}
                                                                    title="Remove Email"
                                                                >
                                                                    <i className="fa-solid fa-minus"></i>
                                                                </button>
                                                                {index === customer.emails.length - 1 && (
                                                                    <button
                                                                        type="button"
                                                                        className="px-3 py-2 text-green-600 bg-green-50 hover:bg-green-100 rounded-md border border-green-200 transition-colors"
                                                                        onClick={addEmailField}
                                                                        title="Add Another Email"
                                                                    >
                                                                        <i className="fa-solid fa-plus"></i>
                                                                    </button>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="col-span-1 md:col-span-2 border-t border-gray-100 pt-6 mt-2">
                                                <h3 className="text-lg font-bold text-gray-800 mb-4">Location Details</h3>
                                            </div>

                                            {/* Address 1 */}
                                            <div className="col-span-1">
                                                <div className="mb-4">
                                                    <label htmlFor="Address1" className="block text-sm font-medium text-gray-700 mb-1">
                                                        Address 1
                                                    </label>
                                                    <input
                                                        type="message"
                                                        name="address1"
                                                        value={customer.address1}
                                                        onChange={handleInputChange}
                                                        className="input-standard"
                                                        placeholder="Address 1"
                                                        id="Address1"
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            {/* Address 2 */}
                                            <div className="col-span-1">
                                                <div className="mb-4">
                                                    <label htmlFor="Address2" className="block text-sm font-medium text-gray-700 mb-1">
                                                        Address 2
                                                    </label>
                                                    <input
                                                        type="message"
                                                        name="address2"
                                                        value={customer.address2}
                                                        onChange={handleInputChange}
                                                        className="input-standard"
                                                        placeholder="Address 2"
                                                        id="Address2"
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            {/* Country */}
                                            <div className="col-span-1">
                                                <div className="mb-4 country-select-container">
                                                    <label htmlFor="Country" className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                                                    <CountrySelect
                                                        name="country"
                                                        defaultValue={customer.countrydata != '' ? JSON.parse(customer.countrydata) : null}
                                                        onChange={(val) => {
                                                            setcustomer(prev => ({
                                                                ...prev,
                                                                country: val.name,
                                                                countryid: val.id,
                                                                countrydata: JSON.stringify(val),
                                                            }));
                                                        }}
                                                        className="w-full"
                                                    />
                                                </div>
                                            </div>

                                            {/* State */}
                                            <div className="col-span-1">
                                                <div className="mb-4 country-select-container">
                                                    <label htmlFor="State" className="block text-sm font-medium text-gray-700 mb-1">State</label>
                                                    <StateSelect
                                                        name="state"
                                                        countryid={customer.countryid != 0 ? customer.countryid : 0}
                                                        defaultValue={customer.statedata != '' ? JSON.parse(customer.statedata) : null}
                                                        onChange={(val) => {
                                                            setcustomer({ ...customer, state: val.name });
                                                            setcustomer({ ...customer, stateid: val.id });
                                                            setcustomer({ ...customer, statedata: JSON.stringify(val) });
                                                        }}
                                                        className="w-full"
                                                    />
                                                </div>
                                            </div>

                                            {/* City */}
                                            <div className="col-span-1">
                                                <div className="mb-4 country-select-container">
                                                    <label htmlFor="City" className="block text-sm font-medium text-gray-700 mb-1">City</label>
                                                    <CitySelect
                                                        countryid={customer ? customer.countryid : 0}
                                                        stateid={customer ? customer.stateid : 0}
                                                        defaultValue={customer.citydata != '' ? JSON.parse(customer.citydata) : null}
                                                        onChange={(val) => {
                                                            setcustomer({ ...customer, city: val.name });
                                                            setcustomer({ ...customer, cityid: val.id });
                                                            setcustomer({ ...customer, citydata: JSON.stringify(val) });
                                                        }}
                                                        placeHolder="Select City"
                                                        className="w-full"
                                                    />
                                                </div>
                                            </div>

                                            {/* Post Code */}
                                            <div className="col-span-1">
                                                <div className="mb-4">
                                                    <label htmlFor="post" className="block text-sm font-medium text-gray-700 mb-1">
                                                        Post Code
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="post"
                                                        value={customer.post}
                                                        onChange={handleInputChange}
                                                        className="input-standard"
                                                        placeholder="Post Code"
                                                        id="post"
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            {/* Additional Information */}
                                            <div className="col-span-1 md:col-span-2">
                                                <div className="mb-4">
                                                    <label htmlFor="information" className="block text-sm font-medium text-gray-700 mb-1">
                                                        Additional Information
                                                    </label>
                                                    <textarea
                                                        className="input-standard"
                                                        value={customer.information}
                                                        name="information"
                                                        onChange={handleInputChange}
                                                        placeholder="Information"
                                                        id="information"
                                                        required
                                                        rows="4"
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
