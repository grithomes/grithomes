import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import { useNavigate } from 'react-router-dom';

import { ColorRing } from 'react-loader-spinner';
import Alertauthtoken from '../../components/Alertauthtoken';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
// import Sidebar from './Sidebar';

export default function Additem() {
  const [loading, setloading] = useState(true);
  const navigate = useNavigate();
  const [alertMessage, setAlertMessage] = useState('');
  const [credentials, setCredentials] = useState({
    itemname: '',
    description: '',
    price: '',
    unit: '',
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
    let userid = localStorage.getItem('userid');
    const authToken = localStorage.getItem('authToken');
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/additem`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authToken,
      },
      body: JSON.stringify({
        userid: userid,
        itemname: credentials.itemname,
        description: editorData,
        price: credentials.price,
        unit: credentials.unit,
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
      console.log(json, "Items Added");

      if (json.Success) {
        setCredentials({
          itemname: '',
          description: '',
          price: '',
          unit: '',
        });

        setMessage(true);
        setAlertShow(json.message);
        setloading(false);
        navigate('/userpanel/Itemlist');
      }
      else {
        console.log("else part")
      }
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
          <div className="w-full ">
            <div className="flex flex-col md:flex-row">
                            <Sidebar />
                            <div className="flex-1 w-full mx-auto px-4">

                <div className='mt-6 mx-4'>
                  {alertMessage && <Alertauthtoken message={alertMessage} onClose={() => setAlertMessage('')} />}
                </div>
                <div className="bg-white my-5 p-6 card-standard mx-4">
                  <div className="flex flex-col md:flex-row">
                    <p className="h5 font-semibold">Item</p>
                    <nav aria-label="breadcrumb">
                      <ol className="breadcrumb mb-0">
                        <li className="breadcrumb-item">
                          <a href="/userpanel/Userdashboard" className="txtclr text-decoration-none">
                            Dashboard
                          </a>
                        </li>
                        <li className="breadcrumb-item active" aria-current="page">
                          Add a new Item
                        </li>
                      </ol>
                    </nav>
                  </div>
                  <hr />
                  <div className="flex flex-col md:flex-row">
                    <div className="">
                      {/* <div className="col-11 m-auto card-standard shadow"> */}
                      <div className="p-6">
                        {/* <p className="h5">Customer details</p> */}
                        {/* <hr /> */}
                        <div className="flex flex-col md:flex-row">
                          <div className="w-full px-2 col-sm-6 w-full lg:w-1/2 px-2">
                            <div className="mb-6">
                              <label htmlFor="itemname" className="form-label">
                                Item Name
                              </label>
                              <input
                                type="text"
                                name="itemname"
                                className="input-standard"
                                onChange={onchange}
                                placeholder="Item Name"
                                id="itemname"
                                required
                              />
                            </div>
                          </div>

                          <div className="w-full px-2 col-sm-6 w-full lg:w-1/2 px-2">
                            <div className="mb-6">
                              <label htmlFor="Number" className="form-label">
                                Price
                              </label>
                              <input
                                type="number"
                                name="price"
                                className="input-standard"
                                onChange={onchange}
                                placeholder="Price"
                                id="price"
                                required
                              />
                            </div>
                          </div>
                          <div className="w-full px-2 col-sm-6 w-full lg:w-1/2 px-2">
                            <div className="mb-6">
                              <label htmlFor="Number" className="form-label">
                                Unit
                              </label>
                              <input
                                type="text"
                                name="unit"
                                className="input-standard"
                                onChange={onchange}
                                placeholder="unit"
                                id="unit"

                              />
                            </div>
                          </div>

                          <div className="w-full px-2 w-full px-2 w-full lg:w-1/2 px-2">
                            <div className="mb-6">
                              <label htmlFor="description" className="form-label">
                                Description
                              </label>
                              <div className='card-standard rounded adminborder m-2'>
                                <CKEditor
                                  editor={ClassicEditor}
                                  data={editorData}
                                  // onReady={ editor => {
                                  //     console.log( 'Editor is ready to use!', editor );
                                  // } }

                                  onChange={handleEditorChange}
                                  onBlur={(event, editor) => {
                                    console.log('Blur.', editor);
                                  }}
                                  onFocus={(event, editor) => {
                                    console.log('Focus.', editor);
                                  }}
                                />
                              </div>
                              {/* <textarea
                              type="text"
                              className="input-standard"
                              name="description"
                              onChange={onchange}
                              placeholder="Description"
                              id="description"
                              required
                            /> */}
                            </div>
                          </div>
                          {/* <label htmlFor="" className='text-2xl ml-2 mt-8'>Note</label> */}
                          {/* <div className='card-standard rounded adminborder m-2'>
                            <CKEditor
                                editor={ClassicEditor}
                                data={editorData}
                                                    // onReady={ editor => {
                                                    //     console.log( 'Editor is ready to use!', editor );
                                                    // } }

                                onChange={handleEditorChange}
                                onBlur={(event, editor) => {
                                    console.log('Blur.', editor);
                                }}
                                onFocus={(event, editor) => {
                                    console.log('Focus.', editor);
                                }}
                            />
                          </div> */}


                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap -mx-2 pt-4 pe-2">
                    <div className="col-3 me-auto"></div>
                    <div className="col-4 col-sm-2">
                      <button onClick={(e) => handleSubmit(e)} className="btn btnclr text-white">Add Item</button>
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
