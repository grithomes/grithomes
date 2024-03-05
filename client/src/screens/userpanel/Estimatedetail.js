import React,{useState,useEffect,useRef } from 'react'
import {useNavigate,useLocation} from 'react-router-dom'
import { ColorRing } from  'react-loader-spinner'
import Usernav from './Usernav';
import Usernavbar from './Usernavbar';
import { ReactMultiEmail } from 'react-multi-email';
import 'react-multi-email/dist/style.css'
import html2pdf from 'html2pdf.js';
import CurrencySign from '../../components/CurrencySign ';

export default function Estimatedetail() {
    const [ loading, setloading ] = useState(true);
    const [signupdata, setsignupdata] = useState([]);
    const modalRef = useRef(null);
    const [items, setitems] = useState([]);
    const location = useLocation();
    const [selectedinvoices, setselectedinvoices] = useState(null);
    const [estimateData, setestimateData] = useState({
        customername: '',itemname: '',customeremail: '',EstimateNumber: '',purchaseorder: '',
        date: '',description: '',itemquantity: '', price: '',discount: '',
        amount: '',tax: '',taxpercentage:'',subtotal: '',total: '',amountdue: '',information: '',
    });
    
    const estimateid = location.state?.estimateid;
    const [transactionData, setTransactionData] = useState({
        paidamount: '',
        paiddate: '',
        method: '',
        note:''
      });
      const [transactions, setTransactions] = useState([]);
      const [showAlert, setShowAlert] = useState(false);
      const [emails, setEmails] = useState([]);
      const [bccEmails, setBccEmails] = useState([]);
      const [content, setContent] = useState('Thank you for your business.');
      const [showModal, setShowModal] = useState(false);
      const [showEmailAlert, setShowEmailAlert] = useState(false);


    useEffect(() => {
        if(!localStorage.getItem("authToken") || localStorage.getItem("isTeamMember") == "true")
        {
          navigate("/");
        }
        fetchsignupdata();
        if (estimateid) {
            fetchestimateData();
            fetchtransactiondata();
        }
    }, [estimateid])

    useEffect(() => {
      console.log('Customer Email:', estimateData.customeremail);
      if (estimateData.customeremail) {
        setEmails([estimateData.customeremail]);
      }
    }, [estimateData.customeremail]);
    let navigate = useNavigate();

    const fetchestimateData = async () => {
        try {
            const userid =  localStorage.getItem("userid");
            const response = await fetch(`https://mycabinet.onrender.com/api/getestimatedata/${estimateid}`);
            const json = await response.json();
            
            setestimateData(json);
            if (Array.isArray(json.items)) {
                setitems(json.items);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }

    const fetchtransactiondata = async () => {
        try {
            const userid =  localStorage.getItem("userid");
            const response = await fetch(`https://mycabinet.onrender.com/api/gettransactiondata/${estimateid}`);
            const json = await response.json();

            // Check if the response contains paidamount
            if (Array.isArray(json)) {
      setTransactions(json);
    //   const totalPaidAmount = payments.reduce((total, payment) => total + payment.paidamount, 0);


    } else {
      console.error('Invalid data structure for transactions:', json);
    }
    setloading(false);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }

    const fetchsignupdata = async () => {
        try {
            const userid =  localStorage.getItem("userid");
            const response = await fetch(`https://mycabinet.onrender.com/api/getsignupdata/${userid}`);
            const json = await response.json();
            
            // if (Array.isArray(json)) {
                setsignupdata(json);
            // }
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
  const content = document.getElementById('invoiceContent').innerHTML;
  const printWindow = window.open('', '_blank');
  printWindow.document.open();
  printWindow.document.write(`
    <html>
      <head>
        <title>Print Invoice</title>
        <style>
      //   @media print {
      //    .row {
      //         background-color: #1a4567 !important;
      //         print-color-adjust: exact; 
      //     }
      // }
      
        .print-page{
          width:80%;
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
        // .printcol-2{
        //   width:25%;
        //   text-align:right
        // }
        .invoice-contentcol-8{
          width:50% !important;
          float:left;
          text-align:center;
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

        .logoimage{
          width:25%;
        }

        </style>
      </head>
      <body>
        <div class="print-page">
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
  return new Promise( res => setTimeout(res, delay) );
}

const handleEditContent = (estimateData) => {
        setselectedinvoices(estimateData);
        let estimateid = estimateData._id;
        console.log(estimateid);
        navigate('/userpanel/Editestimate', { state: { estimateid } });
};

const handleRemove = async (estimateid) => {
    try {
      const response = await fetch(`https://mycabinet.onrender.com/api/delestimatedata/${estimateid}`, {
        method: 'GET'
      });
  
      const json = await response.json();
  
      if (json.success) {
        console.log('Data removed successfully!');
        navigate('/userpanel/Userdashboard');
      } else {
        console.error('Error deleting Invoice:', json.message);
      }
    } catch (error) {
      console.error('Error deleting Invoice:', error);
    }
  };

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
      try {
        const finalContent = content.trim() || 'Thank you for your business.'; // If content is empty, use default value
        const response = await fetch('https://mycabinet.onrender.com/api/send-estimate-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
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
          }),
        });
  
        if (response.ok) {
          console.log('Email sent successfully!');
          // setShowModal(false);
          setShowEmailAlert(true);
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
  
    const generatePdfFromHtml = async () => {
    return new Promise((resolve, reject) => {
      const content = document.getElementById('invoiceContent').innerHTML;
  const opt = {
    filename:     'myfile.pdf',
    html2canvas:  { scale: 3 }, // Increase scale for better resolution
    jsPDF:        { unit: 'in', format: 'A4', orientation: 'portrait' },
    userUnit: 450 / 210 
  };
  
  html2pdf().from(content).set(opt).toPdf().get('pdf').then(function(pdf) {
    // pdf.setSelectableText(true);
    const pdfAsDataUri = pdf.output('datauristring', 'pdf');
    resolve(pdfAsDataUri);
  }).catch(function(error) {
    reject(error);
  });
    });
  };

  return (
    <div className='bg'>
    {
    loading?
    <div className='row'>
      <ColorRing
    // width={200}
    loading={loading}
    // size={500}
    display="flex"
    justify-content= "center"
    align-items="center"
    aria-label="Loading Spinner"
    data-testid="loader"        
  />
    </div>:
        <div className='container-fluid'>
            <div className="row">
                <div className='col-lg-2 col-md-3 vh-100 b-shadow bg-white d-lg-block d-md-block d-none'>
                    <div  >
                    <Usernavbar/>
                    </div>
                </div>

                <div className="col-lg-10 col-md-9 col-12 mx-auto">
                    <div className='d-lg-none d-md-none d-block mt-2'>
                        <Usernav/>
                    </div>
                    <div className='mx-3'>
                        <form>
                        <div className='row py-4 px-2 breadcrumbclr'>
                            <div className="col-lg-6 col-md-6 col-sm-6 col-7 me-auto">
                                <p className='fs-35 fw-bold'>Estimate</p>
                                <nav aria-label="breadcrumb">
                                    <ol class="breadcrumb mb-0">
                                        <li class="breadcrumb-item"><a href="/Userpanel/Userdashboard" className='txtclr text-decoration-none'>Dashboard</a></li>
                                        <li class="breadcrumb-item active" aria-current="page">Estimatedetail</li>
                                    </ol>
                                </nav>
                            </div>
                            <div className="col-lg-1 col-md-4 col-sm-4 col-3 text-right">
                                <div className="dropdown">
                                    <button
                                    className="btn dropdown-toggle no-arrow" // Updated class here
                                    type="button"
                                    id="dropdownMenuButton"
                                    data-bs-toggle="dropdown"
                                    aria-expanded="false"
                                    >
                                    <i className="fa-solid fa-ellipsis ellipse px-3 py-1" ></i>
                                    </button>
                                    <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton">
                                    

                                        <li><a className="dropdown-item" onClick={handlePrintContent}>Print</a></li>
                                        <li><a className="dropdown-item" onClick={ () => handleEditContent(estimateData)}>Edit</a></li>
                                        <li><a className="dropdown-item" onClick={() => handleRemove(estimateData._id)}>Remove</a></li>
                                    </ul>
                                </div>
                            
                            </div>
                            <div className="col-lg-1">
                              <a className='btn rounded-pill btn-danger text-white fw-bold' data-bs-toggle="modal" data-bs-target="#sendEmailModal">Send</a>
                            </div>
                        </div>
                        
                        {showAlert && (
                                <>
                                <div className="row">
                                    <div className="col-lg-7 col-sm-5 col-3"></div>
                                    <div className="col-9 col-sm-7 col-lg-5">
                                    <div class="alert alert-warning d-flex" role="alert">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="alertwidth bi bi-exclamation-triangle-fill flex-shrink-0 me-2" viewBox="0 0 16 16" role="img" aria-label="Warning:">
                                          <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
                                        </svg>
                                        <div>
                                        You cannot edit a document that has already been partially paid. Please create a new document.
                                        </div>
                                        <button type="button" class="btn-close" onClick={()=>{
                                            // setmessage(false);
                                            setShowAlert("");
                                          }}></button>

                                      </div>
                                </div>
                                    </div>
                                
                                </>
                                        
                                    )}
                        
                        <div className="row">
                            <div className="col-12 col-sm-12 col-md-12 col-lg-8" id="invoiceContent">
                                <div className='box1 rounded adminborder mb-5 pb-5'>
                                    <div className='row pt-30 py-5 px-3'>
                                        <div className="col-6">
                                          {signupdata.companyImageUrl !== "" ?
                                            <img src={signupdata.companyImageUrl} className='w-50 logoimage'  alt="testing imahe"  /> 
                                             :
                                            <p className='h4 fw-bold'>{signupdata.companyname}</p>
                                          }
                                            {/* <p className='h4 fw-bold'>{signupdata.companyname}</p> */}
                                        </div>    
                                        <div className="col-6">
                                            <div className="row text-end right">
                                                <p className='h4 fw-bold'>Estimate</p>
                                                <p className='fw-bold'>{signupdata.address}</p>
                                                <p className='fw-bold'>{signupdata.email}</p>
                                            </div>
                                        </div>   
                                        <div className='clear'></div> 
                                    </div>

                                    <div className='row py-4 pb-90 px-4 mx-0 mb-4 detailbg'>
                                        <div bgcolor="#333" className="col-12 col-lg-6 col-md-6 col-sm-6 customerdetail">
                                            <p className='fw-bold pt-3'>BILL TO</p>
                                            <p className='my-0'>{estimateData.customername}</p>
                                            <p className='my-0'>{estimateData.customeremail}</p>
                                        </div>
                                        <div className="col-12 col-lg-6 col-md-6 col-sm-6 text-md-end text-lg-end">
                                            <div className='row'>
                                              <div className='col-6  fw-bold'>
                                                  <p className='pt-3'>Invoice #</p>
                                                  <p className='my-0'>Date</p>
                                                  <p className='pt-3'>Job</p>
                                              </div>
                                              <div className='col-6'>
                                              <p className='pt-3'>{estimateData.EstimateNumber}</p>
                                              <p className='my-0'>{formatCustomDate(estimateData.date)}</p>
                                              <p className='pt-3'>{estimateData.job}</p>

                                              </div>
                                              
                                            </div>
                                            
                                           
                                        </div>
                                        
                                    </div>

                                        <div className="row pb-30 pt-1 fw-bold invoice-content">
                                            <div className="col-lg-5 col-md-5 col-sm-5 col-4 invoice-contentcol-6">
                                                <p>ITEM</p>
                                            </div>
                                            <div className="col-lg-3 col-md-3 col-sm-3 col-4 invoice-contentcol-6">
                                                <p>QUANTITY</p>
                                            </div>
                                            <div className="col-lg-2 col-md-2 col-sm-2 d-sm-block d-md-block d-lg-block d-none invoice-contentcol-6">
                                                <p>PRICE</p>
                                            </div>
                                            <div className="col-lg-2 col-md-2 col-sm-2 col-4 invoice-contentcol-6">
                                                <p>AMOUNT</p>
                                            </div>
                                        </div>
                                        <hr/>

                                        {items.map((item) => (
                                            <div className='row padding-20 invoice-content'  key={item._id}>
                                              <div className='col-lg-5 col-md-6 col-sm-5 col-4 invoice-contentcol-6'>
                                                  <p className='fw-bold my-0'>{item.itemname}</p>
                                                  {/* <p className='my-0 decwidth'>{item.description}</p> */}
                                              </div>
                                              <div className='col-lg-3 col-md-2 col-sm-3 col-3 invoice-contentcol-2'>
                                                  <p>{item.itemquantity}</p>
                                              </div>
                                              <div className='col-lg-2 col-md-2 col-sm-2 d-sm-block d-md-block d-lg-block d-none invoice-contentcol-2'>
                                                  <p><CurrencySign />{item.price}</p>
                                              </div>
                                              <div className='col-lg-2 col-md-2 col-sm-2 col-5 invoice-contentcol-2'>
                                                  <p><CurrencySign />{item.amount}</p>
                                              </div>
                                              <div className="col-lg-6 col-md-6 col-sm-2 col-4 invoice-contentcol-12">
                                                <p className='my-0 decwidth'>{item.description}</p>
                                              </div>
                                            </div>
                                        ))}
                                        <hr />

                                          <div className="row padding-20">
                                            <div className="col-lg-7 col-md-7 col-sm-6 col-4 printcol-8">
                                              <p className='d-none'>.</p>
                                            </div>
                                            <div className="col-lg-2 col-md-2 col-sm-3 col-4 invoice-contentcol-2">
                                                <p className='mb-2'>Subtotal</p>
                                            </div>
                                            <div className="col-lg-3 col-md-3 col-sm-3 col-4 invoice-contentcol-2">
                                                <p className='mb-2'><CurrencySign />{estimateData.subtotal}</p>
                                            </div>
                                          </div>
                                          <div className="row padding-20">
                                            <div className="col-lg-7 col-md-7 col-sm-6 col-4 printcol-8">
                                              <p className='d-none'>.</p>
                                            </div>
                                            <div className="col-lg-2 col-md-2 col-sm-3 col-4 invoice-contentcol-2">
                                                <p className='mb-2'>GST</p>
                                            </div>
                                            <div className="col-lg-3 col-md-3 col-sm-3 col-4 invoice-contentcol-2">
                                                <p className='mb-2'><CurrencySign />{estimateData.tax}</p>
                                            </div>
                                          </div>
                                            
                                            <div className="row flex">
                                              <div className="col-lg-4 col-sm-4 col-md-4 col-6 offset-6 offset-lg-7 offset-md-7 offset-sm-7 m-right">
                                                  <div className="mt-2 detailbg p-2 padding">
                                                      <p className='text-left'>Grand Total</p>
                                                      <p className='fs-5 text-end text-right'>
                                                          <CurrencySign />{estimateData.total}
                                                      </p>
                                                  </div>
                                              </div>
                                            </div>
                                </div>
                            </div>

                            <div className="col-12 col-sm-12 col-md-12 col-lg-4">
                                <div className='mb-2'>
                                  {showEmailAlert && (
                                      <div className="alert alert-success row" role="alert">
                                        <div className="col-11">
                                          <p className='mb-0'>Email sent successfully!</p>
                                        </div>
                                        <button type="button" className="btn-close" aria-label="Close" onClick={handleAlertClose}></button>
                                      </div>
                                    )}
                                </div>
                                <div className='box1 rounded adminborder px-4 py-4'>
                                    <div className="row">
                                            <div className="col-6">
                                                <p>Total</p>
                                            </div>
                                            <div className="col-6 text-end">
                                                <p><CurrencySign />{estimateData.total}</p>
                                               
                                            </div>

                                    </div><hr />
                                </div>
                            </div>
                            
                        </div>
                        

                        </form>
                    </div>
                </div>
            </div>
        </div>
}

{/* email model  */}
<div class="modal fade" id="sendEmailModal" tabindex="-1" ref={modalRef} aria-labelledby="exampleModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-lg">
        <div class="modal-content">
            <div class="modal-header">
                <h1 class="modal-title fs-4 fw-bold" id="exampleModalLabel">Send document</h1>
                <button type="button" class="btn-close" id="closebutton" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <form onSubmit={handleFormSubmit}>
                    <div class="row mb-3">
                        <label for="to" class="col-sm-2 col-form-label">To</label>
                        <div class="col-sm-10">
                            {/* <input type="text" class="form-control" id="to" name="to" value={invoiceData.customeremail}/> */}
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
                    <div class="row mb-3">
                        <label for="bcc" class="col-sm-2 col-form-label">Bcc</label>
                        <div class="col-sm-10">
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
                    <div class="mb-3">
                        <label for="content" class="form-label">Content</label>
                        <textarea class="form-control" id="content" name="content" rows="5" value={content} onChange={handleContentChange}></textarea>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        <button type="submit" class="btn btn-primary"  data-bs-dismiss="modal">Send</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>
    </div>
  )
}
