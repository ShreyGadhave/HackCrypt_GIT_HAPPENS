import { useState, useEffect } from "react";
import { useAppSelector, useAppDispatch } from "../app/hooks";
import {
  setStudents,
  setLoading,
} from "../features/attendance/attendanceSlice";
import api from "../lib/api";
import {
  Users as UsersIcon,
  Plus,
  Edit,
  Trash2,
  X,
  Search,
  UserCheck,
  GraduationCap,
  Mail,
  Phone,
  BookOpen,
} from "lucide-react";
import { motion } from "framer-motion";

const Users = () => {
  const dispatch = useAppDispatch();
  const { students, loading } = useAppSelector((state) => state.attendance);
  const [userType, setUserType] = useState("students");
  const [searchTerm, setSearchTerm] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [teachers, setTeachers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    rollNo: "",
    class: "",
    section: "",
    gender: "Male",
    subject: "Mathematics",
    phoneNumber: "",
  });

  useEffect(() => {
    fetchUsers();
  }, [userType, classFilter]);

  const fetchUsers = async () => {
    dispatch(setLoading(true));
    try {
      if (userType === "students") {
        const classNumber =
          classFilter !== "all" ? classFilter.split(" ")[1] : null;
        const query = classNumber
          ? `/students?class=${classNumber}`
          : "/students";
        const response = await api.get(query);
        if (response.success) {
          dispatch(setStudents(response.data));
        }
      } else {
        const response = await api.get("/users?role=teacher");
        if (response.success) {
          setTeachers(response.data || []);
        }
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleAddUser = () => {
    setModalMode("add");
    setSelectedUser(null);
    setFormData({
      name: "",
      email: "",
      password: "",
      rollNo: "",
      class: "",
      section: "",
      gender: "Male",
      subject: "Mathematics",
      phoneNumber: "",
      profilePhoto: null,
      idCard: null,
    });
    setShowModal(true);
  };

  const handleEditUser = (user) => {
    setModalMode("edit");
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email || "",
      password: "",
      rollNo: user.rollNo || "",
      class: user.class || "",
      section: user.section || "",
      gender: user.gender || "Male",
      subject: user.subject || "Mathematics",
      phoneNumber: user.phoneNumber || "",
      profilePhoto: null,
      idCard: null,
    });
    setShowModal(true);
  };

  const handleDeleteUser = async (userId) => {
    if (
      !window.confirm(
        `Are you sure you want to delete this ${userType === "students" ? "student" : "teacher"
        }?`
      )
    ) {
      return;
    }

    try {
      const endpoint =
        userType === "students" ? `/students/${userId}` : `/users/${userId}`;
      const response = await api.delete(endpoint);
      if (response.success) {
        fetchUsers();
        alert(
          `${userType === "students" ? "Student" : "Teacher"
          } deleted successfully!`
        );
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Failed to delete user. Please try again.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formDataToSend = new FormData();

      if (modalMode === "add") {
        const endpoint =
          userType === "students" ? "/students/create" : "/users/create";

        if (userType === "students") {
          formDataToSend.append("name", formData.name);
          formDataToSend.append("rollNo", formData.rollNo);
          formDataToSend.append("class", formData.class);
          formDataToSend.append("section", formData.section);
          formDataToSend.append("gender", formData.gender);
          if (formData.profilePhoto) {
            formDataToSend.append("profilePhoto", formData.profilePhoto);
          }
          if (formData.idCard) {
            formDataToSend.append("idCard", formData.idCard);
          }
        } else {
          formDataToSend.append("name", formData.name);
          formDataToSend.append("email", formData.email);
          formDataToSend.append("password", formData.password);
          formDataToSend.append("subject", formData.subject);
          formDataToSend.append("phoneNumber", formData.phoneNumber);
          if (formData.profilePhoto) {
            formDataToSend.append("profilePhoto", formData.profilePhoto);
          }
        }

        const response = await api.post(endpoint, formDataToSend, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        if (response.success) {
          fetchUsers();
          setShowModal(false);
          if (response.credentials) {
            alert(
              `${userType === "students" ? "Student" : "Teacher"
              } added successfully!\n\nLogin Credentials:\nUsername: ${response.credentials.username
              }\nPassword: ${response.credentials.password}`
            );
          } else {
            alert(
              `${userType === "students" ? "Student" : "Teacher"
              } added successfully!`
            );
          }
        }
      } else {
        const endpoint =
          userType === "students"
            ? `/students/${selectedUser._id}`
            : `/users/${selectedUser._id}`;

        if (userType === "students") {
          formDataToSend.append("name", formData.name);
          formDataToSend.append("rollNo", formData.rollNo);
          formDataToSend.append("class", formData.class);
          formDataToSend.append("section", formData.section);
          formDataToSend.append("gender", formData.gender);
          if (formData.profilePhoto) {
            formDataToSend.append("profilePhoto", formData.profilePhoto);
          }
          if (formData.idCard) {
            formDataToSend.append("idCard", formData.idCard);
          }
        } else {
          formDataToSend.append("name", formData.name);
          formDataToSend.append("email", formData.email);
          if (formData.password) {
            formDataToSend.append("password", formData.password);
          }
          formDataToSend.append("subject", formData.subject);
          formDataToSend.append("phoneNumber", formData.phoneNumber);
          if (formData.profilePhoto) {
            formDataToSend.append("profilePhoto", formData.profilePhoto);
          }
        }

        const response = await api.put(endpoint, formDataToSend, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        if (response.success) {
          fetchUsers();
          setShowModal(false);
          alert(
            `${userType === "students" ? "Student" : "Teacher"
            } updated successfully!`
          );
        }
      }
    } catch (error) {
      console.error("Error saving user:", error);
      alert("Failed to save user. Please try again.");
    }
  };

  const classes = ["6", "7", "8", "9", "10", "11", "12"];
  const sections = ["A", "B", "C", "D"];
  const subjects = [
    "Mathematics",
    "Science",
    "English",
    "Social Studies",
    "Computer Science",
    "Physics",
    "Chemistry",
    "Biology",
  ];

  const filteredUsers =
    userType === "students"
      ? students.filter(
        (student) =>
          student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.rollNo.toString().includes(searchTerm)
      )
      : teachers.filter(
        (teacher) =>
          teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          teacher.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 animate-slide-in">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Users Management</h1>
          <p className="text-gray-600">
            Manage students and teachers across classes
          </p>
        </div>
        <button
          onClick={handleAddUser}
          className="btn-primary flex items-center gap-2 transform hover:scale-105 transition-transform"
        >
          <Plus size={20} />
          Add {userType === "students" ? "Student" : "Teacher"}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-scale-in">
        <div className="card card-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total Students</p>
              <p className="text-3xl font-bold text-gray-800">{students.length}</p>
              <p className="text-xs text-gray-500 mt-1">Across all classes</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
              <GraduationCap size={24} className="text-white" />
            </div>
          </div>
        </div>

        <div className="card card-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total Teachers</p>
              <p className="text-3xl font-bold text-gray-800">{teachers.length}</p>
              <p className="text-xs text-gray-500 mt-1">Active faculty</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg">
              <UserCheck size={24} className="text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters Card */}
      <div className="card animate-fade-in">
        <div className="flex flex-col md:flex-row gap-4">
          {/* User Type Toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => {
                setUserType("students");
                setClassFilter("all");
              }}
              className={`px-5 py-2.5 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${userType === "students"
                ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-md"
                : "bg-white text-gray-700 border-2 border-purple-200 hover:bg-purple-50 hover:border-purple-300"
                }`}
            >
              <GraduationCap size={20} />
              Students
            </button>
            <button
              onClick={() => {
                setUserType("teachers");
                setClassFilter("all");
              }}
              className={`px-5 py-2.5 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${userType === "teachers"
                ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-md"
                : "bg-white text-gray-700 border-2 border-purple-200 hover:bg-purple-50 hover:border-purple-300"
                }`}
            >
              <UserCheck size={20} />
              Teachers
            </button>
          </div>

          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={`Search ${userType}...`}
                className="w-full pl-10 pr-4 py-2.5 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Class Filter for Students */}
          {userType === "students" && (
            <div className="md:w-48">
              <select
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
                className="w-full px-4 py-2.5 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              >
                <option value="all">All Classes</option>
                {classes.map((cls) => (
                  <option key={cls} value={`Class ${cls}`}>
                    Class {cls}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Users Grid/Table */}
      <div className="card animate-scale-in">
        {loading ? (
          <div className="text-center py-12 text-gray-500">
            <div className="animate-pulse">Loading...</div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-12">
            <UsersIcon className="mx-auto mb-4 text-purple-300" size={48} />
            <p className="text-gray-500 mb-4">
              No {userType} found. Add your first{" "}
              {userType === "students" ? "student" : "teacher"}!
            </p>
            <button onClick={handleAddUser} className="btn-secondary">
              Add {userType === "students" ? "Student" : "Teacher"}
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-purple-200">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 bg-gradient-to-r from-purple-50 to-purple-100">
                    #
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 bg-gradient-to-r from-purple-50 to-purple-100">
                    Name
                  </th>
                  {userType === "students" ? (
                    <>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 bg-gradient-to-r from-purple-50 to-purple-100">
                        Roll No
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 bg-gradient-to-r from-purple-50 to-purple-100">
                        Class
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 bg-gradient-to-r from-purple-50 to-purple-100">
                        Section
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 bg-gradient-to-r from-purple-50 to-purple-100">
                        Gender
                      </th>
                    </>
                  ) : (
                    <>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 bg-gradient-to-r from-purple-50 to-purple-100">
                        Email
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 bg-gradient-to-r from-purple-50 to-purple-100">
                        Subject
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 bg-gradient-to-r from-purple-50 to-purple-100">
                        Phone
                      </th>
                    </>
                  )}
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 bg-gradient-to-r from-purple-50 to-purple-100">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user, index) => (
                  <tr
                    key={user._id}
                    className={`border-b border-purple-50 hover:bg-purple-50/50 transition-colors ${index % 2 === 0 ? "bg-white" : "bg-purple-50/20"
                      }`}
                  >
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {index + 1}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-800">
                      {user.name}
                    </td>
                    {userType === "students" ? (
                      <>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {user.rollNo}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {user.class}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {user.section}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {user.gender}
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Mail size={14} className="text-purple-500" />
                            {user.email}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <BookOpen size={14} className="text-purple-500" />
                            {user.subject || "N/A"}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Phone size={14} className="text-purple-500" />
                            {user.phoneNumber || "N/A"}
                          </div>
                        </td>
                      </>
                    )}
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEditUser(user)}
                          className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-all duration-200"
                          title="Edit"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between p-6 border-b border-purple-100">
              <h2 className="text-2xl font-bold text-gray-800">
                {modalMode === "add" ? "Add" : "Edit"}{" "}
                {userType === "students" ? "Student" : "Teacher"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-purple-50 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  required
                />
              </div>

              {userType === "students" ? (
                <>
                  {/* Roll Number */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Roll Number *
                    </label>
                    <input
                      type="text"
                      value={formData.rollNo}
                      onChange={(e) =>
                        setFormData({ ...formData, rollNo: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>

                  {/* Class and Section */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Class *
                      </label>
                      <input
                        type="text"
                        value={formData.class}
                        onChange={(e) =>
                          setFormData({ ...formData, class: e.target.value })
                        }
                        className="w-full px-4 py-3 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        placeholder="e.g., 10, 11, 12"
                        required
                      />
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
                        {sections.map((sec) => (
                          <option key={sec} value={sec}>
                            {sec}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Gender */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Gender *
                    </label>
                    <select
                      value={formData.gender}
                      onChange={(e) =>
                        setFormData({ ...formData, gender: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      required
                    >
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                    </select>
                  </div>

                  {/* Profile Photo */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Profile Photo
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          profilePhoto: e.target.files[0],
                        })
                      }
                      className="w-full px-4 py-3 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    />
                  </div>

                  {/* ID Card */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      ID Card Image
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        setFormData({ ...formData, idCard: e.target.files[0] })
                      }
                      className="w-full px-4 py-3 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    />
                  </div>
                </>
              ) : (
                <>
                  {/* Email */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>

                  {/* Subject */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Subject *
                    </label>
                    <select
                      value={formData.subject}
                      onChange={(e) =>
                        setFormData({ ...formData, subject: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      required
                    >
                      {subjects.map((sub) => (
                        <option key={sub} value={sub}>
                          {sub}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          phoneNumber: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    />
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Password{" "}
                      {modalMode === "add"
                        ? "*"
                        : "(leave blank to keep current)"}
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      required={modalMode === "add"}
                      minLength={6}
                    />
                    {modalMode === "add" && (
                      <p className="text-xs text-gray-500 mt-1">
                        Minimum 6 characters
                      </p>
                    )}
                  </div>

                  {/* Profile Photo */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Profile Photo
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          profilePhoto: e.target.files[0],
                        })
                      }
                      className="w-full px-4 py-3 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    />
                  </div>
                </>
              )}

              <div className="flex gap-3 pt-4">
                <button type="submit" className="flex-1 btn-primary">
                  {modalMode === "add" ? "Add" : "Update"}{" "}
                  {userType === "students" ? "Student" : "Teacher"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 btn-secondary"
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

export default Users;
