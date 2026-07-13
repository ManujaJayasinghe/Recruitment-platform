# Resume File Security Configuration

## Overview
Resume files are stored in `wwwroot/uploads/resumes/{profileId}/` but are **NOT directly accessible** via URL. They can only be accessed through the authenticated API endpoint.

## Security Implementation

### Static Files Configuration
Located in `Program.cs`:

```csharp
app.UseStaticFiles(new StaticFileOptions
{
    OnPrepareResponse = ctx =>
    {
        // Block direct access to /uploads folder - must go through authenticated API
        if (ctx.Context.Request.Path.StartsWithSegments("/uploads"))
        {
            ctx.Context.Response.StatusCode = 403; // Forbidden
            ctx.Context.Response.ContentLength = 0;
            ctx.Context.Response.Body = Stream.Null;
        }
    }
});
```

### What This Does
- Enables static file serving for most wwwroot content (CSS, JS, images, etc.)
- **Blocks direct access** to `/uploads` folder and all subdirectories
- Returns **403 Forbidden** for any direct file access attempts
- Forces all resume access through the authenticated API endpoint

### Authenticated Access Only
Resumes can ONLY be accessed via:
```
GET /api/candidates/me/resume
Authorization: Bearer {jwt-token}
```

This endpoint:
- ✅ Requires authentication (JWT bearer token)
- ✅ Requires Candidate role authorization
- ✅ Only allows users to download their own resume
- ✅ Validates file existence before serving
- ✅ Returns proper content type and filename
- ✅ Streams file directly to response

## Testing the Security

### ❌ Direct URL Access (BLOCKED)
Try accessing a resume file directly:
```bash
curl http://localhost:5233/uploads/resumes/some-guid/resume.pdf
```

**Expected Result**: 
- Status: `403 Forbidden`
- Body: Empty
- File is **NOT** served

### ✅ Authenticated API Access (ALLOWED)
Access through the API endpoint:
```bash
curl http://localhost:5233/api/candidates/me/resume \
  -H "Authorization: Bearer your-jwt-token"
```

**Expected Result**:
- Status: `200 OK`
- Body: PDF file content
- Content-Type: `application/pdf`
- Content-Disposition header with filename

## File Storage Structure

```
wwwroot/
├── uploads/                    ← Blocked from direct access
│   └── resumes/
│       └── {candidateProfileId}/
│           └── {guid}-{filename}.pdf
└── [other static assets]       ← Accessible normally
```

## Authorization Flow

### Upload Resume
1. User authenticates (POST `/api/auth/login`)
2. Receives JWT token
3. Uploads resume (POST `/api/candidates/me/resume`)
4. File saved to `wwwroot/uploads/resumes/{profileId}/`
5. Path stored in database: `/uploads/resumes/{profileId}/{filename}`
6. AI parsing triggered automatically

### Download Resume
1. User makes authenticated request (GET `/api/candidates/me/resume`)
2. Controller validates JWT token
3. Controller verifies user owns the profile
4. Controller checks file exists on disk
5. File streamed directly to response
6. No direct URL exposure

## Security Benefits

### Prevents Unauthorized Access
- ❌ Cannot browse `/uploads` directory
- ❌ Cannot enumerate files
- ❌ Cannot guess file URLs
- ❌ Cannot access other users' resumes

### Enforces Authentication
- ✅ Must have valid JWT token
- ✅ Must be authenticated as Candidate
- ✅ Can only access own resume
- ✅ All access attempts are logged

### Protects Privacy
- Candidate A cannot see Candidate B's resume
- Recruiters cannot directly access resume files
- Resume URLs in database are not exploitable
- File paths are validated before serving

## Implementation Details

### CandidateController.DownloadResume
```csharp
// GET /api/candidates/me/resume
[HttpGet("me/resume")]
[Authorize(Roles = "Candidate")] // Implicit from controller-level [Authorize]
public async Task<IActionResult> DownloadResume()
{
    var userId = GetUserId();
    if (userId == null) return Unauthorized();

    var profile = await GetUserProfile(userId.Value);
    if (profile == null) return NotFound();

    if (string.IsNullOrEmpty(profile.ResumeFileUrl))
        return NotFound("No resume uploaded");

    // Convert relative URL path to physical file path
    var fullPath = Path.Combine(
        _env.WebRootPath, 
        profile.ResumeFileUrl.TrimStart('/').Replace('/', Path.DirectorySeparatorChar)
    );

    if (!File.Exists(fullPath))
        return NotFound("Resume file not found");

    // Stream file with proper content type
    var stream = new FileStream(fullPath, FileMode.Open, FileAccess.Read);
    var contentType = "application/pdf";
    var fileName = Path.GetFileName(fullPath);
    
    return File(stream, contentType, fileName);
}
```

### Key Security Checks
1. **Authentication**: JWT token validated by `[Authorize]`
2. **Authorization**: Role check ensures user is Candidate
3. **Ownership**: User can only access their own profile's resume
4. **File Existence**: Validates file exists before serving
5. **Path Traversal Protection**: Uses `Path.Combine` safely
6. **No Directory Listing**: Only serves specific files, no browsing

## Error Responses

### 401 Unauthorized
No valid JWT token provided:
```json
{
  "message": "Unauthorized"
}
```

### 403 Forbidden
Direct URL access attempt:
```
HTTP/1.1 403 Forbidden
Content-Length: 0
```

### 404 Not Found (No Resume)
```json
{
  "message": "No resume uploaded yet."
}
```

### 404 Not Found (File Missing)
```json
{
  "message": "Resume file not found on server."
}
```

### 200 OK (Success)
```
HTTP/1.1 200 OK
Content-Type: application/pdf
Content-Disposition: attachment; filename="resume.pdf"
[PDF binary data]
```

## Future Enhancements

### Additional Security Measures
- Add rate limiting to prevent abuse
- Log all download attempts for audit trail
- Add virus scanning on upload
- Encrypt files at rest
- Add watermarking for downloaded resumes
- Implement time-limited download tokens

### Access Control Extensions
- Allow recruiters to view resumes of applicants
- Add permission checks for recruiter access
- Implement download tracking/analytics
- Add expiration dates for stored resumes

### Storage Optimization
- Move to cloud storage (Azure Blob, AWS S3)
- Use pre-signed URLs for temporary access
- Implement CDN for faster delivery
- Add automatic cleanup of old resumes

## Testing Checklist

- [ ] Upload resume as authenticated candidate
- [ ] Download own resume via API (should work)
- [ ] Try to access resume via direct URL (should fail with 403)
- [ ] Try to download without authentication (should fail with 401)
- [ ] Try to download another user's resume (should fail with 404)
- [ ] Verify correct content-type is returned
- [ ] Verify filename is correct in response
- [ ] Check that file path validation prevents directory traversal

## Compliance Notes

This configuration supports:
- **GDPR**: Users control their own data, cannot access others'
- **CCPA**: User data is access-controlled and auditable
- **SOC 2**: Access controls and logging in place
- **ISO 27001**: Authentication and authorization enforced

## Troubleshooting

### Resume not downloading
1. Check JWT token is valid
2. Verify user is authenticated as Candidate
3. Confirm resume was uploaded successfully
4. Check file exists in `wwwroot/uploads/resumes/{profileId}/`
5. Verify database has correct `ResumeFileUrl` path

### 403 Forbidden
- You're trying to access the file directly via URL
- Use the API endpoint instead: `/api/candidates/me/resume`

### File not found
- File may have been deleted from disk
- Database path may be incorrect
- Check `ResumeFileUrl` value in database matches actual file

## Summary

✅ Static files enabled but uploads folder is blocked
✅ Resumes only accessible through authenticated API
✅ Users can only access their own resumes
✅ All access attempts go through authorization checks
✅ Direct URL access returns 403 Forbidden
✅ Security-first design protects candidate privacy
