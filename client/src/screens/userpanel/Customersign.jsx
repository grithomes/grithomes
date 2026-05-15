import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ColorRing } from 'react-loader-spinner'
import CurrencySign from '../../components/CurrencySign ';
import SignatureModal from '../../components/SignatureModal';
import html2pdf from 'html2pdf.js';

const Customersign = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const estimateId = searchParams.get('estimateId');
  const [estimateData, setEstimateData] = useState(null);
  const signatureButtonRef = useRef(null);
  const [loading, setloading] = useState(true);
  const [error, setError] = useState(null);
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
  const [transactions, setTransactions] = useState([]);
  const [items, setitems] = useState([]);
  const [ownerData, setOwnerData] = useState(null);
  const [signatureData, setsignatureData] = useState(null);
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [isCompleteButtonVisible, setIsCompleteButtonVisible] = useState(false);
  const [showGoToSignButton, setShowGoToSignButton] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const shouldShowButton = showGoToSignButton && scrollPosition < window.innerHeight;
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    if (!estimateId) {
      setError('Invalid Estimate ID');
      setloading(false);
      return;
    }
    fetchEstimateData();
    // fetchsignupdata();
    // fetchtransactiondata();
  }, [estimateId]);
  // useEffect(() => {
  //   fetchEstimateData();
  //   fetchsignupdata();
  //   fetchtransactiondata();
  // }, [estimateId]);

  useEffect(() => {
    if (estimateData) {
      fetchsignupdata();
      fetchtransactiondata();
      fetchOwnerData();


      if (estimateData.isAddSignature || estimateData.isCustomerSign) {
        checkCustomerSignature(estimateData._id);
      }
    }
  }, [estimateData]);

  useEffect(() => {
    const checkPageHeight = () => {
      if (window.innerHeight > 500) {
        setShowGoToSignButton(true);
      } else {
        setShowGoToSignButton(false);
      }
    };

    // Check page height on initial render
    checkPageHeight();

    // Add event listener for window resize and scroll
    window.addEventListener('resize', checkPageHeight);
    window.addEventListener('scroll', handleScroll);

    // Cleanup event listeners on component unmount
    return () => {
      window.removeEventListener('resize', checkPageHeight);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

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

  const handlePrintContent = async () => {
    const content = document.getElementById('invoiceContent').innerHTML;
    const printWindow = window.open('', '_blank');
    printWindow.document.open();
    printWindow.document.write(`
    <html>
      <head>
        <title>Print Estimate</title>
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

        .txt-center{
          text-align:left !important;
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

.center{
  text-align:center;
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

        .margin-top-sign{
          margin-top:20px
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

  const fetchEstimateData = async () => {
    try {
      // const userid = localStorage.getItem("userid");
      // const authToken = localStorage.getItem('authToken');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/getemailestimatedata/${estimateId}`, {
        // headers: {
        //   'Authorization': authToken,
        // }
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


        setEstimateData(json);
        // fetchsignupdata();
        // fetchtransactiondata();
        //   fetchOwnerData(); 

        if (json.isAddSignature || json.isCustomerSign) {
          // Wait for estimateData to be set before checking customer signature
          setTimeout(() => {
            checkCustomerSignature(json._id);
          }, 0);
        }
        if (Array.isArray(json.items)) {
          setitems(json.items);
        }
        setloading(false);
      }

    } catch (error) {
      console.error('Error fetching data:', error);
      setloading(false);
    }
  }

  const fetchsignupdata = async () => {
    try {
      const userId = estimateData.userid;  // localStorage.getItem("userid");
      // const userid =   localStorage.getItem("userid");
      // const authToken = localStorage.getItem('authToken');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/getemailsignupdata/${userId}`, {
        // headers: {
        //   'Authorization': authToken,
        // }
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

  const fetchtransactiondata = async () => {
    try {
      // const userid = localStorage.getItem("userid");
      // const authToken = localStorage.getItem('authToken');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/getemailtransactiondata/${estimateId}`, {
        // headers: {
        //   'Authorization': authToken,
        // }
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
          setloading(false);
          //   const totalPaidAmount = payments.reduce((total, payment) => total + payment.paidamount, 0);
        } else {
          console.error('Invalid data structure for transactions:', json);
        }
      }

    } catch (error) {
      console.error('Error fetching data:', error);
      setloading(false);
    }
  }

  const fetchOwnerData = async () => {
    try {
      const ownerId = estimateData.userid;
      // const ownerId = localStorage.getItem('userid');
      // const authToken = localStorage.getItem('authToken');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/getemailownerdata/${ownerId}`, {
        // headers: {
        //   'Authorization': authToken,
        // }
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
      setloading(false);
    }
  };

  const checkCustomerSignature = async (estimateIdpass) => {
    if (!estimateIdpass) {
      console.error('Customer estimateId is not defined');
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/checkcustomersignature/${encodeURIComponent(estimateIdpass)}`);
      const json = await response.json();
      console.log('Customer signature response:', json);
      console.log('Customer signature response:', response.ok);
      if (response.ok && json.hasSignature) {
        setsignatureData(json.signatureData);
      } else {
        setsignatureData(null);
      }
    } catch (error) {
      console.error('Error fetching customer signature:', error);
    }
  };

  const handleSignatureClick = async () => {
    setIsSignatureModalOpen(true);


    try {
      // Check if customer signature already exists
      const checkResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/checkcustomersignature/${encodeURIComponent(estimateData._id)}`);
      const checkJson = await checkResponse.json();

      if (checkJson.hasSignature) {
        // Update the existing customer signature
        const updateResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/updatecustomersignature/${encodeURIComponent(estimateData._id)}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            // 'Authorization': authToken,
          },
          body: JSON.stringify({
            lastupdated: 'Viewed' || '',
          }),
        });

        // if (updateResponse.ok) {
        //   alert('Signature updated successfully');
        //   // checkCustomerSignature();
        // } else {
        //   alert('Error updating signature');
        // }
      } else {
        console.error('Error saving signature:', error);
      }
    } catch (error) {
      console.error('Error saving signature:', error);
      // alert('Error saving signature');
    } finally {
      // setIsSignatureModalOpen(false);
    }
  };

  const handleSaveSignature = async (signatureData) => {

    const authToken = localStorage.getItem('authToken');
    const userEmail = estimateData.userid;
    const ownerId = estimateData.userid;

    try {
      // Check if customer signature already exists
      const checkResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/checkcustomersignature/${encodeURIComponent(estimateData._id)}`);
      const checkJson = await checkResponse.json();

      // if (checkJson.ok) {
      // Update the existing customer signature
      const updateResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/updatecustomersignature/${encodeURIComponent(estimateData._id)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': authToken,
        },

        body: JSON.stringify({
          customersign: signatureData,
          estimateId: estimateId,
          userid: estimateData?.userid || '',
          customerName: estimateData?.customername || '',
          customerEmail: estimateData?.customeremail || '',
          documentNumber: estimateData?.EstimateNumber || '',
          lastupdated: 'Signed' || '',
          status: 'Signed',
          completeButtonVisible: true,
        }),
      });

      if (updateResponse.ok) {
        alert('Signature updated successfully');
        checkCustomerSignature(estimateId);
        setIsCompleteButtonVisible(true)
      } else {
        alert('Error updating signature');
      }
      // } else {
      //   console.error('Error saving signature:', error);
      // }
    } catch (error) {
      console.error('Error saving signature:', error);
      alert('Error saving signature');
    } finally {
      // checkCustomerSignature();
      // setsignatureData(signatureData);
      setIsSignatureModalOpen(false);
    }
  };

  const handleGoToSignClick = () => {
    if (signatureButtonRef.current) {
      signatureButtonRef.current.scrollIntoView({ behavior: 'smooth' });
      // setShowGoToSignButton(false);
    }
  };

  useEffect(() => {
    const onScroll = () => setOffset(window.scrollY);
    // clean up code
    window.removeEventListener('scroll', onScroll);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  console.log(offset);
  const handleScroll = () => {
    setScrollPosition(window.pageYOffset);
    if (signatureButtonRef.current) {
      const { top } = signatureButtonRef.current.getBoundingClientRect();
      if (top < window.innerHeight && top > 0) {
        // User has reached the target element
        setShowGoToSignButton(false);
      } else {
        // User is not at the target element
        setShowGoToSignButton(true);
      }
    }
  };


  const roundOff = (value) => {
    return Math.round(value * 100) / 100;
  };

  const formatCustomDate = (dateString) => {
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', options);
  };

  // const handleDocumentComplete = () => {
  //   navigate(`/completedocument?estimateId=${estimateId}`); // Navigate to the new page
  // };

  const handleDocumentComplete = async () => {
    try {
      const ownerEmail = ownerData.email; // Fetch the owner email from ownerData
      if (!ownerEmail) {
        console.error('Owner email not found');
        return;
      }

      // Send email request to backend
      const emailResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/send-estimate-signed-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: ownerEmail,
          estimateId: estimateData._id,
          ownerId: ownerData.ownerId,
          documentNumber: signatureData.documentNumber,
          customerName: signatureData.customerName,
        }),
      });

      if (!emailResponse.ok) {
        console.error('Failed to send email');
        return;
      }

      console.log('Email sent successfully');// Update customer signature
      const updateResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/updatecustomersignature/${encodeURIComponent(estimateData._id)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': authToken, // Uncomment if authToken is required
        },
        body: JSON.stringify({
          customersign: signatureData.customersign,
          estimateId: estimateId,
          userid: estimateData?.userid || '',
          customerName: estimateData?.customername || '',
          customerEmail: estimateData?.customeremail || '',
          documentNumber: estimateData?.EstimateNumber || '',
          lastupdated: 'Completed' || '',
          status: 'Signed',
        }),
      });

      if (!updateResponse.ok) {
        console.error('Failed to update customer signature');
        return;
      }

      console.log('Customer signature updated successfully');
      navigate(`/completedocument?estimateId=${estimateId}`);

    } catch (error) {
      console.error('Error in handleDocumentComplete:', error);
    }
  };

  return (

    <div className='min-h-screen bg-gray-50/50 py-8'>
      {
        loading ?
          <div className='flex justify-center items-center min-h-[400px]'>
            <ColorRing
              loading={loading}
              display="flex"
              justify-content="center"
              align-items="center"
              aria-label="Loading Spinner"
              data-testid="loader"
            />
          </div> :
          <div className='max-w-5xl mx-auto px-4'>
            <div className="flex flex-col">
              <div className='flex justify-between items-center mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-100'>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">Review Document</h1>
                  <p className="text-sm text-gray-500 mt-1">Please review and sign the document below</p>
                </div>
                <div className='flex gap-3'>
                  <button className='flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium text-sm shadow-sm' onClick={handlePrintContent}>
                    <i className="fa-solid fa-print"></i>
                    <span>Print PDF</span>
                  </button>
                  {signatureData != null && signatureData.completeButtonVisible ? (
                    <button className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium shadow-sm" onClick={handleDocumentComplete}>
                      <i className="fa-solid fa-check"></i>
                      Complete
                    </button>
                  ) : null}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-2 md:p-8 overflow-hidden mb-8">
                <div className="w-full overflow-x-auto">
                  <div className='print min-w-[800px]' id='invoiceContent'>
                    <div className="invoice-body">
                      <div className="flex flex-col md:flex-row justify-between">
                        <div className='w-full md:w-1/2 mb-6 md:mb-0 pt-4'>
                          {signupdata != null ? signupdata.companyImageUrl != "" && signupdata.companyImageUrl != undefined && signupdata.companyImageUrl != null ?
                            <img src={signupdata.companyImageUrl} className='w-1/2 max-w-[200px] object-contain' alt="Company Logo" /> :
                            <p className='text-2xl font-bold text-gray-800'>{signupdata.companyname}</p>
                            : ""
                          }
                        </div>
                        <div className='w-full md:w-1/2 text-left md:text-right'>
                          <h2 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">ESTIMATE</h2>
                          <div className='text-gray-700'>
                            <strong className="text-gray-900 block text-lg mb-2">{signupdata != null ? signupdata.companyname : ""}</strong>
                            <address className='not-italic text-sm leading-relaxed'>
                              <div className='mb-2'>
                                <div>{signupdata.address}</div>
                                {signupdata.city ? JSON.parse(signupdata.city).name + ', ' : ''}
                                {signupdata.state ? JSON.parse(signupdata.state).name : ''}
                              </div>
                              <div>{signupdata.email}</div>
                              <div>{signupdata.website}</div>
                              {signupdata.gstNumber && (
                                <div className="mt-1 font-medium">
                                  {`${signupdata.TaxName} ${signupdata.gstNumber}`}
                                </div>
                              )}
                            </address>
                          </div>
                        </div>
                      </div>
                      <div className="clr"></div>
                    </div>

                    <div className='invoice-header !bg-gray-50 border-y border-gray-100'>
                      <div className="flex flex-col md:flex-row justify-between">
                        <div className='invoice-to w-full md:w-1/2 mb-4 md:mb-0'>
                          <strong className="text-gray-500 text-xs uppercase tracking-wider mb-2 block">Bill To</strong>
                          <div className='text-lg font-bold text-gray-900 mb-1'>
                            {estimateData?.customername || ''}
                          </div>
                          <address className='not-italic text-sm text-gray-600 leading-relaxed'>
                            <div>{estimateData?.customeremail || ''}</div>
                            <div>{estimateData?.customerphone || ''}</div>
                          </address>
                        </div>
                        <div className='invoice-date w-full md:w-1/2 text-left md:text-right'>
                          <div className='grid grid-cols-2 gap-x-4 gap-y-2 max-w-[300px] md:ml-auto'>
                            <div className='text-gray-500 text-sm font-medium'>Estimate #</div>
                            <div className='text-gray-900 font-bold'>{estimateData?.EstimateNumber || ''}</div>

                            <div className='text-gray-500 text-sm font-medium'>Date</div>
                            <div className='text-gray-900 font-medium'>{formatCustomDate(estimateData?.date || '')}</div>

                            {estimateData?.job && (
                              <>
                                <div className='text-gray-500 text-sm font-medium'>Job</div>
                                <div className='text-gray-900 font-medium'>{estimateData.job}</div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="clr"></div>
                    </div>

                    <div className='invoice-table'>
                      <div className='table-responsive'>
                        <table className='w-full text-left border-collapse'>
                          <thead>
                            <tr className='border-b-2 border-gray-200'>
                              <th className='py-4 font-bold text-gray-700'>Item</th>
                              <th className='py-4 font-bold text-gray-700 text-center d-none d-md-table-cell' width="15%">Qty</th>
                              <th className='py-4 font-bold text-gray-700 text-right d-none d-md-table-cell' width="15%">Price</th>
                              <th className='py-4 font-bold text-gray-700 text-right' width="15%">Amount</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {items.map((item) => (
                              <tr key={item._id} className="group">
                                <td className="py-4">
                                  <div>
                                    <span className="font-semibold text-gray-900 block mb-1">{item.itemname}</span>
                                    <div className="text-sm text-gray-500 prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: item.description }} />
                                  </div>
                                </td>
                                <td className="py-4 text-center text-gray-700 d-none d-md-table-cell">{item.itemquantity}</td>
                                <td className="py-4 text-right text-gray-700 d-none d-md-table-cell"><CurrencySign />{roundOff(item.price)}</td>
                                <td className='py-4 text-right font-medium text-gray-900'><CurrencySign />{roundOff(item.amount)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div className="flex flex-col md:flex-row mt-6">
                        <div className='w-full'>
                          <table className='w-full md:w-1/2 ml-auto text-sm'>
                            <tbody>
                              <tr>
                                <td className='py-2 text-gray-600 text-right pr-4'>Subtotal</td>
                                <td className='py-2 text-right font-medium text-gray-900' width="120px"><CurrencySign />{roundOff(estimateData?.subtotal || '')}</td>
                              </tr>

                              {estimateData.tax > 0 && (
                                <tr>
                                  <td className='py-2 text-gray-600 text-right pr-4'>{signupdata.TaxName} ({signupdata.taxPercentage}%)</td>
                                  <td className='py-2 text-right font-medium text-gray-900'><CurrencySign />{roundOff(estimateData.tax)}</td>
                                </tr>
                              )}

                              {estimateData.discountTotal > 0 && (
                                <tr>
                                  <td className='py-2 text-gray-600 text-right pr-4'>Discount</td>
                                  <td className='py-2 text-right font-medium text-green-600'>-<CurrencySign />{roundOff(estimateData.discountTotal)}</td>
                                </tr>
                              )}

                              <tr className="border-t border-b border-gray-200">
                                <td className='py-3 text-gray-900 font-bold text-right pr-4 text-base'>Total</td>
                                <td className='py-3 text-right font-bold text-gray-900 text-base'><CurrencySign />{roundOff(estimateData.total)}</td>
                              </tr>

                              {transactions.map((transaction) => (
                                <tr key={transaction._id}>
                                  <td className='py-2 text-gray-500 text-right pr-4 italic text-xs'>
                                    {transaction.method == "deposit" ? "Deposit" : "Paid"} on {formatCustomDate(transaction.paiddate)}
                                  </td>
                                  <td className='py-2 text-right font-medium text-gray-500'>-<CurrencySign />{transaction.paidamount}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                      <div className="clr"></div>
                    </div>

                    <div className='invoice-price page-not-break !bg-gray-800 text-white p-6 mt-4 rounded-lg flex items-center justify-between'>
                      <div className='invoice-price-left'>
                        <span className="text-gray-300 text-sm uppercase tracking-wider block mb-1">Amount Due</span>
                      </div>
                      <div className='invoice-price-right'>
                        <span className="text-3xl font-bold"><CurrencySign />{roundOff(estimateData.total - transactions.reduce((total, payment) => total + payment.paidamount, 0))}</span>
                      </div>
                    </div>

                    {estimateData.isAddSignature || estimateData.isCustomerSign ?
                      <div className="invoice-body margin-top-sign pt-8 border-t border-gray-100 mt-8">
                        <p className="text-sm text-gray-500 italic text-center mb-8 bg-gray-50 py-3 rounded-lg">By signing this document, the customer agrees to the services and conditions described in this document.</p>
                        <div className="flex flex-wrap -mx-4">
                          <div className="w-1/2 px-4 border-r border-gray-100">
                            {ownerData && (
                              <div className="text-center px-4">
                                <p className='font-bold text-gray-800 mb-4 text-lg'>{ownerData.companyname}</p>
                                <div className="h-24 flex items-center justify-center mb-2 border-b-2 border-gray-300 relative">
                                  <img src={ownerData.data} alt="Saved Signature" className="max-h-full max-w-full object-contain mix-blend-multiply" />
                                </div>
                                <p className='text-gray-500 text-sm font-medium'>{formatCustomDate(estimateData.createdAt)}</p>
                              </div>
                            )}
                          </div>
                          <div className="w-1/2 px-4">
                            <div className="text-center px-4">
                              <p className='font-bold text-gray-800 mb-4 text-lg'>{estimateData.customername}</p>
                              {signatureData != null ?
                                signatureData.customersign == '' ? (
                                  <div className="h-24 flex items-end justify-center mb-2 border-b-2 border-gray-300 pb-2">
                                    <button className="px-6 py-2 bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors rounded-lg font-medium shadow-sm" ref={signatureButtonRef} onClick={() => handleSignatureClick()}>
                                      <i className="fa-solid fa-pen-nib mr-2"></i>Click to Sign
                                    </button>
                                  </div>
                                ) : (
                                  <div className="signature-section">
                                    <div className="h-24 flex items-center justify-center mb-2 border-b-2 border-gray-300 relative">
                                      <img src={`${signatureData.customersign}`} alt="Customer Signature" className="max-h-full max-w-full object-contain mix-blend-multiply" />
                                    </div>
                                    <p className='text-gray-500 text-sm font-medium'>{formatCustomDate(signatureData.createdAt)}</p>
                                  </div>
                                )
                                : (
                                  <div className="h-24 flex items-end justify-center mb-2 border-b-2 border-gray-300 pb-2"></div>
                                )
                              }
                            </div>
                          </div>
                        </div>
                      </div> : ''
                    }
                    {isSignatureModalOpen.toString() == "true" && (
                      <SignatureModal
                        onSave={handleSaveSignature}
                        onClose={() => setIsSignatureModalOpen(false)}
                      />
                    )}

                    {estimateData.information && (
                      <div className='mt-8 pt-6 border-t border-gray-100'>
                        <span className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-2">Note:</span>
                        <div className='prose prose-sm max-w-none text-gray-600' dangerouslySetInnerHTML={{ __html: estimateData.information }} />
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
};

export default Customersign;
