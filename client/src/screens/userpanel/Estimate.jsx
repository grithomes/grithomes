import React, { useState, useEffect } from 'react';
import Usernavbar from './Usernavbar';
import { useNavigate, useLocation } from 'react-router-dom';
import Usernav from './Usernav';
import { ColorRing } from 'react-loader-spinner';
import CurrencySign from '../../components/CurrencySign ';
import Alertauthtoken from '../../components/Alertauthtoken';


export default function Estimate() {
  const [loading, setLoading] = useState(true);
  const [estimates, setEstimates] = useState([]);
  const [selectedEstimates, setSelectedEstimates] = useState(null);
  const location = useLocation();
  const estimateid = location.state?.estimateid;
  const navigate = useNavigate();
  const [convertedEstimates, setConvertedEstimates] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [alertMessage, setAlertMessage] = useState('');
  const entriesPerPage = 10;
  const [searchQuery, setSearchQuery] = useState('');

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
      const response = await fetch(`https://grithomes.onrender.com/api/estimatedata/${userid}`, {
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
      if (Array.isArray(json)) setEstimates(json);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleViewClick = (estimate) => {
    const estimateid = estimate._id;
    navigate('/userpanel/estimatedetail', { state: { estimateid } });
  };

  const formatCustomDate = (dateString) => {
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const handleAddClick = () => navigate('/userpanel/Createestimate');

  const handleConvertToInvoice = async (estimateid) => {
    try {
      const authToken = localStorage.getItem('authToken');
      const response = await fetch(`https://grithomes.onrender.com/api/converttoinvoice/${estimateid}`, {
        method: 'POST',
        headers: { 'Authorization': authToken }
      });
      if (response.status === 401) {
        const data = await response.json();
        setAlertMessage(data.message);
        setLoading(false);
        window.scrollTo(0, 0);
        return;
      }
      if (response.ok) {
        const data = await response.json();
        console.log('Converted to Invoice:', data);
        fetchData();
        setConvertedEstimates([...convertedEstimates, estimateid]);
      } else {
        const errorMessage = await response.json();
        console.error('Error converting to invoice:', errorMessage.message);
      }
    } catch (error) {
      console.error('Error converting to invoice:', error);
    }
  };

  const getFilteredEstimates = () => {
    if (!searchQuery) return estimates;
    return estimates.filter(estimate => {
      const customerName = (estimate.customername || "").toLowerCase();
      const jobName = (estimate.job || "").toLowerCase();
      return customerName.includes(searchQuery.toLowerCase()) || jobName.includes(searchQuery.toLowerCase());
    });
  };

  const getPageCount = () => Math.ceil(getFilteredEstimates().length / entriesPerPage);

  const getCurrentPageEstimates = () => {
    const filteredEstimates = getFilteredEstimates();
    const startIndex = currentPage * entriesPerPage;
    const endIndex = startIndex + entriesPerPage;
    return filteredEstimates.slice(startIndex, endIndex);
  };

  const handlePrevPage = () => currentPage > 0 && setCurrentPage(currentPage - 1);
  const handleNextPage = () => (currentPage + 1) * entriesPerPage < getFilteredEstimates().length && setCurrentPage(currentPage + 1);

  return (
    <div className="bg">
      {loading ? (
        <div className="d-flex justify-content-center align-items-center vh-100">
          <ColorRing loading={loading} aria-label="Loading Spinner" data-testid="loader" />
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
              <div className="estimate-container mx-3 mx-md-4 mt-4">
                {alertMessage && (
                  <div className="mb-4">
                    <Alertauthtoken message={alertMessage} onClose={() => setAlertMessage('')} />
                  </div>
                )}
                <div className="card shadow-sm p-4">
                  <div className="row align-items-center mb-3">
                    <div className="col-lg-6 col-md-6 col-12">
                      <h2 className="fs-3 fw-bold text-primary mb-0">Estimates</h2>
                    </div>
                    <div className="col-lg-6 col-md-6 col-12 text-md-end mt-3 mt-md-0">
                      <button className="btn btn-primary fw-bold" onClick={handleAddClick}>
                        <i className="fas fa-plus me-2"></i> Add New
                      </button>
                    </div>
                  </div>
                  <hr />
                  <div className="row mb-4">
                    <div className="col-lg-4 col-md-6 col-12">
                      <div className="input-group">
                        <span className="input-group-text"><i className="fas fa-search"></i></span>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search by name or job"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead className="table-light">
                        <tr>
                          <th>Estimate</th>
                          <th>Status</th>
                          <th>Date</th>
                          <th className="text-center">View</th>
                          <th className="text-center">Convert</th>
                          <th className="text-end">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {getCurrentPageEstimates().map((estimate) => (
                          !estimate.convertedToInvoice && (
                            <tr key={estimate._id}>
                              <td>
                                <p className="mb-1 fw-bold text-dark">{estimate.customername}</p>
                                <p className="mb-1 text-muted">{estimate.EstimateNumber}</p>
                                {estimate.job && <p className="mb-0 text-muted">Job: {estimate.job}</p>}
                              </td>
                              <td>
                                {estimate.status === 'Saved' ? (
                                  <span className="badge bg-secondary">
                                    <i className="fas fa-circle me-1"></i> Saved
                                  </span>
                                ) : estimate.status === 'Send' ? (
                                  <span className="badge bg-primary">
                                    <i className="fas fa-circle me-1"></i> Sent
                                  </span>
                                ) : estimate.status === 'Paid' ? (
                                  <span className="badge bg-success">
                                    <i className="fas fa-circle me-1"></i> Paid
                                  </span>
                                ) : estimate.status === 'Partially Paid' ? (
                                  <span className="badge bg-warning text-dark">
                                    <i className="fas fa-circle me-1"></i> Partially Paid
                                  </span>
                                ) : (
                                  <span className="badge bg-dark">
                                    <i className="fas fa-circle me-1"></i> Unknown
                                  </span>
                                )}
                              </td>
                              <td>
                                <span className="badge bg-light text-dark me-1">Issued</span>
                                {formatCustomDate(estimate.date)}
                              </td>
                              <td className="text-center">
                                <button className="btn btn-link text-primary p-0" onClick={() => handleViewClick(estimate)}>
                                  <i className="fas fa-eye"></i>
                                </button>
                              </td>
                              <td className="text-center">
                                <button className="btn btn-outline-success btn-sm" onClick={() => handleConvertToInvoice(estimate._id)}>
                                  Convert
                                </button>
                              </td>
                              <td className="text-end">
                                <CurrencySign />{roundOff(estimate.total)}
                              </td>
                            </tr>
                          )
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="row mt-4">
                    <div className="col-12 d-flex justify-content-between align-items-center">
                      <button
                        className="btn btn-outline-primary"
                        onClick={handlePrevPage}
                        disabled={currentPage === 0}
                      >
                        <i className="fas fa-chevron-left me-2"></i> Previous
                      </button>
                      <span>Page {currentPage + 1} of {getPageCount()}</span>
                      <button
                        className="btn btn-outline-primary"
                        onClick={handleNextPage}
                        disabled={(currentPage + 1) * entriesPerPage >= getFilteredEstimates().length}
                      >
                        Next <i className="fas fa-chevron-right ms-2"></i>
                      </button>
                    </div>
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