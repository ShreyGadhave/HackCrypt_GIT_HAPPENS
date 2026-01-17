import { useState, useEffect } from "react";
import { QRCodeCanvas } from "qrcode.react";
import axios from "axios";
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
import {
  Plus,
  Edit,
  Trash2,
  X,
  Calendar,
  Clock,
  MapPin,
  QrCode,
  BookOpen,
  Users,
} from "lucide-react";
import { motion } from "framer-motion";

const Sessions = () => {
  const dispatch = useAppDispatch();
  const { sessions, loading } = useAppSelector((state) => state.sessions);
  const [showModal, setShowModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrToken, setQrToken] = useState("");
  const [selectedSession, setSelectedSession] = useState(null);
  const [editingSession, setEditingSession] = useState(null);
  const [formData, setFormData] = useState({
    subject: "",
    topic: "",
    class: "10",
    section: "A",
    date: "",
    startTime: "",
    endTime: "",
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
        topic: session.topic || "",
        class: session.class,
        section: session.section,
        date: session.date.split("T")[0],
        startTime: session.startTime,
        endTime: session.endTime,
      });
    } else {
      setEditingSession(null);
      setFormData({
        subject: "",
        topic: "",
        class: "10",
        section: "A",
        date: "",
        startTime: "",
        endTime: "",
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
        const response = await api.put(
          `/sessions/${editingSession._id}`,
          formData
        );
        if (response.success) {
          dispatch(updateSession(response.data));
        }
      } else {
        let gpsData = null;
        try {
          const gpsResponse = await axios.get("http://localhost:8000/teacher/gps");

          if (gpsResponse.data.success) {
            gpsData = gpsResponse.data;
          } else {
            throw new Error("GPS API returned success: false");
          }
        } catch (gpsError) {
          console.error("GPS Error:", gpsError);
          alert("Failed to verify GPS location. Cannot create session.");
          return;
        }

        const { latitude, longitude, city, region, country, ip, timezone } = gpsData;
        const sessionData = {
          ...formData,
          gpsLocation: {
            latitude,
            longitude,
            city,
            region,
            country,
            ip,
            timezone,
            timestamp: new Date(),
          },
        };

        const response = await api.post("/sessions", sessionData);
        if (response.success) {
          dispatch(addSession(response.data));
        }
      }
      handleCloseModal();
    } catch (error) {
      console.error("Error saving session:", error);
      alert(error?.response?.data?.message || "Error saving session");
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
        alert(error?.response?.data?.message || "Error deleting session");
      }
    }
  };

  const handleGenerateQR = async (session) => {
    try {
      const response = await api.post(`/sessions/${session._id}/qr-token`);
      if (response.success) {
        setQrToken(response.data.token);
        setSelectedSession(session);
        setShowQRModal(true);
      }
    } catch (error) {
      console.error("Error generating QR:", error);
      alert(error?.response?.data?.message || "Error generating QR code");
    }
  };

  const handleCloseQRModal = () => {
    setShowQRModal(false);
    setQrToken("");
    setSelectedSession(null);
  };

  const getStatusBadge = (status) => {
    const badges = {
      scheduled: "bg-purple-100 text-purple-700 border-purple-200",
      completed: "bg-green-100 text-green-700 border-green-200",
      cancelled: "bg-red-100 text-red-700 border-red-200",
    };
    return badges[status] || "bg-gray-100 text-gray-700 border-gray-200";
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-slide-in">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Sessions</h1>
          <p className="text-gray-600">Manage your lectures and teaching sessions</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="btn-primary flex items-center gap-2 transform hover:scale-105 transition-transform"
        >
          <Plus size={20} />
          Create Session
        </button>
      </div>

      {/* Sessions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {loading ? (
          <div className="col-span-full card text-center py-12 text-gray-500">
            <div className="animate-pulse">Loading sessions...</div>
          </div>
        ) : sessions.length === 0 ? (
          <div className="col-span-full card text-center py-12">
            <BookOpen className="mx-auto mb-4 text-purple-300" size={48} />
            <p className="text-gray-500 mb-4">No sessions found</p>
            <button
              onClick={() => handleOpenModal()}
              className="btn-secondary"
            >
              Create your first session
            </button>
          </div>
        ) : (
          sessions.map((session) => (
            <div
              key={session._id}
              className="card card-hover group animate-scale-in"
            >
              {/* Session Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-800 mb-1">
                    {session.subject}
                  </h3>
                  {session.topic && (
                    <p className="text-gray-600 text-sm">{session.topic}</p>
                  )}
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(
                    session.status
                  )}`}
                >
                  {session.status}
                </span>
              </div>

              {/* Session Details */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-3 text-gray-600">
                  <Users size={16} className="text-purple-500" />
                  <span className="text-sm">
                    Class {session.class} - Section {session.section}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <Calendar size={16} className="text-purple-500" />
                  <span className="text-sm">{formatDate(session.date)}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <Clock size={16} className="text-purple-500" />
                  <span className="text-sm">
                    {session.startTime} - {session.endTime}
                  </span>
                </div>
                {session.gpsLocation && (
                  <div className="flex items-center gap-3 text-gray-600">
                    <MapPin size={16} className="text-purple-500" />
                    <span className="text-sm">
                      {session.gpsLocation.city}, {session.gpsLocation.region}
                    </span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-4 border-t border-purple-100">
                <button
                  onClick={() => handleOpenModal(session)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-all duration-200 font-medium"
                  title="Edit"
                >
                  <Edit size={16} />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleGenerateQR(session)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200 font-medium"
                  title="Generate QR"
                  disabled={
                    session.status === "completed" ||
                    session.status === "cancelled"
                  }
                >
                  <QrCode size={16} />
                  <span>QR Code</span>
                </button>
                <button
                  onClick={() => handleDelete(session._id)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 font-medium"
                  title="Delete"
                >
                  <Trash2 size={16} />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between p-6 border-b border-purple-100">
              <h2 className="text-2xl font-bold text-gray-800">
                {editingSession ? "Edit Session" : "Create New Session"}
              </h2>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-purple-50 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) =>
                      setFormData({ ...formData, subject: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    required
                  />
                </div>

                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Topic
                  </label>
                  <input
                    type="text"
                    value={formData.topic}
                    onChange={(e) =>
                      setFormData({ ...formData, topic: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Class *
                  </label>
                  <select
                    value={formData.class}
                    onChange={(e) =>
                      setFormData({ ...formData, class: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    required
                  >
                    <option value="10">Class 10</option>
                    <option value="9">Class 9</option>
                    <option value="8">Class 8</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Section *
                  </label>
                  <select
                    value={formData.section}
                    onChange={(e) =>
                      setFormData({ ...formData, section: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    required
                  >
                    <option value="A">Section A</option>
                    <option value="B">Section B</option>
                    <option value="C">Section C</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Start Time *
                  </label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) =>
                      setFormData({ ...formData, startTime: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    End Time *
                  </label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) =>
                      setFormData({ ...formData, endTime: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="submit" className="flex-1 btn-primary">
                  {editingSession ? "Update Session" : "Create Session"}
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {showQRModal && selectedSession && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between p-6 border-b border-purple-100">
              <h2 className="text-2xl font-bold text-gray-800">
                Session QR Code
              </h2>
              <button
                onClick={handleCloseQRModal}
                className="p-2 hover:bg-purple-50 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Session Info */}
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 space-y-2 border border-purple-200">
                <h3 className="font-bold text-gray-800 text-lg">
                  {selectedSession.subject}
                </h3>
                {selectedSession.topic && (
                  <p className="text-sm text-gray-600">
                    {selectedSession.topic}
                  </p>
                )}
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>
                    Class {selectedSession.class}
                    {selectedSession.section}
                  </span>
                  <span>•</span>
                  <span>{formatDate(selectedSession.date)}</span>
                </div>
                <div className="text-sm text-gray-600">
                  {selectedSession.startTime} - {selectedSession.endTime}
                </div>
              </div>

              {/* QR Code Display */}
              <div className="flex flex-col items-center justify-center bg-white border-2 border-purple-200 rounded-xl p-6">
                <div className="bg-white p-4 rounded-lg shadow-inner">
                  <QRCodeCanvas
                    value={qrToken}
                    size={256}
                    level="H"
                    includeMargin={true}
                  />
                </div>
                <p className="text-sm text-gray-600 mt-4 text-center font-medium">
                  Students can scan this QR code to mark attendance
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  Valid until session ends
                </p>
              </div>

              {/* Actions */}
              <button
                onClick={handleCloseQRModal}
                className="w-full btn-primary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sessions;
