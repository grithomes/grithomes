import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import { useNavigate } from 'react-router-dom';
import { ColorRing } from 'react-loader-spinner';
import CurrencySign from '../../components/CurrencySign ';
import Alertauthtoken from '../../components/Alertauthtoken';

export default function InventoryList() {
    const [loading, setloading] = useState(true);
    const [inventoryItems, setInventoryItems] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [alertMessage, setAlertMessage] = useState('');
    const navigate = useNavigate();
    const [currentPage, setCurrentPage] = useState(0);
    const entriesPerPage = 10;

    // Transaction Modal State
    const [showTxModal, setShowTxModal] = useState(false);
    const [txType, setTxType] = useState(''); // 'Restock' or 'Usage'
    const [selectedItem, setSelectedItem] = useState(null);
    const [txData, setTxData] = useState({ quantity: '', description: '', date: '' });
    const [txError, setTxError] = useState('');
    const [isSubmittingTx, setIsSubmittingTx] = useState(false);

    // History Modal State
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [historyData, setHistoryData] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

    useEffect(() => {
        if (!localStorage.getItem("authToken") || localStorage.getItem("isTeamMember") == "true") {
            navigate("/");
        }
        fetchdata();
    }, []);

    const fetchdata = async () => {
        try {
            const userid = localStorage.getItem("userid");
            const authToken = localStorage.getItem('authToken');
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/inventorydata/${userid}`, {
                headers: {
                    'Authorization': authToken,
                }
            });

            if (response.status === 401) {
                const json = await response.json();
                setAlertMessage(json.message);
                setloading(false);
                return;
            } else {
                const json = await response.json();
                if (Array.isArray(json)) {
                    setInventoryItems(json);
                }
                setloading(false);
            }
        } catch (error) {
            console.error('Error fetching inventory data:', error);
            setloading(false);
        }
    };

    const handleAddClick = () => {
        navigate('/userpanel/Addinventory');
    };

    const handleEditClick = (item) => {
        let itemId = item._id;
        navigate('/userpanel/Editinventory', { state: { itemId } });
    };

    const handleDeleteClick = async (itemId) => {
        if (!window.confirm("Are you sure you want to delete this material? All history will be lost.")) return;
        try {
            const authToken = localStorage.getItem('authToken');
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/delinventory/${itemId}`, {
                method: 'GET',
                headers: {
                    'Authorization': authToken,
                }
            });

            if (response.status === 401) {
                const json = await response.json();
                setAlertMessage(json.message);
                return;
            } else {
                const json = await response.json();
                if (json.Success) {
                    fetchdata();
                } else {
                    console.error('Error deleting inventory item:', json.message);
                }
            }
        } catch (error) {
            console.error('Error deleting inventory item:', error);
        }
    };

    const openTxModal = (item, type) => {
        setSelectedItem(item);
        setTxType(type);
        setTxData({ quantity: '', description: '', date: new Date().toISOString().split('T')[0] });
        setTxError('');
        setShowTxModal(true);
    };

    const closeTxModal = () => {
        setShowTxModal(false);
        setSelectedItem(null);
    };

    const handleTxChange = (e) => {
        setTxData({ ...txData, [e.target.name]: e.target.value });
    };

    const submitTransaction = async () => {
        if (!txData.quantity || isNaN(txData.quantity) || Number(txData.quantity) <= 0) {
            setTxError("Please enter a valid quantity.");
            return;
        }

        if (txType === 'Usage' && Number(txData.quantity) > selectedItem.quantity) {
            setTxError("Cannot use more than available in stock.");
            return;
        }

        setIsSubmittingTx(true);
        setTxError('');

        try {
            const userid = localStorage.getItem("userid");
            const authToken = localStorage.getItem('authToken');
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/inventory/transaction`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': authToken,
                },
                body: JSON.stringify({
                    inventoryId: selectedItem._id,
                    type: txType,
                    quantity: txData.quantity,
                    description: txData.description,
                    date: txData.date,
                    userid
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                setTxError(result.message || 'Error saving transaction.');
            } else {
                closeTxModal();
                fetchdata();
            }
        } catch (error) {
            console.error('Error submitting transaction:', error);
            setTxError('Server error.');
        } finally {
            setIsSubmittingTx(false);
        }
    };

    const openHistoryModal = async (item) => {
        setSelectedItem(item);
        setShowHistoryModal(true);
        setLoadingHistory(true);
        setHistoryData([]);

        try {
            const authToken = localStorage.getItem('authToken');
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/inventory/transactions/${item._id}`, {
                headers: {
                    'Authorization': authToken,
                }
            });

            if (response.ok) {
                const json = await response.json();
                setHistoryData(json);
            }
        } catch (error) {
            console.error('Error fetching history:', error);
        } finally {
            setLoadingHistory(false);
        }
    };

    const closeHistoryModal = () => {
        setShowHistoryModal(false);
        setSelectedItem(null);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const filteredItems = inventoryItems.filter(item =>
        item.materialName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getPageCount = () => Math.ceil(filteredItems.length / entriesPerPage);
    const getCurrentPageItems = () => {
        const startIndex = currentPage * entriesPerPage;
        return filteredItems.slice(startIndex, startIndex + entriesPerPage);
    };

    return (
        <div className='bg'>
            {loading ? (
                <div className="flex flex-col md:flex-row">
                    <ColorRing loading={loading} display="flex" justify-content="center" align-items="center" />
                </div>
            ) : (
                <div className='w-full'>
                    <div className="flex flex-col md:flex-row">
                        <Sidebar />
                        <div className="flex-1 w-full mx-auto px-4">
                            <div className='mt-6 mx-4'>
                                {alertMessage && <Alertauthtoken message={alertMessage} onClose={() => setAlertMessage('')} />}
                            </div>
                            <div className='flex flex-wrap items-center justify-between py-6 px-4 mb-6 bg-white shadow-sm rounded-xl border border-gray-100 mx-4'>
                                <div>
                                    <p className='text-3xl font-bold text-gray-800'>Inventory Management</p>
                                    <nav aria-label="breadcrumb">
                                        <ol className="flex text-sm text-gray-500 mt-2 space-x-2">
                                            <li><a href="/userpanel/Userdashboard" className='hover:text-primary transition-colors text-decoration-none'>Dashboard</a></li>
                                            <li><span className="mx-2">/</span></li>
                                            <li className="text-gray-800 font-semibold" aria-current="page">Inventory</li>
                                        </ol>
                                    </nav>
                                </div>
                                <div className="mt-4 md:mt-0 flex flex-wrap gap-4">
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <i className="fa-solid fa-search text-gray-400"></i>
                                        </div>
                                        <input
                                            type="text"
                                            className="input-standard pl-10 w-full sm:w-64"
                                            placeholder="Search material..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                    </div>
                                    <button className='btn-primary' onClick={handleAddClick}>
                                        <i className="fa-solid fa-plus mr-2"></i> Add Material
                                    </button>
                                </div>
                            </div>

                            <div className="card-standard mx-4 mb-8 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-gray-50 border-b border-gray-100 text-sm text-gray-500">
                                                <th className="px-6 py-4 font-medium">Material Name</th>
                                                <th className="px-6 py-4 font-medium">Available Quantity</th>
                                                <th className="px-6 py-4 font-medium">Price/Unit</th>
                                                <th className="px-6 py-4 font-medium text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {getCurrentPageItems().map((item, index) => (
                                                <tr key={index} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-4 text-sm font-medium text-gray-800">
                                                        {item.materialName}
                                                        {item.description && <p className="text-xs text-gray-400 mt-1 font-normal">{item.description}</p>}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-800 font-medium">
                                                        <span className={item.quantity <= 0 ? 'text-red-500' : 'text-emerald-600'}>
                                                            {item.quantity} {item.unit}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-800 font-medium">
                                                        <CurrencySign />{item.price} /{item.unit}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <button className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" onClick={() => openTxModal(item, 'Restock')} title="Restock">
                                                                <i className="fa-solid fa-boxes-packing"></i>
                                                            </button>
                                                            <button className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors" onClick={() => openTxModal(item, 'Usage')} title="Log Usage">
                                                                <i className="fa-solid fa-person-digging"></i>
                                                            </button>
                                                            <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" onClick={() => openHistoryModal(item)} title="History">
                                                                <i className="fa-solid fa-clock-rotate-left"></i>
                                                            </button>
                                                            <button className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" onClick={() => handleEditClick(item)} title="Edit">
                                                                <i className="fa-solid fa-pen"></i>
                                                            </button>
                                                            <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" onClick={() => handleDeleteClick(item._id)} title="Delete">
                                                                <i className="fa-solid fa-trash"></i>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {filteredItems.length === 0 && (
                                        <div className="text-center py-12">
                                            <div className="w-16 h-16 mx-auto bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                                <i className="fa-solid fa-boxes-stacked text-2xl text-gray-400"></i>
                                            </div>
                                            <h3 className="text-lg font-medium text-gray-900 mb-1">No materials found</h3>
                                            <p className="text-gray-500">Get started by adding a new material.</p>
                                        </div>
                                    )}
                                </div>
                                
                                {getPageCount() > 1 && (
                                    <div className='flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50'>
                                        <span className="text-sm text-gray-500">
                                            Showing {currentPage * entriesPerPage + 1} to {Math.min((currentPage + 1) * entriesPerPage, filteredItems.length)} of {filteredItems.length} entries
                                        </span>
                                        <div className="flex gap-2">
                                            <button onClick={() => setCurrentPage(Math.max(0, currentPage - 1))} disabled={currentPage === 0} className="px-4 py-2 text-sm font-medium rounded-lg border bg-white disabled:bg-gray-100 disabled:text-gray-400">Previous</button>
                                            <button onClick={() => setCurrentPage(Math.min(getPageCount() - 1, currentPage + 1))} disabled={currentPage >= getPageCount() - 1} className="px-4 py-2 text-sm font-medium rounded-lg border bg-white disabled:bg-gray-100 disabled:text-gray-400">Next</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Transaction Modal */}
            {showTxModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-slate-50">
                            <h3 className="text-xl font-bold text-gray-800 uppercase tracking-tight">
                                {txType === 'Restock' ? 'Restock Material' : 'Log Material Usage'}
                            </h3>
                            <button onClick={closeTxModal} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <i className="fa-solid fa-xmark text-xl"></i>
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Material</p>
                                <p className="font-bold text-gray-800">{selectedItem?.materialName} <span className="font-normal text-sm">({selectedItem?.quantity} {selectedItem?.unit} available)</span></p>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Quantity ({selectedItem?.unit})</label>
                                <input type="number" name="quantity" value={txData.quantity} onChange={handleTxChange} className="input-standard w-full" placeholder="Enter quantity" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Date</label>
                                <input type="date" name="date" value={txData.date} onChange={handleTxChange} className="input-standard w-full" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Description / Note (Optional)</label>
                                <textarea name="description" value={txData.description} onChange={handleTxChange} className="input-standard w-full" rows="2" placeholder="Where was it used? Or Po Number?"></textarea>
                            </div>
                            {txError && <p className="text-red-500 text-sm font-medium">{txError}</p>}
                        </div>
                        <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
                            <button onClick={closeTxModal} className="px-6 py-2.5 rounded-xl font-bold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 transition-colors">Cancel</button>
                            <button onClick={submitTransaction} disabled={isSubmittingTx} className={`px-6 py-2.5 rounded-xl font-bold text-white transition-colors ${txType === 'Restock' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-amber-600 hover:bg-amber-700'} ${isSubmittingTx ? 'opacity-50' : ''}`}>
                                {isSubmittingTx ? 'Saving...' : 'Save'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* History Modal */}
            {showHistoryModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-slate-50">
                            <h3 className="text-xl font-bold text-gray-800 uppercase tracking-tight">
                                {selectedItem?.materialName} History
                            </h3>
                            <button onClick={closeHistoryModal} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <i className="fa-solid fa-xmark text-xl"></i>
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto flex-1 bg-white">
                            {loadingHistory ? (
                                <div className="flex justify-center py-8"><ColorRing width={40} height={40} /></div>
                            ) : historyData.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">No history found for this material.</div>
                            ) : (
                                <div className="space-y-4">
                                    {historyData.map((tx, idx) => (
                                        <div key={idx} className="flex items-start justify-between p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.type === 'Restock' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                                                    <i className={`fa-solid ${tx.type === 'Restock' ? 'fa-arrow-down' : 'fa-arrow-up'}`}></i>
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-800">{tx.type} <span className="text-gray-500 font-medium text-sm ml-2">{formatDate(tx.date)}</span></p>
                                                    {tx.description && <p className="text-sm text-gray-500 mt-1">{tx.description}</p>}
                                                </div>
                                            </div>
                                            <div className={`font-black text-lg ${tx.type === 'Restock' ? 'text-emerald-600' : 'text-amber-600'}`}>
                                                {tx.type === 'Restock' ? '+' : '-'}{tx.quantity} <span className="text-sm font-medium text-gray-500">{selectedItem?.unit}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end">
                            <button onClick={closeHistoryModal} className="px-6 py-2.5 rounded-xl font-bold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 transition-colors">Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
