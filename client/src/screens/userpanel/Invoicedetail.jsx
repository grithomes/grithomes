import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ColorRing } from 'react-loader-spinner'

import Sidebar from './Sidebar';
// import 'react-multi-email/style.css';
import { ReactMultiEmail } from 'react-multi-email';
import 'react-multi-email/dist/style.css'
import html2pdf from 'html2pdf.js';
import CurrencySign from '../../components/CurrencySign ';
import Alertauthtoken from '../../components/Alertauthtoken';

export default function Invoicedetail() {
  const [loading, setloading] = useState(true);
  const [signupdata, setsignupdata] = useState([]);
  const [showSendEmailModal, setShowSendEmailModal] = useState(false);
  const modalRef = useRef(null);
  const modalRefemail = useRef(null);
  const [items, setitems] = useState([]);
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedinvoices, setselectedinvoices] = useState(null);
  const [invoiceData, setInvoiceData] = useState({
    customername: '', itemname: '', customeremail: '', customerphone: '', InvoiceNumber: '', purchaseorder: '',
    date: '', duedate: '', description: '', itemquantity: '', price: '', discount: '',
    amount: '', tax: '', taxpercentage: '', subtotal: '', total: '', amountdue: '', information: '',
  });
  const [editorData, setEditorData] = useState("<p></p>");
  const [paidamounterror, setpaidamounterror] = useState("");
  const [paiddateerror, setpaiddateerror] = useState("");
  const [methoderror, setmethoderror] = useState("");
  const [exceedpaymenterror, setexceedpaymenterror] = useState("");
  const invoiceid = location.state?.invoiceid;
  const [duedepositDate, setDueDepositDate] = useState('')
  const [savedDepositData, setsavedDepositData] = useState('')
  const [alertMessage, setAlertMessage] = useState('');
  const [transactionData, setTransactionData] = useState({
    paidamount: '',
    paiddate: '',
    method: '',
    note: ''
  });
  const [expenseTypes, setExpenseTypes] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [expenseTransactions, setExpenseTransactions] = useState([]);
  const [showAlert, setShowAlert] = useState(false);
  const [emails, setEmails] = useState([]);
  const [bccEmails, setBccEmails] = useState([]);
  const [content, setContent] = useState(``);
  const [showModal, setShowModal] = useState(false);
  const [showEmailAlert, setShowEmailAlert] = useState(false);
  const [depositpercentage, setdepositPercentage] = useState('');
  const [amount, setAmount] = useState('');
  const [pdfExportVisible, setPdfExportVisible] = useState(false);
  const [ownerData, setOwnerData] = useState(null);
  const [signatureData, setsignatureData] = useState(null);
  // const [signatureData, setsignatureData] = useState(null);
  const apiURL = `${import.meta.env.VITE_API_BASE_URL}/expense`;
  const expenseTypeURL = `${import.meta.env.VITE_API_BASE_URL}/expensetype`;
  const vendorURL = `${import.meta.env.VITE_API_BASE_URL}/vendor`;


  useEffect(() => {
    if (!localStorage.getItem("authToken") || localStorage.getItem("isTeamMember") == "true") {
      navigate("/");
    }
    fetchsignupdata();
    if (invoiceid) {
      fetchinvoicedata();
      fetchdepositdata();
      fetchtransactiondata();
      fetchExpensetransactiondata();
    }
  }, [invoiceid])

  useEffect(() => {
    console.log('Customer Email:', invoiceData.customeremail);
    if (invoiceData.customeremail) {
      setEmails([invoiceData.customeremail]);
    }
    fetchExpenseTypes()
    fetchVendors()
  }, [invoiceData.customeremail]);

  let navigate = useNavigate();

  const roundOff = (value) => {
    return Math.round(value * 100) / 100;
  };


  const fetchExpenseTypes = async () => {
    setloading(true);
    try {
      const response = await fetch(expenseTypeURL);
      const data = await response.json();
      setExpenseTypes(data);
    } catch (error) {
      console.error('Error fetching expense types:', error);
    } finally {
      setloading(false);
    }
  };

  // Fetch all vendors
  const fetchVendors = async () => {
    setloading(true);
    try {
      const response = await fetch(vendorURL);
      const data = await response.json();
      setVendors(data);
    } catch (error) {
      console.error('Error fetching vendors:', error);
    } finally {
      setloading(false);
    }
  };
  const getExpenseTypeName = (id) => {
    const expenseType = expenseTypes.find((type) => type._id === id);
    return expenseType ? expenseType.name : '-';
  };

  // Function to get Vendor name by ID
  const getVendorName = (id) => {
    const vendor = vendors.find((vendor) => vendor._id === id);
    return vendor ? vendor.name : '-';
  };

  const handlePercentageChange = (event) => {
    setdepositPercentage(event.target.value);
    calculateAmount(event.target.value);
  };

  const calculateAmount = (depositpercentage) => {
    let totalAmount = invoiceData.total - transactions.reduce((total, payment) => total + payment.paidamount, 0);
    let calculatedAmount = (totalAmount * depositpercentage) / 100;
    setAmount(calculatedAmount.toFixed(2));
  };


  const handleDateChange = (event) => {
    console.log(event.target.value, "event");

    setDueDepositDate(event.target.value);
  };

  const handleMarkDeposit = async () => {
    const userid = localStorage.getItem("userid");
    const authToken = localStorage.getItem('authToken');
    // Add logic to save the deposit in the database
    const depositAmount = parseFloat(savedDepositData.depositamount);
    if (depositAmount > 0) {
      const totalPaidAmount = transactions.reduce((total, payment) => total + payment.paidamount, 0);
      const newPaidAmount = totalPaidAmount + depositAmount;

      // Add the deposit transaction to the transactions array
      const newTransaction = {
        paidamount: newPaidAmount,
        paiddate: new Date().toISOString(), // Assuming current date as the paid date
        method: 'Deposit', // Assuming the deposit is made directly to the system
        note: 'Deposit', // Note for the deposit transaction
      };

      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/addpayment`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': authToken,
          },
          body: JSON.stringify({
            paidamount: depositAmount,
            paiddate: new Date().toISOString(),
            method: "deposit",
            note: "Deposit",
            userid: userid,
            invoiceid: invoiceid,
            depositid: savedDepositData._id,
          }),
        });

        if (response.status === 401) {
          const responseData = await response.json();
          setAlertMessage(responseData.message);
          setloading(false);
          window.scrollTo(0, 0);
          return; // Stop further execution
        }
        else {
          if (response.ok) {
            const responseData = await response.json();
            if (responseData.success) {
              setsavedDepositData('');
              const setamountDue = roundOff(invoiceData.total - transactions.reduce((total, payment) => total + payment.paidamount, 0) - responseData.transaction.paidamount)
              console.log("setamountDue Mark Depoist: ==============", setamountDue);


              const updatedData = {

                ...invoiceData,
                amountdue: setamountDue,
                status: `${setamountDue == 0
                  ?
                  "Paid"
                  :
                  "Partially Paid"
                  }`


              }; // Update emailsent status
              await fetch(`${import.meta.env.VITE_API_BASE_URL}/updateinvoicedata/${invoiceid}`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': authToken,
                },
                body: JSON.stringify(updatedData),
              });


              console.log('Payment added successfully!');
              // Fetch updated transaction data after payment addition
              await fetchtransactiondata();

              // Calculate total paid amount from transactions
              const totalPaidAmount = transactions.reduce((total, payment) => total + payment.paidamount, 0);

              // Update amount due by subtracting totalPaidAmount from total invoice amount
              const updatedAmountDue = invoiceData.total - totalPaidAmount;
              setInvoiceData({ ...invoiceData, amountdue: updatedAmountDue });

              // Close the modal after adding payment
              document.getElementById('closebutton').click();
              if (modalRef.current) {
                modalRef.current.hide();
              }
            } else {
              console.error('Failed to add payment.');
            }
          } else {
            console.error('Failed to add payment.');
          }
        }


      } catch (error) {
        console.error('Error adding payment:', error);
      }


      // Close the modal
      setShowModal(false);
    }
  };

  const handleSave = async () => {
    const userid = localStorage.getItem("userid");
    const authToken = localStorage.getItem('authToken');

    try {
      if ((savedDepositData != null || savedDepositData != "") && savedDepositData._id != undefined) {
        // If savedDepositData exists and has an ID, update the existing record
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/updatedeposit/${savedDepositData._id}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': authToken,
          },
          body: JSON.stringify({
            "depositamount": amount,
            "duedepositdate": duedepositDate,
            "depositpercentage": depositpercentage,
            "method": 'Pending',
            "userid": userid,
            "invoiceid": invoiceid,
          }),
        });

        if (response.status === 401) {
          const data = await response.json();
          setAlertMessage(data.message);
          setloading(false);
          window.scrollTo(0, 0);
          return; // Stop further execution
        }
        else {
          const data = await response.json();

          if (data.Success) {
            console.log('Deposit updated successfully:', data.deposit);
            const savedDepositResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/deposit/${data.deposit._id}`);
            const savedDepositDatad = await savedDepositResponse.json();
            setsavedDepositData(savedDepositDatad.deposit);
            // You may update the state here if required
          } else {
            console.error('Failed to update deposit:', data.error);
          }
        }


      } else {
        // If savedDepositData is empty or does not have an ID, add a new record
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/deposit`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': authToken,
          },
          body: JSON.stringify({
            "depositamount": amount,
            "duedepositdate": duedepositDate,
            "depositpercentage": depositpercentage,
            "method": 'Pending',
            "userid": userid,
            "invoiceid": invoiceid,
          }),
        });

        if (response.status === 401) {
          const data = await response.json();
          setAlertMessage(data.message);
          setloading(false);
          window.scrollTo(0, 0);
          return; // Stop further execution
        }
        else {
          const data = await response.json();
          if (data.success) {
            const savedDepositResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/deposit/${data.deposit._id}`, {
              headers: {
                'Authorization': authToken,
              }
            });
            if (response.status === 401) {
              const savedDepositDatad = await savedDepositResponse.json();
              setAlertMessage(savedDepositDatad.message);
              setloading(false);
              window.scrollTo(0, 0);
              return; // Stop further execution
            }
            else {
              const savedDepositDatad = await savedDepositResponse.json();
              setsavedDepositData(savedDepositDatad.deposit);
              console.log('New deposit added successfully:', data.deposit);
            }
          } else {
            console.error('Failed to add new deposit:', data.error);
          }
        }
      }
    } catch (error) {
      console.error('Error saving deposit:', error);
    }
  };

  const handleSaveAndSend = async () => {
    const userid = localStorage.getItem("userid");
    const authToken = localStorage.getItem('authToken');

    try {
      if ((savedDepositData != null || savedDepositData != "") && savedDepositData._id != undefined) {
        // If savedDepositData exists and has an ID, update the existing record
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/updatedeposit/${savedDepositData._id}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': authToken,
          },
          body: JSON.stringify({
            "depositamount": amount,
            "duedepositdate": duedepositDate,
            "depositpercentage": depositpercentage,
            "method": 'Pending',
            "userid": userid,
            "invoiceid": invoiceid,
          }),
        });

        if (response.status === 401) {
          const data = await response.json();
          setAlertMessage(data.message);
          setloading(false);
          window.scrollTo(0, 0);
          return; // Stop further execution
        }
        else {
          const data = await response.json();

          if (data.Success) {
            console.log('Deposit updated successfully:', data.deposit);
            const savedDepositResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/deposit/${data.deposit._id}`, {
              headers: {
                'Authorization': authToken,
              }
            });
            if (response.status === 401) {
              const savedDepositDatad = await savedDepositResponse.json();
              setAlertMessage(savedDepositDatad.message);
              setloading(false);
              window.scrollTo(0, 0);
              return; // Stop further execution
            }
            else {
              const savedDepositDatad = await savedDepositResponse.json();
              setsavedDepositData(savedDepositDatad.deposit);
              setShowSendEmailModal(true);
            }
          } else {
            console.error('Failed to update deposit:', data.error);
          }
        }
      } else {
        // If savedDepositData is empty or does not have an ID, add a new record
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/deposit`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': authToken,
          },
          body: JSON.stringify({
            "depositamount": amount,
            "duedepositdate": duedepositDate,
            "depositpercentage": depositpercentage,
            "method": 'Pending',
            "userid": userid,
            "invoiceid": invoiceid,
          }),
        });
        if (response.status === 401) {
          const data = await response.json();
          setAlertMessage(data.message);
          setloading(false);
          window.scrollTo(0, 0);
          return; // Stop further execution
        }
        else {
          const data = await response.json();
          if (data.success) {
            const savedDepositResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/deposit/${data.deposit._id}`, {
              headers: {
                'Authorization': authToken,
              }
            });
            if (response.status === 401) {
              const savedDepositDatad = await savedDepositResponse.json();
              setAlertMessage(savedDepositDatad.message);
              setloading(false);
              window.scrollTo(0, 0);
              return; // Stop further execution
            }
            else {
              const savedDepositDatad = await savedDepositResponse.json();
              setsavedDepositData(savedDepositDatad.deposit);
              console.log('New deposit added successfully:', data.deposit);
              setShowSendEmailModal(true);
            }
          } else {
            console.error('Failed to add new deposit:', data.error);
          }
        }


      }
    } catch (error) {
      console.error('Error saving deposit:', error);
    }
  };

  const handleEditModal = () => {

    const getEditData = savedDepositData;
    console.log(getEditData, "getEditData");
    setShowModal(true);
    setdepositPercentage(getEditData.depositpercentage)
    setAmount(getEditData.depositamount)
    setDueDepositDate(getEditData.duedepositdate)
  };


  const fetchinvoicedata = async () => {
    try {
      const userid = localStorage.getItem("userid");
      const authToken = localStorage.getItem('authToken');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/getinvoicedata/${invoiceid}`, {
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
        console.log("json:- >>>>", json);
        setInvoiceData(json);
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

  const checkCustomerSignature = async (invoiceIdpass) => {
    if (!invoiceIdpass) {
      console.error('Customer email is not defined');
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/checkcustomersignatureusinginvoice/${encodeURIComponent(invoiceIdpass)}`);
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

  const fetchdepositdata = async () => {
    try {
      const userid = localStorage.getItem("userid");
      const authToken = localStorage.getItem('authToken');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/getdepositdata/${userid}/${invoiceid}`, {
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
        setsavedDepositData(json);
      }

    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }

  const fetchtransactiondata = async () => {
    try {
      const userid = localStorage.getItem("userid");
      const authToken = localStorage.getItem('authToken');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/gettransactiondata/${invoiceid}`, {
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
    }
    catch (error) {
      console.error('Error fetching data:', error);
    }
  }

  const fetchExpensetransactiondata = async () => {
    try {
      const userid = localStorage.getItem("userid");
      const authToken = localStorage.getItem('authToken');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/expense/${invoiceid}`, {
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
          setExpenseTransactions(json);
          //   const totalPaidAmount = payments.reduce((total, payment) => total + payment.paidamount, 0);

          console.log(json, "Invoice 173");

        } else {
          console.error('Invalid data structure for transactions:', json);
        }
        setloading(false);
      }
    }
    catch (error) {
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
        console.log(signupdata);
        // }
      }

    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }

  const onchange = (event) => {
    setTransactionData({
      ...transactionData,
      [event.target.name]: event.target.value,
    });
  };

  const formatCustomDate = (dateString) => {
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', options);
  };

  const handleAddPayment = async () => {
    if (isSubmitting) return; // Prevent multiple clicks
    setIsSubmitting(true); // Set loading state

    // const invoiceid = 'your-invoice-id'; 
    const userid = localStorage.getItem("userid");
    const authToken = localStorage.getItem('authToken');
    // Check for errors
    if (transactionData.paidamount === '') {
      setpaidamounterror("Fill detail");
      setIsSubmitting(false);
      return; // Exit the function early if there's an error
    } else {
      setpaidamounterror(""); // Clear the error if the field is filled
    }

    if (transactionData.paiddate === '') {
      setpaiddateerror("Fill detail");
      setIsSubmitting(false);
      return;
    } else {
      setpaiddateerror("");
    }

    if (transactionData.method === '') {
      setmethoderror("Fill detail");
      setIsSubmitting(false);
      return;
    } else {
      setmethoderror("");
    }
    // Fetch updated transaction data after payment addition
    await fetchtransactiondata();


    // Calculate total paid amount from transactions
    // const totalPaidAmount = transactions.reduce((total, payment) => total + payment.paidamount, 0);
    const totalPaidAmount = transactions.reduce(
      (total, payment) => total + parseFloat(payment.paidamount),
      0
    );
    // Check if the paid amount exceeds the due amount
    const dueAmount = roundOff(invoiceData.total - totalPaidAmount);
    const paymentAmount = parseFloat(transactionData.paidamount);
    console.log(dueAmount, paymentAmount, "paymentAmountpaymentAmount");


    if (paymentAmount > dueAmount) {
      console.error('Payment amount exceeds the due amount.');
      setexceedpaymenterror("Payment amount exceeds the amount.");
      setIsSubmitting(false);
      return;
    } else {
      setexceedpaymenterror("");
    }
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/addpayment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authToken,
        },
        body: JSON.stringify({
          paidamount: transactionData.paidamount,
          paiddate: transactionData.paiddate,
          method: transactionData.method,
          note: transactionData.note,
          userid: userid,
          invoiceid: invoiceid,
        }),
      });

      if (response.status === 401) {
        const responseData = await response.json();
        fetchExpensetransactiondata();
        setAlertMessage(responseData.message);
        setloading(false);
        window.scrollTo(0, 0);
        return; // Stop further execution
      }
      else {
        if (response.ok) {
          const responseData = await response.json();
          if (responseData.success) {
            console.log(responseData, 'Payment added successfully!');
            console.log(roundOff(invoiceData.total - transactions.reduce((total, payment) => total + payment.paidamount, 0) - responseData.transaction.paidamount), 'invoiceData');
            // Fetch updated transaction data after payment addition

            const setamountDue = roundOff(invoiceData.total - transactions.reduce((total, payment) => total + payment.paidamount, 0) - responseData.transaction.paidamount)
            console.log("setamountDue: ==============", setamountDue);


            const updatedData = {

              ...invoiceData,
              amountdue: setamountDue,
              status: `${setamountDue == 0
                ?
                "Paid"
                :
                "Partially Paid"
                }`


            }; // Update emailsent status
            await fetch(`${import.meta.env.VITE_API_BASE_URL}/updateinvoicedata/${invoiceid}`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': authToken,
              },
              body: JSON.stringify(updatedData),
            });
            // Add new expense
            await fetch(`${import.meta.env.VITE_API_BASE_URL}/expense`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': authToken,
              },
              body: JSON.stringify({
                expenseDate: new Date().toISOString().split('T')[0], // Provide appropriate date here
                expenseType: null, // Specify the type of expense
                vendor: null, // Specify the vendor
                amount: transactionData.paidamount,
                description: '', // Add a description if needed
                paymentStatus: 'Paid',
                transactionType: 'Credit',
                receiptUrl: '', // If there's a receipt URL, provide it here
                invoiceId: invoiceData._id,
              }),
            });


            console.log(
              JSON.stringify({
                expenseDate: new Date().toISOString().split('T')[0], // Provide appropriate date here
                expenseType: null, // Specify the type of expense
                vendor: null, // Specify the vendor
                amount: transactionData.paidamount,
                description: '', // Add a description if needed
                paymentStatus: 'Paid',
                transactionType: 'Credit',
                receiptUrl: '', // If there's a receipt URL, provide it here
                invoiceId: invoiceData._id,
              }),
            );

            await fetchtransactiondata();

            // Calculate total paid amount from transactions
            const totalPaidAmount = transactions.reduce((total, payment) => total + payment.paidamount, 0);

            // Update amount due by subtracting totalPaidAmount from total invoice amount
            const updatedAmountDue = invoiceData.total - totalPaidAmount;
            setInvoiceData({ ...invoiceData, amountdue: updatedAmountDue });
            // Close the modal after adding payment
            document.getElementById('closebutton').click();
            if (modalRef.current) {
              modalRef.current.hide();
            }
          } else {
            console.error('Failed to add payment.');
          }
        } else {
          console.error('Failed to add payment.');
        }
      }


    } catch (error) {
      console.error('Error adding payment:', error);
    }
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

  const handleEditContent = (invoiceData) => {
    const totalPaidAmount = transactions.reduce((total, payment) => total + payment.paidamount, 0);

    if (totalPaidAmount === 0) {
      // If totalPaidAmount is 0, navigate to /userpanel/Createinvoice page
      setselectedinvoices(invoiceData);
      let invoiceid = invoiceData._id;
      console.log(invoiceid);
      navigate('/userpanel/Editinvoice', { state: { invoiceid } });
    } else {
      // If totalPaidAmount is not 0, show an alert
      setShowAlert(true);
    }
  };

  const handleDeleteTransClick = async (transactionid) => {
    try {
      const authToken = localStorage.getItem('authToken');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/deltransaction/${transactionid}`, {
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
      }
      else {
        const json = await response.json();
        if (json.Success) {
          console.log('Transaction removed successfully!');
          fetchtransactiondata();
        } else {
          console.error('Error deleting teammember:', json.message);
        }
      }
    } catch (error) {
      console.error('Error deleting teammember:', error);
    }
  };


  const handleRemove = async (invoiceid, invoiceIdpass) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this invoice?');

    // If the user cancels, stop execution
    if (!confirmDelete) {
      console.log('Invoice deletion cancelled by the user.');
      return;
    }
    try {
      // Check if there's a customer signature
      const signatureData = await checkCustomerSignature(invoiceIdpass);

      // If a signature exists, delete it
      if (signatureData) {
        const authToken = localStorage.getItem('authToken');
        const deleteSignatureResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/delcustomersignature/${encodeURIComponent(invoiceIdpass)}`, {
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
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/deldata/${invoiceid}`, {
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
          navigate('/userpanel/Invoice');
        } else {
          console.error('Error deleting Invoice:', json.message);
        }
      }

    } catch (error) {
      console.error('Error deleting Invoice:', error);
    }
  };

  // const handleRemove = async (invoiceid, invoiceIdpass) => {
  //   try {
  //     // Check if there's a customer signature
  //     const signatureData = await checkCustomerSignature(invoiceIdpass);

  //     // If a signature exists, delete it
  //     if (signatureData) {
  //       const authToken = localStorage.getItem('authToken');
  //       const deleteSignatureResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/delcustomersignature/${encodeURIComponent(invoiceIdpass)}`, {
  //         method: 'DELETE',
  //         headers: {
  //           'Authorization': authToken,
  //         }
  //       });

  //       if (!deleteSignatureResponse.ok) {
  //         const json = await deleteSignatureResponse.json();
  //         console.error('Error deleting customer signature:', json.message);
  //         return; // Stop further execution if deleting signature fails
  //       } else {
  //         console.log('Customer signature deleted successfully!');
  //       }
  //     }

  //     // Proceed with deleting the estimate data
  //     const authToken = localStorage.getItem('authToken');
  //     const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/deldata/${invoiceid}`, {
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
  //     } else {
  //       const json = await response.json();

  //       if (json.success) {
  //         console.log('Data removed successfully!');
  //         navigate('/userpanel/Invoice');
  //       } else {
  //         console.error('Error deleting Invoice:', json.message);
  //       }
  //     }

  //   } catch (error) {
  //     console.error('Error deleting Invoice:', error);
  //   }
  // };

  // const handleRemove = async (invoiceid,invoiceIdpass) => {
  //   const authToken = localStorage.getItem('authToken');
  //   try {
  //     const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/deldata/${invoiceid}`, {
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
  //         navigate('/userpanel/Invoice');
  //       } else {
  //         console.error('Error deleting Invoice:', json.message);
  //       }
  //     }
  //   } catch (error) {
  //     console.error('Error deleting Invoice:', error);
  //   }
  // };


  const getStatus = () => {
    if (transactions.length === 0) {
      return "Saved";
    }

    const totalPaidAmount = transactions.reduce(
      (total, payment) => total + parseFloat(payment.paidamount),
      0
    );

    if (totalPaidAmount === 0) {
      return "Saved";
    } else if (totalPaidAmount > 0 && totalPaidAmount < invoiceData.total) {
      return "Partially Paid";
    } else if (totalPaidAmount === invoiceData.total) {
      return "Paid";
    } else {
      return "Payment Pending";
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
    const authToken = localStorage.getItem('authToken');
    const contentAsPdf = await generatePdfFromHtml();
    const userid = invoiceData.userid;
    try {
      const finalContent = content.trim() || ``; // If content is empty, use default value
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/send-invoice-email`, {
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
          customdate: formatCustomDate(invoiceData.date),
          duedate: formatCustomDate(invoiceData.duedate),
          InvoiceNumber: invoiceData.InvoiceNumber,
          amountdue: invoiceData.amountdue,
          currencyType: signupdata.CurrencyType,
          amountdue1: invoiceData.total - transactions.reduce((total, payment) => total + payment.paidamount, 0),
          pdfAttachment: contentAsPdf,
          invoiceId: invoiceData._id,
          ownerId: ownerData.ownerId,
        }),
      });

      if (response.ok) {
        console.log(invoiceData, 'Email sent successfully!');
        // setShowModal(false);
        setShowEmailAlert(true);

        if (invoiceData.status == 'Paid' || invoiceData.status == 'Partially Paid') {
          const updatedData = { invoiceData }
          await fetch(`${import.meta.env.VITE_API_BASE_URL}/updateinvoicedata/${invoiceid}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': authToken,
            },
            body: JSON.stringify(updatedData),
          });
        } else {
          const updatedData = { ...invoiceData, status: 'Send', emailsent: 'yes' }
          await fetch(`${import.meta.env.VITE_API_BASE_URL}/updateinvoicedata/${invoiceid}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': authToken,
            },
            body: JSON.stringify(updatedData),
          });
        }
        // Check if customer signature already exists
        const checkResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/checkcustomersignatureusinginvoice/${encodeURIComponent(invoiceData._id)}`);
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
              invoiceId: invoiceData._id,
              userid,
              // ownerEmail:ownerData.email,
              // ownerId:ownerData.ownerId,
              status: 'Pending Signature',
              customerName: invoiceData.customername,
              customerEmail: invoiceData.customeremail,
              customersign: "",
              documentNumber: invoiceData.InvoiceNumber,
              lastupdated: '',
              completeButtonVisible: false,
            }),
          });
        }

        // Fetch updated invoice data
        fetchinvoicedata();

      } else {
        console.error('Failed to send email.');
      }
    } catch (error) {
      console.error('Error sending email:', error);
    }
  };

  const handleDepositFormSubmit = async (event) => {
    event.preventDefault();
    const authToken = localStorage.getItem('authToken');
    const contentAsPdf = await generatePdfFromHtml();
    try {
      console.log(formatCustomDate(duedepositDate), "duedepositDate");
      console.log(savedDepositData, "savedDepositData");

      const finalContent = content.trim() || ``; // If content is empty, use default value
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/send-deposit-email`, {
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
          customdate: formatCustomDate(invoiceData.date),
          duedate: formatCustomDate(duedepositDate),
          depositamount: savedDepositData.depositamount,
          InvoiceNumber: invoiceData.InvoiceNumber,
          currencyType: signupdata.CurrencyType,
          pdfAttachment: contentAsPdf,
        }),
      });

      if (response.ok) {
        console.log('Email sent successfully!');
        // setShowModal(false);
        setShowSendEmailModal(false)
        setShowEmailAlert(true);
        const data = response.json();
        console.log(data, "check");

        // Update the database with emailsent status
        if (invoiceData.status == 'Paid' || invoiceData.status == 'Partially Paid') {
          const updatedData = { invoiceData }
          await fetch(`${import.meta.env.VITE_API_BASE_URL}/updateinvoicedata/${invoiceid}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': authToken,
            },
            body: JSON.stringify(updatedData),
          });
        } else {
          const updatedData = { ...invoiceData, status: "Send", emailsent: 'yes' }
          await fetch(`${import.meta.env.VITE_API_BASE_URL}/updateinvoicedata/${invoiceid}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': authToken,
            },
            body: JSON.stringify(updatedData),
          });
        }
        // const updatedData = { ...invoiceData, emailsent: 'yes' }; // Update emailsent status
        // await fetch(`${import.meta.env.VITE_API_BASE_URL}/updateinvoicedata/${invoiceid}`, {
        //   method: 'POST',
        //   headers: {
        //     'Content-Type': 'application/json',
        //     'Authorization': authToken,
        //   },
        //   body: JSON.stringify(updatedData),
        // });
        if (response.status === 401) {
          const json = await response.json();
          setAlertMessage(json.message);
          setloading(false);
          window.scrollTo(0, 0);
          return; // Stop further execution
        }
        else {
          // Fetch updated invoice data
          fetchinvoicedata();
        }
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
        filename: 'myfile.pdf',
        margin: 0.2, // [top, bottom] margin in millimeters
        html2canvas: { scale: 1, useCORS: true }, // Increase scale for better resolution
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

  // const convertToPdf = () => {

  //   // await timeout(5000);
  //   const content = document.getElementById('invoiceContent').innerHTML;
  //   // console.log(content);
  //   const opt = {
  //     filename: 'invoice.pdf',
  //     html2canvas: { scale: 1, useCORS: true }, // Increase scale for better resolution
  //     image: { type: 'jpeg', quality: 0.98 },
  //     jsPDF: { unit: 'in', format: 'A4', orientation: 'portrait' },
  //     margin: { top: 20, bottom: 30 }, // Adjust top and bottom margin
  //     userUnit: 450 / 210
  //   };
  //   html2pdf().from(content).set(opt).save(); // Convert to PDF and save automatically
  // };
  const convertToPdf = () => {
    const content = document.getElementById('invoiceContent').innerHTML;
    const opt = {
      filename: 'invoice.pdf',
      html2canvas: { scale: 1, useCORS: true },
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
          <div className="flex flex-col md:flex-row min-h-screen bg-slate-50/50">
            <Sidebar />
            <div className="flex-1 w-full min-w-0 overflow-x-hidden">
              <div className="p-4 md:p-8 space-y-6 md:space-y-8 max-w-7xl mx-auto">

                {/* Modern Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-1">
                    <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight leading-tight">Invoice Details</h1>
                    <nav aria-label="Breadcrumb">
                      <ol className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-widest font-black text-slate-400">
                        <li><a href="/Userpanel/Userdashboard" className="hover:text-primary transition-colors">Dashboard</a></li>
                        <li className="flex items-center space-x-2">
                          <svg className="h-5 w-5 text-slate-300" fill="currentColor" viewBox="0 0 20 20"><path d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" /></svg>
                          <a href="/Userpanel/Invoice" className="hover:text-primary transition-colors">Invoices</a>
                        </li>
                        <li className="flex items-center space-x-2">
                          <svg className="h-5 w-5 text-slate-300" fill="currentColor" viewBox="0 0 20 20"><path d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" /></svg>
                          <span className="text-slate-900 font-semibold">#{invoiceData.InvoiceNumber}</span>
                        </li>
                      </ol>
                    </nav>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <div className="dropdown">
                      <button
                        className="flex items-center justify-center bg-slate-800 border-0 text-white hover:bg-slate-900 font-black uppercase tracking-widest text-[10px] rounded-xl px-5 py-2.5 shadow-lg shadow-slate-200 transition-all group"
                        type="button"
                        id="dropdownMenuButton"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                      >
                        <i className="fa-solid fa-gear text-slate-400 group-hover:rotate-90 transition-transform duration-300 mr-2"></i>
                        <span>More Actions</span>
                        <i className="fa-solid fa-chevron-down text-[8px] ml-2 opacity-50"></i>
                      </button>
                      <ul className="dropdown-menu shadow-premium border-0 rounded-xl mt-2 overflow-hidden" aria-labelledby="dropdownMenuButton">
                        <li><a className="dropdown-item py-2 px-4 hover:bg-slate-50 cursor-pointer" onClick={handlePrintContent}><i className="fa-solid fa-print mr-2 text-slate-400"></i> Print</a></li>
                        <li><a className="dropdown-item py-2 px-4 hover:bg-slate-50 cursor-pointer" onClick={convertToPdf}><i className="fa-solid fa-file-pdf mr-2 text-slate-400"></i> Download PDF</a></li>
                        <li><a className="dropdown-item py-2 px-4 hover:bg-slate-50 cursor-pointer text-blue-600 font-medium" onClick={() => handleEditContent(invoiceData)}><i className="fa-solid fa-pen-to-square mr-2 text-blue-400"></i> Edit</a></li>
                        <li className="border-t border-slate-100"><a className="dropdown-item py-2 px-4 hover:bg-red-50 text-red-600 cursor-pointer" onClick={() => handleRemove(invoiceData._id)}><i className="fa-solid fa-trash mr-2 text-red-400"></i> Delete</a></li>
                      </ul>
                    </div>
                    <button
                      className="inline-flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest text-xs rounded-xl px-8 py-3 shadow-lg shadow-indigo-200 transition-all hover:scale-[1.02] active:scale-[0.98] border-0"
                      data-bs-toggle="modal" data-bs-target="#sendEmailModal"
                    >
                      <i className="fa-solid fa-paper-plane mr-2"></i>
                      Send Invoice
                    </button>
                  </div>
                </div>

                <div className='my-2'>
                  {alertMessage && <Alertauthtoken message={alertMessage} onClose={() => setAlertMessage('')} />}
                </div>

                {showAlert && (
                  <>
                    <div className="flex flex-col md:flex-row">
                      <div className="col-lg-7 col-sm-5 col-3"></div>
                      <div className="col-9 col-sm-7 col-lg-5">
                        <div className="alert alert-warning flex" role="alert">
                          <svg xmlns="http://www.w3.org/2000/svg" className="alertwidth bi bi-exclamation-triangle-fill flex-shrink-0 mr-2" viewBox="0 0 16 16" role="img" aria-label="Warning:">
                            <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" />
                          </svg>
                          <div>
                            You cannot edit a document that has already been partially paid. Please create a new document.
                          </div>
                          <button type="button" className="btn-close" onClick={() => {
                            // setmessage(false);
                            setShowAlert("");
                          }}></button>

                        </div>
                      </div>
                    </div>
                  </>
                )}

                <div className="page" style={{ display: 'none' }} id="invoiceContent">
                  <div className="header ps pt-5">
                    {signupdata.companyImageUrl
                      ? <img src={signupdata.companyImageUrl} style={{ height: 130 }} className="logoimage" alt="" />
                      : <p className="text-xl font-semibold font-semibold">{signupdata.companyname}</p>
                    }

                    <div className="company-info fs12">
                      <h1 className="m-0" style={{ fontSize: 26 }}>Invoice</h1>
                      <p className="m-0"><strong>{signupdata.companyname}</strong></p>
                      <address className='m-t-5 m-b-5'>
                        <div className='mb-2'>
                          <div className=''>{signupdata.address} </div>
                          {signupdata.city ? JSON.parse(signupdata.city).name + ',' : ' '}
                          {signupdata.state ? JSON.parse(signupdata.state).name : ' '}
                          {/* <div className=''>{JSON.parse(signupdata.city).name}, {JSON.parse(signupdata.state).name}</div>
                                    <div className=''>{JSON.parse(signupdata.country).emoji}</div> */}
                        </div>

                        <div>
                          <a className="text-decoration-none" href={`mailto:${signupdata.email}`}>{signupdata.email}</a>

                        </div>

                        {signupdata.website && (
                          <div>
                            <a className="text-decoration-none" href={signupdata.website}>{signupdata.website}</a>
                          </div>
                        )}
                        <div>
                          {signupdata.gstNumber == ''
                            ?
                            ""
                            :
                            `${signupdata.TaxName} ${signupdata.gstNumber}`
                          }


                        </div>

                      </address>







                      {/* (Optional) remove duplicate GST line below if you don't want it twice */}
                      {/* {signupdata.gstNumber ? <div>{signupdata.TaxName} {signupdata.gstNumber}</div> : null} */}
                    </div>
                  </div>

                  <div className="invoice-details fs12 ps py-2 bg-light">
                    <div>
                      <p className="m-0 text-green"><strong>Bill To:</strong></p>
                      <p className="m-0">{invoiceData.customername}</p>
                      <p className="m-0">{invoiceData.job || ''}</p>
                      <p className="m-0">{invoiceData.customeremail}</p>
                      <p className="m-0">{invoiceData.customerphone || ''}</p>
                    </div>

                    <div>
                      <p className="m-0"><strong className="text-green">Invoice #:</strong> {invoiceData.InvoiceNumber}</p>
                      <p className="m-0"><strong className="text-green">Date:</strong> {formatCustomDate(invoiceData.date)}</p>
                      <p className="m-0"><strong className="text-green">Due date:</strong> {formatCustomDate(invoiceData.duedate)}</p>
                      {/* {invoiceData.job ? <p className="m-0"><strong className="text-green">Job:</strong> {invoiceData.job}</p> : null} */}
                    </div>
                  </div>

                  <div className="ps pb-0">
                    <table className="fs12 table invoice-table">
                      <thead className="border-b border-borderLight">
                        <tr className="text-green">
                          <th className="text-left">Item</th>
                          <th className="text-right">Quantity</th>
                          {/* <th className="text-left">Unit</th> */}
                          <th className="text-right">Price</th>
                          <th className="text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((item) => (
                          <tr className="border-b border-borderLight" key={item._id}>
                            <td>
                              <div>
                                <span><strong>{item.itemname}</strong></span>
                                <div dangerouslySetInnerHTML={{ __html: item.description }} />
                              </div>
                            </td>
                            <td className="text-right">{item.itemquantity}</td>
                            {/* <td>{item.unit}</td> */}
                            <td className="text-right"><CurrencySign />{roundOff(item.price)}</td>
                            <td className="text-right"><CurrencySign />{roundOff(item.amount)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="totals ps">
                    <table className="fs12 table totals-table">
                      <tbody>
                        <tr>
                          <td className="text-right w-75">Gross Invoice Amount:</td>
                          <td className="text-right w-25"><CurrencySign />{roundOff(invoiceData.subtotal)}</td>
                        </tr>

                        {transactions.map((transaction, index) => {
                          const deducted = Number(roundOff(transaction.deductedamount || 0));
                          if (deducted === 0) return null; // hide if 0

                          // calculate % based on invoice total
                          const tdsPercent = Math.round((deducted / invoiceData.total) * 100);

                          // map TDS % to IT rule section
                          let tdsSection = "";
                          if (tdsPercent === 2) {
                            tdsSection = "Sec 194C – Contract";
                          } else if (tdsPercent === 10) {
                            tdsSection = "Sec 194J – Professional";
                          } else {
                            tdsSection = "as per IT rules"; // fallback if not 2% or 10%
                          }

                          return (
                            <tr key={index}>
                              <td className="text-md-end pb-2" width="22%">
                                Less: TDS @ {tdsPercent}% ({tdsSection})
                              </td>
                              <td className="text-right pb-2" width="22%">
                                <CurrencySign />{roundOff(deducted)}
                              </td>
                            </tr>
                          );
                        })}


                        {invoiceData.discountTotal > 0 && (
                          <tr>
                            <td className="text-right">Discount</td>
                            <td className="text-right"><CurrencySign />{roundOff(invoiceData.discountTotal)}</td>
                          </tr>
                        )}

                        {Number(signupdata.taxPercentage) > 0 && (
                          <tr>
                            <td className="text-right">
                              {signupdata.TaxName} ({signupdata.taxPercentage}%)
                            </td>
                            <td className="text-right"><CurrencySign />{roundOff(invoiceData.tax)}</td>
                          </tr>
                        )}

                        <tr>
                          <td className="text-right">Net Payment Received</td>
                          <td className="text-right"><CurrencySign />
                            {roundOff(
                              transactions.reduce((total, t) => total + parseFloat(t.paidamount || 0), 0)
                            )}</td>
                        </tr>

                        {transactions.map((t) => (
                          <tr className="border-b border-borderLight" key={t._id}>
                            <td className="text-md-end">
                              {t.method === 'deposit' ? 'Deposit' : 'Paid'} on {formatCustomDate(t.paiddate)}
                            </td>
                            <td className="text-right" style={{ borderBottom: '1px solid #ddd' }}>
                              <CurrencySign />{roundOff(t.paidamount)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="ps">
                    <p className="text-right">
                      <span className="p-6 invoice-price-right">
                        <span className="text-green">Amount Due:</span>{' '}
                        <strong>
                          <CurrencySign />
                          {roundOff(
                            invoiceData.total -
                            transactions.reduce(
                              (total, p) =>
                                total +
                                parseFloat(p.paidamount || 0) +
                                parseFloat(p.deductedamount || 0),
                              0
                            )
                          )}
                        </strong>
                      </span>
                    </p>
                  </div>

                  <div className="invoice-body invoice-body-text">
                    <div className="mt-1">
                      <span>{invoiceData.information ? 'Note:' : ''}</span>
                      <div className="information-content" dangerouslySetInnerHTML={{ __html: invoiceData.information }} />
                    </div>
                  </div>
                </div>


                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                  {/* Left Column: Invoice Preview */}
                  <div className="lg:col-span-8 space-y-6">

                    {/* Status Message for Paid Documents */}
                    {showAlert && (
                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start space-x-3 transition-all animate-in fade-in slide-in-from-top-4">
                        <svg className="h-5 w-5 text-amber-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <div className="flex-1">
                          <p className="text-sm text-amber-800 font-medium leading-relaxed">
                            You cannot edit a document that has already been partially paid. Please create a new document for any required changes.
                          </p>
                        </div>
                        <button onClick={() => setShowAlert("")} className="text-amber-500 hover:text-amber-600 transition-colors">
                          <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                        </button>
                      </div>
                    )}

                    {/* Invoice Preview Card */}
                    <div id="invoiceContent1" className="bg-white border border-slate-200 rounded-2xl shadow-premium overflow-hidden transition-all hover:shadow-premium-hover">

                      {/* Invoice Header Section */}
                      <div className="p-6 md:p-12 border-b border-slate-100">
                        <div className="flex flex-col md:flex-row justify-between gap-8">
                          <div className="space-y-6">
                            {signupdata.companyImageUrl ? (
                              <img src={signupdata.companyImageUrl} className="h-12 md:h-16 w-auto object-contain" alt="Company Logo" />
                            ) : (
                              <h2 className="text-xl md:text-2xl font-bold text-slate-900">{signupdata.companyname}</h2>
                            )}

                            <div className="space-y-1">
                              <p className="text-xs md:text-sm font-semibold text-slate-900">{signupdata.companyname}</p>
                              <address className="text-[11px] md:text-sm text-slate-500 not-italic leading-relaxed">
                                {signupdata.address}<br />
                                {signupdata.city ? JSON.parse(signupdata.city).name : ''}, {signupdata.state ? JSON.parse(signupdata.state).name : ''}<br />
                                {signupdata.email}<br />
                                {signupdata.website && <span className="hover:text-primary transition-colors cursor-pointer">{signupdata.website}</span>}
                              </address>
                              {signupdata.gstNumber && (
                                <p className="text-[10px] font-medium text-slate-400 mt-2">
                                  {signupdata.TaxName}: {signupdata.gstNumber}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="text-left md:text-right space-y-3 md:space-y-4">
                            <h2 className="text-3xl md:text-4xl font-black text-slate-900 uppercase tracking-tighter">Invoice</h2>
                            <div className="space-y-0.5 md:space-y-1 text-sm font-medium">
                              <p className="text-slate-500 text-[11px] uppercase tracking-wider font-bold"># {invoiceData.InvoiceNumber}</p>
                            </div>
                            <div className="grid grid-cols-2 md:block gap-4 md:space-y-4 pt-2 md:pt-0">
                              <div className="space-y-0.5 md:space-y-1 text-xs md:text-sm font-medium">
                                <p className="text-slate-400 uppercase tracking-widest font-black text-[9px]">Issued</p>
                                <p className="text-slate-900">{formatCustomDate(invoiceData.date)}</p>
                              </div>
                              <div className="space-y-0.5 md:space-y-1 text-xs md:text-sm font-medium">
                                <p className="text-slate-400 uppercase tracking-widest font-black text-[9px]">Due</p>
                                <p className="text-slate-900 font-bold text-indigo-600">{formatCustomDate(invoiceData.duedate)}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Billing Information */}
                      <div className="p-6 md:p-12 bg-slate-50/50 flex flex-col md:flex-row gap-8">
                        <div className="flex-1 space-y-2">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Bill To</p>
                          <div className="space-y-1">
                            <p className="text-base md:text-lg font-bold text-slate-900">{invoiceData.customername}</p>
                            <p className="text-xs md:text-sm text-slate-600">{invoiceData.customeremail}</p>
                            {invoiceData.customerphone && <p className="text-xs md:text-sm text-slate-600">{invoiceData.customerphone}</p>}
                            {invoiceData.job && <p className="text-[11px] font-black text-indigo-600 uppercase mt-2 flex items-center tracking-tight"><i className="fa-solid fa-briefcase mr-2 text-[10px]"></i> Project: {invoiceData.job}</p>}
                          </div>
                        </div>
                      </div>

                      {/* Items Table */}
                      <div className="p-0 border-t border-slate-100 overflow-hidden">
                        <div className="overflow-x-auto scrollbar-hide">
                          <table className="w-full text-left border-collapse min-w-[600px] md:min-w-0">
                            <thead>
                              <tr className="bg-slate-50/80 border-b border-slate-100">
                                <th className="px-6 md:px-8 py-4 md:py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-left">Item Details</th>
                                <th className="px-4 md:px-8 py-4 md:py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Qty</th>
                                <th className="px-6 md:px-8 py-4 md:py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Price</th>
                                <th className="px-6 md:px-8 py-4 md:py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right pr-6 md:pr-8">Amount</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {items.map((item, index) => (
                                <tr key={item._id || index} className="group hover:bg-slate-50/50 transition-colors">
                                  <td className="px-6 md:px-8 py-5 md:py-6">
                                    <div className="space-y-1">
                                      <p className="font-bold text-slate-900 text-sm md:text-base">{item.itemname}</p>
                                      <div className="text-[11px] md:text-sm text-slate-500 max-w-md prose prose-sm prose-slate" dangerouslySetInnerHTML={{ __html: item.description }} />
                                    </div>
                                  </td>
                                  <td className="px-4 md:px-8 py-5 md:py-6 text-center font-medium text-slate-600">
                                    <span className="inline-block px-2 py-1 bg-slate-100 rounded-lg text-slate-900 font-bold text-xs">
                                      {item.itemquantity}
                                    </span>
                                    {item.unit && <span className="text-[9px] text-slate-400 block mt-1 font-bold uppercase tracking-tighter">{item.unit}</span>}
                                  </td>
                                  <td className="px-6 md:px-8 py-5 md:py-6 text-right font-medium text-slate-600 text-xs md:text-sm"><CurrencySign />{roundOff(item.price).toLocaleString('en-CA')}</td>
                                  <td className="px-6 md:px-8 py-5 md:py-6 text-right font-bold text-slate-900 text-sm md:text-base"><CurrencySign />{roundOff(item.amount).toLocaleString('en-CA')}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Totals Section in Card Footer */}
                      <div className="p-6 md:p-12 border-t border-slate-100 bg-slate-50/30">
                        <div className="flex flex-col lg:flex-row justify-between gap-8 md:gap-12">

                          {/* Signature Placement: Approvals at bottom of preview */}
                          <div className="flex-1 space-y-6 md:space-y-8">
                            {(invoiceData.isAddSignature || invoiceData.isCustomerSign) && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8 pt-6 md:pt-8 border-t border-slate-100">
                                {ownerData && invoiceData.isAddSignature && (
                                  <div className="space-y-4">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none">Authorized Signature</p>
                                    <div className="bg-white p-4 rounded-xl border border-slate-200/60 shadow-sm inline-block">
                                      <img src={ownerData.data} alt="Owner Signature" className="h-16 w-auto object-contain mx-auto" />
                                      <div className="mt-3 pt-2 border-t border-slate-100 text-center">
                                        <p className="text-[10px] font-bold text-slate-900 group-hover:text-primary transition-colors">{signupdata.companyname}</p>
                                        <p className="text-[9px] text-slate-400">{formatCustomDate(invoiceData.createdAt)}</p>
                                      </div>
                                    </div>
                                  </div>
                                )}
                                {signatureData && signatureData.customersign && (
                                  <div className="space-y-4">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none">Customer Signature</p>
                                    <div className="bg-white p-4 rounded-xl border border-slate-200/60 shadow-sm inline-block">
                                      <img src={signatureData.customersign} alt="Customer Signature" className="h-16 w-auto object-contain mx-auto" />
                                      <div className="mt-3 pt-2 border-t border-slate-100 text-center">
                                        <p className="text-[10px] font-bold text-slate-900">{invoiceData.customername}</p>
                                        <p className="text-[9px] text-slate-400">{formatCustomDate(signatureData.createdAt)}</p>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}

                            {invoiceData.information && (
                              <div className="space-y-2">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Notes</p>
                                <div className="text-sm text-slate-500 leading-relaxed prose prose-sm prose-slate" dangerouslySetInnerHTML={{ __html: invoiceData.information }} />
                              </div>
                            )}
                          </div>

                          {/* Detailed Calculations */}
                          <div className="w-full md:w-80 space-y-4 pt-4">
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-slate-500 font-medium font-medium">Subtotal</span>
                              <span className="text-slate-900 text-slate-900 font-bold"><CurrencySign />{roundOff(invoiceData.subtotal).toLocaleString('en-CA')}</span>
                            </div>

                            {invoiceData.discountTotal > 0 && (
                              <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500 font-medium">Discount</span>
                                <span className="text-emerald-600 font-bold">- <CurrencySign />{roundOff(invoiceData.discountTotal).toLocaleString('en-CA')}</span>
                              </div>
                            )}

                            {Number(signupdata.taxPercentage) > 0 && (
                              <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500 font-medium">{signupdata.TaxName} ({signupdata.taxPercentage}%)</span>
                                <span className="text-slate-900 font-bold"><CurrencySign />{roundOff(invoiceData.tax).toLocaleString('en-CA')}</span>
                              </div>
                            )}

                            <div className="pt-6 border-t border-slate-200">
                              <div className="flex items-center justify-center bg-slate-800 border-0 text-white hover:bg-slate-900 uppercase tracking-widest rounded-xl px-5 py-2.5 shadow-lg shadow-slate-200 transition-all group">
                                <span className="text-sm font-black uppercase tracking-widest">Total Balance</span>
                                <span className="text-3xl font-black"><CurrencySign />{roundOff(invoiceData.total || 0).toLocaleString('en-CA')}</span>
                              </div>
                            </div>

                            {transactions.length > 0 && (
                              <div className="space-y-3 pt-4">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Payment History</p>
                                {transactions.map((t) => (
                                  <div key={t._id} className="flex justify-between items-center text-xs bg-slate-100/50 p-2.5 rounded-lg border border-slate-100">
                                    <div className="space-y-0.5">
                                      <p className="font-bold text-slate-700 capitalize">{t.method === 'deposit' ? 'Deposit' : 'Paid'}</p>
                                      <p className="text-slate-400">{formatCustomDate(t.paiddate)}</p>
                                    </div>
                                    <span className="font-bold text-slate-900"><CurrencySign />{roundOff(t.paidamount).toLocaleString('en-CA')}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Action Sidebar */}
                  <div className="lg:col-span-4 space-y-6">

                    {/* High-Impact Status Card */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-premium hover:shadow-premium-hover transition-all">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight tracking-widest">Document Status</h3>
                        <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest shadow-sm ${getStatus() === "Paid" ? "bg-emerald-100 text-emerald-700 border border-emerald-200" :
                          getStatus() === "Partially Paid" ? "bg-blue-100 text-blue-700 border border-blue-200" :
                            getStatus() === "Payment Pending" ? "bg-amber-100 text-amber-700 border border-amber-200" :
                              "bg-slate-100 text-slate-600 border border-slate-200"
                          }`}>
                          {getStatus()}
                        </span>
                      </div>

                      <div className="space-y-6">
                        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 relative overflow-hidden group">
                          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform duration-500">
                            <i className="fa-solid fa-wallet text-6xl text-slate-900"></i>
                          </div>
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Balance Due</p>
                          <p className="text-3xl font-black text-slate-900 tracking-tighter">
                            <CurrencySign />
                            {roundOff(
                              invoiceData.total -
                              transactions.reduce(
                                (total, p) =>
                                  total +
                                  parseFloat(p.paidamount || 0) +
                                  parseFloat(p.deductedamount || 0),
                                0
                              )
                            ).toLocaleString('en-CA')}
                          </p>
                        </div>

                        <div className="space-y-3">
                          <button
                            className="w-full flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/5 transition-all group"
                            data-bs-toggle="modal" data-bs-target="#exampleModal"
                          >
                            <div className="flex items-center gap-3 font-medium">
                              <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                                <i className="fa-solid fa-money-bill-transfer"></i>
                              </div>
                              <span className="text-slate-900 font-black uppercase tracking-tight text-sm">Record Payment</span>
                            </div>
                            <i className="fa-solid fa-chevron-right text-slate-300 text-xs group-hover:translate-x-1 transition-transform"></i>
                          </button>

                          {!transactions.find(t => t.method === "deposit") && (
                            <button
                              className="w-full flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/5 transition-all group"
                              data-bs-toggle="modal" data-bs-target="#exampleModaldeposit"
                              onClick={savedDepositData ? handleEditModal : undefined}
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors font-medium">
                                  <i className="fa-solid fa-hand-holding-dollar"></i>
                                </div>
                                <div className="text-left font-medium">
                                  <p className="text-slate-900 font-black uppercase tracking-tight text-sm">Request Deposit</p>
                                  {savedDepositData && (
                                    <p className="text-[10px] text-blue-500 font-bold"><CurrencySign />{savedDepositData.depositamount}</p>
                                  )}
                                </div>
                              </div>
                              <i className="fa-solid fa-chevron-right text-slate-300 text-xs group-hover:translate-x-1 transition-transform"></i>
                            </button>
                          )}

                          <button
                            className="w-full flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-500/30 hover:shadow-lg hover:shadow-slate-500/5 transition-all group"
                            data-bs-toggle="modal" data-bs-target="#exampleModal1"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center group-hover:bg-slate-600 group-hover:text-white transition-colors font-black">
                                <i className="fa-solid fa-list-check"></i>
                              </div>
                              <span className="text-slate-900 font-black uppercase tracking-tight text-sm">Transaction History</span>
                            </div>
                            <i className="fa-solid fa-chevron-right text-slate-300 text-xs group-hover:translate-x-1 transition-transform"></i>
                          </button>

                          <button
                            className="w-full flex items-center justify-between p-4 rounded-xl border-2 border-slate-200 bg-white hover:bg-slate-50 hover:border-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/5 transition-all group"
                            data-bs-toggle="modal" data-bs-target="#exampleModal2"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors font-black">
                                <i className="fa-solid fa-folder-tree"></i>
                              </div>
                              <span className="text-slate-900 font-black uppercase tracking-tight text-sm">Job Expenditures</span>
                            </div>
                            <i className="fa-solid fa-chevron-right text-slate-300 text-xs group-hover:translate-x-1 transition-transform"></i>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Additional Information Help Card */}
                    <div className="bg-indigo-50/50 border border-indigo-200 rounded-2xl p-6 shadow-sm">
                      <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-3 leading-none">Management Pro Tip</h4>
                      <p className="text-[13px] text-slate-600 leading-relaxed">
                        Need to update this invoice? You can directly jump to the editor using the <b className="text-slate-900">Edit</b> button in the top menu, provided no partial payments have been recorded.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
      }

      <div className="modal fade backdrop-blur-md" id="exampleModal" tabIndex="-1" ref={modalRef} aria-labelledby="markPaidLabel" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered modal-lg px-4">
          <div className="modal-content border-0 shadow-2xl rounded-3xl overflow-hidden bg-white/95 backdrop-blur-xl">
            <div className="modal-header border-slate-100 p-6 md:p-8 bg-slate-50/50">
              <h2 className="modal-title text-xl font-black text-slate-900 uppercase tracking-tight" id="markPaidLabel">Record Payment</h2>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body p-8 space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Amount to Record</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                      <CurrencySign />
                    </div>
                    <input
                      type="number"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-10 pr-4 text-slate-900 font-bold focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                      name='paidamount'
                      onChange={onchange}
                      placeholder="0.00"
                      required
                    />
                  </div>
                  {paidamounterror && <p className="text-[10px] text-red-500 font-bold mt-1 pl-1 capitalize">{paidamounterror}</p>}
                  {exceedpaymenterror && <p className="text-[10px] text-red-500 font-bold mt-1 pl-1 capitalize">{exceedpaymenterror}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Payment Date</label>
                    <input
                      type="date"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 px-4 text-slate-900 font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                      name='paiddate'
                      onChange={onchange}
                      required
                    />
                    {paiddateerror && <p className="text-[10px] text-red-500 font-bold mt-1 pl-1 capitalize">{paiddateerror}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Method</label>
                    <div className="relative">
                      <select
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 px-4 text-slate-900 font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none appearance-none cursor-pointer"
                        name='method'
                        onChange={onchange}
                        required
                      >
                        <option selected disabled hidden>Select Method</option>
                        <option value="Cash">Cash</option>
                        <option value="Credit">Credit</option>
                        <option value="Cheque">Cheque</option>
                        <option value="Transfer">Transfer</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400">
                        <i className="fa-solid fa-chevron-down text-[10px]"></i>
                      </div>
                    </div>
                    {methoderror && <p className="text-[10px] text-red-500 font-bold mt-1 pl-1 capitalize">{methoderror}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Internal Note</label>
                  <input
                    type="text"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 px-4 text-slate-900 font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                    name='note'
                    onChange={onchange}
                    placeholder="Reference, transaction ID, etc."
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer border-slate-100 p-6 bg-slate-50/30">
              <button type="button" className="text-slate-700 font-black text-xs uppercase tracking-widest hover:text-slate-900 transition-colors mr-8" data-bs-dismiss="modal">Cancel</button>
              <button
                className={`flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest rounded-xl px-10 py-3.5 shadow-lg shadow-indigo-200 transition-all hover:scale-[1.02] active:scale-[0.98] border-0 text-xs ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={!isSubmitting ? handleAddPayment : null}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    <span>Processing...</span>
                  </div>
                ) : 'Record Payment'}
              </button>
            </div>
          </div>
        </div>
      </div>


      <div className="modal fade backdrop-blur-md" id="exampleModal1" tabIndex="-1" ref={modalRef} aria-labelledby="transactionHistoryLabel" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered modal-lg px-4">
          <div className="modal-content border-0 shadow-2xl rounded-3xl overflow-hidden bg-white/95 backdrop-blur-xl">
            <div className="modal-header border-slate-100 p-6 md:p-8 bg-slate-50/50">
              <h2 className="modal-title text-xl font-black text-slate-900 uppercase tracking-tight" id="transactionHistoryLabel">Transaction History</h2>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body p-0">
              <div className="p-8">
                <div className="bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden">
                  <div className="p-4 bg-slate-200/50 flex items-center justify-between text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-200">
                    <div className="flex-[2] pl-2">Payment Details</div>
                    <div className="flex-1 text-center">Amount</div>
                    <div className="w-12 text-center">Action</div>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {transactions.length > 0 ? transactions.map((transaction) => (
                      <div key={transaction._id} className="p-4 flex items-center justify-between bg-white hover:bg-slate-50/50 transition-colors">
                        <div className="flex-[2] space-y-1">
                          <p className="text-sm font-bold text-slate-900">{formatCustomDate(transaction.paiddate)}</p>
                          <p className="text-xs text-slate-400 font-medium italic">{transaction.note || 'No transaction note'}</p>
                        </div>
                        <div className="flex-1 text-center">
                          <span className="text-sm font-black text-slate-900"><CurrencySign />{roundOff(transaction.paidamount).toLocaleString('en-CA')}</span>
                        </div>
                        <div className="w-12 flex justify-center">
                          <button
                            data-bs-dismiss="modal"
                            className="w-8 h-8 rounded-lg bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center"
                            onClick={() => handleDeleteTransClick(transaction._id)}
                            title="Delete Payment"
                          >
                            <i className="fa-solid fa-trash-can text-xs"></i>
                          </button>
                        </div>
                      </div>
                    )) : (
                      <div className="p-12 text-center space-y-4">
                        <div className="w-20 h-20 rounded-full bg-slate-50 text-slate-200 flex items-center justify-center mx-auto">
                          <i className="fa-solid fa-receipt text-3xl"></i>
                        </div>
                        <p className="text-slate-400 font-medium italic">No transactions recorded yet.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer border-slate-50 p-6 bg-slate-50/50">
              <button type="button" className="btn btn-outline-secondary border-slate-200 text-slate-600 font-bold text-xs uppercase tracking-widest rounded-xl px-8 py-3 hover:bg-slate-100 transition-all" data-bs-dismiss="modal">Close</button>
            </div>
          </div>
        </div>
      </div>

      <div className="modal fade backdrop-blur-md" id="exampleModal2" tabIndex="-1" ref={modalRef} aria-labelledby="expenseEntriesLabel" aria-hidden="true">
        <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable px-4">
          <div className="modal-content border-0 shadow-2xl rounded-3xl overflow-hidden bg-white/95 backdrop-blur-xl">
            <div className="modal-header border-slate-100 p-6 md:p-8 bg-slate-50/50">
              <h1 className="modal-title text-xl font-black text-slate-900 uppercase tracking-tight" id="expenseEntriesLabel">Job Expenditures</h1>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-100">
                      <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest pl-8">Date</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Category</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Vendor</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Status</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text_right">Type</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right pr-8">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {expenseTransactions.map((transaction) => (
                      <tr key={transaction._id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900 pl-8">{formatCustomDate(transaction.expenseDate)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md text-[10px] font-bold uppercase tracking-tight">{getExpenseTypeName(transaction.expenseType || "N/A")}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-medium">{getVendorName(transaction.vendor || "N/A")}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-tight ${transaction.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                            }`}>
                            {transaction.paymentStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-medium italic">{transaction.transactionType}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-black text-slate-900 pr-8">
                          <CurrencySign />{transaction.amount.toLocaleString('en-CA')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-50/50">
                    <tr className="border-t-2 border-slate-200">
                      <td colSpan="4" className="px-6 py-4"></td>
                      <td className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-widest">Total Expenses</td>
                      <td className="px-6 py-4 text-right text-base font-black text-red-600 pr-8">
                        <CurrencySign />
                        {expenseTransactions.filter(t => t.transactionType === 'Expense').reduce((sum, t) => sum + t.amount, 0).toLocaleString('en-CA')}
                      </td>
                    </tr>
                    <tr className="border-t border-slate-100">
                      <td colSpan="4" className="px-6 py-4"></td>
                      <td className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-widest">Rem. Balance</td>
                      <td className="px-6 py-4 text-right text-base font-black text-primary pr-8">
                        <CurrencySign />
                        {roundOff(
                          invoiceData.total - expenseTransactions.filter(t => t.transactionType === 'Expense').reduce((sum, t) => sum + t.amount, 0)
                        ).toLocaleString('en-CA')}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
            <div className="modal-footer border-slate-100 p-6 bg-slate-50/30 flex justify-between items-center">
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest italic leading-none">Showing all {expenseTransactions.length} transaction entries</div>
              <button type="button" className="bg-white border-2 border-slate-200 text-slate-800 font-black text-xs uppercase tracking-widest rounded-xl px-10 py-3.5 hover:bg-slate-50 hover:border-slate-400 transition-all font-medium" data-bs-dismiss="modal">Close</button>
            </div>
          </div>
        </div>
      </div>



      <div className="modal fade backdrop-blur-md" id="sendEmailModal" tabIndex="-1" ref={modalRef} aria-labelledby="sendEmailLabel" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered modal-lg px-4">
          <div className="modal-content border-0 shadow-2xl rounded-3xl overflow-hidden bg-white/95 backdrop-blur-xl">
            <div className="modal-header border-slate-100 p-6 md:p-8 bg-slate-50/50">
              <h2 className="modal-title text-xl font-black text-slate-900 uppercase tracking-tight" id="sendEmailLabel">Send Document</h2>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body p-8">
              <form onSubmit={handleFormSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Recipient(s)</label>
                    <div className="bg-slate-50 border border-slate-200 rounded-xl px-2 py-1 focus-within:ring-2 focus-within:ring-primary/10 focus-within:border-primary transition-all">
                      <ReactMultiEmail
                        emails={emails}
                        onChange={handleEmailChange}
                        getLabel={(email, index, removeEmail) => (
                          <div data-tag="true" key={index} className="inline-flex items-center bg-primary/10 text-primary rounded-lg px-3 py-1 text-xs font-bold mr-2 my-1 border border-primary/20">
                            {email}
                            <span className="ml-2 hover:text-red-500 transition-colors pointer" onClick={() => removeEmail(index)}>×</span>
                          </div>
                        )}
                        placeholder="Add recipient emails..."
                        style={{
                          input: { width: '100%', border: 'none', background: 'transparent', outline: 'none', fontSize: '14px', padding: '8px' },
                          emailsContainer: { border: 'none', padding: '0' },
                          emailInput: { backgroundColor: 'transparent' },
                          invalidEmailInput: { backgroundColor: '#fee2e2' },
                          container: { border: 'none' },
                        }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Bcc</label>
                    <div className="bg-slate-50 border border-slate-200 rounded-xl px-2 py-1 focus-within:ring-2 focus-within:ring-primary/10 focus-within:border-primary transition-all">
                      <ReactMultiEmail
                        emails={bccEmails}
                        onChange={handleBccEmailsChange}
                        getLabel={(email, index, removeEmail) => (
                          <div data-tag="true" key={index} className="inline-flex items-center bg-slate-200/50 text-slate-600 rounded-lg px-3 py-1 text-xs font-bold mr-2 my-1 border border-slate-300/30">
                            {email}
                            <span className="ml-2 hover:text-red-500 transition-colors pointer" onClick={() => removeEmail(index)}>×</span>
                          </div>
                        )}
                        placeholder="Add BCC recipients..."
                        style={{
                          input: { width: '100%', border: 'none', background: 'transparent', outline: 'none', fontSize: '14px', padding: '8px' },
                          emailsContainer: { border: 'none', padding: '0' },
                          emailInput: { backgroundColor: 'transparent' },
                          invalidEmailInput: { backgroundColor: '#fee2e2' },
                          container: { border: 'none' },
                        }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Email Content</label>
                    <textarea
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 px-4 text-slate-900 text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none min-h-[160px] leading-relaxed"
                      id="content"
                      name="content"
                      value={content}
                      onChange={handleContentChange}
                      placeholder="Write your message here..."
                    ></textarea>
                  </div>
                </div>

                <div className="flex justify-end gap-5 pt-4">
                  <button type="button" className="text-slate-700 font-black text-xs uppercase tracking-widest hover:text-slate-900 transition-colors mr-auto" data-bs-dismiss="modal">Cancel Action</button>
                  <button type="submit" className="flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest rounded-xl px-10 py-3.5 shadow-lg shadow-indigo-200 transition-all hover:scale-[1.02] active:scale-[0.98] border-0 text-xs" data-bs-dismiss="modal">
                    Send Email Document
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <div className="modal fade backdrop-blur-md" id="exampleModaldeposit" tabIndex="-1" ref={modalRef} aria-labelledby="requestDepositLabel" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered modal-lg px-4">
          <div className="modal-content border-0 shadow-2xl rounded-3xl overflow-hidden bg-white/95 backdrop-blur-xl">
            <div className="modal-header border-slate-100 p-6 md:p-8 bg-slate-50/50">
              <h2 className="modal-title text-xl font-black text-slate-900 uppercase tracking-tight" id="requestDepositLabel">Request Deposit</h2>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body p-8 space-y-8">
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Outstanding</p>
                  <p className="text-2xl font-black text-slate-900 tracking-tighter">
                    <CurrencySign />
                    {roundOff(
                      (invoiceData.total || 0) -
                      (transactions || []).reduce((total, p) => total + (Number(p.paidamount) || 0), 0) -
                      (Number(amount) || 0)
                    ).toLocaleString('en-CA')}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  <i className="fa-solid fa-calculator"></i>
                </div>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-12 gap-4 items-end">
                  <div className="col-span-12 font-medium">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1 mb-2 block font-medium">Desired Deposit</label>
                  </div>
                  <div className="col-span-5">
                    <div className="relative group">
                      <input
                        type="number"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 px-4 text-slate-900 font-bold focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                        id="depositpercentage"
                        value={depositpercentage}
                        onChange={handlePercentageChange}
                        min="0"
                      />
                      <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400 font-bold">%</div>
                    </div>
                  </div>
                  <div className="col-span-2 text-center pb-3 text-slate-300">
                    <i className="fa-solid fa-equals"></i>
                  </div>
                  <div className="col-span-5">
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 font-bold">
                        <CurrencySign />
                      </div>
                      <input
                        type="text"
                        className="w-full bg-slate-100 border border-slate-200 rounded-xl py-3.5 pl-10 pr-4 text-slate-500 font-bold cursor-not-allowed outline-none font-medium"
                        id="amount"
                        value={amount}
                        readOnly
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1 font-medium">Payment Due By</label>
                  <input
                    type="date"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 px-4 text-slate-900 font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                    value={duedepositDate}
                    onChange={handleDateChange}
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer border-slate-100 p-6 bg-slate-50/30 flex gap-4">
              <button type="button" className="text-slate-700 font-black text-xs uppercase tracking-widest hover:text-slate-900 transition-colors mr-auto" data-bs-dismiss="modal">Cancel</button>
              <button
                className="bg-white border-2 border-slate-200 text-slate-800 font-black text-xs uppercase tracking-widest rounded-xl px-10 py-3.5 hover:bg-slate-50 hover:border-slate-400 transition-all font-medium"
                onClick={handleSave}
                data-bs-dismiss="modal"
              >
                Save
              </button>
              <button
                className={`flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest rounded-xl px-10 py-3.5 shadow-lg shadow-indigo-200 transition-all hover:scale-[1.02] active:scale-[0.98] border-0 text-xs ${(!depositpercentage || parseInt(depositpercentage) < 1) ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={handleSaveAndSend}
                disabled={!depositpercentage || parseInt(depositpercentage) < 1}
                data-bs-dismiss="modal"
              >
                Save & Send Request
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Deposit Email Modal (Modal 2) */}
      {showSendEmailModal ?
        <div className="modal fade show backdrop-blur-md" id="sendEmailModal2" tabIndex="-1" aria-labelledby="sendEmailLabel2" aria-modal="true" role="dialog" style={{ display: "block", backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered px-4">
            <div className="modal-content border-0 shadow-2xl rounded-3xl overflow-hidden bg-white/95 backdrop-blur-xl">
              <div className="modal-header border-slate-100 p-6 md:p-8 bg-slate-50/50">
                <h2 className="modal-title text-xl font-black text-slate-900 uppercase tracking-tight" id="sendEmailLabel2">Send Deposit Request</h2>
                <button type="button" className="btn-close" onClick={() => setShowSendEmailModal(false)}></button>
              </div>
              <div className="modal-body p-8">
                <form onSubmit={handleDepositFormSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1 font-medium text-slate-500">To</label>
                      <div className="bg-slate-50 border border-slate-200 rounded-xl px-2 py-1">
                        <ReactMultiEmail
                          emails={emails}
                          onChange={handleEmailChange}
                          getLabel={(email, index, removeEmail) => (
                            <div data-tag="true" key={index} className="inline-flex items-center bg-primary/10 text-primary rounded-lg px-3 py-1 text-xs font-bold mr-2 my-1 border border-primary/20 font-semibold font-semibold">
                              {email}
                              <span className="ml-2 hover:text-red-500 transition-colors pointer font-medium text-slate-500" onClick={() => removeEmail(index)}>×</span>
                            </div>
                          )}
                          placeholder="Add recipient emails..."
                          style={{
                            input: { width: '100%', border: 'none', background: 'transparent', outline: 'none', fontSize: '14px', padding: '8px' },
                            emailsContainer: { border: 'none', padding: '0' },
                            emailInput: { backgroundColor: 'transparent' },
                            invalidEmailInput: { backgroundColor: '#fee2e2' },
                            container: { border: 'none' },
                          }}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1 font-medium font-medium text-slate-400">Bcc</label>
                      <div className="bg-slate-50 border border-slate-200 rounded-xl px-2 py-1">
                        <ReactMultiEmail
                          emails={bccEmails}
                          onChange={handleBccEmailsChange}
                          getLabel={(email, index, removeEmail) => (
                            <div data-tag="true" key={index} className="inline-flex items-center bg-slate-200/50 text-slate-600 rounded-lg px-3 py-1 text-xs font-bold mr-2 my-1 border border-slate-300/30">
                              {email}
                              <span className="ml-2 hover:text-red-500 transition-colors pointer" onClick={() => removeEmail(index)}>×</span>
                            </div>
                          )}
                          placeholder="Add BCC recipients..."
                          style={{
                            input: { width: '100%', border: 'none', background: 'transparent', outline: 'none', fontSize: '14px', padding: '8px' },
                            emailsContainer: { border: 'none', padding: '0' },
                            emailInput: { backgroundColor: 'transparent' },
                            invalidEmailInput: { backgroundColor: '#fee2e2' },
                            container: { border: 'none' },
                          }}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1 font-medium text-slate-500">Content</label>
                      <textarea
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 px-4 text-slate-900 text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none min-h-[160px] leading-relaxed"
                        value={content}
                        onChange={handleContentChange}
                        placeholder="Write your message here..."
                      ></textarea>
                    </div>
                  </div>

                  <div className="flex justify-end items-center gap-5 pt-4">
                    <button type="button" className="text-slate-700 font-black text-xs uppercase tracking-widest hover:text-slate-900 transition-colors" onClick={() => setShowSendEmailModal(false)}>Cancel Email</button>
                    <button type="submit" className="flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-widest text-[11px] rounded-xl px-10 py-3.5 shadow-lg shadow-emerald-200 transition-all hover:scale-[1.02] active:scale-[0.98] border-0">
                      Send Email Request
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div> : null
      }
    </div>
  )
}