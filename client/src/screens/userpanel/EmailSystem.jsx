import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import { useNavigate } from 'react-router-dom';
import { ColorRing } from 'react-loader-spinner';
import Select from 'react-select';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

export default function EmailSystem() {
    const [loading, setLoading] = useState(true);
    const [customers, setCustomers] = useState([]);
    const [selectedCustomers, setSelectedCustomers] = useState([]);
    const [subject, setSubject] = useState('');
    const [emailBody, setEmailBody] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [alertMessage, setAlertMessage] = useState({ type: '', text: '' });

    const navigate = useNavigate();
    const currentUserId = localStorage.getItem("userid");

    useEffect(() => {
        if (!localStorage.getItem("authToken") || localStorage.getItem("isTeamMember") === "true") {
            navigate("/");
            return;
        }
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            const authToken = localStorage.getItem('authToken');
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/customers/${currentUserId}`, {
                headers: { 'Authorization': authToken }
            });
            const data = await response.json();
            
            if (Array.isArray(data)) {
                // Map to react-select format
                const options = data.map(cust => ({
                    value: cust.emails[0], // using first email
                    label: `${cust.name} (${cust.emails[0]})`,
                    emails: cust.emails
                })).filter(opt => opt.value); // Only keep customers that actually have an email
                
                setCustomers(options);
            }
            setLoading(false);
        } catch (error) {
            console.error('Error fetching customers:', error);
            setLoading(false);
        }
    };

    const handleSelectAll = () => {
        if (selectedCustomers.length === customers.length) {
            setSelectedCustomers([]);
        } else {
            setSelectedCustomers(customers);
        }
    };

    const handleSendEmail = async (e) => {
        e.preventDefault();
        
        if (selectedCustomers.length === 0) {
            setAlertMessage({ type: 'danger', text: 'Please select at least one recipient.' });
            return;
        }
        if (!subject.trim()) {
            setAlertMessage({ type: 'danger', text: 'Please enter a subject.' });
            return;
        }
        if (!emailBody.trim() || emailBody === '<p><br></p>') {
            setAlertMessage({ type: 'danger', text: 'Please enter an email body.' });
            return;
        }

        setIsSubmitting(true);
        setAlertMessage({ type: '', text: '' });

        // Gather all emails (a customer might have multiple emails, but our react-select uses value=emails[0]. 
        // If we want to send to all their emails, we can extract them from the option object.)
        let allEmails = [];
        selectedCustomers.forEach(cust => {
            if (cust.emails && cust.emails.length > 0) {
                allEmails.push(...cust.emails);
            } else if (cust.value) {
                allEmails.push(cust.value);
            }
        });

        // Deduplicate emails
        allEmails = [...new Set(allEmails)];

        try {
            const authToken = localStorage.getItem('authToken');
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/send-bulk-email`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': authToken,
                },
                body: JSON.stringify({
                    to: allEmails,
                    subject: subject,
                    html: emailBody
                })
            });

            const data = await response.json();
            if (response.ok && data.success) {
                setAlertMessage({ type: 'success', text: `Emails successfully sent to ${allEmails.length} recipients!` });
                setSubject('');
                setEmailBody('');
                setSelectedCustomers([]);
            } else {
                setAlertMessage({ type: 'danger', text: data.message || 'Failed to send emails.' });
            }
        } catch (error) {
            console.error('Error sending emails:', error);
            setAlertMessage({ type: 'danger', text: 'An error occurred while sending emails.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className='flex bg-gray-50 min-h-screen'>
            <Sidebar />
            <div className='flex-1 lg:ml-[300px] transition-all duration-300'>
                <div className='p-8'>
                    <div className="max-w-5xl mx-auto">
                        
                        {/* Header */}
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                            <div>
                                <h1 className="text-3xl font-black text-gray-800 tracking-tight mb-2">Email System</h1>
                                <p className="text-gray-500 font-medium">Send updates and invoices to your clients securely.</p>
                            </div>
                        </div>

                        {alertMessage.text && (
                            <div className={`p-4 mb-6 rounded-xl border flex items-center gap-3 ${
                                alertMessage.type === 'success' 
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                                : 'bg-red-50 border-red-200 text-red-700'
                            }`}>
                                <i className={`fa-solid ${alertMessage.type === 'success' ? 'fa-check-circle' : 'fa-circle-exclamation'} text-lg`}></i>
                                <span className="font-medium">{alertMessage.text}</span>
                            </div>
                        )}

                        {loading ? (
                            <div className='flex justify-center items-center h-64'>
                                <ColorRing visible={true} height="60" width="60" ariaLabel="color-ring-loading" wrapperStyle={{}} wrapperClass="color-ring-wrapper" colors={['#3b82f6', '#1d4ed8', '#2563eb', '#60a5fa', '#93c5fd']} />
                            </div>
                        ) : (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="p-8">
                                    <form onSubmit={handleSendEmail}>
                                        <div className="mb-6">
                                            <div className="flex justify-between items-center mb-2">
                                                <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">Recipients</label>
                                                <button 
                                                    type="button" 
                                                    onClick={handleSelectAll}
                                                    className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                                                >
                                                    {selectedCustomers.length === customers.length ? 'Deselect All' : 'Select All'}
                                                </button>
                                            </div>
                                            <Select
                                                isMulti
                                                options={customers}
                                                value={selectedCustomers}
                                                onChange={setSelectedCustomers}
                                                placeholder="Select customers..."
                                                className="react-select-container"
                                                classNamePrefix="react-select"
                                                styles={{
                                                    control: (base) => ({
                                                        ...base,
                                                        borderColor: '#e5e7eb',
                                                        borderRadius: '0.5rem',
                                                        padding: '2px',
                                                        boxShadow: 'none',
                                                        '&:hover': {
                                                            borderColor: '#3b82f6'
                                                        }
                                                    })
                                                }}
                                            />
                                            <p className="text-xs text-gray-500 mt-2">
                                                <i className="fa-solid fa-circle-info mr-1"></i>
                                                Emails are sent securely via BCC so clients cannot see each other's addresses.
                                            </p>
                                        </div>

                                        <div className="mb-6">
                                            <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-2">Subject</label>
                                            <input
                                                type="text"
                                                className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                                                value={subject}
                                                onChange={(e) => setSubject(e.target.value)}
                                                placeholder="Email Subject"
                                                required
                                            />
                                        </div>

                                        <div className="mb-8">
                                            <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-2">Message Body</label>
                                            <div className="border border-gray-200 rounded-lg overflow-hidden prose-editor">
                                                <CKEditor
                                                    editor={ClassicEditor}
                                                    data={emailBody}
                                                    onChange={(event, editor) => {
                                                        const data = editor.getData();
                                                        setEmailBody(data);
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        <div className="flex justify-end pt-4 border-t border-gray-100">
                                            <button
                                                type="submit"
                                                disabled={isSubmitting}
                                                className={`btn btn-primary px-8 py-3 rounded-lg font-bold shadow-soft flex items-center gap-2 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                                            >
                                                {isSubmitting ? (
                                                    <>
                                                        <i className="fa-solid fa-circle-notch fa-spin"></i>
                                                        Sending...
                                                    </>
                                                ) : (
                                                    <>
                                                        <i className="fa-solid fa-paper-plane"></i>
                                                        Send Email
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {/* Some CSS specific to CKEditor adjusting its min-height */}
            <style dangerouslySetInnerHTML={{__html: `
                .ck-editor__editable_inline {
                    min-height: 250px;
                }
            `}} />
        </div>
    );
}
