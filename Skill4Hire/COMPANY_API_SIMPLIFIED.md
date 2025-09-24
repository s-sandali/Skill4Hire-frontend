# Simplified Company Dashboard API

## Overview
This document outlines the simplified API structure for the Company Dashboard functionality.

## Core Profile API Endpoints

### 1. Get Company Profile
```
GET /api/companies/profile
Headers: Authorization: Bearer <token>
Response: {
  id: string,
  companyName: string,
  industry: string,
  companySize: string,
  founded: number,
  description: string,
  email: string,
  phone: string,
  website: string,
  address: string,
  city: string,
  state: string,
  zipCode: string,
  country: string,
  linkedinUrl: string,
  twitterUrl: string,
  logoUrl: string,
  notifications: {
    emailAlerts: boolean,
    smsAlerts: boolean,
    applicationUpdates: boolean,
    weeklyReports: boolean
  },
  createdAt: string,
  updatedAt: string
}
```

### 2. Update Company Profile
```
PUT /api/companies/profile
Headers: Authorization: Bearer <token>
Body: {
  basicInfo: {
    companyName: string,
    industry: string,
    companySize: string,
    founded: number,
    description: string
  },
  contactInfo: {
    email: string,
    phone: string,
    website: string
  },
  address: {
    address: string,
    city: string,
    state: string,
    zipCode: string,
    country: string
  },
  socialMedia: {
    linkedinUrl: string,
    twitterUrl: string
  },
  notifications: {
    emailAlerts: boolean,
    smsAlerts: boolean,
    applicationUpdates: boolean,
    weeklyReports: boolean
  }
}
```

## Additional Endpoints

### Logo Management
- `POST /api/companies/logo/upload` - Upload company logo
- `PUT /api/companies/logo/update` - Update company logo
- `DELETE /api/companies/logo/remove` - Remove company logo
- `GET /api/companies/logo` - Get current logo

### Notifications
- `GET /api/companies/notifications/preferences` - Get notification settings
- `PUT /api/companies/notifications/preferences` - Update notification settings

### Security
- `PUT /api/companies/password/change` - Change password
- `PUT /api/companies/email/update` - Update email address
- `DELETE /api/companies/account` - Delete account
- `PUT /api/companies/two-factor` - Toggle 2FA

## Frontend Integration
The frontend `companyService.jsx` has been simplified to use only:
- `getProfile()` - Fetch company data
- `updateProfile(data)` - Update all company data in one call

This simplified approach reduces API complexity while maintaining full functionality.