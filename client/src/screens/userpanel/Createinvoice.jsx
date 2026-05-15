import React, { useState, useEffect, useRef } from 'react'
import { format, addDays } from 'date-fns';
import { useNavigate } from 'react-router-dom'
import { ColorRing } from 'react-loader-spinner'

import Sidebar from './Sidebar';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import Select from 'react-select';
import CurrencySign from '../../components/CurrencySign ';
import { CountrySelect, StateSelect, CitySelect } from '@davzon/react-country-state-city';
import "@davzon/react-country-state-city/dist/react-country-state-city.css";
import Alertauthtoken from '../../components/Alertauthtoken';

class MyCustomUploadAdapter {
    constructor(loader) {
        // Save Loader instance to use later
        this.loader = loader;
    }

    upload() {
        return this.loader.file.then(file => {
            return new Promise((resolve, reject) => {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('upload_preset', 'employeeApp'); // Replace with your Cloudinary upload preset
                formData.append('cloud_name', 'dxwge5g8f'); // Replace with your Cloudinary cloud name

                // Upload image to Cloudinary
                fetch('https://api.cloudinary.com/v1_1/dxwge5g8f/image/upload', {
                    method: 'POST',
                    body: formData,
                })
                    .then(response => response.json())
                    .then(data => {
                        resolve({
                            default: data.secure_url
                        });
                        console.log(data.secure_url, "================================================================");
                    })
                    .catch(error => {
                        reject(error.message || 'Failed to upload image to Cloudinary');
                    });
            });
        });
    }

    abort() {
        // Implement if needed
    }
}

function MyCustomUploadAdapterPlugin(editor) {
    editor.plugins.get('FileRepository').createUploadAdapter = (loader) => {
        return new MyCustomUploadAdapter(loader);
    };
}

export default function Createinvoice() {
    const [loading, setloading] = useState(true);
    const modalRef = useRef(null);
    const [customers, setcustomers] = useState([]);
    const [items, setitems] = useState([]);
    const [searchcustomerResults, setSearchcustomerResults] = useState([]);
    const [searchitemResults, setSearchitemResults] = useState([]);
    const [quantityMap, setQuantityMap] = useState({});
    const [discountMap, setDiscountMap] = useState({});
    const [itemExistsMessage, setItemExistsMessage] = useState('');
    const [CloudImage, setCloudImage] = useState('');
    const [message, setmessage] = useState(false);
    const [alertShow, setAlertShow] = useState("");
    const [SelectedCustomerId, setSelectedCustomerId] = useState("");
    const [selectedCustomerDetails, setSelectedCustomerDetails] = useState({
        name: '', email: '', number: ''
    });
    const [isCustomerSelected, setIsCustomerSelected] = useState(false);
    const [editedName, setEditedName] = useState('');
    const [editedEmail, setEditedEmail] = useState('');
    const [editedPhone, setEditedPhone] = useState('');
    const [taxPercentage, setTaxPercentage] = useState(0);
    const [signUpData, setsignUpData] = useState(0);
    const [discountTotal, setdiscountTotal] = useState(0);
    const [invoiceData, setInvoiceData] = useState({
        customername: '', itemname: '', customeremail: '', customerphone: '', invoice_id: '', InvoiceNumber: '', purchaseorder: '',
        date: format(new Date(), 'yyyy-MM-dd'), job: '', duedate: format(addDays(new Date(), 15), 'yyyy-MM-dd'), description: '', itemquantity: '', price: '', discount: '',
        amount: '', discountTotal: '', tax: '', taxpercentage: '', subtotal: '', total: '', amountdue: '', information: '',
    });
    // const [editorData, setEditorData] = useState("<p></p>");
    const [editorData, setEditorData] = useState(``);
    const [noteimageUrl, setnoteImageUrl] = useState('');
    const [alertMessage, setAlertMessage] = useState('');
    const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
    const [hasSignature, setHasSignature] = useState(false);
    const [ownerId, setOwnerId] = useState('');
    const [isAddSignatureSwitchOn, setIsAddSignatureSwitchOn] = useState(false);
    const [isCustomerSignSwitchOn, setIsCustomerSignSwitchOn] = useState(false);
    const [emailOptions, setEmailOptions] = useState([]);
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [credentials, setCredentials] = useState({
        name: '',
        emails: [''],
        number: '',
        citydata: '',
        statedata: '',
        countrydata: '',
        information: '',
        address1: '',
        address2: '',
        post: '',
    });

    const handleEmailChange = (index, value) => {
        const newEmails = [...credentials.emails];
        newEmails[index] = value;
        setCredentials({ ...credentials, emails: newEmails });
    };

    const addEmailField = () => {
        setCredentials({ ...credentials, emails: [...credentials.emails, ''] });
    };

    const removeEmailField = (index) => {
        if (credentials.emails.length > 1) {
            const newEmails = credentials.emails.filter((_, i) => i !== index);
            setCredentials({ ...credentials, emails: newEmails });
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            if (!localStorage.getItem("authToken") || localStorage.getItem("isTeamMember") === "true") {
                navigate("/");
            }
            const getTaxOptions = localStorage.getItem("taxOptions")
            console.log("getTaxOptions:===", JSON.parse(getTaxOptions)[0].name);
            setsignUpData(JSON.parse(getTaxOptions)[0])
            await fetchcustomerdata();
            await fetchitemdata();
            await fetchLastInvoiceNumber();
            await fetchsignupdata();
        };


        if (isNaN(discountTotal)) {
            setdiscountTotal(0);
        }

        fetchData();
        setloading(false);
    }, [])
    let navigate = useNavigate();

    const [countryid, setcountryid] = useState(false);
    const [stateid, setstateid] = useState(false);
    const [cityid, setcityid] = useState(false);

    const [country, setcountry] = useState(false);
    const [state, setstate] = useState(false);
    const [city, setcity] = useState(false);

    const [message1, setMessage1] = useState(false);

    const handleSignatureSwitch = async (event) => {
        if (event.target.checked) {
            try {
                const ownerId = localStorage.getItem('userid');
                const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/check-signature/${ownerId}`);
                const data = await response.json();
                setHasSignature(data.hasSignature);

                if (!data.hasSignature) {
                    setIsSignatureModalOpen(true);
                }
                setIsAddSignatureSwitchOn(true); // Automatically activate "Add My Signature"
                setIsCustomerSignSwitchOn(true); // Automatically activate "Customer to Sign"
            } catch (error) {
                console.error('Error checking signature:', error);
            }
        } else {
            setIsAddSignatureSwitchOn(false);
            setIsCustomerSignSwitchOn(false);
            setHasSignature(false); // Ensure switches are hidden
        }
    };

    const handleAddSignatureSwitch = (event) => {
        setIsAddSignatureSwitchOn(event.target.checked);
        if (!event.target.checked && !isCustomerSignSwitchOn) {
            setHasSignature(false);
        }
    };

    const handleCustomerSignSwitch = (event) => {
        setIsCustomerSignSwitchOn(event.target.checked);
        if (!event.target.checked && !isAddSignatureSwitchOn) {
            setHasSignature(false);
        }
    };

    const saveSignature = async (signatureData) => {
        try {
            const ownerId = localStorage.getItem('userid');
            const email = localStorage.getItem('userEmail');
            const companyname = localStorage.getItem('companyname');
            await fetch(`${import.meta.env.VITE_API_BASE_URL}/ownersignature`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ signature: signatureData, ownerId, email, companyname }),
            });
            setHasSignature(true);
            setIsSignatureModalOpen(false);
        } catch (error) {
            console.error('Error saving signature:', error);
        }
    };

    const roundOff = (value) => {
        return Math.round(value * 100) / 100;
    };
    const fetchLastInvoiceNumber = async () => {
        try {
            const userid = localStorage.getItem('userid');
            const authToken = localStorage.getItem('authToken');
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/lastinvoicenumber/${userid}`, {
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

                // let nextInvoiceNumber = 1;
                // if (json && json.lastInvoiceNumber) {
                //     nextInvoiceNumber = json.lastInvoiceNumber + 1;
                // }
                setInvoiceData({
                    ...invoiceData,
                    InvoiceNumber: `Invoice-${json.lastInvoiceId + 1}`,
                    invoice_id: json.lastInvoiceId + 1,
                });
            }

        } catch (error) {
            console.error('Error fetching last invoice number:', error);
        }
    };


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
                // setTaxPercentage(json.taxPercentage);
                // setsignUpData(json)
                console.log("json: ", json.taxPercentage);
                // }
            }

        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }


    const fetchcustomerdata = async () => {
        try {
            const userid = localStorage.getItem("userid");
            const authToken = localStorage.getItem('authToken');
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/customers/${userid}`, {
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

                if (Array.isArray(json)) {
                    console.log("CustomerData:->    ", json)
                    setcustomers(json);
                }
            }

        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }

    const fetchitemdata = async () => {
        try {
            const userid = localStorage.getItem("userid");
            const authToken = localStorage.getItem('authToken');
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/itemdata/${userid}`, {
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
                if (Array.isArray(json)) {
                    setitems(json);
                }
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }

    // const onChangecustomer=(event)=>{
    //     setSearchcustomerResults([...searchcustomerResults,event]);
    // }

    // const onChangeitem=(event)=>{
    //     setSearchitemResults([...searchitemResults,event]);
    // }

    const onChangeitem = (event) => {
        const newItemId = event.value;
        const newItemLabel = event.label;

        const isItemExists = searchitemResults.some((item) => item.value === newItemId);

        if (!isItemExists) {
            setSearchitemResults([...searchitemResults, { value: newItemId, label: newItemLabel }]);
            setItemExistsMessage(''); // Clear any existing message
        } else {
            setItemExistsMessage('This item is already added!');
        }
    };

    const handleEditorChange = (event, editor) => {
        const data = editor.getData();
        setEditorData(data);
    };

    const onChangeQuantity = (event, itemId) => {
        let newQuantity = event.target.value ? parseFloat(event.target.value) : 1;
        newQuantity = Math.max(newQuantity, 0);

        setQuantityMap((prevMap) => ({
            ...prevMap,
            [itemId]: newQuantity,
        }));
    };

    const onDeleteItem = (itemIdToDelete) => {
        setSearchitemResults((prevResults) => {
            return prevResults.filter((item) => item.value !== itemIdToDelete);
        });
    };

    const onChangecustomer = (event) => {
        const selectedCustomerId = event.value;
        console.log(selectedCustomerId, 'selectedCustomerId');

        setSelectedCustomerId(selectedCustomerId);
        const selectedCustomer = customers.find((customer) => customer._id === selectedCustomerId);

        if (selectedCustomer) {
            setInvoiceData({
                ...invoiceData,
                customername: selectedCustomer.name,
                // customeremail: selectedCustomer.email,
                customerphone: selectedCustomer.number,
            });
            // If multiple emails, ask user to pick
            if (selectedCustomer.emails?.length > 1) {
                setEmailOptions(selectedCustomer.emails);
                setShowEmailModal(true); // open modal
            } else {
                setInvoiceData(prev => ({
                    ...prev,
                    customeremail: selectedCustomer.emails?.[0] || '',
                }));
            }
            setSelectedCustomerDetails({
                name: selectedCustomer.name,
                email: selectedCustomer.emails?.[0] || '',
                // email: selectedCustomer.email,
                number: selectedCustomer.number
            });
            setIsCustomerSelected(true);
        }

        setSearchcustomerResults([...searchcustomerResults, event]);
    };

    const handleNameChange = (e) => {
        const selectedName = e.target.value;
        setEditedName(selectedName);

        const customer = customers.find(c => c.name === selectedName);
        if (customer) {
            setSelectedCustomerId(customer._id);
            // setEditedEmail(customer.email);
            setEditedEmail(customer.emails?.[0] || '');
            setEditedPhone(customer.number);
        }
    };

    // const handleNameChange = (event) => {
    //     const selectedName = event.target.value;
    //     const selectedCustomer = customers.find(customer => customer.name === selectedName);
    //     if (selectedCustomer) {
    //         setEditedName(selectedName);
    //         setEditedEmail(selectedCustomer.email);
    //     }
    // };

    const handleEditCustomer = () => {
        if (!SelectedCustomerId) {
            console.error('Unable to determine SelectedCustomerId');
            return;
        }

        const updatedCustomerDetails = {
            name: editedName,
            email: editedEmail,
            number: editedPhone
        };

        setSelectedCustomerDetails({
            name: editedName,
            email: editedEmail,
            number: editedPhone
        });

        console.log(SelectedCustomerId, 'edited SelectedCustomerId');
        console.log('Updated customer details:', updatedCustomerDetails);
    };


    // const handleEditCustomer = () => {
    //     // console.log(event, "event structure");
    //     // const SelectedCustomerId = event.value || event.target.value || event.id; 
    //     // console.log(SelectedCustomerId, "edited SelectedCustomerId");
    //     // setSelectedCustomerId(SelectedCustomerId);
    //     const updatedCustomerDetails = {
    //         name: editedName,
    //         email: editedEmail,
    //         phone: editedPhone
    //     };

    //     setSelectedCustomerDetails({
    //         name: editedName,
    //         email: editedEmail,
    //         phone: editedPhone
    //     });

    //     setSelectedCustomerDetails(updatedCustomerDetails);
    //     console.log("Updated customer details:", updatedCustomerDetails);
    // };

    const calculateDiscountedAmount = (price, quantity, discount) => {
        const totalAmount = price * quantity;
        const discountedAmount = totalAmount - Math.max(discount, 0); // Ensure discount is not negative
        return discountedAmount > 0 ? discountedAmount : 0;
    };


    const onDiscountChange = (event, itemId) => {
        const discountValue = event.target.value;
        const regex = /^\d*\.?\d{0,2}$/; // Regex to allow up to two decimal places

        // Check if the input matches the allowed format
        if (regex.test(discountValue)) {
            const newDiscount = discountValue !== '' ? parseFloat(discountValue) : 0;
            const selectedPrice = items.find((i) => i._id === itemId)?.price || 0;
            const quantity = quantityMap[itemId] || 1;
            const totalAmount = selectedPrice * quantity;

            const discountedAmount = totalAmount - (totalAmount * newDiscount) / 100;

            setDiscountMap((prevMap) => ({
                ...prevMap,
                [itemId]: newDiscount,
            }));

            // Use discountedAmount in your code where needed
            // console.log('Discounted Amount:', discountedAmount.toFixed(2)); // Output the discounted amount
        } else {
            // Handle invalid input (e.g., show a message to the user)
            console.log('Invalid input for discount');
        }
    };

    const calculateSubtotal = () => {
        let subtotal = 0;

        searchitemResults.forEach((item) => {
            const selectedItem = items.find((i) => i._id === item.value);
            const itemPrice = selectedItem?.price || 0;
            const itemId = item.value;
            const quantity = quantityMap[itemId] || 1;
            const discount = discountMap[itemId] || 0;

            const discountedAmount = calculateDiscountedAmount(itemPrice, quantity, discount);
            console.log("discountedAmount:", discountedAmount);
            subtotal += discountedAmount;
        });

        return roundOff(subtotal);
    };


    const calculateTaxAmount = () => {
        const subtotal = calculateSubtotal();
        const totalDiscountedAmount = subtotal - discountTotal; // Apply overall discount first

        // Calculate tax amount on the discounted amount
        const taxAmount = (totalDiscountedAmount * signUpData.percentage) / 100;
        // const taxAmount = ((subtotal-discountTotal) * taxPercentage) / 100;
        // console.log("taxAmount:", taxAmount, "subtotal:", subtotal, "discountTotal:",discountTotal);
        return roundOff(taxAmount);
    };

    // Function to calculate total amount
    const calculateTotal = () => {
        const subtotal = calculateSubtotal();
        const taxAmount = calculateTaxAmount();
        const discountAmount = discountTotal;
        const totalAmount = subtotal + taxAmount - discountAmount;
        return roundOff(totalAmount);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const userid = localStorage.getItem('userid'); // Assuming you have user ID stored in local storage
            const authToken = localStorage.getItem('authToken');

            await new Promise(resolve => setTimeout(resolve, 100));

            const invoiceItems = searchitemResults.map((item) => {
                const selectedItem = items.find((i) => i._id === item.value);
                const itemPrice = selectedItem?.price || 0;
                const unit = selectedItem?.unit || 0;
                const itemId = item.value;
                const quantity = quantityMap[itemId] || 1;
                const discount = discountMap[itemId] || 0;
                const discountedAmount = calculateDiscountedAmount(itemPrice, quantity, discount);

                return {
                    itemId: itemId,
                    itemname: selectedItem.itemname,
                    itemquantity: quantity,
                    price: itemPrice,
                    discount,
                    unit,
                    description: selectedItem.description,
                    amount: discountedAmount, // Add subtotal to each item
                    //   total: calculateTotal(), // Calculate total for each item
                    //   amountdue: calculateTotal() // Amount due is also total for each item initially
                };
            });

            // setSelectedCustomerId(SelectedCustomerId);
            const selectedCustomer = customers.find((customer) => customer._id === SelectedCustomerId);

            // Validate customer fields
            if (!selectedCustomerDetails.name || !selectedCustomerDetails.email) {
                alert('Customer name, email, and phone are required. Please fill out these details.');
                return;
            }

            // Summing up subtotal, total, and amount due for the entire invoice
            const subtotal = invoiceItems.reduce((acc, curr) => acc + curr.amount, 0);
            const total = calculateTotal();
            const amountdue = total;
            const taxAmount = calculateTaxAmount(); // Calculate tax amount based on subtotal and tax percentage

            const taxPercentageValue = taxPercentage; // Retrieve tax percentage from invoiceData state

            const data = {
                userid: userid,
                customername: selectedCustomerDetails.name,
                customeremail: selectedCustomerDetails.email,
                customerphone: selectedCustomerDetails.number,
                invoice_id: invoiceData.invoice_id,
                InvoiceNumber: invoiceData.InvoiceNumber,
                purchaseorder: invoiceData.purchaseorder,
                job: invoiceData.job || 'No Job',
                discountTotal: discountTotal || 0,
                information: editorData,
                date: invoiceData.date,
                items: invoiceItems,
                duedate: invoiceData.duedate,
                subtotal: subtotal,
                total: total,
                tax: taxAmount,
                taxpercentage: signUpData.percentage,
                amountdue: amountdue,
                noteimageUrl: noteimageUrl,
                isAddSignature: isAddSignatureSwitchOn,
                isCustomerSign: isCustomerSignSwitchOn,
            };
            console.log(data, "Invoice Data ====");

            // Sending invoice data to the backend API
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/savecreateinvoice`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': authToken,
                },
                body: JSON.stringify({ userid, invoiceData: data }),
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
                        const invoiceid = responseData.invoice._id;
                        console.log("After Invoice responseData:", responseData);
                        navigate('/userpanel/Invoicedetail', { state: { invoiceid } });
                        console.log(responseData, 'Invoice saved successfully!');
                    } else {
                        console.error('Failed to save the invoice.');
                    }
                } else {
                    const responseData = await response.json();
                    setmessage(true);
                    setAlertShow(responseData.error)
                    console.error('Failed to save the invoice.');
                }
            }
        } catch (error) {
            console.error('Error creating invoice:', error);
        }
    };

    // const handleImageUpload = async (file) => {
    //     const formData = new FormData();
    //     formData.append('file', file);
    //     formData.append('upload_preset', 'restrocloudnary'); // Replace with your Cloudinary upload preset
    //     formData.append('cloud_name', 'dlq5b1jed'); // Replace with your Cloudinary cloud name

    //     // Upload image to Cloudinary
    //     const response = await fetch('https://api.cloudinary.com/v1_1/dlq5b1jed/image/upload', {
    //         method: 'POST',
    //         body: formData,
    //     });

    //     if (!response.ok) {
    //         throw new Error('Failed to upload image to Cloudinary');
    //     }

    //     const cloudinaryData = await response.json();

    //     console.log(cloudinaryData.secure_url, "cloudinaryData.secure_url");
    //     setCloudImage(cloudinaryData.secure_url)
    //             return { default: cloudinaryData.secure_url }; // Return the URL of the uploaded image
    // };


    // Alert Component
    const Alert = ({ message }) => {
        return (
            <div className="alert alert-danger" role="alert">
                {message}
            </div>

        );
    };


    const onchange = (event) => {
        if (event.target.name == "InvoiceNumber") {
            const parts = (event.target.value).split("-");
            setInvoiceData({ ...invoiceData, ["invoice_id"]: parts[1], [event.target.name]: event.target.value });
        } else {
            // invoice_id
            setInvoiceData({ ...invoiceData, [event.target.name]: event.target.value });
        }
    };

    const onChangePrice = (event, itemId) => {
        const { value } = event.target;
        const numericValue = value.replace(/[^0-9.]/g, ''); // Remove any non-numeric characters except decimal point

        // Limit the numeric value to two decimal places
        const decimalIndex = numericValue.indexOf('.');
        let formattedValue = numericValue;
        if (decimalIndex !== -1) {
            formattedValue = numericValue.slice(0, decimalIndex + 1) + numericValue.slice(decimalIndex + 1).replace(/[^0-9]/g, '').slice(0, 2);
        }

        const newPrice = parseFloat(formattedValue) || 0;

        // Update the item's price in the items array
        const updatedItems = items.map(item => {
            if (item._id === itemId) {
                return {
                    ...item,
                    price: formattedValue // Update with formatted value
                };
            }
            return item;
        });

        setitems(updatedItems);
    };

    const onChangeDescription = (event, editor, itemId) => {
        const value = editor.getData();

        // Update the items array in the state with the new description for the specified item
        const updatedItems = items.map((item) => {
            if (item._id === itemId) {
                return {
                    ...item,
                    description: value,
                };
            }
            return item;
        });

        // Update the state with the updated items array
        setitems(updatedItems);
    };

    const handleDiscountChange = (event) => {
        const value = event.target.value;
        // If the input is empty or NaN, set the value to 0
        const newValue = value === '' || isNaN(parseFloat(value)) ? 0 : parseFloat(value);
        setdiscountTotal(newValue);
    };
    const handleAddCustomer = async (e) => {
        e.preventDefault();
        let userid = localStorage.getItem('userid');
        const authToken = localStorage.getItem('authToken');
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/addcustomer`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': authToken,
            },
            body: JSON.stringify({
                userid: userid,
                name: credentials.name,
                emails: credentials.emails,
                information: credentials.information,
                number: credentials.number,
                city: city,
                state: state,
                country: country,
                citydata: credentials.citydata,
                statedata: credentials.statedata,
                countrydata: credentials.countrydata,
                cityid: cityid,
                stateid: stateid,
                countryid: countryid,
                address1: credentials.address1,
                address2: credentials.address2,
                post: credentials.post,
            }),
        });

        console.log(response, "response");

        if (response.status === 401) {
            const json = await response.json();
            setAlertMessage(json.message);
            setloading(false);
            window.scrollTo(0, 0);
            return; // Stop further execution
        }
        else {
            const json = await response.json();
            console.log(json, "Happy");

            if (json.success) {
                setCredentials({
                    name: '',
                    emails: [''],
                    number: '',
                    citydata: '',
                    statedata: '',
                    countrydata: '',
                    information: '',
                    address1: '',
                    address2: '',
                    post: '',
                });

                setMessage1(true);
                setAlertShow(json.message);
                window.location.reload();
                //   navigate('/userpanel/Customerlist');
            }
            else {

                alert("This Customer Email already exist 3232")
            }
        }
    };

    const onchangeaddcustomer = (event) => {
        setCredentials({ ...credentials, [event.target.name]: event.target.value });
    };


    return (
        <div className='min-h-screen bg-background'>
            {loading ? (
                <div className="flex h-screen items-center justify-center">
                    <ColorRing
                        loading={loading}
                        display="flex"
                        aria-label="Loading Spinner"
                        data-testid="loader"
                    />
                </div>
            ) : (
                <div className="flex flex-col md:flex-row">
                    <Sidebar />
                    <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 py-6">
                        <form onSubmit={handleSubmit}>
                            {/* Modern Header Section */}
                            <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                                <div>
                                    <h1 className="text-3xl font-bold text-textMain tracking-tight mb-1">Create Invoice</h1>
                                    <nav aria-label="breadcrumb">
                                        <ol className="flex items-center space-x-2 text-sm text-textMuted">
                                            <li><a href="/Userpanel/Userdashboard" className="hover:text-primary transition-colors">Dashboard</a></li>
                                            <li className="before:content-['/'] before:mr-2">Invoice</li>
                                        </ol>
                                    </nav>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button 
                                        type="submit" 
                                        className="btn-primary px-8 py-2.5 rounded-std font-bold shadow-soft transition-all hover:-translate-y-0.5"
                                    >
                                        Save Invoice
                                    </button>
                                </div>
                            </header>

                            {alertMessage && (
                                <div className="mb-6 animate-in fade-in slide-in-from-top-4 duration-300">
                                    <Alertauthtoken message={alertMessage} onClose={() => setAlertMessage('')} />
                                </div>
                            )}

                            {/* Top Info Grid */}
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
                                {/* Left Section: Customer Info */}
                                <div className="lg:col-span-4 flex flex-col gap-6">
                                    <div className="card-standard p-6 flex flex-col h-full justify-between">
                                        <div>
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="font-bold text-gray-800 text-lg uppercase tracking-wider">Customer</h3>
                                                <div className="form-check form-switch flex items-center gap-2">
                                                    <label className="text-xs text-textMuted" htmlFor="signatureSwitch">Enable Signatures</label>
                                                    <input
                                                        className="form-check-input"
                                                        type="checkbox"
                                                        role="switch"
                                                        id="signatureSwitch"
                                                        onChange={handleSignatureSwitch}
                                                        checked={hasSignature}
                                                    />
                                                </div>
                                            </div>

                                            {isCustomerSelected ? (
                                                <div className="space-y-4">
                                                    <div className="flex items-start justify-between">
                                                        <div>
                                                            <p className="text-2xl font-bold text-textMain leading-tight">{selectedCustomerDetails.name}</p>
                                                            <p className="text-textMuted text-sm font-medium mt-1">{selectedCustomerDetails.email}</p>
                                                            <p className="text-textMuted text-sm">{selectedCustomerDetails.number}</p>
                                                        </div>
                                                        <button 
                                                            type="button"
                                                            data-bs-toggle="modal" 
                                                            data-bs-target="#exampleModal"
                                                            className="text-primary hover:text-blue-700 font-bold text-sm bg-blue-50 px-3 py-1 rounded-full transition-colors"
                                                        >
                                                            Edit
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="space-y-4">
                                                    <div className="relative">
                                                        <label className="text-sm text-textMuted mb-1 block">Select Customer</label>
                                                        <div className="flex gap-2">
                                                            <div className="flex-1">
                                                                <Select
                                                                    value={searchcustomerResults}
                                                                    onChange={onChangecustomer}
                                                                    options={customers.map(customer => ({
                                                                        value: customer._id,
                                                                        label: customer.name,
                                                                    }))}
                                                                    placeholder="Search customers..."
                                                                    className="react-select-container"
                                                                    classNamePrefix="react-select"
                                                                    required
                                                                />
                                                            </div>
                                                            <button 
                                                                type="button" 
                                                                className="btn font-bold text-white bg-green-500 hover:bg-green-600 rounded-std px-3 transition-colors"
                                                                data-bs-toggle="modal" 
                                                                data-bs-target="#exampleModal1"
                                                            >
                                                                <i className="fas fa-plus"></i>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {hasSignature && (
                                            <div className="mt-6 pt-6 border-t border-borderLight flex flex-col space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <label className="text-sm font-medium text-textMuted" htmlFor="addSignatureSwitch">My Signature</label>
                                                    <input
                                                        className="form-check-input"
                                                        type="checkbox"
                                                        role="switch"
                                                        id="addSignatureSwitch"
                                                        checked={isAddSignatureSwitchOn}
                                                        onChange={handleAddSignatureSwitch}
                                                    />
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <label className="text-sm font-medium text-textMuted" htmlFor="customerSignSwitch">Customer to Sign</label>
                                                    <input
                                                        className="form-check-input"
                                                        type="checkbox"
                                                        role="switch"
                                                        id="customerSignSwitch"
                                                        checked={isCustomerSignSwitchOn}
                                                        onChange={handleCustomerSignSwitch}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    {isSignatureModalOpen && (
                                        <SignatureModal
                                            onSave={saveSignature}
                                            onClose={() => setIsSignatureModalOpen(false)}
                                        />
                                    )}
                                </div>

                                {/* Right Section: Invoice Metadata */}
                                <div className="lg:col-span-8">
                                    <div className="card-standard p-6 h-full">
                                        <h3 className="font-bold text-gray-800 text-lg uppercase tracking-wider mb-6">Invoice Details</h3>
                                        
                                        {message === true && (
                                            <div className="alert alert-warning alert-dismissible fade show mb-6 rounded-std border-yellow-200" role="alert">
                                                <i className="fas fa-exclamation-triangle mr-2"></i>
                                                <strong>{alertShow}</strong>
                                                <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                                            </div>
                                        )}

                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
                                            <div className="space-y-1">
                                                <label htmlFor="invoicenumbr" className="text-xs font-bold text-textMuted uppercase tracking-tight">Invoice Number</label>
                                                <input
                                                    type="text"
                                                    name="InvoiceNumber"
                                                    className="input-standard"
                                                    value={invoiceData.InvoiceNumber}
                                                    onChange={onchange}
                                                    id="invoicenumbr"
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label htmlFor="purchaseoder" className="text-xs font-bold text-textMuted uppercase tracking-tight">PO Number #</label>
                                                <input
                                                    type="text"
                                                    name="purchaseorder"
                                                    className="input-standard"
                                                    onChange={onchange}
                                                    id="purchaseoder"
                                                    placeholder="Optional"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label htmlFor="Date" className="text-xs font-bold text-textMuted uppercase tracking-tight">Invoice Date</label>
                                                <input
                                                    type="date"
                                                    name="date"
                                                    className="input-standard"
                                                    value={invoiceData.date}
                                                    onChange={onchange}
                                                    id="Date"
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label htmlFor="Job" className="text-xs font-bold text-textMuted uppercase tracking-tight">Job / Project</label>
                                                <input
                                                    type="text"
                                                    name="job"
                                                    className="input-standard"
                                                    value={invoiceData.job}
                                                    onChange={onchange}
                                                    id="job"
                                                    placeholder="Project name"
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label htmlFor="duedate" className="text-xs font-bold text-textMuted uppercase tracking-tight">Due Date</label>
                                                <input
                                                    type="date"
                                                    name="duedate"
                                                    className="input-standard font-semibold text-primary"
                                                    value={invoiceData.duedate}
                                                    onChange={onchange}
                                                    id="duedate"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Line Items Section */}
                            <section className="card-standard overflow-hidden mb-8 border-none shadow-premium">
                                <div className="bg-gray-50/80 px-6 py-4 border-b border-borderLight flex items-center justify-between">
                                    <h3 className="font-bold text-gray-800 text-lg uppercase tracking-wider">Line Items</h3>
                                    <div className="w-64">
                                        <Select
                                            value={null}
                                            onChange={onChangeitem}
                                            options={items.map(item => ({
                                                value: item._id,
                                                label: item.itemname,
                                            }))}
                                            placeholder="+ Add Item"
                                            className="react-select-container-sm"
                                            classNamePrefix="react-select-sm"
                                        />
                                    </div>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-gray-50/50 text-textMuted text-xs uppercase tracking-widest font-bold">
                                            <tr>
                                                <th className="px-6 py-4 w-1/2">Item & Description</th>
                                                <th className="px-6 py-4 text-center">Qty</th>
                                                <th className="px-6 py-4 text-center">Unit</th>
                                                <th className="px-6 py-4 text-center">Price</th>
                                                <th className="px-6 py-4 text-right pr-8">Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-borderLight">
                                            {searchitemResults.map((item) => {
                                                const selectedItem = items.find((i) => i._id === item.value);
                                                const itemPrice = selectedItem?.price || 0;
                                                const itemId = item.value;
                                                const quantity = quantityMap[itemId] || 1;
                                                const discount = discountMap[itemId] || 0;
                                                const discountedAmount = calculateDiscountedAmount(itemPrice, quantity, discount);
                                                const formattedTotalAmount = Number(discountedAmount).toLocaleString('en-IN');

                                                return (
                                                    <tr key={item.value} className="hover:bg-blue-50/30 transition-colors group">
                                                        <td className="px-6 py-6">
                                                            <div className="flex items-start justify-between mb-4">
                                                                <span className="font-bold text-textMain text-lg">{item.label}</span>
                                                                <button 
                                                                    type="button" 
                                                                    className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity" 
                                                                    onClick={() => onDeleteItem(item.value)}
                                                                >
                                                                    <i className="fas fa-trash-alt"></i>
                                                                </button>
                                                            </div>
                                                            <div className="ckeditor-slim border rounded-std overflow-hidden">
                                                                <CKEditor
                                                                    editor={ClassicEditor}
                                                                    data={selectedItem?.description || ''}
                                                                    name={`description-${itemId}`}
                                                                    onChange={(event, editor) => onChangeDescription(event, editor, itemId)}
                                                                />
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-6 text-center align-top">
                                                            <input
                                                                type="number"
                                                                className="input-standard text-center w-20 mx-auto"
                                                                value={quantity}
                                                                onChange={(event) => onChangeQuantity(event, itemId)}
                                                                required
                                                            />
                                                        </td>
                                                        <td className="px-6 py-6 text-center align-top">
                                                            <span className="text-textMuted font-medium text-sm">{selectedItem?.unit}</span>
                                                        </td>
                                                        <td className="px-6 py-6 text-center align-top">
                                                            <div className="relative">
                                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted"><CurrencySign /></span>
                                                                <input
                                                                    type="text"
                                                                    className="input-standard pl-8 text-right font-medium"
                                                                    value={itemPrice}
                                                                    onChange={(event) => onChangePrice(event, itemId)}
                                                                    required
                                                                />
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-6 text-right pr-8 align-top">
                                                            <div className="text-lg font-bold text-textMain">
                                                                <CurrencySign />{formattedTotalAmount}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                                {itemExistsMessage && (
                                    <div className="mx-6 my-4 p-3 bg-yellow-50 text-yellow-700 text-sm font-medium rounded-std border border-yellow-100 italic">
                                        <i className="fas fa-info-circle mr-2"></i> {itemExistsMessage}
                                    </div>
                                )}
                            </section>

                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                                {/* Notes Section */}
                                <div className="lg:col-span-7">
                                    <div className="card-standard p-6">
                                        <h3 className="font-bold text-gray-800 text-lg uppercase tracking-wider mb-4">Invoice Notes</h3>
                                        <div className="border border-borderLight rounded-std overflow-hidden">
                                            <CKEditor
                                                editor={ClassicEditor}
                                                data={editorData}
                                                onChange={handleEditorChange}
                                                config={{
                                                    extraPlugins: [MyCustomUploadAdapterPlugin],
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Summary & Totals */}
                                <div className="lg:col-span-5">
                                    <div className="card-standard p-8 bg-blue-50/30 border-blue-100 shadow-premium">
                                        <h3 className="font-bold text-gray-800 text-lg uppercase tracking-wider mb-6">Financial Summary</h3>
                                        
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center text-textMain">
                                                <span className="font-medium">Subtotal</span>
                                                <span className="font-bold text-lg"><CurrencySign />{calculateSubtotal().toLocaleString('en-IN')}</span>
                                            </div>
                                            
                                            <div className="flex justify-between items-center">
                                                <span className="text-textMuted font-medium">Discount Amount</span>
                                                <div className="relative w-32">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted text-xs"><CurrencySign /></span>
                                                    <input
                                                        type="number"
                                                        className="input-standard pl-8 text-right font-bold text-red-500 py-1"
                                                        value={discountTotal}
                                                        onChange={handleDiscountChange}
                                                        min="0"
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex justify-between items-center text-textMuted">
                                                <span className="font-medium text-sm capitalize">{signUpData.name} ({signUpData.percentage}%)</span>
                                                <span className="font-bold text-md text-textMain"><CurrencySign />{calculateTaxAmount().toLocaleString('en-IN')}</span>
                                            </div>

                                            <div className="pt-6 mt-6 border-t-2 border-dashed border-blue-200">
                                                <div className="flex justify-between items-end mb-2">
                                                    <span className="text-xl font-black text-textMain leading-none uppercase tracking-tighter">Total Amount</span>
                                                    <span className="text-4xl font-black text-primary leading-none">
                                                        <CurrencySign />{calculateTotal().toLocaleString('en-IN')}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center bg-white/70 p-3 rounded-std border border-blue-100 shadow-soft">
                                                    <span className="text-xs font-bold text-textMuted uppercase">Balance Due</span>
                                                    <span className="text-xl font-black text-red-600"><CurrencySign />{calculateTotal().toLocaleString('en-IN')}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </main>
                </div>
            )}




            {/* Customer Modals */}
            <div className="customer-modals-container">
            <div className="modal fade" id="exampleModal" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered modal-lg">
                    <div className="modal-content border-none shadow-premium rounded-std overflow-hidden">
                        <div className="modal-header bg-gray-50 border-b border-borderLight px-8 py-6">
                            <h1 className="modal-title text-2xl font-black text-textMain tracking-tighter" id="exampleModalLabel uppercase">Edit Customer Profile</h1>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body p-8 bg-white">
                            <div className="space-y-6">
                                <div className="space-y-1">
                                    <label htmlFor="customerName" className="text-xs font-bold text-textMuted uppercase">Select Customer</label>
                                    <select className="input-standard font-medium py-3" id="customerName" value={editedName} onChange={handleNameChange}>
                                        <option value="" disabled>Choose a name...</option>
                                        {customers.map(customer => (
                                            <option key={customer._id} value={customer.name}>{customer.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1">
                                        <label htmlFor="customerEmail" className="text-xs font-bold text-textMuted uppercase">Primary Email</label>
                                        <select
                                            className="input-standard py-3"
                                            id="customerEmail"
                                            value={editedEmail}
                                            onChange={(e) => setEditedEmail(e.target.value)}
                                        >
                                            <option value="">-- Choose an email --</option>
                                            {customers.find(c => c.name === editedName)?.emails?.map((email, index) => (
                                                <option key={index} value={email}>{email}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label htmlFor="customerPhone" className="text-xs font-bold text-textMuted uppercase">Phone Number</label>
                                        <input 
                                            type="text" 
                                            className="input-standard py-3" 
                                            id="customerPhone" 
                                            value={editedPhone} 
                                            onChange={(e) => setEditedPhone(e.target.value)} 
                                            placeholder="e.g. +1 234 567 890"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer bg-gray-50 border-t border-borderLight px-8 py-4 gap-3">
                            <button type="button" className="btn-secondary px-6 rounded-std font-bold" data-bs-dismiss="modal">Cancel</button>
                            <button type="button" className="btn-primary px-8 rounded-std font-bold shadow-soft" data-bs-dismiss="modal" onClick={handleEditCustomer}>Update Customer</button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="modal fade" id="exampleModal1" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered modal-xl">
                    <div className="modal-content border-none shadow-premium rounded-std overflow-hidden">
                        <div className="modal-header bg-gray-50 border-b border-borderLight px-8 py-6">
                            <h1 className="modal-title text-2xl font-black text-textMain tracking-tighter" id="exampleModalLabel uppercase">New Customer Registration</h1>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body p-8 bg-white max-h-[80vh] overflow-y-auto custom-scrollbar">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {/* Basic Info */}
                                <div className="space-y-1 lg:col-span-1">
                                    <label className="text-xs font-bold text-textMuted uppercase">Customer Name</label>
                                    <input
                                        type="text"
                                        className="input-standard py-3"
                                        name="name"
                                        value={credentials.name}
                                        onChange={onchangeaddcustomer}
                                        placeholder="Company or Individual Name"
                                        required
                                    />
                                </div>
                                <div className="space-y-1 lg:col-span-1">
                                    <label className="text-xs font-bold text-textMuted uppercase">Phone Number</label>
                                    <input
                                        type="text"
                                        name="number"
                                        value={credentials.number}
                                        onChange={onchangeaddcustomer}
                                        className="input-standard py-3"
                                        placeholder="Contact Phone"
                                    />
                                </div>

                                {/* Emails Section */}
                                <div className="space-y-3 lg:col-span-1">
                                    <label className="text-xs font-bold text-textMuted uppercase">Email Contacts</label>
                                    {credentials.emails.map((email, index) => (
                                        <div className="flex gap-2" key={index}>
                                            <input
                                                type="email"
                                                className="input-standard flex-1"
                                                value={email}
                                                onChange={(e) => handleEmailChange(index, e.target.value)}
                                                placeholder={`Email #${index + 1}`}
                                                required
                                            />
                                            {index > 0 && (
                                                <button type="button" className="text-red-500 p-2" onClick={() => removeEmailField(index)}>
                                                    <i className="fas fa-minus-circle"></i>
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    <button type="button" className="text-primary text-xs font-bold uppercase tracking-wider flex items-center hover:underline" onClick={addEmailField}>
                                        <i className="fas fa-plus-circle mr-1"></i> Add Another Email
                                    </button>
                                </div>

                                {/* Address Section */}
                                <div className="lg:col-span-3 pt-6 border-t border-borderLight mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-textMuted uppercase">Street Address</label>
                                        <input
                                            type="text"
                                            name="address1"
                                            value={credentials.address1}
                                            onChange={onchangeaddcustomer}
                                            className="input-standard"
                                            placeholder="Address line 1"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-textMuted uppercase">Apt / Suite</label>
                                        <input
                                            type="text"
                                            name="address2"
                                            value={credentials.address2}
                                            onChange={onchangeaddcustomer}
                                            className="input-standard"
                                            placeholder="Address line 2"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-textMuted uppercase">Postal Code</label>
                                        <input
                                            type="text"
                                            name="post"
                                            value={credentials.post}
                                            onChange={onchangeaddcustomer}
                                            className="input-standard"
                                            placeholder="ZIP / Postal Code"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-textMuted uppercase text-xs">Country</label>
                                        <CountrySelect
                                            name="country"
                                            value={credentials.countryid}
                                            onChange={(val) => {
                                                setcountryid(val.id);
                                                setcountry(val.name);
                                                setCredentials({ ...credentials, countrydata: JSON.stringify(val) });
                                            }}
                                            valueType="short"
                                            placeHolder="Select Country"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-textMuted uppercase text-xs">State / Province</label>
                                        <StateSelect
                                            name="state"
                                            countryid={countryid}
                                            onChange={(val) => {
                                                setstateid(val.id);
                                                setstate(val.name);
                                                setCredentials({ ...credentials, statedata: JSON.stringify(val) });
                                            }}
                                            placeHolder="Select State"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-textMuted uppercase text-xs">City</label>
                                        <CitySelect
                                            countryid={countryid}
                                            stateid={stateid}
                                            onChange={(val) => {
                                                setcityid(val.id);
                                                setcity(val.name);
                                                setCredentials({ ...credentials, citydata: JSON.stringify(val) });
                                            }}
                                            placeHolder="Select City"
                                        />
                                    </div>
                                </div>

                                <div className="lg:col-span-3 pt-6 border-t border-borderLight mt-4">
                                    <label className="text-xs font-bold text-textMuted uppercase mb-1 block">Additional Information / Notes</label>
                                    <textarea
                                        name="information"
                                        value={credentials.information}
                                        onChange={onchangeaddcustomer}
                                        className="input-standard min-h-[100px] py-3"
                                        placeholder="Add any specific requirements for this customer..."
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer bg-gray-50 border-t border-borderLight px-8 py-4 gap-3">
                            <button type="button" className="btn-secondary px-6 rounded-std font-bold" data-bs-dismiss="modal">Close</button>
                            <button
                                type="button"
                                className="btn-primary px-10 rounded-std font-bold shadow-soft"
                                onClick={handleAddCustomer}
                                data-bs-dismiss="modal"
                            >
                                Register Customer
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            </div>

            {showEmailModal && (
                <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Select an Email for Invoice</h5>
                                <button type="button" className="btn-close" onClick={() => setShowEmailModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <p>This customer has multiple emails. Please select one:</p>
                                {emailOptions.map((email, index) => (
                                    <div className="form-check" key={index}>
                                        <input
                                            className="form-check-input"
                                            type="radio"
                                            name="selectedEmail"
                                            id={`email-${index}`}
                                            value={email}
                                            onChange={() => {
                                                setInvoiceData(prev => ({
                                                    ...prev,
                                                    customeremail: email,
                                                }));
                                                setSelectedCustomerDetails(prev => ({
                                                    ...prev,
                                                    email: email,
                                                }));
                                                setShowEmailModal(false);
                                            }}
                                        />
                                        <label className="form-check-label" htmlFor={`email-${index}`}>
                                            {email}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    )
}
