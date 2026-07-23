# 🚀 Recruitment Platform

A modern, enterprise-grade recruitment management system built with .NET 10 and React. This platform streamlines the entire hiring lifecycle from job posting to candidate onboarding with AI-powered features, automated workflows, and comprehensive analytics.

## 📋 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Technical Stack](#technical-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Features by User Role](#features-by-user-role)
- [API Documentation](#api-documentation)
- [Design System](#design-system)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Overview

The Recruitment Platform is a comprehensive solution designed to modernize and automate the recruitment process for organizations of all sizes. Unlike traditional Applicant Tracking Systems (ATS), this platform offers:

- **AI-Powered Assistance** - Intelligent chatbot for candidate queries, automated resume screening, and smart candidate recommendations
- **Multi-Role Architecture** - Purpose-built interfaces for Admins, Recruiters, Hiring Managers, and Candidates
- **Real-Time Collaboration** - Built-in messaging system for seamless communication between stakeholders
- **Advanced Analytics** - Data-driven insights with interactive dashboards and reporting
- **Automated Workflows** - Email notifications, interview scheduling with Google Calendar integration, and status tracking
- **Modern UX/UI** - Responsive design with accessibility compliance (WCAG 2.1 AA) and intuitive navigation

### What Makes This Platform Unique

✨ **AI Integration** - Not just another ATS; includes context-aware AI assistant that helps candidates find jobs and answers recruitment queries in real-time

📊 **Rich Analytics** - Executive dashboards with recruitment funnel visualization, time-to-hire metrics, and diversity analytics

🔄 **End-to-End Workflow** - Complete recruitment lifecycle management from job requisition to offer acceptance

🎨 **Enterprise Design System** - Consistent, accessible UI with a comprehensive design token system

🔐 **Role-Based Security** - Granular permissions with JWT-based authentication and authorization

---

## ✨ Key Features

### Core Functionality

- **Job Management** - Create, publish, and manage job postings with rich descriptions and requirements
- **Candidate Portal** - Self-service portal for job search, application tracking, and profile management
- **Application Tracking** - Complete applicant workflow from submission to hire/reject with status history
- **Interview Scheduling** - Automated interview booking with Google Calendar integration and email notifications
- **Evaluation System** - Structured candidate evaluation with scoring, feedback, and collaborative decision-making
- **Messaging System** - Internal messaging between recruiters, hiring managers, and candidates
- **Document Management** - Resume storage and retrieval with secure access controls
- **Analytics Dashboard** - Real-time metrics, charts, and KPIs for recruitment performance

### AI & Automation

- **AI Chatbot Widget** - 24/7 candidate support with intelligent query handling
- **Automated Notifications** - Email alerts for application status changes, interview invitations, and updates
- **Smart Recommendations** - AI-suggested candidates based on job requirements
- **Calendar Integration** - Automatic interview scheduling with Google Calendar sync

### Administrative Tools

- **User Management** - Create and manage users across all roles with organization assignments
- **Organization Management** - Multi-tenant support with organization-level data isolation
- **Platform Analytics** - System-wide metrics and usage statistics
- **Audit Logging** - Comprehensive activity tracking with Serilog integration

---

## 🛠️ Technical Stack

### Backend (.NET 10)

**Framework & Architecture:**
- ASP.NET Core 10.0 Web API
- Clean Architecture (Domain, Application, Infrastructure, API layers)
- Entity Framework Core 10.0 with SQL Server
- Repository Pattern with Unit of Work
- CQRS principles for complex operations

**Key Libraries:**
- `Microsoft.AspNetCore.Authentication.JwtBearer` - JWT token authentication
- `BCrypt.Net-Next` - Password hashing and security
- `Serilog.AspNetCore` - Structured logging
- `MailKit` - Email service (SMTP integration)
- `Google.Apis.Calendar.v3` - Google Calendar API integration
- `Swashbuckle.AspNetCore` - Swagger/OpenAPI documentation
- `System.IdentityModel.Tokens.Jwt` - Token generation and validation

### Frontend (React 19)

**Framework & Build Tools:**
- React 19.2.7 with React Router DOM 7.18
- Vite 8.1 - Lightning-fast build tool
- TailwindCSS 3.4 - Utility-first CSS framework

**Key Libraries:**
- `axios` - HTTP client for API communication
- `react-hook-form` - Form validation and management
- `recharts` - Data visualization and charts
- `lucide-react` - Icon library (500+ icons)
- `react-router-dom` - Client-side routing with role-based navigation

**Development Tools:**
- ESLint 10 - Code linting and quality
- PostCSS & Autoprefixer - CSS processing
- Vite Plugin React - Fast refresh and HMR

### Database

- **SQL Server** (LocalDB for development)

- Entity Framework Core migrations for version control
- Seeded data for testing and development

### Infrastructure & Integrations

- **Email Service** - Mailtrap (development) / SMTP (production)
- **Calendar** - Google Calendar API for interview scheduling
- **Authentication** - JWT Bearer tokens with role claims
- **Logging** - Serilog with file sink for structured logging
- **API Documentation** - Swagger UI for interactive API exploration

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Backend:**
  - [.NET 10 SDK](https://dotnet.microsoft.com/download/dotnet/10.0) or later
  - [SQL Server](https://www.microsoft.com/sql-server) or SQL Server LocalDB
  - Visual Studio 2025+ or Visual Studio Code with C# extensions

- **Frontend:**
  - [Node.js](https://nodejs.org/) v18.0 or later
  - npm v9.0 or later (comes with Node.js)

- **Optional:**
  - [Git](https://git-scm.com/) for version control
  - [Postman](https://www.postman.com/) for API testing

### Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/your-org/recruitment-platform.git
cd recruitment-platform
```

#### 2. Backend Setup

**Step 2.1: Navigate to the API project**

```bash
cd RecruitmentPlatform.API
```

**Step 2.2: Configure User Secrets**

Store sensitive configuration in user secrets (never commit secrets to source control):

```bash
dotnet user-secrets init
dotnet user-secrets set "Jwt:Key" "your-super-secret-jwt-key-min-32-characters"
dotnet user-secrets set "Mailtrap:Username" "your-mailtrap-username"
dotnet user-secrets set "Mailtrap:Password" "your-mailtrap-password"
dotnet user-secrets set "GoogleCalendar:ClientId" "your-google-client-id"
dotnet user-secrets set "GoogleCalendar:ClientSecret" "your-google-client-secret"
```

**Step 2.3: Update Connection String** (if needed)

Edit `appsettings.json` if you're not using SQL Server LocalDB:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=YOUR_SERVER;Database=RecruitmentPlatformDb;Trusted_Connection=True;"
  }
}
```

**Step 2.4: Restore NuGet Packages**

```bash
dotnet restore
```

**Step 2.5: Apply Database Migrations**

```bash
dotnet ef database update
```

This creates the database schema.

**Step 2.6: Run the Backend**

```bash
dotnet run
```

The API will start at `https://localhost:7139` (HTTPS) and `http://localhost:5233` (HTTP).

Swagger documentation available at: `https://localhost:5233/swagger`

#### 3. Frontend Setup

**Step 3.1: Navigate to the client directory**

```bash
cd ../client
```

**Step 3.2: Install Dependencies**

```bash
npm install
```

**Step 3.3: Configure API Base URL** (if needed)

The frontend is configured to connect to `http://localhost:5173` by default. To change this, edit `client/src/services/api.js`:

```javascript
const API_BASE_URL = 'http://localhost:5173/api';
```

**Step 3.4: Run the Development Server**

```bash
npm run dev
```

The React app will start at `http://localhost:5173` with hot module replacement (HMR).

#### 4. Access the Platform

Open your browser and navigate to:
- **Frontend:** http://localhost:5173
- **API Swagger:** https://localhost:5233/swagger

**Login Credentials:**

| Role | Email | Password |
|------|-------|----------|
| Admin | manuja.jayasinghe@example.com | Password123! |
| Recruiter | kethmi.warnasooriya@example.com | Password123! |
| Hiring Manager | yathindu.jayawardena@example.com | Password123! |
| Candidate | naveen.darshana@example.com | Password123! |

### Environment Configuration

#### Backend Environment Variables

The following configuration is required in `appsettings.json` or User Secrets:

**Required:**
- `ConnectionStrings:DefaultConnection` - SQL Server connection string
- `Jwt:Key` - Secret key for JWT token generation (min 32 characters)
- `Jwt:Issuer` - Token issuer identifier
- `Jwt:Audience` - Token audience identifier

**Optional (for full functionality):**
- `Mailtrap:Host` - SMTP server host
- `Mailtrap:Port` - SMTP server port
- `Mailtrap:Username` - SMTP username
- `Mailtrap:Password` - SMTP password
- `Mailtrap:SenderEmail` - From email address
- `Mailtrap:SenderName` - From name
- `GoogleCalendar:ClientId` - Google OAuth client ID
- `GoogleCalendar:ClientSecret` - Google OAuth client secret
- `GoogleCalendar:RedirectUri` - OAuth redirect URI

#### Frontend Environment Variables

No environment variables required for local development. For production builds, ensure `VITE_API_BASE_URL` is set:

```bash
VITE_API_BASE_URL=https://your-api-domain.com/api npm run build
```

---

## 📁 Project Structure

### Backend Architecture

The backend follows Clean Architecture principles with clear separation of concerns:

```
RecruitmentPlatform/
│
├── RecruitmentPlatform.API/              # Presentation Layer
│   ├── Controllers/                       # API endpoints by feature
│   │   ├── AuthController.cs              # Authentication & registration
│   │   ├── AdminController.cs             # Admin-only operations
│   │   ├── RecruiterController.cs         # Recruiter job & candidate management
│   │   ├── HiringManagerController.cs     # Evaluation & shortlisting
│   │   ├── CandidateController.cs         # Candidate profile & applications
│   │   ├── JobSearchController.cs         # Public job listings
│   │   ├── ApplicationController.cs       # Application submission & tracking
│   │   ├── InterviewController.cs         # Interview scheduling
│   │   ├── MessageController.cs           # Internal messaging
│   │   ├── AnalyticsController.cs         # Platform analytics
│   │   └── ChatbotController.cs           # AI assistant endpoints
│   ├── Program.cs                         # App configuration & DI setup
│   ├── appsettings.json                   # Configuration (non-sensitive)
│   └── RecruitmentPlatform.API.http       # HTTP test file
│
├── RecruitmentPlatform.Application/      # Business Logic Layer
│   ├── DTOs/                              # Data Transfer Objects
│   │   ├── Auth/                          # Login, register, token DTOs
│   │   ├── Job/                           # Job creation, search, detail DTOs
│   │   ├── Application/                   # Application status, detail DTOs
│   │   ├── Candidate/                     # Profile, resume DTOs
│   │   ├── Interview/                     # Schedule, invitation DTOs
│   │   └── Analytics/                     # Dashboard, metrics DTOs
│   ├── Interfaces/                        # Service contracts
│   │   ├── IAuthService.cs
│   │   ├── IJobService.cs
│   │   ├── IApplicationService.cs
│   │   ├── IEmailService.cs
│   │   ├── ICalendarService.cs
│   │   └── IAIService.cs
│   └── Services/                          # Business logic implementation
│       └── (Service implementations)
│
├── RecruitmentPlatform.Domain/           # Core Domain Layer
│   ├── Entities/                          # Domain models
│   │   ├── User.cs                        # User entity with roles
│   │   ├── Organization.cs                # Multi-tenant organizations
│   │   ├── Job.cs                         # Job postings
│   │   ├── JobApplication.cs              # Applications
│   │   ├── Interview.cs                   # Interview scheduling
│   │   ├── Evaluation.cs                  # Candidate evaluations
│   │   ├── Message.cs                     # Internal messages
│   │   └── Notification.cs                # Email notifications
│   ├── Enums/                             # Domain enumerations
│   │   ├── UserRole.cs                    # Admin, Recruiter, etc.
│   │   ├── ApplicationStatus.cs           # New, Screening, Interview, etc.
│   │   ├── JobStatus.cs                   # Draft, Active, Closed
│   │   └── InterviewType.cs               # Phone, Video, OnSite
│   └── Interfaces/                        # Repository contracts
│       ├── IUserRepository.cs
│       ├── IJobRepository.cs
│       ├── IApplicationRepository.cs
│       └── IUnitOfWork.cs
│
└── RecruitmentPlatform.Infrastructure/   # Data Access & External Services
    ├── Data/                              # EF Core configuration
    │   ├── ApplicationDbContext.cs        # DbContext with entity configs
    │   └── DbSeeder.cs                    # Test data seeding
    ├── Repositories/                      # Data access implementation
    │   ├── UserRepository.cs
    │   ├── JobRepository.cs
    │   ├── ApplicationRepository.cs
    │   └── UnitOfWork.cs
    └── Services/                          # External service implementations
        ├── EmailService.cs                # SMTP email sending
        ├── GoogleCalendarService.cs       # Calendar integration
        └── AIService.cs                   # AI chatbot logic
```

### Frontend Architecture

The frontend is organized by feature with shared components and services:

```
client/
│
├── src/
│   ├── pages/                            # Page components by role
│   │   ├── LoginPage.jsx                 # Authentication
│   │   ├── RegisterPage.jsx
│   │   ├── UnauthorizedPage.jsx
│   │   │
│   │   ├── admin/                        # Admin pages
│   │   │   ├── AdminUsersPage.jsx        # User management
│   │   │   ├── AdminOrganizationsPage.jsx # Organization management
│   │   │   └── AdminAnalyticsPage.jsx    # Platform analytics
│   │   │
│   │   ├── recruiter/                    # Recruiter pages
│   │   │   ├── RecruiterDashboardPage.jsx # Job overview
│   │   │   ├── RecruiterNewJobPage.jsx   # Create job postings
│   │   │   ├── RecruiterJobApplicantsPage.jsx # Review applications
│   │   │   └── RecruiterCandidatesPage.jsx # Candidate database
│   │   │
│   │   ├── hiring-manager/               # Hiring Manager pages
│   │   │   ├── HiringManagerShortlistPage.jsx # Review shortlisted candidates
│   │   │   └── HiringManagerEvaluatePage.jsx  # Evaluate & score candidates
│   │   │
│   │   └── candidate/                    # Candidate pages
│   │       ├── CandidateJobsPage.jsx     # Browse jobs
│   │       ├── CandidateJobDetailPage.jsx # Job details & apply
│   │       ├── CandidateApplicationsPage.jsx # Track applications
│   │       └── CandidateProfilePage.jsx  # Manage profile
│   │
│   ├── layouts/                          # Role-specific layouts
│   │   ├── AdminLayout.jsx               # Admin navigation & sidebar
│   │   ├── RecruiterLayout.jsx
│   │   ├── HiringManagerLayout.jsx
│   │   └── CandidateLayout.jsx
│   │
│   ├── components/                       # Reusable components
│   │   ├── ProtectedRoute.jsx            # Route authorization
│   │   ├── ChatbotWidget.jsx             # AI assistant widget
│   │   ├── MessageThreadPanel.jsx        # Messaging interface
│   │   ├── InterviewScheduleModal.jsx    # Schedule interviews
│   │   ├── EvaluationFormModal.jsx       # Candidate evaluation form
│   │   └── (other shared components)
│   │
│   ├── context/                          # React Context providers
│   │   └── AuthContext.jsx               # Authentication state management
│   │
│   ├── services/                         # API service layer
│   │   ├── api.js                        # Axios instance & interceptors
│   │   ├── authService.js                # Login, register, logout
│   │   ├── adminService.js               # Admin operations
│   │   ├── recruiterService.js           # Recruiter operations
│   │   ├── hiringManagerService.js       # Hiring manager operations
│   │   ├── candidateService.js           # Candidate operations
│   │   ├── jobsService.js                # Job search & details
│   │   └── applicationsService.js        # Application management
│   │
│   ├── App.jsx                           # Main app component & routing
│   ├── index.css                         # Global styles & Tailwind imports
│   └── main.jsx                          # React app entry point
│
├── public/                               # Static assets
├── dist/                                 # Production build output
├── index.html                            # HTML template
├── vite.config.js                        # Vite configuration
├── tailwind.config.js                    # Tailwind CSS configuration
├── postcss.config.js                     # PostCSS configuration
└── package.json                          # Dependencies & scripts
```

### Key Directory Purposes

**Backend:**
- `Controllers/` - HTTP request handlers, input validation, response formatting
- `Services/` - Business logic, workflow orchestration, validation rules
- `Repositories/` - Data access abstraction, query composition
- `Entities/` - Domain models with business rules and relationships
- `DTOs/` - API contracts, request/response shapes, data mapping
- `Data/` - EF Core configuration, migrations, database seeding

**Frontend:**
- `pages/` - Full-page components mapped to routes
- `layouts/` - Wrapper components with navigation and common UI
- `components/` - Reusable UI components (modals, forms, widgets)
- `services/` - API communication layer with error handling
- `context/` - Global state management (auth, theme, etc.)

---

## 👥 Features by User Role

### 🔐 Admin (Platform Administrator)

**User Management:**
- Create, edit, and deactivate user accounts
- Assign user roles (Admin, Recruiter, Hiring Manager, Candidate)
- Assign users to organizations
- Reset user passwords
- View user activity logs

**Organization Management:**
- Create and manage organizations (multi-tenant support)
- Configure organization settings
- View organization-level metrics
- Assign recruiters and hiring managers to organizations

**Platform Analytics:**
- System-wide recruitment metrics
- User activity and engagement statistics
- Application funnel analysis (applications, screening, interviews, offers)
- Time-to-hire analytics
- Interactive charts and data visualizations
- Export reports for executive review

**System Configuration:**
- Platform-wide settings
- Email template management
- Notification preferences

### 💼 Recruiter

**Job Management:**
- Create and publish job postings with rich descriptions
- Edit job details (title, description, requirements, salary range)
- Set job status (Draft, Active, Closed)
- Assign hiring managers to jobs
- View job performance metrics (views, applications, conversion rates)

**Application Review:**
- View all applications for their jobs
- Filter and search candidates
- Download resumes and application documents
- Update application status (New → Screening → Shortlisted → Rejected)
- Add internal notes and comments
- Bulk actions (reject multiple, move to next stage)

**Candidate Database:**
- Browse and search all candidates
- View candidate profiles and application history
- Add candidates to talent pool
- Export candidate data

**Interview Coordination:**
- Schedule interviews with Google Calendar integration
- Send interview invitations to candidates and hiring managers
- Reschedule or cancel interviews
- Track interview completion status

**Messaging:**
- Communicate with candidates
- Col
laborate with hiring managers
- Internal messaging for team coordination
- Threaded conversations with message history

**Dashboard & Analytics:**
- Active jobs summary
- Application pipeline overview
- Recent activity feed
- Performance metrics

### 👔 Hiring Manager

**Candidate Review:**
- View shortlisted candidates assigned to them
- Access candidate profiles and resumes
- Review recruiter notes and screening feedback
- Compare candidates side-by-side

**Evaluation System:**
- Structured candidate evaluation forms
- Score candidates on multiple criteria:
  - Technical skills
  - Cultural fit
  - Communication skills
  - Leadership potential
  - Overall impression
- Add detailed feedback and recommendations
- Submit hire/reject decisions with rationale

**Interview Participation:**
- View scheduled interviews
- Access interview details and candidate information
- Join video interviews (integration ready)
- Submit post-interview feedback

**Collaboration:**
- Message recruiters about candidates
- Request additional interviews
- Discuss evaluation results
- Track decision timeline

**Analytics:**
- View candidates they've evaluated
- Track decision outcomes
- Time-to-decision metrics
- Evaluation score distributions

### 🎯 Candidate

**Job Discovery:**
- Browse available job openings
- Advanced search and filtering:
  - Location
  - Job type (Full-time, Part-time, Contract)
  - Department
  - Salary range
  - Experience level
- Save favorite jobs
- View job details with full descriptions

**Application Management:**
- One-click apply to jobs
- Upload and manage resumes (PDF, DOC, DOCX)
- Write custom cover letters
- Track application status in real-time:
  - Submitted
  - Under Review
  - Screening
  - Interview Scheduled
  - Offer Extended
  - Rejected
- View application timeline and history
- Withdraw applications if needed

**Profile Management:**
- Create and update professional profile
- Add work experience
- List skills and certifications
- Upload resume and portfolio documents
- Set job preferences and availability

**Interview Management:**
- View scheduled interviews
- Receive email notifications
- Calendar integration (add to personal calendar)
- Access interview preparation materials
- Confirm or request reschedule

**Communication:**
- Message recruiters with questions
- Receive status updates
- Get notified of important events
- Access support through AI chatbot

**AI Chatbot Assistant:**
- 24/7 availability for common questions
- Help finding suitable jobs
- Application status inquiries
- Interview preparation tips
- General recruitment process guidance
- Escalation to human recruiter when needed

---

## 📡 API Documentation

### Overview

The Recruitment Platform API is a RESTful service built on ASP.NET Core 10.0. It uses JWT Bearer tokens for authentication and follows standard HTTP conventions.

**Base URL (Development):** `http://localhost:5000/api`

**Interactive Documentation:** `https://localhost:5233/swagger`

### Authentication

The API uses JWT (JSON Web Token) Bearer authentication. Include the token in the `Authorization` header:

```
Authorization: Bearer <your-jwt-token>
```

**Obtaining a Token:**

```http
POST /api/Auth/login
Content-Type: application/json

{
  "email": "naveen.darshana@example.com",
  "password": "Password123!"
}
```

**Response:**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1laWRlbnRpZmllciI6IjU5YWMwYWY5LWUwOWQtNDNiMC1hYjIwLTY4ZWI0YzQyOTg4NSIsImh0dHA6Ly9zY2hlbWFzLnhtbHNvYXAub3JnL3dzLzIwMDUvMDUvaWRlbnRpdHkvY2xhaW1zL2VtYWlsYWRkcmVzcyI6Im5hdmVlbi5kYXJzaGFuYUBleGFtcGxlLmNvbSIsImh0dHA6Ly9zY2hlbWFzLm1pY3Jvc29mdC5jb20vd3MvMjAwOC8wNi9pZGVudGl0eS9jbGFpbXMvcm9sZSI6IkNhbmRpZGF0ZSIsImV4cCI6MTc4NDkwMDgwOCwiaXNzIjoiUmVjcnVpdG1lbnRQbGF0Zm9ybSIsImF1ZCI6IlJlY3J1aXRtZW50UGxhdGZvcm1Vc2VycyJ9.mwkh6H-vGZneHD5poEpwxDsSMzDB40dGRg8iH9SROJY",
  "userId": "59ac0af9-e09d-43b0-ab20-68eb4c429885",
  "fullName": "Naveen Darshana",
  "role": "Candidate",
  "expiresAt": "2026-07-24T13:46:48.72489Z"
}
```

### Authorization by Role

API endpoints are protected based on user roles:

| Role | Access Level |
|------|--------------|
| **Admin** | All endpoints + Admin-specific operations |
| **Recruiter** | Job management, applications, candidates, interviews |
| **Hiring Manager** | Assigned candidates, evaluations, interviews |
| **Candidate** | Own profile, job search, own applications |

### Main API Endpoints

#### Authentication & Registration

```http
POST   /api/Auth/register           # Register new user
POST   /api/Auth/login              # Login (returns JWT token)
GET    /api/Auth/me                 # Get current user profile
POST   /api/Auth/logout             # Logout (client-side token removal)
```

#### Admin Operations

```http
GET    /api/Admin/users             # List all users
POST   /api/Admin/users             # Create new user
PUT    /api/Admin/users/{id}        # Update user details
DELETE /api/Admin/users/{id}        # Deactivate user
GET    /api/Admin/organizations     # List organizations
POST   /api/Admin/organizations     # Create organization
GET    /api/Analytics/platform      # Platform-wide analytics
```

#### Recruiter Operations

```http
GET    /api/Recruiter/jobs                    # List recruiter's jobs
POST   /api/Recruiter/jobs                    # Create new job
GET    /api/Recruiter/jobs/{id}               # Job details
PUT    /api/Recruiter/jobs/{id}               # Update job
DELETE /api/Recruiter/jobs/{id}               # Delete job (soft delete)
GET    /api/Recruiter/jobs/{id}/applications  # Applications for a job
PUT    /api/Recruiter/applications/{id}/status # Update application status
GET    /api/Recruiter/candidates              # Browse candidate database
GET    /api/Recruiter/dashboard               # Dashboard metrics
```

#### Hiring Manager Operations

```http
GET    /api/HiringManager/shortlist           # View shortlisted candidates
GET    /api/HiringManager/evaluate/{appId}    # Get candidate for evaluation
POST   /api/HiringManager/evaluations         # Submit evaluation
PUT    /api/HiringManager/evaluations/{id}    # Update evaluation
GET    /api/HiringManager/interviews          # Assigned interviews
```

#### Candidate Operations

```http
GET    /api/Candidate/profile                 # Get own profile
PUT    /api/Candidate/profile                 # Update profile
POST   /api/Candidate/profile/resume          # Upload resume
GET    /api/Candidate/applications            # Own applications
GET    /api/Candidate/applications/{id}       # Application details
POST   /api/Candidate/applications            # Apply to job
DELETE /api/Candidate/applications/{id}       # Withdraw application
GET    /api/Candidate/interviews              # Scheduled interviews
```

#### Public/Job Search (No Auth Required)

```http
GET    /api/JobSearch/jobs                    # Browse public job listings
GET    /api/JobSearch/jobs/{id}               # Job details
GET    /api/JobSearch/jobs/search             # Search with filters
```

#### Interview Management

```http
POST   /api/Interview/schedule                # Schedule interview
GET    /api/Interview/{id}                    # Interview details
PUT    /api/Interview/{id}/reschedule         # Reschedule interview
DELETE /api/Interview/{id}                    # Cancel interview
POST   /api/Interview/{id}/confirm            # Confirm attendance (candidate)
```

#### Messaging

```http
GET    /api/Message/conversations             # List conversations
GET    /api/Message/conversations/{id}        # Get thread messages
POST   /api/Message                           # Send message
PUT    /api/Message/{id}/read                 # Mark as read
```

#### AI Chatbot

```http
POST   /api/Chatbot/query                     # Send question to AI assistant
GET    /api/Chatbot/conversations/{userId}    # Get conversation history
```

### Request/Response Patterns

**Pagination:**

```http
GET /api/Recruiter/jobs?page=1&pageSize=20
```

**Filtering:**

```http
GET /api/JobSearch/jobs?location=Remote&jobType=FullTime&department=Engineering
```

**Error Responses:**

```json
{
  "error": "Validation failed",
  "details": [
    "Email is required",
    "Password must be at least 8 characters"
  ],
  "statusCode": 400
}
```

### API Versioning

Current version: **v1** (no version prefix required)

Future versions will use URL versioning: `/api/v2/...`

### Rate Limiting

Currently no rate limiting implemented. Production deployment should add rate limiting middleware.

### CORS Policy

Development: Allows all origins (`*`)

Production: Configure allowed origins in `appsettings.Production.json`

---


### Visual Design Tokens

**Color Palette:**

```css
/* Primary Colors */
--color-primary: #3B82F6       /* Blue - Primary actions */
--color-primary-dark: #2563EB  /* Hover states */

/* Semantic Colors */
--color-success: #10B981       /* Success states, confirmations */
--color-warning: #F59E0B       /* Warnings, pending actions */
--color-error: #EF4444         /* Errors, destructive actions */
--color-info: #3B82F6          /* Information, neutral alerts */

/* Neutral Colors */
--color-gray-50: #F9FAFB       /* Backgrounds */
--color-gray-100: #F3F4F6      /* Subtle backgrounds */
--color-gray-200: #E5E7EB      /* Borders */
--color-gray-600: #4B5563      /* Secondary text */
--color-gray-900: #111827      /* Primary text */

/* AI/Gradient Colors */
--color-indigo-600: #4F46E5    /* AI features */
--color-violet-600: #7C3AED    /* AI accents */
--color-yellow-300: #FCD34D    /* Sparkle highlights */
```

**Typography:**

- **Font Family:** System fonts for optimal performance
  - `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, ...`
- **Scale:**
  - Headings: 2xl (24px), xl (20px), lg (18px)
  - Body: base (16px), sm (14px), xs (12px)
- **Weights:** 400 (normal), 500 (medium), 600 (semibold), 700 (bold)

**Spacing Scale:**

```
1 = 0.25rem (4px)
2 = 0.5rem (8px)
3 = 0.75rem (12px)
4 = 1rem (16px)
6 = 1.5rem (24px)
8 = 2rem (32px)
12 = 3rem (48px)
```

### Component Library Approach

**Base Components:**
- Buttons (Primary, Secondary, Danger, Ghost)
- Form inputs (Text, Select, Checkbox, Radio, File upload)
- Cards with consistent shadows and borders
- Modals with backdrop and animations
- Alerts and notifications
- Tables with sorting and pagination
- Charts (Bar, Line, Pie using Recharts)

**Composite Components:**
- Navigation bars with role-specific menus
- Sidebar navigation with icons
- Data tables with filtering
- Form wizards for multi-step processes
- Status badges with semantic colors
- Avatar components with fallbacks

**Component Patterns:**

```jsx
// Consistent prop patterns
<Button 
  variant="primary"     // primary, secondary, danger, ghost
  size="md"             // sm, md, lg
  disabled={false}
  onClick={handleClick}
>
  Click Me
</Button>

// Status badge pattern
<StatusBadge 
  status="interview"    // Maps to semantic color
  text="Interview Scheduled"
/>
```

### Responsive Design

**Breakpoints:**

```css
sm: 640px   /* Mobile landscape */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large desktop */
```

**Mobile-First Approach:**

```jsx
// Responsive utility classes
<div className="
  w-full           {/* Mobile: full width */}
  md:w-1/2         {/* Tablet: half width */}
  lg:w-1/3         {/* Desktop: third width */}
">
```

**Layout Patterns:**
- Stacked on mobile, side-by-side on desktop
- Collapsible sidebar navigation on mobile
- Responsive tables (horizontal scroll or stacked cards)
- Touch-friendly button sizes (min 44x44px)

### Accessibility Features

**WCAG 2.1 AA Compliance:**

✅ **Color Contrast:** All text meets 4.5:1 ratio (7:1 for large text)

✅ **Keyboard Navigation:**
- Tab order follows visual flow
- Focus indicators on all interactive elements
- Skip links for main content
- Escape key closes modals

✅ **Screen Reader Support:**
- Semantic HTML (`<nav>`, `<main>`, `<article>`)
- ARIA labels on icons and actions
- ARIA live regions for dynamic content
- Alt text on images

✅ **Form Accessibility:**
- Labels associated with inputs
- Error messages with `aria-describedby`
- Required field indicators
- Inline validation feedback

✅ **Visual Accessibility:**
- Icons paired with text labels
- No color-only information conveyance
- Clear focus states
- Sufficient spacing between interactive elements

**Example Accessible Component:**

```jsx
<button
  className="btn-primary"
  aria-label="Submit application"
  disabled={isSubmitting}
  aria-busy={isSubmitting}
>
  {isSubmitting ? (
    <>
      <Loader className="animate-spin" aria-hidden="true" />
      <span>Submitting...</span>
    </>
  ) : (
    'Submit Application'
  )}
</button>
```

### Animation & Transitions

**Performance-First Animations:**

```css
/* Smooth transitions */
transition: all 0.2s ease-in-out;

/* Transform animations (GPU accelerated) */
transform: scale(1.05);
transform: translateY(-2px);

/* Hover states */
hover:shadow-lg
hover:scale-105
```

**Loading States:**
- Skeleton screens for content loading
- Spinner animations for actions
- Progress bars for multi-step processes

---

## 🚀 Deployment

### Production Build

#### Backend Deployment

**1. Update Configuration for Production:**

Edit `appsettings.Production.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=prod-server;Database=RecruitmentPlatformDb;User Id=app_user;Password=***;"
  },
  "Jwt": {
    "Issuer": "https://your-domain.com",
    "Audience": "https://your-domain.com"
  },
  "Mailtrap": {
    "Host": "smtp.your-mail-provider.com",
    "Port": "587"
  },
  "AllowedHosts": "your-domain.com"
}
```

**2. Set Production User Secrets:**

```bash
dotnet user-secrets set "Jwt:Key" "production-secret-key-min-32-chars" --project RecruitmentPlatform.API
dotnet user-secrets set "Mailtrap:Username" "prod-username" --project RecruitmentPlatform.API
dotnet user-secrets set "Mailtrap:Password" "prod-password" --project RecruitmentPlatform.API
```

**3. Build for Production:**

```bash
cd RecruitmentPlatform.API
dotnet publish -c Release -o ./publish
```

**4. Database Migration:**

```bash
# Generate migration script
dotnet ef migrations script -o migration.sql

# Or apply directly to production database
dotnet ef database update --connection "your-production-connection-string"
```

**5. Deploy to Server:**

Options:
- **IIS:** Configure application pool for .NET 10, deploy published files
- **Azure App Service:** Use Azure CLI or Visual Studio publish
- **Docker:** Create Dockerfile and deploy to container service
- **Linux (systemd):** Configure as systemd service with Kestrel

**6. Configure HTTPS:**

- Obtain SSL certificate (Let's Encrypt, commercial CA)
- Configure Kestrel or reverse proxy (nginx, Apache)
- Enable HTTPS redirection in `Program.cs`

#### Frontend Deployment

**1. Configure Production API URL:**

Create `.env.production`:

```
VITE_API_BASE_URL=https://api.your-domain.com/api
```

Or update `client/src/services/api.js` directly:

```javascript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.your-domain.com/api';
```

**2. Build for Production:**

```bash
cd client
npm run build
```

This creates optimized production files in `client/dist/`.

**3. Deploy Static Files:**

Options:
- **Netlify:** `netlify deploy --prod --dir=dist`
- **Vercel:** `vercel --prod`
- **Azure Static Web Apps:** Use Azure CLI or GitHub Actions
- **AWS S3 + CloudFront:** Upload dist folder to S3 bucket
- **nginx/Apache:** Serve dist folder as static site

**4. Configure SPA Routing:**

For client-side routing, configure server to redirect all routes to `index.html`:

**nginx:**
```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

**IIS (web.config):**
```xml
<rewrite>
  <rules>
    <rule name="React Routes" stopProcessing="true">
      <match url=".*" />
      <conditions logicalGrouping="MatchAll">
        <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
      </conditions>
      <action type="Rewrite" url="/" />
    </rule>
  </rules>
</rewrite>
```

### Environment Variables Checklist

**Backend (Production):**
- [ ] `ConnectionStrings:DefaultConnection` - Production database
- [ ] `Jwt:Key` - Secure secret key
- [ ] `Jwt:Issuer` - Production domain
- [ ] `Jwt:Audience` - Production domain
- [ ] `Mailtrap:Host` - SMTP server
- [ ] `Mailtrap:Port` - SMTP port
- [ ] `Mailtrap:Username` - SMTP username
- [ ] `Mailtrap:Password` - SMTP password
- [ ] `GoogleCalendar:ClientId` - OAuth client ID
- [ ] `GoogleCalendar:ClientSecret` - OAuth client secret
- [ ] `AllowedHosts` - Production domain(s)

**Frontend (Production):**
- [ ] `VITE_API_BASE_URL` - Production API URL

### Security Checklist

- [ ] Change all default passwords
- [ ] Use HTTPS everywhere
- [ ] Enable CORS for specific origins only
- [ ] Set secure JWT expiration (15-60 minutes)
- [ ] Enable rate limiting
- [ ] Configure firewall rules
- [ ] Enable database encryption at rest
- [ ] Use parameterized queries (already implemented with EF Core)
- [ ] Implement logging and monitoring
- [ ] Regular security updates

### Database Backup Strategy

**Automated Backups:**
- SQL Server: Configure automated backup plans
- Azure SQL: Automatic backups enabled by default
- AWS RDS: Configure automated snapshots

**Backup Schedule:**
- Full backup: Daily
- Differential backup: Every 6 hours
- Transaction log backup: Every hour
- Retention: 30 days minimum

### Monitoring & Logging

**Backend Logging:**
- Structured logging with Serilog
- Log files in `/logs` directory
- Rotate logs daily
- Archive after 30 days

**Application Insights (Optional):**
- Install `Microsoft.ApplicationInsights.AspNetCore`
- Configure in `Program.cs`
- Monitor performance, exceptions, dependencies

**Health Checks:**

Add health check endpoint in `Program.cs`:

```csharp
app.MapHealthChecks("/health");
```

Monitor:
- Database connectivity
- External service availability
- Disk space
- Memory usage

---

## 🤝 Contributing

We welcome contributions to the Recruitment Platform! Whether you're fixing bugs, adding features, or improving documentation, your help is appreciated.

### Getting Started

1. **Fork the Repository**

```bash
gh repo fork your-org/recruitment-platform
```

2. **Clone Your Fork**

```bash
git clone https://github.com/YOUR-USERNAME/recruitment-platform.git
cd recruitment-platform
```

3. **Create a Feature Branch**

```bash
git checkout -b feature/your-feature-name
```

### Development Workflow

1. **Make Your Changes**
   - Write clean, readable code
   - Follow existing code style and patterns
   - Add comments for complex logic

2. **Test Your Changes**
   - Test manually in both frontend and backend
   - Verify no console errors
   - Test across different user roles
   - Check responsive design on mobile

3. **Commit Your Changes**

```bash
git add .
git commit -m "feat: add candidate export feature"
```

**Commit Message Convention:**

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting, no logic change)
- `refactor:` Code refactoring
- `test:` Adding or updating tests
- `chore:` Maintenance tasks

4. **Push to Your Fork**

```bash
git push origin feature/your-feature-name
```

5. **Create a Pull Request**
   - Go to the original repository
   - Click "New Pull Request"
   - Select your feature branch
   - Describe your changes clearly
   - Reference any related issues

### Code Style Guidelines

**C# Backend:**
- Follow Microsoft C# coding conventions
- Use meaningful variable and method names
- Keep methods focused and single-purpose
- Use async/await for I/O operations
- Add XML documentation comments for public APIs

**React Frontend:**
- Use functional components with hooks
- Keep components small and focused
- Use descriptive prop names
- Destructure props at the top of components
- Handle loading and error states
- Add PropTypes or TypeScript (future)

**General:**
- Keep files under 300 lines when possible
- Avoid deep nesting (max 3-4 levels)
- Extract reusable logic into separate functions
- Use consistent naming conventions
- Write self-documenting code

### Pull Request Guidelines

**Before Submitting:**
- [ ] Code builds without errors
- [ ] Changes are tested locally
- [ ] No unnecessary console.logs or debugging code
- [ ] Documentation updated if needed
- [ ] Commit messages are clear and descriptive

**PR Description Should Include:**
- What changes were made and why
- How to test the changes
- Screenshots (for UI changes)
- Any breaking changes
- Related issue numbers

### Reporting Issues

**Bug Reports Should Include:**
- Clear description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Screenshots or error messages
- Environment (OS, browser, .NET version)

**Feature Requests Should Include:**
- Clear description of the feature
- Use case and benefits
- Mockups or examples (if applicable)
- Any technical considerations

### Code Review Process

1. Maintainers will review your PR within 2-3 business days
2. Address any feedback or requested changes
3. Once approved, a maintainer will merge your PR
4. Your contribution will be credited in the release notes

### Development Environment Tips

**Backend:**
- Use Visual Studio or Rider for best experience
- Install EF Core tools globally: `dotnet tool install --global dotnet-ef`
- Enable hot reload for faster development
- Use Swagger UI for API testing

**Frontend:**
- Use VS Code with ESLint and Prettier extensions
- Install React DevTools browser extension
- Use Vite DevTools for debugging
- Enable fast refresh for instant feedback

### Questions?

- Open a GitHub Discussion for general questions
- Join our community Slack/Discord (if available)
- Email the maintainers at dev@recruitment-platform.com

---

---

## 🙏 Acknowledgments

- **React Team** - For the amazing React library
- **Microsoft** - For .NET and Entity Framework Core
- **Tailwind Labs** - For TailwindCSS
- **Lucide Icons** - For the beautiful icon library
- **Recharts** - For data visualization components
- **All Contributors** - Thank you for making this project better!

---

## 📞 Support

For support, questions, or feedback:

- **Documentation:** Check this README and linked documentation files
- **Issues:** Open a GitHub issue for bugs or feature requests
- **Discussions:** Use GitHub Discussions for questions

---

**Built with ❤️ by the Recruitment Platform Team**

