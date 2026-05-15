import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';

import Alertauthtoken from '../../components/Alertauthtoken';
import CurrencySign from '../../components/CurrencySign ';
import { ColorRing } from 'react-loader-spinner';

const Overdue = () => {
  const [loading, setLoading] = useState(true);
  const [overdueInvoices, setOverdueInvoices] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [alertMessage, setAlertMessage] = useState('');
  const entriesPerPage = 10;

  const location = useLocation();
  const invoiceId = location.state?.invoiceid;
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem("authToken") || localStorage.getItem("isTeamMember") === "true") {
      navigate("/");
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const userid = localStorage.getItem("userid");
      const authToken = localStorage.getItem('authToken');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/overdueInvoices/${userid}`, {
        headers: {
          'Authorization': authToken,
        }
      });

      if (response.status === 401) {
        const json = await response.json();
        setAlertMessage(json.message);
        setLoading(false);
        window.scrollTo(0, 0);
        return; // Stop further execution
      } else {
        const json = await response.json();
        if (Array.isArray(json.overdueInvoices)) {
          setOverdueInvoices(json.overdueInvoices);
        }
        setLoading(false);
      }

    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const formatCustomDate = (dateString) => {
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', options);
  };

  const handleViewClick = (invoice) => {
    let invoiceid = invoice._id;
    navigate('/userpanel/Invoicedetail', { state: { invoiceid } });
  };

  // Pagination functions
  const getPageCount = () => Math.ceil(overdueInvoices.length / entriesPerPage);

  const getCurrentPageInvoices = () => {
    const startIndex = currentPage * entriesPerPage;
    const endIndex = startIndex + entriesPerPage;
    return overdueInvoices.slice(startIndex, endIndex);
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if ((currentPage + 1) * entriesPerPage < overdueInvoices.length) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div className='bg'>
      {loading ? (
        <div className="flex flex-col md:flex-row">
          <ColorRing
            loading={loading}
            display="flex"
            justifyContent="center"
            alignItems="center"
            aria-label="Loading Spinner"
            data-testid="loader"
          />
        </div>
      ) : (
        <div className='w-full '>
          <div className="flex flex-col md:flex-row">
                            <Sidebar />
                            <div className="flex-1 w-full mx-auto px-4">

              <div className='mt-8 mx-4'>
                {alertMessage && <Alertauthtoken message={alertMessage} onClose={() => setAlertMessage('')} />}
              </div>
              <div className='flex flex-wrap items-center justify-between py-6 px-4 mb-6 bg-white shadow-sm rounded-xl border border-gray-100 mx-4'>
                <div>
                  <p className='text-3xl font-bold text-gray-800'>Overdue Invoices</p>
                  <nav aria-label="breadcrumb">
                    <ol className="flex text-sm text-gray-500 mt-2 space-x-2">
                      <li><a href="/Userpanel/Userdashboard" className='hover:text-primary transition-colors text-decoration-none'>Dashboard</a></li>
                      <li><span className="mx-2">/</span></li>
                      <li className="text-gray-800 font-semibold" aria-current="page">Overdue</li>
                    </ol>
                  </nav>
                </div>
              </div>

              <div className='card-standard mx-4 mb-8 overflow-hidden'>
                <div className='overflow-x-auto'>
                  <table className='w-full text-left border-collapse'>
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100 text-sm text-gray-500">
                        <th className="px-6 py-4 font-medium">Invoice</th>
                        <th className="px-6 py-4 font-medium">Status</th>
                        <th className="px-6 py-4 font-medium">Date</th>
                        <th className="px-6 py-4 font-medium text-center">View</th>
                        <th className="px-6 py-4 font-medium text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {getCurrentPageItems().map((invoice, index) => (
                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <p className='text-sm font-semibold text-gray-900 mb-1'>{invoice.customername}</p>
                            <p className='text-sm text-gray-600 mb-1'>{invoice.InvoiceNumber}</p>
                            <p className='text-xs text-gray-500'>Job: {invoice.job}</p>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              <i className="fa-solid fa-circle text-[8px] mr-1.5"></i>
                              {invoice.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className='text-sm text-gray-600 flex flex-col gap-1'>
                              <div className='flex items-center'>
                                <span className='text-gray-400 w-12'>Issued:</span>
                                <span>{formatCustomDate(invoice.date)}</span>
                              </div>
                              <div className='flex items-center font-medium text-red-600'>
                                <span className='text-red-400 w-12'>Due:</span>
                                <span>{formatCustomDate(invoice.duedate)}</span>
                              </div>
                            </div>
                          </td>
                          <td className='px-6 py-4 text-center'>
                            <button className='text-gray-400 hover:text-primary transition-colors' onClick={() => handleViewClick(invoice)} title="View Invoice">
                              <i className='fa-solid fa-eye'></i>
                            </button>
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900 text-right"><CurrencySign />{invoice.total}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {overdueInvoices.length === 0 && (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 mx-auto bg-gray-50 rounded-full flex items-center justify-center mb-4">
                        <i className="fa-solid fa-check-circle text-2xl text-green-400"></i>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-1">No overdue invoices</h3>
                      <p className="text-gray-500">Great job! All your invoices are paid or up to date.</p>
                    </div>
                  )}
                </div>
                
                {/* Pagination */}
                {overdueInvoices.length > entriesPerPage && (
                  <div className='flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50'>
                    <span className="text-sm text-gray-500">
                      Showing {currentPage * entriesPerPage + 1} to {Math.min((currentPage + 1) * entriesPerPage, overdueInvoices.length)} of {overdueInvoices.length} entries
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
                        className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${((currentPage + 1) * entriesPerPage >= overdueInvoices.length) ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                        disabled={(currentPage + 1) * entriesPerPage >= overdueInvoices.length}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Overdue;
