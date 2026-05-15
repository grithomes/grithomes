import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ColorRing } from 'react-loader-spinner'

import Sidebar from './Sidebar';
import { ReactMultiEmail } from 'react-multi-email';
import 'react-multi-email/dist/style.css'
import html2pdf from 'html2pdf.js';
// import he from 'he';
import CurrencySign from '../../components/CurrencySign ';
import Alertauthtoken from '../../components/Alertauthtoken';
// import { PDFViewer, pdf, PDFDownloadLink, Document, Image, Page, Text, Font, View, StyleSheet } from '@react-pdf/renderer';   

export default function Estimatedetail() {
  const [loading, setloading] = useState(true);
  const [signupdata, setsignupdata] = useState([]);
  const modalRef = useRef(null);
  const [items, setitems] = useState([]);
  const location = useLocation();
  const [selectedinvoices, setselectedinvoices] = useState(null);
  const [estimateData, setestimateData] = useState({
    customername: '', itemname: '', customeremail: '', customerphone: '', EstimateNumber: '', purchaseorder: '',
    date: '', description: '', itemquantity: '', price: '', discount: '',
    amount: '', tax: '', taxpercentage: '', subtotal: '', total: '', amountdue: '', information: '', isAddSignature: ''
  });

  const estimateid = location.state?.estimateid;
  const [transactionData, setTransactionData] = useState({
    paidamount: '',
    paiddate: '',
    method: '',
    note: ''
  });
  const [transactions, setTransactions] = useState([]);
  const [showAlert, setShowAlert] = useState(false);
  const [emails, setEmails] = useState([]);
  const [bccEmails, setBccEmails] = useState([]);
  const [content, setContent] = useState(``);
  const [showModal, setShowModal] = useState(false);
  const [showEmailAlert, setShowEmailAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [ownerData, setOwnerData] = useState(null);
  const [signatureData, setsignatureData] = useState(null);


  const roundOff = (value) => {
    return Math.round(value * 100) / 100;
  };

  useEffect(() => {

    console.log("estimateid ===========", estimateid);
    if (!localStorage.getItem("authToken") || localStorage.getItem("isTeamMember") == "true") {
      navigate("/");
    }
    fetchsignupdata();
    if (estimateid) {
      fetchestimateData();
      fetchtransactiondata();
    }
  }, [estimateid])

  useEffect(() => {
    // console.log('Customer Email:', estimateData.customeremail);
    if (estimateData.customeremail) {
      setEmails([estimateData.customeremail]);
    }
  }, [estimateData.customeremail]);
  let navigate = useNavigate();

  const fetchestimateData = async () => {
    try {
      const userid = localStorage.getItem("userid");
      const authToken = localStorage.getItem('authToken');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/getestimatedata/${estimateid}`, {
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

        setestimateData(json);
        if (Array.isArray(json.items)) {
          setitems(json.items);
        }

        fetchOwnerData();

        if (json.isAddSignature || json.isCustomerSign) {
          // Wait for estimateData to be set before checking customer signature
          setTimeout(() => {

            checkCustomerSignature(json._id);
          }, 0);
        }
      }

    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }

  const checkCustomerSignature = async (estimateIdpass) => {
    if (!estimateIdpass) {
      console.error('Customer email is not defined');
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/checkcustomersignature/${encodeURIComponent(estimateIdpass)}`);
      const json = await response.json();
      console.log('Customer signature response:', json);
      if (response.ok && json.hasSignature) {
        setsignatureData(json.signatureData);
      } else {
        setsignatureData(null);
      }
    } catch (error) {
      console.error('Error fetching customer signature:', error);
    }
  };

  const fetchOwnerData = async () => {
    try {
      const ownerId = localStorage.getItem('userid');
      const authToken = localStorage.getItem('authToken');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/getownerdata/${ownerId}`, {
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
      } else {
        const json = await response.json();
        setOwnerData(json[0]); // Save all owner data
      }
    } catch (error) {
      console.error('Error fetching owner data:', error);
    }
  };

  const fetchtransactiondata = async () => {
    try {
      const userid = localStorage.getItem("userid");
      const authToken = localStorage.getItem('authToken');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/gettransactiondata/${estimateid}`, {
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

        // Check if the response contains paidamount
        if (Array.isArray(json)) {
          setTransactions(json);
          //   const totalPaidAmount = payments.reduce((total, payment) => total + payment.paidamount, 0);


        } else {
          console.error('Invalid data structure for transactions:', json);
        }
        setloading(false);
      }

    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }

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

        // if (Array.isArray(json)) {
        setsignupdata(json);
        // }
      }

    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }


  const formatCustomDate = (dateString) => {
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', options);
  };

  const handlePrintContent = async () => {
    const content = document.getElementById('invoiceContent1').innerHTML;
    const printWindow = window.open('', '_blank');
    printWindow.document.open();
    printWindow.document.write(`
    <html>
      <head>
        <title>Print Invoice</title>
        <style>
      
        .print-page{
          // width:80%;
          margin:auto
        }
        .adminborder{
        
          
          width:100%;
        }
        .row{
  
          width:100% !important;
          margin:auto;
        }
      .pt-30{
        padding-top:30px;
      }
      .pb-30{
        padding-bottom:30px;
      }
      .pb-90{
        padding-bottom: 66px;
        padding-top: 15px;
        padding-left: 10px;
        margin-top: 20px;
        margin-bottom: 30px;
      }

      .padding-20{
        padding-top:15px;
        padding-bottom:45px;
      }
        .col-6{
          width:50%;
          float:left
        }
        .col-md-6{
          width:50%;
          float:left
        }
        p, h1,h2,h3,h4,h5,h6 {
          margin:0
        }
        .clear{
          clear:both;
        }

        .invoice-contentcol-6{
          width:25% !important;
          float:left
        }

        .invoice-contentcol-2{
          width:25% !important;
          float:left;
        }
        
        .fw-bold{
          font-weight:bold;
        }

        .invoice-contentcol-12{
          width:100%;
        }

        .printcol-8{
          width:50%;
          float:left;
          text-align:right
        }
        .invoice-contentcol-8{
          width:50% !important;
          float:left;
          text-align:center;
        }

        .logoimage{
          width:50%;
        }

        .detailbg{
          background-color: #f0f3f4 !important;
        }

        .offset-8{
          width:25%;
        }

        .text-left{
          text-align:left;
        }

        .text-right{
          text-align:right;
        }

        .right{
          text-align:right;
        }

        .padding{
          padding:20px
        }

        .flex{
          display: flex;
          justify-content: end;
        }

        .m-right{
          margin-right:100px;
        }
        
        /* Adjustments for better PDF rendering */
        body {
          font-size: 14px;
        }
        .invoice-content {
          page-break-inside: avoid;
        }
        .page-not-break {
          page-break-before: auto;
          page-break-after: auto;
          page-break-inside: avoid;
          reak-before: auto;
          break-after: auto;
          break-inside: avoid;
        }
        .invoice-price .invoice-price-right {
          width: 30%;
          background: #f0f3f4;
          color: black;
          border: 2px solid #f0f3f4;
          font-size: 28px;
          text-align: right;
          vertical-align: bottom;
          font-weight: 300;
          position: relative;
          right: 38px;
          padding: 28px 12px 16px;
        }
        .invoice-price .invoice-price-right span {
          display: block;
          font-weight: 400;
        }
        .invoice-price .invoice-price-right text-sm {
          display: block;
          opacity: .7;
          position: absolute;
          top: 10px;
          left: 12px;
          font-size: 18px;
        }
        
        @media only screen and (max-width: 575.98px) {
              .invoice-price .invoice-price-right {
                  right: 18px;
              }
        
              .invoice-price-right{
                width: 290px !important;
                display: block !important;
              }
          }
        .invoice-price {
          /* background: #f0f3f4; */
          display: table;
          width: 100%;
        }
        .invoice-price .invoice-price-left, .invoice-price .invoice-price-right {
          display: table-cell;
          font-size: 20px;
          font-weight: 600;
          width: 70%;
          position: relative;
          vertical-align: middle;
        }
        .print {
          margin-top: 10px;
            max-width: 28cm;
            zoom: 0.8;
            box-shadow: 0 0 0.5cm rgba(0, 0, 0, 0.2);
            margin-right: auto;
            margin-left: auto;
            background: white !important;
            flex-direction: row; justify-content: space-between; margin-bottom: 10px;
        }
        .invoice-header {
          background: #f0f3f4;
          padding: 25px 50px;
        }
        @media print {
          body {
            -webkit-print-color-adjust: exact;
          }
          .invoice-header {
            background: #f0f3f4;
            padding: 25px 50px;
          }
          @page {
            /* Hide header and footer */
            margin: 0;
          }
          @page :first {
            /* Hide header on first page */
            header {
              display: none;
            }
          }
          @page {
            /* Hide footer on all pages */
            footer {
              display: none;
            }
          }
}
        .invoice-body {
          background: #fff;
          padding: 30px 50px;
        }
          

        .invoice-body-text{
          width: 100%;
          height: auto;
        }
        .information-content {
          height: auto;
          overflow: hidden;
        }

        .information-content img {
          width: 50%;
          max-width: 100%;
          height: auto;
        }
        .invoice-to {
          // padding-right: 20px;
        }
        .invoice-date {
          /* text-align: right; */
          // padding-left: 15px;
        }
        .table{
          width: 100%;
    margin-bottom: 1rem;
    color: #212529;
    vertical-align: top;
    border-color: #dee2e6;
        }
        .table>thead {
    vertical-align: bottom;
        border-color: inherit;
    border-style: solid;
    border-width: 0;
}

.col-12 {
  width: 100%;
}
thead{
  text-align:left;
}
.text-end {
  text-align: right;
}
        .invoice-table{
          padding: 20px 38px 10px;
        }
        .text-md-end {
          text-align: right;
        }
        .clr {
          clear: both;
        }
        .col-md-6{
          width:50%;
          float: left;
        }
        .row {
    --bs-gutter-x: 1.5rem;
    --bs-gutter-y: 0;
    display: flex;
    flex-wrap: wrap;
    margin-top: calc(-1* var(--bs-gutter-y));
    margin-right: calc(-.5* var(--bs-gutter-x));
    margin-left: calc(-.5* var(--bs-gutter-x));
}
        
        .invoice-content {
          padding: 00px 38px 10px;
        }


        </style>
      </head>
      <body>
        <div className="print-page">
          ${content}
        </div>
      </body>
    </html>
  `);
    printWindow.document.close();
    await timeout(1000);
    printWindow.print();
  };
  function timeout(delay) {
    return new Promise(res => setTimeout(res, delay));
  }

  const handleEditContent = (estimateData) => {
    setselectedinvoices(estimateData);
    let estimateid = estimateData._id;
    console.log(estimateid);
    navigate('/userpanel/Editestimate', { state: { estimateid } });
  };

  const handleRemove = async (estimateid, estimateIdpass) => {
    // Show confirmation dialog
    const confirmDelete = window.confirm('Are you sure you want to delete this invoice?');

    // If the user cancels, stop execution
    if (!confirmDelete) {
      console.log('Invoice deletion cancelled by the user.');
      return;
    }

    try {
      // Check if there's a customer signature
      const signatureData = await checkCustomerSignature(estimateIdpass);

      // If a signature exists, delete it
      if (signatureData) {
        const authToken = localStorage.getItem('authToken');
        const deleteSignatureResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/delcustomersignature/${encodeURIComponent(estimateIdpass)}`, {
          method: 'DELETE',
          headers: {
            'Authorization': authToken,
          }
        });

        if (!deleteSignatureResponse.ok) {
          const json = await deleteSignatureResponse.json();
          console.error('Error deleting customer signature:', json.message);
          return; // Stop further execution if deleting signature fails
        } else {
          console.log('Customer signature deleted successfully!');
        }
      }

      // Proceed with deleting the estimate data
      const authToken = localStorage.getItem('authToken');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/delestimatedata/${estimateid}`, {
        method: 'GET',
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
      } else {
        const json = await response.json();

        if (json.success) {
          console.log('Data removed successfully!');
          navigate('/userpanel/Userdashboard');
        } else {
          console.error('Error deleting invoice:', json.message);
        }
      }

    } catch (error) {
      console.error('Error deleting invoice:', error);
    }
  };

  // const handleRemove = async (estimateid) => {
  //   try {
  //     const authToken = localStorage.getItem('authToken');
  //     const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/delestimatedata/${estimateid}`, {
  //       method: 'GET',
  //       headers: {
  //         'Authorization': authToken,
  //       }
  //     });

  //     if (response.status === 401) {
  //       const json = await response.json();
  //       setAlertMessage(json.message);
  //       setloading(false);
  //       window.scrollTo(0, 0);
  //       return; // Stop further execution
  //     }
  //     else {
  //       const json = await response.json();

  //       if (json.success) {
  //         console.log('Data removed successfully!');
  //         navigate('/userpanel/Userdashboard');
  //       } else {
  //         console.error('Error deleting Invoice:', json.message);
  //       }
  //     }


  //   } catch (error) {
  //     console.error('Error deleting Invoice:', error);
  //   }
  // };

  // Function to handle changes in email input
  const handleEmailChange = (newEmails) => {
    setEmails(newEmails);
  };

  // Handler function to update the list of "BCC" emails
  const handleBccEmailsChange = (newEmails) => {
    setBccEmails(newEmails);
  };

  const handleContentChange = (event) => {
    setContent(event.target.value);
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    const contentAsPdf = await generatePdfFromHtml();
    const authToken = localStorage.getItem('authToken');
    const userid = estimateData.userid;

    // console.log(userEmail, "userEmail ============");
    try {
      const finalContent = content.trim() || ``; // If content is empty, use default value
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/send-estimate-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authToken,
        },
        body: JSON.stringify({
          to: emails,
          bcc: bccEmails,
          content: finalContent,
          companyName: signupdata.companyname,
          customdate: formatCustomDate(estimateData.date),
          // duedate: formatCustomDate(estimateData.duedate),
          EstimateNumber: estimateData.EstimateNumber,
          currencyType: signupdata.CurrencyType,
          amountdue: estimateData.amountdue,
          amountdue1: estimateData.total - transactions.reduce((total, payment) => total + payment.paidamount, 0),
          pdfAttachment: contentAsPdf,
          estimateId: estimateData._id,
          ownerId: ownerData.ownerId,
        }),
      });

      if (response.ok) {
        console.log('Email sent successfully!');
        // setShowModal(false);
        setShowEmailAlert(true);
        // Update the database with emailsent status
        const updatedData = { ...estimateData, status: 'Send', emailsent: 'yes' }; // Update emailsent status
        await fetch(`${import.meta.env.VITE_API_BASE_URL}/updateestimateData/${estimateid}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': authToken,
          },
          body: JSON.stringify(updatedData),
        });

        // Check if customer signature already exists
        const checkResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/checkcustomersignature/${encodeURIComponent(estimateData._id)}`);
        const checkJson = await checkResponse.json();

        if (checkResponse.ok && !checkJson.hasSignature) {
          // Create new customer signature only if it doesn't exist
          await fetch(`${import.meta.env.VITE_API_BASE_URL}/customersignature`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              // 'Authorization': authToken,
            },
            body: JSON.stringify({
              estimateId: estimateData._id,
              userid,
              // ownerEmail:ownerData.email,
              // ownerId:ownerData.ownerId,
              customerName: estimateData.customername,
              customerEmail: estimateData.customeremail,
              customersign: "",
              documentNumber: estimateData.EstimateNumber,
              lastupdated: '',
              completeButtonVisible: false,
            }),
          });
        }

        // Fetch updated invoice data
        fetchestimateData();
      } else {
        console.error('Failed to send email.');
      }
    } catch (error) {
      console.error('Error sending email:', error);
    }
  };
  const handleAlertClose = () => {
    setShowEmailAlert(false); // Close the alert
  };

  const convertToPdf = () => {
    const content = document.getElementById('invoiceContent').innerHTML;
    const opt = {
      filename: `${estimateData.EstimateNumber}.pdf`,
      html2canvas: { scale: 3, useCORS: true },
      enableLinks: true,
      image: { type: 'jpeg', quality: 0.98 },
      margin: 0.2,
      jsPDF: {
        unit: 'in',
        format: 'A4',
        orientation: 'portrait'
      },
      userUnit: 450 / 210
    };
    html2pdf().from(content).set(opt).save();
  };


  const generatePdfFromHtml = async () => {
    return new Promise((resolve, reject) => {
      const content = document.getElementById('invoiceContent').innerHTML;
      const opt = {
        margin: 0.2,
        filename: 'myfile.pdf',
        html2canvas: { scale: 3, useCORS: true }, // Increase scale for better resolution
        jsPDF: { unit: 'in', format: 'A4', orientation: 'portrait' },
        userUnit: 450 / 210
      };

      html2pdf().from(content).set(opt).toPdf().get('pdf').then(function (pdf) {
        // pdf.setSelectableText(true);
        const pdfAsDataUri = pdf.output('datauristring', 'pdf');
        resolve(pdfAsDataUri);
      }).catch(function (error) {
        reject(error);
      });
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
          <div className='w-full bg-gray-50 min-h-screen'>
            <div className="flex flex-col md:flex-row">
              <Sidebar />
              <div className="flex-1 w-full mx-auto px-4 py-8 max-w-7xl">

                {/* Header */}
                <div className='flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4'>
                  <div>
                    <h1 className='text-3xl font-semibold mb-2'>Estimate Detail</h1>
                    <nav aria-label="breadcrumb">
                      <ol className="flex text-sm text-gray-600 space-x-2">
                        <li><a href="/Userpanel/Userdashboard" className='hover:text-blue-600 transition-colors'>Dashboard</a></li>
                        <li>/</li>
                        <li className="text-gray-400">Estimate detail</li>
                      </ol>
                    </nav>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="dropdown">
                      <button className="btn dropdown-toggle no-arrow" type="button" id="dropdownMenuButton" data-bs-toggle="dropdown" aria-expanded="false">
                        <i className="fa-solid fa-ellipsis px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors" ></i>
                      </button>
                      <ul className="dropdown-menu shadow-lg rounded-lg border-0" aria-labelledby="dropdownMenuButton">
                        <li><a className="dropdown-item py-2" onClick={handlePrintContent}>Print</a></li>
                        <li><a className="dropdown-item py-2" onClick={() => handleEditContent(estimateData)}>Edit</a></li>
                        <li><a className="dropdown-item py-2" onClick={convertToPdf}>Pdf</a></li>
                        <li><a className="dropdown-item py-2 text-red-600 hover:text-red-700" onClick={() => handleRemove(estimateData._id, estimateData.customeremail)}>Remove</a></li>
                      </ul>
                    </div>
                    <button className='btn btn-primary px-6' data-bs-toggle="modal" data-bs-target="#sendEmailModal">Send</button>
                  </div>
                </div>

                {/* Alerts */}
                <div className='mb-4'>
                  {alertMessage && <Alertauthtoken message={alertMessage} onClose={() => setAlertMessage('')} />}
                  {showAlert && (
                    <div className="alert alert-warning flex items-center shadow-sm" role="alert">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 mr-3 flex-shrink-0" viewBox="0 0 16 16" role="img" aria-label="Warning:">
                        <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" />
                      </svg>
                      <div>You cannot edit a document that has already been partially paid. Please create a new document.</div>
                      <button type="button" className="btn-close ms-auto" onClick={() => setShowAlert("")}></button>
                    </div>
                  )}
                  {showEmailAlert && (
                    <div className="alert alert-success flex items-center shadow-sm" role="alert">
                      <div className="flex-1 text-green-800">Email sent successfully!</div>
                      <button type="button" className="btn-close" aria-label="Close" onClick={handleAlertClose}></button>
                    </div>
                  )}
                </div>

                {/* Hidden Template for PDF Printing (Preserved exactly as original) */}
                <div className="page" style={{ display: 'none' }} id='invoiceContent'>
                  <div className="header ps pb-0" >
                    {signupdata.companyImageUrl !== "" ?
                      <img src={signupdata.companyImageUrl} style={{ height: '85px' }} className='logoimage' alt="" /> :
                      <p className='text-xl font-semibold font-semibold'>{signupdata.companyname}</p>
                    }
                    <div className="company-info fs12">
                      <h1 className='m-0 ' style={{ fontSize: '26px' }}>Estimate</h1>
                      <p className='m-0'><strong>{signupdata.companyname}</strong></p>
                      <p className='m-0'>{signupdata.address}</p>
                      {signupdata.city ? JSON.parse(signupdata.city).name + ',' : ' '}
                      {signupdata.state ? JSON.parse(signupdata.state).name : ' '}
                      <div className=''>{signupdata.state ? JSON.parse(signupdata.country).name : ' '}</div>
                      <div ><a className='text-decoration-none' href={`mailto:${signupdata.email}`}>{signupdata.email}</a></div>
                      <div ><a className='text-decoration-none' href={`${signupdata.website}`}>{signupdata.website}</a></div>
                      <div>
                        {signupdata.gstNumber == ''
                          ?
                          ""
                          :
                          `${signupdata.TaxName} ${signupdata.gstNumber}`
                        }
                      </div>
                    </div>
                  </div>

                  <div className="invoice-details fs12 ps py-2 bg-light no-split">
                    <div>
                      <p className='m-0 text-green'><strong>Prepared For</strong></p>
                      <p className='m-0'> {estimateData.customername}</p>
                      <p className='m-0'>{estimateData.customeremail}</p>
                      <p className='m-0'>{
                        estimateData.customerphone == '' || estimateData.customerphone == '0' ? '' : estimateData.customerphone}</p>
                    </div>
                    <div>
                      <p className='m-0 text-green'><strong>Estimate #:</strong> {estimateData.EstimateNumber}</p>
                      <p className='m-0 text-green'><strong>Date:</strong> {formatCustomDate(estimateData.date)}</p>
                      {
                        estimateData.job == "" || estimateData.job == null
                          ?
                          ""
                          :
                          <p className='m-0'><strong className='text-green'>Job:</strong> {estimateData.job}</p>
                      }
                    </div>
                  </div>
                  <div className='ps pb-0'>
                    <table className='fs12'>
                      <thead className='border-b border-borderLight'>
                        <tr>
                          <th width="40%" className='text-green text-left'>Item</th>
                          <th className='text-green  d-md-table-cell' width="15%">Quantity</th>
                          <th className='text-green  d-md-table-cell' width="15%" >Unit</th>
                          <th className='text-green  d-md-table-cell' width="15%">Price</th>
                          <th className='text-green d-md-table-cell' width="15%" style={{ textAlign: 'right' }}>Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((item) => (
                          <tr className='border-b border-borderLight' key={item._id}>
                            <td className='  d-md-table-cell' width="15%">
                              <div>
                                <span><strong>{item.itemname}</strong></span>
                                <div dangerouslySetInnerHTML={{ __html: item.description }} />
                              </div>
                            </td>
                            <td className='e d-md-table-cell' width="15%">{item.itemquantity}</td>
                            <td className=' d-md-table-cell' width="15%">{item.unit}</td>
                            <td className=' d-md-table-cell' width="15%">{roundOff(item.price).toLocaleString('en-CA')}</td>
                            <td className=' d-md-table-cell text-right' width="15%">{roundOff(item.amount).toLocaleString('en-CA')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="totals ps no-split">
                    <table className='fs12'>
                      <tr>
                        <td className='text-right'>Subtotal:</td>
                        <td style={{ textAlign: 'right' }}><CurrencySign />{roundOff(estimateData.subtotal).toLocaleString('en-CA')}</td>
                      </tr>

                      {
                        estimateData.discountTotal > 0
                          ?
                          <tr>
                            <td className='text-right' width="22%">Discount</td>
                            <td className='text-right' width="22%"><CurrencySign />{roundOff(estimateData.discountTotal).toLocaleString('en-CA')}</td>
                          </tr>
                          :
                          null
                      }

                      {
                        signupdata.taxPercentage == 0
                          ?
                          <tr></tr>
                          :
                          <tr>
                            <td className='text-right' width="22%">
                              {signupdata.TaxName} ({signupdata.taxPercentage}%)

                            </td>
                            <td className='text-right' width="22%"><CurrencySign />{roundOff(estimateData.tax).toLocaleString('en-CA')}</td>
                          </tr>
                      }


                      <tr>
                        <td className='text-right'>Total</td>
                        <td style={{ textAlign: 'right' }}><CurrencySign />{roundOff(estimateData.total).toLocaleString('en-CA')}</td>
                      </tr>

                      {transactions.map((transaction) => (
                        <tr key={transaction._id}>
                          <td className='text-md-end' width="100%">{transaction.method == "deposit" ? "Deposit" : "Paid"} on {formatCustomDate(transaction.paiddate)}</td>
                          <td className='text-right' width="100%" style={{ borderBottom: '1px solid #ddd' }}><CurrencySign />{transaction.paidamount.toLocaleString('en-CA')}</td>
                        </tr>
                      ))}
                    </table>


                  </div>



                  <div className='ps text-right' >
                    <p className='text-right'> <span className='p-6 text-green' style={{ background: '#f0f3f4' }} >Estimate Total: <strong><CurrencySign />{roundOff(estimateData.total - transactions.reduce((total, payment) => total + payment.paidamount, 0)).toLocaleString('en-CA')}</strong></span></p>
                  </div>



                  {estimateData.isAddSignature || estimateData.isCustomerSign ?
                    <div className="invoice-body no-split">
                      <p>By signing this document, the customer agrees to the services and conditions described in this document.</p>
                      <div className="flex flex-col md:flex-row">
                        {ownerData && estimateData.isAddSignature && (
                          <div className="col-6">
                            <div className="my-2">
                              <div>
                                <p className='text-center font-semibold '>{ownerData.companyname}</p>
                                <img src={ownerData.data} alt="Saved Signature" style={{ width: "100%" }} /><hr />
                                <p className='text-center'>{formatCustomDate(estimateData.createdAt)}</p>
                              </div>
                            </div>
                          </div>
                        )}
                        <div className="col-6">
                          <div className="my-2">
                            <div>
                              <p className='text-center font-semibold'>{estimateData.customername}</p>
                              {signatureData != null ?
                                signatureData.customersign == '' ? ('') :
                                  (<div className="signature-section">
                                    <img src={`${signatureData.customersign}`} alt="Customer Signature" style={{ width: "100%" }} /><hr />
                                    <p className='text-center'>{formatCustomDate(signatureData.createdAt)}</p>
                                  </div>) : ''}

                            </div>
                          </div>
                        </div>
                      </div>

                    </div> : ''
                  }

                </div>

                {/* Main UI Detail View */}
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Left Side: Document Details */}
                  <div className="w-full lg:w-3/4">
                    <div className="card-standard border-0 shadow-sm rounded-xl overflow-hidden" id="invoiceContent1">
                      {/* Top Header Info */}
                      <div className="bg-white p-8 border-b border-gray-100">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                          <div className="w-full md:w-1/2">
                            {signupdata.companyImageUrl !== "" ?
                              <img src={signupdata.companyImageUrl} className='h-20 object-contain' alt="Company Logo" /> :
                              <p className='text-3xl font-bold text-gray-800'>{signupdata.companyname}</p>
                            }
                          </div>
                          <div className="w-full md:w-1/2 md:text-right">
                            <h1 className="text-4xl font-bold text-gray-900 mb-2">Estimate</h1>
                            <div className="text-gray-600 leading-relaxed">
                              <strong className="text-gray-800 block mb-1">{signupdata.companyname}</strong>
                              <div>{signupdata.address}</div>
                              <div>
                                {signupdata.city ? JSON.parse(signupdata.city).name + ',' : ''} {signupdata.state ? JSON.parse(signupdata.state).name : ''}
                              </div>
                              <div>{signupdata.email}</div>
                              <div>{signupdata.website}</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Bill To & Meta Section */}
                      <div className="bg-gray-50/50 p-8 border-b border-gray-100">
                        <div className="flex flex-col md:flex-row justify-between gap-8">
                          <div className="w-full md:w-1/2">
                            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Bill To</h3>
                            <div className="text-gray-800 font-medium text-lg mb-1">{estimateData.customername}</div>
                            <div className="text-gray-600 leading-relaxed">
                              <div>{estimateData.customeremail}</div>
                              <div>{estimateData.customerphone || ''}</div>
                            </div>
                          </div>
                          <div className="w-full md:w-1/2">
                            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                              <div className="flex justify-between items-center mb-2 pb-2 border-b border-gray-50">
                                <span className="text-gray-500">Estimate #</span>
                                <span className="font-semibold text-gray-800">{estimateData.EstimateNumber}</span>
                              </div>
                              <div className="flex justify-between items-center mb-2 pb-2 border-b border-gray-50">
                                <span className="text-gray-500">Date</span>
                                <span className="font-medium text-gray-800">{formatCustomDate(estimateData.date)}</span>
                              </div>
                              {estimateData.job && (
                                <div className="flex justify-between items-center">
                                  <span className="text-gray-500">Job</span>
                                  <span className="font-medium text-gray-800">{estimateData.job}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Line Items */}
                      <div className="p-4 md:p-8">
                        {/* Desktop Table View */}
                        <div className="hidden md:block overflow-x-auto">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="bg-gray-50/80 border-y border-gray-100">
                                <th className="py-4 px-4 text-sm font-semibold text-gray-600">Item</th>
                                <th className="py-4 px-4 text-sm font-semibold text-gray-600 text-center w-24">Quantity</th>
                                <th className="py-4 px-4 text-sm font-semibold text-gray-600 text-right w-24">Unit</th>
                                <th className="py-4 px-4 text-sm font-semibold text-gray-600 text-right w-32">Price</th>
                                <th className="py-4 px-4 text-sm font-semibold text-gray-600 text-right w-32">Amount</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                              {items.map((item) => (
                                <tr key={item._id} className="hover:bg-gray-50/50 transition-colors">
                                  <td className="py-4 px-4">
                                    <div className="font-semibold text-gray-800 mb-1">{item.itemname}</div>
                                    <div className="text-sm text-gray-500" dangerouslySetInnerHTML={{ __html: item.description }} />
                                  </td>
                                  <td className="py-4 px-4 text-center text-gray-700">{item.itemquantity}</td>
                                  <td className="py-4 px-4 text-right text-gray-700">{item.unit}</td>
                                  <td className="py-4 px-4 text-right text-gray-700"><CurrencySign />{roundOff(item.price)}</td>
                                  <td className="py-4 px-4 text-right font-medium text-gray-800"><CurrencySign />{roundOff(item.amount)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {/* Mobile Card View */}
                        <div className="block md:hidden space-y-4">
                          {items.map((item) => (
                            <div key={item._id} className="bg-white border border-gray-100 rounded-lg p-4 shadow-sm">
                              <div className="font-semibold text-gray-800 mb-2">{item.itemname}</div>
                              <div className="text-sm text-gray-500 mb-3" dangerouslySetInnerHTML={{ __html: item.description }} />
                              <div className="flex justify-between items-center py-2 border-t border-gray-50">
                                <span className="text-gray-500 text-sm">Qty</span>
                                <span className="text-gray-800 font-medium">{item.itemquantity} {item.unit}</span>
                              </div>
                              <div className="flex justify-between items-center py-2 border-t border-gray-50">
                                <span className="text-gray-500 text-sm">Price</span>
                                <span className="text-gray-800"><CurrencySign />{roundOff(item.price)}</span>
                              </div>
                              <div className="flex justify-between items-center py-2 border-t border-gray-50">
                                <span className="text-gray-500 font-medium">Amount</span>
                                <span className="text-gray-900 font-bold"><CurrencySign />{roundOff(item.amount)}</span>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Totals Box */}
                        <div className="flex justify-end mt-8 pt-6 border-t border-gray-100">
                          <div className="w-full sm:w-2/3 md:w-1/2 lg:w-1/3">
                            <div className="space-y-3">
                              <div className="flex justify-between text-gray-600">
                                <span>Subtotal</span>
                                <span><CurrencySign />{roundOff(estimateData.subtotal)}</span>
                              </div>
                              {estimateData.tax > 0 && (
                                <div className="flex justify-between text-gray-600">
                                  <span>{signupdata.TaxName} ({signupdata.taxPercentage}%)</span>
                                  <span><CurrencySign />{roundOff(estimateData.tax)}</span>
                                </div>
                              )}
                              {estimateData.discountTotal > 0 && (
                                <div className="flex justify-between text-gray-600">
                                  <span>Discount</span>
                                  <span><CurrencySign />{roundOff(estimateData.discountTotal)}</span>
                                </div>
                              )}
                              <div className="flex justify-between text-lg font-bold text-gray-900 pt-3 border-t border-gray-200">
                                <span>Total</span>
                                <span><CurrencySign />{roundOff(estimateData.total)}</span>
                              </div>
                              {transactions.map((transaction) => (
                                <div key={transaction._id} className="flex justify-between text-sm text-green-600 pt-2 border-t border-gray-100">
                                  <span>{transaction.method == "deposit" ? "Deposit" : "Paid"} on {formatCustomDate(transaction.paiddate)}</span>
                                  <span><CurrencySign />{transaction.paidamount}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Notes and Signatures */}
                      <div className="p-8 bg-gray-50/30 border-t border-gray-100">
                        {estimateData.information && (
                          <div className="mb-8">
                            <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Note</h4>
                            <div className="text-gray-700 bg-white p-4 rounded-lg border border-gray-100 shadow-sm" dangerouslySetInnerHTML={{ __html: estimateData.information }} />
                          </div>
                        )}

                        {(estimateData.isAddSignature || estimateData.isCustomerSign) && (
                          <div>
                            <p className="text-gray-500 text-sm mb-6">By signing this document, the customer agrees to the services and conditions described in this document.</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                              {ownerData && estimateData.isAddSignature && (
                                <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
                                  <p className='text-center font-semibold text-gray-800 mb-4'>{ownerData.companyname}</p>
                                  <div className="h-24 flex items-center justify-center mb-4 border-b border-dashed border-gray-300">
                                    <img src={ownerData.data} alt="Saved Signature" className="max-h-full max-w-full object-contain" />
                                  </div>
                                  <p className='text-center text-sm text-gray-500'>{formatCustomDate(estimateData.createdAt)}</p>
                                </div>
                              )}
                              <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
                                <p className='text-center font-semibold text-gray-800 mb-4'>{estimateData.customername}</p>
                                <div className="h-24 flex items-center justify-center mb-4 border-b border-dashed border-gray-300">
                                  {signatureData && signatureData.customersign !== '' ? (
                                    <img src={`${signatureData.customersign}`} alt="Customer Signature" className="max-h-full max-w-full object-contain" />
                                  ) : (
                                    <span className="text-gray-300 text-sm italic">Pending Signature</span>
                                  )}
                                </div>
                                <p className='text-center text-sm text-gray-500'>
                                  {signatureData && signatureData.customersign !== '' ? formatCustomDate(signatureData.createdAt) : '-'}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Side: Status/Summary Sidebar */}
                  <div className="w-full lg:w-1/4">
                    <div className='card-standard p-6 rounded-xl shadow-sm border border-gray-100 sticky top-6'>
                      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Summary</h3>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                          <span className="text-gray-600">Total</span>
                          <span className="font-semibold text-gray-900"><CurrencySign />{estimateData.total}</span>
                        </div>
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <div className="text-sm text-blue-800 mb-1">Amount Due</div>
                          <div className="text-2xl font-bold text-blue-900">
                            <CurrencySign />{roundOff(estimateData.total - transactions.reduce((total, payment) => total + payment.paidamount, 0))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
      }

      {/* email model  */}
      <div className="modal fade" id="sendEmailModal" tabindex="-1" ref={modalRef} aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title text-2xl font-semibold" id="exampleModalLabel">Send document</h1>
              <button type="button" className="btn-close" id="closebutton" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleFormSubmit}>
                <div className="row mb-6">
                  <label for="to" className="col-sm-2 col-form-label">To</label>
                  <div className="col-sm-10">
                    {/* <input type="text" className="form-control" id="to" name="to" value={invoiceData.customeremail}/> */}
                    <ReactMultiEmail
                      emails={emails}
                      onChange={handleEmailChange}
                      getLabel={(
                        email,
                        index,
                        removeEmail
                      ) => (
                        <div data-tag="true" key={index}>
                          {email}
                          <span
                            data-tag-handle="true"
                            onClick={() => removeEmail(index)}
                          >
                            ×
                          </span>
                        </div>
                      )}
                      placeholder="Add more people..."
                      style={{
                        input: { width: '90%' },
                        emailsContainer: { border: '1px solid #ccc' },
                        emailInput: { backgroundColor: 'lightblue' },
                        invalidEmailInput: { backgroundColor: '#f9cfd0' },
                        container: { marginTop: '20px' },
                      }}

                    />
                  </div>
                </div>
                <div className="row mb-6">
                  <label for="bcc" className="col-sm-2 col-form-label">Bcc</label>
                  <div className="col-sm-10">
                    <ReactMultiEmail
                      emails={bccEmails}
                      onChange={handleBccEmailsChange}
                      getLabel={(
                        email,
                        index,
                        removeEmail
                      ) => (
                        <div data-tag="true" key={index}>
                          {email}
                          <span
                            data-tag-handle="true"
                            onClick={() => removeEmail(index)}
                          >
                            ×
                          </span>
                        </div>
                      )}
                      placeholder="Add BCC recipients..."
                      style={{
                        input: { width: '90%' },
                        emailsContainer: { border: '1px solid #ccc' },
                        emailInput: { backgroundColor: 'lightblue' },
                        invalidEmailInput: { backgroundColor: '#f9cfd0' },
                        container: { marginTop: '20px' },
                      }}
                    />
                  </div>
                </div>
                <div className="mb-3">
                  <label for="content" className="form-label">Content</label>
                  <textarea className="form-control" id="content" name="content" rows="5" defaultValue={content} onChange={handleContentChange}></textarea>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                  <button type="submit" className="btn btn-primary" data-bs-dismiss="modal">Send</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
