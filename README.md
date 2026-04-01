# LaConslaNet

A social media/community platform for students with features like posts, messaging, notifications, and more.

## Features

- User Authentication (Login/Register)
- User Profiles with Avatars
- Home Posts & Feed
- Real-time Messaging
- Notifications System
- Lost & Found Posts
- School News
- Birthday Greetings
- Announcements
- Comments & Likes
- Admin Dashboard
- Department-specific Pages (CITE, CBEA, CAMP, etc.)

## Tech Stack

**Backend:**

- Node.js
- Express.js
- MongoDB with Mongoose
- Socket.IO for real-time features
- JWT for authentication

**Frontend:**

- HTML5, CSS3, JavaScript
- Socket.IO Client

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/cedmanucdocae/LaConslaNet.git
   cd LaConslaNet
   ```

2. **Backend Setup**

   ```bash
   cd backend
   npm install
   ```

3. **Configure Shared Environment Variables**

   From the project root, copy the shared environment file and update values:

   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your configuration (this is the only env file used):

   ```env
   NODE_ENV=development
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/LaConslaNet
   JWT_SECRET=your_secure_secret_key_here
   FRONTEND_URL=http://127.0.0.1:5500,http://localhost:5500,http://127.0.0.1:5501,http://localhost:5501
   FRONTEND_PORT=5500
   API_BASE_URL=http://localhost:5500
   ```

   **Important:** Generate a secure JWT secret:

   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

4. **Start MongoDB**

   Make sure MongoDB is running on your machine or update `MONGO_URI` with your MongoDB Atlas connection string.

5. **Start the Backend Server**

   ```bash
   npm start
   # or for development with auto-restart
   npm run dev
   ```

6. **Frontend Setup**

   Open the frontend with a local server (VS Code Live Server recommended):
   - Install "Live Server" extension in VS Code
   - Right-click on `frontend/index.html` → "Open with Live Server"

   `frontend/index.html` now redirects to `frontend/Login/index.html` so login loads first.

   Or use any local server:

   ```bash
   npx serve frontend -p 5501
   ```

7. **Update Frontend Configuration** (if deploying)

   Use `.env` value `API_BASE_URL` for Docker runtime config, or edit `frontend/runtime-config.js` for non-Docker static hosting.

### Docker Setup (Backend + Frontend + MongoDB)

1. **Create root env file**

   ```bash
   cp .env.example .env
   ```

2. **Start all services**

   ```bash
   docker compose up --build
   ```

3. **Open the app**

   Frontend: `http://localhost:5500`

   Backend and MongoDB are internal-only in Docker and are not exposed to host ports.

### Docker Hub Workflow

GitHub Actions workflow is available at `.github/workflows/dockerhub.yml`.

- Trigger: push to `main` or manual run
- Required secrets: `DOCKER_USERNAME`, `DOCKER_PASSWORD`
- Published images:
  - `<DOCKER_USERNAME>/laconslanet-backend`
  - `<DOCKER_USERNAME>/laconslanet-frontend`

## Project Structure

```
LaConslaNet/
├── backend/
│   ├── controllers/    # Route handlers
│   ├── middleware/     # Auth & upload middleware
│   ├── models/         # Mongoose schemas
│   ├── routes/         # API routes
│   ├── utils/          # Helper functions
│   ├── uploads/        # User uploaded files
│   ├── server.js       # Main server file
│   └── package.json
├── frontend/
│   ├── AdminDashboard/ # Admin pages
│   ├── Login/          # Login page
│   ├── Register/       # Registration page
│   ├── Webpage/        # Main application pages
│   │   ├── Homepage/
│   │   ├── Profile/
│   │   ├── Mess1/      # Messaging
│   │   └── [Departments]/
│   ├── shared/         # Shared components
│   ├── config.js       # Frontend configuration
│   └── index.html
├── .gitignore
└── README.md
```

## API Endpoints

| Method | Endpoint           | Description              |
| ------ | ------------------ | ------------------------ |
| POST   | /api/auth/register | Register new user        |
| POST   | /api/auth/login    | User login               |
| GET    | /api/profile/me    | Get current user profile |
| GET    | /api/homeposts     | Get all home posts       |
| POST   | /api/homeposts     | Create new post          |
| GET    | /api/notifications | Get user notifications   |
| GET    | /api/messages      | Get conversations        |
| ...    | ...                | ...                      |

## Security Best Practices

- Never commit `.env` files containing real credentials
- Use strong, unique JWT secrets in production
- Keep dependencies updated
- Use HTTPS in production
- Validate all user inputs
- Sanitize data before database operations

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.

## Authors

- Ced Manucdoc - [GitHub](https://github.com/cedmanucdocae)
