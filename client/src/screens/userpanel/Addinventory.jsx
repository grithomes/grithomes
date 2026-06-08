import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import { useNavigate } from 'react-router-dom';
import { ColorRing } from 'react-loader-spinner';
import Alertauthtoken from '../../components/Alertauthtoken';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

export default function Addinventory() {
  const [loading, setloading] = useState(true);
  const navigate = useNavigate();
  const [alertMessage, setAlertMessage] = useState('');
  const [credentials, setCredentials] = useState({
    materialName: '',
    price: '',
    unit: '',
    quantity: ''
  });

  const [message, setMessage] = useState(false);
  const [alertShow, setAlertShow] = useState('');
  const [editorData, setEditorData] = useState("<p></p>");

  useEffect(() => {
    if (!localStorage.getItem("authToken") || localStorage.getItem("isTeamMember") == "true") {
      navigate("/");
    }
    setloading(false);
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault();
    setloading(true);
    let userid = localStorage.getItem('userid');
    const authToken = localStorage.getItem('authToken');
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/addinventory`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authToken,
        },
        body: JSON.stringify({
          userid: userid,
          materialName: credentials.materialName,
          description: editorData,
          price: credentials.price,
          unit: credentials.unit,
          quantity: credentials.quantity
        }),
      });

      if (response.status === 401) {
        const json = await response.json();
        setAlertMessage(json.message);
        setloading(false);
        window.scrollTo(0, 0);
        return;
      }
      else {
        const json = await response.json();
        if (json.success) {
          setMessage(true);
          setAlertShow(json.message);
          setloading(false);
          navigate('/userpanel/InventoryList');
        } else {
            setAlertMessage(json.message || "Failed to add inventory.");
            setloading(false);
        }
      }
    } catch (error) {
      console.error(error);
      setAlertMessage("Server error.");
      setloading(false);
    }
  };

  const handleEditorChange = (event, editor) => {
    const data = editor.getData();
    setEditorData(data);
  };

  const onchange = (event) => {
    setCredentials({ ...credentials, [event.target.name]: event.target.value });
  };

  return (
    <div className="bg">
      {
        loading ?
          <div className="flex flex-col md:flex-row">
            <ColorRing
              loading={loading}
              display="flex"
              justify-content="center"
              align-items="center"
              aria-label="Loading Spinner"
              data-testid="loader"
            />
          </div> :
          <div className="w-full ">
            <div className="flex flex-col md:flex-row">
              <Sidebar />
              <div className="flex-1 w-full mx-auto px-4">

                <div className='mt-6 mx-4'>
                  {alertMessage && <Alertauthtoken message={alertMessage} onClose={() => setAlertMessage('')} />}
                </div>
                <div className="bg-white my-5 p-6 card-standard mx-4">
                  <div className="flex flex-col md:flex-row">
                    <p className="h5 font-semibold">Inventory</p>
                    <nav aria-label="breadcrumb">
                      <ol className="breadcrumb mb-0">
                        <li className="breadcrumb-item">
                          <a href="/userpanel/Userdashboard" className="txtclr text-decoration-none">
                            Dashboard
                          </a>
                        </li>
                        <li className="breadcrumb-item">
                          <a href="/userpanel/InventoryList" className="txtclr text-decoration-none">
                            Inventory
                          </a>
                        </li>
                        <li className="breadcrumb-item active" aria-current="page">
                          Add Material
                        </li>
                      </ol>
                    </nav>
                  </div>
                  <hr />
                  <div className="flex flex-col md:flex-row">
                    <div className="w-full">
                      <div className="p-6">
                        <div className="flex flex-wrap">
                          <div className="w-full lg:w-1/2 px-2 mb-6">
                            <label htmlFor="materialName" className="form-label">
                              Material Name
                            </label>
                            <input
                              type="text"
                              name="materialName"
                              className="input-standard"
                              onChange={onchange}
                              placeholder="e.g. Cement, Bricks"
                              required
                            />
                          </div>

                          <div className="w-full lg:w-1/2 px-2 mb-6">
                            <label htmlFor="quantity" className="form-label">
                              Initial Quantity
                            </label>
                            <input
                              type="number"
                              name="quantity"
                              className="input-standard"
                              onChange={onchange}
                              placeholder="Quantity"
                              required
                            />
                          </div>

                          <div className="w-full lg:w-1/2 px-2 mb-6">
                            <label htmlFor="price" className="form-label">
                              Price (per unit)
                            </label>
                            <input
                              type="number"
                              name="price"
                              className="input-standard"
                              onChange={onchange}
                              placeholder="Price"
                              required
                            />
                          </div>
                          
                          <div className="w-full lg:w-1/2 px-2 mb-6">
                            <label htmlFor="unit" className="form-label">
                              Unit
                            </label>
                            <input
                              type="text"
                              name="unit"
                              className="input-standard"
                              onChange={onchange}
                              placeholder="e.g. bags, kg, pieces"
                            />
                          </div>

                          <div className="w-full px-2 mb-6">
                            <label htmlFor="description" className="form-label">
                              Description
                            </label>
                            <div className='card-standard rounded adminborder m-2'>
                              <CKEditor
                                editor={ClassicEditor}
                                data={editorData}
                                onChange={handleEditorChange}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap -mx-2 pt-4 pe-2">
                    <div className="col-3 me-auto"></div>
                    <div className="col-4 col-sm-2 text-right">
                      <button onClick={(e) => handleSubmit(e)} className="btn btnclr text-white">Add Material</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
      }
    </div>
  );
}
