import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ColorRing } from 'react-loader-spinner';
import Usernavbar from './Usernavbar';
import Usernav from './Usernav';
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
        `https://grithomes.onrender.com/api/customerwisedata/${emailToFetch}`,
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
        <div className='row'>
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
        <div className='container-fluid'>
          <div className='row'>
            <div className='col-lg-2 col-md-3 vh-100 b-shadow bg-white d-lg-block d-md-block d-none'>
              <Usernavbar />
            </div>

            <div className='col-lg-10 col-md-9 col-12 mx-auto'>
              <div className='d-lg-none d-md-none d-block mt-2'>
                <Usernav />
              </div>

              <div className='bg-white my-5 p-4 box mx-4'>
                {alertMessage && (
                  <Alertauthtoken message={alertMessage} onClose={() => setAlertMessage('')} />
                )}

                <div className='row py-2'>
                  <div className='col-lg-8 col-md-6 col-sm-6 col-7 me-auto'>
                    <p className='h5 fw-bold'>Customer Invoices</p>
                    {customerEmail && (
                      <p className='text-muted small'>
                        Primary Email: <b>{customerEmail}</b>
                      </p>
                    )}
                    {customerEmails?.length > 1 && (
                      <ul className='small text-muted mb-0'>
                        {customerEmails.map((email, idx) => (
                          <li key={idx}>{email}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
                <hr />

                <div className='row mb-3'>
                  <div className='col-4'>
                    <p className='fw-bold'>
                      Total: <CurrencySign />
                      {roundOff(totalReceived)}
                    </p>
                  </div>
                  <div className='col-4'>
                    <p className='fw-bold'>
                      Total Paid: <CurrencySign />
                      {roundOff(totalPaid)}
                    </p>
                  </div>
                  <div className='col-4'>
                    <p className='fw-bold'>
                      Total Unpaid: <CurrencySign />
                      {roundOff(totalUnpaid)}
                    </p>
                  </div>
                </div>

                <div className='row mb-3'>
                  <div className='col-3'>
                    <select
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className='form-select'
                    >
                      <option value='All'>All</option>
                      <option value='Paid'>Paid</option>
                      <option value='Partially Paid'>Partially Paid</option>
                      <option value='Saved'>Saved</option>
                      <option value='Send'>Send</option>
                    </select>
                  </div>
                  <div className='col-3'>
                    <input
                      type='text'
                      className='form-control mb-2'
                      placeholder='Search by name or job'
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                <div className='row px-2 table-responsive'>
                  <table className='table table-bordered'>
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
                      {getCurrentPageInvoices().map((invoice, index) => (
                        <tr key={index}>
                          <td>
                            <p className='my-0 fw-bold clrtrxtstatus'>{invoice.customername}</p>
                            <p className='my-0'>{invoice.InvoiceNumber}</p>
                            <p className='my-0'>Job: {invoice.job}</p>
                          </td>
                          <td>
                            <span className='p-2 rounded-pill fw-bold'>
                              {invoice.status || 'Unknown'}
                            </span>
                          </td>
                          <td>
                            <div>
                              <div className='d-flex'>
                                <p className='issue px-1 my-1'>Issued</p>
                                <p className='datetext my-1'>
                                  {formatCustomDate(invoice.date)}
                                </p>
                              </div>
                              <div className='d-flex'>
                                <p className='due px-1'>Due</p>
                                <p className='datetext'>
                                  {formatCustomDate(invoice.duedate)}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className='text-center'>
                            <a
                              role='button'
                              className='text-black text-center'
                              onClick={() => handleViewClick(invoice)}
                            >
                              <i className='fa-solid fa-eye'></i>
                            </a>
                          </td>
                          <td>
                            <CurrencySign />
                            {roundOff(invoice.total)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className='row mt-3'>
                  <div className='col-12'>
                    <button onClick={handlePrevPage} className='me-2' disabled={currentPage === 0}>
                      Previous Page
                    </button>
                    <button
                      onClick={handleNextPage}
                      disabled={(currentPage + 1) * entriesPerPage >= getFilteredInvoices().length}
                    >
                      Next Page
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Customerwiseinvoice;
