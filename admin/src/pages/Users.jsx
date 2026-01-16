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
    class: "Class 10",
    section: "10 A",
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
        const query =
          classFilter !== "all"
            ? `/students?class=${classFilter}`
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
      rollNo: "",
      class: "Class 10",
      section: "10 A",
      gender: "Male",
      subject: "Mathematics",
      phoneNumber: "",
    });
    setShowModal(true);
  };

  const handleEditUser = (user) => {
    setModalMode("edit");
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email || "",
      rollNo: user.rollNo || "",
      class: user.class || "Class 10",
      section: user.section || "10 A",
      gender: user.gender || "Male",
      subject: user.subject || "Mathematics",
      phoneNumber: user.phoneNumber || "",
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
      if (modalMode === "add") {
        const endpoint =
          userType === "students" ? "/students/create" : "/users/create";
        const payload =
          userType === "students"
            ? {
                name: formData.name,
                rollNo: formData.rollNo,
                class: formData.class,
                section: formData.section,
                gender: formData.gender,
              }
            : {
                name: formData.name,
                email: formData.email,
                role: "teacher",
                subject: formData.subject,
                phoneNumber: formData.phoneNumber,
              };

        const response = await api.post(endpoint, payload);
        if (response.success) {
          fetchUsers();
          setShowModal(false);
          alert(
            `${
              userType === "students" ? "Student" : "Teacher"
            } added successfully!`
          );
        }
      } else {
        const endpoint =
          userType === "students"
            ? `/students/${selectedUser.id}`
            : `/users/${selectedUser.id}`;
        const payload =
          userType === "students"
            ? {
                name: formData.name,
                rollNo: formData.rollNo,
                class: formData.class,
                section: formData.section,
                gender: formData.gender,
              }
            : {
                name: formData.name,
                email: formData.email,
                subject: formData.subject,
                phoneNumber: formData.phoneNumber,
              };

        const response = await api.put(endpoint, payload);
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

  const classes = [
    "Class 6",
    "Class 7",
    "Class 8",
    "Class 9",
    "Class 10",
    "Class 11",
    "Class 12",
  ];

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
                  <option key={cls} value={cls}>
                    {cls}
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
                    key={user.id}
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
                          onClick={() => handleDeleteUser(user.id)}
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
                      <select
                        value={formData.class}
                        onChange={(e) =>
                          setFormData({ ...formData, class: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        required
                      >
                        {classes.map((cls) => (
                          <option key={cls} value={cls}>
                            {cls}
                          </option>
                        ))}
                      </select>
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
                          <option
                            key={sec}
                            value={`${formData.class.split(" ")[1]} ${sec}`}
                          >
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
