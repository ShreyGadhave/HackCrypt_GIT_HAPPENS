import { useState, useEffect } from "react";
import { useAppSelector, useAppDispatch } from "../app/hooks";
import {
  setSessions,
  addSession,
  updateSession,
  deleteSession,
  setLoading,
} from "../features/sessions/sessionsSlice";
import api from "../lib/api";
import { formatDate } from "../lib/utils";
import { Plus, Edit, Trash2, X, Calendar, Clock, MapPin } from "lucide-react";

const Sessions = () => {
  const dispatch = useAppDispatch();
  const { sessions, loading } = useAppSelector((state) => state.sessions);
  const [showModal, setShowModal] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [formData, setFormData] = useState({
    subject: "",
    topic: "",
    description: "",
    date: "",
    time: "",
    duration: 60,
    room: "",
  });

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    dispatch(setLoading(true));
    try {
      const response = await api.get("/sessions");
      if (response.success) {
        dispatch(setSessions(response.data));
      }
    } catch (error) {
      console.error("Error fetching sessions:", error);
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleOpenModal = (session = null) => {
    if (session) {
      setEditingSession(session);
      setFormData({
        subject: session.subject,
        topic: session.topic,
        description: session.description,
        date: session.date,
        time: session.time,
        duration: session.duration,
        room: session.room,
      });
    } else {
      setEditingSession(null);
      setFormData({
        subject: "",
        topic: "",
        description: "",
        date: "",
        time: "",
        duration: 60,
        room: "",
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingSession(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingSession) {
        // Update existing session
        const response = await api.put(
          `/sessions/${editingSession.id}`,
          formData
        );
        if (response.success) {
          dispatch(updateSession(response.data));
        }
      } else {
        // Create new session
        const response = await api.post("/sessions", {
          ...formData,
          class: "Class 10",
          section: "10 A",
          teacher: "Current Teacher",
        });
        if (response.success) {
          dispatch(addSession(response.data));
        }
      }
      handleCloseModal();
    } catch (error) {
      console.error("Error saving session:", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this session?")) {
      try {
        const response = await api.delete(`/sessions/${id}`);
        if (response.success) {
          dispatch(deleteSession(id));
        }
      } catch (error) {
        console.error("Error deleting session:", error);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Sessions</h1>
          <p className="text-gray-600 mt-1">Manage lectures and sessions</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          Create Session
        </button>
      </div>

      {/* Sessions Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Subject</th>
                <th>Topic</th>
                <th>Date</th>
                <th>Time</th>
                <th>Duration</th>
                <th>Room</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-8 text-gray-500">
                    Loading sessions...
                  </td>
                </tr>
              ) : sessions.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-8 text-gray-500">
                    No sessions found. Create your first session!
                  </td>
                </tr>
              ) : (
                sessions.map((session) => (
                  <tr key={session.id}>
                    <td className="font-medium text-gray-800">
                      {session.subject}
                    </td>
                    <td>{session.topic}</td>
                    <td>{formatDate(session.date)}</td>
                    <td>{session.time}</td>
                    <td>{session.duration} min</td>
                    <td>{session.room}</td>
                    <td>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          session.status === "upcoming"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {session.status}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenModal(session)}
                          className="p-1 hover:bg-blue-50 rounded text-primary"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(session.id)}
                          className="p-1 hover:bg-red-50 rounded text-red-600"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">
                {editingSession ? "Edit Session" : "Create New Session"}
              </h2>
              <button
                onClick={handleCloseModal}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) =>
                      setFormData({ ...formData, subject: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>

                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Topic *
                  </label>
                  <input
                    type="text"
                    value={formData.topic}
                    onChange={(e) =>
                      setFormData({ ...formData, topic: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time *
                  </label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) =>
                      setFormData({ ...formData, time: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration (min) *
                  </label>
                  <input
                    type="number"
                    value={formData.duration}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        duration: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    min="15"
                    step="15"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Room
                </label>
                <input
                  type="text"
                  value={formData.room}
                  onChange={(e) =>
                    setFormData({ ...formData, room: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="e.g. Room 101"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button type="submit" className="flex-1 btn-primary">
                  {editingSession ? "Update Session" : "Create Session"}
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sessions;
