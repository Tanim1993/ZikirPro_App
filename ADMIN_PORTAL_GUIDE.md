# 🛡️ Admin Portal (Back Office) Access Guide

## 🚀 **Portal Access**

### **Method 1: Direct URL Access**
- **URL:** Navigate to `/admin/login` in your browser
- **Full URL:** `http://your-domain.com/admin/login`

### **Method 2: From Main App**
- Go to "More" page in the main app
- Click "Admin Portal" button (purple button in header)
- Opens in new tab automatically

## 🔐 **Admin Credentials**
```
Username: admin
Password: Admin123!
```

## 📋 **Portal Features**

### **1. Competitions Management Tab**
✅ **Create Competition**
- Set name, description, start/end dates
- Choose unlimited or target-based (with specific count)
- Set maximum participants limit
- Add prize descriptions
- Select category (general, ramadan, hajj, muharram, special)

✅ **Edit Existing Competitions**
- Modify competition details
- Update rules and descriptions
- Change dates and targets

✅ **Active/Inactive Toggle**
- Instantly activate or deactivate competitions
- Control which competitions are visible to users

✅ **Delete Competitions**
- Permanently remove competitions
- Automatically removes all participant data

### **2. User Management Tab**
✅ **View All Users**
- See regular users and organization accounts
- Monitor total zikir counts per user
- Check last login dates
- View user registration details

✅ **User Status Control**
- Activate/deactivate user accounts
- Manage user access to the platform

✅ **User Details**
- View detailed user profiles
- Check user activity and statistics

### **3. System Settings Tab**
✅ **Database Management**
- Export competition data
- Export user data
- Backup database options

✅ **System Configuration**
- Maintenance mode toggle
- User registration control
- Push notifications settings

### **4. Real-Time Statistics Dashboard**
✅ **Live Metrics**
- Total competitions count
- Active users count
- Total participants across competitions
- Total zikir performed platform-wide

## 🔧 **API Endpoints Available**

### **Admin Authentication**
- `POST /api/auth/admin-login` - Admin login

### **Competition Management**
- `GET /api/admin/seasonal-competitions` - List all competitions
- `POST /api/admin/seasonal-competitions` - Create new competition
- `PUT /api/admin/seasonal-competitions/:id` - Update competition
- `DELETE /api/admin/seasonal-competitions/:id` - Delete competition
- `PUT /api/admin/seasonal-competitions/:id/toggle` - Toggle active status

### **User Management**
- `GET /api/admin/users` - List all users
- `PUT /api/admin/users/:userId/toggle` - Toggle user status

### **Statistics**
- `GET /api/admin/stats` - Get platform statistics

## 🛡️ **Security Features**

✅ **Access Control**
- Only app founder can access admin portal
- Separate admin authentication system
- Session-based security

✅ **Role-Based Access**
- Admin role verification for all admin endpoints
- Protected routes with middleware

✅ **Data Protection**
- Safe deletion operations (participants removed first)
- Proper error handling and validation

## 📱 **User Interface**

✅ **Professional Design**
- Blue gradient theme matching main app
- Responsive design for all devices
- Clean, intuitive interface

✅ **Real-Time Updates**
- Statistics refresh automatically
- Instant feedback for actions
- Loading states and success messages

## 🎯 **Usage Workflow**

### **Creating a New Competition**
1. Login to admin portal
2. Go to "Competitions" tab
3. Click "Create Competition"
4. Fill in details (name, description, dates, targets)
5. Set category and optional prize description
6. Click "Create Competition"
7. Competition is immediately active and visible to users

### **Managing Users**
1. Go to "Users" tab
2. View all registered users
3. Check user statistics and activity
4. Use toggle to activate/deactivate accounts
5. Click user details for more information

### **Monitoring System Health**
1. Check statistics dashboard for overall metrics
2. Monitor user engagement through activity data
3. Use settings tab for system configuration
4. Export data for backup or analysis

The admin portal is fully operational and provides complete control over the seasonal competitions system and user management.