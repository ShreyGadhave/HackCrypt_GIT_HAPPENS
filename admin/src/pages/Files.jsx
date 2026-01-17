import { useState, useEffect } from "react";
import { useAppSelector, useAppDispatch } from "../app/hooks";
import {
  setFiles,
  addFile,
  deleteFile,
  setLoading,
} from "../features/files/filesSlice";
import { selectIsAdmin } from "../features/auth/authSelectors";
import api from "../lib/api";
import { formatDate } from "../lib/utils";
import {
  Upload,
  FileText,
  Download,
  Trash2,
  X,
  Search,
  Filter,
  Bell,
  AlertCircle,
} from "lucide-react";

const Files = () => {
  const dispatch = useAppDispatch();
  const isAdmin = useAppSelector(selectIsAdmin);
  const { files, loading } = useAppSelector((state) => state.files);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [uploadData, setUploadData] = useState({
    file: null,
    category: "Assignment",
    subject: "Mathematics",
    description: "",
  });

  // Mock data for demonstration
  const mockFiles = [
    // Admin Notices
    {
      id: "notice-1",
      name: "Parent-Teacher Meeting Notice",
      category: "Notice",
      subject: "General",
      description: "Annual parent-teacher meeting scheduled for next week. All parents are requested to attend.",
      type: "pdf",
      size: 245,
      downloads: 156,
      uploadedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "notice-2",
      name: "Annual Sports Day Announcement",
      category: "Event",
      subject: "General",
      description: "Sports day will be held on 25th January. All students must participate.",
      type: "pdf",
      size: 189,
      downloads: 234,
      uploadedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "notice-3",
      name: "New Attendance Policy 2026",
      category: "Policy",
      subject: "General",
      description: "Updated attendance policy for the academic year 2026. Minimum 75% attendance required.",
      type: "pdf",
      size: 512,
      downloads: 189,
      uploadedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
    // Teacher Materials
    {
      id: "file-1",
      name: "Algebra Chapter 5 - Assignment.pdf",
      category: "Assignment",
      subject: "Mathematics",
      description: "Solve all problems from page 45 to 52. Submission deadline: Next Monday.",
      type: "pdf",
      size: 1024,
      downloads: 45,
      uploadedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "file-2",
      name: "Photosynthesis Notes.pdf",
      category: "Notes",
      subject: "Science",
      description: "Detailed notes on photosynthesis process and its importance in plant biology.",
      type: "pdf",
      size: 2048,
      downloads: 78,
      uploadedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "file-3",
      name: "Grammar Rules Study Material.docx",
      category: "Study Material",
      subject: "English",
      description: "Comprehensive guide covering all grammar rules with examples.",
      type: "docx",
      size: 856,
      downloads: 92,
      uploadedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "file-4",
      name: "Mid-Term Question Paper 2026.pdf",
      category: "Question Paper",
      subject: "Mathematics",
      description: "Sample question paper for mid-term examination. Pattern matches final exam.",
      type: "pdf",
      size: 678,
      downloads: 124,
      uploadedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "file-5",
      name: "Chapter 3 Exercise Solutions.pdf",
      category: "Solution",
      subject: "Mathematics",
      description: "Step-by-step solutions for all exercises in Chapter 3 - Trigonometry.",
      type: "pdf",
      size: 1536,
      downloads: 167,
      uploadedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "file-6",
      name: "Programming Basics Notes.pdf",
      category: "Notes",
      subject: "Computer Science",
      description: "Introduction to programming concepts, variables, and control structures.",
      type: "pdf",
      size: 2304,
      downloads: 56,
      uploadedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "file-7",
      name: "History Assignment - World War II.docx",
      category: "Assignment",
      subject: "Social Studies",
      description: "Write a detailed essay on the causes and effects of World War II.",
      type: "docx",
      size: 425,
      downloads: 38,
      uploadedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    dispatch(setLoading(true));
    try {
      const response = await api.get("/files");
      if (response.success && response.data && response.data.length > 0) {
        dispatch(setFiles(response.data));
      } else {
        // Use mock data if API returns no data
        dispatch(setFiles(mockFiles));
      }
    } catch (error) {
      console.error("Error fetching files:", error);
      // Use mock data on error
      dispatch(setFiles(mockFiles));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadData({ ...uploadData, file });
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append("file", uploadData.file);
      formData.append("category", uploadData.category);
      formData.append("subject", uploadData.subject);
      formData.append("description", uploadData.description);

      const response = await api.post("/files/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.success) {
        dispatch(addFile(response.data));
        setShowUploadModal(false);
        setUploadData({
          file: null,
          category: "Assignment",
          subject: "Mathematics",
          description: "",
        });
      }
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this file?")) {
      try {
        const response = await api.delete(`/files/${id}`);
        if (response.success) {
          dispatch(deleteFile(id));
        }
      } catch (error) {
        console.error("Error deleting file:", error);
      }
    }
  };

  const handleDownload = async (fileId) => {
    try {
      await api.post(`/files/${fileId}/download`);
      // In a real app, this would trigger a file download
      alert("File downloaded successfully!");
    } catch (error) {
      console.error("Error downloading file:", error);
    }
  };

  const getFileIcon = (type) => {
    const icons = {
      pdf: "📄",
      docx: "📝",
      pptx: "📊",
      xlsx: "📈",
      zip: "🗜️",
    };
    return icons[type] || "📄";
  };

  const formatFileSize = (sizeInKB) => {
    if (sizeInKB < 1024) {
      return `${sizeInKB} KB`;
    }
    return `${(sizeInKB / 1024).toFixed(2)} MB`;
  };

  // Admin notice categories
  const adminNoticeCategories = [
    "Notice",
    "Circular",
    "Policy",
    "Event",
    "Announcement",
  ];

  // Teacher file categories
  const teacherCategories = [
    "Assignment",
    "Notes",
    "Study Material",
    "Question Paper",
    "Solution",
  ];

  // Separate files into notices (for admin) and regular files
  const noticeFiles = isAdmin
    ? files.filter((file) => adminNoticeCategories.includes(file.category))
    : [];

  const regularFiles = files.filter((file) => {
    const isNotice = adminNoticeCategories.includes(file.category);
    const matchesSearch =
      file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      file.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || file.category === categoryFilter;

    // If admin, exclude notices from regular files section
    if (isAdmin) {
      return !isNotice && matchesSearch && matchesCategory;
    }
    // If teacher, show all files
    return matchesSearch && matchesCategory;
  });

  const categories = isAdmin
    ? [...adminNoticeCategories, ...teacherCategories]
    : teacherCategories;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {isAdmin ? "Files & Notices" : "Files"}
          </h1>
          <p className="text-gray-600 mt-1">
            {isAdmin
              ? "Manage notices and course materials"
              : "Manage course materials and assignments"}
          </p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Upload size={20} />
          {isAdmin ? "Upload File/Notice" : "Upload File"}
        </button>
      </div>

      {/* Admin Priority Notices Section */}
      {isAdmin && noticeFiles.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Bell size={24} className="text-orange-600" />
            <h2 className="text-xl font-bold text-gray-800">
              Important Notices
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {noticeFiles.map((file) => (
              <div
                key={file.id}
                className="card border-2 border-orange-400 hover:shadow-lg transition-shadow bg-orange-50"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <AlertCircle size={24} className="text-orange-600" />
                    <span className="px-2 py-1 bg-orange-500 text-white text-xs font-bold rounded">
                      {file.category.toUpperCase()}
                    </span>
                  </div>
                  <Bell size={20} className="text-orange-600" />
                </div>

                <h3 className="font-bold text-gray-800 mb-2 text-lg">
                  {file.name}
                </h3>
                <p className="text-sm text-gray-700 mb-3 line-clamp-2">
                  {file.description}
                </p>

                <div className="space-y-2 mb-4 text-sm text-gray-700">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Subject:</span>
                    <span className="font-semibold">{file.subject}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Published:</span>
                    <span className="font-semibold">
                      {formatDate(file.uploadedAt)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Views:</span>
                    <span className="font-semibold">{file.downloads}</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-3 border-t-2 border-orange-300">
                  <button
                    onClick={() => handleDownload(file.id)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium text-sm"
                  >
                    <FileText size={16} />
                    View Notice
                  </button>
                  <button
                    onClick={() => handleDelete(file.id)}
                    className="px-3 py-2 border-2 border-orange-400 text-orange-700 rounded-lg hover:bg-orange-100 text-sm"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Regular Files Section */}
      <div className="space-y-4">
        {isAdmin && noticeFiles.length > 0 && (
          <h2 className="text-xl font-bold text-gray-800">
            Course Materials & Assignments
          </h2>
        )}

        {/* Filters */}
        <div className="card">
          <div className="flex flex-col md:flex-row gap-4">
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
                  placeholder="Search files..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="md:w-64">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="all">All Categories</option>
                {(isAdmin ? teacherCategories : categories).map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Files Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full text-center py-12 text-gray-500">
              Loading files...
            </div>
          ) : regularFiles.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-500">
              No files found. Upload your first file!
            </div>
          ) : (
            regularFiles.map((file) => (
              <div
                key={file.id}
                className="card hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="text-4xl">{getFileIcon(file.type)}</div>
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                    {file.category}
                  </span>
                </div>

                <h3 className="font-semibold text-gray-800 mb-2 truncate">
                  {file.name}
                </h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {file.description}
                </p>

                <div className="space-y-2 mb-4 text-sm text-gray-600">
                  <div className="flex items-center justify-between">
                    <span>Subject:</span>
                    <span className="font-medium">{file.subject}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Size:</span>
                    <span className="font-medium">
                      {formatFileSize(file.size)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Downloads:</span>
                    <span className="font-medium">{file.downloads}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Uploaded:</span>
                    <span className="font-medium">
                      {formatDate(file.uploadedAt)}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 pt-3 border-t border-gray-200">
                  <button
                    onClick={() => handleDownload(file.id)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 text-sm"
                  >
                    <Download size={16} />
                    Download
                  </button>
                  <button
                    onClick={() => handleDelete(file.id)}
                    className="px-3 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 text-sm"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-lg w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">
                {isAdmin ? "Upload File/Notice" : "Upload File"}
              </h2>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpload} className="p-6 space-y-4">
              {/* File Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select File *
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload"
                    required
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Upload size={40} className="mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600">
                      {uploadData.file
                        ? uploadData.file.name
                        : "Click to upload or drag and drop"}
                    </p>
                  </label>
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  value={uploadData.category}
                  onChange={(e) =>
                    setUploadData({ ...uploadData, category: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                >
                  {isAdmin && (
                    <optgroup label="Admin Notices">
                      {adminNoticeCategories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </optgroup>
                  )}
                  <optgroup label={isAdmin ? "Course Materials" : "Categories"}>
                    {teacherCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject *
                </label>
                <select
                  value={uploadData.subject}
                  onChange={(e) =>
                    setUploadData({ ...uploadData, subject: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                >
                  <option>Mathematics</option>
                  <option>Science</option>
                  <option>English</option>
                  <option>Social Studies</option>
                  <option>Computer Science</option>
                  {isAdmin && <option>General</option>}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={uploadData.description}
                  onChange={(e) =>
                    setUploadData({
                      ...uploadData,
                      description: e.target.value,
                    })
                  }
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder={
                    isAdmin &&
                    adminNoticeCategories.includes(uploadData.category)
                      ? "Important notice details..."
                      : "Brief description of the file..."
                  }
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button type="submit" className="flex-1 btn-primary">
                  Upload{" "}
                  {isAdmin &&
                  adminNoticeCategories.includes(uploadData.category)
                    ? "Notice"
                    : "File"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
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

export default Files;
