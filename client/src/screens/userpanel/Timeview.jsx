import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import { useNavigate, useLocation } from 'react-router-dom';
import { ColorRing } from 'react-loader-spinner';

import Alertauthtoken from '../../components/Alertauthtoken';

export default function Timeview() {
  const [loading, setloading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const [userEntries, setUserEntries] = useState([]);
  const [alertMessage, setAlertMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(1); // Current page number
  const [isDeleting, setIsDeleting] = useState(false);
  const [entriesPerPage] = useState(13); // Number of entries per page
  const [editEntry, setEditEntry] = useState(null); // Entry currently being edited
  const [editForm, setEditForm] = useState({}); // Form data for editing

  if (location == null || location.state == null || location.state.teamid == null) {
    navigate('/userpanel/Team');
  }
  const teamid = location.state?.teamid;

  useEffect(() => {
    if (!localStorage.getItem('authToken') || localStorage.getItem("isTeamMember") === "true") {
      navigate('/');
    }
    fetchAllEntries();
  }, []);

  const fetchAllEntries = async () => {
    try {
      const authToken = localStorage.getItem('authToken');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/userEntries/${teamid}`, {
        headers: {
          'Authorization': authToken,
        }
      });

      if (response.status === 401) {
        const data = await response.json();
        setAlertMessage(data.message);
        setloading(false);
        window.scrollTo(0, 0);
        return; // Stop further execution
      }

      const data = await response.json();

      // Sort entries by start time
      const sortedEntries = data.userEntries.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
      setUserEntries(sortedEntries);

      setTimeout(() => {
        setloading(false);
      }, 2000);
    } catch (error) {
      console.error(error);
    }
  };

  // Handle delete functionality
  const handleDelete = async (entryId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this entry?");
    if (!confirmDelete) return; // Exit if user cancels

    setIsDeleting(true); // Disable the button while processing

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/userEntries/${entryId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setUserEntries(userEntries.filter((entry) => entry._id !== entryId));
        alert("Entry deleted successfully!");
      } else {
        const errorData = await response.json();
        alert("Failed to delete entry. Please try again.");
      }
    } catch (error) {
      console.error("Error while deleting entry:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setIsDeleting(false); // Re-enable the button
    }
  };

  // Handle edit functionality
  const handleEditClick = (entry) => {
    setEditEntry(entry); // Store the entry being edited
    setEditForm({
      startTime: entry.startTime,
      endTime: entry.endTime,
      totalTime: entry.totalTime,
    });
  };

  // Function to calculate total time in the format HH:mm:ss
  const calculateTotalTime = (startTime, endTime) => {
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return '0 hours 0 minutes 0 seconds'; // Return default value if invalid
    }

    const timeDifference = end - start;

    if (timeDifference <= 0) {
      return '0 hours 0 minutes 0 seconds'; // Invalid time range
    }

    const hours = Math.floor(timeDifference / (1000 * 60 * 60));
    const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeDifference % (1000 * 60)) / 1000);

    return `${hours} hours ${minutes} minutes ${seconds} seconds`;
  };

  // Handle change in startTime or endTime and calculate total time
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prevForm) => {
      const newForm = { ...prevForm, [name]: value };

      // If startTime or endTime is changed, recalculate total time
      if (name === 'startTime' || name === 'endTime') {
        const totalTime = calculateTotalTime(newForm.startTime, newForm.endTime);
        newForm.totalTime = totalTime;
      }

      return newForm;
    });
  };

  const handleEditSubmit = async (e, entryId) => {
    e.preventDefault();

    try {
      const authToken = localStorage.getItem('authToken');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/userEntries/${entryId}`, {
        method: "PUT",
        headers: {
          'Authorization': authToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm), // Send updated data
      });

      if (response.ok) {
        const updatedEntry = await response.json();

        // Update the state with the updated entry
        setUserEntries((prevEntries) =>
          prevEntries.map((entry) => (entry._id === entryId ? updatedEntry.updatedEntry : entry))
        );

        alert("Entry updated successfully!");
        setEditEntry(null); // Close the edit form
      } else {
        const errorData = await response.json();
        alert(errorData.message || "Failed to update entry. Please try again.");
      }
    } catch (error) {
      console.error("Error while updating entry:", error);
      alert("An error occurred. Please try again.");
    }
  };

  const GoToHistory = () => {
    navigate('/Timeschemahistory', { state: { teamid } });
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentEntries = userEntries.slice(indexOfFirstEntry, indexOfLastEntry);

  return (
    <div className='bg'>
      <div className='w-full '>
        {loading ? (
          <div className="flex flex-col md:flex-row">
            <ColorRing
              loading={loading}
              display="flex"
              justify-content="center"
              align-items="center"
              aria-label="Loading Spinner"
              data-testid="loader"
            />
          </div>
        ) : (
          <div className="flex flex-col md:flex-row">
            <Sidebar />

            <div className="flex-1 w-full mx-auto px-4">

              <div className='mt-6 mx-4'>
                {alertMessage && <Alertauthtoken message={alertMessage} onClose={() => setAlertMessage('')} />}
              </div>

              <div className='flex flex-wrap items-center justify-between py-6 px-4 mb-6 bg-white shadow-sm rounded-xl border border-gray-100 mx-4'>
                <div>
                  <p className='text-3xl font-bold text-gray-800'>Time Logs</p>
                  <nav aria-label="breadcrumb">
                    <ol className="flex text-sm text-gray-500 mt-2 space-x-2">
                      <li><a href="/Userpanel/Userdashboard" className='hover:text-primary transition-colors text-decoration-none'>Dashboard</a></li>
                      <li><span className="mx-2">/</span></li>
                      <li><a href="/userpanel/Team" className='hover:text-primary transition-colors text-decoration-none'>Team</a></li>
                      <li><span className="mx-2">/</span></li>
                      <li className="text-gray-800 font-semibold" aria-current="page">Time View</li>
                    </ol>
                  </nav>
                </div>
                <div className="mt-4 md:mt-0">
                  <button className="btn-primary flex items-center" onClick={GoToHistory}>
                    <i className="fa-solid fa-clock-rotate-left mr-2"></i> View History
                  </button>
                </div>
              </div>

              {/* Edit Form */}
              {editEntry && (
                <div className="card-standard p-6 mx-4 mb-8 bg-indigo-50/50 border-indigo-100">
                  <div className="flex justify-between items-center mb-6">
                    <h5 className="text-xl font-semibold text-gray-800">Edit Time Entry</h5>
                    <button onClick={() => setEditEntry(null)} className="text-gray-400 hover:text-gray-600">
                      <i className="fa-solid fa-xmark text-xl"></i>
                    </button>
                  </div>
                  <form onSubmit={(e) => handleEditSubmit(e, editEntry._id)}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                        <input
                          type="datetime-local"
                          className="input-standard"
                          name="startTime"
                          value={editForm.startTime}
                          onChange={handleEditChange}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                        <input
                          type="datetime-local"
                          className="input-standard"
                          name="endTime"
                          value={editForm.endTime}
                          onChange={handleEditChange}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Total Time (Auto-calculated)</label>
                        <input
                          type="text"
                          className="input-standard bg-gray-50 text-gray-500"
                          name="totalTime"
                          value={editForm.totalTime}
                          disabled
                        />
                      </div>
                    </div>
                    <div className="mt-6 flex justify-end gap-3">
                      <button
                        type="button"
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                        onClick={() => setEditEntry(null)}
                      >
                        Cancel
                      </button>
                      <button type="submit" className="btn-primary">
                        Save Changes
                      </button>
                    </div>
                  </form>
                </div>
              )}

              <div className="card-standard mx-4 mb-8 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                  <h6 className="font-semibold text-gray-800">Current Month Entries</h6>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100 text-sm text-gray-500">
                        <th className="px-6 py-4 font-medium">Start Time</th>
                        <th className="px-6 py-4 font-medium">End Time</th>
                        <th className="px-6 py-4 font-medium">Total Time</th>
                        <th className="px-6 py-4 font-medium text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {currentEntries.map((entry) => (
                        <tr key={entry._id} className={`transition-colors ${editEntry?._id === entry._id ? 'bg-indigo-50' : 'hover:bg-gray-50'}`}>
                          <td className="px-6 py-4 text-sm text-gray-800">
                            {new Date(entry.startTime).toLocaleString(undefined, {
                              year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                            })}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {entry.endTime ? new Date(entry.endTime).toLocaleString(undefined, {
                              year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                            }) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Active
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-700">
                            {entry.totalTime}
                          </td>
                          <td className="px-6 py-4 text-sm text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                className={`p-2 rounded-lg transition-colors ${editEntry?._id === entry._id ? 'bg-indigo-100 text-indigo-700' : 'text-primary hover:bg-indigo-50'}`}
                                onClick={() => handleEditClick(entry)}
                                title="Edit"
                              >
                                <i className="fa-solid fa-pen"></i>
                              </button>
                              <button
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                onClick={() => handleDelete(entry._id)}
                                disabled={isDeleting}
                                title="Delete"
                              >
                                {isDeleting ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-trash"></i>}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {userEntries.length === 0 && (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 mx-auto bg-gray-50 rounded-full flex items-center justify-center mb-4">
                        <i className="fa-solid fa-clock text-2xl text-gray-400"></i>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-1">No time logs</h3>
                      <p className="text-gray-500">There are no time entries recorded for this user.</p>
                    </div>
                  )}
                </div>

                {/* Pagination */}
                {userEntries.length > entriesPerPage && (
                  <div className='flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50'>
                    <span className="text-sm text-gray-500">
                      Showing {indexOfFirstEntry + 1} to {Math.min(indexOfLastEntry, userEntries.length)} of {userEntries.length} entries
                    </span>
                    <div className="flex gap-1">
                      {Array(Math.ceil(userEntries.length / entriesPerPage))
                        .fill(null)
                        .map((_, index) => (
                          <button 
                            key={index} 
                            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${currentPage === index + 1 ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-200 bg-gray-100'}`}
                            onClick={() => handlePageChange(index + 1)}
                          >
                            {index + 1}
                          </button>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
