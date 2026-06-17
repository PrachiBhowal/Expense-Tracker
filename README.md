# Expense Tracker

A full-stack web application for tracking expenses and managing subscriptions with email verification and password reset functionality.

## Features

- 🔐 User authentication with email verification
- 💰 Expense tracking and categorization
- 📊 Data visualization with charts (Pie, Bar, Line)
- 📅 Subscription management
- 🔄 Password reset functionality
- 🎨 Beautiful UI with Tailwind CSS and Framer Motion animations
- 🔒 Secure session management with bcrypt password hashing

## Tech Stack

### Frontend
- **React** - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Recharts** - Data visualization

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **bcryptjs** - Password hashing
- **express-session** - Session management
- **jsonwebtoken** - Token-based auth
- **nodemailer** - Email sending

## Prerequisites

- **Node.js** (v14 or higher)
- **npm** or **yarn**
- **MongoDB** (local or MongoDB Atlas connection string)
- **Email service** (Gmail, Outlook, or other SMTP provider)

## Installation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd expense-tracker
```

### 2. Setup Backend

```bash
cd server
npm install
```

Create a `.env` file in the `server` directory:
```env
MONGO_URI=mongodb://localhost:27017/expense-tracker
PORT=5000
JWT_SECRET=your-super-secret-jwt-key-change-this
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
```

**Note:** For Gmail, use an [App-specific password](https://support.google.com/accounts/answer/185833).

### 3. Setup Frontend

```bash
cd ../client
npm install
```

Create a `.env.local` file in the `client` directory (optional, if backend is on different host):
```env
VITE_API_URL=http://localhost:5000
```

## Running the Application

### Start MongoDB (if running locally)
```bash
mongod
```

### Start Backend Server
```bash
cd server
npm start
```
Server runs on `http://localhost:5000`

### Start Frontend Development Server (in a new terminal)
```bash
cd client
npm run dev
```
Frontend runs on `http://localhost:5173`

## Project Structure

```
expense-tracker/
├── client/                 # React frontend
│   ├── src/
│   │   ├── App.jsx        # Main app component
│   │   ├── Login.jsx      # Authentication pages
│   │   ├── Subscriptions.jsx
│   │   ├── ForgotPassword.jsx
│   │   ├── Verify.jsx
│   │   ├── api/           # API calls
│   │   ├── assets/        # Static assets
│   │   └── App.css
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
├── server/                # Express backend
│   ├── routes/           # API routes
│   │   ├── auth.js       # Authentication endpoints
│   │   ├── expenses.js   # Expense CRUD endpoints
│   │   └── subscriptions.js
│   ├── models/           # Mongoose schemas
│   │   ├── User.js
│   │   ├── Expense.js
│   │   └── Subscription.js
│   ├── middleware/       # Express middleware
│   │   ├── authMiddleware.js
│   │   └── sessionMiddleware.js
│   ├── utils/            # Utility functions
│   │   └── email.js      # Email sending
│   ├── index.js          # Server entry point
│   └── package.json
│
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/verify-email` - Verify email with code
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with code
- `POST /api/auth/logout` - Logout user

### Expenses
- `GET /api/expenses` - Get all expenses (supports filtering by category and date)
- `POST /api/expenses` - Create new expense
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense

### Subscriptions
- `GET /api/subscriptions` - Get all subscriptions
- `POST /api/subscriptions` - Create new subscription
- `PUT /api/subscriptions/:id` - Update subscription
- `DELETE /api/subscriptions/:id` - Delete subscription

## Usage

1. **Sign Up** - Create a new account with username, email, and password
2. **Verify Email** - Enter the verification code sent to your email
3. **Track Expenses** - Add expenses with category, amount, and date
4. **View Analytics** - See visual breakdowns of expenses by category and time
5. **Manage Subscriptions** - Keep track of recurring subscriptions
6. **Reset Password** - Use "Forgot Password" if you lose access

## Environment Variables

### Server `.env`
| Variable | Description | Example |
|----------|-------------|---------|
| `MONGO_URI` | MongoDB connection string | `mongodb://localhost:27017/expense-tracker` |
| `PORT` | Server port | `5000` |
| `JWT_SECRET` | Secret for JWT tokens | `your-secret-key` |
| `EMAIL_USER` | Email for sending verification codes | `your-email@gmail.com` |
| `EMAIL_PASSWORD` | App-specific email password | `xxxx xxxx xxxx xxxx` |
| `EMAIL_HOST` | SMTP server host | `smtp.gmail.com` |
| `EMAIL_PORT` | SMTP server port | `587` |

### Client `.env.local` (optional)
| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:5000` |

## Known Issues & Future Improvements

- [ ] Add client-side form validation
- [ ] Implement API error handling wrapper
- [ ] Add unit and integration tests
- [ ] Set up CI/CD pipeline
- [ ] Add API rate limiting
- [ ] Implement request logging
- [ ] Add error boundary in React
- [ ] Add skeleton loaders for loading states
- [ ] Move hardcoded values to environment variables
- [ ] Add production build optimization

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running: `mongod`
- Check `MONGO_URI` in `.env` is correct
- Verify MongoDB is installed and running on the correct port

### Email Not Sending
- Enable "Less secure app access" (Gmail)
- Use [App-specific password](https://support.google.com/accounts/answer/185833) instead of account password
- Check `EMAIL_USER` and `EMAIL_PASSWORD` in `.env`
- Verify SMTP settings for your email provider

### CORS Errors
- Ensure frontend is running on `http://localhost:5173`
- Check `origin` in server CORS configuration matches your frontend URL

### Session/Authentication Issues
- Clear browser cookies
- Ensure `credentials: 'include'` in fetch requests
- Verify JWT_SECRET is set in `.env`

## Support

For issues or questions, please open an issue on the GitHub repository.

---

**Made with ❤️ by the Expense Tracker Team**
