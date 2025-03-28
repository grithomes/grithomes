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
    const [searchCustomerResults, setSearchcustomerResults] = useState([]);
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
    const [credentials, setCredentials] = useState({
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

    const onChangeCustomer = (event) => {
        const selectedCustomerId = event.value;
        console.log(selectedCustomerId, 'selectedCustomerId');

        setSelectedCustomerId(selectedCustomerId);
        const selectedCustomer = customers.find((customer) => customer._id === selectedCustomerId);

        if (selectedCustomer) {
            setInvoiceData({
                ...invoiceData,
                customername: selectedCustomer.name,
                customeremail: selectedCustomer.email,
                customerphone: selectedCustomer.number,
            });

            setSelectedCustomerDetails({
                name: selectedCustomer.name,
                email: selectedCustomer.email,
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
            setEditedEmail(customer.email);
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
                email: credentials.email,
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
            console.log(json, "Happy");

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
        <div className="bg">
        {loading ? (
          <div className="d-flex justify-content-center align-items-center vh-100">
            <ColorRing loading={loading} aria-label="Loading Spinner" data-testid="loader" />
          </div>
        ) : (
          <div className="container-fluid">
            <div className="row">
              <div className="col-lg-2 col-md-3 vh-100 b-shadow bg-white d-lg-block d-md-block d-none">
                <Usernavbar />
              </div>
              <div className="col-lg-10 col-md-9 col-12 mx-auto">
                <div className="d-lg-none d-md-none d-block mt-2">
                  <Usernav />
                </div>
                <div className="invoice-container mx-3 mx-md-4">
                  <form onSubmit={handleSubmit}>
                    <div className="invoice-header bg-light p-3 rounded-top shadow-sm mb-4">
                      <div className="row align-items-center">
                        <div className="col-lg-6 col-md-6 col-12">
                          <h2 className="fs-3 fw-bold text-primary mb-1">Create Invoice</h2>
                          <nav aria-label="breadcrumb">
                            <ol className="breadcrumb mb-0">
                              <li className="breadcrumb-item">
                                <a href="/Userpanel/Userdashboard" className="text-decoration-none text-muted">Dashboard</a>
                              </li>
                              <li className="breadcrumb-item active" aria-current="page">Invoice</li>
                            </ol>
                          </nav>
                        </div>
                        <div className="col-lg-6 col-md-6 col-12 text-md-end mt-3 mt-md-0">
                          <button className="btn btn-success fw-bold px-4" type="submit">
                            <i className="fas fa-save me-2"></i> Save Invoice
                          </button>
                        </div>
                      </div>
                      {alertMessage && (
                        <div className="mt-3">
                          <Alertauthtoken message={alertMessage} onClose={() => setAlertMessage('')} />
                        </div>
                      )}
                    </div>
  
                    <div className="row">
                      <div className="col-lg-3 col-12 mb-4">
                        <div className="card shadow-sm p-3">
                          <h5 className="card-title fw-bold text-muted">Signature Options</h5>
                          <div className="form-check form-switch mb-3">
                            <label className="form-check-label" htmlFor="signatureSwitch">Enable Signature</label>
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
                              <div className="form-check form-switch mb-3">
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
                              <div className="form-check form-switch">
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
  
                      <div className="col-lg-9 col-12">
                        <div className="card shadow-sm p-4">
                          <div className="row g-4">
                            <div className="col-md-5 col-12">
                              {isCustomerSelected ? (
                                <div className="customer-card p-3 bg-light rounded">
                                  <h4 className="fw-bold text-dark">{selectedCustomerDetails.name}</h4>
                                  <p className="mb-1 text-muted">{selectedCustomerDetails.email}</p>
                                  <p className="mb-2 text-muted">{selectedCustomerDetails.number}</p>
                                  <a href="#" className="text-primary text-decoration-none" data-bs-toggle="modal" data-bs-target="#exampleModal">
                                    <i className="fas fa-edit me-1"></i> Edit Customer
                                  </a>
                                </div>
                              ) : (
                                <div className="customer-select">
                                  <label className="form-label fw-bold">Select Customer</label>
                                  <div className="input-group">
                                    <Select
                                      value={searchCustomerResults}
                                      onChange={onChangeCustomer}
                                      options={customers.map(customer => ({ value: customer._id, label: customer.name }))}
                                      placeholder="Choose a customer..."
                                      className="flex-grow-1"
                                      classNamePrefix="react-select"
                                    />
                                    <button type="button" className="btn btn-outline-primary ms-2" data-bs-toggle="modal" data-bs-target="#exampleModal1">
                                      <i className="fas fa-plus"></i>
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                            <div className="col-md-7 col-12">
                              <div className="row g-3">
                                {message && (
                                  <div className="col-12">
                                    <div className="alert alert-warning alert-dismissible fade show" role="alert">
                                      <strong>{alertShow}</strong>
                                      <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                                    </div>
                                  </div>
                                )}
                                <div className="col-md-6">
                                  <label htmlFor="invoicenumbr" className="form-label fw-bold">Invoice Number</label>
                                  <input
                                    type="text"
                                    name="InvoiceNumber"
                                    className="form-control"
                                    value={invoiceData.InvoiceNumber}
                                    onChange={onchange}
                                    id="invoicenumbr"
                                    required
                                  />
                                </div>
                                <div className="col-md-6">
                                  <label htmlFor="purchaseoder" className="form-label fw-bold">Purchase Order (PO) #</label>
                                  <input
                                    type="text"
                                    name="purchaseorder"
                                    className="form-control"
                                    onChange={onchange}
                                    id="purchaseoder"
                                  />
                                </div>
                                <div className="col-md-6">
                                  <label htmlFor="Date" className="form-label fw-bold">Date</label>
                                  <input
                                    type="date"
                                    name="date"
                                    className="form-control"
                                    value={invoiceData.date}
                                    onChange={onchange}
                                    id="Date"
                                    required
                                  />
                                </div>
                                <div className="col-md-6">
                                  <label htmlFor="Job" className="form-label fw-bold">Job</label>
                                  <input
                                    type="text"
                                    name="job"
                                    className="form-control"
                                    value={invoiceData.job}
                                    onChange={onchange}
                                    id="job"
                                    required
                                  />
                                </div>
                                <div className="col-md-6">
                                  <label htmlFor="duedate" className="form-label fw-bold">Due Date</label>
                                  <input
                                    type="date"
                                    name="duedate"
                                    className="form-control"
                                    value={invoiceData.duedate}
                                    onChange={onchange}
                                    id="duedate"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
  
                          <div className="card mt-4 shadow-sm">
                            <div className="card-body">
                              <h5 className="card-title fw-bold text-muted mb-4">Items</h5>
                              <div className="table-responsive">
                                <table className="table table-hover">
                                  <thead className="table-light">
                                    <tr>
                                      <th>Item</th>
                                      <th>Quantity</th>
                                      <th>Unit</th>
                                      <th>Price</th>
                                      <th>Amount</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {searchitemResults.map((item) => {
                                      const selectedItem = items.find((i) => i._id === item.value);
                                      const itemPrice = selectedItem?.price || 0;
                                      const itemId = item.value;
                                      const quantity = quantityMap[itemId] || 1;
                                      const discount = discountMap[itemId] || 0;
                                      const discountedAmount = calculateDiscountedAmount(itemPrice, quantity, discount);
                                      const formattedTotalAmount = Number(discountedAmount).toLocaleString('en-IN');
  
                                      return (
                                        <tr key={item.value}>
                                          <td>
                                            <div className="d-flex justify-content-between align-items-center">
                                              <p className="fw-bold mb-0">{item.label}</p>
                                              <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => onDeleteItem(item.value)}>
                                                <i className="fas fa-trash"></i>
                                              </button>
                                            </div>
                                            <CKEditor
                                              editor={ClassicEditor}
                                              data={selectedItem?.description || ''}
                                              name={`description-${itemId}`}
                                              onChange={(event, editor) => onChangeDescription(event, editor, itemId)}
                                            />
                                          </td>
                                          <td>
                                            <input
                                              type="number"
                                              name={`quantity-${itemId}`}
                                              className="form-control form-control-sm"
                                              value={quantity}
                                              onChange={(event) => onChangeQuantity(event, itemId)}
                                              id={`quantity-${itemId}`}
                                              required
                                              min="1"
                                            />
                                          </td>
                                          <td>{selectedItem?.unit}</td>
                                          <td>
                                            <input
                                              type="text"
                                              name={`price-${itemId}`}
                                              className="form-control form-control-sm"
                                              value={itemPrice}
                                              onChange={(event) => onChangePrice(event, itemId)}
                                              id={`price-${itemId}`}
                                              required
                                            />
                                          </td>
                                          <td className="text-center">
                                            <CurrencySign />{formattedTotalAmount}
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                                {itemExistsMessage && (
                                  <div className="alert alert-warning mt-3" role="alert">{itemExistsMessage}</div>
                                )}
                              </div>
  
                              <div className="row mt-4">
                                <div className="col-md-6">
                                  <label className="form-label fw-bold">Add Item</label>
                                  <Select
                                    value={searchitemResults}
                                    onChange={onChangeitem}
                                    options={items.map(item => ({ value: item._id, label: item.itemname }))}
                                    placeholder="Select an item..."
                                    classNamePrefix="react-select"
                                  />
                                </div>
                                <div className="col-md-6">
                                  <div className="row g-2 text-end">
                                    <div className="col-6 fw-bold">Subtotal</div>
                                    <div className="col-6"><CurrencySign />{calculateSubtotal().toLocaleString('en-IN')}</div>
                                    <div className="col-6 fw-bold">Discount</div>
                                    <div className="col-6">
                                      <input
                                        type="number"
                                        name="totaldiscount"
                                        className="form-control form-control-sm"
                                        value={discountTotal}
                                        onChange={handleDiscountChange}
                                        placeholder="0.00"
                                        min="0"
                                      />
                                    </div>
                                    <div className="col-6 fw-bold">{signUpData.name} ({signUpData.percentage}%)</div>
                                    <div className="col-6"><CurrencySign />{calculateTaxAmount().toLocaleString('en-IN')}</div>
                                    <div className="col-6 fw-bold text-primary">Total</div>
                                    <div className="col-6 text-primary fw-bold"><CurrencySign />{calculateTotal().toLocaleString('en-IN')}</div>
                                  </div>
                                </div>
                              </div>
                              <hr />
                              <div className="row">
                                <div className="col-md-6"></div>
                                <div className="col-md-6 text-end">
                                  <div className="fw-bold">Amount Due</div>
                                  <div className="text-muted"><CurrencySign />{calculateTotal().toLocaleString('en-IN')}</div>
                                </div>
                              </div>
                            </div>
                          </div>
  
                          <div className="mt-4">
                            <h5 className="fw-bold text-muted">Notes</h5>
                            <div className="card shadow-sm">
                              <div className="card-body">
                                <CKEditor
                                  editor={ClassicEditor}
                                  data={editorData}
                                  onChange={handleEditorChange}
                                  config={{ extraPlugins: [MyCustomUploadAdapterPlugin] }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
  
            {/* Edit Customer Modal */}
            <div className="modal fade" id="exampleModal" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
              <div className="modal-dialog modal-lg">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title" id="exampleModalLabel">Edit Customer</h5>
                    <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                  </div>
                  <div className="modal-body">
                    <div className="mb-3">
                      <label htmlFor="customerName" className="form-label fw-bold">Name</label>
                      <select className="form-select" id="customerName" value={editedName} onChange={handleNameChange}>
                        <option value="" disabled>Select Name</option>
                        {customers.map(customer => (
                          <option key={customer._id} value={customer.name}>{customer.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="mb-3">
                      <label htmlFor="customerEmail" className="form-label fw-bold">Email</label>
                      <input type="email" className="form-control" id="customerEmail" value={editedEmail} onChange={(e) => setEditedEmail(e.target.value)} />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="customerPhone" className="form-label fw-bold">Phone Number</label>
                      <input type="number" className="form-control" id="customerPhone" value={editedPhone} onChange={(e) => setEditedPhone(e.target.value)} />
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-outline-secondary" data-bs-dismiss="modal">Close</button>
                    <button type="button" className="btn btn-primary" data-bs-dismiss="modal" onClick={handleEditCustomer}>Save Changes</button>
                  </div>
                </div>
              </div>
            </div>
  
            {/* Add Customer Modal */}
            <div className="modal fade" id="exampleModal1" tabIndex="-1" aria-labelledby="exampleModalLabel1" aria-hidden="true">
              <div className="modal-dialog modal-lg">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title" id="exampleModalLabel1">Add Customer</h5>
                    <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                  </div>
                  <div className="modal-body">
                    <div className="row g-3">
                      <div className="col-md-4">
                        <label htmlFor="exampleInputtext1" className="form-label fw-bold">Customer Name</label>
                        <input
                          type="text"
                          className="form-control"
                          name="name"
                          value={credentials.name}
                          onChange={onchangeaddcustomer}
                          placeholder="Customer Name"
                          id="exampleInputtext1"
                          required
                        />
                      </div>
                      <div className="col-md-4">
                        <label htmlFor="email" className="form-label fw-bold">Contact Email</label>
                        <input
                          type="email"
                          className="form-control"
                          name="email"
                          value={credentials.email}
                          onChange={onchangeaddcustomer}
                          placeholder="Contact Email"
                          id="email"
                          required
                        />
                      </div>
                      <div className="col-md-4">
                        <label htmlFor="phonenumber" className="form-label fw-bold">Phone Number</label>
                        <input
                          type="text"
                          name="number"
                          className="form-control"
                          onChange={onchangeaddcustomer}
                          placeholder="Phone Number"
                          id="phonenumber"
                          required
                        />
                      </div>
                      <div className="col-12">
                        <label htmlFor="information" className="form-label fw-bold">Additional Information</label>
                        <textarea
                          className="form-control"
                          name="information"
                          onChange={onchangeaddcustomer}
                          placeholder="Information"
                          id="information"
                        />
                      </div>
                      <div className="col-md-6">
                        <label htmlFor="Address1" className="form-label fw-bold">Address 1</label>
                        <input
                          type="text"
                          name="address1"
                          onChange={onchangeaddcustomer}
                          className="form-control"
                          placeholder="Address 1"
                          id="Address1"
                        />
                      </div>
                      <div className="col-md-6">
                        <label htmlFor="Address2" className="form-label fw-bold">Address 2</label>
                        <input
                          type="text"
                          name="address2"
                          onChange={onchangeaddcustomer}
                          className="form-control"
                          placeholder="Address 2"
                          id="Address2"
                        />
                      </div>
                      <div className="col-md-6">
                        <label htmlFor="Country" className="form-label fw-bold">Country</label>
                        <CountrySelect
                          name="country"
                          value={credentials.countryid}
                          onChange={(val) => {
                            setCredentials({ ...credentials, countrydata: JSON.stringify(val) });
                          }}
                          valueType="short"
                          className="form-control"
                          placeHolder="Select Country"
                        />
                      </div>
                      <div className="col-md-6">
                        <label htmlFor="State" className="form-label fw-bold">State</label>
                        <StateSelect
                          name="state"
                          countryid={credentials.countryid}
                          onChange={(val) => {
                            setCredentials({ ...credentials, statedata: JSON.stringify(val) });
                          }}
                          placeHolder="Select State"
                        />
                      </div>
                      <div className="col-md-6">
                        <label htmlFor="City" className="form-label fw-bold">City</label>
                        <CitySelect
                          countryid={credentials.countryid}
                          stateid={credentials.stateid}
                          onChange={(val) => {
                            setCredentials({ ...credentials, citydata: JSON.stringify(val) });
                          }}
                          placeHolder="Select City"
                        />
                      </div>
                      <div className="col-md-6">
                        <label htmlFor="post" className="form-label fw-bold">Post Code</label>
                        <input
                          type="text"
                          name="post"
                          onChange={onchangeaddcustomer}
                          className="form-control"
                          placeholder="Post Code"
                          id="post"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-outline-secondary" data-bs-dismiss="modal">Close</button>
                    <button type="button" className="btn btn-primary" data-bs-dismiss="modal" onClick={handleAddCustomer}>Add Customer</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    )
}
