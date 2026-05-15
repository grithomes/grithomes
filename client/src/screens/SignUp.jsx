import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import './Login.css'

export default function SignUp() {

    const [credentails, setcredentails] = useState({ 
        companyname: "", 
        Businesstype: "", 
        CurrencyType: "", 
        FirstName: "", 
        LastName: "", 
        email: "",
        password: "",
        address: "",
        companyImageUrl: null
    })
    
  const [addedCompanyPhotos, setCompanyAddedPhotos] = useState([]);
    const [message, setmessage] = useState(false);
    const [alertshow, setalertshow] = useState('');
    let navigate = useNavigate();

    const imageupload = async () => {

        const data = new FormData();
      
        if (!addedCompanyPhotos) {
          alert("No image selected.")
          throw new Error("No image selected.");
        }
      // Check the file type
      const allowedTypes = ["image/png", "image/jpeg"];
      if (!allowedTypes.includes(addedCompanyPhotos.type)) {
        alert("Invalid file type. Please select a PNG or JPG file.")
        throw new Error("Invalid file type. Please select a PNG or JPG file.");
      }
      
      // Check the file size (in bytes)
      const maxSizeMB = 2; // Set the maximum file size in megabytes
      const maxSizeBytes = maxSizeMB * 1024 * 1024;
      if (addedCompanyPhotos.size > maxSizeBytes) {
        alert(`File size exceeds the maximum limit of ${maxSizeMB} MB.`)
        throw new Error(`File size exceeds the maximum limit of ${maxSizeMB} MB.`);
      }
      
      data.append("file", addedCompanyPhotos);
        data.append("upload_preset", "employeeApp");
        data.append("cloud_name", "dxwge5g8f");
      
        try {
          const cloudinaryResponse = await fetch(
            "https://api.cloudinary.com/v1_1/dxwge5g8f/image/upload",
            {
              method: "post",
              body: data,
            }
          );
      
          if (!cloudinaryResponse.ok) {
            console.error("Error uploading image to Cloudinary:", cloudinaryResponse.statusText);
            return;
          }
      
          const cloudinaryData = await cloudinaryResponse.json();
          console.log("Cloudinary URL:", cloudinaryData.url);
      
          return cloudinaryData.url;
        } catch (error) {
          console.error("Error uploading image to Cloudinary:", error.message);
          return null;
        }
      };
      

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Get cover image
        const companyFormData = new FormData();
        const imgurl = await imageupload();
        console.log("imgurl: ", imgurl);
        
        
        companyFormData.append('companyImage', imgurl);
        console.log("imgurl: ", companyFormData);


        // const companyUploadResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/upload-image`, {
        // method: 'POST',
        // body: companyFormData,
        // });
        // const uploadedCompanyImage = await companyUploadResponse.json();
        // console.log('Uploaded company image:', uploadedCompanyImage);
        // const companyImageUrl = uploadedCompanyImage.companyImageUrl || '';
    
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/createuser`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            companyname: credentails.companyname, 
            email: credentails.email, 
            password: credentails.password,
            Businesstype: credentails.Businesstype, 
            CurrencyType: credentails.CurrencyType, 
            FirstName: credentails.FirstName, 
            LastName: credentails.LastName, 
            address: credentails.address ,
            companyImageUrl: imgurl,
        })
        });
    
        const json = await response.json();
        console.log(json);
    
        if (json.success) {
          setcredentails({ 
            companyname: "", 
            Businesstype: "", 
            CurrencyType: "", 
            FirstName: "", 
            LastName: "", 
            email: "",
            password: "",
            address: ""
        })
          setmessage(true)
          setalertshow(json.message)
          navigate('/')
        }

        else{
            alert("This Email id already Registered")
            setmessage(true)
            setalertshow(json.message)
        }
      }
    
    //   const onchange = (event) => {
    //     setcredentails({ ...credentails, [event.target.name]: event.target.value })
    //   }
        const onchange = (event) => {
    const { name, value } = event.target;
    setcredentails({ ...credentails, [name]: value });
    localStorage.setItem("currencyType", value); // Store currency type in local storage
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setcredentails({ ...credentails, companyLogoImage: file });
    };

  return (
    <div className='container mx-auto px-6 py-6'>
        <h1 className='text-center mb-8 font-semibold'>IN<span className='clrblue'>VOICE</span></h1>
      <section className='flex justify-center items-center'>
        
        <form className="signup-form signupbox" onSubmit={handleSubmit}>
            <div className=' p-8 pb-4 mt-6'>
                <p className='text-xl font-semibold font-semibold'>Sign Up</p>

                <div className="flex flex-wrap -mx-2">
                    <div className="w-full px-2 w-full md:w-1/2 px-2 col-sm-6 w-full lg:w-1/2 px-2">
                        <div className='mb-6'>
                        <label className='form-label'>Choose Company Image</label>
                        <input 
                        type="file" 
                        onChange={(e) => setCompanyAddedPhotos(e.target.files[0])}
                        
                        />
                        </div>
                    </div>
                    <div className="w-full px-2 w-full px-2 w-full md:w-1/2 px-2 w-full lg:w-1/2 px-2">
                        <div className="form-group pt-4">
                            <label className="label py-2" for="company_name">Company name</label>
                            <input type="text" className="form-control" name="companyname" onChange={onchange} value={credentails.companyname} placeholder="Company name" required />
                        </div>
                    </div>

                    <div className="w-full px-2 w-full px-2 w-full md:w-1/2 px-2 w-full lg:w-1/2 px-2">
                        <div className="form-group pt-4">
                            <label htmlFor="exampleInputtext2" className="form-label py-1">Business Type</label>
                            <select
                              className="input-standard"
                              name="Businesstype"
                              value={credentails.Businesstype}
                              onChange={onchange}
                              aria-label="Default select example"
                              required
                            >
                                <option value="">Select Business Type</option>
                                <option value="Art, Photography & Creative Services">Art, Photography & Creative Services</option>
                                <option value="Construction & Trades">Construction & Trades</option>
                                <option value="Cleaning & Property Maintenance">Cleaning & Property Maintenance</option>
                                <option value="Consulting & Professional Services">Consulting & Professional Services</option>
                                <option value="Hair, Spa & Beauty">Hair, Spa & Beauty</option>
                            </select>
                        </div>
                    </div>

                    <div className="w-full px-2 w-full px-2 w-full md:w-1/2 px-2 w-full lg:w-1/2 px-2">
                        <div className="form-group pt-4">
                            <label htmlFor="exampleInputtext3" className="form-label py-1">Currency Type</label>
                            <select
                              className="input-standard"
                              name="CurrencyType"
                              value={credentails.CurrencyType}
                              onChange={onchange}
                              aria-label="Default select example"
                              required
                            >
                                <option value="">Select Currency Type</option>
                                <option value="AUD"> AUD - Australian Dollar </option>
                                <option value="CAD"> CAD - Canadian Dollar </option>
                                <option value="INR"> INR - Indian Rupee </option>
                            </select>
                        </div>
                    </div>
                    
                    <div className="w-full px-2 w-full px-2 w-full md:w-1/2 px-2 w-full lg:w-1/2 px-2">
                        <div className="form-group pt-4">
                            <label className="label py-2" for="First_Name">First Name</label>
                            <input type="text" className="form-control" name="FirstName" value={credentails.FirstName} onChange={onchange} placeholder="First Name" required />
                        </div>
                    </div>
                    <div className="w-full px-2 w-full px-2 w-full md:w-1/2 px-2 w-full lg:w-1/2 px-2">
                        <div className="form-group pt-4">
                            <label className="label py-2" for="Last_Name">Last Name</label>
                            <input type="text" className="form-control" name="LastName" value={credentails.LastName} onChange={onchange} placeholder="Last Name"  />
                        </div>
                    </div>
                    <div className="w-full px-2 w-full px-2 w-full md:w-1/2 px-2 w-full lg:w-1/2 px-2">
                        <div className="form-group mb-6 pt-4">
                            <label className="label py-2" for="email">Email</label>
                            <input type="text" className="form-control" name="email" value={credentails.email} onChange={onchange} placeholder="Email" required />
                        </div>
                    </div>
                    <div className="w-full px-2 w-full px-2 w-full md:w-1/2 px-2 w-full lg:w-1/2 px-2">
                        <div className="form-group mb-6 pt-4">
                            <label htmlFor="password" className="form-label">Password</label>
                            <input type="password" className="input-standard" name="password" value={credentails.password} onChange={onchange} placeholder="Password" id="exampleInputPassword1" required />
                        </div>
                    </div>
                    <div className="w-full px-2 w-full px-2 w-full md:w-1/2 px-2 w-full lg:w-1/2 px-2">
                        <div className="form-group mb-6 pt-4">
                            <label htmlFor="address" className="form-label">Address</label>
                            <textarea type="message" className="input-standard" name="address" value={credentails.address} onChange={onchange} placeholder="Address" id="exampleInputaddress" required />
                        </div>
                    </div>
                    <div className="w-full px-2 w-full px-2 w-full md:w-1/2 px-2 w-full lg:w-1/2 px-2">
                        <div className="form-group mb-6 pt-4">
                            <label htmlFor="gstNumber" className="form-label">Abn</label>
                            <input type="text" className="input-standard" name="gstNumber" value={credentails.gstNumber} onChange={onchange} placeholder="Abn" />                        
                        </div>
                    </div>
                </div>
                <div className="form-group mb-6 ">
                    {message == true ? 
                        <div className="alert alert-warning alert-dismissible fade show" role="alert">
                        <strong>{alertshow}</strong> 
                          <button type="button" className="btn-close" onClick={()=>{
                            setmessage(false);
                            setalertshow("");
                          }}></button>
                          {/* <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close"></button> */}

                        </div>
                        : 

                    ""}
                </div>
                <div className="form-group flex justify-center mt-6">
                    <button type="submit" className="form-control w-75 btn btnblur text-white mb-1">Sign Up</button>
                </div>
            </div>
        </form>
      </section>
    </div>
  )
}
