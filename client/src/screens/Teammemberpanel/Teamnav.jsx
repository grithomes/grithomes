import React, { useEffect,useState } from 'react'
import {Link, useNavigate, useLocation} from 'react-router-dom'
import './Teamstyle.css'

    const Teamnav = () => {
  let navigate = useNavigate();
  const [ teammember, setTeammember ] = useState("true");
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userid');
    localStorage.removeItem('username');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('isTeamMember');
    localStorage.removeItem('startTime');
    navigate('/');
  };
  useEffect(()=>{
    const tam = localStorage.getItem('isTeamMember');
    if(tam != undefined && tam != null && tam != "")
    {
      setTeammember(tam.toString());
    }
  })

  return (
    <div>
      <nav className="navbar bg-body-tertiary block md:hidden">
  <div className="">
    <button className="navbar-toggler" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasNavbar" aria-controls="offcanvasNavbar" aria-label="Toggle navigation">
      <span className="navbar-toggler-icon text-black"></span>
    </button>
    <div className="offcanvas offcanvas-start text-black" tabindex="-1" id="offcanvasNavbar" aria-labelledby="offcanvasNavbarLabel">
      <div className="offcanvas-header">
        <h5 className="offcanvas-title" id="offcanvasNavbarLabel">IN<span className='clrblue'>VOICE</span></h5>
        <button type="button" className="btn-close " data-bs-dismiss="offcanvas" aria-label="Close"></button>
      </div>
      <div className="offcanvas-body nav">
      <ul>
                    <li>
                      <Link to="/Teammemberpanel/Teammenberdashboard" className={`nav-link scrollto icones text-black ${location.pathname == '/Teammemberpanel/Teammenberdashboard' ? 'active' : ''}`}>
                        <i className="fa-solid fa-house mr-2 dashclr"></i> <span>Dashboard</span>
                      </Link>
                    </li>
                    <li>
                        <a onClick={handleLogout} className=" pointer nav-link scrollto icones text-black">
                          <i className="fa-solid fa-right-from-bracket mr-2"></i>
                          <span>Logout</span>
                        </a>
                      </li>
                  </ul>
      </div>
    </div>
  </div>
</nav>
    </div>
  )
}

export default Teamnav
