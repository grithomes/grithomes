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
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/getsignupdata/${userid}`, {
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
        `${import.meta.env.VITE_API_BASE_URL}/invoicedata/${userid}?page=${currentPage}&limit=${limit}&status=${filterStatus}`,
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
    } catch (error) {
      console.error('Error fetching invoice data:', error);
      setLoading(false);
    }
  };

  const fetchCurMonReceivedAmount = async () => {
    try {
      const userid = localStorage.getItem("userid");
      const authToken = localStorage.getItem('authToken');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/currentMonthReceivedAmount/${userid}`, {
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
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/totalPaymentReceived/${userId}`, {
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
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/expense`, {
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
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/overdueInvoices/${userid}`, {
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
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/all-invoices-by-financial-year?userid=${userid}`, {
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
      return <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded border border-blue-200"><i className="fa-solid fa-circle me-1"></i>Send</span>;
    }

    // Otherwise, calculate status based on transactions
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
        <div className="flex flex-col md:flex-row">
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
        <div className='w-full px-6 py-6 max-w-7xl mx-auto'>
          <div className='flex flex-col md:flex-row justify-between md:items-center mb-6 pb-2 border-b border-borderLight'>
            <div>
              <h2 className='font-semibold mb-1 text-3xl text-textMain'>Overview</h2>
              {signupdata.FirstName && <p className="text-textMuted font-medium">Welcome back, {signupdata.FirstName}! 👋</p>}
            </div>
            <div className="flex gap-3 mt-4 md:mt-0">
               <button className="btn-primary flex items-center gap-2" onClick={handleAddinvoiceClick}>
                 <i className="fa-solid fa-plus"></i> New Invoice
               </button>
               <button className="btn-secondary flex items-center gap-2" onClick={handleAddestimateClick}>
                 <i className="fa-solid fa-file-invoice"></i> New Estimate
               </button>
            </div>
          </div>
          
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8'>
            {/* Financial Year Card */}
            <div className='card-standard h-full p-6 flex flex-col'>
              <p className='text-sm font-semibold mb-4 text-primary uppercase tracking-wide'>
                FINANCIAL YEAR ({currentFYData.financialYear || 'Loading...'})
              </p>
              <h3 className='font-bold mb-6 text-4xl text-textMain'>
                <CurrencySign />{roundOff(currentFYData.totalAmount).toLocaleString('en-CA')}
              </h3>
              
              <div className='flex justify-between mt-auto mb-5 pb-4 border-b border-borderLight'>
                <div>
                  <p className='text-textMuted text-xs mb-1 font-semibold'>TOTAL EXPENSE</p>
                  <p className='font-semibold mb-0 text-red-500'><CurrencySign />{roundOff(totalExpense).toLocaleString('en-CA')}</p>
                </div>
                <div className="text-right">
                  <p className='text-textMuted text-xs mb-1 font-semibold'>TOTAL PROFIT</p>
                  <p className='font-semibold mb-0 text-green-500'><CurrencySign />{roundOff(currentFYData.totalAmount - totalExpense).toLocaleString('en-CA')}</p>
                </div>
              </div>

              <div className='flex justify-between pt-1'>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  <span className="text-textMuted text-sm">Paid <strong className="text-textMain"><CurrencySign />{roundOff(currentFYData.totalAmount - currentFYData.totalDue).toLocaleString('en-CA')}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                  <span className="text-textMuted text-sm">Unpaid <strong className="text-textMain"><CurrencySign />{roundOff(currentFYData.totalDue).toLocaleString('en-CA')}</strong></span>
                </div>
              </div>
            </div>

            {/* Current Month Card */}
            <div className='card-standard h-full p-6 flex flex-col'>
              <p className='text-sm font-semibold mb-4 text-primary uppercase tracking-wide'>
                {currentMonth} INVOICE AMOUNT
              </p>
              <h3 className='font-bold mb-6 text-4xl text-textMain'>
                <CurrencySign /> {roundOff(curMonTotalAmount).toLocaleString('en-CA')}
              </h3>
              
              <div className='flex justify-between mt-auto pt-4 border-t border-borderLight'>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  <span className="text-textMuted text-sm">Paid <strong className="text-textMain"><CurrencySign />{roundOff(curMonPaidAmount).toLocaleString('en-CA')}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                  <span className="text-textMuted text-sm">Unpaid <strong className="text-textMain"><CurrencySign />{roundOff(curMonUnpaidAmount).toLocaleString('en-CA')}</strong></span>
                </div>
              </div>
            </div>

            {/* Action Items Card */}
            <div className='card-standard h-full p-6 flex flex-col justify-center text-white bg-gradient-to-br from-sidebar to-primary border-none'>
               <div className="text-center">
                  <i className="fa-solid fa-bell mb-4 text-4xl text-blue-200"></i>
                  <h4 className="font-bold text-xl mb-2">{overdueCount} Overdue Invoices</h4>
                  <p className="text-blue-100 text-sm">Requires immediate action.</p>
                  <button className="bg-white text-primary font-semibold px-6 py-2 rounded-full mt-6 hover:bg-gray-50 transition-colors shadow-sm" onClick={handleOverdue}>
                    Manage Overdue
                  </button>
               </div>
            </div>
          </div>

          <div className="my-5 p-6 card-standard border-0 mx-2 mx-md-0">
              {alertMessage && <Alertauthtoken message={alertMessage} onClose={() => setAlertMessage('')} />}
              <hr />
              <div className="flex flex-wrap -mx-2 mb-6 g-2">
                <div className="col-6 col-md-3">
                  <select className="input-standard" onChange={(e) => setFilterStatus(e.target.value)} value={filterStatus}>
                    <option value="All">All</option>
                    <option value="Paid">Paid</option>
                    <option value="Partially Paid">Partially Paid</option>
                    <option value="Saved">Saved</option>
                    <option value="Send">Send</option>
                  </select>
                </div>
              </div>

              {/* Desktop Table */}
              <div className="hidden md:block table-responsive">
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
                          <p className="font-semibold mb-0">{invoice.customername}</p>
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
                  <div key={index} className="card-standard mb-6 shadow-sm">
                    <div className="card-body">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold mb-1">{invoice.customername}</p>
                          <p className="text-sm mb-1">{invoice.InvoiceNumber}</p>
                          <p className="text-sm mb-1">Job: {invoice.job}</p>
                        </div>
                        <button className="btn btn-link p-0" onClick={() => handleViewClick(invoice)}>
                          <i className="fa-solid fa-eye"></i>
                        </button>
                      </div>
                      <div className="flex justify-between mt-2">
                        <div>
                          <p className="text-sm mb-0">Issued: {formatCustomDate(invoice.date)}</p>
                          <p className="text-sm mb-0">Due: {formatCustomDate(invoice.duedate)}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold mb-0"><CurrencySign />{roundOff(invoice.total)}</p>
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
              <div className="flex justify-between mt-6 flex-wrap">
                <button className="btn-secondary" onClick={handlePrevPage} disabled={currentPage === 0}>
                  Previous
                </button>
                <span className="align-self-center">Page {currentPage + 1} of {totalPages}</span>
                <button className="btn-secondary" onClick={handleNextPage} disabled={currentPage >= totalPages - 1}>
                  Next
                </button>
              </div>
            </div>
          </div>
      )}
    </div>
  );
}