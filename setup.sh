#!/bin/bash

echo "🚀 Setting up RTI Assistant Application..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm are installed"

# Setup Backend
echo "📦 Setting up Backend..."
cd backend

# Install backend dependencies
echo "Installing backend dependencies..."
npm install

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating .env file..."
    cat > .env << EOF
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb+srv://manikandan:Mani195@cluster0.wstb33p.mongodb.net/rti-assistant

# JWT Configuration
JWT_SECRET=rti-assistant-super-secret-jwt-key-2024
JWT_EXPIRE=7d

# Session Configuration
SESSION_SECRET=rti-assistant-super-secret-session-key-2024

# Gemini AI API
GEMINI_API_KEY=AIzaSyBY--u_NqC9S8oMIiaBjVn8xTAdzJgYwQY

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
EOF
    echo "✅ .env file created"
else
    echo "✅ .env file already exists"
fi

# Create upload directories
echo "Creating upload directories..."
mkdir -p uploads/audio uploads/documents uploads/images exports/pdf exports/word

echo "✅ Backend setup complete"

# Setup Frontend
echo "📦 Setting up Frontend..."
cd ../frontend

# Install frontend dependencies
echo "Installing frontend dependencies..."
npm install

echo "✅ Frontend setup complete"

echo ""
echo "🎉 Setup Complete!"
echo ""
echo "📋 To run the application:"
echo ""
echo "Backend:"
echo "  cd backend"
echo "  npm run seed    # Seed initial templates (run once)"
echo "  npm run dev     # Start backend server"
echo ""
echo "Frontend:"
echo "  cd frontend"
echo "  npm run dev     # Start frontend server"
echo ""
echo "🌐 Application will be available at:"
echo "  Frontend: http://localhost:3000"
echo "  Backend:  http://localhost:5000"
echo ""
echo "📚 API Documentation: http://localhost:5000/api/health"
