import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import { useNavigate } from 'react-router-dom';
// import Sidebar from './Sidebar';
import { CountrySelect, StateSelect, CitySelect } from '@davzon/react-country-state-city';
import "@davzon/react-country-state-city/dist/react-country-state-city.css";
import Alertauthtoken from '../../components/Alertauthtoken';

import { ColorRing } from 'react-loader-spinner'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Addcustomer() {
  const navigate = useNavigate();
  const [loading, setloading] = useState(true);
  const [alertMessage, setAlertMessage] = useState('');
  const [credentials, setCredentials] = useState({
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

  const [countryid, setcountryid] = useState(false);
  const [stateid, setstateid] = useState(false);
  const [cityid, setcityid] = useState(false);

  const [country, setcountry] = useState(false);
  const [state, setstate] = useState(false);
  const [city, setcity] = useState(false);

  const [message, setMessage] = useState(false);
  const [alertShow, setAlertShow] = useState('');
  const [alertmessageShow, setAlertmessageShow] = useState('');

  useEffect(() => {
    if (!localStorage.getItem("authToken") || localStorage.getItem("isTeamMember") == "true") {
      navigate("/");
    }
    setloading(false);
  })
  const handleEmailChange = (index, value) => {
    const updatedEmails = [...credentials.emails];
    updatedEmails[index] = value;
    setCredentials({ ...credentials, emails: updatedEmails });
  };

  const addEmailField = () => {
    setCredentials({ ...credentials, emails: [...credentials.emails, ''] });
  };
  const removeEmailField = (index) => {
    const updatedEmails = [...credentials.emails];
    updatedEmails.splice(index, 1);
    setCredentials({ ...credentials, emails: updatedEmails });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setloading(true);

    let userid = localStorage.getItem('userid');
    const authToken = localStorage.getItem('authToken');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/addcustomer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authToken,
        },
        body: JSON.stringify({
          userid: userid,
          name: credentials.name,
          emails: credentials.emails, // <-- updated for multiple emails
          information: credentials.information,
          number: credentials.number,
          city: city,
          state: state,
          country: country,
          citydata: credentials.citydata,
          statedata: credentials.statedata,
          countrydata: credentials.countrydata,
          cityid: cityid,
          stateid: stateid,
          countryid: countryid,
          address1: credentials.address1,
          address2: credentials.address2,
          post: credentials.post,
        }),
      });

      const json = await response.json();
      setloading(false);

      if (response.status === 401) {
        toast.error(json.message || 'Unauthorized: Invalid token');
        return;
      }

      if (json.success) {
        setCredentials({
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

        toast.success(json.message || 'Customer added successfully!');
        // setTimeout(() => {
        //   navigate('/userpanel/Customerlist');
        // }, 2000);
      } else {
        toast.error(json.message || 'This email already exists or failed to add.');
      }

    } catch (err) {
      console.error(err);
      setloading(false);
      toast.error('Something went wrong. Please try again.');
    }
  };


  const onchange = (event) => {
    setCredentials({ ...credentials, [event.target.name]: event.target.value });
  };


  return (
    <div className="bg">
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
          <div className="w-full ">
            <div className="flex flex-col md:flex-row">
                            <Sidebar />
                            <div className="flex-1 w-full mx-auto px-4">

                <div className='mt-6 mx-4'>
                  {alertMessage && <Alertauthtoken message={alertMessage} onClose={() => setAlertMessage('')} />}
                  {alertmessageShow == true ?
                    <div className="alert alert-warning flex justify-between" role="alert">
                      <div>
                        {alertmessageShow}
                      </div>
                      <button type="button" className="btn-close" onClick={() => {
                        setAlertmessageShow("");
                      }}>
                      </button>
                    </div>
                    : ''
                  }
                </div>
                
                <form onSubmit={handleSubmit}>
                  <div className='flex flex-wrap items-center justify-between py-6 px-4 mb-6 bg-white shadow-sm rounded-xl border border-gray-100 mx-4'>
                    <div>
                      <p className='text-3xl font-bold text-gray-800'>Add Customer</p>
                      <nav aria-label="breadcrumb">
                        <ol className="flex text-sm text-gray-500 mt-2 space-x-2">
                          <li><a href="/userpanel/Userdashboard" className='hover:text-primary transition-colors text-decoration-none'>Dashboard</a></li>
                          <li><span className="mx-2">/</span></li>
                          <li><a href="/userpanel/Customerlist" className='hover:text-primary transition-colors text-decoration-none'>Customers</a></li>
                          <li><span className="mx-2">/</span></li>
                          <li className="text-gray-800 font-semibold" aria-current="page">Add Customer</li>
                        </ol>
                      </nav>
                    </div>
                    <div className="mt-4 md:mt-0">
                      <button className='btn-primary' type="submit">Save Customer</button>
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
                            value={credentials.name}
                            onChange={onchange}
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
                            type="text"
                            name="number"
                            className="input-standard"
                            onChange={onchange}
                            placeholder="Phone Number"
                            id="phonenumber"
                          />
                        </div>
                      </div>

                      {/* Contact Emails - Spans full width potentially or half */}
                      <div className="col-span-1 md:col-span-2">
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Contact Emails</label>
                          <div className="space-y-3">
                            {credentials.emails.map((email, index) => (
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
                                  disabled={credentials.emails.length === 1}
                                  title="Remove Email"
                                >
                                  <i className="fa-solid fa-minus"></i>
                                </button>
                                {index === credentials.emails.length - 1 && (
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
                            type="text"
                            name="address1"
                            onChange={onchange}
                            className="input-standard"
                            placeholder="Address 1"
                            id="Address1"
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
                            type="text"
                            name="address2"
                            onChange={onchange}
                            className="input-standard"
                            placeholder="Address 2"
                            id="Address2"
                          />
                        </div>
                      </div>

                      {/* Country */}
                      <div className="col-span-1">
                        <div className="mb-4 country-select-container">
                          <label htmlFor="Country" className="block text-sm font-medium text-gray-700 mb-1">
                            Country
                          </label>
                          <CountrySelect
                            name="country"
                            value={credentials.countryid}
                            onChange={(val) => {
                              console.log(val);
                              setcountryid(val.id);
                              setcountry(val.name);
                              setCredentials({ ...credentials, countrydata: JSON.stringify(val) })
                            }}
                            valueType="short"
                            className="w-full"
                            placeHolder="Select Country"
                          />
                        </div>
                      </div>

                      {/* State */}
                      <div className="col-span-1">
                        <div className="mb-4 country-select-container">
                          <label htmlFor="State" className="block text-sm font-medium text-gray-700 mb-1">
                            State
                          </label>
                          <StateSelect
                            name="state"
                            countryid={countryid}
                            onChange={(val) => {
                              console.log(val);
                              setstateid(val.id);
                              setstate(val.name);
                              setCredentials({ ...credentials, statedata: JSON.stringify(val) })
                            }}
                            className="w-full"
                            placeHolder="Select State"
                          />
                        </div>
                      </div>

                      {/* City */}
                      <div className="col-span-1">
                        <div className="mb-4 country-select-container">
                          <label htmlFor="City" className="block text-sm font-medium text-gray-700 mb-1">
                            City
                          </label>
                          <CitySelect
                            countryid={countryid}
                            stateid={stateid}
                            onChange={(val) => {
                              console.log(val);
                              setcityid(val.id);
                              setcity(val.name);
                              setCredentials({ ...credentials, citydata: JSON.stringify(val) })
                            }}
                            className="w-full"
                            placeHolder="Select City"
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
                            onChange={onchange}
                            className="input-standard"
                            placeholder="Post Code"
                            id="post"
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
                            name="information"
                            onChange={onchange}
                            placeholder="Information"
                            id="information"
                            rows="4"
                          />
                        </div>
                      </div>

                    </div>
                  </div>
                </form>
                <ToastContainer
                  position="top-right"
                  autoClose={3000}
                  hideProgressBar={false}
                  newestOnTop={false}
                  closeOnClick
                  rtl={false}
                  pauseOnFocusLoss
                  draggable
                  pauseOnHover
                  theme="light"
                />
              </div>
            </div>
          </div>
      }
    </div>
  );
}
