import React, { useState, useEffect } from 'react';
import Usernavbar from './Usernavbar';
import { useNavigate,useLocation } from 'react-router-dom';
import Usernav from './Usernav';
import { ColorRing } from  'react-loader-spinner'
import CurrencySign from '../../components/CurrencySign ';

export default function Estimate() {
    const [ loading, setloading ] = useState(true);
    const [estimates, setestimates] = useState([]);
    const [selectedestimates, setselectedestimates] = useState(null);
    const location = useLocation();
    const estimateid = location.state?.estimateid;
    const navigate = useNavigate();
    const [convertedEstimates, setConvertedEstimates] = useState([]);

    useEffect(() => {
        if(!localStorage.getItem("authToken") || localStorage.getItem("isTeamMember") == "true")
        {
          navigate("/");
        }
        fetchData();
    }, [])

    const fetchData = async () => {
        try {
            const userid = localStorage.getItem("userid");
            const response = await fetch(`https://mycabinet.onrender.com/api/estimatedata/${userid}`);
            const json = await response.json();

            if (Array.isArray(json)) {
                setestimates(json);
            }
            setloading(false);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const handleViewClick = (estimate) => {
        let estimateid = estimate._id;
        navigate('/userpanel/estimatedetail', { state: { estimateid } });
    };

    const formatCustomDate = (dateString) => {
        const options = { day: 'numeric', month: 'short', year: 'numeric' };
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', options);
      };

    const handleAddClick = () => {
        navigate('/userpanel/Createestimate');
    }

    const handleConvertToInvoice = async (estimateid) => {
      console.log(estimateid);
      try {
          const response = await fetch(`https://mycabinet.onrender.com/api/converttoinvoice/${estimateid}`, {
              method: 'POST',
          });
  
          if (response.ok) {
              const data = await response.json();
              console.log('Converted to Invoice:', data);
              fetchData(); // Update the estimate list after conversion
              setConvertedEstimates([...convertedEstimates, estimateid]);
          } else {
              const errorMessage = await response.json();
              if (errorMessage.message === 'Estimate already converted to invoice') {
                  console.log('Estimate already converted to invoice. Cannot convert again.');
              } else {
                  console.error('Error converting to invoice:', errorMessage.message);
                  // Handle error state or display an error message to the user
              }
          }
      } catch (error) {
          console.error('Error converting to invoice:', error);
          // Handle error state or display an error message to the user
      }
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
        <div className='row'>
          <div className='col-lg-2 col-md-3 vh-100 b-shadow bg-white d-lg-block d-md-block d-none'>
            <div>
              <Usernavbar />
            </div>
          </div>
  
          <div className='col-lg-10 col-md-9 col-12 mx-auto'>
            <div className='d-lg-none d-md-none d-block mt-2'>
              <Usernav />
            </div>
            <div className='bg-white my-5 p-4 box mx-4'>
              <div className='row py-2'>
                <div className='col-lg-4 col-md-6 col-sm-6 col-7 me-auto'>
                  <p className='h5 fw-bold'>Estimate</p>
                </div>
                <div className='col-lg-3 col-md-4 col-sm-4 col-5 text-lg-end text-md-end text-sm-end text-end'>
                  <button className='btn rounded-pill btnclr text-white fw-bold' onClick={handleAddClick}>
                    + Add New
                  </button>
                </div>
              </div>
              <hr />
  
              <div className='row px-2 table-responsive'>
                <table className='table table-bordered'>
                  <thead>
                    <tr>
                      <th scope='col'>Estimate </th>
                      <th scope='col'>STATUS </th>
                      <th scope='col'>DATE </th>
                      <th scope='col'>View </th>
                      <th scope='col'>CONVERT INTO INVOICE </th>
                      <th scope='col'>AMOUNT </th>
                    </tr>
                  </thead>
                  <tbody>
                    {estimates.map((estimate, index) => (
                      estimate.convertedToInvoice != true && (
                      <tr key={index}>
                        <td>
                          <p className='my-0 fw-bold clrtrxtstatus'>{estimate.customername}</p>
                          <p className='my-0'>{estimate.EstimateNumber}</p>
                          <p className='my-0'>{estimate.job}</p>
                        </td>
                        <td>
                          <span className='clrtrxtstatus'>
                            <i class="fa-solid fa-circle fs-12 mx-2 saved"></i> Saved
                          </span>
                        </td>
                        <td>
                          <div className=''>
                            <div className='d-flex'>
                              <p className='issue px-1 my-1'>Issued</p>
                              <p className='datetext my-1'>{formatCustomDate(estimate.date)}</p>
                            </div>
                          </div>
                        </td>
                        <td className='text-center'>
                          <a role='button' className='text-black text-center' onClick={() => handleViewClick(estimate)}>
                            <i className='fa-solid fa-eye'></i>
                          </a>
                        </td>
                        <td className='text-center'>
                          <a role='button' className='btn text-black text-center converbtn' onClick={() => handleConvertToInvoice(estimate._id)} >Convert</a>
                        </td>
                        <td><CurrencySign />{estimate.total}</td>
                      </tr>
                        )
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
}
    </div>
  )
}
