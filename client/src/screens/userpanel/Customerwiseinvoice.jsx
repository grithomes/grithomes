import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ColorRing } from 'react-loader-spinner';
import Sidebar from './Sidebar';

import Alertauthtoken from '../../components/Alertauthtoken';
import CurrencySign from '../../components/CurrencySign ';

function Customerwiseinvoice() {
  const navigate = useNavigate();
  const location = useLocation();

  // --- Get data from navigation state ---
  const { customerid, customerEmails, customerEmail } = location.state || {};
  const emailToFetch = customerEmail || (customerEmails && customerEmails[0]);

  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState([]);
  const [alertMessage, setAlertMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalReceived, setTotalReceived] = useState(0);
  const [totalPaid, setTotalPaid] = useState(0);
  const [totalUnpaid, setTotalUnpaid] = useState(0);

  const entriesPerPage = 10;

  useEffect(() => {
    if (!localStorage.getItem('authToken') || localStorage.getItem('isTeamMember') === 'true') {
      navigate('/');
      return;
    }

    console.log('Customer ID:', customerid);
    console.log('Customer Emails:', customerEmails);
    console.log('Primary Email:', customerEmail);

    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const authToken = localStorage.getItem('authToken');
      if (!emailToFetch) {
        console.error('No customer email found');
        setAlertMessage('No customer email provided');
        setLoading(false);
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/customerwisedata/${emailToFetch}`,
        {
          headers: { Authorization: authToken },
        }
      );

      if (response.status === 401) {
        const json = await response.json();
        setAlertMessage(json.message);
        setLoading(false);
        window.scrollTo(0, 0);
        return;
      }

      const json = await response.json();
      if (Array.isArray(json)) {
        setInvoices(json);
        calculateTotals(json);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const calculateTotals = (invoices) => {
    let received = 0;
    let paid = 0;
    let unpaid = 0;

    invoices.forEach((invoice) => {
      received += invoice.total || 0;
    });

    const paidInvoices = invoices.filter(
      (invoice) => invoice.status === 'Paid' || invoice.status === 'Partially Paid'
    );

    paidInvoices.forEach((invoice) => {
      paid += (invoice.total - invoice.amountdue) || 0;
      unpaid += invoice.amountdue || 0;
    });

    setTotalReceived(received);
    setTotalPaid(paid);
    setTotalUnpaid(unpaid);
  };

  const getFilteredInvoices = () => {
    let filtered = invoices;
    if (filterStatus !== 'All') {
      filtered = filtered.filter((invoice) => invoice.status === filterStatus);
    }
    if (searchQuery) {
      filtered = filtered.filter(
        (invoice) =>
          (invoice.customername?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
          (invoice.job?.toLowerCase() || '').includes(searchQuery.toLowerCase())
      );
    }
    return filtered;
  };

  const getCurrentPageInvoices = () => {
    const filteredInvoices = getFilteredInvoices();
    const startIndex = currentPage * entriesPerPage;
    return filteredInvoices.slice(startIndex, startIndex + entriesPerPage);
  };

  const handlePrevPage = () => {
    if (currentPage > 0) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if ((currentPage + 1) * entriesPerPage < getFilteredInvoices().length)
      setCurrentPage(currentPage + 1);
  };

  const handleViewClick = (invoice) => {
    navigate('/userpanel/Invoicedetail', { state: { invoiceid: invoice._id } });
  };

  const roundOff = (value) => Math.round(value * 100) / 100;

  const formatCustomDate = (dateString) => {
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', options);
  };

  return (
    <div className='bg'>
      {loading ? (
        <div className="flex flex-col md:flex-row">
          <ColorRing
            width={200}
            loading={loading}
            size={500}
            display='flex'
            justify-content='center'
            align-items='center'
            aria-label='Loading Spinner'
            data-testid='loader'
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
                  <p className='text-3xl font-bold text-gray-800'>Customer Invoices</p>
                  <nav aria-label="breadcrumb">
                    <ol className="flex text-sm text-gray-500 mt-2 space-x-2">
                      <li><a href="/Userpanel/Userdashboard" className='hover:text-primary transition-colors text-decoration-none'>Dashboard</a></li>
                      <li><span className="mx-2">/</span></li>
                      <li><a href="/Userpanel/Customerlist" className='hover:text-primary transition-colors text-decoration-none'>Customers</a></li>
                      <li><span className="mx-2">/</span></li>
                      <li className="text-gray-800 font-semibold" aria-current="page">Invoices</li>
                    </ol>
                  </nav>
                </div>
                <div className="mt-4 md:mt-0 text-right">
                    {customerEmail && (
                      <p className='text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100'>
                        <i className="fa-regular fa-envelope mr-2 text-gray-400"></i>
                        <b>{customerEmail}</b>
                      </p>
                    )}
                </div>
              </div>

              {/* Financial Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mx-4 mb-8">
                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-indigo-600">Total Billed</p>
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-500">
                            <i className="fa-solid fa-file-invoice-dollar"></i>
                        </div>
                    </div>
                    <p className="text-3xl font-bold text-gray-900"><CurrencySign />{roundOff(totalReceived)}</p>
                </div>
                
                <div className="bg-green-50 border border-green-100 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-green-600">Total Paid</p>
                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-500">
                            <i className="fa-solid fa-check-double"></i>
                        </div>
                    </div>
                    <p className="text-3xl font-bold text-gray-900"><CurrencySign />{roundOff(totalPaid)}</p>
                </div>
                
                <div className="bg-orange-50 border border-orange-100 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-orange-600">Total Unpaid</p>
                        <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-500">
                            <i className="fa-solid fa-clock-rotate-left"></i>
                        </div>
                    </div>
                    <p className="text-3xl font-bold text-gray-900"><CurrencySign />{roundOff(totalUnpaid)}</p>
                </div>
              </div>

              <div className='card-standard mx-4 mb-8 overflow-hidden'>
                <div className='px-6 py-4 border-b border-gray-100 bg-white flex flex-wrap gap-4 items-center justify-between'>
                    <div className='w-full sm:w-auto min-w-[200px]'>
                        <select
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className='input-standard'
                            value={filterStatus}
                        >
                            <option value='All'>All Statuses</option>
                            <option value='Paid'>Paid</option>
                            <option value='Partially Paid'>Partially Paid</option>
                            <option value='Saved'>Saved</option>
                            <option value='Send'>Sent</option>
                        </select>
                    </div>
                    <div className='w-full sm:w-auto relative'>
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <i className="fa-solid fa-search text-gray-400"></i>
                        </div>
                        <input
                            type='text'
                            className='input-standard pl-10 w-full sm:w-64'
                            placeholder='Search by name or job'
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className='overflow-x-auto'>
                  <table className='w-full text-left border-collapse'>
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100 text-sm text-gray-500">
                        <th className="px-6 py-4 font-medium">Invoice</th>
                        <th className="px-6 py-4 font-medium text-center">Status</th>
                        <th className="px-6 py-4 font-medium">Date</th>
                        <th className="px-6 py-4 font-medium text-center">View</th>
                        <th className="px-6 py-4 font-medium text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {getCurrentPageInvoices().length === 0 ? (
                          <tr>
                              <td colSpan="5" className="text-center py-12">
                                  <div className="w-16 h-16 mx-auto bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                      <i className="fa-solid fa-receipt text-2xl text-gray-400"></i>
                                  </div>
                                  <h3 className="text-lg font-medium text-gray-900 mb-1">No invoices found</h3>
                                  <p className="text-gray-500">Try adjusting your search or filters.</p>
                              </td>
                          </tr>
                      ) : (
                          getCurrentPageInvoices().map((invoice, index) => (
                            <tr key={index} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4">
                                <p className='text-sm font-semibold text-gray-900 mb-1'>{invoice.customername}</p>
                                <p className='text-sm text-gray-600 mb-1'>{invoice.InvoiceNumber}</p>
                                <p className='text-xs text-gray-500'>Job: {invoice.job}</p>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    invoice.status === 'Paid' ? 'bg-green-100 text-green-800' :
                                    invoice.status === 'Send' || invoice.status === 'Sent' ? 'bg-blue-100 text-blue-800' :
                                    invoice.status === 'Partially Paid' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-gray-100 text-gray-800'
                                }`}>
                                  {invoice.status || 'Unknown'}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <div className='text-sm text-gray-600 flex flex-col gap-1'>
                                  <div className='flex items-center'>
                                    <span className='text-gray-400 w-12'>Issued:</span>
                                    <span>{formatCustomDate(invoice.date)}</span>
                                  </div>
                                  <div className='flex items-center font-medium'>
                                    <span className='text-gray-400 w-12'>Due:</span>
                                    <span className={new Date(invoice.duedate) < new Date() && invoice.status !== 'Paid' ? 'text-red-600' : 'text-gray-600'}>
                                        {formatCustomDate(invoice.duedate)}
                                    </span>
                                  </div>
                                </div>
                              </td>
                              <td className='px-6 py-4 text-center'>
                                <button className='text-gray-400 hover:text-primary transition-colors' onClick={() => handleViewClick(invoice)} title="View Invoice">
                                  <i className='fa-solid fa-eye'></i>
                                </button>
                              </td>
                              <td className="px-6 py-4 text-sm font-medium text-gray-900 text-right">
                                <CurrencySign />{roundOff(invoice.total)}
                              </td>
                            </tr>
                          ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {getFilteredInvoices().length > entriesPerPage && (
                  <div className='flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50'>
                    <span className="text-sm text-gray-500">
                      Showing {currentPage * entriesPerPage + 1} to {Math.min((currentPage + 1) * entriesPerPage, getFilteredInvoices().length)} of {getFilteredInvoices().length} entries
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
                        className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${((currentPage + 1) * entriesPerPage >= getFilteredInvoices().length) ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                        disabled={(currentPage + 1) * entriesPerPage >= getFilteredInvoices().length}
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
}

export default Customerwiseinvoice;
