import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';

import Alertauthtoken from '../../components/Alertauthtoken';
// import { ColorRing } from 'react-loader-spinner';

export default function Esign() {
  const [loading, setLoading] = useState(true);
  const [customerSignData, setCustomerSignData] = useState([]);
  const [alertMessage, setAlertMessage] = useState('');

  useEffect(() => {
    if (!localStorage.getItem("authToken") || localStorage.getItem("isTeamMember") === "true") {
      navigate("/");
    } else {
      fetchCustomerSignData();
    }
  }, []);

  const fetchCustomerSignData = async () => {
    try {
      const userEmail = localStorage.getItem("userEmail");
      const userid = localStorage.getItem("userid");
      // Adjust URL as needed
      const authToken = localStorage.getItem('authToken');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/getesigncustomerdata/${userid}`, {
        method: 'GET',
        headers: {
          Authorization: authToken,
        }
      });

      if (response.status === 401) {
        const json = await response.json();
        setAlertMessage(json.message);
      } else {
        const data = await response.json();
        setCustomerSignData(data);
      }
    } catch (error) {
      console.error('Error fetching customer signatures:', error);
      setAlertMessage('Error fetching data.');
    } finally {
      setLoading(false);
    }
  };

  const formatCustomDate = (dateString) => {
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', options);
  };

  return (
    <div className='bg'>
      <div className='w-full '>
        {
          loading ?
            <div className="flex flex-col md:flex-row">
              {/* Uncomment and use this if you have a spinner component */}
              {/* <ColorRing
                loading={loading}
                display="flex"
                justify-content="center"
                align-items="center"
                aria-label="Loading Spinner"
                data-testid="loader"
              /> */}
            </div> :
            <div className="flex flex-col md:flex-row">
                            <Sidebar />
                            <div className="flex-1 w-full mx-auto px-4">

                <div className='mt-8 mx-4'>
                  {alertMessage && <Alertauthtoken message={alertMessage} onClose={() => setAlertMessage('')} />}
                </div>

                <div className='flex flex-wrap items-center justify-between py-6 px-4 mb-6 bg-white shadow-sm rounded-xl border border-gray-100 mx-4'>
                  <div>
                    <p className='text-3xl font-bold text-gray-800'>E-Sign Documents</p>
                    <nav aria-label="breadcrumb">
                      <ol className="flex text-sm text-gray-500 mt-2 space-x-2">
                        <li><a href="/Userpanel/Userdashboard" className='hover:text-primary transition-colors text-decoration-none'>Dashboard</a></li>
                        <li><span className="mx-2">/</span></li>
                        <li className="text-gray-800 font-semibold" aria-current="page">Customer Signatures</li>
                      </ol>
                    </nav>
                  </div>
                </div>

                <div className="card-standard mx-4 mb-8 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-100 text-sm text-gray-500">
                          <th className="px-6 py-4 font-medium">Status</th>
                          <th className="px-6 py-4 font-medium">Document Name</th>
                          <th className="px-6 py-4 font-medium">Created</th>
                          <th className="px-6 py-4 font-medium">Last Updated</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {customerSignData.length > 0 ? (
                          customerSignData.map((item, index) => (
                            <tr key={index} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4 text-sm">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  item.status === 'Signed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {item.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.documentNumber}</td>
                              <td className="px-6 py-4 text-sm text-gray-600">{formatCustomDate(item.createdAt)}</td>
                              <td className="px-6 py-4 text-sm text-gray-600">
                                {item.lastupdated ? (
                                  <div>
                                    <span className="block">{item.lastupdated}</span>
                                    <span className="block text-xs text-gray-400 mt-0.5">By {item.customerName}</span>
                                  </div>
                                ) : (
                                  <span className="text-gray-400">-</span>
                                )}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="4" className="text-center py-12">
                              <div className="w-16 h-16 mx-auto bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                <i className="fa-solid fa-file-signature text-2xl text-gray-400"></i>
                              </div>
                              <h3 className="text-lg font-medium text-gray-900 mb-1">No signed documents yet</h3>
                              <p className="text-gray-500">Customer signatures will appear here once signed.</p>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
        }
      </div>
    </div>
  );
}
