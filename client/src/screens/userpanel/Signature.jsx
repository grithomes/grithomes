import React, { useEffect, useRef, useState } from 'react';
import Sidebar from './Sidebar';

import SignatureCanvas from 'react-signature-canvas';
import { useNavigate } from 'react-router-dom';

export default function Signature() {
    const sigCanvas = useRef(null);
    const [hasSignature, setHasSignature] = useState(false);
    const [signatureData, setSignatureData] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [signupdata, setsignupdata] = useState({
        Businesstype: "",
        CurrencyType: "",
        FirstName: "",
        LastName: "",
        TaxName: "",
        address: "",
        city: "",
        companyImageUrl: "",
        companyname: "",
        country: "",
        email: "",
        state: "",
        taxPercentage: "",
    });
    const navigate = useNavigate();

    useEffect(() => {
        if (!localStorage.getItem('authToken') || localStorage.getItem('isTeamMember') === 'true') {
            navigate('/');
        }
        fetchsignupdata();
    }, [navigate]);

    const fetchsignupdata = async () => {
        try {
            const userid = localStorage.getItem("userid");
            const authToken = localStorage.getItem('authToken');
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/getsignupdata/${userid}`, {
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
                if (json != null) {
                    setsignupdata(json);
                }
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            setloading(false);
        }
    }

    const fetchSignatureData = async () => {
        try {
            const ownerId = localStorage.getItem('userid'); // Retrieve the ownerId
            const authToken = localStorage.getItem('authToken'); // Retrieve the auth token

            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/check-signature/${ownerId}`, {
                headers: {
                    'Authorization': authToken,
                }
            });

            if (response.status === 401) {
                const json = await response.json();
                console.error(json.message); // Handle unauthorized access
                return; // Stop further execution
            }

            const json = await response.json();

            if (json.hasSignature) {
                setHasSignature(true);
                setSignatureData(json.signatureData);
            }

        } catch (error) {
            console.error('Error fetching signature:', error);
        }
    };

    useEffect(() => {
        fetchSignatureData();
    }, []);

    useEffect(() => {
        if (hasSignature && sigCanvas.current) {
            const canvas = sigCanvas.current.getCanvas();
            const ctx = canvas.getContext('2d');
            const img = new Image();
            // Ensure to handle if signatureData already has the 'data:image/png;base64,' prefix
            img.src = signatureData.startsWith('data:image/png;base64,') ? signatureData : `data:image/png;base64,${signatureData}`;
            img.onload = () => {
                ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
                ctx.drawImage(img, 0, 0); // Draw the image on the canvas
            };
        }
    }, [hasSignature, signatureData]);

    const clear = () => sigCanvas.current.clear();

    const saveSignature = async () => {
        if (!sigCanvas.current.isEmpty()) {
            setIsSubmitting(true);

            const signature = sigCanvas.current.toDataURL(); // Get signature data URL
            const ownerId = localStorage.getItem('userid');
            const email = localStorage.getItem('userEmail'); // Assuming email is stored in localStorage
            // const companyname = localStorage.getItem('companyName'); // Assuming company name is stored in localStorage

            try {
                const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/check-signature/${ownerId}`, {
                    headers: {
                        'Authorization': localStorage.getItem('authToken'),
                    },
                });

                const json = await response.json();

                if (json.hasSignature) {
                    // If signature exists, update it
                    const updateResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/update-ownersignature`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': localStorage.getItem('authToken'),
                        },
                        body: JSON.stringify({
                            signature,
                            ownerId,
                            email,
                            companyname: signupdata.companyname
                        }),
                    });

                    const updateJson = await updateResponse.json();
                    if (updateResponse.ok) {
                        console.log('Signature updated:', updateJson);
                    } else {
                        console.error('Error updating signature:', updateJson.message);
                    }
                } else {
                    // If no signature exists, create a new one
                    const createResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/ownersignature`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': localStorage.getItem('authToken'),
                        },
                        body: JSON.stringify({
                            signature,
                            ownerId,
                            email,
                            companyname: signupdata?.companyname || '',
                        }),
                    });

                    const createJson = await createResponse.json();
                    if (createResponse.ok) {
                        console.log('Signature saved:', createJson);
                    } else {
                        console.error('Error saving signature:', createJson.message);
                    }
                }
            } catch (error) {
                console.error('Error handling signature:', error);
            } finally {
                setIsSubmitting(false);
            }
        } else {
            console.log('Signature is empty');
        }
    };


    return (
        <div className="bg">
            <div className="w-full ">
                <div className="flex flex-col md:flex-row">
                            <Sidebar />
                            <div className="flex-1 w-full mx-auto px-4">

                        <div className='flex flex-wrap items-center justify-between py-6 px-4 mb-6 bg-white shadow-sm rounded-xl border border-gray-100 mx-4 mt-6'>
                            <div>
                                <p className='text-3xl font-bold text-gray-800'>E-Sign Settings</p>
                                <nav aria-label="breadcrumb">
                                    <ol className="flex text-sm text-gray-500 mt-2 space-x-2">
                                        <li><a href="/Userpanel/Userdashboard" className='hover:text-primary transition-colors text-decoration-none'>Dashboard</a></li>
                                        <li><span className="mx-2">/</span></li>
                                        <li className="text-gray-800 font-semibold" aria-current="page">E-Sign</li>
                                    </ol>
                                </nav>
                            </div>
                        </div>

                        <div className="card-standard p-6 mx-4 mb-8 max-w-3xl">
                            <h5 className="text-xl font-semibold text-gray-800 mb-6">Your Signature</h5>
                            <div className="mb-6">
                                <p className="text-sm text-gray-600 mb-4">Draw your signature below. This will be used on all your generated invoices and estimates.</p>
                                <div className="border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 overflow-hidden flex justify-center">
                                    <SignatureCanvas
                                        ref={sigCanvas}
                                        canvasProps={{ width: 500, height: 200, className: 'sigCanvassig bg-transparent cursor-crosshair' }}
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3 pt-4 border-t border-gray-100">
                                <button onClick={clear} className='px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors'>
                                    <i className="fa-solid fa-eraser mr-2"></i>Clear Canvas
                                </button>
                                <button className='btn-primary flex items-center' onClick={saveSignature} disabled={isSubmitting}>
                                    {isSubmitting ? (
                                        <><i className="fa-solid fa-spinner fa-spin mr-2"></i>Saving...</>
                                    ) : (
                                        <><i className="fa-solid fa-check mr-2"></i>Save Signature</>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
