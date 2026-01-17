import { NavLink, useNavigate } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../app/hooks";
import {
  selectUser,
  selectRole,
  selectIsAdmin,
} from "../features/auth/authSelectors";
import { logout } from "../features/auth/authSlice";
import {
  LayoutDashboard,
  Calendar,
  Users,
  FileText,
  BookOpen,
  LogOut,
  ChevronDown,
  User,
  Settings,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";

const Layout = ({ children }) => {
  const user = useAppSelector(selectUser);
  const role = useAppSelector(selectRole);
  const isAdmin = useAppSelector(selectIsAdmin);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Navigation items based on role
  const navigationItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
      roles: ["teacher", "admin"],
    },
    { name: "Sessions", path: "/sessions", icon: BookOpen, roles: ["teacher"] },
    {
      name: "Attendance",
      path: "/attendance",
      icon: Calendar,
      roles: ["teacher", "admin"],
    },
    {
      name: "Files",
      path: "/files",
      icon: FileText,
      roles: ["teacher", "admin"],
    },
    { name: "Users", path: "/users", icon: Users, roles: ["admin"] },
  ];

  const filteredNavigation = navigationItems.filter((item) =>
    item.roles.includes(role)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50">
      {/* Top Navigation Bar */}
      <nav className="top-nav sticky top-0 z-40 animate-slide-down">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Logo and App Name */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl flex items-center justify-center shadow-md">
                  <span className="text-xl font-bold text-white">UV</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
                    UniVerify
                  </h1>
                  <p className="text-xs text-gray-500 capitalize">{role} Panel</p>
                </div>
              </div>
            </div>

            {/* Center: Navigation Links */}
            <div className="hidden md:flex items-center gap-2">
              {filteredNavigation.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `nav-item ${isActive ? "active" : ""}`
                    }
                  >
                    <Icon size={18} />
                    <span className="text-sm font-medium">{item.name}</span>
                  </NavLink>
                );
              })}
            </div>

            {/* Right: Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-purple-50 transition-all duration-200"
              >
                <img
                  src={
                    user?.avatar ||
                    `https://ui-avatars.com/api/?name=${user?.name}&background=9333EA&color=fff`
                  }
                  alt={user?.name}
                  className="w-9 h-9 rounded-full border-2 border-purple-200"
                />
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-semibold text-gray-800">
                    {user?.name}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">{role}</p>
                </div>
                <ChevronDown
                  size={16}
                  className={`text-gray-500 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""
                    }`}
                />
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div className="dropdown-menu">
                  <div className="px-4 py-3 border-b border-purple-100">
                    <p className="text-sm font-semibold text-gray-800">
                      {user?.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{user?.email}</p>
                  </div>
                  <div className="py-1">
                    <button className="dropdown-item w-full">
                      <User size={16} />
                      <span>Profile</span>
                    </button>
                    <button className="dropdown-item w-full">
                      <Settings size={16} />
                      <span>Settings</span>
                    </button>
                  </div>
                  <div className="border-t border-purple-100 py-1">
                    <button
                      onClick={handleLogout}
                      className="dropdown-item w-full text-red-600 hover:bg-red-50 hover:text-red-700"
                    >
                      <LogOut size={16} />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t border-purple-100 px-4 py-2">
          <div className="flex items-center gap-2 overflow-x-auto">
            {filteredNavigation.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `nav-item whitespace-nowrap ${isActive ? "active" : ""}`
                  }
                >
                  <Icon size={16} />
                  <span className="text-xs font-medium">{item.name}</span>
                </NavLink>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
        {children}
      </main>
    </div>
  );
};

export default Layout;
