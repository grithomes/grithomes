import React, { useState, useEffect, useRef } from 'react'
import { format, addDays } from 'date-fns';
import { useNavigate } from 'react-router-dom'
import { ColorRing } from 'react-loader-spinner'
import Usernav from './Usernav';
import Usernavbar from './Usernavbar';
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
                const response = await fetch(`https://grithomes.onrender.com/api/check-signature/${ownerId}`);
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
            await fetch('https://grithomes.onrender.com/api/ownersignature', {
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
            const response = await fetch(`https://grithomes.onrender.com/api/lastinvoicenumber/${userid}`, {
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
            const response = await fetch(`https://grithomes.onrender.com/api/getsignupdata/${userid}`, {
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
            const response = await fetch(`https://grithomes.onrender.com/api/customers/${userid}`, {
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
            const response = await fetch(`https://grithomes.onrender.com/api/itemdata/${userid}`, {
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
            const response = await fetch('https://grithomes.onrender.com/api/savecreateinvoice', {
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
        const response = await fetch('https://grithomes.onrender.com/api/addcustomer', {
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
        <div className='bg'>
            {
                loading ?
                    <div className='row'>
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
                    <div className='container-fluid'>
                        <div className="row">
                            <div className='col-lg-2 col-md-3 vh-100 b-shadow bg-white d-lg-block d-md-block d-none'>
                                <div  >
                                    <Usernavbar />
                                </div>
                            </div>

                            <div className="col-lg-10 col-md-9 col-12 mx-auto">
                                <div className='d-lg-none d-md-none d-block mt-2'>
                                    <Usernav />
                                </div>
                                <div className='mx-4'>
                                    <form onSubmit={handleSubmit}>
                                        <div className='row py-4 px-2 breadcrumbclr'>
                                            <div className="col-lg-4 col-md-6 col-sm-12 col-7 me-auto">
                                                <p className='fs-35 fw-bold'>Invoice</p>
                                                <nav aria-label="breadcrumb">
                                                    <ol class="breadcrumb mb-0">
                                                        <li class="breadcrumb-item"><a href="/Userpanel/Userdashboard" className='txtclr text-decoration-none'>Dashboard</a></li>
                                                        <li class="breadcrumb-item active" aria-current="page">Invoice</li>
                                                    </ol>
                                                </nav>
                                            </div>
                                            <div className="col-lg-3 col-md-4 col-sm-12 col-5 text-right">
                                                <button className='btn rounded-pill btn-danger text-white fw-bold' type="submit">Save</button>
                                            </div>

                                            <div className='mt-4'>
                                                {alertMessage && <Alertauthtoken message={alertMessage} onClose={() => setAlertMessage('')} />}
                                            </div>
                                        </div>

                                        <div className="row">
                                            <div className="col-lg-3 col-12">
                                                <div className='box1 rounded adminborder p-4 my-2 mx-0 mb-5'>
                                                    <div className="form-check form-switch">
                                                        <div>
                                                            <label className="form-check-label" htmlFor="signatureSwitch">Signature</label>
                                                            <input
                                                                className="form-check-input"
                                                                type="checkbox"
                                                                role="switch"
                                                                id="signatureSwitch"
                                                                onChange={handleSignatureSwitch}
                                                                checked={hasSignature}
                                                            />
                                                        </div>
                                                        {hasSignature && (
                                                            <>
                                                                <div>
                                                                    <label className="form-check-label" htmlFor="addSignatureSwitch">Add My Signature</label>
                                                                    <input
                                                                        className="form-check-input"
                                                                        type="checkbox"
                                                                        role="switch"
                                                                        id="addSignatureSwitch"
                                                                        checked={isAddSignatureSwitchOn}
                                                                        onChange={handleAddSignatureSwitch}
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <label className="form-check-label" htmlFor="customerSignSwitch">Customer to Sign</label>
                                                                    <input
                                                                        className="form-check-input"
                                                                        type="checkbox"
                                                                        role="switch"
                                                                        id="customerSignSwitch"
                                                                        checked={isCustomerSignSwitchOn}
                                                                        onChange={handleCustomerSignSwitch}
                                                                    />
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                                {isSignatureModalOpen && (
                                                    <SignatureModal
                                                        onSave={saveSignature}
                                                        onClose={() => setIsSignatureModalOpen(false)}
                                                    />
                                                )}
                                            </div>
                                            <div className="col-lg-12 col-12 order-2 order-lg-1">
                                                <div className='box1 rounded adminborder p-4 m-2 mb-5'>
                                                    <div className='row me-2'>
                                                        <div className="col-md-6 col-lg-5 col-12">
                                                            {isCustomerSelected ? (
                                                                <div className="customerdetail p-3">
                                                                    <ul>
                                                                        <li className='fw-bold fs-4'>{selectedCustomerDetails.name}</li>
                                                                        <li>
                                                                            <a href="" className='text-decoration-none' data-bs-toggle="modal" data-bs-target="#exampleModal">Edit</a>
                                                                        </li>
                                                                    </ul>
                                                                    <p className='m-0'>{selectedCustomerDetails.email}</p>
                                                                    <p>{selectedCustomerDetails.number}</p>
                                                                </div>
                                                            ) : (
                                                                <div className="search-container forms">
                                                                    <p className='fs-20 mb-0'>Select Customers</p>
                                                                    <div className="row">
                                                                        <div className="col-6">
                                                                            {/* <VirtualizedSelect
                                                                                id="searchitems"
                                                                                name="customername"
                                                                                className="form-control zindex op pl-0"
                                                                                placeholder=""
                                                                                onChange={onChangecustomer}
                                                                                required
                                                                                options={customers.map((customer, index) =>
                                                                                    ({ label: customer.name, value: customer._id })

                                                                                )}
                                                                            /> */}
                                                                            <Select
                                                                                value={searchcustomerResults}
                                                                                onChange={onChangecustomer}
                                                                                options={customers.map(customer => ({
                                                                                    value: customer._id,
                                                                                    label: customer.name,
                                                                                }))}
                                                                                placeholder=""
                                                                                required
                                                                            />

                                                                        </div>
                                                                        <div className="col-3">
                                                                            <a role='button' className="btn btn-success btn-sm me-2 text-white mt-2" data-bs-toggle="modal" data-bs-target="#exampleModal1">
                                                                                <i class="fa-solid fa-plus"></i>
                                                                            </a>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}

                                                        </div>
                                                        <div className="col-lg-7 col-md-6">
                                                            <div className="row">
                                                                {message == true ? (
                                                                    <div className="alert alert-warning alert-dismissible fade show" role="alert">
                                                                        <strong>{alertShow}</strong>
                                                                        <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                                                                    </div>
                                                                ) : (
                                                                    ""
                                                                )}
                                                                <div className="col-lg-6">
                                                                    <div className="mb-3">
                                                                        <label htmlFor="invoicenumbr" className="form-label">
                                                                            Invoice Number
                                                                        </label>
                                                                        <input
                                                                            type="text"
                                                                            name="InvoiceNumber"
                                                                            className="form-control"
                                                                            value={invoiceData.InvoiceNumber}
                                                                            onChange={onchange}
                                                                            // placeholder="Invoice Number"
                                                                            id="invoicenumbr"
                                                                            required
                                                                        />
                                                                    </div>
                                                                </div>
                                                                <div className="col-lg-6">
                                                                    <div className="mb-3">
                                                                        <label htmlFor="purchaseoder" className="form-label">
                                                                            Purchase Order (PO) #
                                                                        </label>
                                                                        <input
                                                                            type="text"
                                                                            name="purchaseorder"
                                                                            className="form-control"
                                                                            onChange={onchange}
                                                                            id="purchaseoder"
                                                                        />
                                                                    </div>
                                                                </div>
                                                                <div className="col-lg-6">
                                                                    <div className="mb-3">
                                                                        <label htmlFor="Date" className="form-label">
                                                                            Date
                                                                        </label>
                                                                        <input
                                                                            type="date"
                                                                            name="date"
                                                                            className="form-control"
                                                                            value={invoiceData.date}
                                                                            onChange={onchange}
                                                                            // placeholder="Date"
                                                                            id="Date"
                                                                            required
                                                                        />
                                                                    </div>
                                                                </div>
                                                                <div className="col-lg-6">
                                                                    <div className="mb-3">
                                                                        <label htmlFor="Job" className="form-label">
                                                                            Job
                                                                        </label>
                                                                        <input
                                                                            type="text"
                                                                            name="job"
                                                                            className="form-control"
                                                                            value={invoiceData.job}
                                                                            onChange={onchange}
                                                                            // placeholder="Date"
                                                                            id="job"
                                                                            required
                                                                        />
                                                                    </div>
                                                                </div>
                                                                <div className="col-lg-6">
                                                                    <div className="mb-3">
                                                                        <label htmlFor="duedate" className="form-label">
                                                                            Due Date
                                                                        </label>
                                                                        <input
                                                                            type="date"
                                                                            name="duedate"
                                                                            className="form-control"
                                                                            value={invoiceData.duedate}
                                                                            onChange={onchange}
                                                                            // placeholder="Due Date"
                                                                            id="duedate"
                                                                        />
                                                                    </div>
                                                                </div>

                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className='box1 rounded adminborder p-4 m-2'>
                                                        <div className="table-responsive">
                                                            <table className="table">
                                                                <thead>
                                                                    <tr>
                                                                        <th scope="col">ITEM</th>
                                                                        <th scope="col">QUANTITY</th>
                                                                        <th scope="col">UNIT</th>
                                                                        <th scope="col">PRICE</th>
                                                                        <th scope="col">AMOUNT</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {searchitemResults.map((item) => {
                                                                        const selectedItem = items.find((i) => i._id === item.value);
                                                                        console.log(selectedItem, "sle");

                                                                        const itemPrice = selectedItem?.price || 0;
                                                                        const itemId = item.value;
                                                                        const quantity = quantityMap[itemId] || 1;
                                                                        const discount = discountMap[itemId] || 0;

                                                                        const discountedAmount = calculateDiscountedAmount(itemPrice, quantity, discount);
                                                                        const formattedTotalAmount = Number(discountedAmount).toLocaleString('en-IN', {
                                                                            // style: 'currency',
                                                                            // currency: 'INR',
                                                                        });

                                                                        return (
                                                                            <tr key={item.value}>
                                                                                <td >
                                                                                    <div className="mb-3 d-flex align-items-baseline justify-content-between">
                                                                                        <p>{item.label}</p>
                                                                                        <button type="button" className="btn btn-danger btn-sm me-2" onClick={() => onDeleteItem(item.value)}>
                                                                                            <i className="fas fa-trash"></i>
                                                                                        </button>
                                                                                    </div>
                                                                                    <div className="row">
                                                                                        <div className="col" >
                                                                                            <label htmlFor={`item-description-${itemId}`} className="form-label">Description</label>

                                                                                            <CKEditor
                                                                                                editor={ClassicEditor}
                                                                                                data={selectedItem?.description || ''}
                                                                                                name={`description-${itemId}`}
                                                                                                onChange={(event, editor) => onChangeDescription(event, editor, itemId)}
                                                                                                onBlur={(event, editor) => {
                                                                                                    console.log('Blur.', editor);
                                                                                                }}
                                                                                                onFocus={(event, editor) => {
                                                                                                    console.log('Focus.', editor);
                                                                                                }}
                                                                                            />
                                                                                        </div>

                                                                                    </div>
                                                                                </td>
                                                                                <td>
                                                                                    <input
                                                                                        type="number"
                                                                                        name={`quantity-${itemId}`}
                                                                                        className="form-control"
                                                                                        value={quantity}
                                                                                        onChange={(event) => onChangeQuantity(event, itemId)}
                                                                                        id={`quantity-${itemId}`}
                                                                                        required
                                                                                    />
                                                                                </td>
                                                                                <td>
                                                                                    {selectedItem?.unit}
                                                                                    {/* <input
                                                                                        type="text"
                                                                                        name={`unit-${itemId}`}
                                                                                        className="form-control"
                                                                                        value={selectedItem?.unit || ''}
                                                                                        onChange={(event) => onChangePrice(event, itemId)}
                                                                                        id={`unit-${itemId}`}
                                                                                        required
                                                                                    /> */}
                                                                                </td>

                                                                                <td>
                                                                                    <input
                                                                                        type="text"
                                                                                        name={`price-${itemId}`}
                                                                                        className="form-control"
                                                                                        value={itemPrice}
                                                                                        onChange={(event) => onChangePrice(event, itemId)}
                                                                                        id={`price-${itemId}`}
                                                                                        required
                                                                                    />
                                                                                </td>


                                                                                <td className="text-center">
                                                                                    <p><CurrencySign />{formattedTotalAmount}</p>
                                                                                </td>
                                                                            </tr>

                                                                        );

                                                                    })}

                                                                    {itemExistsMessage && (
                                                                        <div className="alert alert-warning mt-3" role="alert">
                                                                            {itemExistsMessage}
                                                                        </div>
                                                                    )}
                                                                </tbody>
                                                            </table>
                                                        </div>

                                                        <div className="row pt-3">
                                                            <div className="col-lg-6 col-md-12">
                                                                <div className="search-container forms">
                                                                    <p className='fs-20 mb-0'>Select Item</p>
                                                                    {/* <VirtualizedSelect
                                                                        id="searchitems"
                                                                        name="itemname"
                                                                        className="form-control zindex op pl-0"
                                                                        placeholder=""
                                                                        onChange={onChangeitem}
                                                                        options={items.map((item, index) =>
                                                                            ({ label: item.itemname, value: item._id })

                                                                        )}
                                                                    >
                                                                    </VirtualizedSelect> */}
                                                                    <Select
                                                                        value={searchitemResults}
                                                                        onChange={onChangeitem}
                                                                        options={items.map(item => ({
                                                                            value: item._id,
                                                                            label: item.itemname,
                                                                        }))}
                                                                        placeholder=""
                                                                    />

                                                                </div>
                                                            </div>
                                                            <div className="col-lg-6 col-md-12">
                                                                <div className="row">
                                                                    <div className="col-6 col-md-3">
                                                                        <p>Subtotal</p>
                                                                        <p>Discount</p>
                                                                        {console.log(signUpData, "====signUpData")}
                                                                        {/* <p>GST</p> */}
                                                                        <p className='pt-3'>{signUpData.name} {signUpData.percentage}%</p>

                                                                        <p>Total</p>
                                                                    </div>
                                                                    <div className="col-6 col-md-9">
                                                                        <p><CurrencySign />{calculateSubtotal().toLocaleString('en-IN', {

                                                                        })}</p>
                                                                        <div className="mb-3">
                                                                            <input
                                                                                type="number"
                                                                                name="totaldiscount"
                                                                                className="form-control"
                                                                                value={discountTotal}
                                                                                onChange={handleDiscountChange} // Ensure proper event binding
                                                                                placeholder="Enter Discount Total"
                                                                                id="discountInput"
                                                                                min="0"
                                                                            />
                                                                        </div>


                                                                        <p>{console.log("check Tax Amount", calculateTaxAmount())}<CurrencySign />{

                                                                            calculateTaxAmount().toLocaleString('en-IN', {
                                                                                // style: 'currency',
                                                                                // currency: 'INR',
                                                                            })}</p>

                                                                        <p><CurrencySign />{calculateTotal().toLocaleString('en-IN', {
                                                                            // style: 'currency',
                                                                            // currency: 'INR',
                                                                        })}</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <hr />
                                                        <div className="row pt-3">
                                                            <div className="col-lg-6 col-md-12"></div>
                                                            <div className="col-lg-6 col-md-12">
                                                                <div className="row">
                                                                    <div className="col-6 col-md-3">
                                                                        <p>Amount due</p>
                                                                    </div>
                                                                    <div className="col-6 col-md-9">
                                                                        {/* <p><CurrencySign /> {calculateTotal().toLocaleString}</p> */}
                                                                        <p><CurrencySign />{calculateTotal().toLocaleString('en-IN', {
                                                                            // style: 'currency',
                                                                            // currency: 'INR',
                                                                        })}</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <label htmlFor="" className='fs-4 ms-2 mt-5'>Note</label>
                                                    <div className='box1 rounded adminborder m-2'>
                                                        <CKEditor
                                                            editor={ClassicEditor}
                                                            data={editorData}
                                                            // onReady={ editor => {
                                                            //     console.log( 'Editor is ready to use!', editor );
                                                            // } }

                                                            onChange={handleEditorChange}
                                                            config={{
                                                                extraPlugins: [MyCustomUploadAdapterPlugin],
                                                            }}
                                                            onBlur={(event, editor) => {
                                                                console.log('Blur.', editor);
                                                            }}
                                                            onFocus={(event, editor) => {
                                                                console.log('Focus.', editor);
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>


                                        </div>


                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>



            }



            <form action="">
                <div className="modal fade" id="exampleModal" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h1 className="modal-title fs-5" id="exampleModalLabel">Edit Customer</h1>
                                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <label htmlFor="customerName" className="form-label">Name</label>
                                    <select className="form-control" id="customerName" value={editedName} onChange={handleNameChange}>
                                        <option value="" disabled>Select Name</option>
                                        {customers.map(customer => (
                                            <option key={customer._id} value={customer.name}>{customer.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="customerEmail" className="form-label">Select Email</label>
                                    <select
                                        className="form-control"
                                        id="customerEmail"
                                        value={editedEmail}
                                        onChange={(e) => setEditedEmail(e.target.value)}
                                    >
                                        <option value="">-- Select an email --</option>
                                        {customers.find(c => c.name === editedName)?.emails?.map((email, index) => (
                                            <option key={index} value={email}>
                                                {email}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="customerPhone" className="form-label">Phone Number</label>
                                    <input type="number" className="form-control" id="customerPhone" value={editedPhone} onChange={(e) => setEditedPhone(e.target.value)} />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                                <button type="button" className="btn btn-primary" data-bs-dismiss="modal" onClick={handleEditCustomer}>Save changes</button>
                            </div>
                        </div>
                    </div>
                </div>
            </form>

            {/* add customer */}

            <form onSubmit={(e) => e.preventDefault()}>
                <div className="modal fade" id="exampleModal1" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h1 className="modal-title fs-5" id="exampleModalLabel">Add Customer</h1>
                                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div className="modal-body">
                                <div className="row">

                                    {/* Customer Name */}
                                    <div className="col-12 col-sm-6 col-lg-4 mb-3">
                                        <label className="form-label">Customer Name</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="name"
                                            value={credentials.name}
                                            onChange={onchangeaddcustomer}
                                            placeholder="Customer Name"
                                            required
                                        />
                                    </div>

                                    {/* Emails */}
                                    <div className="col-12 col-sm-6 col-lg-8 mb-3">
                                        <label className="form-label">Contact Emails</label>
                                        {credentials.emails.map((email, index) => (
                                            <div className="input-group mb-2" key={index}>
                                                <input
                                                    type="email"
                                                    className="form-control"
                                                    value={email}
                                                    onChange={(e) => handleEmailChange(index, e.target.value)}
                                                    placeholder={`Contact Email #${index + 1}`}
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-danger"
                                                    onClick={() => removeEmailField(index)}
                                                    disabled={credentials.emails.length === 1}
                                                >
                                                    -
                                                </button>
                                                {index === credentials.emails.length - 1 && (
                                                    <button
                                                        type="button"
                                                        className="btn btn-outline-primary"
                                                        onClick={addEmailField}
                                                    >
                                                        +
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Phone Number */}
                                    <div className="col-12 col-sm-6 col-lg-4 mb-3">
                                        <label className="form-label">Phone Number</label>
                                        <input
                                            type="text"
                                            name="number"
                                            value={credentials.number}
                                            onChange={onchangeaddcustomer}
                                            className="form-control"
                                            placeholder="Phone Number"
                                        />
                                    </div>

                                    {/* Additional Information */}
                                    <div className="col-12 mb-3">
                                        <label className="form-label">Additional Information</label>
                                        <textarea
                                            name="information"
                                            value={credentials.information}
                                            onChange={onchangeaddcustomer}
                                            className="form-control"
                                            placeholder="Information"
                                        />
                                    </div>

                                    {/* Address 1 & 2 */}
                                    <div className="col-12 col-sm-6 col-lg-6 mb-3">
                                        <label className="form-label">Address 1</label>
                                        <input
                                            type="text"
                                            name="address1"
                                            value={credentials.address1}
                                            onChange={onchangeaddcustomer}
                                            className="form-control"
                                            placeholder="Address 1"
                                        />
                                    </div>

                                    <div className="col-12 col-sm-6 col-lg-6 mb-3">
                                        <label className="form-label">Address 2</label>
                                        <input
                                            type="text"
                                            name="address2"
                                            value={credentials.address2}
                                            onChange={onchangeaddcustomer}
                                            className="form-control"
                                            placeholder="Address 2"
                                        />
                                    </div>

                                    {/* Country */}
                                    <div className="col-12 col-sm-6 col-lg-6 mb-3">
                                        <label className="form-label">Country</label>
                                        <CountrySelect
                                            name="country"
                                            value={credentials.countryid}
                                            onChange={(val) => {
                                                setcountryid(val.id);
                                                setcountry(val.name);
                                                setCredentials({ ...credentials, countrydata: JSON.stringify(val) });
                                            }}
                                            valueType="short"
                                            className="form-control"
                                            placeHolder="Select Country"
                                        />
                                    </div>

                                    {/* State */}
                                    <div className="col-12 col-sm-6 col-lg-6 mb-3">
                                        <label className="form-label">State</label>
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

                                    {/* City */}
                                    <div className="col-12 col-sm-6 col-lg-6 mb-3">
                                        <label className="form-label">City</label>
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

                                    {/* Post Code */}
                                    <div className="col-12 col-sm-6 col-lg-6 mb-3">
                                        <label className="form-label">Post Code</label>
                                        <input
                                            type="text"
                                            name="post"
                                            value={credentials.post}
                                            onChange={onchangeaddcustomer}
                                            className="form-control"
                                            placeholder="Post Code"
                                        />
                                    </div>

                                </div>
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={handleAddCustomer}
                                    data-bs-dismiss="modal"
                                >
                                    Add Customer
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </form>

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
