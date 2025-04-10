import React,{useState,useEffect} from 'react'
import { format } from 'date-fns';
import {useNavigate,useLocation} from 'react-router-dom'
import { ColorRing } from  'react-loader-spinner'
import Usernav from './Usernav';
import Usernavbar from './Usernavbar';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
// import VirtualizedSelect from 'react-virtualized-select';
// import 'react-virtualized-select/styles.css';
// import 'react-virtualized/styles.css'
import Select from 'react-select';
import CurrencySign from '../../components/CurrencySign ';
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

export default function Editinvoice() {
    const [ loading, setloading ] = useState(true);
    const [customers, setcustomers] = useState([]);
    const [selectedCustomerDetails, setSelectedCustomerDetails] = useState({
        name: '', email: ''});
    const [searchcustomerResults, setSearchcustomerResults] = useState([]);
    const [isCustomerSelected, setIsCustomerSelected] = useState(false);
    const [items, setitems] = useState([]);
    const [searchitemResults, setSearchitemResults] = useState([]);
    const [quantityMap, setQuantityMap] = useState({});
    const [discountMap, setDiscountMap] = useState({});
    const [itemExistsMessage, setItemExistsMessage] = useState('');
    const [discountTotal, setdiscountTotal] = useState(0);
    const [taxPercentage, setTaxPercentage] = useState(0);
    const [invoiceData, setInvoiceData] = useState({
        _id: '', customername: '',itemname: '',customeremail: '',InvoiceNumber: '',purchaseorder: '',
        date: new Date(),duedate: new Date(),description: '',itemquantity: '', price: '',discount: '',
        discountTotal:'',amount: '',tax: '',taxpercentage:'',subtotal: '',total: '',amountdue: '',information: '', items:[]
    });
    const location = useLocation();
    const invoiceid = location.state?.invoiceid;
    const [editorData, setEditorData] = useState("<p></p>");
    const [noteimageUrl, setnoteImageUrl] = useState(''); 
    const [alertMessage, setAlertMessage] = useState('');
    const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
    const [hasSignature, setHasSignature] = useState(false);
    const [isAddSignatureSwitchOn, setIsAddSignatureSwitchOn] = useState(false);
    const [isCustomerSignSwitchOn, setIsCustomerSignSwitchOn] = useState(false);

   
    useEffect(() => {
        if (!localStorage.getItem('authToken') || localStorage.getItem('isTeamMember') === 'true') {
            navigate('/');
        } else if (invoiceid) {
            fetchInvoiceData();
            fetchitemdata();
            fetchcustomerdata();
            fetchSignatureStatus();
        }
        if (isNaN(discountTotal)) {
            setdiscountTotal(0);
        }
    }, [invoiceid]);

    let navigate = useNavigate();

    

    const fetchSignatureStatus = async () => {
        try {
            const ownerId = localStorage.getItem('userid');
            const response = await fetch(`https://grithomes.onrender.com/api/check-signature/${ownerId}`);
            const data = await response.json();
            setHasSignature(data.hasSignature);
            setIsAddSignatureSwitchOn(data.hasSignature); 
            setIsCustomerSignSwitchOn(data.hasSignature);
        } catch (error) {
            console.error('Error checking signature:', error);
        }
    };

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

    const roundOff1 = (amount) => {
        return parseFloat(amount).toFixed(2);
      };
      const roundOff = (value) => {
        return Math.round(value * 100) / 100;
      };
    

    const fetchInvoiceData = async () => {
        try {
            const authToken = localStorage.getItem('authToken');
            const response = await fetch(`https://grithomes.onrender.com/api/geteditinvoicedata/${invoiceid}`, {
                headers: {
                    'Authorization': authToken,
                }
            });
            if (response.status === 401) {
                const json = await response.json();
                setAlertMessage(json.message);
                setloading(false);
                window.scrollTo(0, 0);
                return;
            } else {
                const json = await response.json()
                console.log(json,"json ===");
                ;
                if (json.Success) {
                    setInvoiceData(json.invoices);
                    setdiscountTotal(json.invoices.discountTotal);
                } else {
                    console.error('Error fetching invoice data:', json.message);
                }
                setloading(false);
            }
        } catch (error) {
            console.error('Error fetching invoice data:', error);
        }
    };

    const fetchcustomerdata = async () => {
        try {
            const userid =  localStorage.getItem("userid");
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
                window.scrollTo(0,0);
                return; // Stop further execution
              }
              else{
                const json = await response.json();
            
                if (Array.isArray(json)) {
                    setcustomers(json);
                }
              }
            
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }

    const onChangecustomer = (event) => {
        const selectedCustomerId = event.value;
        const selectedCustomer = customers.find((customer) => customer._id === selectedCustomerId);

        if (selectedCustomer) {
            setInvoiceData({
                ...invoiceData,
                customername: selectedCustomer.name,
                customeremail: selectedCustomer.email,
            });
    
            setSelectedCustomerDetails({
                name: selectedCustomer.name,
                email: selectedCustomer.email
            });
            setIsCustomerSelected(true); 
        }

        setSearchcustomerResults([...searchcustomerResults, event]);
    };

    const fetchitemdata = async () => {
        try {
            const userid =  localStorage.getItem("userid");
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
                window.scrollTo(0,0);
                return; // Stop further execution
              }
              else{
                const json = await response.json();
                console.log(json,"json - ");
                
            
                if (Array.isArray(json)) {
                    setitems(json);
                }
                setloading(false);
              }
            
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }

    const handleSaveClick = async () => {
        try {
            const updatedInvoiceData = {
                ...invoiceData,
                subtotal: calculateSubtotal(), // Update subtotal
                total: calculateTotal(), // Update total
                amountdue: calculateTotal(), // Update amountdue
                items: invoiceData.items, // Include invoiceData.items
                // searchitemResults: searchitemResults 
                tax: calculateTaxAmount(), 
                discountTotal: discountTotal,
                isAddSignature: isAddSignatureSwitchOn, 
                isCustomerSign: isCustomerSignSwitchOn,
            };
    
            const authToken = localStorage.getItem('authToken');
            const response = await fetch(`https://grithomes.onrender.com/api/updateinvoicedata/${invoiceid}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': authToken,
                },
                body: JSON.stringify(updatedInvoiceData)
            });
            if (response.status === 401) {
                const json = await response.json();
                setAlertMessage(json.message);
                setloading(false);
                window.scrollTo(0,0);
                return; // Stop further execution
            }
            else{
               const json = await response.json();
    
                if (json.Success) {
                    navigate('/userpanel/Invoicedetail', { state: { invoiceid } });
                    console.log(updatedInvoiceData);
                } else {
                    console.error('Error updating invoice data:', json.message);
                } 
            }
    
            
        } catch (error) {
            console.error('Error updating invoice data:', error);
        }
    };

    const addSelectedItemToInvoice = (selectedItem) => {
        const { value, label } = selectedItem;
        // Check if the item is already present in invoiceData.items
        const itemExists = invoiceData.items.some((item) => item.itemId === value);
    
        if (!itemExists) {
            const selectedPrice = items.find((i) => i._id === value)?.price || 0;
            const selectedUnit = items.find((i) => i._id === value)?.unit || 0;
            const selectedDescription = items.find((i) => i._id === value)?.description || "";
            const newItem = {
                itemId: value,
                itemname: label,
                price: selectedPrice,
                unit:selectedUnit,
                itemquantity: 1, // Set default quantity or whatever value you prefer
                discount: 0, // Set default discount or whatever value you prefer
                amount: selectedPrice, // Initially set amount same as price
                description: selectedDescription, // Set the description if needed
            };
            // Add the selected item to invoiceData.items
            setInvoiceData({
                ...invoiceData,
                items: [...invoiceData.items, newItem],
            });
        } else {
            // Handle case where item already exists in invoiceData.items
            // You might want to show a message to the user
            console.log('Item already added to the invoice');
        }
    };

    // const onChangeitem = (event) => {
    //     const newItemId = event.value;
    //     const newItemLabel = event.label;

    //     const isItemExists = searchitemResults.some((item) => item.value === newItemId);

    //     if (!isItemExists) {
    //         setSearchitemResults([...searchitemResults, { value: newItemId, label: newItemLabel }]);
    //         setItemExistsMessage(''); // Clear any existing message
    //     } else {
    //         setItemExistsMessage('This item is already added!');
    //     }
    // };

    const onChangeitem = (selectedItem) => {
        // Check if the selected item already exists in invoiceData.items
        const itemExists = invoiceData.items && invoiceData.items.some(item => item.itemId === selectedItem.value);
        if (itemExists) {
            setItemExistsMessage('This item is already added!');
        } else {
            setItemExistsMessage('');
            // Call the function to add the selected item to invoiceData.items
            addSelectedItemToInvoice(selectedItem);
        }
    };

    // const onChangeitem = (selectedItem) => {
    //     // Call the function to add the selected item to invoiceData.items
    //     addSelectedItemToInvoice(selectedItem);
    // };

    const handleEditorChange = (event, editor) => {
        const data = editor.getData();
        setInvoiceData({ ...invoiceData, information: data });
    };
    const handledescChange = (event, editor) => {
        const data = editor.getData();
        setInvoiceData({ ...invoiceData, description: data });
    };
    

    const handleQuantityChange = (event, itemId) => {
        const { value } = event.target;
        const updatedItems = invoiceData.items.map((item) => {
          if (item.itemId === itemId) {
            const newQuantity = parseFloat(value) >= 0 ? parseFloat(value) : 0;
            const newAmount = calculateDiscountedAmount(item.price, newQuantity, item.discount);
            
            return {
              ...item,
              itemquantity: newQuantity,
              amount: newAmount,
            };
          }
          return item;
        });
      
        setInvoiceData({ ...invoiceData, items: updatedItems });
      };
      
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

    const handleDeleteClick = async (itemId) => {
        try {
            if (!itemId) {
                console.error('Item ID is undefined or null');
                return;
            }
    
            const authToken = localStorage.getItem('authToken');
            const response = await fetch(`https://grithomes.onrender.com/api/delinvoiceitem/${invoiceData._id}/${itemId}`, {
                method: 'GET',
                headers: {
                    'Authorization': authToken,
                }
            });
            if (response.status === 401) {
                const json = await response.json();
                setAlertMessage(json.message);
                setloading(false);
                window.scrollTo(0,0);
                return; // Stop further execution
            }
            else{
                if (!response.ok) {
                    const errorMessage = await response.text();
                    throw new Error(`Failed to delete item: ${errorMessage}`);
                }

                const updatedItems = invoiceData.items.filter(item => item.itemId !== itemId);
                setInvoiceData(prevData => ({
                    ...prevData,
                    items: updatedItems,
                }));
    
            // Update UI or perform other actions upon successful deletion
            // fetchdata();
            }
    
            
        } catch (error) {
            console.error('Error deleting item:', error);
        }
    };
    
    const calculateDiscountedAmount = (price, quantity, discount) => {
        const totalAmount = price * quantity;
        const discountedAmount = totalAmount - Math.max(discount, 0); // Ensure discount is not negative
        return discountedAmount > 0 ? discountedAmount : 0;
      };
      
      const onDiscountpreitemChange = (event, itemId) => {
        const { value } = event.target;
        const regex = /^\d*\.?\d{0,2}$/; // Regex to allow up to two decimal places
    
        // Check if the input matches the allowed format
        if (regex.test(value)) {
            const newDiscount = value !== '' ? parseFloat(value) : 0;
    
            // Update only the discount for the specific item with the matching itemId
            const updatedItems = invoiceData.items.map((item) => {
                if (item.itemId === itemId) {
                    const quantity = item.itemquantity || 1;
                    const discountedAmount = calculateDiscountedAmount(item.price, quantity, newDiscount);
    
                    return {
                        ...item,
                        discount: newDiscount,
                        amount: discountedAmount,
                    };
                }
                return item;
            });
    
            // Set the updated items in the state
            setInvoiceData({
                ...invoiceData,
                items: updatedItems,
            });
        } else {
            // Handle invalid input (e.g., show a message to the user)
            console.log('Invalid input for discount');
        }
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
      
        // Calculate subtotal for invoiceData.items
        if (invoiceData.items && Array.isArray(invoiceData.items)) {
            invoiceData.items.forEach((item) => {
              const itemPrice = item.price || 0;
              const quantity = item.itemquantity || 1;
              const discount = item.discount || 0;
        
              const discountedAmount = calculateDiscountedAmount(itemPrice, quantity, discount);
        
              subtotal += discountedAmount;
            });
          }
      
        // Calculate subtotal for searchitemResults
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
            setInvoiceData({ ...invoiceData, taxpercentage: enteredTax }); 
        }
    };
    
    // Function to calculate tax amount
    const calculateTaxAmount = () => {
        const subtotal = calculateSubtotal();
        const totalDiscountedAmount = subtotal - discountTotal; 
        const taxAmount = (totalDiscountedAmount * invoiceData.taxpercentage) / 100;
        return taxAmount;
    };
    

    const calculateTotal = () => {
        const subtotal = calculateSubtotal();
        const taxAmount = calculateTaxAmount();
        const discountAmount = discountTotal;
        // console.log(discountAmount,"- discountAmount");
        const totalAmount = (subtotal- discountAmount) + taxAmount ;
        return totalAmount;
      };

    const onchange = (event) => {
        const { name, value } = event.target;
        setInvoiceData({ ...invoiceData, [name]: value });
    };

    const handlePriceChange = (event, itemId) => {
        const { value } = event.target;
        const numericValue = value.replace(/[^0-9.]/g, ''); // Remove any non-numeric characters except decimal point
      
        // Limit the numeric value to two decimal places
        const decimalIndex = numericValue.indexOf('.');
        let formattedValue = numericValue;
        if (decimalIndex !== -1) {
          formattedValue = numericValue.slice(0, decimalIndex + 1) + numericValue.slice(decimalIndex + 1).replace(/[^0-9]/g, '').slice(0, 2);
        }
      
        const newPrice = parseFloat(formattedValue) || 0;
      
        const updatedItems = invoiceData.items.map((item) => {
          if (item.itemId === itemId) {
            const newAmount = newPrice * item.itemquantity;
            return {
              ...item,
              price: formattedValue, // Update with formatted value
              amount: roundOff(newAmount),
            };
          }
          return item;
        });
      
        setInvoiceData((prevData) => ({
          ...prevData,
          items: updatedItems,
        }));
      };
      

      const handlePriceBlur = (event, itemId) => {
        const { value } = event.target;
        const newPrice = parseFloat(value) || 0;
        
        const updatedItems = invoiceData.items.map((item) => {
          if (item.itemId === itemId) {
            const newAmount = newPrice * item.itemquantity;
            return {
              ...item,
              price: roundOff(newPrice), // Format to two decimal places
              amount: roundOff(newAmount),
            };
          }
          return item;
        });
      
        setInvoiceData((prevData) => ({
          ...prevData,
          items: updatedItems,
        }));
      };
      
    const handleDescriptionChange = (editor, itemId) => {
        const value = editor.getData();
        const updatedItems = invoiceData.items.map((item) => {
            if (item.itemId === itemId) {
                return { ...item, description: value };
            }
            return item;
        });
        setInvoiceData({ ...invoiceData, items: updatedItems });
    };
    //   const handleDescriptionChange = (event, itemId) => {
    //     if (event && event.target && typeof event.target.value !== 'undefined') {
    //       const { value } = event.target;
    //       setInvoiceData((prevData) => ({
    //         ...prevData,
    //         items: prevData.items.map((item) =>
    //           item.itemId === itemId ? { ...item, description: value } : item
    //         ),
    //       }));
    //     }
    //   };
      
    // const handleDiscountChange = (e) => {
    //     // Ensure you're setting the state to the new value entered by the user
    //     setdiscountTotal(parseFloat(e.target.value)); // Assuming the input should accept decimal values
    // }; 
    const handleDiscountChange = (event) => {
        const value = event.target.value;
        // If the input is empty or NaN, set the value to 0
        const newValue = value === '' || isNaN(parseFloat(value)) ? 0 : parseFloat(value);
        setdiscountTotal(newValue);
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
                    <div className='mx-4'>
        
                        {/* <form> */}
                        <div className='row py-4 px-2 breadcrumbclr'>
                            <div className="col-lg-4 col-md-6 col-sm-6 col-7 me-auto">
                                <p className='fs-35 fw-bold'>Invoice</p>
                                <nav aria-label="breadcrumb">
                                    <ol class="breadcrumb mb-0">
                                        <li class="breadcrumb-item"><a href="/userpanel/Userdashboard" className='txtclr text-decoration-none'>Dashboard</a></li>
                                        <li class="breadcrumb-item"><a href="/userpanel/Invoice" className='txtclr text-decoration-none'>Invoice</a></li>
                                        <li class="breadcrumb-item active" aria-current="page">Edit Invoice</li>
                                    </ol>
                                </nav>
                            </div>
                            <div className="col-lg-3 col-md-4 col-sm-4 col-5 text-right">
                                <button className='btn rounded-pill btn-danger text-white fw-bold' type="submit" onClick={handleSaveClick}>Save</button>
                            </div>
                            <div className='mt-2'>
                                {alertMessage && <Alertauthtoken message={alertMessage} onClose={() => setAlertMessage('')} />}
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-lg-9 col-12 order-2 order-lg-1">
                                <div className='box1 rounded adminborder p-4 m-2 mb-5'>
                                    <div className='row me-2'>
                                        <div className="col-5">
                                                <div className="customerdetail p-3">
                                                    <ul>
                                                        <li className='fw-bold fs-4'>{invoiceData.customername}</li>
                                                    </ul>
                                                    <p>{invoiceData.customeremail}</p>
                                                </div>
                                        </div>    
                                        <div className="col-7">
                                            <div className="row">
                                                <div className="col-6">
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
                                                        disabled
                                                        />
                                                    </div>
                                                </div>
                                                <div className="col-6">
                                                    <div className="mb-3">
                                                        <label htmlFor="purchaseoder" className="form-label">
                                                            Purchase Order (PO) #
                                                        </label>
                                                        <input
                                                        type="text"
                                                        name="purchaseorder"
                                                        className="form-control"
                                                        value={invoiceData.purchaseorder}
                                                        onChange={onchange}
                                                        id="purchaseoder"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="col-6">
                                                    <div className="mb-3">
                                                        <label htmlFor="Date" className="form-label">
                                                        Date
                                                        </label>
                                                        <input
                                                        type="date"
                                                        name="date"
                                                        className="form-control"
                                                        value={new Date(invoiceData.date).toISOString().split('T')[0]} 
                                                        onChange={onchange}
                                                        // placeholder="Date"
                                                        id="Date"
                                                        required
                                                        />
                                                    </div>
                                                </div>
                                                <div className="col-6">
                                                    <div className="mb-3">
                                                        <label htmlFor="job" className="form-label">
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
                                                        />
                                                    </div>
                                                </div>
                                                <div className="col-6">
                                                    <div className="mb-3">
                                                        <label htmlFor="duedate" className="form-label">
                                                            Due Date
                                                        </label>
                                                        <input
                                                        type="date"
                                                        name="duedate"
                                                        className="form-control"
                                                        value={new Date(invoiceData.duedate).toISOString().split('T')[0]} 
                                                        onChange={onchange}
                                                        id="duedate"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>    
                                    </div>

                                    <div className='box1 rounded adminborder p-4 m-2'>
                                        <div className="row pt-3">
                                            <div className="col-6">
                                                <p>ITEM</p>
                                            </div>
                                            <div className="col-2">
                                                <p>QUANTITY</p>
                                            </div>
                                            <div className="col-2">
                                                <p>UNIT</p>
                                            </div>
                                            <div className="col-2">
                                                <p>PRICE</p>
                                            </div>
                                            <div className="col-2">
                                                <p>AMOUNT</p>
                                            </div>
                                        </div>

                                        <div>
                                            {console.log(invoiceData.items, "invoiceData.items")}
                                        {invoiceData.items && invoiceData.items.map((item) => (
                                            <div className='row' key={item.itemId}>
                                            <div className="col-6 ">
                                                <div className="mb-3 d-flex align-items-baseline justify-content-between">
                                                    <p>{item.itemname}</p>
                                                    <button type="button" className="btn btn-danger btn-sm me-2" onClick={() => handleDeleteClick(item.itemId)}> 
                                                        <i className="fas fa-trash"></i>
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="col-2">
                                                <div className="mb-3">
                                                <input
                                                    type="number"
                                                    name="quantity"
                                                    className="form-control"
                                                    value={item.itemquantity}
                                                    onChange={(event) => handleQuantityChange (event, item.itemId)}
                                                    id={`quantity-${item.itemId}`}
                                                    required
                                                />
                                                </div>
                                            </div>
                                            <div className="col-2">
                                                <div className="mb-3">
                                                    {item.unit || '-'}
                                                </div>
                                            </div>
                                            <div className="col-2">
                                                <div className="mb-3">
                                                
                                                    <input
                                                                type="text"
                                                                name="price"
                                                                className="form-control"
                                                                value={item.price}
                                                                id={`price-${item.itemId}`}
                                                                required
                                                                onChange={(event) => handlePriceChange(event, item.itemId)}
                                                                onBlur={(event) => handlePriceBlur(event, item.itemId)}
                                                            />
                                                </div>
                                            </div>
                                        
                                            <div className="col-2">
                                                <p><CurrencySign />{item.amount}</p>
                                            </div>
                                            <div className="col-6">
                                                        <div class="mb-3">
                                                            <label htmlFor="description" className="form-label">Description</label>
                                                        
                                                            <CKEditor
                                                                editor={ClassicEditor}
                                                                data={item.description} // Make sure item.description is a valid string
                                                                onChange={(event, editor) => {
                                                                    handleDescriptionChange(editor, item.itemId);
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
                                                ))}
                                                <div className='col-lg-6 col-12'>
                                                {itemExistsMessage && (
                                                    <div className="alert alert-warning mt-3" role="alert">
                                                        {itemExistsMessage}
                                                    </div>
                                                )}
                                                </div>
                                                
                                                {/* {searchitemResults.map((item) => {
                                                    const selectedItem = items.find((i) => i._id === item.value);
                                                    const itemPrice = selectedItem?.price || 0;
                                                    const itemId = item.value;
                                                    const quantity = quantityMap[itemId] || 1;
                                                    const discount = discountMap[itemId] || 0;
                                                    const discountedAmount = calculateDiscountedAmount(itemPrice, quantity, discount);
                                                    const formattedTotalAmount = Number(discountedAmount).toLocaleString('en-IN', {
                                                    
                                                    });

                                                    return (
                                                        <div className='row'  key={item.itemId}>
                                                            <div className="col-6 ">
                                                                <div className="mb-3 d-flex align-items-baseline justify-content-between">
                                                                    <p>{item.label}</p>
                                                                    <button type="button" className="btn btn-danger btn-sm me-2" onClick={() => onDeleteItem(item.value)}>
                                                                        <i className="fas fa-trash"></i>
                                                                    </button>
                                                                </div>
                                                            </div>
                                                            <div className="col-2">
                                                                <div className="mb-3">
                                                                <input
                                                                    type="number"
                                                                    name={`quantity-${itemId}`}
                                                                    className="form-control"
                                                                    value={quantity}
                                                                    onChange={(event) => onChangeQuantity(event, itemId)}
                                                                    id={`quantity-${itemId}`}
                                                                    required
                                                                />
                                                                </div>
                                                            </div>
                                                            <div className="col-2">
                                                                <div className="mb-3">
                                                                    <input
                                                                        type="number"
                                                                        name="price"
                                                                        className="form-control"
                                                                        value={itemPrice}
                                                                        id="price"
                                                                        required
                                                                        readOnly
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="col-2 text-center">
                                                                <p><CurrencySign />{formattedTotalAmount}</p>
                                                            </div>
                                                            <div className="col-6">
                                                                <div class="mb-3">
                                                                    <label htmlFor="description" className="form-label">Description</label>
                                                                    <CKEditor
                                                                        editor={ ClassicEditor }
                                                                        data={invoiceData.description}
                                                                        onChange={handledescChange}
                                                                        onBlur={ ( event, editor ) => {
                                                                            console.log( 'Blur.', editor );
                                                                        } }
                                                                        onFocus={ ( event, editor ) => {
                                                                            console.log( 'Focus.', editor );
                                                                        } }
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                        );
                                                })} */}

                                        </div>
                                        <hr />

                                        <div className="row pt-3">
                                            <div className="col-7">
                                                <div className="search-container forms">
                                                    <p className='fs-20 mb-0'>Select Item</p>
                                                    <Select
                                                        className="form-control zindex op pl-0"
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
                                            <div className="col-5">
                                                <div className="row">
                                                    <div className="col-6">
                                                        <p>Subtotal</p>
                                                        <p>GST {invoiceData.taxpercentage}%</p>
                                                        <p>Discount</p>
                                                        <p>Total</p>
                                                    </div>
                                                    <div className="col-6">
                                                        <p><CurrencySign />{calculateSubtotal().toLocaleString('en-IN', {
                                                        })}</p>
                                                        <div className="col-6">
                                                    </div>
                                                        <p><CurrencySign />{calculateTaxAmount().toLocaleString('en-IN', {
                                                        })}</p>
                                                        
                                                        <div className="mb-3">
                                                            <input
                                                                type="number"
                                                                name="totaldiscount"
                                                                className="form-control"
                                                                value={discountTotal}
                                                                onChange={handleDiscountChange} 
                                                                placeholder="Enter Discount Total"
                                                                id="discountInput"
                                                                min="0"
                                                            />
                                                        </div>
                                                        <p><CurrencySign />{calculateTotal().toLocaleString('en-IN', {
                                                            })}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <hr />
                                        <div className="row pt-3">
                                            <div className="col-7"></div>
                                            <div className="col-5">
                                                <div className="row">
                                                    <div className="col-6">
                                                        <p>Amount due</p>
                                                    </div>
                                                    <div className="col-6">
                                                        <p><CurrencySign />{calculateTotal().toLocaleString('en-IN', {
                                                        
                                                            })}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className='box1 rounded adminborder m-2 mt-5'>
                                        <CKEditor
                                            editor={ ClassicEditor }
                                            data={invoiceData.information}
                                            // onReady={ editor => {
                                            //     console.log( 'Editor is ready to use!', editor );
                                            // } }
                                            
                                            // data={editorData}
                                            config={{ extraPlugins: [MyCustomUploadAdapterPlugin] }}
                                            onChange={handleEditorChange}
                                            onBlur={ ( event, editor ) => {
                                                console.log( 'Blur.', editor );
                                            } }
                                            onFocus={ ( event, editor ) => {
                                                console.log( 'Focus.', editor );
                                            } }
                                        />
                                    </div>
                                </div>
                            </div>
                            
                            <div className="col-lg-3 col-12 order-1 order-lg-2">
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
                        </div>

                        {/* </form> */}
                    </div>
                </div>
            </div>
        </div>
}
    </div>
  )
}
