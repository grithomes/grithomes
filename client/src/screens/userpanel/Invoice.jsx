
import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import { useNavigate, useLocation } from 'react-router-dom';

import { ColorRing } from 'react-loader-spinner';
import CurrencySign from '../../components/CurrencySign ';
import Alertauthtoken from '../../components/Alertauthtoken';

export default function Invoice() {
  const [loading, setLoading] = useState(true);
  const [tableloading, settableLoading] = useState(true);
  const [invoices, setInvoices] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [alertMessage, setAlertMessage] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const limit = 20;

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {

    if (!localStorage.getItem("authToken") || localStorage.getItem("isTeamMember") === "true") {
      navigate("/");

    } else {


      fetchData();

    }
  }, [currentPage, filterStatus, searchQuery]);

  const fetchData = async () => {
    console.log("Hello it fecthdata start")
    try {
      // setLoading(true);
      settableLoading(true)
      const userid = localStorage.getItem("userid");

      const endpoint = searchQuery.trim()
        ? `${import.meta.env.VITE_API_BASE_URL}/searchinvoices/${userid}?search=${encodeURIComponent(searchQuery)}&status=${filterStatus}`
        : `${import.meta.env.VITE_API_BASE_URL}/invoicedata/${userid}?page=${currentPage}&limit=${limit}&status=${filterStatus}`;

      const authToken = localStorage.getItem('authToken');
      console.log(authToken, "authToken");

      const response = await fetch(endpoint, {
        headers: { 'Authorization': authToken }
      });
      console.log(response, "Hello it fecthdata after endpoint")

      if (response.status === 401) {
        const json = await response.json();
        setAlertMessage(json.message);
        // setLoading(false);
        settableLoading(false);
        window.scrollTo(0, 0);
        return;
      }

      const json = await response.json();
      // const invoicesList = json.invoices;
      const invoicesList = Array.isArray(json.invoices) ? json.invoices : [];
      console.log(invoicesList, "invoicesList");
      setTotalPages(json.totalPages);
      setInvoices(invoicesList);

      if (!searchQuery.trim()) {
        setTotalPages(json.totalPages);
      } else {
        setTotalPages(1);
        setCurrentPage(0);
      }

      const transactionPromises = invoicesList.map(async (invoice) => {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/gettransactiondata/${invoice._id}`, {
          headers: { 'Authorization': authToken }
        });
        if (response.status === 401) {
          const transactionJson = await response.json();
          setAlertMessage(transactionJson.message);
          return [];
        }
        const transactionJson = await response.json();
        return transactionJson.map(transaction => ({ ...transaction, invoiceId: invoice._id }));
      });

      const transactionsData = await Promise.all(transactionPromises);
      setTransactions(transactionsData.flat());
      setLoading(false);
      settableLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
      settableLoading(false);
    }
  };

  const roundOff = (value) => {
    const roundedValue = Math.round(value * 100) / 100;
    return roundedValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const formatCustomDate = (dateString) => {
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const handleViewClick = (invoice) => {
    navigate('/userpanel/Invoicedetail', { state: { invoiceid: invoice._id } });
  };

  const handleAddClick = () => {
    navigate('/userpanel/Createinvoice');
  };

  const getStatus = (invoice) => {
    if (invoice.status === 'Send') {
      return <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded border border-blue-200"><i className="fa-solid fa-circle me-1"></i>Send</span>;
    }

    const relatedTransactions = transactions.filter(t => t.invoiceId === invoice._id);
    const totalPaidAmount = relatedTransactions.reduce((total, payment) => total + parseFloat(payment.paidamount), 0);

    if (totalPaidAmount === 0) {
      return <span className="bg-gray-100 text-gray-800 text-xs font-semibold px-2.5 py-0.5 rounded border border-gray-200"><i className="fa-solid fa-circle me-1"></i>Saved</span>;
    } else if (totalPaidAmount > 0 && totalPaidAmount < invoice.total) {
      return <span className="badge-warning"><i className="fa-solid fa-circle me-1"></i>Partially Paid</span>;
    } else if (totalPaidAmount >= invoice.total) {
      return <span className="badge-success"><i className="fa-solid fa-circle me-1"></i>Paid</span>;
    }
    return <span className="bg-red-100 text-red-800 text-xs font-semibold px-2.5 py-0.5 rounded border border-red-200"><i className="fa-solid fa-circle me-1"></i>Pending</span>;
  };

  const handlePrevPage = () => currentPage > 0 && setCurrentPage(currentPage - 1);
  const handleNextPage = () => currentPage < totalPages - 1 && setCurrentPage(currentPage + 1);

  return (
    <div className="bg">
      {loading ? (
        <div className="flex justify-center items-center vh-100">
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
                  <h2 className="text-2xl font-bold text-gray-800">Invoices</h2>
                  <button className="btn-primary font-semibold flex items-center gap-2" onClick={handleAddClick}>
                    <i className="fas fa-plus"></i> Add New Invoice
                  </button>
                </div>

                <div className="flex flex-col md:flex-row gap-4 mb-6 bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <div className="w-full md:w-1/3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Filter Status</label>
                    <select className="input-standard bg-white" onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(0); }} value={filterStatus}>
                      <option value="All">All Invoices</option>
                      <option value="Paid">Paid</option>
                      <option value="Partially Paid">Partially Paid</option>
                      <option value="Saved">Saved</option>
                      <option value="Send">Sent</option>
                    </select>
                  </div>
                  <div className="w-full md:w-1/3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Search Invoices</label>
                    <div className="relative">
                      <input
                        type="text"
                        className="input-standard bg-white pl-10"
                        placeholder="Search by Name or Job..."
                        value={searchQuery}
                        onChange={(e) => {
                          const value = e.target.value;
                          setSearchQuery(value);
                          setCurrentPage(0);
                        }}
                      />
                      <i className="fas fa-search absolute left-3 top-3 text-gray-400"></i>
                    </div>
                  </div>
                </div>

                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                  {tableloading ? (
                    <div className="flex justify-center py-12">
                      <ColorRing height="50" width="50" />
                    </div>
                  ) : (
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                          <th className="py-3 px-4 rounded-tl-lg">Invoice Details</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4">Dates</th>
                          <th className="py-3 px-4 text-center">Actions</th>
                          <th className="py-3 px-4 text-right rounded-tr-lg">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {Array.isArray(invoices) && invoices.length > 0 ? (
                          invoices.map((invoice, index) => (
                            <tr key={index} className="hover:bg-gray-50 transition-colors">
                              <td className="py-4 px-4">
                                <p className="font-semibold text-gray-800 text-base">{invoice.customername}</p>
                                <p className="text-sm text-gray-500 mt-1">{invoice.InvoiceNumber}</p>
                                {invoice.job && <p className="text-xs text-gray-400 mt-0.5">Job: {invoice.job}</p>}
                              </td>
                              <td className="py-4 px-4">{getStatus(invoice)}</td>
                              <td className="py-4 px-4 text-sm text-gray-600">
                                <p className="mb-1"><span className="text-gray-400 w-12 inline-block">Issued:</span> {formatCustomDate(invoice.date)}</p>
                                <p><span className="text-gray-400 w-12 inline-block">Due:</span> {formatCustomDate(invoice.duedate)}</p>
                              </td>
                              <td className="py-4 px-4 text-center">
                                <button className="text-primary hover:text-blue-800 p-2 rounded-full hover:bg-blue-50 transition-colors" onClick={() => handleViewClick(invoice)} title="View Invoice">
                                  <i className="fa-solid fa-eye"></i>
                                </button>
                              </td>
                              <td className="py-4 px-4 text-right font-semibold text-gray-800">
                                <CurrencySign />{roundOff(invoice.total)}
                              </td>
                            </tr>
                          ))) : (
                          <tr>
                            <td colSpan="5" className="py-12 text-center text-gray-500">
                              <div className="flex flex-col items-center">
                                <i className="fas fa-file-invoice text-4xl mb-3 text-gray-300"></i>
                                <p>No invoices found matching your criteria</p>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  )}
                </div>

                {/* Mobile Card Layout */}
                <div className="md:hidden space-y-4 mt-4">
                  {Array.isArray(invoices) && invoices.length > 0 ? (
                    invoices.map((invoice, index) => (
                      <div key={index} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow relative">
                        <div className="flex justify-between items-start mb-3">
                          <div className="pr-8">
                            <p className="font-bold text-gray-800">{invoice.customername}</p>
                            <p className="text-sm text-gray-500">{invoice.InvoiceNumber}</p>
                            {invoice.job && <p className="text-xs text-gray-400 mt-1">Job: {invoice.job}</p>}
                          </div>
                          <button className="absolute top-4 right-4 text-primary hover:bg-blue-50 p-2 rounded-full" onClick={() => handleViewClick(invoice)}>
                            <i className="fa-solid fa-eye"></i>
                          </button>
                        </div>
                        <div className="flex justify-between items-end border-t border-gray-50 pt-3 mt-3">
                          <div className="text-xs text-gray-500 space-y-1">
                            <p>Issued: {formatCustomDate(invoice.date)}</p>
                            <p>Due: {formatCustomDate(invoice.duedate)}</p>
                          </div>
                          <div className="text-right flex flex-col items-end gap-2">
                            <p className="font-bold text-gray-800 text-lg"><CurrencySign />{roundOff(invoice.total).toLocaleString('en-CA')}</p>
                            {getStatus(invoice)}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-8 text-center text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                      <p>No invoices found</p>
                    </div>
                  )}
                </div>

                {/* Pagination */}
                {!searchQuery && totalPages > 0 && (
                  <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-100 flex-wrap gap-4">
                    <button type="button" className={`btn-secondary flex items-center gap-2 ${currentPage === 0 ? 'opacity-50 cursor-not-allowed' : ''}`} onClick={handlePrevPage} disabled={currentPage === 0}>
                      <i className="fas fa-chevron-left text-sm"></i> Previous
                    </button>
                    <span className="text-sm font-medium text-gray-600 bg-gray-50 px-4 py-2 rounded-lg">Page {currentPage + 1} of {totalPages}</span>
                    <button type="button" className={`btn-secondary flex items-center gap-2 ${currentPage >= totalPages - 1 ? 'opacity-50 cursor-not-allowed' : ''}`} onClick={handleNextPage} disabled={currentPage >= totalPages - 1}>
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