import { useState, useEffect } from 'react';
import { 
  RiAdminLine, 
  RiUserLine, 
  RiBuildingLine, 
  RiFileList3Line, 
  RiBarChartBoxLine,
  RiSettingsLine,
  RiLogoutBoxLine,
  RiSearchLine,
  RiFilterLine,
  RiAddLine,
  RiEditLine,
  RiDeleteBinLine,
  RiEyeLine,
  RiDownloadLine,
  RiShieldLine,
  RiNotification3Line,
  RiDatabaseLine,
  RiServerLine
} from 'react-icons/ri';
import { authService } from '../services/authService';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Sample data
  const [adminData] = useState({
    id: "admin-001",
    name: "Admin User",
    email: "admin@skill4hire.com",
    role: "System Administrator",
    permissions: ["Full Access"],
    lastLogin: "2024-01-20 10:30 AM"
  });

  const [users] = useState([
    {
      id: "user-001",
      name: "John Doe",
      email: "john.doe@email.com",
      role: "CANDIDATE",
      status: "Active",
      joinDate: "2024-01-15",
      lastActivity: "2024-01-20"
    },
    {
      id: "user-002",
      name: "Jane Smith",
      email: "jane.smith@company.com",
      role: "COMPANY",
      status: "Active",
      joinDate: "2024-01-10",
      lastActivity: "2024-01-19"
    },
    {
      id: "user-003",
      name: "Mike Johnson",
      email: "mike.johnson@hr.com",
      role: "EMPLOYEE",
      status: "Suspended",
      joinDate: "2024-01-05",
      lastActivity: "2024-01-18"
    }
  ]);

  const [systemStats] = useState({
    totalUsers: 1250,
    activeUsers: 1180,
    totalJobs: 340,
    totalApplications: 2850,
    systemUptime: "99.9%",
    storageUsed: "2.3 GB",
    lastBackup: "2024-01-20 06:00 AM"
  });

  const [recentActivity] = useState([
    {
      id: "act-001",
      user: "John Doe",
      action: "Applied for job",
      timestamp: "2024-01-20 09:45 AM",
      type: "application"
    },
    {
      id: "act-002",
      user: "TechCorp Solutions",
      action: "Posted new job",
      timestamp: "2024-01-20 09:30 AM",
      type: "job"
    },
    {
      id: "act-003",
      user: "Sarah Wilson",
      action: "Updated profile",
      timestamp: "2024-01-20 09:15 AM",
      type: "profile"
    }
  ]);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || user.status.toLowerCase().includes(filterStatus.toLowerCase());
    return matchesSearch && matchesFilter;
  });

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.log('Logout error:', error);
    } finally {
      // Clear local storage and redirect regardless of API call success
      localStorage.removeItem('userRole');
      localStorage.removeItem('userId');
      localStorage.removeItem('rememberedEmail');
      window.location.href = '/login';
    }
  };

  const handleUserAction = (userId, action) => {
    console.log(`${action} user ${userId}`);
    // Implement user management actions
  };

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <div className="logo-section">
              <div className="logo-icon">
                <RiAdminLine />
              </div>
              <h1>Admin Dashboard</h1>
            </div>
          </div>
          <div className="header-right">
            <div className="user-info">
              <div className="user-avatar">
                <RiAdminLine />
              </div>
              <div className="user-details">
                <span className="user-name">{adminData.name}</span>
                <span className="user-role">{adminData.role}</span>
              </div>
            </div>
            <button className="logout-btn" onClick={handleLogout}>
              <RiLogoutBoxLine />
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="dashboard-nav">
        <button 
          className={`nav-tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <RiBarChartBoxLine /> Overview
        </button>
        <button 
          className={`nav-tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          <RiUserLine /> Users
        </button>
        <button 
          className={`nav-tab ${activeTab === 'companies' ? 'active' : ''}`}
          onClick={() => setActiveTab('companies')}
        >
          <RiBuildingLine /> Companies
        </button>
        <button 
          className={`nav-tab ${activeTab === 'jobs' ? 'active' : ''}`}
          onClick={() => setActiveTab('jobs')}
        >
          <RiFileList3Line /> Jobs
        </button>
        <button 
          className={`nav-tab ${activeTab === 'system' ? 'active' : ''}`}
          onClick={() => setActiveTab('system')}
        >
          <RiServerLine /> System
        </button>
        <button 
          className={`nav-tab ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          <RiSettingsLine /> Settings
        </button>
      </nav>

      {/* Main Content */}
      <main className="dashboard-main">
        {activeTab === 'overview' && (
          <div className="overview-tab">
            <h2>System Overview</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">
                  <RiUserLine />
                </div>
                <div className="stat-content">
                  <h3>{systemStats.totalUsers.toLocaleString()}</h3>
                  <p>Total Users</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">
                  <RiBuildingLine />
                </div>
                <div className="stat-content">
                  <h3>{systemStats.totalJobs}</h3>
                  <p>Active Jobs</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">
                  <RiFileList3Line />
                </div>
                <div className="stat-content">
                  <h3>{systemStats.totalApplications.toLocaleString()}</h3>
                  <p>Total Applications</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">
                  <RiServerLine />
                </div>
                <div className="stat-content">
                  <h3>{systemStats.systemUptime}</h3>
                  <p>System Uptime</p>
                </div>
              </div>
            </div>

            <div className="overview-sections">
              <div className="recent-activity">
                <h3>Recent Activity</h3>
                <div className="activity-list">
                  {recentActivity.map(activity => (
                    <div key={activity.id} className="activity-item">
                      <div className="activity-icon">
                        {activity.type === 'application' && <RiFileList3Line />}
                        {activity.type === 'job' && <RiBuildingLine />}
                        {activity.type === 'profile' && <RiUserLine />}
                      </div>
                      <div className="activity-content">
                        <p><strong>{activity.user}</strong> {activity.action}</p>
                        <span className="activity-time">{activity.timestamp}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="system-health">
                <h3>System Health</h3>
                <div className="health-metrics">
                  <div className="metric">
                    <span className="metric-label">Active Users</span>
                    <div className="metric-bar">
                      <div className="metric-fill" style={{width: '94%'}}></div>
                    </div>
                    <span className="metric-value">{systemStats.activeUsers}</span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Storage Used</span>
                    <div className="metric-bar">
                      <div className="metric-fill" style={{width: '23%'}}></div>
                    </div>
                    <span className="metric-value">{systemStats.storageUsed}</span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Last Backup</span>
                    <div className="metric-bar">
                      <div className="metric-fill" style={{width: '100%'}}></div>
                    </div>
                    <span className="metric-value">{systemStats.lastBackup}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="users-tab">
            <div className="tab-header">
              <h2>User Management</h2>
              <div className="tab-actions">
                <div className="search-box">
                  <RiSearchLine />
                  <input 
                    type="text" 
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <select 
                  value={filterStatus} 
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div className="users-grid">
              {filteredUsers.map(user => (
                <div key={user.id} className="user-card">
                  <div className="user-header">
                    <div className="user-avatar">
                      <RiUserLine />
                    </div>
                    <div className="user-info">
                      <h3>{user.name}</h3>
                      <p>{user.email}</p>
                      <span className={`role-badge ${user.role.toLowerCase()}`}>
                        {user.role}
                      </span>
                    </div>
                    <div className="user-status">
                      <span className={`status-badge ${user.status.toLowerCase()}`}>
                        {user.status}
                      </span>
                    </div>
                  </div>
                  <div className="user-details">
                    <p><strong>Joined:</strong> {user.joinDate}</p>
                    <p><strong>Last Activity:</strong> {user.lastActivity}</p>
                  </div>
                  <div className="user-actions">
                    <button className="btn-primary" onClick={() => handleUserAction(user.id, 'view')}>
                      <RiEyeLine /> View
                    </button>
                    <button className="btn-secondary" onClick={() => handleUserAction(user.id, 'edit')}>
                      <RiEditLine /> Edit
                    </button>
                    <button className="btn-danger" onClick={() => handleUserAction(user.id, 'suspend')}>
                      <RiShieldLine /> Suspend
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'companies' && (
          <div className="companies-tab">
            <h2>Company Management</h2>
            <div className="companies-grid">
              <div className="company-card">
                <div className="company-header">
                  <div className="company-logo">
                    <RiBuildingLine />
                  </div>
                  <div className="company-info">
                    <h3>TechCorp Solutions</h3>
                    <p>Technology • 100-500 employees</p>
                    <span className="status-badge active">Active</span>
                  </div>
                </div>
                <div className="company-stats">
                  <div className="stat">
                    <span className="stat-number">15</span>
                    <span className="stat-label">Active Jobs</span>
                  </div>
                  <div className="stat">
                    <span className="stat-number">245</span>
                    <span className="stat-label">Applications</span>
                  </div>
                </div>
                <div className="company-actions">
                  <button className="btn-primary">
                    <RiEyeLine /> View Details
                  </button>
                  <button className="btn-secondary">
                    <RiEditLine /> Edit
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'jobs' && (
          <div className="jobs-tab">
            <h2>Job Management</h2>
            <div className="jobs-overview">
              <div className="job-stats">
                <div className="stat-item">
                  <h3>340</h3>
                  <p>Total Jobs</p>
                </div>
                <div className="stat-item">
                  <h3>285</h3>
                  <p>Active Jobs</p>
                </div>
                <div className="stat-item">
                  <h3>55</h3>
                  <p>Closed Jobs</p>
                </div>
              </div>
              <div className="recent-jobs">
                <h3>Recent Job Postings</h3>
                <div className="jobs-list">
                  <div className="job-item">
                    <div className="job-info">
                      <h4>Senior Frontend Developer</h4>
                      <p>TechCorp Solutions • Posted 2 hours ago</p>
                    </div>
                    <div className="job-actions">
                      <button className="btn-primary">View</button>
                      <button className="btn-danger">Remove</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'system' && (
          <div className="system-tab">
            <h2>System Administration</h2>
            <div className="system-sections">
              <div className="system-section">
                <h3>Database Management</h3>
                <div className="db-actions">
                  <button className="btn-primary">
                    <RiDatabaseLine /> Backup Database
                  </button>
                  <button className="btn-secondary">
                    <RiDownloadLine /> Export Data
                  </button>
                </div>
              </div>
              <div className="system-section">
                <h3>System Maintenance</h3>
                <div className="maintenance-actions">
                  <button className="btn-primary">
                    <RiServerLine /> Restart Services
                  </button>
                  <button className="btn-secondary">
                    <RiSettingsLine /> System Settings
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="settings-tab">
            <h2>Admin Settings</h2>
            <div className="settings-sections">
              <div className="settings-section">
                <h3>System Configuration</h3>
                <div className="setting-item">
                  <label>System Name</label>
                  <input type="text" value="Skill4Hire Platform" />
                </div>
                <div className="setting-item">
                  <label>Admin Email</label>
                  <input type="email" value={adminData.email} />
                </div>
                <button className="btn-primary">Save Changes</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
