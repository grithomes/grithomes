import React, { useState, useEffect } from 'react'
import { format } from 'date-fns';
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
    const [searchcustomerResults, setsearchcustomerResults] = useState([]);
    const [searchitemResults, setSearchitemResults] = useState([]);
    const [quantityMap, setQuantityMap] = useState({});
    const [discountMap, setDiscountMap] = useState({});
    const [itemExistsMessage, setItemExistsMessage] = useState('');
    const [message, setmessage] = useState(false);
    const [alertShow, setAlertShow] = useState("");
    const [SelectedCustomerId, setSelectedCustomerId] = useState("");
    const [selectedCustomerDetails, setSelectedCustomerDetails] = useState({
        name: '', email: '', number:''
    });
    const [isCustomerSelected, setIsCustomerSelected] = useState(false);
    const [editedName, setEditedName] = useState('');
    const [editedEmail, setEditedEmail] = useState('');
    const [editedNumber, setEditedNumber] = useState('');
    const [taxPercentage, setTaxPercentage] = useState(0);
    const [signUpData, setsignUpData] = useState(0);
    const [discountTotal, setdiscountTotal] = useState(0);
    const [estimateData, setestimateData] = useState({
        customername: '', itemname: '', customeremail: '',customerphone:'', estimate_id: '', EstimateNumber: '', purchaseorder: '',
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

    const fetchLastEstimateNumber = async () => {
        try {
            const userid = localStorage.getItem('userid');
            const authToken = localStorage.getItem('authToken');
            const response = await fetch(`https://grithomes.onrender.com/api/lastEstimateNumber/${userid}`, {
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
            console.log("json: ",json.taxPercentage);
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
        
        console.log(selectedCustomer,"Selected Customer");
        
        if (selectedCustomer) {
            setestimateData({
                ...estimateData,
                customername: selectedCustomer.name,
                customeremail: selectedCustomer.email,
                customerphone: selectedCustomer.number,
            });

            setSelectedCustomerDetails({
                name: selectedCustomer.name,
                email: selectedCustomer.email,
                number: selectedCustomer.number,
            });
            setIsCustomerSelected(true);
        }

        setsearchcustomerResults([...searchcustomerResults, event]);
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
            console.log(data,"Data sdsdfsdsfsdf");

            // Sending estimate data to the backend API
            const response = await fetch('https://grithomes.onrender.com/api/savecreateestimate', {
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
                    console.log(responseData,"responseData");
                    
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
        const response = await fetch('https://grithomes.onrender.com/api/savecreateestimate', {
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
                <div className="create-estimate-container mx-3 mx-md-4">
                  <form onSubmit={handleSubmit}>
                    <div className="invoice-header bg-light p-3 rounded-top shadow-sm mb-4">
                      <div className="row align-items-center">
                        <div className="col-lg-6 col-md-6 col-12">
                          <h2 className="fs-3 fw-bold text-primary mb-1">Create Estimate</h2>
                          <nav aria-label="breadcrumb">
                            <ol className="breadcrumb mb-0">
                              <li className="breadcrumb-item">
                                <a href="/Userpanel/Userdashboard" className="text-decoration-none text-muted">Dashboard</a>
                              </li>
                              <li className="breadcrumb-item active" aria-current="page">Create Estimate</li>
                            </ol>
                          </nav>
                        </div>
                        <div className="col-lg-6 col-md-6 col-12 text-md-end mt-3 mt-md-0">
                          <button className="btn btn-danger fw-bold" type="submit">
                            <i className="fas fa-save me-2"></i> Save
                          </button>
                        </div>
                      </div>
                      {alertMessage && (
                        <div className="mt-3">
                          <Alertauthtoken message={alertMessage} onClose={() => setAlertMessage('')} />
                        </div>
                      )}
                    </div>
  
                    <div className="row g-4">
                    <div className="col-lg-3 col-12">
                        <div className="card shadow-sm p-4">
                          <h5 className="fw-bold text-muted">Signature Options</h5>
                          <div className="form-check form-switch mb-3">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id="signatureSwitch"
                              onChange={handleSignatureSwitch}
                              checked={hasSignature}
                            />
                            <label className="form-check-label" htmlFor="signatureSwitch">Enable Signature</label>
                          </div>
                          {hasSignature && (
                            <>
                              <div className="form-check form-switch mb-3">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  id="addSignatureSwitch"
                                  checked={isAddSignatureSwitchOn}
                                  onChange={handleAddSignatureSwitch}
                                />
                                <label className="form-check-label" htmlFor="addSignatureSwitch">Add My Signature</label>
                              </div>
                              <div className="form-check form-switch">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  id="customerSignSwitch"
                                  checked={isCustomerSignSwitchOn}
                                  onChange={handleCustomerSignSwitch}
                                />
                                <label className="form-check-label" htmlFor="customerSignSwitch">Customer to Sign</label>
                              </div>
                            </>
                          )}
                        </div>
                        {isSignatureModalOpen && (
                          <SignatureModal onSave={saveSignature} onClose={() => setIsSignatureModalOpen(false)} />
                        )}
                      </div> 
                      <div className="col-lg-9 col-12">
                        <div className="card shadow-sm p-4">
                          <div className="row">
                            <div className="col-md-6 col-12">
                              {isCustomerSelected ? (
                                <div className="p-3 bg-light rounded">
                                  <h5 className="fw-bold text-dark">{selectedCustomerDetails.name}</h5>
                                  <p className="text-muted mb-1">{selectedCustomerDetails.email}</p>
                                  <p className="text-muted mb-2">{selectedCustomerDetails.number}</p>
                                  <button className="btn btn-link text-primary p-0" data-bs-toggle="modal" data-bs-target="#exampleModal">
                                    Edit
                                  </button>
                                </div>
                              ) : (
                                <div>
                                  <label className="form-label fw-bold">Select Customer</label>
                                  <div className="input-group">
                                    <Select
                                      value={searchcustomerResults}
                                      onChange={onChangecustomer}
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
                            <div className="col-md-6 col-12 mt-3 mt-md-0">
                              <div className="mb-3">
                                <label className="form-label fw-bold">Estimate Number</label>
                                <input
                                  type="text"
                                  name="EstimateNumber"
                                  className="form-control"
                                  value={estimateData.EstimateNumber}
                                  onChange={onchange}
                                  required
                                />
                              </div>
                              <div className="mb-3">
                                <label className="form-label fw-bold">Purchase Order (PO) #</label>
                                <input
                                  type="text"
                                  name="purchaseorder"
                                  className="form-control"
                                  onChange={onchange}
                                />
                              </div>
                              <div className="mb-3">
                                <label className="form-label fw-bold">Date</label>
                                <input
                                  type="date"
                                  name="date"
                                  className="form-control"
                                  value={estimateData.date}
                                  onChange={onchange}
                                  required
                                />
                              </div>
                              <div className="mb-3">
                                <label className="form-label fw-bold">Job</label>
                                <input
                                  type="text"
                                  name="job"
                                  className="form-control"
                                  value={estimateData.job}
                                  onChange={onchange}
                                  required
                                />
                              </div>
                            </div>
                          </div>
  
                          <div className="mt-4">
                            <div className="table-responsive">
                              <table className="table table-hover">
                                <thead className="table-light">
                                  <tr>
                                    <th>Item</th>
                                    <th className="text-center">Quantity</th>
                                    <th className="text-center">Unit</th>
                                    <th className="text-end">Price</th>
                                    <th className="text-end">Amount</th>
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
  
                                    return (
                                      <tr key={item.value}>
                                        <td>
                                          <div className="d-flex justify-content-between align-items-center">
                                            <strong>{item.label}</strong>
                                            <button
                                              type="button"
                                              className="btn btn-danger btn-sm"
                                              onClick={() => onDeleteItem(item.value)}
                                            >
                                              <i className="fas fa-trash"></i>
                                            </button>
                                          </div>
                                          <CKEditor
                                            editor={ClassicEditor}
                                            data={selectedItem?.description || ''}
                                            onChange={(event, editor) => onChangeDescription(event, editor, itemId)}
                                          />
                                        </td>
                                        <td className="text-center">
                                          <input
                                            type="number"
                                            className="form-control text-center"
                                            value={quantity}
                                            onChange={(event) => onChangeQuantity(event, itemId)}
                                            min="1"
                                          />
                                        </td>
                                        <td className="text-center">{selectedItem?.unit || '-'}</td>
                                        <td className="text-end">
                                          <input
                                            type="text"
                                            className="form-control text-end"
                                            value={itemPrice}
                                            onChange={(event) => onChangePrice(event, itemId)}
                                          />
                                        </td>
                                        <td className="text-end">
                                          <CurrencySign />{roundOff(discountedAmount)}
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                              {itemExistsMessage && (
                                <div className="alert alert-warning mt-3" role="alert">
                                  {itemExistsMessage}
                                </div>
                              )}
                            </div>
  
                            <div className="mt-3">
                              <label className="form-label fw-bold">Select Item</label>
                              <Select
                                value={searchitemResults}
                                onChange={onChangeitem}
                                options={items.map(item => ({ value: item._id, label: item.itemname }))}
                                placeholder="Add an item"
                                className="w-100"
                              />
                            </div>
  
                            <hr />
                            <div className="row mt-4">
                              <div className="col-lg-6 col-12"></div>
                              <div className="col-lg-6 col-12">
                                <table className="table table-borderless">
                                  <tbody>
                                    <tr>
                                      <td className="text-end fw-bold">Subtotal</td>
                                      <td className="text-end"><CurrencySign />{roundOff(calculateSubtotal())}</td>
                                    </tr>
                                    <tr>
                                      <td className="text-end fw-bold">Discount</td>
                                      <td className="text-end">
                                        <input
                                          type="number"
                                          className="form-control w-50 d-inline-block float-end"
                                          value={discountTotal}
                                          onChange={handleDiscountChange}
                                          min="0"
                                        />
                                      </td>
                                    </tr>
                                    <tr>
                                      <td className="text-end fw-bold">{signUpData.name} ({signUpData.percentage}%)</td>
                                      <td className="text-end"><CurrencySign />{roundOff(calculateTaxAmount())}</td>
                                    </tr>
                                    <tr>
                                      <td className="text-end fw-bold">Total</td>
                                      <td className="text-end fw-bold"><CurrencySign />{roundOff(calculateTotal())}</td>
                                    </tr>
                                    <tr>
                                      <td className="text-end fw-bold">Amount Due</td>
                                      <td className="text-end"><CurrencySign />{roundOff(calculateTotal())}</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>
  
                            <div className="mt-4">
                              <label className="form-label fw-bold">Additional Information</label>
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
                  </form>
  
                  {/* Edit Customer Modal */}
                  <div className="modal fade" id="exampleModal" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                    <div className="modal-dialog modal-lg">
                      <div className="modal-content">
                        <div className="modal-header">
                          <h5 className="modal-title fw-bold" id="exampleModalLabel">Edit Customer</h5>
                          <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                          <div className="mb-3">
                            <label className="form-label fw-bold">Name</label>
                            <select className="form-select" value={editedName} onChange={handleNameChange}>
                              <option value="" disabled>Select Name</option>
                              {customers.map(customer => (
                                <option key={customer._id} value={customer.name}>{customer.name}</option>
                              ))}
                            </select>
                          </div>
                          <div className="mb-3">
                            <label className="form-label fw-bold">Email</label>
                            <input
                              type="email"
                              className="form-control"
                              value={editedEmail}
                              onChange={(e) => setEditedEmail(e.target.value)}
                            />
                          </div>
                          <div className="mb-3">
                            <label className="form-label fw-bold">Phone Number</label>
                            <input
                              type="text"
                              className="form-control"
                              value={editedNumber}
                              onChange={(e) => setEditedNumber(e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="modal-footer">
                          <button type="button" className="btn btn-outline-secondary" data-bs-dismiss="modal">Close</button>
                          <button type="button" className="btn btn-primary" data-bs-dismiss="modal" onClick={handleEditCustomer}>Save changes</button>
                        </div>
                      </div>
                    </div>
                  </div>
  
                  {/* Add Customer Modal */}
                  <div className="modal fade" id="exampleModal1" tabIndex="-1" aria-labelledby="exampleModalLabel1" aria-hidden="true">
                    <div className="modal-dialog modal-lg">
                      <div className="modal-content">
                        <div className="modal-header">
                          <h5 className="modal-title fw-bold" id="exampleModalLabel1">Add Customer</h5>
                          <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                          <div className="row g-3">
                            <div className="col-md-6">
                              <label className="form-label fw-bold">Customer Name</label>
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
                            <div className="col-md-6">
                              <label className="form-label fw-bold">Contact Email</label>
                              <input
                                type="email"
                                className="form-control"
                                name="email"
                                value={credentials.email}
                                onChange={onchangeaddcustomer}
                                placeholder="Contact Email"
                                required
                              />
                            </div>
                            <div className="col-md-6">
                              <label className="form-label fw-bold">Phone Number</label>
                              <input
                                type="text"
                                className="form-control"
                                name="number"
                                value={credentials.number}
                                onChange={onchangeaddcustomer}
                                placeholder="Phone Number"
                                required
                              />
                            </div>
                            <div className="col-12">
                              <label className="form-label fw-bold">Additional Information</label>
                              <textarea
                                className="form-control"
                                name="information"
                                onChange={onchangeaddcustomer}
                                placeholder="Information"
                              />
                            </div>
                            <div className="col-md-6">
                              <label className="form-label fw-bold">Address 1</label>
                              <input
                                type="text"
                                className="form-control"
                                name="address1"
                                onChange={onchangeaddcustomer}
                                placeholder="Address 1"
                              />
                            </div>
                            <div className="col-md-6">
                              <label className="form-label fw-bold">Address 2</label>
                              <input
                                type="text"
                                className="form-control"
                                name="address2"
                                onChange={onchangeaddcustomer}
                                placeholder="Address 2"
                              />
                            </div>
                            <div className="col-md-6">
                              <label className="form-label fw-bold">Country</label>
                              <CountrySelect
                                value={credentials.countryid}
                                onChange={(val) => {
                                  setCountryId(val.id);
                                  setCountry(val.name);
                                  setCredentials({ ...credentials, countrydata: JSON.stringify(val) });
                                }}
                                valueType="short"
                                placeHolder="Select Country"
                              />
                            </div>
                            <div className="col-md-6">
                              <label className="form-label fw-bold">State</label>
                              <StateSelect
                                countryid={countryid}
                                onChange={(val) => {
                                  setStateId(val.id);
                                  setState(val.name);
                                  setCredentials({ ...credentials, statedata: JSON.stringify(val) });
                                }}
                                placeHolder="Select State"
                              />
                            </div>
                            <div className="col-md-6">
                              <label className="form-label fw-bold">City</label>
                              <CitySelect
                                countryid={countryid}
                                stateid={stateid}
                                onChange={(val) => {
                                  setCityId(val.id);
                                  setCity(val.name);
                                  setCredentials({ ...credentials, citydata: JSON.stringify(val) });
                                }}
                                placeHolder="Select City"
                              />
                            </div>
                            <div className="col-md-6">
                              <label className="form-label fw-bold">Post Code</label>
                              <input
                                type="text"
                                className="form-control"
                                name="post"
                                onChange={onchangeaddcustomer}
                                placeholder="Post Code"
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
              </div>
            </div>
          </div>
        )}
      </div>
    )
}
