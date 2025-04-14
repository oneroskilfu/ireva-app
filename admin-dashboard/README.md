# REVA Admin Dashboard

This admin dashboard is designed for managing the REVA Real Estate Investment Platform. It provides administrators with tools to manage users, properties, investments, developers, and KYC verifications.

## Features

- **User Management**: View, add, and manage user accounts
- **Property Management**: Add, edit, and delete property listings
- **Investment Tracking**: Monitor and manage all investment activities
- **KYC Verification**: Approve or reject KYC requests from users
- **Developer Management**: Manage property developers on the platform
- **Dashboard Analytics**: View platform statistics and performance metrics

## Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for Authentication
- bcrypt.js for password hashing

### Frontend
- React.js
- React Router for navigation
- Axios for API requests
- React Icons
- Chart.js for analytics visualizations

## Project Structure

```
reva-admin-dashboard/
├── client/                # Frontend React app
│   ├── public/
│   └── src/
│       ├── components/    # Reusable UI components
│       ├── context/       # React context for state management
│       ├── hooks/         # Custom React hooks
│       ├── pages/         # Page components
│       └── utils/         # Helper functions
├── controllers/           # API route controllers
├── middleware/            # Express middleware
├── models/                # Mongoose models
├── routes/                # API routes
├── utils/                 # Utility functions
├── server.js              # Express server entry point
└── package.json           # Dependencies
```

## Setup and Installation

### Prerequisites
- Node.js (v14 or later)
- MongoDB

### Installation Steps

1. Clone the repository
```
git clone <repository-url>
cd reva-admin-dashboard
```

2. Install server dependencies
```
npm install
```

3. Install client dependencies
```
cd client
npm install
cd ..
```

4. Create a `.env` file in the root directory with the following variables:
```
PORT=5000
MONGO_URI=<your-mongodb-connection-string>
JWT_SECRET=<your-jwt-secret>
NODE_ENV=development
```

5. Seed the database with sample data
```
node utils/seeder.js
```

6. Run the development server
```
npm run dev
```

This will start both the backend server and the React frontend concurrently.

## API Endpoints

### Authentication
- `POST /api/admin/login` - Admin login

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Properties
- `GET /api/properties` - Get all properties
- `GET /api/properties/:id` - Get property by ID
- `POST /api/properties` - Create new property
- `PUT /api/properties/:id` - Update property
- `DELETE /api/properties/:id` - Delete property

### Investments
- `GET /api/investments` - Get all investments
- `GET /api/investments/:id` - Get investment by ID
- `POST /api/investments` - Create new investment
- `PUT /api/investments/:id` - Update investment
- `DELETE /api/investments/:id` - Delete investment

### Developers
- `GET /api/developers` - Get all developers
- `GET /api/developers/:id` - Get developer by ID
- `POST /api/developers` - Create new developer
- `PUT /api/developers/:id` - Update developer
- `DELETE /api/developers/:id` - Delete developer

### KYC Management
- `GET /api/admin/kyc` - Get all pending KYC requests
- `PUT /api/admin/kyc/:id/approve` - Approve KYC request
- `PUT /api/admin/kyc/:id/reject` - Reject KYC request

### Dashboard Analytics
- `GET /api/admin/dashboard` - Get dashboard statistics
- `GET /api/admin/user-growth` - Get user growth data
- `GET /api/admin/investment-trends` - Get investment trend data

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.