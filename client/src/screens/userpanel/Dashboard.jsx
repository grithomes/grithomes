import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useNavigate, useLocation } from 'react-router-dom';
import { ColorRing } from 'react-loader-spinner';
import CurrencySign from '../../components/CurrencySign ';
import Alertauthtoken from '../../components/Alertauthtoken';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState([]);
  const location = useLocation();
  const invoiceid = location.state?.invoiceid;
  const [curMonTotalAmount, setCurMonTotalAmount] = useState(0);
  const [curMonPaidAmount, setCurMonPaidAmount] = useState(0);
  const [curMonUnpaidAmount, setCurMonUnpaidAmount] = useState(0);
  const [overdueCount, setOverdueCount] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPaymentsReceived, setTotalPaymentsReceived] = useState(0);
  const [totalInvoiceAmount, setTotalInvoiceAmount] = useState(0);
  const [totalUnpaidAmount, setTotalUnpaidAmount] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [financialYearData, setFinancialYearData] = useState([]);
  const limit = 20;
  const [totalPages, setTotalPages] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  const navigate = useNavigate();
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [signupdata, setSignupdata] = useState([]);
  const [startTime, setStartTime] = useState(null);
  const [totalTime, setTotalTime] = useState(0);
  const [alertMessage, setAlertMessage] = useState('');
  const [userEntries, setUserEntries] = useState([]);
  const currentDate = new Date();
  const currentMonth = format(currentDate, 'MMMM');

  useEffect(() => {
    if (!localStorage.getItem("authToken") || localStorage.getItem("isTeamMember") === "true") {
      navigate("/");
    }
    fetchSignupdata();
    fetchData(); // This will now run on page change
    fetchCurMonReceivedAmount();
    fetchTotalPaymentsReceived();
    fetchOverdueInvoices();
    fetchTotalExpense();
    fetchFinancialYearData();
  }, [currentPage, filterStatus]); // Added currentPage and filterStatus as dependencies

  const roundOff = (value) => {
    return Math.round(value * 100) / 100;
  };

  const handleAddinvoiceClick = () => {
    navigate('/userpanel/Createinvoice');
  };

  const handleAddestimateClick = () => {
    navigate('/userpanel/Createestimate');
  };

  const fetchSignupdata = async () => {
    try {
      const authToken = localStorage.getItem('authToken');
      const userid = localStorage.getItem("userid");
      const response = await fetch(`https://grithomes.onrender.com/api/getsignupdata/${userid}`, {
        headers: { 'Authorization': authToken }
      });
      if (response.status === 401) {
        const json = await response.json();
        setAlertMessage(json.message);
        setLoading(false);
        window.scrollTo(0, 0);
        return;
      }
      const json = await response.json();
      setSignupdata(json);
    } catch (error) {
      console.error('Error fetching signup data:', error);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const userid = localStorage.getItem("userid");
      const authToken = localStorage.getItem('authToken');
      const response = await fetch(
        `https://grithomes.onrender.com/api/invoicedata/${userid}?page=${currentPage}&limit=${limit}&status=${filterStatus}`,
        { headers: { 'Authorization': authToken } }
      );

      if (response.status === 401) {
        const json = await response.json();
        setAlertMessage(json.message);
        setLoading(false);
        window.scrollTo(0, 0);
        return;
      }

      const json = await response.json();
      setInvoices(json.invoices);
      setTotalPages(json.totalPages);

      const transactionPromises = json.invoices.map(async (invoice) => {
        const response = await fetch(`https://grithomes.onrender.com/api/gettransactiondata/${invoice._id}`, {
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
    } catch (error) {
      console.error('Error fetching invoice data:', error);
      setLoading(false);
    }
  };

  const fetchCurMonReceivedAmount = async () => {
    try {
      const userid = localStorage.getItem("userid");
      const authToken = localStorage.getItem('authToken');
      const response = await fetch(`https://grithomes.onrender.com/api/currentMonthReceivedAmount/${userid}`, {
        headers: { 'Authorization': authToken }
      });
      if (response.status === 401) {
        const json = await response.json();
        setAlertMessage(json.message);
        setLoading(false);
        window.scrollTo(0, 0);
        return;
      }
      const json = await response.json();
      setCurMonTotalAmount(json.curMonTotalAmount);
      setCurMonPaidAmount(json.curMonPaidAmount);
      setCurMonUnpaidAmount(json.curMonUnpaidAmount);
    } catch (error) {
      console.error('Error fetching current month data:', error);
    }
  };

  const fetchTotalPaymentsReceived = async () => {
    try {
      const authToken = localStorage.getItem('authToken');
      const userId = localStorage.getItem('userid');
      const response = await fetch(`https://grithomes.onrender.com/api/totalPaymentReceived/${userId}`, {
        headers: { Authorization: authToken }
      });
      if (response.status === 401) {
        const json = await response.json();
        console.error(json.message);
        return;
      }
      const json = await response.json();
      setTotalPaymentsReceived(json.totalPaymentReceived);
      setTotalInvoiceAmount(json.totalInvoiceAmount);
      setTotalUnpaidAmount(json.totalUnpaidAmount);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching total payments:', error);
    }
  };

  const fetchTotalExpense = async () => {
    try {
      const authToken = localStorage.getItem('authToken');
      const response = await fetch(`https://grithomes.onrender.com/api/expense`, {
        headers: { Authorization: authToken }
      });
      if (response.status === 401) {
        const json = await response.json();
        console.error(json.message);
        return;
      }
      const json = await response.json();
      const total = json
        .filter(entry => entry.transactionType === "Expense")
        .reduce((sum, entry) => sum + entry.amount, 0);
      setTotalExpense(total);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching total expense:', error);
    }
  };

  const fetchOverdueInvoices = async () => {
    try {
      const authToken = localStorage.getItem('authToken');
      const userid = localStorage.getItem('userid');
      const response = await fetch(`https://grithomes.onrender.com/api/overdueInvoices/${userid}`, {
        headers: { 'Authorization': authToken }
      });
      if (response.status === 401) {
        const json = await response.json();
        setAlertMessage(json.message);
        setLoading(false);
        window.scrollTo(0, 0);
        return;
      }
      const json = await response.json();
      setOverdueCount(json.overdueCount);
    } catch (error) {
      console.error('Error fetching overdue invoices:', error);
    }
  };

  const fetchFinancialYearData = async () => {
    try {
      const userid = localStorage.getItem("userid");
      const authToken = localStorage.getItem('authToken');
      const response = await fetch(`https://grithomes.onrender.com/api/all-invoices-by-financial-year?userid=${userid}`, {
        headers: { 'Authorization': authToken }
      });
      if (response.status === 401) {
        const json = await response.json();
        setAlertMessage(json.message);
        setLoading(false);
        return;
      }
      const json = await response.json();
      if (json.success) {
        setFinancialYearData(json.data);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching financial year data:', error);
      setLoading(false);
    }
  };

  const getCurrentFinancialYearData = () => {
  const currentYear = new Date().getFullYear();
const currentFY = `${currentYear}`;
   return financialYearData.find(fy => fy.financialYear === currentFY) || {
  totalAmount: 0,
  totalDue: 0,
  totalTax: 0,
  invoiceCount: 0
};
  };

  const handleOverdue = () => {
    navigate('/userpanel/Overdue');
  };

  const getStatus = (invoice) => {
    // If the invoice status is explicitly "Send," use it directly
    if (invoice.status === 'Send') {
      return <span className="badge bg-primary"><i className="fa-solid fa-circle me-1"></i>Send</span>;
    }

    // Otherwise, calculate status based on transactions
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


  const formatCustomDate = (dateString) => {
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', options);
  };

  const handleViewClick = (invoice) => {
    let invoiceid = invoice._id;
    navigate('/userpanel/Invoicedetail', { state: { invoiceid } });
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const currentFYData = getCurrentFinancialYearData();

  return (
    <div>
      {loading ? (
        <div className='row'>
          <ColorRing
            loading={loading}
            display="flex"
            justify-content="center"
            align-items="center"
            aria-label="Loading Spinner"
            data-testid="loader"
          />
        </div>
      ) : (
        <div className=''>
          <div className=''>
            <div className='txt px-4 py-4'>
              <h2 className='fs-35 fw-bold'>Dashboard</h2>
              {signupdata.FirstName && <p>Hi, {signupdata.FirstName} ! 👋</p>}
            </div>
            <div className='row'>
              <div className='col-12 col-sm-12 col-md-8 col-lg-8'>
                <div className='box1 rounded adminborder p-4 m-2'>
                  <p className='fs-6 fw-bold'>CREATE DOCUMENT</p>
                  <div className="row">
                    <div className="col-6">
                      <div className='px-4 py-4 dashbox pointer' onClick={handleAddinvoiceClick}>
                        <i className="fa-solid fa-receipt text-primary pe-3 fs-4"></i><span className='fs-6 fw-bold'>Create Invoice</span>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className='px-4 py-4 dashbox pointer' onClick={handleAddestimateClick}>
                        <i className="fa-solid fa-receipt text-primary pe-3 fs-4"></i><span className='fs-6 fw-bold'>Create Estimate</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className='col-12 col-sm-4 col-md-4 col-lg-4'>
                <div className='box1 fw-bold rounded adminborder py-4 px-3 m-2'>
                </div>
              </div>
            </div>

            <div className="row">
              <div className='col-12 col-sm-4 col-md-4 col-lg-4'>
                <div className='box1 rounded adminborder py-4 px-4 m-2'>
                  <p className='fs-6 fw-bold'>CURRENT FINANCIAL YEAR ({currentFYData.financialYear || 'Loading...'})</p>

                  <p className='fs-3 fw-bold'><CurrencySign />{roundOff(currentFYData.totalAmount).toLocaleString('en-CA')}</p>
                  <div className='d-flex'>
                    <div className='pe-2'>
                      <p className='fs-6 m-0'>TOTAL EXPENSE</p>
                      <p className='fs-6 fw-bold'><CurrencySign />{roundOff(totalExpense).toLocaleString('en-CA')}</p>
                    </div>
                    <div className='ps-2'>
                      <p className='fs-6 m-0'>TOTAL PROFIT</p>
                      <p className='fs-6 fw-bold'><CurrencySign />{roundOff(currentFYData.totalAmount - totalExpense).toLocaleString('en-CA')}</p>
                    </div>
                  </div>
                  <div className='d-flex'>
                    <p className='pe-3'><span className='text-primary'>Paid</span> <CurrencySign />{roundOff(currentFYData.totalAmount - currentFYData.totalDue).toLocaleString('en-CA')}</p>
                    <p><span className='text-warning'>Unpaid</span> <CurrencySign />{roundOff(currentFYData.totalDue).toLocaleString('en-CA')}</p>
                  </div>
                  <div className='d-flex'>
                    <p className='pe-3'><span className='text-danger'>Overdue </span>{overdueCount} <span className='pointer' onClick={handleOverdue}>Invoices</span></p>
                  </div>
                </div>
              </div>
              <div className='col-12 col-sm-4 col-md-4 col-lg-4'>
                <div className='box1 rounded adminborder py-4 px-4 m-2'>
                  <p className='fs-6 fw-bold'>{currentMonth.toUpperCase()} INVOICE AMOUNT</p>
                  <p className='fs-3 fw-bold'><CurrencySign /> {roundOff(curMonTotalAmount).toLocaleString('en-CA')}</p>
                  <div className='d-flex'>
                    <p className='pe-3'><span className='text-primary'>Paid</span> <CurrencySign />{roundOff(curMonPaidAmount).toLocaleString('en-CA')}</p>
                    <p><span className='text-warning'>Unpaid</span> <CurrencySign />{roundOff(curMonUnpaidAmount).toLocaleString('en-CA')}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white my-5 p-3 box mx-2 mx-md-4">
              {alertMessage && <Alertauthtoken message={alertMessage} onClose={() => setAlertMessage('')} />}
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
              </div>

              {/* Desktop Table */}
              <div className="d-none d-md-block table-responsive">
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
                        <td><CurrencySign />{roundOff(invoice.total).toLocaleString('en-CA')}</td>
                      </tr>
                    ))):(
                       <tr>
    <td colSpan="5" className="text-center">No invoices found</td>
  </tr>
                    )}
                  </tbody>
                </table>
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
                          <p className="fw-bold mb-0"><CurrencySign />{roundOff(invoice.total)}</p>
                          {getStatus(invoice)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))):
                (
                  <p className="text-center">No invoices found</p>
                )}
              </div>

              {/* Pagination */}
              <div className="d-flex justify-content-between mt-3 flex-wrap">
                <button className="btn btn-outline-primary" onClick={handlePrevPage} disabled={currentPage === 0}>
                  Previous
                </button>
                <span className="align-self-center">Page {currentPage + 1} of {totalPages}</span>
                <button className="btn btn-outline-primary" onClick={handleNextPage} disabled={currentPage >= totalPages - 1}>
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}