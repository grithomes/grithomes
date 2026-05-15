import React,{useState,useEffect} from 'react';
import {Link, useNavigate} from 'react-router-dom'
import { ColorRing } from  'react-loader-spinner'
// import jwt_decode from "jwt-decode";
import './Login.css'

export default function Login() {
  const [credentials, setCredentials] = useState({email:"", password:""})
  const [message, setmessage] = useState(false);
  const [loginbtnloader, setloginbtnloader] = useState(false);
  const [alertShow, setAlertShow] = useState("");

  let navigate = useNavigate();

  useEffect(()=> {
    if(!localStorage.getItem('authToken') || localStorage.getItem('authToken') == "" || localStorage.getItem('authToken') == "1"){
      
    }else{
      navigate("/userpanel/Userdashboard");
    }
  })
//   const handleSubmit = async(e) => {
//     e.preventDefault();
//     setloginbtnloader(true);
//     const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/login`,{
//         method:'POST',
//         headers: {
//             'Content-Type':'application/json'
//         },
//         body:JSON.stringify({email:credentials.email,password:credentials.password})
//     });

//     const json = await response.json();

//     console.log(json, 'sd');

//     if(!json.Success){
//         // alert('Enter vaild  Credentails');
//         setmessage(true);
//         setAlertShow(json.errors)
//         setloginbtnloader(false);

//     }
//     if(json.Success){
//       localStorage.setItem("authToken", json.authToken)
//       localStorage.setItem("userid", json.userid)
//       localStorage.setItem("username", json.username)
//       localStorage.setItem("userEmail", credentials.email)
//       localStorage.setItem("isTeamMember", json.isTeamMember)
//       localStorage.setItem("startTime", json.startTime)
//       console.log(localStorage.getItem("authToken"), "Data")
//         // navigate("/userpanel/Userdashboard");
//         if (json.isTeamMember == true) {
//           // Redirect to the team member dashboard
//           navigate('/Teammemberpanel/Teammenberdashboard');
//         } else if (json.isTeamMember == false){
//           // Redirect to the user dashboard
//           navigate('/userpanel/Userdashboard');
//         }
//     }
//     else{
//       alert("Login with correct details")
//     }
// }

const handleSubmit = async (e) => {
  e.preventDefault();
  setloginbtnloader(true);

  try {
    const sanitizedEmail = credentials.email.toLowerCase().replace(/\s+/g, '');
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email: sanitizedEmail, password: credentials.password })
    });

    const json = await response.json();

    if (!json.Success) {
      setmessage(true);
      setAlertShow("Login failed. Please try again.");
      // alert("Login failed. Please try again.");
      setloginbtnloader(false);
    } else {
      localStorage.setItem("authToken", json.authToken);
      localStorage.setItem("userid", json.userid);
      localStorage.setItem("username", json.username);
      localStorage.setItem("userEmail", credentials.email);
      localStorage.setItem("isTeamMember", json.isTeamMember);
      localStorage.setItem("startTime", json.startTime);
      localStorage.setItem("currencyType", json.CurrencyType);
      console.log("taxOptions", `[{"id":"${json.TaxName}!${json.taxPercentage}","name":"${json.TaxName}","percentage":${json.taxPercentage}}]`);
      localStorage.setItem("taxOptions", `[{"id":"${json.TaxName}!${json.taxPercentage}","name":"${json.TaxName}","percentage":${json.taxPercentage}}]`);
      // localStorage.setItem("taxOptions", `[{"id":"${json.TaxName}!${json.taxPercentage}","name":"${json.TaxName}","percentage":${json.taxPercentage}}]`);
console.log("json:>----", json);
      if (json.isTeamMember) {
        navigate('/Teammemberpanel/Teammenberdashboard');
      } else {
        navigate('/userpanel/Userdashboard');
      }
    }
  } catch (error) {
    console.error("Login error:", error);
    alert("Login with correct details")
    alert("Login failed. Please try again.");
    setloginbtnloader(false);
  }
};

const handleForgetPassword = () => {
  navigate('/ForgotPassword');
}

const onchange = (event) => {
  setCredentials({...credentials, [event.target.name]:event.target.value})
}

  return (
    <div className='min-h-screen flex flex-col justify-center items-center px-6 bg-background relative overflow-hidden'>
      {/* Decorative gradient blur */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-primary opacity-10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="text-center mb-6 z-10">
        <h1 className='font-bold text-4xl text-textMain tracking-tight mb-2'>
          IN<span className="text-primary text-5xl">VOICE</span>
        </h1>
        <p className="text-textMuted font-medium text-lg">Manage your premium invoices securely.</p>
      </div>

      <div className="card-standard p-8 z-10 w-full max-w-md">
        <form className="signin-form" onSubmit={handleSubmit}>
          <div className="mb-8">
            <h4 className="font-bold text-2xl text-textMain mb-1">Welcome Back</h4>
            <p className="text-textMuted text-sm">Please sign in to your dashboard</p>
          </div>

          <div className="form-group mb-5">
            <label className="block font-semibold mb-2 text-sm text-textMain" htmlFor="name">Email</label>
            <input type="email" className="input-standard" name="email" value={credentials.email} onChange={onchange} placeholder="Enter your email" required />
          </div>
          
          <div className="form-group mb-6">
            <label className="block font-semibold mb-2 text-sm text-textMain" htmlFor="password">Password</label>
            <input type="password" className="input-standard" name="password" value={credentials.password} onChange={onchange} placeholder="••••••••" required />
          </div>

          <div className="form-group mb-6">
            {loginbtnloader ? (
              <button disabled className="btn-primary w-full py-3 flex justify-center items-center opacity-70 cursor-not-allowed">
                <ColorRing loading={loginbtnloader} height={30} display="flex" aria-label="Loading" />
              </button>
            ) : (
              <button type="submit" className="btn-primary w-full py-3 text-base shadow-soft hover:shadow-lg transition-all">Sign In</button>
            )}
          </div>

          {alertShow && (
            <div className="bg-red-50 text-red-700 border border-red-200 px-6 py-3 rounded-std text-center text-sm font-medium mb-4">
               Login failed. Please verify your credentials.
            </div>
          )}

          <div className="flex justify-between items-center mt-6 pt-5 border-t border-borderLight text-sm font-semibold">
            <Link className="text-primary hover:text-blue-800 transition-colors" to="/signup">Create Account</Link>
            <span className="text-textMuted hover:text-textMain transition-colors cursor-pointer" onClick={handleForgetPassword}>Forgot Password?</span>
          </div>
        </form>
      </div>
    </div>
  )
}
