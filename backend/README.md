# RTI Assistant Backend

A comprehensive backend API for the RTI Assistant application, built with Node.js, Express.js, MongoDB, and integrated with Google's Gemini AI for intelligent RTI application generation.

## Features

- 🔐 **Authentication & Authorization**: JWT-based authentication with cookies and sessions
- 🤖 **AI-Powered RTI Generation**: Integration with Google Gemini AI for intelligent text generation
- 🎤 **Audio Processing**: Voice-to-text conversion with language detection
- 📄 **Multiple Export Formats**: PDF and Word document generation
- 🗄️ **MongoDB Integration**: Robust data storage with Mongoose ODM
- 📊 **Template System**: Pre-built templates for common RTI requests
- 📁 **File Management**: Upload and manage documents, images, and audio files
- 🔒 **Security**: Rate limiting, input validation, and secure file handling

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT with bcryptjs
- **AI Integration**: Google Gemini API
- **PDF Generation**: Puppeteer
- **Word Generation**: docx
- **File Upload**: Multer
- **Validation**: express-validator

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd rti-assistant/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development

   # Database
   MONGODB_URI=mongodb+srv://manikandan:Mani195@cluster0.wstb33p.mongodb.net/rti-assistant

   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRE=7d

   # Session Configuration
   SESSION_SECRET=your-super-secret-session-key

   # Gemini AI API
   GEMINI_API_KEY=AIzaSyBY--u_NqC9S8oMIiaBjVn8xTAdzJgYwQY

   # Frontend URL
   FRONTEND_URL=http://localhost:3000
   ```

4. **Seed initial data**
   ```bash
   npm run seed
   ```

5. **Start the server**
   ```bash
   # Development
   npm run dev

   # Production
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/password` - Change password

### RTI Applications
- `GET /api/rti` - Get user's RTI applications
- `GET /api/rti/:id` - Get specific RTI application
- `POST /api/rti/generate` - Generate RTI from text
- `POST /api/rti/generate-audio` - Generate RTI from audio
- `POST /api/rti/from-template` - Generate RTI from template
- `PUT /api/rti/:id` - Update RTI application
- `DELETE /api/rti/:id` - Delete RTI application
- `POST /api/rti/:id/submit` - Submit RTI application

### Templates
- `GET /api/templates` - Get all templates
- `GET /api/templates/:id` - Get specific template
- `GET /api/templates/categories` - Get template categories
- `POST /api/templates/:id/rate` - Rate template

### File Management
- `POST /api/upload/documents` - Upload documents
- `POST /api/upload/images` - Upload images
- `DELETE /api/upload/:rtiId/file/:fileId` - Delete file
- `GET /api/upload/:rtiId/files` - Get files for RTI

### Export
- `POST /api/export/pdf/:id` - Export RTI as PDF
- `POST /api/export/word/:id` - Export RTI as Word
- `GET /api/export/info/:fileName` - Get export file info
- `GET /api/export/download/:fileName` - Download export file

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/dashboard` - Get dashboard data
- `GET /api/users/activity` - Get user activity

## Database Models

### User Model
- Personal information (name, email, phone, address)
- Authentication data (password, login tracking)
- Preferences (language, notifications)
- Profile settings

### RTIApplication Model
- Application details (title, description, content)
- Metadata (generation method, AI model, timestamps)
- Status tracking (draft, submitted, responded, etc.)
- File attachments and submissions

### Template Model
- Template content and variables
- Category and language support
- Usage statistics and ratings
- Popularity tracking

## AI Integration

### Gemini AI Features
- **Text Generation**: Convert user queries to proper RTI format
- **Audio Transcription**: Convert audio files to text
- **Language Detection**: Automatically detect input language
- **Template Processing**: Generate RTI from templates with variables

### Supported Languages
- English
- Hindi (हिंदी)
- Bengali (বাংলা)
- Tamil (தமிழ்)
- Telugu (తెలుగు)
- Marathi (मराठी)
- Gujarati (ગુજરાતી)

## File Handling

### Supported Audio Formats
- MP3, WAV, OGG, WebM, M4A, AAC

### Supported Document Formats
- PDF, DOC, DOCX, TXT, RTF

### Supported Image Formats
- JPEG, PNG, GIF, WebP

### File Size Limits
- Maximum file size: 10MB
- Maximum files per request: 5

## Security Features

- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Input Validation**: Comprehensive validation using express-validator
- **File Type Validation**: Strict file type checking
- **Authentication**: JWT with secure cookies
- **CORS**: Configured for frontend domain
- **Helmet**: Security headers

## Development

### Scripts
```bash
npm run dev      # Start development server with nodemon
npm start        # Start production server
npm test         # Run tests
npm run seed     # Seed initial template data
```

### Project Structure
```
backend/
├── models/          # MongoDB models
├── routes/          # API route handlers
├── middleware/      # Custom middleware
├── services/        # Business logic services
├── scripts/         # Database seeding scripts
├── uploads/         # File upload directory
├── exports/         # Generated export files
└── server.js        # Main server file
```

## Deployment

### Environment Variables
Ensure all required environment variables are set in production:
- Database connection string
- JWT and session secrets
- Gemini API key
- Frontend URL for CORS

### Production Considerations
- Use PM2 or similar process manager
- Set up reverse proxy (nginx)
- Configure SSL certificates
- Set up monitoring and logging
- Regular database backups

## API Documentation

The API follows RESTful conventions with JSON responses. All endpoints return standardized response format:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "count": 10
}
```

Error responses:
```json
{
  "success": false,
  "message": "Error description",
  "errors": [ ... ]
}
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For support and questions, please contact the development team or create an issue in the repository.
