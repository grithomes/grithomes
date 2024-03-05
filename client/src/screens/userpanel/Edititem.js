import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Usernavbar from './Usernavbar';
import Usernav from './Usernav';
import { ColorRing } from  'react-loader-spinner'

export default function Edititem() {
    const [ loading, setloading ] = useState(true);
    const location = useLocation();
    const navigate = useNavigate();
    
    const itemId = location.state.itemId;

    const [item, setitem] = useState({
        itemname: '',
        description: '',
        price: '',
    });

    useEffect(() => {
        if(!localStorage.getItem("authToken") || localStorage.getItem("isTeamMember") == "true")
        {
          navigate("/");
        }
        fetchitemData();
    }, [])

    const fetchitemData = async () => {
        try {
            const response = await fetch(`https://mycabinet.onrender.com/api/getitems/${itemId}`);
            const json = await response.json();
            
            if (json.Success) {
                setitem(json.item);
            } else {
                console.error('Error fetching itemdata:', json.message);
            }
            console.log(item);
            setloading(false);
        } catch (error) {
            console.error('Error fetching itemdata:', error);
        }
    };

    const handleSaveClick = async () => {
        try {
            const updateditemdata = {
                ...item
            };
            const response = await fetch(`https://mycabinet.onrender.com/api/updateitemdata/${itemId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updateditemdata)
            });

            const json = await response.json();

            if (json.Success) {
                navigate('/userpanel/itemlist');
                console.log(updateditemdata);
            } else {
                console.error('Error updating itemdata:', json.message);
            }
        } catch (error) {
            console.error('Error updating itemdata:', error);
        }
    };

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setitem({ ...item, [name]: value });
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
                    <div className='col-lg-2 col-md-3 vh-lg-100 vh-md-100 b-shadow bg-white d-lg-block d-md-block d-none'>
                        <div  >
                            <Usernavbar/>
                        </div>
                    </div>

                    <div className="col-lg-10 col-md-9 col-12 mx-auto">
                        <div className='d-lg-none d-md-none d-block mt-2'>
                            <Usernav/>
                        </div>
                        <form>
                            <div className="bg-white my-5 p-4 box mx-4">
                                <div className='row'>
                                    <p className='h5 fw-bold'>Edit Item</p>
                                    <nav aria-label="breadcrumb">
                                        <ol className="breadcrumb mb-0">
                                            <li className="breadcrumb-item">
                                                <a href="/userpanel/Userdashboard" className='txtclr text-decoration-none'>Dashboard</a>
                                            </li>
                                            <li className="breadcrumb-item">
                                                <a href="/userpanel/itemlist" className='txtclr text-decoration-none'>item</a>
                                            </li>
                                            <li className="breadcrumb-item active" aria-current="page">Edit item</li>
                                        </ol>
                                    </nav>
                                </div><hr />

                                <div className="row">
                                    <div className="col-12 col-sm-6 col-lg-6">
                                        <div className="mb-3">
                                            <label htmlFor="itemname" className="form-label">
                                            Item Name
                                            </label>
                                            <input
                                            type="text"
                                            className="form-control"
                                            name="itemname"
                                            value={item.itemname}
                                            onChange={handleInputChange}
                                            placeholder="Item Name"
                                            id="itemname"
                                            required
                                            />
                                        </div>
                                    </div>

                                    <div className="col-12 col-sm-6 col-lg-6">
                                        <div className="mb-3">
                                            <label htmlFor="Number" className="form-label">
                                            Price
                                            </label>
                                            <input
                                            type="number"
                                            name="price"
                                            value={item.price}
                                            className="form-control"
                                            onChange={handleInputChange}
                                            placeholder="Price"
                                            id="price"
                                            required
                                            />
                                        </div>
                                    </div>

                                    <div className="col-12 col-sm-12 col-lg-12">
                                        <div className="mb-3">
                                            <label htmlFor="description" className="form-label">
                                            Description
                                            </label>
                                            <textarea
                                            type="text"
                                            className="form-control"
                                            value={item.description}
                                            name="description"
                                            onChange={handleInputChange}
                                            placeholder="Description"
                                            id="description"
                                            required
                                            />
                                        </div>
                                    </div>
                                </div>
                                <button type="button" className='btn btnclr text-white me-2' onClick={handleSaveClick}>Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
}
        </div>
    );
}
