#!/bin/bash

echo "🚀 Starting Lumira Payment System Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "docker-compose.yml" ]; then
    print_error "docker-compose.yml not found. Please run this script from the project root."
    exit 1
fi

print_status "Checking environment configuration..."

# Check backend environment
if [ ! -f "apps/api-backend/.env" ]; then
    print_warning "Backend .env file not found. Creating from example..."
    if [ -f "apps/api-backend/.env.example" ]; then
        cp apps/api-backend/.env.example apps/api-backend/.env
        print_status "Please configure your .env file with proper values"
    else
        print_error "No .env.example found in backend"
    fi
fi

# Check frontend environment
if [ ! -f "apps/main-app/.env" ]; then
    print_warning "Frontend .env file not found. Creating from example..."
    if [ -f "apps/main-app/.env.example" ]; then
        cp apps/main-app/.env.example apps/main-app/.env
        print_status "Please configure your .env file with proper values"
    else
        print_error "No .env.example found in frontend"
    fi
fi

print_status "Building backend..."
cd apps/api-backend
if npm run build; then
    print_success "Backend build completed"
else
    print_error "Backend build failed"
    exit 1
fi
cd ../..

print_status "Building frontend..."
cd apps/main-app
if npm run build; then
    print_success "Frontend build completed"
else
    print_error "Frontend build failed"
    exit 1
fi
cd ../..

print_status "Building expert desk..."
cd apps/expert-desk
if npm run build; then
    print_success "Expert desk build completed"
else
    print_error "Expert desk build failed"
    exit 1
fi
cd ../..

print_status "Starting Docker services..."
if docker-compose up --build -d; then
    print_success "Docker services started successfully"
else
    print_error "Docker services failed to start"
    exit 1
fi

print_success "🎉 Deployment completed successfully!"
print_status "Services are running at:"
print_status "  - Main App: http://localhost:80"
print_status "  - Expert Desk: http://localhost:3002"
print_status "  - API Backend: http://localhost:3001"

print_status "To view logs: docker-compose logs -f"
print_status "To stop services: docker-compose down"
