import React from 'react';
import { useNavigate } from 'react-router-dom';

const Alertauthtoken = ({ message }) => {
    const navigate = useNavigate();

    const handleLoginAgain = () => {
        navigate('/');
    }
  return (
    <div className="alert alert-warning fade show" role="alert">
        <div className="flex flex-wrap -mx-2">
            <div className='col-7 flex items-center'>
                {message}
            </div>
            <div className="col-5 flex justify-end">
                <button type="button" className="btn font-semibold rounded-pill btn-danger" onClick={handleLoginAgain}>Login Again</button>
            </div>
        </div>
    </div>
  );
};

export default Alertauthtoken;
