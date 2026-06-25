import React, { useState, useEffect } from 'react';
import { ColorRing } from 'react-loader-spinner';
import Sidebar from '../Sidebar';

import { useNavigate } from 'react-router-dom'; // Use useNavigate instead of useHistory
import CurrencySign from '../../../components/CurrencySign ';

export default function ExpenseEntries() {
    const [expenseEntries, setExpenseEntries] = useState([]);
    const [expenseTypes, setExpenseTypes] = useState([]);
    const [vendors, setVendors] = useState([]);
    const [invoices, setInvoices] = useState([]); // State to hold invoices
    const [formData, setFormData] = useState({
        expenseDate: '',
        expenseType: '',
        transactionType: '',
        vendor: '',
        amount: '',
        description: '',
        paymentStatus: 'Pending',
        receiptUrl: '',
        invoiceId: '', // Adding invoiceId to the form data
    });
    const [loading, setLoading] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertMessageShow, setAlertMessageShow] = useState(false);

    const apiURL = `${import.meta.env.VITE_API_BASE_URL}/expense`;
    const expenseTypeURL = `${import.meta.env.VITE_API_BASE_URL}/expensetype`;
    const vendorURL = `${import.meta.env.VITE_API_BASE_URL}/vendor`;
    const [showModal, setShowModal] = useState(false); // State to manage modal visibility
    const [fileName, setFileName] = useState('');
    const [isUploading, setIsUploading] = useState(false);

    const [filters, setFilters] = useState({
        transactionType: '',
        vendor: '',
        expenseType: '',
        startDate: '',
        endDate: '',
        invoiceId: '',
    });


    const handleOpenModal = () => {
        setShowModal(true);
    };

    const formatCustomDate = (dateString) => {
        const options = { day: 'numeric', month: 'short', year: 'numeric' };
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', options);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setFormData({
            expenseDate: '',
            expenseType: '',
            transactionType: '',
            vendor: '',
            amount: '',
            description: '',
            paymentStatus: 'Pending',
            receiptUrl: '',
            invoiceId: '',
        });
    };
    const navigate = useNavigate();

    // Fetch all data (invoices, expense entries, types, and vendors) on component mount
    useEffect(() => {
        fetchExpenseEntries();
        fetchExpenseTypes();
        fetchVendors();
        fetchData();  // Fetch invoice data
    }, []);

    // Fetch invoice data
    const fetchData = async () => {
        try {
            const userid = localStorage.getItem("userid");
            const authToken = localStorage.getItem('authToken');
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/invoicedata/${userid}?limit=200`, {
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
                if (json && Array.isArray(json.invoices)) {
                    const sortedInvoices = json.invoices.sort((a, b) => new Date(b.date) - new Date(a.date));
                    setInvoices(sortedInvoices);
                } else if (Array.isArray(json)) {
                    const sortedInvoices = json.sort((a, b) => new Date(b.date) - new Date(a.date));
                    setInvoices(sortedInvoices);
                }
                setLoading(false);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const roundOff = (value) => {
        return Math.round(value * 100) / 100;
    };

    // Fetch all expense entries
    const fetchExpenseEntries = async () => {
        setLoading(true);
        try {
            const response = await fetch(apiURL);
            const data = await response.json();
            
            // Sort descending by expenseDate (or createdAt)
            if (Array.isArray(data)) {
                const sortedData = data.sort((a, b) => new Date(b.createdAt || b.expenseDate) - new Date(a.createdAt || a.expenseDate));
                setExpenseEntries(sortedData);
            } else {
                setExpenseEntries(data);
            }
        } catch (error) {
            console.error('Error fetching expense entries:', error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch all expense types
    const fetchExpenseTypes = async () => {
        setLoading(true);
        try {
            const response = await fetch(expenseTypeURL);
            const data = await response.json();
            setExpenseTypes(data);
        } catch (error) {
            console.error('Error fetching expense types:', error);
        } finally {
            setLoading(false);
        }
    };
    // Function to get ExpenseType name by ID
    const getExpenseTypeName = (id) => {
        const expenseType = expenseTypes.find((type) => type._id === id);
        return expenseType ? expenseType.name : 'Unknown Expense Type';
    };

    // Function to get Vendor name by ID
    const getVendorName = (id) => {
        const vendor = vendors.find((vendor) => vendor._id === id);
        return vendor ? vendor.name : 'Unknown Vendor';
    };
    const getInvoiceName = (id) => {
        const invoice = invoices.find((vendor) => vendor._id === id);
        // console.log(invoice ? invoice.job : 'Unknown Job',"invoiceinvoiceinvoiceinvoice");

        return invoice ? invoice.job : 'Unknown Job';
    };

    // Fetch all vendors
    const fetchVendors = async () => {
        setLoading(true);
        try {
            const response = await fetch(vendorURL);
            const data = await response.json();
            console.log(data, "ds");

            setVendors(data);
        } catch (error) {
            console.error('Error fetching vendors:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploading(true);  // Start showing loading
        setFileName(file.name);  // Show the file name in the input field

        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', 'employeeApp');
        formData.append('cloud_name', 'dcldwaiyq');

        try {
            const response = await fetch('https://api.cloudinary.com/v1_1/dcldwaiyq/image/upload', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                const data = await response.json();
                setFormData((prevFormData) => ({
                    ...prevFormData,
                    receiptUrl: data.secure_url, // Save Cloudinary URL in receiptUrl
                }));
                console.log('File uploaded successfully:', data.secure_url);
            } else {
                console.error('Error uploading file to Cloudinary');
            }
        } catch (error) {
            console.error('Error during file upload:', error);
        } finally {
            setIsUploading(false); // Stop loading state
        }
    };

    // Handle form data change
    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Handle form submission (add/update expense)
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Sanitize formData: Replace empty strings with null for optional fields
            const sanitizedFormData = {
                ...formData,
                expenseType: formData.expenseType || null,
                vendor: formData.vendor || null,
                invoiceId: formData.invoiceId || null, // Ensure invoiceId is also handled
            };

            const method = sanitizedFormData._id ? 'PUT' : 'POST';
            const url = sanitizedFormData._id ? `${apiURL}/${sanitizedFormData._id}` : apiURL;

            console.log(sanitizedFormData, "Before");

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(sanitizedFormData),
            });

            console.log(sanitizedFormData, "sanitizedFormData");

            if (response.ok) {
                fetchExpenseEntries();
                setFormData({
                    expenseDate: '',
                    expenseType: '',
                    vendor: '',
                    amount: '',
                    description: '',
                    paymentStatus: 'Pending',
                    transactionType: 'Expense',
                    receiptUrl: '',
                    invoiceId: '', // Reset invoiceId after submit
                });
                console.log(sanitizedFormData, "After");
                setAlertMessage('Expense entry saved successfully!');
                setAlertMessageShow(true);
            } else {
                console.error('Error saving expense entry');
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            setAlertMessage('An error occurred while saving the expense entry.');
            setAlertMessageShow(true);
        } finally {
            setLoading(false);
        }
    };

    // Handle edit
    const handleEdit = (expense) => {
        console.log(expense, "ex---");

        setFormData({
            _id: expense._id,
            expenseDate: expense.expenseDate ? new Date(expense.expenseDate).toISOString().split('T')[0] : '',
            expenseType: expense.expenseType || null,
            transactionType: expense.transactionType,
            vendor: expense.vendor || null,
            amount: expense.amount,
            description: expense.description,
            paymentStatus: expense.paymentStatus,
            receiptUrl: expense.receiptUrl,
            invoiceId: expense.invoiceId, // Set invoiceId if it exists
        });

        setShowModal(true);
    };

    // Handle delete
    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this expense entry?')) {
            try {
                const response = await fetch(`${apiURL}/${id}`, { method: 'DELETE' });
                if (response.ok) {
                    fetchExpenseEntries(); // refresh the list
                    setAlertMessage('Expense entry deleted successfully!');
                    setAlertMessageShow(true);
                } else {
                    console.error('Error deleting expense entry');
                }
            } catch (error) {
                console.error('Error deleting expense entry:', error);
                setAlertMessage('An error occurred while deleting the expense entry.');
                setAlertMessageShow(true);
            }
        }
    };

    const filteredExpenseEntries = expenseEntries.filter((entry) => {
        let isValid = true;

        // Filter by transaction type
        if (filters.transactionType && entry.transactionType !== filters.transactionType) {
            isValid = false;
        }

        // Filter by expense type
        if (filters.expenseType && entry.expenseType !== filters.expenseType) {
            isValid = false;
        }

        // Filter by date range
        if (filters.startDate && new Date(entry.expenseDate) < new Date(filters.startDate)) {
            isValid = false;
        }
        if (filters.endDate && new Date(entry.expenseDate) > new Date(filters.endDate)) {
            isValid = false;
        }

        // Filter by invoice
        if (filters.invoiceId && entry.invoiceId !== filters.invoiceId) {
            isValid = false;
        }

        // Filter by vendor
        if (filters.vendor && entry.vendor !== filters.vendor) {
            isValid = false;
        }
        console.log(entry, filters, "filters");


        return isValid;
    });


    return (
        <div className="bg-gray-50 min-h-screen">
            {
                loading ?
                    <div className="flex justify-center items-center min-h-[400px]">
                        <ColorRing
                            loading={loading}
                            display="flex"
                            justify-content="center"
                            align-items="center"
                            aria-label="Loading Spinner"
                            data-testid="loader"
                        />
                    </div> :
                    <div className="flex flex-col md:flex-row min-h-screen">
                        <Sidebar />
                        <div className="flex-1 w-full mx-auto px-4 md:px-8 py-8">
                            
                            {/* Header Section */}
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-800">Expense Entries</h2>
                                    <p className="text-sm text-gray-500 mt-1">Manage and track your business expenses</p>
                                </div>
                                <button
                                    className="btn-primary whitespace-nowrap"
                                    onClick={handleOpenModal}
                                >
                                    <i className="fa-solid fa-plus mr-2"></i> Add Expense
                                </button>
                            </div>

                            <div className='mb-6'>
                                {alertMessage && alertMessageShow && (
                                    <div className="bg-green-50 border border-green-200 text-green-800 rounded-lg p-4 flex justify-between items-start shadow-sm mb-6">
                                        <div className="font-medium">
                                            {alertMessage}
                                        </div>
                                        <button type="button" className="text-green-600 hover:text-green-800 focus:outline-none transition-colors" onClick={() => setAlertMessageShow(false)}>
                                            <i className="fa-solid fa-xmark text-lg"></i>
                                        </button>
                                    </div>
                                )}
                            </div>

                            {showModal && (
                                <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={handleCloseModal}></div>

                                        {/* This element is to trick the browser into centering the modal contents. */}
                                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                                        <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
                                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 border-b border-gray-100">
                                                <div className="flex justify-between items-center mb-4">
                                                    <h3 className="text-lg leading-6 font-semibold text-gray-900" id="modal-title">
                                                        {formData._id ? 'Update Expense Entry' : 'Add Expense Entry'}
                                                    </h3>
                                                    <button type="button" className="text-gray-400 hover:text-gray-500 focus:outline-none" onClick={handleCloseModal}>
                                                        <i className="fa-solid fa-xmark text-xl"></i>
                                                    </button>
                                                </div>

                                                <form onSubmit={handleSubmit} className="space-y-4">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div>
                                                            <label htmlFor="expenseDate" className="block text-sm font-medium text-gray-700 mb-1">Expense Date <span className="text-red-500">*</span></label>
                                                            <input
                                                                type="date" id="expenseDate" name="expenseDate" className="input-standard" value={formData.expenseDate} onChange={handleInputChange} required
                                                            />
                                                        </div>
                                                        <div>
                                                            <label htmlFor="transactionType" className="block text-sm font-medium text-gray-700 mb-1">Transaction Type <span className="text-red-500">*</span></label>
                                                            <select
                                                                id="transactionType" name="transactionType" className="input-standard" value={formData.transactionType} onChange={handleInputChange} required
                                                            >
                                                                <option value="">Select Type</option>
                                                                <option value="Expense">Expense</option>
                                                                <option value="Credit">Credit</option>
                                                            </select>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div>
                                                            <label htmlFor="expenseType" className="block text-sm font-medium text-gray-700 mb-1">Category / Type</label>
                                                            <select
                                                                id="expenseType" name="expenseType" className="input-standard" value={formData.expenseType} onChange={handleInputChange}
                                                            >
                                                                <option value="">Select Category</option>
                                                                {expenseTypes.map((type) => (
                                                                    <option key={type._id} value={type._id}>
                                                                        {type.name}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                        <div>
                                                            <label htmlFor="vendor" className="block text-sm font-medium text-gray-700 mb-1">Vendor</label>
                                                            <select
                                                                id="vendor" name="vendor" className="input-standard" value={formData.vendor} onChange={handleInputChange}
                                                            >
                                                                <option value="">Select Vendor</option>
                                                                {vendors.map((vendor) => (
                                                                    <option key={vendor._id} value={vendor._id}>
                                                                        {vendor.name}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div>
                                                            <label htmlFor="invoiceId" className="block text-sm font-medium text-gray-700 mb-1">Related Invoice</label>
                                                            <select
                                                                id="invoiceId" name="invoiceId" className="input-standard" value={formData.invoiceId} onChange={handleInputChange}
                                                            >
                                                                <option value="">Select Invoice</option>
                                                                {invoices.map((invoice) => (
                                                                    <option key={invoice._id} value={invoice._id}>
                                                                        {invoice.InvoiceNumber} - {invoice.job}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                        <div>
                                                            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">Amount <span className="text-red-500">*</span></label>
                                                            <div className="relative">
                                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                                    <span className="text-gray-500 sm:text-sm"><CurrencySign /></span>
                                                                </div>
                                                                <input
                                                                    type="number" step="0.01" id="amount" name="amount" className="input-standard pl-8" value={formData.amount} onChange={handleInputChange} required placeholder="0.00"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                                        <textarea
                                                            id="description" name="description" rows="2" className="input-standard resize-none" value={formData.description} onChange={handleInputChange} placeholder="What was this expense for?"
                                                        />
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div>
                                                            <label htmlFor="paymentStatus" className="block text-sm font-medium text-gray-700 mb-1">Payment Status</label>
                                                            <select
                                                                id="paymentStatus" name="paymentStatus" className="input-standard" value={formData.paymentStatus} onChange={handleInputChange}
                                                            >
                                                                <option value="Pending">Pending</option>
                                                                <option value="Paid">Paid</option>
                                                            </select>
                                                        </div>
                                                        <div>
                                                            <label htmlFor="receiptUrl" className="block text-sm font-medium text-gray-700 mb-1">Upload Receipt Image</label>
                                                            <div className="flex items-center">
                                                                <label className="flex-1 cursor-pointer bg-gray-50 hover:bg-gray-100 text-gray-700 py-2 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium flex justify-center transition-colors">
                                                                    <span>Choose File</span>
                                                                    <input
                                                                        type="file"
                                                                        id="receiptUrl"
                                                                        name="receiptUrl"
                                                                        className="hidden"
                                                                        accept="image/*"
                                                                        onChange={handleFileUpload}
                                                                        disabled={isUploading}
                                                                    />
                                                                </label>
                                                            </div>
                                                            {fileName && !isUploading && <p className="mt-1 text-xs text-green-600 truncate"><i className="fa-solid fa-check mr-1"></i>{fileName}</p>}
                                                            {isUploading && <p className="mt-1 text-xs text-blue-600"><i className="fa-solid fa-circle-notch fa-spin mr-1"></i>Uploading...</p>}
                                                            {formData.receiptUrl && !isUploading && (
                                                                <div className="mt-2">
                                                                    <a href={formData.receiptUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">
                                                                        <i className="fa-solid fa-arrow-up-right-from-square mr-1"></i> View Current Receipt
                                                                    </a>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </form>
                                            </div>
                                            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse border-t border-gray-100">
                                                <button 
                                                    type="button" 
                                                    className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white hover:bg-primary/90 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm transition-colors disabled:opacity-50"
                                                    onClick={handleSubmit}
                                                    disabled={loading || isUploading}
                                                >
                                                    {formData._id ? 'Update Entry' : 'Save Entry'}
                                                </button>
                                                <button 
                                                    type="button" 
                                                    className="mt-3 w-full inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-colors"
                                                    onClick={handleCloseModal}
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Filters & List */}
                            <div className="card-standard">
                                <div className="bg-gray-50/50 -m-6 mb-6 p-6 border-b border-gray-100 rounded-t-xl">
                                    <h3 className="text-md font-semibold text-gray-800 mb-4"><i className="fa-solid fa-filter text-gray-400 mr-2"></i>Filter Expenses</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Type</label>
                                            <select
                                                value={filters.transactionType}
                                                onChange={(e) => setFilters({ ...filters, transactionType: e.target.value })}
                                                className="input-standard text-sm"
                                            >
                                                <option value="">All Transactions</option>
                                                <option value="Expense">Expense</option>
                                                <option value="Credit">Credit</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Category</label>
                                            <select
                                                value={filters.expenseType}
                                                onChange={(e) => setFilters({ ...filters, expenseType: e.target.value })}
                                                className="input-standard text-sm"
                                            >
                                                <option value="">All Categories</option>
                                                {expenseTypes.map((type) => (
                                                    <option key={type._id} value={type._id}>{type.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Vendor</label>
                                            <select
                                                value={filters.vendor}
                                                onChange={(e) => setFilters({ ...filters, vendor: e.target.value })}
                                                className="input-standard text-sm"
                                            >
                                                <option value="">All Vendors</option>
                                                {vendors.map((vendor) => (
                                                    <option key={vendor._id} value={vendor._id}>{vendor.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Invoice</label>
                                            <select
                                                value={filters.invoiceId}
                                                onChange={(e) => setFilters({ ...filters, invoiceId: e.target.value })}
                                                className="input-standard text-sm"
                                            >
                                                <option value="">All Invoices</option>
                                                {invoices.map((invoice) => (
                                                    <option key={invoice._id} value={invoice._id}>{invoice.InvoiceNumber} - {invoice.job}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="lg:col-span-2">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Start Date</label>
                                                    <input
                                                        type="date"
                                                        value={filters.startDate}
                                                        onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                                                        className="input-standard text-sm"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">End Date</label>
                                                    <input
                                                        type="date"
                                                        value={filters.endDate}
                                                        onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                                                        className="input-standard text-sm"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {loading ? (
                                    <div className="flex justify-center py-12">
                                        <ColorRing visible={true} height="60" width="60" ariaLabel="loading" wrapperClass="d-flex justify-center" />
                                    </div>
                                ) : filteredExpenseEntries.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="border-b border-gray-200 bg-gray-50">
                                                    <th className="py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                                                    <th className="py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Category</th>
                                                    <th className="py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Details</th>
                                                    <th className="py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider text-right">Amount</th>
                                                    <th className="py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider text-center">Status</th>
                                                    <th className="py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider text-center">Receipt</th>
                                                    <th className="py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {filteredExpenseEntries.map((entry) => (
                                                    <tr key={entry._id} className="hover:bg-gray-50/50 transition-colors">
                                                        <td className="py-4 px-4 text-sm text-gray-900 whitespace-nowrap">
                                                            {formatCustomDate(entry.expenseDate)}
                                                        </td>
                                                        <td className="py-4 px-4 text-sm whitespace-nowrap">
                                                            {entry.transactionType === "Credit" ? (
                                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                                    Credit
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                                    {getExpenseTypeName(entry.expenseType)}
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="py-4 px-4 text-sm">
                                                            <div className="flex flex-col gap-1 max-w-xs">
                                                                {entry.transactionType !== "Credit" && entry.vendor && (
                                                                    <span className="text-gray-900 font-medium truncate" title={getVendorName(entry.vendor)}>{getVendorName(entry.vendor)}</span>
                                                                )}
                                                                {entry.invoiceId && (
                                                                    <span className="text-gray-500 text-xs truncate" title={getInvoiceName(entry.invoiceId)}><i className="fa-solid fa-file-invoice mr-1"></i>{getInvoiceName(entry.invoiceId)}</span>
                                                                )}
                                                                {entry.description && (
                                                                    <span className="text-gray-500 text-xs truncate" title={entry.description}>{entry.description}</span>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className={`py-4 px-4 text-sm font-semibold text-right whitespace-nowrap ${entry.transactionType === "Credit" ? "text-green-600" : entry.transactionType === "Expense" ? "text-red-600" : "text-yellow-600"}`}>
                                                            {entry.transactionType === "Expense" ? "- " : "+ "}
                                                            <CurrencySign /> {roundOff(entry.amount).toFixed(2)}
                                                        </td>
                                                        <td className="py-4 px-4 text-center whitespace-nowrap">
                                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                                entry.paymentStatus === 'Paid' ? 'bg-green-100 text-green-800' : 
                                                                entry.paymentStatus === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                                                            }`}>
                                                                {entry.paymentStatus}
                                                            </span>
                                                        </td>
                                                        <td className="py-4 px-4 text-center whitespace-nowrap">
                                                            {entry.receiptUrl ? (
                                                                <a href={entry.receiptUrl} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary transition-colors" title="View Receipt">
                                                                    <i className="fa-solid fa-file-image text-lg"></i>
                                                                </a>
                                                            ) : (
                                                                <span className="text-gray-300">-</span>
                                                            )}
                                                        </td>
                                                        <td className="py-4 px-4 text-right whitespace-nowrap">
                                                            <div className="flex justify-end gap-2">
                                                                <button
                                                                    className="p-1.5 text-gray-400 hover:text-primary bg-gray-50 hover:bg-primary/10 rounded transition-colors"
                                                                    onClick={() => handleEdit(entry)}
                                                                    title="Edit"
                                                                >
                                                                    <i className="fa-regular fa-pen-to-square"></i>
                                                                </button>
                                                                <button
                                                                    className="p-1.5 text-gray-400 hover:text-red-600 bg-gray-50 hover:bg-red-50 rounded transition-colors"
                                                                    onClick={() => handleDelete(entry._id)}
                                                                    title="Delete"
                                                                >
                                                                    <i className="fa-regular fa-trash-can"></i>
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                            <tfoot>
                                                <tr className="bg-gray-50 border-t-2 border-gray-200">
                                                    <td colSpan="3" className="py-4 px-4 text-sm font-bold text-gray-800 text-right uppercase tracking-wider">Total Expenses:</td>
                                                    <td className="py-4 px-4 text-sm font-bold text-red-600 text-right whitespace-nowrap">
                                                        <CurrencySign />
                                                        {filteredExpenseEntries
                                                            .filter(entry => entry.transactionType === "Expense")
                                                            .reduce((total, entry) => total + parseFloat(entry.amount || 0), 0)
                                                            .toFixed(2)}
                                                    </td>
                                                    <td colSpan="3"></td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="text-center py-16 px-4 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                                        <div className="w-16 h-16 bg-white text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-gray-100">
                                            <i className="fa-solid fa-receipt text-2xl"></i>
                                        </div>
                                        <h3 className="text-lg font-medium text-gray-900 mb-1">No Expense Entries Found</h3>
                                        <p className="text-gray-500 max-w-sm mx-auto mb-6">No expenses match your current filters, or you haven't added any yet.</p>
                                        <button className="btn-primary" onClick={handleOpenModal}>
                                            <i className="fa-solid fa-plus mr-2"></i> Add Your First Expense
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
            }
        </div>
    );
}