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
} from "lucide-react";

const Users = () => {
  const dispatch = useAppDispatch();
  const { students, loading } = useAppSelector((state) => state.attendance);
  const [userType, setUserType] = useState("students"); // 'students' or 'teachers'
  const [searchTerm, setSearchTerm] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // 'add' or 'edit'
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
        // Extract just the number from "Class 10" format
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
        `Are you sure you want to delete this ${
          userType === "students" ? "student" : "teacher"
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
          `${
            userType === "students" ? "Student" : "Teacher"
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
              `${
                userType === "students" ? "Student" : "Teacher"
              } added successfully!\n\nLogin Credentials:\nUsername: ${
                response.credentials.username
              }\nPassword: ${response.credentials.password}`
            );
          } else {
            alert(
              `${
                userType === "students" ? "Student" : "Teacher"
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
            `${
              userType === "students" ? "Student" : "Teacher"
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
  const classDisplay = {
    6: "Class 6",
    7: "Class 7",
    8: "Class 8",
    9: "Class 9",
    10: "Class 10",
    11: "Class 11",
    12: "Class 12",
  };

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Users Management</h1>
          <p className="text-gray-600 mt-1">
            Manage students and teachers across classes
          </p>
        </div>
        <button
          onClick={handleAddUser}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          Add {userType === "students" ? "Student" : "Teacher"}
        </button>
      </div>

      {/* User Type Toggle */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex gap-2">
            <button
              onClick={() => {
                setUserType("students");
                setClassFilter("all");
              }}
              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                userType === "students"
                  ? "bg-primary text-white"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
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
              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                userType === "teachers"
                  ? "bg-primary text-white"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
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
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          {/* Class Filter for Students */}
          {userType === "students" && (
            <div className="md:w-48">
              <select
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
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

      {/* Users Table */}
      <div className="card">
        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No {userType} found. Add your first{" "}
            {userType === "students" ? "student" : "teacher"}!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    #
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Name
                  </th>
                  {userType === "students" ? (
                    <>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                        Roll No
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                        Class
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                        Section
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                        Gender
                      </th>
                    </>
                  ) : (
                    <>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                        Email
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                        Subject
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                        Phone
                      </th>
                    </>
                  )}
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user, index) => (
                  <tr
                    key={user._id}
                    className="border-b border-gray-100 hover:bg-gray-50"
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
                          {user.email}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {user.subject || "N/A"}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {user.phoneNumber || "N/A"}
                        </td>
                      </>
                    )}
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEditUser(user)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">
                {modalMode === "add" ? "Add" : "Edit"}{" "}
                {userType === "students" ? "Student" : "Teacher"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              </div>

              {userType === "students" ? (
                <>
                  {/* Roll Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Roll Number *
                    </label>
                    <input
                      type="text"
                      value={formData.rollNo}
                      onChange={(e) =>
                        setFormData({ ...formData, rollNo: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    />
                  </div>

                  {/* Class and Section */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Class *
                      </label>
                      <input
                        type="text"
                        value={formData.class}
                        onChange={(e) =>
                          setFormData({ ...formData, class: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="e.g., 10, 11, 12"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Section *
                      </label>
                      <select
                        value={formData.section}
                        onChange={(e) =>
                          setFormData({ ...formData, section: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Gender *
                    </label>
                    <select
                      value={formData.gender}
                      onChange={(e) =>
                        setFormData({ ...formData, gender: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    >
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                    </select>
                  </div>

                  {/* Profile Photo */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  {/* ID Card */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ID Card Image
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        setFormData({ ...formData, idCard: e.target.files[0] })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </>
              ) : (
                <>
                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    />
                  </div>

                  {/* Subject */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subject *
                    </label>
                    <select
                      value={formData.subject}
                      onChange={(e) =>
                        setFormData({ ...formData, subject: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
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

export default Users;
