# OpenAI Integration Setup

## Overview
The OpenAI .NET SDK has been integrated into the RecruitmentPlatform solution for AI-powered features like resume parsing, embeddings, and chat completions.

## Configuration

### Model Configuration (appsettings.json)
The following models are configured in `appsettings.json`:
- **ChatModel**: `gpt-4o-mini` (used for resume parsing and chat completions)
- **EmbeddingModel**: `text-embedding-3-small` (used for generating embeddings)

### API Key Setup (User Secrets)
**IMPORTANT**: The OpenAI API key is NOT stored in appsettings.json for security reasons.

Run the following commands to set up your API key locally:

```bash
# Navigate to the API project directory
cd RecruitmentPlatform.API

# Initialize user secrets (if not already done)
dotnet user-secrets init

# Set your OpenAI API key
dotnet user-secrets set "OpenAI:ApiKey" "your-actual-openai-api-key-here"
```

Replace `your-actual-openai-api-key-here` with your real OpenAI API key.

### Verify Configuration
After setting the secret, you can list all secrets to verify:
```bash
dotnet user-secrets list
```

## Implementation Details

### Interface: IAIService
Located in `RecruitmentPlatform.Application/Interfaces/IAIService.cs`

Methods:
- `Task<string> ParseResumeAsync(string resumeText)` - Extracts structured information from resume text
- `Task<float[]> GetEmbeddingAsync(string text)` - Generates embeddings for semantic search
- `Task<string> GenerateChatResponseAsync(string systemPrompt, string userMessage)` - General-purpose chat completions

### Implementation: OpenAIService
Located in `RecruitmentPlatform.Infrastructure/Services/OpenAIService.cs`

Features:
- Reads API key from configuration (user secrets in development, environment variables in production)
- Reads model names from appsettings.json
- Comprehensive error handling and logging
- Throws helpful exception if API key is not configured

### Resume Parsing Service
Located in `RecruitmentPlatform.Infrastructure/Services/ResumeParsingService.cs`

**Package Used**: PdfPig v0.1.15 (lightweight PDF text extraction)

**Process Flow**:
1. Extracts raw text from uploaded PDF using PdfPig
2. Sends text to IAIService.ParseResumeAsync with strict JSON prompt
3. Parses JSON response with error handling for invalid formats
4. Updates CandidateProfile with extracted data:
   - Skills list
   - YearsOfExperience
   - ParsedResumeJson (stores raw AI response)
   - Summary (if profile summary is empty)

**Expected JSON Format**:
```json
{
  "skills": ["C#", ".NET", "SQL", "..."],
  "yearsOfExperience": 5,
  "education": ["Bachelor's in Computer Science", "..."],
  "summary": "Experienced software developer with..."
}
```

**Error Handling**:
- If PDF text extraction fails → logs warning, returns error but doesn't crash upload
- If AI returns invalid JSON → logs raw response, returns error with details
- If candidate profile not found → returns error
- Upload always succeeds; parsing failure is graceful

**Integration**: 
- Wired into `POST /api/candidates/me/resume` endpoint
- **Execution Mode**: Synchronous - response includes parsed data immediately
- Response includes both upload success and parsing results
- If parsing fails, upload still succeeds with helpful error message

### Dependency Injection
Registered in `Program.cs`:
```csharp
builder.Services.AddSingleton<IAIService, OpenAIService>();
builder.Services.AddScoped<ResumeParsingService>();
```

## API Response Format

### Successful Upload with Successful Parsing
```json
{
  "resumeUrl": "/uploads/resumes/{profileId}/{filename}.pdf",
  "parsed": {
    "success": true,
    "skills": ["C#", ".NET", "SQL"],
    "yearsOfExperience": 5,
    "education": ["Bachelor's in Computer Science"],
    "summary": "Experienced software developer..."
  }
}
```

### Successful Upload with Parsing Failure
```json
{
  "resumeUrl": "/uploads/resumes/{profileId}/{filename}.pdf",
  "parsed": {
    "success": false,
    "error": "AI returned invalid JSON format",
    "message": "Resume uploaded successfully but AI parsing encountered an error. You can still manually update your profile."
  }
}
```

## Production Deployment

For production environments, set the OpenAI API key as an environment variable:
```bash
# Linux/Mac
export OpenAI__ApiKey="your-production-api-key"

# Windows
set OpenAI__ApiKey=your-production-api-key

# Or use Azure App Service Configuration, AWS Secrets Manager, etc.
```

Note the double underscore (`__`) in environment variable names replaces the colon (`:`) used in configuration keys.

## Package Information
- **OpenAI SDK**: OpenAI v2.12.0 (Official .NET SDK)
  - NuGet: https://www.nuget.org/packages/OpenAI/
- **PDF Library**: PdfPig v0.1.15 (Lightweight PDF text extraction)
  - NuGet: https://www.nuget.org/packages/PdfPig/

## Security Notes
- ✅ API key stored in user secrets (development)
- ✅ API key never committed to source control
- ✅ Configuration separated from sensitive credentials
- ✅ Clear error message if API key is missing
- ✅ Graceful degradation if AI parsing fails
