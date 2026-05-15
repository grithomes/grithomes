import React, { useState, useEffect } from 'react';
import Sidebar from '../Sidebar';

import { ColorRing } from 'react-loader-spinner';

export default function ExpenseType() {
    const [expenseTypes, setExpenseTypes] = useState([]); // list of expense types
    const [selectedExpenseType, setSelectedExpenseType] = useState(null); // for edit
    const [formData, setFormData] = useState({
        name: '',
        description: '',
    });
    const [loading, setLoading] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertmessageShow, setAlertmessageShow] = useState('');

    const apiURL = `${import.meta.env.VITE_API_BASE_URL}/expensetype`;

    // Fetch all expense types on component mount
    useEffect(() => {
        fetchExpenseTypes();
    }, []);

    // Fetch expense types
    const fetchExpenseTypes = async () => {
        setLoading(true);
        try {
            const response = await fetch(apiURL);
            const data = await response.json();
            setExpenseTypes(data);
        } catch (error) {
            console.error('Error fetching expense types:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const method = selectedExpenseType ? 'PUT' : 'POST';
            const url = selectedExpenseType ? `${apiURL}/${selectedExpenseType._id}` : apiURL;

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                fetchExpenseTypes();
                setFormData({ name: '', description: '' });
                setSelectedExpenseType(null); // Clear selected expense type
            } else {
                console.error('Error saving expense type');
            }
        } catch (error) {
            console.error('Error submitting form:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (expenseType) => {
        setSelectedExpenseType(expenseType);
        setFormData({ name: expenseType.name, description: expenseType.description });
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this expense type?')) {
            try {
                const response = await fetch(`${apiURL}/${id}`, { method: 'DELETE' });
                if (response.ok) {
                    fetchExpenseTypes(); // refresh the list
                } else {
                    console.error('Error deleting expense type');
                }

            } catch (error) {
                console.error('Error deleting expense type:', error);
            }
        }
    };

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

                            {/* Header */}
                            <div className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-800">Expense Categories</h2>
                                <p className="text-sm text-gray-500 mt-1">Manage categories for your business expenses</p>
                            </div>

                            <div className='mb-6'>
                                {alertMessage && <Alertauthtoken message={alertMessage} onClose={() => setAlertMessage('')} />}
                                {alertmessageShow && (
                                    <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg p-4 flex justify-between items-start shadow-sm mb-6">
                                        <div className="font-medium">
                                            {alertmessageShow}
                                        </div>
                                        <button type="button" className="text-yellow-600 hover:text-yellow-800 focus:outline-none transition-colors" onClick={() => setAlertmessageShow("")}>
                                            <i className="fa-solid fa-xmark text-lg"></i>
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                                {/* Left column - Form to add/update expense types */}
                                <div className="lg:col-span-5">
                                    <div className="card-standard">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-6 border-b border-gray-100 pb-4">
                                            {selectedExpenseType ? 'Edit Category' : 'Add New Category'}
                                        </h3>
                                        <form onSubmit={handleSubmit} className="space-y-6">
                                            <div>
                                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">Category Name <span className="text-red-500">*</span></label>
                                                <input
                                                    type="text"
                                                    id="name"
                                                    name="name"
                                                    className="input-standard"
                                                    value={formData.name}
                                                    onChange={handleInputChange}
                                                    required
                                                    placeholder="e.g., Office Supplies"
                                                />
                                            </div>
                                            <div>
                                                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                                                <textarea
                                                    id="description"
                                                    name="description"
                                                    rows="4"
                                                    className="input-standard resize-none"
                                                    value={formData.description}
                                                    onChange={handleInputChange}
                                                    placeholder="Brief description of the category..."
                                                />
                                            </div>
                                            <div className="flex gap-3 pt-2">
                                                <button type="submit" className="btn-primary flex-1 justify-center" disabled={loading}>
                                                    {selectedExpenseType ? 'Update Category' : 'Save Category'}
                                                </button>
                                                {selectedExpenseType && (
                                                    <button
                                                        type="button"
                                                        className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                                        onClick={() => {
                                                            setSelectedExpenseType(null);
                                                            setFormData({ name: '', description: '' });
                                                        }}
                                                    >
                                                        Cancel
                                                    </button>
                                                )}
                                            </div>
                                        </form>
                                    </div>
                                </div>

                                {/* Right column - List of expense types */}
                                <div className="lg:col-span-7">
                                    <div className="card-standard">
                                        <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-4">
                                            <h3 className="text-lg font-semibold text-gray-800">Existing Categories</h3>
                                            <span className="bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full">
                                                {expenseTypes.length} {expenseTypes.length === 1 ? 'Category' : 'Categories'}
                                            </span>
                                        </div>

                                        {loading ? (
                                            <div className="flex justify-center py-12">
                                                <ColorRing
                                                    visible={true}
                                                    height="60"
                                                    width="60"
                                                    ariaLabel="loading"
                                                    wrapperClass="d-flex justify-center"
                                                />
                                            </div>
                                        ) : expenseTypes.length > 0 ? (
                                            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                                                {expenseTypes.map((expenseType) => (
                                                    <div key={expenseType._id} className="flex justify-between items-start p-4 bg-white border border-gray-100 rounded-xl hover:border-primary/30 hover:shadow-md transition-all duration-200 group">
                                                        <div className="flex-1 cursor-pointer pr-4" onClick={() => handleEdit(expenseType)}>
                                                            <h4 className="text-md font-semibold text-gray-900 group-hover:text-primary transition-colors">{expenseType.name}</h4>
                                                            {expenseType.description && (
                                                                <p className="text-sm text-gray-500 mt-1 line-clamp-2">{expenseType.description}</p>
                                                            )}
                                                        </div>
                                                        <button
                                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors focus:outline-none shrink-0"
                                                            onClick={() => handleDelete(expenseType._id)}
                                                            title="Delete category"
                                                        >
                                                            <i className="fa-solid fa-trash-can"></i>
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-12 px-4 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                                                <div className="w-16 h-16 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
                                                    <i className="fa-solid fa-tags text-2xl"></i>
                                                </div>
                                                <h3 className="text-lg font-medium text-gray-900 mb-1">No Categories Yet</h3>
                                                <p className="text-gray-500 max-w-sm mx-auto">Start by adding a new expense category using the form to organize your business expenses.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
            }
        </div>

    );
}
