
import React, { useState, useEffect } from 'react';
import Usernavbar from './Usernavbar';
import { useNavigate, useLocation } from 'react-router-dom';
import Usernav from './Usernav';
import { ColorRing } from 'react-loader-spinner';
import CurrencySign from '../../components/CurrencySign ';
import Alertauthtoken from '../../components/Alertauthtoken';

export default function Invoice() {
  const [loading, setLoading] = useState(true);
  const [tableloading, settableLoading] = useState(true);
  const [invoices, setInvoices] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
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
      ? `http://localhost:3001/api/searchinvoices/${userid}?search=${encodeURIComponent(searchQuery)}&status=${filterStatus}`
      : `http://localhost:3001/api/invoicedata/${userid}/?page=${currentPage}&limit=${limit}&status=${filterStatus}`;
      
      const authToken = localStorage.getItem('authToken');
      console.log(authToken,"authToken");
      
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
        const response = await fetch(`http://localhost:3001/api/gettransactiondata/${invoice._id}`, {
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
      return <span className="badge bg-primary"><i className="fa-solid fa-circle me-1"></i>Send</span>;
    }

    const relatedTransactions = transactions.filter(t => t.invoiceId === invoice._id);
    const totalPaidAmount = relatedTransactions.reduce((total, payment) => total + parseFloat(payment.paidamount), 0);

    if (totalPaidAmount === 0) {
      return <span className="badge bg-secondary"><i className="fa-solid fa-circle me-1"></i>Saved</span>;
    } else if (totalPaidAmount > 0 && totalPaidAmount < invoice.total) {
      return <span className="badge bg-warning"><i className="fa-solid fa-circle me-1"></i>Partially Paid</span>;
    } else if (totalPaidAmount >= invoice.total) {
      return <span className="badge bg-success"><i className="fa-solid fa-circle me-1"></i>Paid</span>;
    }
    return <span className="badge bg-danger"><i className="fa-solid fa-circle me-1"></i>Pending</span>;
  };

  const handlePrevPage = () => currentPage > 0 && setCurrentPage(currentPage - 1);
  const handleNextPage = () => currentPage < totalPages - 1 && setCurrentPage(currentPage + 1);

  return (
    <div className="bg">
      {loading ? (
        <div className="d-flex justify-content-center align-items-center vh-100">
          <ColorRing loading={loading} aria-label="Loading Spinner" />
        </div>
      ) : (
        <div className="container-fluid">
          <div className="row">
            <div className="col-lg-2 col-md-3 vh-100 b-shadow bg-white d-lg-block d-md-block d-none">
              <Usernavbar />
            </div>
            <div className="col-lg-10 col-md-9 col-12 mx-auto">
              <div className="d-lg-none d-md-none d-block mt-2">
                <Usernav />
              </div>
              <div className="bg-white my-5 p-3 box mx-2 mx-md-4">
                {alertMessage && <Alertauthtoken message={alertMessage} onClose={() => setAlertMessage('')} />}
                <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap">
                  <h5 className="fw-bold">Invoices</h5>
                  <button className="btn btn-primary rounded-pill fw-bold" onClick={handleAddClick}>+ Add New</button>
                </div>
                <hr />
                <div className="row mb-3 g-2">
                  <div className="col-6 col-md-3">
                    <select className="form-select" onChange={(e) => setFilterStatus(e.target.value)} value={filterStatus}>
                      <option value="All">All</option>
                      <option value="Paid">Paid</option>
                      <option value="Partially Paid">Partially Paid</option>
                      <option value="Saved">Saved</option>
                      <option value="Send">Send</option>
                    </select>
                  </div>
                  <div className="col-6 col-md-3">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search by Name / Job"
                      value={searchQuery}
                      onChange={(e) => {
                        const value = e.target.value;
                        setSearchQuery(value);

                        if (value.trim() === '') {
                          setCurrentPage(0);
                        }
                      }}
                    />
                  </div>
                </div>

                {/* Desktop Table */}
                <div className="d-none d-md-block table-responsive">
                  {tableloading ? (
                    <div className="text-center py-3">
                      <ColorRing height="50" />
                    </div>
                  ) : (
                    <table className="table table-bordered">
                      <thead>
                        <tr>
                          <th>INVOICE</th>
                          <th>STATUS</th>
                          <th>DATE</th>
                          <th>VIEW</th>
                          <th>AMOUNT</th>
                        </tr>
                      </thead>
                      <tbody>
                        {console.log(invoices, "invoices")}
                        {Array.isArray(invoices) && invoices.length > 0 ? (
                          invoices.map((invoice, index) => (
                            <tr key={index}>
                              <td>
                                <p className="fw-bold mb-0">{invoice.customername}</p>
                                <p className="mb-0">{invoice.InvoiceNumber}</p>
                                <p className="mb-0">Job: {invoice.job}</p>
                              </td>
                              <td>{getStatus(invoice)}</td>
                              <td>
                                <p className="mb-0">Issued: {formatCustomDate(invoice.date)}</p>
                                <p className="mb-0">Due: {formatCustomDate(invoice.duedate)}</p>
                              </td>
                              <td className="text-center">
                                <button className="btn btn-link" onClick={() => handleViewClick(invoice)}>
                                  <i className="fa-solid fa-eye"></i>
                                </button>
                              </td>
                              <td><CurrencySign />{roundOff(invoice.total)}</td>
                            </tr>
                          ))) : (
                          <tr>
                            <td colSpan="5" className="text-center">No invoices found</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  )}
                </div>

                {/* Mobile Card Layout */}
                <div className="d-md-none">
                  {Array.isArray(invoices) && invoices.length > 0 ? (

                    invoices.map((invoice, index) => (
                      <div key={index} className="card mb-3 shadow-sm">
                        <div className="card-body">
                          <div className="d-flex justify-content-between align-items-start">
                            <div>
                              <p className="fw-bold mb-1">{invoice.customername}</p>
                              <p className="small mb-1">{invoice.InvoiceNumber}</p>
                              <p className="small mb-1">Job: {invoice.job}</p>
                            </div>
                            <button className="btn btn-link p-0" onClick={() => handleViewClick(invoice)}>
                              <i className="fa-solid fa-eye"></i>
                            </button>
                          </div>
                          <div className="d-flex justify-content-between mt-2">
                            <div>
                              <p className="small mb-0">Issued: {formatCustomDate(invoice.date)}</p>
                              <p className="small mb-0">Due: {formatCustomDate(invoice.duedate)}</p>
                            </div>
                            <div className="text-end">
                              <p className="fw-bold mb-0"><CurrencySign />{roundOff(invoice.total).toLocaleString('en-CA')}</p>
                              {getStatus(invoice)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center">No invoices found</td>
                    </tr>
                  )}
                </div>

                {/* Pagination */}
                {!searchQuery && (
                  <div className="d-flex justify-content-between mt-3 flex-wrap">
                    <button type="button" className="btn btn-outline-primary" onClick={handlePrevPage} disabled={currentPage === 0}>
                      Previous
                    </button>
                    <span className="align-self-center">Page {currentPage + 1} of {totalPages}</span>
                    <button type="button" className="btn btn-outline-primary" onClick={handleNextPage} disabled={currentPage >= totalPages - 1}>
                      Next
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