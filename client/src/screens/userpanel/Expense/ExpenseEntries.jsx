import React, { useState, useEffect } from 'react';
import { ColorRing } from 'react-loader-spinner';
import Usernavbar from '../Usernavbar';
import Usernav from '../Usernav';
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

    const apiURL = 'https://grithomes.onrender.com/api/expense';
    const expenseTypeURL = 'https://grithomes.onrender.com/api/expensetype';
    const vendorURL = 'https://grithomes.onrender.com/api/vendor';

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
            const response = await fetch(`https://grithomes.onrender.com/api/invoicedata/${userid}`, {
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
                if (Array.isArray(json)) {
                    const sortedInvoices = json.sort((a, b) => new Date(b.date) - new Date(a.date));
                    setInvoices(sortedInvoices);
                }
                setLoading(false);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    // Fetch all expense entries
    const fetchExpenseEntries = async () => {
        setLoading(true);
        try {
            const response = await fetch(apiURL);
            const data = await response.json();
            console.log(data, "sdsds sdsd");

            setExpenseEntries(data);
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

    // Fetch all vendors
    const fetchVendors = async () => {
        setLoading(true);
        try {
            const response = await fetch(vendorURL);
            const data = await response.json();
            setVendors(data);
        } catch (error) {
            console.error('Error fetching vendors:', error);
        } finally {
            setLoading(false);
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
            const method = formData._id ? 'PUT' : 'POST';
            const url = formData._id ? `${apiURL}/${formData._id}` : apiURL;
            console.log(formData, "Before");


            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

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
                console.log(formData, "After");
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
        setFormData({
            _id: expense._id,
            expenseDate: expense.expenseDate,
            expenseType: expense.expenseType._id,
            vendor: expense.vendor._id,
            amount: expense.amount,
            description: expense.description,
            paymentStatus: expense.paymentStatus,
            receiptUrl: expense.receiptUrl,
            invoiceId: expense.invoiceId ? expense.invoiceId._id : '', // Set invoiceId if it exists
        });
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

    return (
        <div className="bg">
            {
                loading ?
                    <div className="row">
                        <ColorRing
                            loading={loading}
                            display="flex"
                            justify-content="center"
                            align-items="center"
                            aria-label="Loading Spinner"
                            data-testid="loader"
                        />
                    </div> :
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-lg-2 col-md-3 b-shadow bg-white d-lg-block d-md-block d-none">
                                <div>
                                    <Usernavbar />
                                </div>
                            </div>

                            <div className="col-lg-10 col-md-9 col-12 mx-auto">
                                <div className="d-lg-none d-md-none d-block mt-2">
                                    <Usernav />
                                </div>
                                <div className='mt-4 mx-4'>
                                    {alertMessage && alertMessageShow && (
                                        <div className="alert alert-success d-flex justify-content-between" role="alert">
                                            <div>{alertMessage}</div>
                                            <button type="button" className="btn-close" onClick={() => setAlertMessageShow(false)}></button>
                                        </div>
                                    )}
                                </div>

                                <div className="container mt-4">
                                    <div className="row">
                                        {/* Left column - Form to add/update expense entries */}
                                        <div className="col-md-7">
                                            <h3>{formData._id ? 'Update Expense Entry' : 'Add Expense Entry'}</h3>
                                            <form onSubmit={handleSubmit}>
                                                <div className="mb-3">
                                                    <label htmlFor="expenseDate" className="form-label">Expense Date</label>
                                                    <input
                                                        type="date"
                                                        id="expenseDate"
                                                        name="expenseDate"
                                                        className="form-control"
                                                        value={formData.expenseDate}
                                                        onChange={handleInputChange}
                                                    />
                                                </div>
                                                <div className="mb-3">
                                                    <label htmlFor="expenseType" className="form-label">Expense Type</label>
                                                    <select
                                                        id="expenseType"
                                                        name="expenseType"
                                                        className="form-control"
                                                        value={formData.expenseType}
                                                        onChange={handleInputChange}
                                                        required
                                                    >
                                                        <option value="">Select Expense Type</option>
                                                        {expenseTypes.map((type) => (
                                                            <option key={type._id} value={type._id}>
                                                                {type.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="mb-3">
                                                    <label htmlFor="vendor" className="form-label">Vendor</label>
                                                    <select
                                                        id="vendor"
                                                        name="vendor"
                                                        className="form-control"
                                                        value={formData.vendor}
                                                        onChange={handleInputChange}
                                                        required
                                                    >
                                                        <option value="">Select Vendor</option>
                                                        {vendors.map((vendor) => (
                                                            <option key={vendor._id} value={vendor._id}>
                                                                {vendor.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="mb-3">
                                                    <label htmlFor="invoiceId" className="form-label">Invoice</label>
                                                    <select
                                                        id="invoiceId"
                                                        name="invoiceId"
                                                        className="form-control"
                                                        value={formData.invoiceId}
                                                        onChange={handleInputChange}
                                                    >
                                                        <option value="">Select Invoice</option>

                                                        {invoices.map((invoice) => (
                                                            <option key={invoice._id} value={invoice._id}>
                                                                {invoice.InvoiceNumber} - {invoice.job}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="mb-3">
                                                    <label htmlFor="amount" className="form-label">Amount</label>
                                                    <input
                                                        type="number"
                                                        id="amount"
                                                        name="amount"
                                                        className="form-control"
                                                        value={formData.amount}
                                                        onChange={handleInputChange}
                                                        required
                                                    />
                                                </div>
                                                <div className="mb-3">
                                                    <label htmlFor="description" className="form-label">Description</label>
                                                    <textarea
                                                        id="description"
                                                        name="description"
                                                        className="form-control"
                                                        value={formData.description}
                                                        onChange={handleInputChange}
                                                    />
                                                </div>
                                                <div className="mb-3">
                                                    <label htmlFor="receiptUrl" className="form-label">Receipt URL</label>
                                                    <input
                                                        type="text"
                                                        id="receiptUrl"
                                                        name="receiptUrl"
                                                        className="form-control"
                                                        value={formData.receiptUrl}
                                                        onChange={handleInputChange}
                                                    />
                                                </div>
                                                <div className="mb-3">
                                                    <label htmlFor="paymentStatus" className="form-label">Payment Status</label>
                                                    <select
                                                        id="paymentStatus"
                                                        name="paymentStatus"
                                                        className="form-control"
                                                        value={formData.paymentStatus}
                                                        onChange={handleInputChange}
                                                    >
                                                        <option value="Pending">Pending</option>
                                                        <option value="Paid">Paid</option>
                                                    </select>
                                                </div>
                                                <button type="submit" className="btn btn-primary" disabled={loading}>
                                                    {formData._id ? 'Update Expense Entry' : 'Add Expense Entry'}
                                                </button>
                                                {formData._id && (
                                                    <button
                                                        type="button"
                                                        className="btn btn-secondary ms-2"
                                                        onClick={() => setFormData({
                                                            expenseDate: '',
                                                            expenseType: '',
                                                            vendor: '',
                                                            amount: '',
                                                            description: '',
                                                            paymentStatus: 'Pending',
                                                            receiptUrl: '',
                                                            invoiceId: '',
                                                        })}
                                                    >
                                                        Cancel
                                                    </button>
                                                )}
                                            </form>
                                        </div>

                                        {/* Right column - List of expense entries */}
                                        <div className="col-md-5">
                                            <h3>Expense Entries</h3>
                                            {loading ? (
                                                <div className="d-flex justify-content-center">
                                                    <ColorRing
                                                        visible={true}
                                                        height="80"
                                                        width="80"
                                                        ariaLabel="loading"
                                                        wrapperClass="d-flex justify-content-center"
                                                    />
                                                </div>
                                            ) : expenseEntries.length > 0 ? (
                                                <ul className="list-group">
                                                    {expenseEntries.map((entry) => (
                                                        <li
                                                            key={entry._id}
                                                            className="list-group-item d-flex justify-content-between align-items-center"
                                                        >
                                                            <div>
                                                                <strong>
                                                                    {entry.transactionType === "Credit" ? "Credit" : getExpenseTypeName(entry.expenseType)}
                                                                </strong>
                                                                <span
                                                                    style={{
                                                                        color:
                                                                            entry.transactionType === "Credit"
                                                                                ? "green"
                                                                                : entry.transactionType === "Expense"
                                                                                    ? "red"
                                                                                    : "#ffc107",
                                                                        fontWeight: "bold",
                                                                    }}
                                                                >
                                                                    {entry.transactionType === "Expense" ? " - " : " + "}
                                                                    <CurrencySign /> {entry.amount}
                                                                </span> - {entry.transactionType === "Credit" ? "" : getVendorName(entry.vendor)}
                                                            </div>
                                                            <div className="d-flex">
                                                                <button
                                                                    className="btn btn-warning btn-sm"
                                                                    onClick={() => handleEdit(entry)}
                                                                >
                                                                    Edit
                                                                </button>
                                                                <button
                                                                    className="btn btn-danger btn-sm ms-2"
                                                                    onClick={() => handleDelete(entry._id)}
                                                                >
                                                                    Delete
                                                                </button>
                                                            </div>
                                                        </li>
                                                    ))}
                                                </ul>

                                            ) : (
                                                <p>No expense entries available.</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
            }
        </div>
    );
}
