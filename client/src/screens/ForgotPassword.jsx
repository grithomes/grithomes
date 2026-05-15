import React, { useState } from 'react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleResetPassword = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email }) // Ensure 'email' is the correct variable containing the email address
      });
  
      const data = await response.json();
  
      if (response.ok) {
        setMessage(data.message);
      } else {
        setMessage('Your email was not found in our records');
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
                <p className='text-xl font-semibold font-semibold'>Forgot Password</p>

                <div className="form-group mb-6 pt-4">
                    <label className="label mb-1" for="email">Enter Email</label>
                    <input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter Email" />
                </div>

                <div className=" flex justify-center">
                    <button className="form-control w-75 btn btnblur text-white mb-1" onClick={handleResetPassword}>Reset Password</button>
                </div>
                {message && <p className='text-danger text-center font-semibold'>{message}</p>}
            </div>
        </section>
      {/* <h2>Forgot Password</h2>
      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter email" />
      <button onClick={handleResetPassword}>Reset Password</button>
      {message && <p>{message}</p>} */}
    </div>
  );
}
