import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { ColorRing } from 'react-loader-spinner'

import Alertauthtoken from '../../components/Alertauthtoken';

export default function Addteam() {
  const navigate = useNavigate();
  const [message, setMessage] = useState(false);
  const [alertShow, setAlertShow] = useState('');
  const [loading, setloading] = useState(true);
  const [alertMessage, setAlertMessage] = useState('');
  const [credentials, setCredentials] = useState({
    name: '',
    email: '',
    number: '',
    password: '',
  });

  useEffect(() => {
    if (!localStorage.getItem("authToken") || localStorage.getItem("isTeamMember") == "true") {
      navigate("/");
    }
    setloading(true)
    setTimeout(() => {
      setloading(false)

    }, 1000)
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault();
    let userid = localStorage.getItem('userid');
    const authToken = localStorage.getItem('authToken');
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/addteammember`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authToken,
      },
      body: JSON.stringify({
        userid: userid,
        name: credentials.name,
        email: credentials.email,
        number: credentials.number,
        password: credentials.password,
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
          password: '',
        });

        setMessage(true);
        setAlertShow(json.message);
        navigate('/userpanel/Team');

      }

      else {
        alert("This Email already exist")
        setMessage(true)
        setAlertShow(json.message)
      }
    }


  };

  const onchange = (event) => {
    setCredentials({ ...credentials, [event.target.name]: event.target.value });
  };

  return (
    <div className="bg">
      <div className="w-full ">
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
            <div className="flex flex-col md:flex-row">
                            <Sidebar />
                            <div className="flex-1 w-full mx-auto px-4">

                <div className='mt-6 mx-4'>
                  {alertMessage && <Alertauthtoken message={alertMessage} onClose={() => setAlertMessage('')} />}
                  <div className="w-full px-2">
                    {message == true ?
                      <div className="alert alert-warning alert-dismissible fade show" role="alert">
                        <strong>{alertShow}</strong>
                        <button type="button" className="btn-close" onClick={() => {
                          setMessage(false);
                          setAlertShow("");
                        }}></button>
                        {/* <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close"></button> */}

                      </div>
                      :

                      ""}
                  </div>
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="bg-white my-5 p-6 card-standard mx-4">
                    <div className="flex flex-col md:flex-row">
                      <p className="h5 font-semibold">Team</p>
                      <nav aria-label="breadcrumb">
                        <ol className="breadcrumb mb-0">
                          <li className="breadcrumb-item">
                            <a href="/Userpanel/Userdashboard" className="txtclr text-decoration-none">
                              Dashboard
                            </a>
                          </li>
                          <li className="breadcrumb-item active" aria-current="page">
                            Add a new Team Member
                          </li>
                        </ol>
                      </nav>
                    </div>
                    <hr />
                    <div className="flex flex-col md:flex-row">
                      <div className="col-11 m-auto card-standard shadow">
                        <div className="p-6">
                          <p className="h5">Team Member details</p>
                          <hr />
                          <div className="flex flex-col md:flex-row">
                            <div className="w-full px-2 col-sm-6 w-full lg:w-1/2 px-2">
                              <div className="mb-6">
                                <label htmlFor="exampleInputtext1" className="form-label">
                                  Member Name
                                </label>
                                <input
                                  type="text"
                                  className="input-standard"
                                  name="name"
                                  value={credentials.name}
                                  onChange={onchange}
                                  placeholder="Member Name"
                                  id="exampleInputtext1"
                                  required
                                />
                              </div>
                            </div>

                            <div className="w-full px-2 col-sm-6 w-full lg:w-1/2 px-2">
                              <div className="mb-6">
                                <label htmlFor="exampleInputEmail1" className="form-label">
                                  Contact Email
                                </label>
                                <input
                                  type="email"
                                  className="input-standard"
                                  name="email"
                                  value={credentials.email}
                                  onChange={onchange}
                                  placeholder="Contact Email"
                                  id="exampleInputEmail1"
                                  aria-describedby="emailHelp"
                                />
                              </div>
                            </div>

                            <div className="w-full px-2 col-sm-6 w-full lg:w-1/2 px-2">
                              <div className="mb-6">
                                <label htmlFor="Number" className="form-label">
                                  Phone Number
                                </label>
                                <input
                                  type="number"
                                  name="number"
                                  className="input-standard"
                                  onChange={onchange}
                                  placeholder="Phone Number"
                                  id="phonenumber"
                                  required
                                />
                              </div>
                            </div>
                            <div className="w-full px-2 col-sm-6 w-full lg:w-1/2 px-2">
                              <div className="mb-6">
                                <label htmlFor="password" className="form-label">
                                  Password
                                </label>
                                <input
                                  type="password"
                                  name="password"
                                  className="input-standard"
                                  onChange={onchange}
                                  placeholder="Password"
                                  id="password"
                                  required
                                />
                              </div>
                            </div>
                            {/* <div className="w-full px-2">
                          {message == true ? 
                            <div className="alert alert-warning alert-dismissible fade show" role="alert">
                            <strong>{alertShow}</strong> 
                              <button type="button" className="btn-close" onClick={()=>{
                                setMessage(false);
                                setAlertShow("");
                              }}></button>
                            </div>
                            : 
                          ""}
                        </div> */}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap -mx-2 pt-4 pe-2">
                      <div className="col-3 me-auto"></div>
                      <div className="col-4 col-sm-2">
                        <button className="btn btnclr text-white">Next</button>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>
        }
      </div>
    </div>
  );
}
