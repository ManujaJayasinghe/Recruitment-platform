# React Router Structure

## Route Structure

### Public Routes
- `/login` - Login page
- `/register` - Registration page
- `/unauthorized` - 403 Access Denied page

### Candidate Portal (`/candidate/*`)
**Protected by:** `allowedRoles="Candidate"`
**Layout:** `CandidateLayout` (Blue theme, User icon)

- `/candidate/profile` - Candidate profile management
- `/candidate/jobs` - Browse available jobs
- `/candidate/jobs/:id` - Job detail page
- `/candidate/applications` - View my applications

**Sidebar Navigation:**
- My Profile
- Browse Jobs
- My Applications
- Messages

### Recruiter Portal (`/recruiter/*`)
**Protected by:** `allowedRoles="Recruiter"`
**Layout:** `RecruiterLayout` (Green theme, UserPlus icon)

- `/recruiter/dashboard` - Recruiter dashboard overview
- `/recruiter/jobs` - Manage job postings
- `/recruiter/jobs/new` - Create new job posting
- `/recruiter/jobs/:id/applicants` - View applicants for a job
- `/recruiter/candidates` - Search candidates

**Sidebar Navigation:**
- Dashboard
- Job Postings
- Search Candidates
- Messages

### Hiring Manager Portal (`/hiring-manager/*`)
**Protected by:** `allowedRoles="HiringManager"`
**Layout:** `HiringManagerLayout` (Purple theme, UserCog icon)

- `/hiring-manager/shortlist` - Shortlisted candidates
- `/hiring-manager/evaluations` - Candidate evaluations

**Sidebar Navigation:**
- Shortlisted
- Evaluations
- Interviews
- Messages

### Admin Portal (`/admin/*`)
**Protected by:** `allowedRoles="Admin"`
**Layout:** `AdminLayout` (Red theme, Shield icon)

- `/admin/users` - User management
- `/admin/organizations` - Organization management
- `/admin/analytics` - Analytics dashboard

**Sidebar Navigation:**
- User Management
- Organizations
- Analytics
- Settings

## Layout Features

All layouts include:
- **Responsive Design:** Mobile-friendly with hamburger menu
- **Sidebar:** Fixed on desktop, slide-over on mobile
- **User Info Display:** Shows current user name and role
- **Active Link Highlighting:** Current page highlighted in sidebar
- **Logout Button:** At bottom of sidebar
- **Role-Specific Branding:** Each portal has unique color theme

## Technical Stack

- **React Router v6** - Client-side routing
- **Lucide React** - Icon library
- **Tailwind CSS** - Styling (utility classes)
- **Protected Routes** - Role-based access control

## How to Add New Routes

### 1. Create Page Component
```jsx
// client/src/pages/candidate/NewPage.jsx
const NewPage = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-4">New Page</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">Content here...</p>
      </div>
    </div>
  );
};

export default NewPage;
```

### 2. Add Route to App.jsx
```jsx
import NewPage from './pages/candidate/NewPage';

// Inside the appropriate route group:
<Route path="new-page" element={<NewPage />} />
```

### 3. Add Navigation Link (Optional)
```jsx
// In the appropriate Layout component (e.g., CandidateLayout.jsx)
const navItems = [
  // ... existing items
  { path: '/candidate/new-page', icon: YourIcon, label: 'New Page' },
];
```

## Next Steps

All pages currently show "Coming soon..." placeholders. Build out each portal:

1. **Candidate Portal:** Profile, job browsing, applications
2. **Recruiter Portal:** Job management, applicant review, candidate search
3. **Hiring Manager Portal:** Shortlist management, evaluations, interviews
4. **Admin Portal:** User management, analytics, system configuration
