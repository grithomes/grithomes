import React, { useState, useEffect } from 'react';
import { ColorRing } from 'react-loader-spinner';
import Sidebar from '../Sidebar';


export default function Vendor() {
    const [vendors, setVendors] = useState([]); // list of vendors
    const [selectedVendor, setSelectedVendor] = useState(null); // for edit
    const [formData, setFormData] = useState({
        name: '',
        contactPerson: '',
        email: '',
        phone: '',
        address: '',
        notes: '',
    });
    const [loading, setLoading] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertMessageShow, setAlertMessageShow] = useState(false);

    const apiURL = `${import.meta.env.VITE_API_BASE_URL}/vendor`;

    // Fetch all vendors on component mount
    useEffect(() => {
        fetchVendors();
    }, []);

    // Fetch vendors
    const fetchVendors = async () => {
        setLoading(true);
        try {
            const response = await fetch(apiURL);
            const data = await response.json();
            setVendors(data);
        } catch (error) {
            console.error('Error fetching vendors:', error);
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
            const method = selectedVendor ? 'PUT' : 'POST';
            const url = selectedVendor ? `${apiURL}/${selectedVendor._id}` : apiURL;

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                fetchVendors();
                setFormData({ name: '', contactPerson: '', email: '', phone: '', address: '', notes: '' });
                setSelectedVendor(null); // Clear selected vendor
                setAlertMessage('Vendor saved successfully!');
                setAlertMessageShow(true);
            } else {
                console.error('Error saving vendor');
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            setAlertMessage('An error occurred while saving the vendor.');
            setAlertMessageShow(true);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (vendor) => {
        setSelectedVendor(vendor);
        setFormData({
            name: vendor.name,
            contactPerson: vendor.contactPerson,
            email: vendor.email,
            phone: vendor.phone,
            address: vendor.address,
            notes: vendor.notes,
        });
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this vendor?')) {
            try {
                const response = await fetch(`${apiURL}/${id}`, { method: 'DELETE' });
                if (response.ok) {
                    fetchVendors(); // refresh the list
                    setAlertMessage('Vendor deleted successfully!');
                    setAlertMessageShow(true);
                } else {
                    console.error('Error deleting vendor');
                }
            } catch (error) {
                console.error('Error deleting vendor:', error);
                setAlertMessage('An error occurred while deleting the vendor.');
                setAlertMessageShow(true);
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
                                <h2 className="text-2xl font-bold text-gray-800">Vendors</h2>
                                <p className="text-sm text-gray-500 mt-1">Manage the vendors and suppliers you do business with</p>
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

                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                                {/* Left column - Form to add/update vendor */}
                                <div className="lg:col-span-5">
                                    <div className="card-standard">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-6 border-b border-gray-100 pb-4">
                                            {selectedVendor ? 'Edit Vendor' : 'Add New Vendor'}
                                        </h3>
                                        <form onSubmit={handleSubmit} className="space-y-5">
                                            <div>
                                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">Vendor Name <span className="text-red-500">*</span></label>
                                                <input
                                                    type="text"
                                                    id="name"
                                                    name="name"
                                                    className="input-standard"
                                                    value={formData.name}
                                                    onChange={handleInputChange}
                                                    required
                                                    placeholder="Company or Individual Name"
                                                />
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                                <div>
                                                    <label htmlFor="contactPerson" className="block text-sm font-medium text-gray-700 mb-2">Contact Person</label>
                                                    <input
                                                        type="text"
                                                        id="contactPerson"
                                                        name="contactPerson"
                                                        className="input-standard"
                                                        value={formData.contactPerson}
                                                        onChange={handleInputChange}
                                                        placeholder="Full Name"
                                                    />
                                                </div>
                                                <div>
                                                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                                                    <input
                                                        type="text"
                                                        id="phone"
                                                        name="phone"
                                                        className="input-standard"
                                                        value={formData.phone}
                                                        onChange={handleInputChange}
                                                        placeholder="(555) 123-4567"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email <span className="text-red-500">*</span></label>
                                                <input
                                                    type="email"
                                                    id="email"
                                                    name="email"
                                                    className="input-standard"
                                                    value={formData.email}
                                                    onChange={handleInputChange}
                                                    required
                                                    placeholder="email@company.com"
                                                />
                                            </div>

                                            <div>
                                                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                                                <textarea
                                                    id="address"
                                                    name="address"
                                                    rows="2"
                                                    className="input-standard resize-none"
                                                    value={formData.address}
                                                    onChange={handleInputChange}
                                                    placeholder="Street address, city, state, zip"
                                                />
                                            </div>

                                            <div>
                                                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                                                <textarea
                                                    id="notes"
                                                    name="notes"
                                                    rows="2"
                                                    className="input-standard resize-none"
                                                    value={formData.notes}
                                                    onChange={handleInputChange}
                                                    placeholder="Any additional information..."
                                                />
                                            </div>

                                            <div className="flex gap-3 pt-4 border-t border-gray-100">
                                                <button type="submit" className="btn-primary flex-1 justify-center" disabled={loading}>
                                                    {selectedVendor ? 'Update Vendor' : 'Save Vendor'}
                                                </button>
                                                {selectedVendor && (
                                                    <button
                                                        type="button"
                                                        className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                                        onClick={() => {
                                                            setSelectedVendor(null);
                                                            setFormData({ name: '', contactPerson: '', email: '', phone: '', address: '', notes: '' });
                                                        }}
                                                    >
                                                        Cancel
                                                    </button>
                                                )}
                                            </div>
                                        </form>
                                    </div>
                                </div>

                                {/* Right column - List of vendors */}
                                <div className="lg:col-span-7">
                                    <div className="card-standard">
                                        <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-4">
                                            <h3 className="text-lg font-semibold text-gray-800">Existing Vendors</h3>
                                            <span className="bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full">
                                                {vendors.length} {vendors.length === 1 ? 'Vendor' : 'Vendors'}
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
                                        ) : vendors.length > 0 ? (
                                            <div className="space-y-3 max-h-[800px] overflow-y-auto pr-2 custom-scrollbar">
                                                {vendors.map((vendor) => (
                                                    <div key={vendor._id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-white border border-gray-100 rounded-xl hover:border-primary/30 hover:shadow-md transition-all duration-200 group">
                                                        <div className="flex-1 cursor-pointer pr-4 w-full mb-3 sm:mb-0" onClick={() => handleEdit(vendor)}>
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <h4 className="text-md font-semibold text-gray-900 group-hover:text-primary transition-colors">{vendor.name}</h4>
                                                                {vendor.contactPerson && (
                                                                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md border border-gray-200">
                                                                        <i className="fa-regular fa-user mr-1"></i>{vendor.contactPerson}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-sm text-gray-500">
                                                                <div className="flex items-center gap-1">
                                                                    <i className="fa-regular fa-envelope w-4"></i>
                                                                    <span className="truncate max-w-[200px]">{vendor.email}</span>
                                                                </div>
                                                                {vendor.phone && (
                                                                    <div className="flex items-center gap-1">
                                                                        <i className="fa-solid fa-phone w-4"></i>
                                                                        <span>{vendor.phone}</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            {vendor.address && (
                                                                <p className="text-xs text-gray-400 mt-2 truncate"><i className="fa-solid fa-location-dot mr-1"></i> {vendor.address}</p>
                                                            )}
                                                        </div>
                                                        <button
                                                            className="p-2 w-full sm:w-auto flex justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors focus:outline-none shrink-0 border border-gray-100 sm:border-transparent"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDelete(vendor._id);
                                                            }}
                                                            title="Delete vendor"
                                                        >
                                                            <i className="fa-solid fa-trash-can sm:mr-0 mr-2"></i>
                                                            <span className="sm:hidden text-sm font-medium">Delete Vendor</span>
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-12 px-4 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                                                <div className="w-16 h-16 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
                                                    <i className="fa-solid fa-truck-fast text-2xl"></i>
                                                </div>
                                                <h3 className="text-lg font-medium text-gray-900 mb-1">No Vendors Found</h3>
                                                <p className="text-gray-500 max-w-sm mx-auto">Start by adding your first vendor or supplier using the form to track your expenses better.</p>
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
