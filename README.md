# 🏕️ Wanderlust

A full-stack accommodation and travel listing platform inspired by modern vacation-rental websites. Wanderlust lets users explore stays, view listing details, create and manage listings, write reviews, and securely authenticate with email OTP verification.

🌐 **Live Demo:** [wanderlust-bktb.onrender.com/listings](https://wanderlust-bktb.onrender.com/listings)

## ✨ Features

### 🏡 Listings

* Browse all available property listings
* View detailed information about each property
* Create, edit, and delete listings
* Upload and display property images
* Categorized listings (Beach, Mountain, Camping, and more)

### 🔐 User Authentication

* User registration and login
* Passport.js authentication with secure password hashing
* Email OTP verification during signup
* Forgot password flow with email OTP-based reset
* Session-based authentication and logout

### ⭐ Reviews

* Add and delete reviews on listings
* Star-based rating system with comments

### 🔎 Search & Categories

* Search listings by location, title, or country
* Browse and filter listings by category

### 🗺️ Maps & Location

* GeoJSON-based coordinates for each listing
* Interactive map integration via Mapbox

### 📱 Responsive Design

* Mobile-friendly, responsive layout across pages
* Clean, modern UI built with Bootstrap and EJS

---

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | HTML5, CSS3, JavaScript, Bootstrap, EJS, EJS-Mate |
| **Backend** | Node.js, Express.js, REST APIs |
| **Database** | MongoDB, Mongoose, MongoDB Atlas |
| **Auth & Security** | Passport.js, Passport-Local-Mongoose, Express Session, Connect-Mongo, Email OTP, Password Hashing |
| **Email** | Nodemailer, Gmail SMTP / Resend |
| **Maps** | Mapbox |
| **Media Storage** | Cloudinary |
| **Deployment** | Render |
| **Version Control** | Git, GitHub |

---

## 📂 Project Structure

```text
Wanderlust/
│
├── controllers/
│   ├── listings.js
│   ├── reviews.js
│   └── users.js
│
├── Models/
│   ├── listing.js
│   ├── pendingUser.js
│   ├── review.js
│   └── user.js
│
├── routes/
│   ├── listing.js
│   ├── review.js
│   └── user.js
│
├── views/
│   ├── listings/
│   ├── users/
│   └── includes/
│
├── public/
│   ├── css/
│   └── js/
│
├── utils/
│   ├── crypto.js
│   ├── otp.js
│   ├── sendOTP.js
│   └── wrapAsync.js
│
├── init/
│   └── data.js
│
├── middleware.js
├── cloudConfig.js
├── index.js
├── package.json
├── package-lock.json
└── .gitignore
```

---

## ⚙️ Installation & Setup

### 1. Clone the repository

```bash
git clone https://github.com/SouravSaini001/Wanderlust.git
```

### 2. Navigate to the project

```bash
cd Wanderlust
```

### 3. Install dependencies

```bash
npm install
```

### 4. Create a `.env` file

Create a `.env` file in the root directory with the following keys:

```env
ATLASDB_URL=your_mongodb_connection_string

SECRET=your_session_secret

MAP_TOKEN=your_mapbox_token

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_KEY=your_cloudinary_api_key
CLOUDINARY_SECRET=your_cloudinary_api_secret

EMAIL_USER=your_email
EMAIL_PASS=your_email_app_password
```

> ⚠️ Never commit your `.env` file or any secret credentials to GitHub.

### 5. Start the application

For development (with auto-restart):

```bash
nodemon index.js
```

Or standard start:

```bash
npm start
```

The app will be available at:

```text
http://localhost:3000
```

---

## 🔑 Environment Variables

| Variable | Purpose |
|---|---|
| `ATLASDB_URL` | MongoDB Atlas connection string |
| `SECRET` | Express session secret |
| `MAP_TOKEN` | Mapbox API token |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_KEY` | Cloudinary API key |
| `CLOUDINARY_SECRET` | Cloudinary API secret |
| `EMAIL_USER` | Email account used for sending OTPs |
| `EMAIL_PASS` | Email account app password |

---

## 🔐 Authentication Flow

### Signup

```text
User Signup
     ↓
Check Username & Email
     ↓
Generate OTP
     ↓
Hash OTP
     ↓
Temporarily Encrypt Password
     ↓
Store Pending User
     ↓
Send OTP via Email
     ↓
Verify OTP
     ↓
Create Permanent User
     ↓
Passport Authentication
     ↓
User Logged In
```

### Forgot Password

```text
Enter Email / Username
        ↓
Find User
        ↓
Generate OTP
        ↓
Send OTP via Email
        ↓
Verify OTP
        ↓
Create New Password
        ↓
Passport Hashes Password
        ↓
Password Updated
```

---

## 🗃️ Database Models

| Model | Description |
|---|---|
| **User** | Registered user info and Passport authentication data |
| **PendingUser** | Temporary signup data held until OTP verification completes |
| **Listing** | Title, description, price, location, country, category, image, owner, GeoJSON coordinates |
| **Review** | Comment, rating, author, associated listing |

---

## 🏷️ Listing Categories

* 🏖️ Beach
* 🏔️ Mountain
* 🏊 Amazing Pools
* 🏰 Castles
* 🏕️ Camping
* 🌾 Farms
* 🏄 Surfing
* 🛏️ Rooms
* 🏙️ Iconic Cities
* 🔥 Trending

---

## 🚀 Deployment

Deployed on **Render**, connected to a MongoDB Atlas database, with environment variables configured through Render's dashboard.

🔗 **Live App:** https://wanderlust-bktb.onrender.com/listings

---

## 🧪 Development Workflow

Run locally with:

```bash
nodemon index.js
```

After making changes:

```bash
git add .
git commit -m "Update project"
git push origin development
```

Then open a Pull Request from the `development` branch into `main`.

---

## 🔒 Security

Sensitive information is kept out of the repository using environment variables. The following should **never** be committed:

```text
.env
node_modules/
```

Example `.gitignore`:

```gitignore
.env
node_modules/
.DS_Store
```

---

## 🎯 Future Improvements

- [x] Advanced search
- [x] Price range filtering
- [x] Date-based availability
- [x] Wishlist / favorites
- [x] Booking system
- [x] Payment integration
- [x] Improved map-based search
- [x] Image optimization
- [x] Admin dashboard
- [x] Better mobile UI
- [x] Email notifications
- [x] Production-grade email service

---

## 👨‍💻 Author

**Sourav Saini**
B.Tech Computer Science & Engineering Student

Interested in: Full Stack Development · MERN Stack · JavaScript · Backend Development · Data Structures & Algorithms · AI/ML

---

## ⭐ Support

If you like this project, consider giving it a ⭐ on GitHub!

---

## 📄 License

This project is created for learning and portfolio purposes.
