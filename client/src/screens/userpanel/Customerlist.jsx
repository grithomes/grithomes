import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import { useNavigate } from 'react-router-dom';
// import Nav from './Nav';
import { format } from 'date-fns';

import Alertauthtoken from '../../components/Alertauthtoken';
import { ColorRing } from 'react-loader-spinner'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Customerlist() {
  const [loading, setloading] = useState(true);
  const [customers, setcustomers] = useState([]);
  const [selectedcustomers, setselectedcustomers] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(0);
  const [entriesPerPage, setEntriesPerPage] = useState(10); // Now dynamic

  useEffect(() => {
    if (!localStorage.getItem("authToken") || localStorage.getItem("isTeamMember") == "true") {
      navigate("/");
    }
    fetchdata();
  }, [])
  const handleFirstPage = () => {
    setCurrentPage(0);
  };

  const handleLastPage = () => {
    setCurrentPage(getPageCount() - 1);
  };

  const handleEntriesChange = (e) => {
    setEntriesPerPage(parseInt(e.target.value));
    setCurrentPage(0); // Reset to first page
  };

  const handleAddClick = () => {
    navigate('/userpanel/Addcustomer');
  }

  // const formatDate = (dateString) => {
  //     const date = new Date(dateString);
  //     return format(date, 'dd/MM/yyyy');
  // };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);

  };

  const fetchdata = async () => {
    try {
      const userid = localStorage.getItem("userid");
      const authToken = localStorage.getItem('authToken');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/customers/${userid}`, {
        headers: {
          'Authorization': authToken,
        }
      });

      if (response.status === 401) {
        const json = await response.json();
        setAlertMessage(json.message);
        setloading(false);
        window.scrollTo(0, 0);
        return; // Stop further execution
      }
      else {
        const json = await response.json();

        if (Array.isArray(json)) {
          setcustomers(json);
        }
        setloading(false);
      }

    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }
  const handleEditClick = (customer) => {
    setselectedcustomers(customer);
    let customerId = customer._id;
    navigate('/userpanel/Editcustomer', { state: { customerId } });
  };

  const handleDeleteClick = async (customerId) => {
    try {
      const authToken = localStorage.getItem('authToken');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/delcustomers/${customerId}`, {
        method: 'GET',
        headers: {
          'Authorization': authToken,
        }
      });

      const json = await response.json();

      if (response.status === 401) {
        setAlertMessage(json.message);
        setloading(false);
        window.scrollTo(0, 0);
        return;
      }

      if (json.Success) {
        toast.success('Customer deleted successfully');
        fetchdata(); // refresh list
      } else {
        toast.error(json.message || 'Failed to delete customer');
      }

    } catch (error) {
      toast.error('Something went wrong while deleting.');
      console.error('Error deleting customer:', error);
    }
  };


  // Filtering function
  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.emails?.some(email => email.toLowerCase().includes(searchQuery.toLowerCase()))
  );


  const renderPageNumbers = () => {
    const pageCount = getPageCount();
    const pages = [];

    for (let i = 0; i < pageCount; i++) {
      pages.push(
        <button
          key={i}
          className={`btn btn-sm me-1 ${i === currentPage ? 'btn-primary text-white' : 'btn-outline-primary'}`}
          onClick={() => setCurrentPage(i)}
        >
          {i + 1}
        </button>
      );
    }

    return pages;
  };

  // Pagination functions
  const getPageCount = () => Math.ceil(filteredCustomers.length / entriesPerPage);

  const getCurrentPageCustomers = () => {
    const startIndex = currentPage * entriesPerPage;
    const endIndex = startIndex + entriesPerPage;
    return filteredCustomers.slice(startIndex, endIndex);
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if ((currentPage + 1) * entriesPerPage < customers.length) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleViewClick = (customer) => {
    console.log(customer, "customers ....");

    const customerid = customer._id;
    const customerEmails = customer.emails || [];
    const primaryEmail = customerEmails[0] || null;

    navigate('/userpanel/Customerwiseinvoice', {
      state: { customerid, customerEmails, customerEmail: primaryEmail },
    });
  };

  return (
    <div className='bg'>
      {
        loading ?
          <div className="flex flex-col md:flex-row">
            <ColorRing
              // width={200}
              loading={loading}
              // size={500}
              display="flex"
              justify-content="center"
              align-items="center"
              aria-label="Loading Spinner"
              data-testid="loader"
            />
          </div> :
          <div className='w-full '>
            <div className="flex flex-col md:flex-row">
                            <Sidebar />
                            <div className="flex-1 w-full mx-auto px-4">

                <div className='mt-6 mx-4'>
                  {alertMessage && <Alertauthtoken message={alertMessage} onClose={() => setAlertMessage('')} />}
                </div>

                <div className='flex flex-wrap items-center justify-between py-6 px-4 mb-6 bg-white shadow-sm rounded-xl border border-gray-100'>
                  <div>
                    <h1 className='text-3xl font-bold text-gray-800'>Customers</h1>
                    <nav aria-label="breadcrumb">
                      <ol className="flex text-sm text-gray-500 mt-2 space-x-2">
                        <li><a href="/userpanel/Userdashboard" className='hover:text-primary transition-colors text-decoration-none'>Dashboard</a></li>
                        <li><span className="mx-2">/</span></li>
                        <li className="text-gray-800 font-semibold" aria-current="page">Customers</li>
                      </ol>
                    </nav>
                  </div>
                  <div className="mt-4 md:mt-0">
                    <button className='btn-primary flex items-center gap-2' onClick={handleAddClick}>
                      <i className="fa-solid fa-plus"></i> Create Customer
                    </button>
                  </div>
                </div>

                <div className="card-standard p-6">
                  <div className='flex flex-col md:flex-row justify-between items-center mb-6 gap-4'>
                    <div className="w-full md:w-1/3">
                      <div className="relative">
                        <i className="fa-solid fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                        <input
                          type="text"
                          className="input-standard pl-10"
                          placeholder="Search by name or email..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="overflow-x-auto rounded-lg border border-gray-100">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50/80 border-b border-gray-100 text-gray-600 text-sm tracking-wider uppercase">
                          <th className="py-4 px-4 font-semibold w-16">ID</th>
                          <th className="py-4 px-4 font-semibold">Customer</th>
                          <th className="py-4 px-4 font-semibold">Email</th>
                          <th className="py-4 px-4 font-semibold">Phone Number</th>
                          <th className="py-4 px-4 font-semibold">Date</th>
                          <th className="py-4 px-4 font-semibold text-center">View</th>
                          <th className="py-4 px-4 font-semibold text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50 text-gray-700">
                        {getCurrentPageCustomers().map((customer, index) => (
                          <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                            <td className="py-3 px-4 font-medium text-gray-900">{currentPage * entriesPerPage + index + 1}</td>
                            <td className="py-3 px-4 font-semibold text-gray-800">{customer.name}</td>
                            <td className="py-3 px-4">
                              {customer.emails && customer.emails.length > 0
                                ? customer.emails.map((email, idx) => (
                                  <div key={idx} className="text-sm">{email}</div>
                                ))
                                : <span className="text-gray-400 italic">No email</span>}
                            </td>
                            <td className="py-3 px-4">{customer.number || '-'}</td>
                            <td className="py-3 px-4">{formatDate(customer.createdAt)}</td>
                            <td className='py-3 px-4 text-center'>
                              <button className='p-2 text-gray-500 hover:text-primary transition-colors' onClick={() => handleViewClick(customer)} title="View Detail">
                                <i className='fa-solid fa-eye'></i>
                              </button>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <button className="btn-secondary px-3 py-1.5 text-sm" onClick={() => handleEditClick(customer)}>
                                  <i className="fa-solid fa-pen"></i> Edit
                                </button>
                                <button className="btn-secondary px-3 py-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 text-sm" onClick={() => handleDeleteClick(customer._id)}>
                                  <i className="fas fa-trash"></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {filteredCustomers.length === 0 && (
                          <tr>
                            <td colSpan="7" className="py-8 text-center text-gray-500">
                              No customers found matching your search.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination Controls */}
                  {filteredCustomers.length > 0 && (
                  <div className='flex flex-col md:flex-row items-center justify-between mt-6 gap-4 border-t border-gray-100 pt-6'>
                    <div className='flex items-center text-sm text-gray-600'>
                      <label className='mr-2 font-medium'>Show</label>
                      <select value={entriesPerPage} onChange={handleEntriesChange} className='input-standard py-1 px-3 w-20 text-center mr-2'>
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                      </select>
                      <span>entries per page</span>
                    </div>

                    <div className='flex items-center gap-2'>
                      <button
                        className='px-3 py-1.5 text-sm border border-gray-200 rounded-md text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
                        onClick={handleFirstPage}
                        disabled={currentPage === 0}
                      >
                        « First
                      </button>
                      <button
                        className='px-3 py-1.5 text-sm border border-gray-200 rounded-md text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
                        onClick={handlePrevPage}
                        disabled={currentPage === 0}
                      >
                        ‹ Prev
                      </button>

                      <span className='px-4 py-1.5 text-sm font-medium text-gray-700 bg-gray-50 rounded-md border border-gray-100'>
                        Page {currentPage + 1} of {getPageCount() || 1}
                      </span>

                      <button
                        className='px-3 py-1.5 text-sm border border-gray-200 rounded-md text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
                        onClick={handleNextPage}
                        disabled={(currentPage + 1) >= getPageCount()}
                      >
                        Next ›
                      </button>
                      <button
                        className='px-3 py-1.5 text-sm border border-gray-200 rounded-md text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
                        onClick={handleLastPage}
                        disabled={(currentPage + 1) >= getPageCount()}
                      >
                        Last »
                      </button>
                    </div>
                  </div>
                  )}

                  <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="light" />
                </div>
              </div>
            </div>
          </div>

      }
    </div>
  )
}
