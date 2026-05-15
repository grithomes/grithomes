import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import { useNavigate, useLocation } from 'react-router-dom';

import { ColorRing } from 'react-loader-spinner';
import CurrencySign from '../../components/CurrencySign ';
import Alertauthtoken from '../../components/Alertauthtoken';

export default function Estimate() {
  const [loading, setloading] = useState(true);
  const [estimates, setestimates] = useState([]);
  const [convertedEstimates, setConvertedEstimates] = useState([]);
  const location = useLocation();
  const estimateid = location.state?.estimateid;
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(0);
  const [alertMessage, setAlertMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const entriesPerPage = 10;

  useEffect(() => {
    if (!localStorage.getItem("authToken") || localStorage.getItem("isTeamMember") === "true") {
      navigate("/");
    }
    fetchData();
  }, []);

  const roundOff = (value) => Math.round(value * 100) / 100;

  const fetchData = async () => {
    try {
      const userid = localStorage.getItem("userid");
      const authToken = localStorage.getItem('authToken');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/estimatedata/${userid}`, {
        headers: {
          'Authorization': authToken,
        }
      });
      if (response.status === 401) {
        const json = await response.json();
        setAlertMessage(json.message);
        setloading(false);
        window.scrollTo(0, 0);
        return;
      } else {
        const json = await response.json();
        if (Array.isArray(json)) {
          setestimates(json);
        }
        setloading(false);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleViewClick = (estimate) => {
    let estimateid = estimate._id;
    navigate('/userpanel/estimatedetail', { state: { estimateid } });
  };

  const formatCustomDate = (dateString) => {
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', options);
  };

  const handleAddClick = () => {
    navigate('/userpanel/Createestimate');
  }

  const handleConvertToInvoice = async (estimateid) => {
    try {
      const authToken = localStorage.getItem('authToken');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/converttoinvoice/${estimateid}`, {
        method: 'POST',
        headers: {
          'Authorization': authToken,
        }
      });
      if (response.status === 401) {
        const data = await response.json();
        setAlertMessage(data.message);
        setloading(false);
        window.scrollTo(0, 0);
        return;
      } else {
        if (response.ok) {
          const data = await response.json();
          fetchData(); // refresh list
          setConvertedEstimates([...convertedEstimates, estimateid]);
        } else {
          const errorMessage = await response.json();
          console.error('Error converting to invoice:', errorMessage.message);
        }
      }
    } catch (error) {
      console.error('Error converting to invoice:', error);
    }
  };

  const getFilteredEstimates = () => {
    if (!searchQuery) return estimates;
    return estimates.filter(estimate => {
      const customerName = estimate.customername || "";
      const jobName = estimate.job || "";
      return (
        customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        jobName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  };

  const getPageCount = () => Math.ceil(getFilteredEstimates().length / entriesPerPage);

  const getCurrentPageEstimates = () => {
    const filtered = getFilteredEstimates();
    const startIndex = currentPage * entriesPerPage;
    const endIndex = startIndex + entriesPerPage;
    return filtered.slice(startIndex, endIndex);
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if ((currentPage + 1) * entriesPerPage < getFilteredEstimates().length) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div className='bg'>
      {loading ? (
        <div className="flex justify-center items-center h-screen">
          <ColorRing loading={loading} aria-label="Loading Spinner" />
        </div>
      ) : (
        <div className="w-full bg-gray-50 min-h-screen">
          <div className="flex flex-col md:flex-row">
            <Sidebar />
            <div className="flex-1 w-full mx-auto px-4 py-8">
              <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm max-w-7xl mx-auto">
                {alertMessage && <Alertauthtoken message={alertMessage} onClose={() => setAlertMessage('')} />}

                <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                  <h2 className="text-2xl font-bold text-gray-800">Estimates</h2>
                  <button className="btn-primary font-semibold flex items-center gap-2" onClick={handleAddClick}>
                    <i className="fas fa-plus"></i> Add New Estimate
                  </button>
                </div>

                <div className="flex flex-col md:flex-row gap-4 mb-6 bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <div className="w-full md:w-1/2 lg:w-1/3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Search Estimates</label>
                    <div className="relative">
                      <input
                        type="text"
                        className="input-standard bg-white pl-10"
                        placeholder="Search by Name or Job..."
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          setCurrentPage(0);
                        }}
                      />
                      <i className="fas fa-search absolute left-3 top-3 text-gray-400"></i>
                    </div>
                  </div>
                </div>

                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                        <th className="py-3 px-4 rounded-tl-lg">Estimate Details</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Date</th>
                        <th className="py-3 px-4 text-center">Actions</th>
                        <th className="py-3 px-4 text-center">Convert</th>
                        <th className="py-3 px-4 text-right rounded-tr-lg">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {getCurrentPageEstimates().length > 0 ? (
                        getCurrentPageEstimates().map((estimate, index) => (
                          <tr key={index} className="hover:bg-gray-50 transition-colors">
                            <td className="py-4 px-4">
                              <p className="font-semibold text-gray-800 text-base">{estimate.customername}</p>
                              <p className="text-sm text-gray-500 mt-1">{estimate.EstimateNumber}</p>
                              {estimate.job && <p className="text-xs text-gray-400 mt-0.5">Job: {estimate.job}</p>}
                            </td>
                            <td className="py-4 px-4">
                              <span className={`px-2.5 py-0.5 rounded text-xs font-semibold border ${estimate.status === 'Send' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                                  estimate.status === 'Paid' ? 'bg-green-100 text-green-800 border-green-200' :
                                    'bg-gray-100 text-gray-800 border-gray-200'
                                }`}>
                                <i className="fa-solid fa-circle me-1"></i>
                                {estimate.status || 'Saved'}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-sm text-gray-600">
                              <p className="mb-1"><span className="text-gray-400 w-12 inline-block">Issued:</span> {formatCustomDate(estimate.date)}</p>
                            </td>
                            <td className="py-4 px-4 text-center">
                              <button className="text-primary hover:text-blue-800 p-2 rounded-full hover:bg-blue-50 transition-colors" onClick={() => handleViewClick(estimate)} title="View Estimate">
                                <i className="fa-solid fa-eye"></i>
                              </button>
                            </td>
                            <td className="py-4 px-4 text-center">
                              {estimate.convertedToInvoice || convertedEstimates.includes(estimate._id) ? (
                                <span className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-1 rounded border border-green-200"><i className="fas fa-check-circle mr-1"></i> Converted</span>
                              ) : (
                                <button className="btn-secondary text-xs px-3 py-1 bg-white hover:bg-gray-50 border border-gray-200 rounded-md shadow-sm transition-colors" onClick={() => handleConvertToInvoice(estimate._id)}>
                                  Convert to Invoice
                                </button>
                              )}
                            </td>
                            <td className="py-4 px-4 text-right font-semibold text-gray-800">
                              <CurrencySign />{roundOff(estimate.total).toLocaleString('en-CA')}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="py-12 text-center text-gray-500">
                            <div className="flex flex-col items-center">
                              <i className="fas fa-file-invoice text-4xl mb-3 text-gray-300"></i>
                              <p>No estimates found matching your criteria</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card Layout */}
                <div className="md:hidden space-y-4 mt-4">
                  {getCurrentPageEstimates().length > 0 ? (
                    getCurrentPageEstimates().map((estimate, index) => (
                      <div key={index} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow relative">
                        <div className="flex justify-between items-start mb-3">
                          <div className="pr-8">
                            <p className="font-bold text-gray-800">{estimate.customername}</p>
                            <p className="text-sm text-gray-500">{estimate.EstimateNumber}</p>
                            {estimate.job && <p className="text-xs text-gray-400 mt-1">Job: {estimate.job}</p>}
                          </div>
                          <button className="absolute top-4 right-4 text-primary hover:bg-blue-50 p-2 rounded-full" onClick={() => handleViewClick(estimate)}>
                            <i className="fa-solid fa-eye"></i>
                          </button>
                        </div>
                        <div className="flex justify-between items-center border-t border-gray-50 pt-3 mt-3 mb-3">
                          <span className={`px-2.5 py-0.5 rounded text-xs font-semibold border ${estimate.status === 'Send' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                              estimate.status === 'Paid' ? 'bg-green-100 text-green-800 border-green-200' :
                                'bg-gray-100 text-gray-800 border-gray-200'
                            }`}>
                            <i className="fa-solid fa-circle me-1"></i>
                            {estimate.status || 'Saved'}
                          </span>
                          <div className="text-sm text-gray-500">
                            Issued: {formatCustomDate(estimate.date)}
                          </div>
                        </div>
                        <div className="flex justify-between items-end border-t border-gray-50 pt-3 mt-3">
                          <div>
                            {estimate.convertedToInvoice || convertedEstimates.includes(estimate._id) ? (
                              <span className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-1 rounded border border-green-200"><i className="fas fa-check-circle mr-1"></i> Converted</span>
                            ) : (
                              <button className="btn-secondary text-xs px-3 py-1 bg-white hover:bg-gray-50 border border-gray-200 rounded-md shadow-sm transition-colors" onClick={() => handleConvertToInvoice(estimate._id)}>
                                Convert to Invoice
                              </button>
                            )}
                          </div>
                          <div className="text-right flex flex-col items-end gap-2">
                            <p className="font-bold text-gray-800 text-lg"><CurrencySign />{roundOff(estimate.total).toLocaleString('en-CA')}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-8 text-center text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                      <p>No estimates found</p>
                    </div>
                  )}
                </div>

                {/* Pagination */}
                {getPageCount() > 0 && (
                  <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-100 flex-wrap gap-4">
                    <button type="button" className={`btn-secondary flex items-center gap-2 ${currentPage === 0 ? 'opacity-50 cursor-not-allowed' : ''}`} onClick={handlePrevPage} disabled={currentPage === 0}>
                      <i className="fas fa-chevron-left text-sm"></i> Previous
                    </button>
                    <span className="text-sm font-medium text-gray-600 bg-gray-50 px-4 py-2 rounded-lg">Page {currentPage + 1} of {getPageCount()}</span>
                    <button type="button" className={`btn-secondary flex items-center gap-2 ${currentPage >= getPageCount() - 1 ? 'opacity-50 cursor-not-allowed' : ''}`} onClick={handleNextPage} disabled={currentPage >= getPageCount() - 1}>
                      Next <i className="fas fa-chevron-right text-sm"></i>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
