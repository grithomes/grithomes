import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import dollar from '../../img/dollar.svg'
import pin from '../../img/pin.svg'
import logout from '../../img/logout.svg'
import customers from '../../img/customers.svg'
import items from '../../img/items.svg'
import user from '../../img/user.svg'
import './Userstyle.css'

export default function Usernav() {
  const navigate = useNavigate();
  const [teammember, setTeammember] = useState("true");
  const location = useLocation();

  const [dropdownOpen, setDropdownOpen] = useState({
    documents: false,
    management: false,
  });

  const toggleDropdown = (menu) => {
    setDropdownOpen((prevState) => ({
      ...prevState,
      [menu]: !prevState[menu],
    }));
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userid');
    localStorage.removeItem('username');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('isTeamMember');
    localStorage.removeItem('startTime');
    localStorage.removeItem('currencyType');
    localStorage.removeItem('taxOptions');
    navigate('/');
  };

  useEffect(() => {
    const tam = localStorage.getItem('isTeamMember');
    if (tam !== undefined && tam !== null && tam !== "") {
      setTeammember(tam.toString());
    }
  }, []);

  return (
    <div>
      <nav className="navbar bg-body-tertiary d-block d-lg-none d-md-none">
        <div>
          <button className="navbar-toggler" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasNavbar" aria-controls="offcanvasNavbar" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon text-black"></span>
          </button>

          <div className="offcanvas offcanvas-start text-black" tabIndex="-1" id="offcanvasNavbar" aria-labelledby="offcanvasNavbarLabel">
            <div className="offcanvas-header">
              <h5 className="offcanvas-title" id="offcanvasNavbarLabel">IN<span className='clrblue'>VOICE</span></h5>
              <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
            </div>

            <div className="offcanvas-body nav">
              <ul>
                <li className='text-center'>
                  <Link to="/Userpanel/Userdashboard" className={`nav-link scrollto icones text-black ${location.pathname === '/Userpanel/Userdashboard' ? 'active' : ''}`}>
                    <i className="fas fa-tachometer-alt me-2"></i><span>Dashboard</span>
                  </Link>
                </li>

                <li><p className='greyclr nav-link'>Documents</p></li>

                <li>
                  <Link to="/userpanel/Invoice" className='nav-link scrollto icones text-black'>
                    <img src={dollar} className="me-2" width="24" height="24" alt="Invoice" /> <span>Invoice</span>
                  </Link>
                </li>
                <li>
                  <Link to="/userpanel/Estimate" className='nav-link scrollto icones text-black'>
                    <img src={pin} className="me-2" width="24" height="24" alt="Estimate" /> <span>Estimate</span>
                  </Link>
                </li>
                <li>
                  <Link to="/userpanel/E-sign" className='nav-link scrollto icones text-black'>
                    <img src={pin} className="me-2" width="24" height="24" alt="E-sign" /> <span>E-Sign</span>
                  </Link>
                </li>

                <li className="nav-item">
                  <div className="nav-link pointer text-black" onClick={() => toggleDropdown('documents')}>
                    <img src={dollar} className="me-2" width="24" height="24" alt="Expenses" /> <span>Expenses</span>
                  </div>
                  {dropdownOpen.documents && (
                    <ul className="dropdown-list">
                      <li>
                        <Link to="/userpanel/Expense" className='nav-link text-black'>
                          <img src={dollar} className="me-2" width="24" height="24" alt="Expense Entry" /> <span>Expense Entry</span>
                        </Link>
                      </li>
                      <li>
                        <Link to="/userpanel/Category" className='nav-link text-black'>
                          <img src={dollar} className="me-2" width="24" height="24" alt="Category" /> <span>Category</span>
                        </Link>
                      </li>
                      <li>
                        <Link to="/userpanel/Vendor" className='nav-link text-black'>
                          <img src={pin} className="me-2" width="24" height="24" alt="Vendor" /> <span>Vendor</span>
                        </Link>
                      </li>
                    </ul>
                  )}
                </li>

                <li><p className='greyclr nav-link'>Management</p></li>

                <li>
                  <Link to="/userpanel/Customerlist" className={`nav-link scrollto icones text-black ${
                    ['/userpanel/Customerlist', '/userpanel/Addcustomer', '/userpanel/Editcustomer'].includes(location.pathname) ? 'active' : ''
                  }`}>
                    <img src={customers} className="me-2" width="24" height="24" alt="Customer List" /> <span>Customer List</span>
                  </Link>
                </li>

                <li>
                  <Link to="/userpanel/Itemlist" className={`nav-link scrollto icones text-black ${
                    ['/userpanel/Itemlist', '/userpanel/Additem', '/userpanel/Edititem'].includes(location.pathname) ? 'active' : ''
                  }`}>
                    <img src={items} className="me-2" width="24" height="24" alt="Item List" /> <span>Item List</span>
                  </Link>
                </li>

                <li>
                  <Link to="/userpanel/Team" className={`nav-link scrollto icones text-black ${
                    ['/userpanel/Team', '/userpanel/Addteam', '/userpanel/Editteam', '/userpanel/Timeview', '/Timeschemahistory'].includes(location.pathname) ? 'active' : ''
                  }`}>
                    <img src={user} className="me-2" width="24" height="24" alt="Team" /> <span>Team</span>
                  </Link>
                </li>

                <li>
                  <Link to="/userpanel/Signature" className='nav-link scrollto icones text-black'>
                    <img src={pin} className="me-2" width="24" height="24" alt="Signature" /> <span>Signature</span>
                  </Link>
                </li>

                <li>
                  <Link to="/userpanel/Imageupload" className='nav-link scrollto icones text-black'>
                    <img src={customers} className="me-2" width="24" height="24" alt="Logo Upload" /> <span>Logo Upload</span>
                  </Link>
                </li>

                <li>
                  <Link to="/userpanel/Editprofile" className='nav-link scrollto icones text-black'>
                    <img src={customers} className="me-2" width="24" height="24" alt="Profile" /> <span>Profile</span>
                  </Link>
                </li>

                <li>
                  <Link to="/userpanel/Reports" className='nav-link scrollto icones text-black'>
                    <img src={customers} className="me-2" width="24" height="24" alt="Report" /> <span>Report</span>
                  </Link>
                </li>

                <li>
                  <a onClick={handleLogout} className="pointer nav-link scrollto icones text-black">
                    <img src={logout} className="me-2" width="24" height="24" alt="Logout" /> <span>Logout</span>
                  </a>
                </li>
              </ul>
            </div>

          </div>
        </div>
      </nav>
    </div>
  );
}
