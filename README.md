Hinglaj Sweets & Namkeen - E-Commerce Web Application
A full-stack web application for Hinglaj Sweets & Namkeen, a traditional Indian sweets and namkeen (savory snacks) shop. This project serves as a learning platform for web development while creating a functional e-commerce solution.

🍯 Project Overview
This application provides a complete digital storefront for a traditional sweets shop, featuring product browsing, cart management, order processing, and administrative controls. The project demonstrates modern web development practices with a React frontend and Node.js backend.

✨ Features
Customer Features
Product Catalog: Browse traditional sweets and namkeens with detailed descriptions

Shopping Cart: Add items with different variants and manage quantities

User Authentication: Secure login and registration system

Order Management: Place orders and track order history

Responsive Design: Optimized for desktop and mobile devices

Admin Features
Product Management: Add, edit, and manage product inventory

Order Tracking: View and manage customer orders

Customer Management: Access customer information and order history

Admin Dashboard: Comprehensive administrative interface

🛠️ Technology Stack
Frontend (Client)
React 19 - Modern UI library with hooks and context

React Router DOM - Client-side routing

Axios - HTTP client for API communication

Vite - Fast build tool and development server

CSS3 - Custom styling with responsive design

Backend (Server)
Node.js - Server runtime environment

Express.js - Web application framework

Sequelize - PostgreSQL ORM

JWT - JSON Web Token authentication

bcryptjs - Password hashing

Multer - File upload handling

Database
PostgreSQL - Primary database for production

SQLite3 - Development database option

DevOps & Tools
Docker - Containerization with docker-compose

ESLint - Code linting and formatting

Vitest - Testing framework

Nodemon - Development server auto-reload

📁 Project Structure
text
webpage-for-hinglaj/
├── client/                 # React frontend application
│   ├── src/
│   │   ├── components/     # Reusable React components
│   │   ├── context/        # React Context (CartContext)
│   │   ├── pages/          # Page components
│   │   ├── services/       # API service functions
│   │   ├── App.jsx         # Main application component
│   │   ├── auth.js         # Authentication utilities
│   │   └── styles.css      # Application styles
│   ├── index.html          # HTML entry point
│   ├── package.json        # Frontend dependencies
│   └── vite.config.js      # Vite configuration
├── server/                 # Node.js backend application
│   ├── src/
│   │   ├── config/         # Database and app configuration
│   │   ├── middleware/     # Express middleware
│   │   ├── models/         # Sequelize database models
│   │   ├── routes/         # API route handlers
│   │   ├── scripts/        # Database and admin scripts
│   │   └── index.js        # Server entry point
│   ├── uploads/            # File upload directory
│   ├── .env.example        # Environment variables template
│   └── package.json        # Backend dependencies
├── docker-compose.yml      # Docker services configuration
└── test-api.js            # API testing utilities
🚀 Getting Started
Prerequisites
Node.js (v18 or higher)

npm or yarn

PostgreSQL (for production)

Docker and Docker Compose (optional)

Installation & Setup
Option 1: Docker Setup (Recommended)
Clone the repository:

bash
git clone https://github.com/Smitkhatri2007/webpage-for-hinglaj.git
cd webpage-for-hinglaj
Run with Docker Compose:

bash
docker-compose up --build
Access the application:

Frontend: http://localhost:5173

Backend API: http://localhost:4000

Database: PostgreSQL on port 5432

Option 2: Manual Setup
Backend Setup:

bash
cd server
npm install
cp .env.example .env
# Edit .env with your database configuration
npm run db:migrate
npm run seed:admin
npm run dev
Frontend Setup:

bash
cd client
npm install
npm run dev
Environment Configuration
Create a .env file in the server directory:

text
NODE_ENV=development
PORT=4000
JWT_SECRET=your-secret-key
DB_HOST=localhost
DB_PORT=5432
DB_NAME=order_tracking
DB_USER=postgres
DB_PASS=your-password
DB_SSL=false
🎯 Available Scripts
Client Scripts
npm run dev - Start development server

npm run build - Build for production

npm run preview - Preview production build

npm run lint - Run ESLint

npm test - Run tests

Server Scripts
npm run dev - Start development server with nodemon

npm start - Start production server

npm run db:migrate - Run database migrations

npm run make:admin - Create admin user

npm run seed:admin - Seed admin data

npm test - Run tests

🔐 Authentication & Security
JWT-based authentication for secure user sessions

Password hashing with bcryptjs

Role-based access control (Customer/Admin)

Protected API routes with middleware validation

CORS configuration for secure cross-origin requests

📱 Key Components
Frontend Pages
Home: Product slideshow and welcome section

Items: Product catalog with filtering

Cart: Shopping cart management

Orders: Order history and tracking

Admin: Administrative dashboard

Login/Register: User authentication

Backend Models
User: Customer and admin user management

Item: Product catalog with variants

Order: Order processing and tracking

🌟 Learning Objectives
This project demonstrates:

Full-stack JavaScript development

Modern React patterns (Hooks, Context API, Router)

RESTful API design with Express.js

Database modeling with Sequelize ORM

Authentication and authorization

File upload handling

Containerization with Docker

Testing strategies for both frontend and backend

🤝 Contributing
This is a learning project. Contributions and suggestions are welcome:

Fork the repository

Create a feature branch

Make your changes

Add tests if applicable

Submit a pull request

📄 License
This project is created for educational purposes. Feel free to use it as a learning resource.

🔗 Contact
Developer: Smitkhatri2007
Repository: webpage-for-hinglaj

