import React, { useState, useEffect } from 'react'
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom'
import { ColorRing } from 'react-loader-spinner'

import Sidebar from './Sidebar';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import Select from 'react-select';
// import 'react-select/dist/react-select.css'; 
// import VirtualizedSelect from 'react-virtualized-select';
// import 'react-virtualized-select/styles.css';
// import 'react-virtualized/styles.css'
import CurrencySign from '../../components/CurrencySign ';
import { CountrySelect, StateSelect, CitySelect } from '@davzon/react-country-state-city';
import "@davzon/react-country-state-city/dist/react-country-state-city.css";
import Alertauthtoken from '../../components/Alertauthtoken';
import SignatureModal from '../../components/SignatureModal';


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

export default function Createestimate() {
    const [loading, setloading] = useState(true);
    const [customers, setcustomers] = useState([]);
    const [items, setitems] = useState([]);
    const [searchcustomerResults, setSearchcustomerResults] = useState([]);
    const [searchitemResults, setSearchitemResults] = useState([]);
    const [quantityMap, setQuantityMap] = useState({});
    const [discountMap, setDiscountMap] = useState({});
    const [itemExistsMessage, setItemExistsMessage] = useState('');
    const [message, setmessage] = useState(false);
    const [alertShow, setAlertShow] = useState("");
    const [SelectedCustomerId, setSelectedCustomerId] = useState("");
    const [selectedCustomerDetails, setSelectedCustomerDetails] = useState({
        name: '', email: '', number: ''
    });
    const [isCustomerSelected, setIsCustomerSelected] = useState(false);
    const [editedName, setEditedName] = useState('');
    const [editedEmail, setEditedEmail] = useState('');
    const [editedNumber, setEditedNumber] = useState('');
    const [taxPercentage, setTaxPercentage] = useState(0);
    const [signUpData, setsignUpData] = useState(0);
    const [discountTotal, setdiscountTotal] = useState(0);
    const [estimateData, setestimateData] = useState({
        customername: '', itemname: '', customeremail: '', customerphone: '', estimate_id: '', EstimateNumber: '', purchaseorder: '',
        job: '', date: format(new Date(), 'yyyy-MM-dd'), description: '', itemquantity: '', price: '', discount: '',
        amount: '', tax: '', discountTotal: '', taxpercentage: '', subtotal: '', total: '', amountdue: '', information: '',
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
            // console.log("getTaxOptions:===",JSON.parse(getTaxOptions)[0].name);
            setsignUpData(JSON.parse(getTaxOptions)[0])
            await fetchcustomerdata();
            await fetchitemdata();
            await fetchLastEstimateNumber();
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

    const fetchLastEstimateNumber = async () => {
        try {
            const userid = localStorage.getItem('userid');
            const authToken = localStorage.getItem('authToken');
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/lastEstimateNumber/${userid}`, {
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

                // let nextEstimateNumber = 1;
                // if (json && json.lastEstimateNumber) {
                //     nextEstimateNumber = json.lastEstimateNumber + 1;
                // }
                setestimateData({
                    ...estimateData,
                    EstimateNumber: `Estimate-${json.lastEstimateId + 1}`,
                    estimate_id: json.lastEstimateId + 1,
                });
            }

        } catch (error) {
            console.error('Error fetching last estimate number:', error);
        }
    };


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
                    setcustomers(json);
                }
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
                // setTaxPercentage(json.taxPercentage);
                // setsignUpData(json)
                console.log("json: ", json.taxPercentage);
                // }
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

    // const onChangeitem = (event) => {
    //     setSearchitemResults([...searchitemResults, event]);
    // }

    const handleEditorChange = (event, editor) => {
        const data = editor.getData();
        setEditorData(data);
    };
    const handleEditorChange1 = (event, editor) => {
        const data = editor.getData();
        setEditorData(data);
    };

    // const onChangeQuantity = (event, itemId) => {
    //     const newQuantity = event.target.value ? parseFloat(event.target.value) : 1;

    //     // Update quantity for the corresponding item
    //     setQuantityMap((prevMap) => ({
    //       ...prevMap,
    //       [itemId]: newQuantity,
    //     }));
    //   };

    const onChangeQuantity = (event, itemId) => {
        let newQuantity = event.target.value ? parseFloat(event.target.value) : 1;
        newQuantity = Math.max(newQuantity, 0); // Ensure quantity is not negative

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
        setSelectedCustomerId(selectedCustomerId);
        const selectedCustomer = customers.find((customer) => customer._id === selectedCustomerId);

        console.log(selectedCustomer, "Selected Customer");

        if (selectedCustomer) {
            setestimateData({
                ...estimateData,
                customername: selectedCustomer.name,
                customerphone: selectedCustomer.number,
            });

            setSelectedCustomerDetails({
                name: selectedCustomer.name,
                email: selectedCustomer.emails?.[0] || '',
                number: selectedCustomer.number
            });

            // Handle multiple emails
            if (selectedCustomer.emails?.length > 1) {
                setEmailOptions(selectedCustomer.emails);
                setShowEmailModal(true); // open modal
            } else {
                setestimateData(prev => ({
                    ...prev,
                    customeremail: selectedCustomer.emails?.[0] || '',
                }));
            }
            setIsCustomerSelected(true);
        }

        setSearchcustomerResults([...searchcustomerResults, event]);
    };

    const handleNameChange = (event) => {
        const selectedName = event.target.value;
        const selectedCustomer = customers.find(customer => customer.name === selectedName);
        if (selectedCustomer) {
            setEditedName(selectedName);
            setEditedEmail(selectedCustomer.email);
            setEditedNumber(selectedCustomer.number);
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
            number: editedNumber,
        };

        setSelectedCustomerDetails({
            name: editedName,
            email: editedEmail,
            number: editedNumber
        });

        console.log(SelectedCustomerId, 'edited SelectedCustomerId');
        console.log('Updated customer details:', updatedCustomerDetails);

    };

    // const handleEditCustomer = () => {
    //     const updatedCustomerDetails = {
    //         name: editedName,
    //         email: editedEmail,
    //     };

    //     setSelectedCustomerDetails({
    //         name: editedName,
    //         email: editedEmail
    //     });
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

            subtotal += discountedAmount;
        });

        return subtotal;
    };

    // Function to handle tax change
    const handleTaxChange = (event) => {
        let enteredTax = event.target.value;
        // Restrict input to two digits after the decimal point
        const regex = /^\d*\.?\d{0,2}$/; // Regex to allow up to two decimal places
        if (regex.test(enteredTax)) {
            // Ensure that the entered value is a valid number
            enteredTax = parseFloat(enteredTax);
            setTaxPercentage(enteredTax);
            setestimateData({ ...estimateData, taxpercentage: enteredTax });
        }
    };

    // Function to calculate tax amount
    // const calculateTaxAmount = () => {
    //     const subtotal = calculateSubtotal();
    //     const taxAmount = (subtotal * taxPercentage) / 100;
    //     return taxAmount;
    // };

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

            const estimateItems = searchitemResults.map((item) => {
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
                    unit,
                    discount,
                    description: selectedItem.description,
                    amount: discountedAmount, // Add subtotal to each item
                    //   total: calculateTotal(), // Calculate total for each item
                    //   amountdue: calculateTotal() // Amount due is also total for each item initially
                };
            });

            const selectedCustomer = customers.find((customer) => customer._id === SelectedCustomerId);

            // Validate customer fields
            if (!selectedCustomerDetails.name || !selectedCustomerDetails.email) {
                alert('Customer name, email, and phone are required. Please fill out these details.');
                return;
            }


            // Summing up subtotal, total, and amount due for the entire estimate
            const subtotal = estimateItems.reduce((acc, curr) => acc + curr.amount, 0);
            const total = calculateTotal();
            const amountdue = total;
            const taxAmount = calculateTaxAmount(); // Calculate tax amount based on subtotal and tax percentage

            const taxPercentageValue = taxPercentage; // Retrieve tax percentage from estimateData state

            const data = {
                userid: userid,
                customername: selectedCustomerDetails.name,
                customeremail: selectedCustomerDetails.email,
                customerphone: selectedCustomerDetails.number,
                estimate_id: estimateData.estimate_id,
                EstimateNumber: estimateData.EstimateNumber,
                purchaseorder: estimateData.purchaseorder,
                job: estimateData.job || 'No Job',
                discountTotal: discountTotal || 0,
                information: editorData,
                date: estimateData.date,
                items: estimateItems,
                subtotal: subtotal,
                total: total,
                tax: taxAmount,
                taxpercentage: signUpData.percentage,
                amountdue: amountdue,
                noteimageUrl: noteimageUrl,
                isAddSignature: isAddSignatureSwitchOn,
                isCustomerSign: isCustomerSignSwitchOn,
            };
            console.log(data, "Data sdsdfsdsfsdf");

            // Sending estimate data to the backend API
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/savecreateestimate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': authToken,
                },
                body: JSON.stringify({ userid, estimateData: data }),
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
                    console.log(responseData, "responseData");

                    if (responseData.success) {
                        const estimateid = responseData.estimate._id;
                        navigate('/userpanel/Estimatedetail', { state: { estimateid } });
                        console.log('estimate saved successfully!');
                    } else {
                        console.error('Failed to save the estimate.');
                    }
                } else {
                    const responseData = await response.json();
                    setmessage(true);
                    setAlertShow(responseData.error)
                    console.error('Failed to save the estimate.');
                }
            }


        } catch (error) {
            console.error('Error creating estimate:', error);
        }
    };


    const handleSubmit1 = async (e) => {
        e.preventDefault();
        try {
            const userid = localStorage.getItem('userid'); // Assuming you have user ID stored in local storage
            const authToken = localStorage.getItem('authToken');

            // Ensure the selected customer exists
            const selectedCustomer = customers.find((customer) => customer._id === SelectedCustomerId);

            if (!selectedCustomer) {
                alert('Please select a customer.');
                return;
            }

            const { customername, customeremail, customerphone } = selectedCustomer;

            // Validate customer fields
            if (!customername || !customeremail || !customerphone) {
                alert('Customer name, email, and phone are required. Please fill out these details.');
                return;
            }

            await new Promise(resolve => setTimeout(resolve, 100));

            const estimateItems = searchitemResults.map((item) => {
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
                    unit,
                    discount,
                    description: selectedItem.description,
                    amount: discountedAmount, // Add subtotal to each item
                };
            });

            // Summing up subtotal, total, and amount due for the entire estimate
            const subtotal = estimateItems.reduce((acc, curr) => acc + curr.amount, 0);
            const total = calculateTotal();
            const amountdue = total;
            const taxAmount = calculateTaxAmount(); // Calculate tax amount based on subtotal and tax percentage

            const data = {
                userid: userid,
                customername: selectedCustomerDetails.name,
                customeremail: selectedCustomerDetails.email,
                customerphone: selectedCustomerDetails.number,
                estimate_id: estimateData.estimate_id,
                EstimateNumber: estimateData.EstimateNumber,
                purchaseorder: estimateData.purchaseorder,
                job: estimateData.job || 'No Job',
                discountTotal: discountTotal || 0,
                information: editorData,
                date: estimateData.date,
                items: estimateItems,
                subtotal: subtotal,
                total: total,
                tax: taxAmount,
                taxpercentage: signUpData.percentage,
                amountdue: amountdue,
                noteimageUrl: noteimageUrl,
                isAddSignature: isAddSignatureSwitchOn,
                isCustomerSign: isCustomerSignSwitchOn,
            };

            console.log(data, "Data to send");

            // Sending estimate data to the backend API
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/savecreateestimate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': authToken,
                },
                body: JSON.stringify({ userid, estimateData: data }),
            });

            if (response.status === 401) {
                const responseData = await response.json();
                setAlertMessage(responseData.message);
                setloading(false);
                window.scrollTo(0, 0);
                return; // Stop further execution
            } else {
                if (response.ok) {
                    const responseData = await response.json();
                    console.log(responseData, "responseData");

                    if (responseData.success) {
                        const estimateid = responseData.estimate._id;
                        navigate('/userpanel/Estimatedetail', { state: { estimateid } });
                        console.log('Estimate saved successfully!');
                    } else {
                        console.error('Failed to save the estimate.');
                    }
                } else {
                    const responseData = await response.json();
                    setmessage(true);
                    setAlertShow(responseData.error);
                    console.error('Failed to save the estimate.');
                }
            }

        } catch (error) {
            console.error('Error creating estimate:', error);
        }
    };



    const handleDiscountChange = (event) => {
        const value = event.target.value;
        // If the input is empty or NaN, set the value to 0
        const newValue = value === '' || isNaN(parseFloat(value)) ? 0 : parseFloat(value);
        setdiscountTotal(newValue);
    };

    // const onchange = (event) => {
    //     setestimateData({ ...estimateData, [event.target.name]: event.target.value });
    //   };

    const onchange = (event) => {
        if (event.target.name == "EstimateNumber") {
            const parts = (event.target.value).split("-");
            setestimateData({ ...estimateData, ["estimate_id"]: parts[1], [event.target.name]: event.target.value });
        } else {
            // estimate_id_id
            setestimateData({ ...estimateData, [event.target.name]: event.target.value });
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

        if (response.status === 401) {
            const json = await response.json();
            setAlertMessage(json.message);
            setloading(false);
            window.scrollTo(0, 0);
            return; // Stop further execution
        }
        else {
            const json = await response.json();
            console.log(json);

            if (json.success) {
                setCredentials({
                    name: '',
                    email: '',
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
                alert("This Customer Email already exist")
            }
        }
    };

    const onchangeaddcustomer = (event) => {
        setCredentials({ ...credentials, [event.target.name]: event.target.value });
    };


    return (
        <div className='bg'>
            {loading ? (
                <div className="flex justify-center items-center h-screen">
                    <ColorRing loading={loading} aria-label="Loading Spinner" />
                </div>
            ) : (
                <div className="w-full bg-gray-50 min-h-screen">
                    <div className="flex flex-col md:flex-row">
                        <Sidebar />
                        <div className="flex-1 w-full mx-auto px-4 py-8 max-w-7xl">
                            {alertMessage && <Alertauthtoken message={alertMessage} onClose={() => setAlertMessage('')} />}
                            <form onSubmit={handleSubmit}>
                                {/* Header */}
                                <div className='flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4'>
                                    <div>
                                        <h2 className='text-3xl font-bold text-gray-800 mb-1'>Create Estimate</h2>
                                        <nav aria-label="breadcrumb">
                                            <ol className="breadcrumb mb-0 text-sm">
                                                <li className="breadcrumb-item"><a href="/Userpanel/Userdashboard" className='text-gray-500 hover:text-primary transition-colors text-decoration-none'>Dashboard</a></li>
                                                <li className="breadcrumb-item active text-gray-800 font-medium" aria-current="page">Create Estimate</li>
                                            </ol>
                                        </nav>
                                    </div>
                                    <button className='btn-primary font-semibold px-6 py-2.5 rounded-full shadow-sm flex items-center gap-2' type="submit">
                                        <i className="fas fa-save"></i> Save Estimate
                                    </button>
                                </div>

                                <div className="flex flex-col lg:flex-row gap-6">
                                    {/* Main Form Area */}
                                    <div className="w-full lg:w-3/4 flex flex-col gap-6 order-2 lg:order-1">

                                        {/* Top Meta Information Card */}
                                        <div className='bg-white rounded-xl border border-gray-100 shadow-sm p-6'>
                                            <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
                                                {/* Customer Section */}
                                                <div>
                                                    {isCustomerSelected ? (
                                                        <div className="bg-gray-50 p-5 rounded-lg border border-gray-100 h-full relative">
                                                            <div className="absolute top-4 right-4">
                                                                <a href="#" className='text-primary hover:text-blue-800 text-sm font-medium text-decoration-none bg-blue-50 px-3 py-1 rounded-full' data-bs-toggle="modal" data-bs-target="#exampleModal">Edit</a>
                                                            </div>
                                                            <h3 className='font-bold text-xl text-gray-800 mb-2 pr-12'>{selectedCustomerDetails.name}</h3>
                                                            <div className="space-y-1 text-gray-600">
                                                                <p className="flex items-center gap-2 mb-1"><i className="fas fa-envelope text-gray-400"></i> {selectedCustomerDetails.email}</p>
                                                                <p className="flex items-center gap-2 mb-0"><i className="fas fa-phone text-gray-400"></i> {selectedCustomerDetails.number}</p>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="h-full flex flex-col">
                                                            <label className='block text-sm font-semibold text-gray-700 mb-2'>Select Customer <span className="text-red-500">*</span></label>
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
                                                                        required
                                                                        className="react-select-container"
                                                                        classNamePrefix="react-select"
                                                                    />
                                                                </div>
                                                                <a role='button' className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center justify-center transition-colors shadow-sm" data-bs-toggle="modal" data-bs-target="#exampleModal1" title="Add New Customer">
                                                                    <i className="fa-solid fa-plus"></i>
                                                                </a>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Estimate Details Section */}
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    {message == true && (
                                                        <div className="col-span-full alert alert-warning alert-dismissible fade show mb-2" role="alert">
                                                            <strong>{alertShow}</strong>
                                                            <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                                                        </div>
                                                    )}
                                                    <div>
                                                        <label htmlFor="estimatenumbr" className="block text-sm font-semibold text-gray-700 mb-1">Estimate Number <span className="text-red-500">*</span></label>
                                                        <input
                                                            type="text"
                                                            name="EstimateNumber"
                                                            className="input-standard bg-gray-50"
                                                            value={estimateData.EstimateNumber}
                                                            onChange={onchange}
                                                            id="estimatenumbr"
                                                            required
                                                        />
                                                    </div>
                                                    <div>
                                                        <label htmlFor="purchaseoder" className="block text-sm font-semibold text-gray-700 mb-1">P.O. Number</label>
                                                        <input
                                                            type="text"
                                                            name="purchaseorder"
                                                            className="input-standard bg-gray-50"
                                                            onChange={onchange}
                                                            id="purchaseoder"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label htmlFor="Date" className="block text-sm font-semibold text-gray-700 mb-1">Date <span className="text-red-500">*</span></label>
                                                        <input
                                                            type="date"
                                                            name="date"
                                                            className="input-standard bg-gray-50"
                                                            value={estimateData.date}
                                                            onChange={onchange}
                                                            id="Date"
                                                            required
                                                        />
                                                    </div>
                                                    <div>
                                                        <label htmlFor="Job" className="block text-sm font-semibold text-gray-700 mb-1">Job <span className="text-red-500">*</span></label>
                                                        <input
                                                            type="text"
                                                            name="job"
                                                            className="input-standard bg-gray-50"
                                                            value={estimateData.job}
                                                            onChange={onchange}
                                                            id="Job"
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Items Table Card */}
                                        <div className='bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden'>
                                            <div className="overflow-x-auto">
                                                <div className="hidden md:grid grid-cols-12 gap-4 bg-gray-50 border-b border-gray-100 p-4 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                                                    <div className="col-span-5">Item</div>
                                                    <div className="col-span-2">Quantity</div>
                                                    <div className="col-span-2">Price</div>
                                                    <div className="col-span-3 text-right">Amount</div>
                                                </div>

                                                <div className="divide-y divide-gray-50">
                                                    {searchitemResults.map((item) => {
                                                        const selectedItem = items.find((i) => i._id === item.value);
                                                        const itemPrice = selectedItem?.price || 0;
                                                        const itemId = item.value;
                                                        const quantity = quantityMap[itemId] || 1;
                                                        const discount = discountMap[itemId] || 0;

                                                        const discountedAmount = calculateDiscountedAmount(itemPrice, quantity, discount);
                                                        const formattedTotalAmount = Number(discountedAmount).toLocaleString('en-IN');

                                                        return (
                                                            <div key={item.value} className="p-4 hover:bg-gray-50/50 transition-colors">
                                                                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                                                                    {/* Item details */}
                                                                    <div className="col-span-1 md:col-span-5">
                                                                        <div className="flex justify-between items-start mb-2">
                                                                            <p className="font-semibold text-gray-800">{item.label}</p>
                                                                            <button type="button" className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-1.5 rounded-md transition-colors md:hidden" onClick={() => onDeleteItem(item.value)}>
                                                                                <i className="fas fa-trash text-sm"></i>
                                                                            </button>
                                                                        </div>
                                                                        <div className="prose prose-sm max-w-none ck-editor-container">
                                                                            <CKEditor
                                                                                editor={ClassicEditor}
                                                                                data={selectedItem?.description || ''}
                                                                                onChange={(event, editor) => onChangeDescription(event, editor, itemId)}
                                                                            />
                                                                        </div>
                                                                    </div>

                                                                    {/* Quantity */}
                                                                    <div className="col-span-1 md:col-span-2 flex items-center md:items-start gap-2 md:gap-0 md:flex-col">
                                                                        <span className="md:hidden text-sm text-gray-500 w-20">Qty:</span>
                                                                        <div className="flex items-center w-full">
                                                                            <input
                                                                                type="number"
                                                                                className="input-standard text-center rounded-r-none border-r-0 w-full"
                                                                                value={quantity}
                                                                                onChange={(event) => onChangeQuantity(event, itemId)}
                                                                                required
                                                                            />
                                                                            <span className="bg-gray-100 border border-gray-200 text-gray-600 px-3 py-2 text-sm rounded-r-lg whitespace-nowrap">
                                                                                {selectedItem?.unit || 'unit'}
                                                                            </span>
                                                                        </div>
                                                                    </div>

                                                                    {/* Price */}
                                                                    <div className="col-span-1 md:col-span-2 flex items-center md:items-start gap-2 md:gap-0 md:flex-col">
                                                                        <span className="md:hidden text-sm text-gray-500 w-20">Price:</span>
                                                                        <div className="relative w-full">
                                                                            <span className="absolute left-3 top-2 text-gray-500"><CurrencySign /></span>
                                                                            <input
                                                                                type="text"
                                                                                className="input-standard pl-8 w-full"
                                                                                value={itemPrice}
                                                                                onChange={(event) => onChangePrice(event, itemId)}
                                                                                required
                                                                            />
                                                                        </div>
                                                                    </div>

                                                                    {/* Amount and Desktop Delete */}
                                                                    <div className="col-span-1 md:col-span-3 flex justify-between items-center md:items-start md:justify-end gap-4 pt-2 md:pt-0">
                                                                        <span className="md:hidden text-sm text-gray-500 font-semibold">Total Amount:</span>
                                                                        <div className="flex items-center gap-4">
                                                                            <p className="font-bold text-gray-800 text-lg"><CurrencySign />{formattedTotalAmount}</p>
                                                                            <button type="button" className="hidden md:block text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-2 rounded-md transition-colors" onClick={() => onDeleteItem(item.value)} title="Remove Item">
                                                                                <i className="fas fa-trash"></i>
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}

                                                    {itemExistsMessage && (
                                                        <div className="p-4">
                                                            <div className="alert alert-warning mb-0" role="alert">
                                                                {itemExistsMessage}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Item Selector & Totals block */}
                                            <div className="p-6 bg-gray-50/50 border-t border-gray-100 flex flex-col lg:flex-row gap-8">
                                                <div className="w-full lg:w-1/2">
                                                    <label className='block text-sm font-semibold text-gray-700 mb-2'>Add Items to Estimate</label>
                                                    <Select
                                                        value={searchitemResults}
                                                        onChange={onChangeitem}
                                                        options={items.map(item => ({
                                                            value: item._id,
                                                            label: item.itemname,
                                                        }))}
                                                        placeholder="Search and select items..."
                                                        className="react-select-container shadow-sm"
                                                        classNamePrefix="react-select"
                                                    />
                                                </div>

                                                <div className="w-full lg:w-1/2 bg-white p-5 rounded-lg border border-gray-100 shadow-sm">
                                                    <div className="space-y-3">
                                                        <div className="flex justify-between items-center text-gray-600">
                                                            <span>Subtotal</span>
                                                            <span className="font-medium text-gray-800"><CurrencySign />{calculateSubtotal().toLocaleString('en-IN')}</span>
                                                        </div>
                                                        <div className="flex justify-between items-center gap-4">
                                                            <span className="text-gray-600 whitespace-nowrap">Discount</span>
                                                            <div className="relative w-1/2 max-w-[150px]">
                                                                <span className="absolute left-3 top-2 text-gray-500"><CurrencySign /></span>
                                                                <input
                                                                    type="number"
                                                                    className="input-standard pl-8 py-1.5 text-right w-full"
                                                                    value={discountTotal}
                                                                    onChange={handleDiscountChange}
                                                                    min="0"
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="flex justify-between items-center text-gray-600 pt-2">
                                                            <span>Tax ({signUpData.name} {signUpData.percentage}%)</span>
                                                            <span className="font-medium text-gray-800"><CurrencySign />{calculateTaxAmount().toLocaleString('en-IN')}</span>
                                                        </div>
                                                        <div className="pt-3 mt-3 border-t border-gray-100 flex justify-between items-center">
                                                            <span className="font-bold text-gray-800 text-lg">Total Amount</span>
                                                            <span className="font-bold text-primary text-2xl"><CurrencySign />{calculateTotal().toLocaleString('en-IN')}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Editor Section */}
                                        <div className='bg-white rounded-xl border border-gray-100 shadow-sm p-6'>
                                            <label className="block text-sm font-semibold text-gray-700 mb-3">Additional Notes / Terms</label>
                                            <div className="border border-gray-200 rounded-lg overflow-hidden">
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

                                    {/* Sidebar: Settings */}
                                    <div className="w-full lg:w-1/4 order-1 lg:order-2">
                                        <div className='bg-white rounded-xl border border-gray-100 shadow-sm p-6 sticky top-6'>
                                            <h3 className="font-bold text-gray-800 mb-4 pb-2 border-b border-gray-100">Settings</h3>

                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                                                    <label className="font-medium text-gray-700 cursor-pointer select-none" htmlFor="signatureSwitch">Enable Signatures</label>
                                                    <div className="form-check form-switch mb-0">
                                                        <input
                                                            className="form-check-input cursor-pointer"
                                                            type="checkbox"
                                                            role="switch"
                                                            id="signatureSwitch"
                                                            onChange={handleSignatureSwitch}
                                                            checked={hasSignature}
                                                        />
                                                    </div>
                                                </div>

                                                {hasSignature && (
                                                    <div className="pl-4 space-y-3 border-l-2 border-blue-100 py-2">
                                                        <div className="flex items-center justify-between">
                                                            <label className="text-sm text-gray-600 cursor-pointer select-none" htmlFor="addSignatureSwitch">My Signature</label>
                                                            <div className="form-check form-switch mb-0">
                                                                <input
                                                                    className="form-check-input cursor-pointer"
                                                                    type="checkbox"
                                                                    role="switch"
                                                                    id="addSignatureSwitch"
                                                                    checked={isAddSignatureSwitchOn}
                                                                    onChange={handleAddSignatureSwitch}
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <label className="text-sm text-gray-600 cursor-pointer select-none" htmlFor="customerSignSwitch">Customer Signature</label>
                                                            <div className="form-check form-switch mb-0">
                                                                <input
                                                                    className="form-check-input cursor-pointer"
                                                                    type="checkbox"
                                                                    role="switch"
                                                                    id="customerSignSwitch"
                                                                    checked={isCustomerSignSwitchOn}
                                                                    onChange={handleCustomerSignSwitch}
                                                                />
                                                            </div>
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
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>

                    <form action="">
                        <div className="modal fade" id="exampleModal" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                            <div className="modal-dialog modal-lg">
                                <div className="modal-content">
                                    <div className="modal-header">
                                        <h1 className="modal-title text-xl" id="exampleModalLabel">Edit Customer</h1>
                                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                    </div>
                                    <div className="modal-body">
                                        <div className="mb-6">
                                            <label htmlFor="customerName" className="form-label">Name</label>
                                            <select className="input-standard" id="customerName" value={editedName} onChange={handleNameChange}>
                                                <option value="" disabled>Select Name</option>
                                                {customers.map(customer => (
                                                    <option key={customer._id} value={customer.name}>{customer.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="mb-6">
                                            <label htmlFor="customerEmail" className="form-label">Email</label>
                                            <input type="email" className="input-standard" id="customerEmail" value={editedEmail} onChange={(e) => setEditedEmail(e.target.value)} />
                                        </div>
                                    </div>
                                    <div className="modal-footer">
                                        <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                                        <button type="button" className="btn-primary" data-bs-dismiss="modal" onClick={handleEditCustomer}>Save changes</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>

                    {/* add customer */}
                    <form onSubmit={(e) => e.preventDefault()}>
                        <div className="modal fade" id="exampleModal1" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                            <div className="modal-dialog modal-xl">
                                <div className="modal-content border-0 shadow-lg rounded-xl overflow-hidden">
                                    <div className="modal-header bg-gray-50 border-b border-gray-200 py-4 px-6">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-primary/10 p-2 rounded-lg text-primary">
                                                <i className="fa-solid fa-user-plus"></i>
                                            </div>
                                            <h1 className="modal-title text-xl font-bold text-gray-800" id="exampleModalLabel">Add New Customer</h1>
                                        </div>
                                        <button type="button" className="btn-close focus:outline-none" data-bs-dismiss="modal" aria-label="Close"></button>
                                    </div>
                                    <div className="modal-body p-6 bg-gray-50/50">
                                        <div className="flex flex-wrap -mx-3">
                                            
                                            {/* Left Column: Contact Info */}
                                            <div className="w-full lg:w-1/2 px-3 mb-6">
                                                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 h-full">
                                                    <h3 className="text-md font-semibold text-gray-700 mb-4 pb-2 border-b border-gray-100">
                                                        <i className="fa-regular fa-address-card mr-2 text-primary"></i>Contact Details
                                                    </h3>
                                                    
                                                    <div className="mb-4">
                                                        <label className="form-label text-sm font-medium text-gray-600">Customer Name <span className="text-red-500">*</span></label>
                                                        <input
                                                            type="text"
                                                            className="input-standard focus:ring-2 focus:ring-primary/20"
                                                            name="name"
                                                            value={credentials.name}
                                                            onChange={onchangeaddcustomer}
                                                            placeholder="e.g. John Doe"
                                                            required
                                                        />
                                                    </div>

                                                    <div className="mb-4">
                                                        <label className="form-label text-sm font-medium text-gray-600">Phone Number</label>
                                                        <input
                                                            type="text"
                                                            name="number"
                                                            value={credentials.number}
                                                            onChange={onchangeaddcustomer}
                                                            className="input-standard focus:ring-2 focus:ring-primary/20"
                                                            placeholder="+1 (555) 000-0000"
                                                        />
                                                    </div>

                                                    <div className="mb-2">
                                                        <label className="form-label text-sm font-medium text-gray-600">Email Addresses <span className="text-red-500">*</span></label>
                                                        {credentials.emails.map((email, index) => (
                                                            <div className="flex gap-2 mb-3" key={index}>
                                                                <input
                                                                    type="email"
                                                                    className="input-standard flex-1 focus:ring-2 focus:ring-primary/20"
                                                                    value={email}
                                                                    onChange={(e) => handleEmailChange(index, e.target.value)}
                                                                    placeholder={`contact${index > 0 ? index + 1 : ''}@example.com`}
                                                                    required
                                                                />
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-outline-danger px-3 rounded-lg flex items-center justify-center transition-colors"
                                                                    onClick={() => removeEmailField(index)}
                                                                    disabled={credentials.emails.length === 1}
                                                                    title="Remove Email"
                                                                >
                                                                    <i className="fa-solid fa-trash-can"></i>
                                                                </button>
                                                                {index === credentials.emails.length - 1 && (
                                                                    <button
                                                                        type="button"
                                                                        className="btn-secondary px-3 rounded-lg flex items-center justify-center transition-colors"
                                                                        onClick={addEmailField}
                                                                        title="Add another email"
                                                                    >
                                                                        <i className="fa-solid fa-plus"></i>
                                                                    </button>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Right Column: Location & Other */}
                                            <div className="w-full lg:w-1/2 px-3 mb-6">
                                                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 h-full">
                                                    <h3 className="text-md font-semibold text-gray-700 mb-4 pb-2 border-b border-gray-100">
                                                        <i className="fa-solid fa-map-location-dot mr-2 text-primary"></i>Address & Info
                                                    </h3>

                                                    <div className="flex flex-wrap -mx-2">
                                                        <div className="w-full px-2 mb-4">
                                                            <label className="form-label text-sm font-medium text-gray-600">Address Line 1</label>
                                                            <input
                                                                type="text"
                                                                name="address1"
                                                                value={credentials.address1}
                                                                onChange={onchangeaddcustomer}
                                                                className="input-standard focus:ring-2 focus:ring-primary/20"
                                                                placeholder="Street address, P.O. box"
                                                            />
                                                        </div>
                                                        <div className="w-full px-2 mb-4">
                                                            <label className="form-label text-sm font-medium text-gray-600">Address Line 2 (Optional)</label>
                                                            <input
                                                                type="text"
                                                                name="address2"
                                                                value={credentials.address2}
                                                                onChange={onchangeaddcustomer}
                                                                className="input-standard focus:ring-2 focus:ring-primary/20"
                                                                placeholder="Apt, suite, unit, building, floor, etc."
                                                            />
                                                        </div>

                                                        <div className="w-full sm:w-1/2 px-2 mb-4">
                                                            <label className="form-label text-sm font-medium text-gray-600">Country</label>
                                                            <CountrySelect
                                                                name="country"
                                                                value={credentials.countryid}
                                                                onChange={(val) => {
                                                                    setcountryid(val.id);
                                                                    setcountry(val.name);
                                                                    setCredentials({ ...credentials, countrydata: JSON.stringify(val) });
                                                                }}
                                                                valueType="short"
                                                                className="input-standard w-full"
                                                                placeHolder="Select Country"
                                                            />
                                                        </div>
                                                        <div className="w-full sm:w-1/2 px-2 mb-4">
                                                            <label className="form-label text-sm font-medium text-gray-600">State / Province</label>
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

                                                        <div className="w-full sm:w-1/2 px-2 mb-4">
                                                            <label className="form-label text-sm font-medium text-gray-600">City</label>
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
                                                        <div className="w-full sm:w-1/2 px-2 mb-4">
                                                            <label className="form-label text-sm font-medium text-gray-600">Postal / Zip Code</label>
                                                            <input
                                                                type="text"
                                                                name="post"
                                                                value={credentials.post}
                                                                onChange={onchangeaddcustomer}
                                                                className="input-standard focus:ring-2 focus:ring-primary/20"
                                                                placeholder="e.g. 90210"
                                                            />
                                                        </div>

                                                        <div className="w-full px-2 mb-2">
                                                            <label className="form-label text-sm font-medium text-gray-600">Additional Notes</label>
                                                            <textarea
                                                                name="information"
                                                                value={credentials.information}
                                                                onChange={onchangeaddcustomer}
                                                                className="input-standard focus:ring-2 focus:ring-primary/20"
                                                                placeholder="Any other details..."
                                                                rows="2"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="modal-footer bg-gray-50 border-t border-gray-200 py-4 px-6 flex justify-end gap-3">
                                        <button type="button" className="px-5 py-2.5 rounded-lg font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-colors shadow-sm" data-bs-dismiss="modal">
                                            Cancel
                                        </button>
                                        <button
                                            type="button"
                                            className="px-5 py-2.5 rounded-lg font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2"
                                            onClick={handleAddCustomer}
                                            data-bs-dismiss="modal"
                                        >
                                            <i className="fa-solid fa-check"></i>
                                            Save Customer
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            )}
            {showEmailModal && (
                <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Select an Email for Estimate</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setShowEmailModal(false)}
                                ></button>
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
                                                setestimateData(prev => ({
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
