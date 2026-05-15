import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';

import { ColorRing } from 'react-loader-spinner';
import CurrencySign from '../../components/CurrencySign ';
import moment from 'moment';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import { saveAs } from 'file-saver';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

export default function Reports() {
    const [loading, setLoading] = useState(true);
    const [totalReceivedAmount, setTotalReceivedAmount] = useState(0);
    const [startDate, setStartDate] = useState(moment().startOf('month').format('YYYY-MM-DD'));
    const [endDate, setEndDate] = useState(moment().endOf('month').format('YYYY-MM-DD'));
    const [receivedData, setReceivedData] = useState([]);
    const [chartData, setChartData] = useState({
        labels: [],
        datasets: [
            {
                label: 'Payments Received by Month',
                data: [],
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
            },
        ],
    });
    const [financialYearData, setFinancialYearData] = useState([]);
    const [expandedFY, setExpandedFY] = useState(null);
    const [fyFilter, setFyFilter] = useState('All');
    const [errorMessage, setErrorMessage] = useState('');

    let navigate = useNavigate();

    useEffect(() => {
        if (!localStorage.getItem('authToken') || localStorage.getItem('isTeamMember') === 'true') {
            navigate('/');
        } else {
            fetchTotalReceivedAmount();
            fetchFinancialYearData();
        }
    }, [navigate]);

    const fetchTotalReceivedAmount = async () => {
        try {
            setLoading(true);
            const userid = localStorage.getItem('userid');
            const response = await fetch(
                `${import.meta.env.VITE_API_BASE_URL}/currentMonthReceivedAmount2/${userid}?startOfMonth=${moment(startDate).format('YYYY-MM-DD')}&endOfMonth=${moment(endDate).format('YYYY-MM-DD')}`
            );
            const data = await response.json();
            console.log('Received Data:', data);

            // If backend returns array of transactions with invoiceDetails
            const totalAmount = data.reduce((acc, curr) => acc + (curr.paidamount || 0), 0);

            setTotalReceivedAmount(totalAmount);
            setReceivedData(data);

            // Prepare chart data by date
            const groupedByDate = {};
            data.forEach(item => {
                if (!groupedByDate[item.paiddate]) groupedByDate[item.paiddate] = 0;
                groupedByDate[item.paiddate] += item.paidamount || 0;
            });

            const labels = Object.keys(groupedByDate).sort();
            const amounts = Object.values(groupedByDate);

            setChartData({
                labels,
                datasets: [
                    {
                        label: 'Payments Received by Date',
                        data: amounts,
                        backgroundColor: 'rgba(75, 192, 192, 0.6)',
                    },
                ],
            });

        } catch (error) {
            console.error('Error fetching total received amount:', error);
        } finally {
            setLoading(false);
        }
    };

    const prepareChartData = (data) => {
        const labels = data.map(entry => moment(entry._id).format('YYYY-MM'));
        const amounts = data.map(entry => entry.totalReceivedAmount);

        console.log('Labels:', labels);
        console.log('Amounts:', amounts);

        setChartData({
            labels: labels,
            datasets: [
                {
                    label: 'Payments Received by Month',
                    data: amounts,
                    backgroundColor: 'rgba(75, 192, 192, 0.6)',
                },
            ],
        });
    };

    const fetchFinancialYearData = async () => {
        try {
            const userid = localStorage.getItem("userid");
            const authToken = localStorage.getItem('authToken');
            console.log('Fetching FY data for user:', userid);
            console.log('Auth token:', authToken);

            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/all-invoices-by-financial-year?userid=${userid}`, {
                headers: {
                    'Authorization': authToken,
                }
            });

            console.log('FY Response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('FY Response error:', errorText);
                setErrorMessage(`Failed to fetch financial year data: ${response.status} - ${errorText}`);
                return;
            }

            const json = await response.json();
            console.log('FY API response:', json);

            if (json.success) {
                if (json.data && json.data.length > 0) {
                    setFinancialYearData(json.data);
                } else {
                    setErrorMessage('No financial year data returned from API');
                }
            } else {
                setErrorMessage(json.message || 'API returned unsuccessful response');
            }
        } catch (error) {
            console.error('Error fetching financial year data:', error);
            setErrorMessage(`Error fetching financial year data: ${error.message}`);
        }
    };

    const roundOff = (value) => {
        const roundedValue = Math.round(value * 100) / 100;
        return roundedValue.toLocaleString('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    };

    const handleViewClick = (invoice) => {
        navigate('/userpanel/Invoicedetail', { state: { invoiceid: invoice._id } });
    };

    const escapeCSVField = (field) => {
        if (field === null || field === undefined) return '';
        const str = String(field);
        // If the field contains quotes, commas, or newlines, enclose it in quotes and escape existing quotes
        if (str.includes('"') || str.includes(',') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
    };

    const exportToCSV = () => {
        // Filter data based on current filter
        const filteredData = financialYearData.filter(fy => fyFilter === 'All' || fy.financialYear === fyFilter);

        // CSV headers
        let csvContent = "Financial Year,Invoice Count,Total Amount,Total Due,Total Tax\n";

        // Summary rows
        filteredData.forEach(fy => {
            csvContent += [
                escapeCSVField(fy.financialYear),
                escapeCSVField(fy.invoiceCount),
                escapeCSVField(fy.totalAmount), // Raw number without formatting
                escapeCSVField(fy.totalDue),
                escapeCSVField(fy.totalTax)
            ].join(',') + '\n';
        });

        // Add detailed invoice data
        csvContent += "\nDetailed Invoices\n";
        csvContent += "Financial Year,Invoice Number,Customer,Job,Amount,Status\n";

        filteredData.forEach(fy => {
            fy.invoices.forEach(invoice => {
                csvContent += [
                    escapeCSVField(fy.financialYear),
                    escapeCSVField(invoice.InvoiceNumber),
                    escapeCSVField(invoice.customername),
                    escapeCSVField(invoice.job),
                    escapeCSVField(invoice.total), // Raw number without formatting
                    escapeCSVField(invoice.status)
                ].join(',') + '\n';
            });
        });

        // Create and download the CSV file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        saveAs(blob, `Financial_Year_Invoices_${moment().format('YYYY-MM-DD')}.csv`);
    };

    return (
        <div className='bg'>
            {loading ? (
                <div className="flex flex-col md:flex-row">
                    <ColorRing
                        width={200}
                        loading={loading}
                        size={500}
                        display='flex'
                        justifyContent='center'
                        alignItems='center'
                        aria-label='Loading Spinner'
                        data-testid='loader'
                    />
                </div>
            ) : (
                <div className='w-full '>
                    <div className="flex flex-col md:flex-row">
                            <Sidebar />
                            <div className="flex-1 w-full mx-auto px-4">

                            <div className='flex flex-wrap items-center justify-between py-6 px-4 mb-6 bg-white shadow-sm rounded-xl border border-gray-100 mx-4 mt-6'>
                                <div>
                                    <p className='text-3xl font-bold text-gray-800'>Financial Reports</p>
                                    <nav aria-label="breadcrumb">
                                        <ol className="flex text-sm text-gray-500 mt-2 space-x-2">
                                            <li><a href="/Userpanel/Userdashboard" className='hover:text-primary transition-colors text-decoration-none'>Dashboard</a></li>
                                            <li><span className="mx-2">/</span></li>
                                            <li className="text-gray-800 font-semibold" aria-current="page">Reports</li>
                                        </ol>
                                    </nav>
                                </div>
                            </div>

                            <div className='card-standard p-6 mx-4 mb-8'>
                                <h4 className="text-xl font-semibold text-gray-800 mb-6">Payment Overview</h4>
                                <div className='grid grid-cols-1 md:grid-cols-3 gap-6 items-end mb-8 border-b border-gray-100 pb-8'>
                                    <div>
                                        <label htmlFor='startDate' className='block text-sm font-medium text-gray-700 mb-1'>
                                            Start Date
                                        </label>
                                        <input
                                            type='date'
                                            name='startDate'
                                            className='input-standard'
                                            id='startDate'
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor='endDate' className='block text-sm font-medium text-gray-700 mb-1'>
                                            End Date
                                        </label>
                                        <input
                                            type='date'
                                            name='endDate'
                                            className='input-standard'
                                            id='endDate'
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <button className='btn-primary w-full md:w-auto px-8' onClick={fetchTotalReceivedAmount}>
                                            <i className="fa-solid fa-filter mr-2"></i>Filter
                                        </button>
                                    </div>
                                </div>

                                <div className='mb-8'>
                                    <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-6 max-w-sm">
                                        <p className="text-sm font-medium text-indigo-600 mb-1">Total Received Amount</p>
                                        <p className="text-3xl font-bold text-gray-900"><CurrencySign />{totalReceivedAmount}</p>
                                    </div>
                                </div>

                                <div className='mb-12'>
                                    <div className="h-80 w-full">
                                        <Bar data={chartData} options={{ maintainAspectRatio: false }} />
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-xl font-semibold text-gray-800 mb-4">Received Payments Details</h4>
                                    <div className="overflow-x-auto border border-gray-100 rounded-xl">
                                        <table className='w-full text-left border-collapse'>
                                            <thead>
                                                <tr className="bg-gray-50 border-b border-gray-100 text-sm text-gray-500">
                                                    <th className="px-6 py-4 font-medium">Date</th>
                                                    <th className="px-6 py-4 font-medium">Invoice #</th>
                                                    <th className="px-6 py-4 font-medium">Customer</th>
                                                    <th className="px-6 py-4 font-medium">Job</th>
                                                    <th className="px-6 py-4 font-medium text-right">Invoice Total</th>
                                                    <th className="px-6 py-4 font-medium text-right">Paid Amount</th>
                                                    <th className="px-6 py-4 font-medium">Method</th>
                                                    <th className="px-6 py-4 font-medium">Status</th>
                                                    <th className="px-6 py-4 font-medium text-center">View</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {receivedData.length === 0 ? (
                                                    <tr>
                                                        <td colSpan="9" className="text-center py-8 text-gray-500">No transactions found for this period.</td>
                                                    </tr>
                                                ) : (
                                                    receivedData.map((entry, index) => (
                                                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                                                            <td className="px-6 py-4 text-sm text-gray-600">{moment(entry.paiddate).format('YYYY-MM-DD')}</td>
                                                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{entry.invoiceDetails?.InvoiceNumber || '-'}</td>
                                                            <td className="px-6 py-4 text-sm text-gray-600">{entry.invoiceDetails?.customername || '-'}</td>
                                                            <td className="px-6 py-4 text-sm text-gray-600">{entry.invoiceDetails?.job || '-'}</td>
                                                            <td className="px-6 py-4 text-sm font-medium text-gray-900 text-right"><CurrencySign />{entry.invoiceDetails?.total?.toLocaleString() || '0'}</td>
                                                            <td className="px-6 py-4 text-sm font-medium text-green-600 text-right"><CurrencySign />{entry.paidamount?.toLocaleString() || '0'}</td>
                                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                                    {entry.method || '-'}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4 text-sm text-gray-600">{entry.invoiceDetails?.status || '-'}</td>
                                                            <td className='text-center px-6 py-4'>
                                                                {entry.invoiceDetails ? (
                                                                    <button
                                                                        className='text-gray-400 hover:text-primary transition-colors'
                                                                        onClick={() => handleViewClick(entry.invoiceDetails)}
                                                                        title="View Invoice"
                                                                    >
                                                                        <i className='fa-solid fa-eye'></i>
                                                                    </button>
                                                                ) : (
                                                                    '-'
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>

                            {/* Financial Year Section */}
                            <div className='card-standard p-6 mx-4 mb-8'>
                                <div className='flex flex-wrap justify-between items-center mb-6 gap-4'>
                                    <h4 className="text-xl font-semibold text-gray-800">Invoices by Financial Year</h4>
                                    <button className='px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center font-medium' onClick={exportToCSV}>
                                        <i className="fa-solid fa-file-csv mr-2"></i>Export to CSV
                                    </button>
                                </div>
                                {errorMessage && (
                                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center" role="alert">
                                        <i className="fa-solid fa-triangle-exclamation mr-3"></i>
                                        {errorMessage}
                                    </div>
                                )}
                                <div className='mb-6 max-w-xs'>
                                    <select onChange={(e) => setFyFilter(e.target.value)} className='input-standard'>
                                        <option value='All'>All Financial Years</option>
                                        {financialYearData.map(fy => (
                                            <option key={fy.financialYear} value={fy.financialYear}>{fy.financialYear}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className='overflow-x-auto border border-gray-100 rounded-xl'>
                                    <table className='w-full text-left border-collapse'>
                                        <thead>
                                            <tr className="bg-gray-50 border-b border-gray-100 text-sm text-gray-500">
                                                <th className="px-6 py-4 font-medium">Financial Year</th>
                                                <th className="px-6 py-4 font-medium text-center">Invoice Count</th>
                                                <th className="px-6 py-4 font-medium text-right">Total Amount</th>
                                                <th className="px-6 py-4 font-medium text-right">Total Due</th>
                                                <th className="px-6 py-4 font-medium text-right">Total Tax</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {financialYearData.length === 0 ? (
                                                <tr>
                                                    <td colSpan="5" className="text-center py-8 text-gray-500">No financial year data available</td>
                                                </tr>
                                            ) : (
                                                financialYearData
                                                    .filter(fy => fyFilter === 'All' || fy.financialYear === fyFilter)
                                                    .map((fy, index) => (
                                                        <React.Fragment key={index}>
                                                            <tr 
                                                                className={`transition-colors cursor-pointer ${expandedFY === fy.financialYear ? 'bg-indigo-50/50' : 'hover:bg-gray-50'}`}
                                                                onClick={() => setExpandedFY(expandedFY === fy.financialYear ? null : fy.financialYear)}
                                                            >
                                                                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                                                    <i className={`fa-solid fa-chevron-${expandedFY === fy.financialYear ? 'up' : 'down'} text-gray-400 mr-3 text-xs w-3`}></i>
                                                                    {fy.financialYear}
                                                                </td>
                                                                <td className="px-6 py-4 text-sm text-gray-600 text-center">
                                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                                        {fy.invoiceCount}
                                                                    </span>
                                                                </td>
                                                                <td className="px-6 py-4 text-sm font-medium text-gray-900 text-right"><CurrencySign />{roundOff(fy.totalAmount)}</td>
                                                                <td className="px-6 py-4 text-sm font-medium text-orange-600 text-right"><CurrencySign />{roundOff(fy.totalDue)}</td>
                                                                <td className="px-6 py-4 text-sm font-medium text-gray-600 text-right"><CurrencySign />{roundOff(fy.totalTax)}</td>
                                                            </tr>
                                                            {expandedFY === fy.financialYear && (
                                                                <tr>
                                                                    <td colSpan="5" className="p-0 border-b border-gray-100">
                                                                        <div className="bg-gray-50/50 px-6 py-4 pl-12 shadow-inner border-y border-gray-100">
                                                                            <table className="w-full text-left bg-white rounded-lg overflow-hidden border border-gray-200">
                                                                                <thead>
                                                                                    <tr className="bg-gray-100 border-b border-gray-200 text-xs text-gray-500 uppercase tracking-wider">
                                                                                        <th className="px-4 py-3 font-medium">Invoice Number</th>
                                                                                        <th className="px-4 py-3 font-medium">Customer</th>
                                                                                        <th className="px-4 py-3 font-medium">Job</th>
                                                                                        <th className="px-4 py-3 font-medium text-right">Amount</th>
                                                                                        <th className="px-4 py-3 font-medium">Status</th>
                                                                                        <th className="px-4 py-3 font-medium text-center">View</th>
                                                                                    </tr>
                                                                                </thead>
                                                                                <tbody className="divide-y divide-gray-100 text-sm">
                                                                                    {fy.invoices.map((invoice, i) => (
                                                                                        <tr key={i} className="hover:bg-gray-50">
                                                                                            <td className="px-4 py-3 font-medium text-gray-900">{invoice.InvoiceNumber}</td>
                                                                                            <td className="px-4 py-3 text-gray-600">{invoice.customername}</td>
                                                                                            <td className="px-4 py-3 text-gray-600">{invoice.job}</td>
                                                                                            <td className="px-4 py-3 font-medium text-gray-900 text-right"><CurrencySign />{roundOff(invoice.total)}</td>
                                                                                            <td className="px-4 py-3">
                                                                                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                                                                                    invoice.status === 'Paid' ? 'bg-green-100 text-green-800' : 
                                                                                                    invoice.status === 'Sent' ? 'bg-blue-100 text-blue-800' : 
                                                                                                    'bg-gray-100 text-gray-800'
                                                                                                }`}>
                                                                                                    {invoice.status}
                                                                                                </span>
                                                                                            </td>
                                                                                            <td className='text-center px-4 py-3'>
                                                                                                <button className='text-gray-400 hover:text-primary transition-colors' onClick={() => handleViewClick(invoice)} title="View Invoice">
                                                                                                    <i className='fa-solid fa-eye'></i>
                                                                                                </button>
                                                                                            </td>
                                                                                        </tr>
                                                                                    ))}
                                                                                </tbody>
                                                                            </table>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            )}
                                                        </React.Fragment>
                                                    ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}