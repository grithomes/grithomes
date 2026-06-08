import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import dollar from '../../img/dollar.svg';
import pin from '../../img/pin.svg';
import logout from '../../img/logout.svg';
import customers from '../../img/customers.svg';
import items from '../../img/items.svg';
import user from '../../img/user.svg';

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [teammember, setTeammember] = useState("true");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  useEffect(() => {
    const tam = localStorage.getItem('isTeamMember');
    if (tam !== undefined && tam !== null && tam !== "") {
      setTeammember(tam.toString());
    }
  }, []);

  return (
    <>
      {/* Mobile Top Navigation Bar */}
      <div className="md:hidden flex items-center justify-between bg-white px-6 py-4 shadow-sm w-full top-0 z-40 sticky border-b border-gray-100">
        <button
          onClick={toggleSidebar}
          className="text-gray-600 hover:text-primary transition-colors focus:outline-none"
          aria-label="Toggle Sidebar"
        >
          <i className={`fas ${isSidebarOpen ? 'fa-times' : 'fa-bars'} text-xl`}></i>
        </button>
        <h1 className="font-bold text-xl text-textMain tracking-tight">
          IN<span className="text-primary">VOICE</span>
        </h1>
        <div className="w-6"></div> {/* Spacer for centering */}
      </div>

      {/* Overlay Background for Mobile */}
      {isSidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Main Sidebar (Desktop persistent, Mobile offcanvas) */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-sidebar border-r border-borderLight shadow-sm transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition-transform duration-300 ease-in-out h-screen overflow-y-auto flex flex-col`}>

        <div className="hidden md:flex items-center justify-center py-6 border-b border-borderLight">
          <h1 className="font-bold text-3xl text-textMain tracking-tight">
            IN<span className="text-primary">VOICE</span>
          </h1>
        </div>

        <nav className="flex-1 py-4 px-3 overflow-y-auto custom-scrollbar">
          <ul className="space-y-1">
            <li>
              <Link
                to="/Userpanel/Userdashboard"
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center text-textMuted px-4 py-3 rounded-std text-sm font-medium transition-colors ${location.pathname === '/Userpanel/Userdashboard'
                  ? 'bg-primary text-white shadow-soft'
                  : 'text-textMain hover:bg-gray-100'
                  }`}
              >
                <i className={`fas fa-tachometer-alt w-5 mr-3 ${location.pathname === '/Userpanel/Userdashboard' ? 'text-blue-200' : 'text-gray-400'}`}></i>
                Dashboard
              </Link>
            </li>

            <li className="pt-4 pb-2 px-4">
              <span className="text-xs  font-semibold text-gray-400 uppercase tracking-wider">Documents</span>
            </li>

            <li>
              <Link to="/userpanel/Invoice" onClick={() => setIsSidebarOpen(false)} className="flex items-center text-textMuted px-4 py-2.5 rounded-std text-sm font-medium text-textMain hover:bg-gray-100 transition-colors">
                <img src={dollar} alt="Invoice" className="w-5 h-5 mr-3 opacity-70" /> Invoice
              </Link>
            </li>
            <li>
              <Link to="/userpanel/Estimate" onClick={() => setIsSidebarOpen(false)} className="flex items-center text-textMuted px-4 py-2.5 rounded-std text-sm font-medium text-textMain hover:bg-gray-100 transition-colors">
                <img src={pin} alt="Estimate" className="w-5 h-5 mr-3 opacity-70" /> Estimate
              </Link>
            </li>
            <li>
              <Link to="/userpanel/E-sign" onClick={() => setIsSidebarOpen(false)} className="flex items-center px-4 text-textMuted py-2.5 rounded-std text-sm font-medium text-textMain hover:bg-gray-100 transition-colors">
                <img src={pin} alt="E-Sign" className="w-5 h-5 mr-3 opacity-70" /> E-Sign
              </Link>
            </li>

            <li className="pt-1">
              <button
                onClick={() => toggleDropdown('documents')}
                className="w-full flex items-center text-textMuted justify-between px-4 py-2.5 rounded-std text-sm font-medium text-textMain hover:bg-gray-100 transition-colors focus:outline-none"
              >
                <div className="flex items-center">
                  <img src={dollar} alt="Expenses" className="w-5 h-5  mr-3 opacity-70" /> Expenses
                </div>
                <i className={`fas fa-chevron-${dropdownOpen.documents ? 'up' : 'down'} text-xs text-gray-400 transition-transform`}></i>
              </button>

              <ul className={`mt-1 space-y-1 overflow-hidden transition-all duration-200 ${dropdownOpen.documents ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                <li>
                  <Link to="/userpanel/Expense" onClick={() => setIsSidebarOpen(false)} className="flex text-textMuted items-center pl-12 pr-4 py-2 rounded-std text-sm font-medium text-textMuted hover:text-primary hover:bg-blue-50 transition-colors">
                    Expense Entry
                  </Link>
                </li>
                <li>
                  <Link to="/userpanel/Category" onClick={() => setIsSidebarOpen(false)} className="flex text-textMuted items-center pl-12 pr-4 py-2 rounded-std text-sm font-medium text-textMuted hover:text-primary hover:bg-blue-50 transition-colors">
                    Category
                  </Link>
                </li>
                <li>
                  <Link to="/userpanel/Vendor" onClick={() => setIsSidebarOpen(false)} className="flex text-textMuted items-center pl-12 pr-4 py-2 rounded-std text-sm font-medium text-textMuted hover:text-primary hover:bg-blue-50 transition-colors">
                    Vendor
                  </Link>
                </li>
              </ul>
            </li>

            <li className="pt-4 pb-2 px-4">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Management</span>
            </li>

            <li>
              <Link
                to="/userpanel/Customerlist"
                onClick={() => setIsSidebarOpen(false)}
                className={`flex text-textMuted items-center px-4 py-2.5 rounded-std text-sm font-medium transition-colors ${['/userpanel/Customerlist', '/userpanel/Addcustomer', '/userpanel/Editcustomer'].includes(location.pathname) ? 'bg-primary text-white shadow-soft' : 'text-textMain hover:bg-gray-100'}`}
              >
                <img src={customers} alt="Customer List" className={`w-5 h-5 mr-3 ${['/userpanel/Customerlist', '/userpanel/Addcustomer', '/userpanel/Editcustomer'].includes(location.pathname) ? 'brightness-200' : 'opacity-70'}`} /> Customer List
              </Link>
            </li>
            <li>
              <Link
                to="/userpanel/Itemlist"
                onClick={() => setIsSidebarOpen(false)}
                className={`flex text-textMuted items-center px-4 py-2.5 rounded-std text-sm font-medium transition-colors ${['/userpanel/Itemlist', '/userpanel/Additem', '/userpanel/Edititem'].includes(location.pathname) ? 'bg-primary text-white shadow-soft' : 'text-textMain hover:bg-gray-100'}`}
              >
                <img src={items} alt="Item List" className={`w-5 h-5 mr-3 ${['/userpanel/Itemlist', '/userpanel/Additem', '/userpanel/Edititem'].includes(location.pathname) ? 'brightness-200' : 'opacity-70'}`} /> Item List
              </Link>
            </li>
            <li>
              <Link
                to="/userpanel/InventoryList"
                onClick={() => setIsSidebarOpen(false)}
                className={`flex text-textMuted items-center px-4 py-2.5 rounded-std text-sm font-medium transition-colors ${['/userpanel/InventoryList', '/userpanel/Addinventory', '/userpanel/Editinventory'].includes(location.pathname) ? 'bg-primary text-white shadow-soft' : 'text-textMain hover:bg-gray-100'}`}
              >
                <i className={`fas fa-boxes-stacked w-5 mr-3 ${['/userpanel/InventoryList', '/userpanel/Addinventory', '/userpanel/Editinventory'].includes(location.pathname) ? 'text-white' : 'text-gray-400 opacity-70'}`}></i> Inventory
              </Link>
            </li>
            <li>
              <Link
                to="/userpanel/Notes"
                onClick={() => setIsSidebarOpen(false)}
                className={`flex text-textMuted items-center px-4 py-2.5 rounded-std text-sm font-medium transition-colors ${location.pathname === '/userpanel/Notes' ? 'bg-primary text-white shadow-soft' : 'text-textMain hover:bg-gray-100'}`}
              >
                <i className={`fas fa-note-sticky w-5 mr-3 ${location.pathname === '/userpanel/Notes' ? 'text-white' : 'text-gray-400 opacity-70'}`}></i> Notes
              </Link>
            </li>
            <li>
              <Link
                to="/userpanel/JobsList"
                onClick={() => setIsSidebarOpen(false)}
                className={`flex text-textMuted items-center px-4 py-2.5 rounded-std text-sm font-medium transition-colors ${['/userpanel/JobsList', '/userpanel/JobDetail'].some(path => location.pathname.includes(path)) ? 'bg-primary text-white shadow-soft' : 'text-textMain hover:bg-gray-100'}`}
              >
                <i className={`fas fa-briefcase w-5 mr-3 ${['/userpanel/JobsList', '/userpanel/JobDetail'].some(path => location.pathname.includes(path)) ? 'text-white' : 'text-gray-400 opacity-70'}`}></i> Jobs
              </Link>
            </li>
            <li>
              <Link
                to="/userpanel/Team"
                onClick={() => setIsSidebarOpen(false)}
                className={`flex text-textMuted items-center px-4 py-2.5 rounded-std text-sm font-medium transition-colors ${['/userpanel/Team', '/userpanel/Addteam', '/userpanel/Editteam', '/userpanel/Timeview', '/Timeschemahistory'].includes(location.pathname) ? 'bg-primary text-white shadow-soft' : 'text-textMain hover:bg-gray-100'}`}
              >
                <img src={user} alt="Team" className={`w-5 h-5 mr-3 ${['/userpanel/Team', '/userpanel/Addteam', '/userpanel/Editteam', '/userpanel/Timeview', '/Timeschemahistory'].includes(location.pathname) ? 'brightness-200' : 'opacity-70'}`} /> Team
              </Link>
            </li>
            <li>
              <Link to="/userpanel/Signature" onClick={() => setIsSidebarOpen(false)} className="flex text-textMuted items-center px-4 py-2.5 rounded-std text-sm font-medium text-textMain hover:bg-gray-100 transition-colors">
                <img src={pin} alt="Signature" className="w-5 h-5 mr-3 opacity-70" /> Signature
              </Link>
            </li>
            <li>
              <Link to="/userpanel/Imageupload" onClick={() => setIsSidebarOpen(false)} className="flex text-textMuted items-center px-4 py-2.5 rounded-std text-sm font-medium text-textMain hover:bg-gray-100 transition-colors">
                <img src={customers} alt="Logo" className="w-5 h-5 mr-3 opacity-70" /> Logo Upload
              </Link>
            </li>
            <li>
              <Link to="/userpanel/Editprofile" onClick={() => setIsSidebarOpen(false)} className="flex text-textMuted items-center px-4 py-2.5 rounded-std text-sm font-medium text-textMain hover:bg-gray-100 transition-colors">
                <img src={customers} alt="Profile" className="w-5 h-5 mr-3 opacity-70" /> Profile
              </Link>
            </li>
            <li>
              <Link to="/userpanel/Reports" onClick={() => setIsSidebarOpen(false)} className="flex text-textMuted items-center px-4 py-2.5 rounded-std text-sm font-medium text-textMain hover:bg-gray-100 transition-colors">
                <img src={customers} alt="Report" className="w-5 h-5 mr-3 opacity-70" /> Report
              </Link>
            </li>
          </ul>
        </nav>

        <div className="p-4 border-t border-borderLight mt-auto">
          <button onClick={handleLogout} className="flex items-center justify-center w-full px-4 py-2.5 bg-red-50 text-red-600 rounded-std text-sm font-bold hover:bg-red-100 transition-colors focus:outline-none focus:ring-2 focus:ring-red-200">
            <img src={logout} alt="Logout" className="w-4 h-4 mr-2 filter text-red-600" /> Logout
          </button>
        </div>
      </div>
    </>
  );
}
