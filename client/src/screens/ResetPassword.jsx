import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function ResetPassword() {
  const { token } = useParams(); // Retrieve token from URL params
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  let navigate = useNavigate();

  useEffect(() => {
    // Here you can perform additional validation or checks using the 'token' if needed
    // For example, you might want to check if the token is valid or has expired
  }, [token]);

  const handleResetPassword = async () => {
    if (newPassword !== confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ resetPasswordToken: token, newPassword })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        navigate('/');
      } else {
        setMessage('Failed to reset password');
      }
    } catch (error) {
      setMessage('Failed to reset password');
    }
  };

  return (
    <div className='py-6'>
        <h1 className='text-center my-5 font-semibold'>IN<span className='clrblue'>VOICE</span></h1>
        <section className='flex justify-center items-center'>
            <div className='signin-form loginbox p-8 pb-4 mt-6'>
                <p className='text-xl font-semibold font-semibold'>Reset Password</p>

                <div className="form-group mb-6 pt-4">
                    <label className="label mb-1" for="password">New Password</label>
                    <input type="password" className="form-control" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="New Password" />
                </div>
                <div className="form-group mb-6">
                    <label className="label mb-1" for="password">Confirm Password</label>
                    <input type="password" className="form-control" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm Password" />
                </div>
                <div className="d-flex justify-center">
                    <button className="form-control w-75 btn btnblur text-white mb-1" onClick={handleResetPassword}>Reset Password</button>
                </div>
                {message && <p className='text-danger text-center font-semibold'>{message}</p>}
            </div>
        </section>
    </div>
  );
}
