import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import dollar from '../../img/dollar.svg';
import pin from '../../img/pin.svg';
import logout from '../../img/logout.svg';
import customers from '../../img/customers.svg';
import items from '../../img/items.svg';
import user from '../../img/user.svg';
import './Userstyle.css';

export default function Usernavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [teammember, setTeammember] = useState("true");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState({
    documents: false,
    management: false,
  });

  const toggleDropdown = (menu) => {
    console.log(`Toggling ${menu}. Current state:`, dropdownOpen); // Debug log
    setDropdownOpen((prevState) => {
      const newState = {
        ...prevState,
        [menu]: !prevState[menu],
      };
      console.log(`New state:`, newState); // Debug log
      return newState;
    });
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
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
    <div className="user-navbar">
      <div className="mobile-header d-lg-none p-3">
        <button className="hamburger-btn" onClick={toggleSidebar} aria-label="Toggle Sidebar">
          <i className={`fas ${isSidebarOpen ? 'fa-times' : 'fa-bars'}`}></i>
        </button>
        <h1 className="mobile-title fw-bold">
          IN<span className="clrblue">VOICE</span>
        </h1>
      </div>

      <div className={`sidebar bg-white b-shadow ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-content">
          <div className="text-center pt-4 pb-3 d-none d-lg-block">
            <h1 className="fw-bold">
              IN<span className="clrblue">VOICE</span>
            </h1>
          </div>

          <nav className="sb-sidenav">
            <ul className="nav-list">
              <li>
                <Link
                  to="/Userpanel/Userdashboard"
                  className={`nav-link ${location.pathname === '/Userpanel/Userdashboard' ? 'active' : ''}`}
                >
                  <i className="fas fa-tachometer-alt nav-icon"></i> Dashboard
                </Link>
              </li>

              <li className="nav-section">
                <span className="nav-section-title">Documents</span>
              </li>
              <li>
                <Link to="/userpanel/Invoice" className="nav-link">
                  <img src={dollar} alt="Invoice" className="nav-icon" /> Invoice
                </Link>
              </li>
              <li>
                <Link to="/userpanel/Estimate" className="nav-link">
                  <img src={pin} alt="Estimate" className="nav-icon" /> Estimate
                </Link>
              </li>
              <li>
                <Link to="/userpanel/E-sign" className="nav-link">
                  <img src={pin} alt="E-Sign" className="nav-icon" /> E-Sign
                </Link>
              </li>
              <li className="dropdown">
                <div
                  className="nav-link dropdown-toggle"
                  onClick={() => toggleDropdown('documents')}
                  style={{ cursor: 'pointer' }}
                >
                  <img src={dollar} alt="Expenses" className="nav-icon" /> Expenses
                </div>
                {dropdownOpen.documents && (
                  <ul className="dropdown-list">
                    <li>
                      <Link to="/userpanel/Expense" className="dropdown-item">
                        <img src={dollar} alt="Expense Entry" className="nav-icon" /> Expense Entry
                      </Link>
                    </li>
                    <li>
                      <Link to="/userpanel/Category" className="dropdown-item">
                        <img src={dollar} alt="Category" className="nav-icon" /> Category
                      </Link>
                    </li>
                    <li>
                      <Link to="/userpanel/Vendor" className="dropdown-item">
                        <img src={pin} alt="Vendor" className="nav-icon" /> Vendor
                      </Link>
                    </li>
                  </ul>
                )}
              </li>

              <li className="nav-section">
                <span className="nav-section-title">Management</span>
              </li>
              <li>
                <Link
                  to="/userpanel/Customerlist"
                  className={`nav-link ${
                    ['/userpanel/Customerlist', '/userpanel/Addcustomer', '/userpanel/Editcustomer'].includes(
                      location.pathname
                    )
                      ? 'active'
                      : ''
                  }`}
                >
                  <img src={customers} alt="Customer List" className="nav-icon" /> Customer List
                </Link>
              </li>
              <li>
                <Link
                  to="/userpanel/Itemlist"
                  className={`nav-link ${
                    ['/userpanel/Itemlist', '/userpanel/Additem', '/userpanel/Edititem'].includes(location.pathname)
                      ? 'active'
                      : ''
                  }`}
                >
                  <img src={items} alt="Item List" className="nav-icon" /> Item List
                </Link>
              </li>
              <li>
                <Link
                  to="/userpanel/Team"
                  className={`nav-link ${
                    [
                      '/userpanel/Team',
                      '/userpanel/Addteam',
                      '/userpanel/Editteam',
                      '/userpanel/Timeview',
                      '/Timeschemahistory',
                    ].includes(location.pathname)
                      ? 'active'
                      : ''
                  }`}
                >
                  <img src={user} alt="Team" className="nav-icon" /> Team
                </Link>
              </li>
              <li>
                <Link to="/userpanel/Signature" className="nav-link">
                  <img src={pin} alt="Signature" className="nav-icon" /> Signature
                </Link>
              </li>
              <li>
                <Link to="/userpanel/Imageupload" className="nav-link">
                  <img src={customers} alt="Logo Upload" className="nav-icon" /> Logo Upload
                </Link>
              </li>
              <li>
                <Link to="/userpanel/Editprofile" className="nav-link">
                  <img src={customers} alt="Profile" className="nav-icon" /> Profile
                </Link>
              </li>
              <li>
                <Link to="/userpanel/Reports" className="nav-link">
                  <img src={customers} alt="Report" className="nav-icon" /> Report
                </Link>
              </li>

              <li>
                <a onClick={handleLogout} className="nav-link pointer">
                  <img src={logout} alt="Logout" className="nav-icon" /> Logout
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>
  );
}