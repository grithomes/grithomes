import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ColorRing } from 'react-loader-spinner';
import Sidebar from './userpanel/Sidebar';

import Alertauthtoken from '../components/Alertauthtoken';

export default function Timeschemahistory() {
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const [userEntries, setUserEntries] = useState([]);
  const [uniqueMonths, setUniqueMonths] = useState([]);
  const [currentPageByMonth, setCurrentPageByMonth] = useState({});
  const [entriesPerPage] = useState(10);
  const [isDeleting, setIsDeleting] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [editingEntry, setEditingEntry] = useState(null); // State for editing entry
  const [editEntry, setEditEntry] = useState(null); // Entry currently being edited
  const [editForm, setEditForm] = useState({}); // Form data for editing
  if (location == null || location.state == null || location.state.teamid == null) {
    navigate('/userpanel/Team');
  }
  const teamid = location.state?.teamid;

  useEffect(() => {
    if (!localStorage.getItem('authToken') || localStorage.getItem('isTeamMember') === 'true') {
      navigate('/');
    }
    fetchAllEntries();
  }, []);

  const fetchAllEntries = async () => {
    try {
      const authToken = localStorage.getItem('authToken');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/userEntries/${teamid}`, {
        headers: {
          Authorization: authToken,
        },
      });

      if (response.status === 401) {
        const data = await response.json();
        setAlertMessage(data.message);
        setLoading(false);
        window.scrollTo(0, 0);
        return;
      }

      const data = await response.json();
      const sortedEntries = data.userEntries.sort(
        (a, b) => new Date(a.startTime) - new Date(b.startTime)
      );
      setUserEntries(sortedEntries);

      const months = [...new Set(sortedEntries.map((entry) => new Date(entry.startTime).getMonth()))];
      setUniqueMonths(months);

      const initialPageByMonth = {};
      months.forEach((monthIndex) => {
        initialPageByMonth[monthIndex] = 0;
      });
      setCurrentPageByMonth(initialPageByMonth);

      setTimeout(() => {
        setLoading(false);
      }, 2000);
    } catch (error) {
      console.error(error);
    }
  };

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
  const paginate = (items, page, pageSize) => {
    const startIndex = page * pageSize;
    return items.slice(startIndex, startIndex + pageSize);
  };

  const changePageForMonth = (monthIndex, nextPage) => {
    setCurrentPageByMonth({
      ...currentPageByMonth,
      [monthIndex]: nextPage,
    });
  };

  const formatTimeFromSeconds = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${hours} hours ${minutes} minutes ${seconds} seconds`;
  };

  return (
    <div className="bg">
      <div className="w-full ">
        {loading ? (
          <div className="flex flex-wrap -mx-2">
            <ColorRing
              loading={loading}
              display="flex"
              justifyContent="center"
              alignItems="center"
              aria-label="Loading Spinner"
              data-testid="loader"
            />
          </div>
        ) : (
          <div className="flex flex-wrap -mx-2">
            <div className="col-lg-2 col-md-3 vh-100 b-shadow bg-white d-lg-block d-md-block d-none">
              <Sidebar />
            </div>

            <div className="flex-1 w-full mx-auto px-4">

              <div className="mt-6 mx-4">
                {alertMessage && (
                  <Alertauthtoken message={alertMessage} onClose={() => setAlertMessage('')} />
                )}
              </div>
              <div className="flex flex-wrap -mx-2 my-4 mx-3">
                <div className="text">
                  <p>History</p>
                </div>

                <div className="card-standard rounded adminborder pt-4 text-center pb-4">
                  {uniqueMonths.map((monthIndex, index) => {
                    const monthEntries = userEntries.filter(
                      (entry) => new Date(entry.startTime).getMonth() === monthIndex
                    );
                    const monthName = new Date(monthEntries[0].startTime).toLocaleDateString(
                      'default',
                      {
                        month: 'long',
                      }
                    );
                    const paginatedEntries = paginate(
                      monthEntries,
                      currentPageByMonth[monthIndex],
                      entriesPerPage
                    );

                    return (
                      <React.Fragment key={monthName}>
                        {index > 0 && <hr />}
                        <div className="table-responsive">
                          <h2>{monthName}</h2>
                          <p>
                            Total Time:{' '}
                            {formatTimeFromSeconds(
                              monthEntries.reduce((acc, curr) => {
                                const timeInSeconds = parseInt(curr.timeInSeconds);
                                return isNaN(timeInSeconds) ? acc : acc + timeInSeconds;
                              }, 0)
                            )}
                          </p>
                          <p></p>
                          <table className="table">
                            <thead>
                              <tr>
                                <th>Start Time</th>
                                <th>End Time</th>
                                <th>Start Date</th>
                                <th>End Date</th>
                                <th>Total Time</th>
                                <th>Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {paginatedEntries.map((entry) => (
                                <tr key={entry._id}>
                                  <td>{new Date(entry.startTime).toLocaleTimeString()}</td>
                                  <td>
                                    {entry.endTime
                                      ? new Date(entry.endTime).toLocaleTimeString()
                                      : '--'}
                                  </td>
                                  <td>{new Date(entry.startTime).toLocaleDateString()}</td>
                                  <td>
                                    {entry.endTime
                                      ? new Date(entry.endTime).toLocaleDateString()
                                      : '--'}
                                  </td>
                                  <td>{entry.totalTime}</td>
                                  <td>
                                    <button
                                      className="btn btn-danger"
                                      onClick={() => handleDelete(entry._id)}
                                      disabled={isDeleting}
                                    >
                                      {isDeleting ? "Deleting..." : "Delete"}
                                    </button>
                                    <button
                                      className="btn-primary ml-2"
                                      onClick={() => handleEditClick(entry)}
                                    >
                                      Edit
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          {monthEntries.length > entriesPerPage && (
                            <div>
                              <button
                                onClick={() =>
                                  changePageForMonth(monthIndex, currentPageByMonth[monthIndex] - 1)
                                }
                                disabled={currentPageByMonth[monthIndex] === 0}
                              >
                                Previous Page
                              </button>
                              <button
                                onClick={() =>
                                  changePageForMonth(monthIndex, currentPageByMonth[monthIndex] + 1)
                                }
                                disabled={
                                  (currentPageByMonth[monthIndex] + 1) * entriesPerPage >=
                                  monthEntries.length
                                }
                              >
                                Next Page
                              </button>
                            </div>
                          )}
                        </div>
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>

              {editEntry && (
                <div className="edit-form mt-6">
                  <h5>Edit Entry</h5>
                  <form onSubmit={(e) => handleEditSubmit(e, editEntry._id)}>
                    <div className="form-group">
                      <label>Start Time</label>
                      <input
                        type="datetime-local"
                        className="input-standard"
                        name="startTime"
                        value={editForm.startTime}
                        onChange={handleEditChange}
                      />
                    </div>
                    <div className="form-group mt-6">
                      <label>End Time</label>
                      <input
                        type="datetime-local"
                        className="input-standard"
                        name="endTime"
                        value={editForm.endTime}
                        onChange={handleEditChange}
                      />
                    </div>
                    <div className="form-group mt-6">
                      <label>Total Time</label>
                      <input
                        type="text"
                        className="input-standard"
                        name="totalTime"
                        value={editForm.totalTime}
                        disabled
                      />
                    </div>
                    <button type="submit" className="btn btn-success mt-6">
                      Save
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary mt-6 ml-2"
                      onClick={() => setEditEntry(null)}
                    >
                      Cancel
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
