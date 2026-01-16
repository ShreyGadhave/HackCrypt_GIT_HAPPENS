import { NavLink, useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../app/hooks';
import { selectUser, selectRole, selectIsAdmin } from '../features/auth/authSelectors';
import { logout } from '../features/auth/authSlice';
import {
  LayoutDashboard,
  Calendar,
  Users,
  FileText,
  BookOpen,
  LogOut,
  Menu,
  X,
  Search,
  Bell,
} from 'lucide-react';
import { useState } from 'react';

const Layout = ({ children }) => {
  const user = useAppSelector(selectUser);
  const role = useAppSelector(selectRole);
  const isAdmin = useAppSelector(selectIsAdmin);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };
  
  const navigationItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['teacher', 'admin'] },
    { name: 'Sessions', path: '/sessions', icon: BookOpen, roles: ['teacher', 'admin'] },
    { name: 'Attendance', path: '/attendance', icon: Calendar, roles: ['teacher', 'admin'] },
    { name: 'Files', path: '/files', icon: FileText, roles: ['teacher', 'admin'] },
    { name: 'Users', path: '/users', icon: Users, roles: ['admin'] },
  ];
  
  const filteredNavigation = navigationItems.filter(item => item.roles.includes(role));
  
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className={`sidebar fixed lg:static inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-6 border-b border-gray-200">
          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
            <span className="text-xl font-bold text-white">GF</span>
          </div>
          <div>
            <h1 className="font-bold text-gray-800">Gyanjyoti Foundation</h1>
            <p className="text-xs text-gray-500 capitalize">{role} Panel</p>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 py-4">
          {filteredNavigation.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `sidebar-item ${isActive ? 'active' : ''}`
                }
                onClick={() => setSidebarOpen(false)}
              >
                <Icon size={20} />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>
        
        {/* User Profile */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center gap-3 mb-3">
            <img
              src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name}&background=0099FF&color=fff`}
              alt={user?.name}
              className="w-10 h-10 rounded-full"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
      
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            
            {/* Search Bar */}
            <div className="flex-1 max-w-md mx-4 hidden md:block">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>
            
            {/* Right Side Actions */}
            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-gray-100 rounded-lg relative">
                <Bell size={20} className="text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              
              <div className="hidden lg:flex items-center gap-2">
                <img
                  src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name}&background=0099FF&color=fff`}
                  alt={user?.name}
                  className="w-8 h-8 rounded-full"
                />
                <div>
                  <p className="text-sm font-medium text-gray-800">{user?.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{role}</p>
                </div>
              </div>
            </div>
          </div>
        </header>
        
        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
