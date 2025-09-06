# PowerShell deployment script for Lumira Payment System
param(
    [switch]$SkipBuild,
    [switch]$Development
)

Write-Host "🚀 Starting Lumira Payment System Deployment..." -ForegroundColor Cyan

function Write-Status {
    param($Message)
    Write-Host "[INFO] $Message" -ForegroundColor Blue
}

function Write-Success {
    param($Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Warning {
    param($Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param($Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# Check if we're in the right directory
if (-not (Test-Path "docker-compose.yml")) {
    Write-Error "docker-compose.yml not found. Please run this script from the project root."
    exit 1
}

Write-Status "Checking environment configuration..."

# Check backend environment
if (-not (Test-Path "apps/api-backend/.env")) {
    Write-Warning "Backend .env file not found. Creating from example..."
    if (Test-Path "apps/api-backend/.env.example") {
        Copy-Item "apps/api-backend/.env.example" "apps/api-backend/.env"
        Write-Status "Please configure your .env file with proper values"
    } else {
        Write-Error "No .env.example found in backend"
    }
}

# Check frontend environment
if (-not (Test-Path "apps/main-app/.env")) {
    Write-Warning "Frontend .env file not found. Creating from example..."
    if (Test-Path "apps/main-app/.env.example") {
        Copy-Item "apps/main-app/.env.example" "apps/main-app/.env"
        Write-Status "Please configure your .env file with proper values"
    } else {
        Write-Error "No .env.example found in frontend"
    }
}

if (-not $SkipBuild) {
    Write-Status "Installing backend dependencies..."
    Set-Location "apps/api-backend"
    try {
        npm install
        Write-Success "Backend dependencies installed"
    }
    catch {
        Write-Error "Failed to install backend dependencies: $_"
        exit 1
    }
    
    Write-Status "Building backend..."
    try {
        npm run build
        Write-Success "Backend build completed"
    }
    catch {
        Write-Error "Backend build failed: $_"
        exit 1
    }
    Set-Location "../.."

    Write-Status "Installing frontend dependencies..."
    Set-Location "apps/main-app"
    try {
        npm install
        Write-Success "Frontend dependencies installed"
    }
    catch {
        Write-Error "Failed to install frontend dependencies: $_"
        exit 1
    }
    
    Write-Status "Building frontend..."
    try {
        npm run build
        Write-Success "Frontend build completed"
    }
    catch {
        Write-Error "Frontend build failed: $_"
        Set-Location "../.."
        exit 1
    }
    Set-Location "../.."

    Write-Status "Installing expert desk dependencies..."
    Set-Location "apps/expert-desk"
    try {
        npm install
        Write-Success "Expert desk dependencies installed"
    }
    catch {
        Write-Error "Failed to install expert desk dependencies: $_"
        exit 1
    }
    
    Write-Status "Building expert desk..."
    try {
        npm run build
        Write-Success "Expert desk build completed"
    }
    catch {
        Write-Error "Expert desk build failed: $_"
        exit 1
    }
    Set-Location "../.."
}

Write-Status "Checking Docker..."
try {
    docker --version | Out-Null
    docker-compose --version | Out-Null
    Write-Success "Docker and Docker Compose are available"
}
catch {
    Write-Error "Docker or Docker Compose not found. Please install Docker Desktop."
    exit 1
}

Write-Status "Starting Docker services..."
try {
    if ($Development) {
        docker-compose -f docker-compose.yml up --build -d
    } else {
        docker-compose up --build -d
    }
    Write-Success "Docker services started successfully"
}
catch {
    Write-Error "Docker services failed to start: $_"
    exit 1
}

Write-Status "Waiting for services to be ready..."
Start-Sleep -Seconds 10

Write-Status "Checking service health..."
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/health" -UseBasicParsing -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Success "Backend API is healthy"
    }
}
catch {
    Write-Warning "Backend API health check failed: $_"
}

Write-Success "🎉 Deployment completed successfully!"
Write-Status "Services are running at:"
Write-Host "  - Main App: http://localhost:80" -ForegroundColor Cyan
Write-Host "  - Expert Desk: http://localhost:3002" -ForegroundColor Cyan
Write-Host "  - API Backend: http://localhost:3001" -ForegroundColor Cyan

Write-Status "Useful commands:"
Write-Host "  - View logs: docker-compose logs -f" -ForegroundColor Gray
Write-Host "  - Stop services: docker-compose down" -ForegroundColor Gray
Write-Host "  - Restart services: docker-compose restart" -ForegroundColor Gray
Write-Host "  - View running containers: docker ps" -ForegroundColor Gray

if ($Development) {
    Write-Status "Running in development mode with hot reload enabled"
}
