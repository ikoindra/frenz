import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { jwtDecode } from "jwt-decode";
import { fetchEmployeeById } from "@/services/employee/index";
import { Bell, Menu2, User, X, ChevronDown, ChevronRight } from "tabler-icons-react";

export default function Header({ sidebarOpen, setSidebarOpen }) {
  const token = useSelector((state) => state.auth.token);
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [expandedNotifications, setExpandedNotifications] = useState(new Set());
  const [notificationDetails, setNotificationDetails] = useState({});
  const [loadingDetails, setLoadingDetails] = useState(new Set());
  // Close notifications when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showNotifications && !event.target.closest('.notification-dropdown')) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);

  // Fetch notifications on component mount
  useEffect(() => {
    if (token) {
      fetchNotifications();
    }
  }, [token]);

  // Fetch notifications summary
  const fetchNotifications = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/employee/notifications/summary`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        // Transform API data to match our notification structure
        const transformedNotifications = data.map((item, index) => ({
          id: `${item.type}_${index}`,
          title: item.title,
          message: item.message,
          time: new Date(item.date).toLocaleDateString(),
          isRead: false,
          type: item.type,
          count: item.count,
          apiType: item.type // Keep original type for API calls
        }));
        setNotifications(transformedNotifications);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      // Fallback to empty array or keep existing notifications
    }
  };

  // Fetch notification details based on type
  const fetchNotificationDetails = async (notification) => {
    const { apiType } = notification;
    let endpoint = '';

    switch (apiType) {
      case 'transaction':
        endpoint = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/employee/notifications/transactions/today`;
        break;
      case 'low_stock':
        endpoint = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/employee/notifications/products/low-stock`;
        break;
      case 'purchase_pending':
        endpoint = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/employee/notifications/purchases/pending`;
        break;
      default:
        return;
    }

    setLoadingDetails(prev => new Set([...prev, notification.id]));

    try {
      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setNotificationDetails(prev => ({
          ...prev,
          [notification.id]: data
        }));
      }
    } catch (error) {
      console.error(`Failed to fetch ${apiType} details:`, error);
    } finally {
      setLoadingDetails(prev => {
        const newSet = new Set(prev);
        newSet.delete(notification.id);
        return newSet;
      });
    }
  };

  useEffect(() => {
    if (!token) {
      setEmployee(null);
      setError(null);
      return;
    }

    const getEmployee = async () => {
      setLoading(true);
      setError(null);

      try {
        // Decode token to get employee ID
        const decoded = jwtDecode(token);
        const employeeId = decoded.employeeId || decoded.id;

        if (!employeeId) {
          setError("Employee ID not found in token");
          setLoading(false);
          return;
        }

        // Fetch employee data with correct parameters
        const data = await fetchEmployeeById(employeeId, token);

        if (data) {
          setEmployee(data);
        } else {
          setError("Failed to fetch employee data");
        }
      } catch (err) {
        console.error("Failed to fetch employee:", err);
        setError("Failed to load employee data");
      } finally {
        setLoading(false);
      }
    };

    getEmployee();
  }, [token]);  // Function to get employee initials for avatar fallback
  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };
  // Get unread notifications count
  const unreadCount = notifications.filter(notif => !notif.isRead).length;

  // Toggle notification expansion
  const toggleNotificationExpansion = (notification) => {
    const isCurrentlyExpanded = expandedNotifications.has(notification.id);
    
    setExpandedNotifications(prev => {
      const newSet = new Set(prev);
      if (isCurrentlyExpanded) {
        newSet.delete(notification.id);
      } else {
        newSet.add(notification.id);
        // Fetch details if not already loaded
        if (!notificationDetails[notification.id]) {
          fetchNotificationDetails(notification);
        }
      }
      return newSet;
    });
  };

  // Mark notification as read
  const markAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId ? { ...notif, isRead: true } : notif
      )
    );
  };

  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, isRead: true }))
    );
  };
  // Get notification icon color based on type
  const getNotificationTypeColor = (type) => {
    switch(type) {
      case 'transaction': return 'text-green-600 bg-green-100';
      case 'low_stock': return 'text-red-600 bg-red-100';
      case 'purchase_pending': return 'text-yellow-600 bg-yellow-100';
      case 'success': return 'text-green-600 bg-green-100';
      case 'error': return 'text-red-600 bg-red-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'info': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // Render notification details based on type
  const renderNotificationDetails = (notification) => {
    const details = notificationDetails[notification.id];
    const isLoading = loadingDetails.has(notification.id);

    if (isLoading) {
      return (
        <div className="p-3 bg-gray-50 animate-pulse">
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      );
    }

    if (!details) return null;

    switch (notification.apiType) {
      case 'transaction':
        return (
          <div className="p-3 bg-gray-50 border-t">
            <h5 className="font-medium text-sm text-gray-700 mb-2">Transaksi Hari Ini:</h5>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {details.map((transaction, index) => (
                <div key={index} className="text-xs text-gray-600 flex justify-between">
                  <span>{transaction.customerName || `Transaction ${index + 1}`}</span>
                  <span className="font-medium">Rp {transaction.total?.toLocaleString() || '0'}</span>
                </div>
              ))}
            </div>
          </div>
        );

      case 'low_stock':
        return (
          <div className="p-3 bg-gray-50 border-t">
            <h5 className="font-medium text-sm text-gray-700 mb-2">Produk Stok Rendah:</h5>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {details.map((product, index) => (
                <div key={index} className="text-xs text-gray-600 flex justify-between">
                  <span>{product.productName}</span>
                  <span className="font-medium text-red-600">{product.stock} tersisa</span>
                </div>
              ))}
            </div>
          </div>
        );

      case 'purchase_pending':
        return (
          <div className="p-3 bg-gray-50 border-t">
            <h5 className="font-medium text-sm text-gray-700 mb-2">Purchase Order Pending:</h5>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {details.map((purchase, index) => (
                <div key={index} className="text-xs text-gray-600 flex justify-between">
                  <span>{purchase.invoice}</span>
                  <span className="font-medium">Rp {purchase.total?.toLocaleString() || '0'}</span>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <header className="bg-white shadow-lg">
      <div className="px-6 py-4 flex items-center justify-between">        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-gray-500 hover:text-gray-600 lg:hidden"
        >
          <Menu2 size={24} />
        </button>        <div className="ml-auto flex items-center space-x-4">
          <div className="relative notification-dropdown">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 hover:bg-gray-100 rounded-full relative"
            >
              <Bell size={20} className="text-gray-600" />
              {/* Notification badge */}
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                  <div className="flex items-center space-x-2">
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        Mark all read
                      </button>
                    )}
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>                {/* Notifications List */}
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      <Bell size={48} className="mx-auto text-gray-300 mb-2" />
                      <p>No notifications yet</p>
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <div key={notification.id} className="border-b border-gray-100">
                        {/* Main notification item */}
                        <div
                          className={`p-4 hover:bg-gray-50 cursor-pointer ${
                            !notification.isRead ? 'bg-blue-50' : ''
                          }`}
                          onClick={() => {
                            markAsRead(notification.id);
                            toggleNotificationExpansion(notification);
                          }}
                        >
                          <div className="flex items-start space-x-3">
                            <div className={`w-2 h-2 rounded-full mt-2 ${
                              !notification.isRead ? 'bg-blue-600' : 'bg-gray-300'
                            }`}></div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <p className={`text-sm font-medium ${
                                    !notification.isRead ? 'text-gray-900' : 'text-gray-700'
                                  }`}>
                                    {notification.title}
                                  </p>
                                  {notification.count && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                      {notification.count}
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center space-x-2">
                                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                                    getNotificationTypeColor(notification.type)
                                  }`}>
                                    {notification.type.replace('_', ' ')}
                                  </span>
                                  {expandedNotifications.has(notification.id) ? (
                                    <ChevronDown size={16} className="text-gray-400" />
                                  ) : (
                                    <ChevronRight size={16} className="text-gray-400" />
                                  )}
                                </div>
                              </div>
                              <p className={`text-sm mt-1 ${
                                !notification.isRead ? 'text-gray-700' : 'text-gray-500'
                              }`}>
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                {notification.time}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        {/* Expanded details */}
                        {expandedNotifications.has(notification.id) && (
                          <div className="bg-white">
                            {renderNotificationDetails(notification)}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>

                {/* Footer */}
                {notifications.length > 0 && (
                  <div className="p-3 border-t border-gray-200 text-center">
                    <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                      View all notifications
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-3">
            <div className="hidden md:block text-right">
              {loading ? (
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                </div>
              ) : error ? (
                <div>
                  <p className="text-sm text-red-500 font-medium">Error</p>
                  <p className="text-xs text-red-400">Failed to load</p>
                </div>
              ) : employee ? (
                <div>
                  <p className="text-sm text-gray-700 font-medium">
                    {employee.employeeName || employee.name || "Unknown"}
                  </p>
                  <p className="text-xs text-gray-500">
                    ID: {employee.employeeId || employee.id || "N/A"}
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-gray-500 font-medium">Guest</p>
                  <p className="text-xs text-gray-400">Not logged in</p>
                </div>
              )}
            </div>

            {loading ? (
              <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse"></div>
            ) : employee?.profilePicture ? (
              <img
                src={employee.profilePicture}
                alt="Profile"
                className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.nextSibling.style.display = "flex";
                }}
              />
            ) : null}

            {/* Fallback avatar - shows when no profile picture or image fails to load */}
            <div
              className={`w-10 h-10 rounded-full bg-[#3F7F83] flex items-center justify-center text-white text-sm font-medium ${
                employee?.profilePicture ? "hidden" : "flex"
              }`}
            >              {employee ? (
                getInitials(employee.employeeName || employee.name)
              ) : (
                <User size={20} />
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
