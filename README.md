# 🚀 Food Delivery Platform

A real-time food ordering, shop management, delivery tracking, and payment-integrated web application.

---

## 🔰 Badges
![Frontend](https://img.shields.io/badge/Frontend-ReactJS-blue)
![Backend](https://img.shields.io/badge/Backend-NodeJS-green)
![Database](https://img.shields.io/badge/Database-MongoDB-brightgreen)
![Realtime](https://img.shields.io/badge/Realtime-Socket.IO-black)
![Payments](https://img.shields.io/badge/Payments-Integrated-orange)
![License](https://img.shields.io/badge/License-MIT-yellow)

---

# 📖 Overview

A complete food delivery ecosystem where:

## 👤 Users
- Discover nearby shops  
- Browse menus & order food  
- Secure online payment  
- Track delivery live  
- Real-time order status  

## 🏪 Shop Owners
- Accept incoming orders  
- Update order status  
- Assign orders to **two delivery partners**  
- Add / delete items  
- Payment & settlement management  

## 🚴 Delivery Partners
- Accept or reject orders  
- Track pickup & delivery  
- Update delivery progress  
- Daily earnings dashboard with charts  

---

# 🏛 System Architecture

```
                                ┌────────────────┐
                                │     Users      │
                                └───────┬────────┘
                                        │
                                React Frontend
                                        │
                           Axios / Socket.IO / JWT
                                        │
                          ┌─────────────┴─────────────┐
                          │         Backend API        │
                          │        (Node + Express)    │
                          └─────────────┬─────────────┘
                                        │
                        ┌───────────────┼────────────────┐
                        │               │                │
                Authentication      Order Engine     Payment Gateway  
                    (JWT/OAuth)              Logic        (Razorpay)
                        │               │                │
                        └───────────────┼────────────────┘
                                        │
                                 MongoDB Database
```

---

# 🛠 Tech Stack

## Frontend
- React.js  
- Tailwind CSS  
- Axios  
- Socket.IO Client  

## Backend
- Node.js  
- Express.js  
- MongoDB (Mongoose)  
- JWT Authentication  
- Socket.IO  

## Deployment
- Render  

---

# ✨ Key Features

## User
- View nearby shops  
- Browse food items  
- Secure payments  
- Live location tracking  
- Order history  

## Shop Owner
- Add / delete / update items  
- Manage orders  
- Assign delivery partner  
- Update statuses  

## Delivery Partner
- Accept/reject orders  
- Live navigation  
- Delivery status update  
- Earnings chart  

---

# 📡 Real-Time Features (Socket.IO)

| Feature | Description |
|--------|-------------|
| Order Status | Updates instantly |
| Live Location | Delivery partner movement |
| Delivery Actions | Accept/reject & update instantly |
| Shop Notifications | Order arrives instantly |

---

# 📁 Folder Structure

```
root/
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── models/
│   ├── routes/
|   ├── utils/
│   ├── sockets.js
│   └── index.js
│
└── frontend/
    ├── src/
    |   ├── assets/
    │   ├── components/
    |   ├── hooks/
    │   ├── pages/
    |   ├── redux/
    |   ├── App.jsx
    |   ├── category.jsx
    |   ├── index.css
    │   └── main.jsx
    └── public/
```

---


# 🔧 Installation & Setup

## 1. Clone the repo
```bash
git clone https://github.com/Vivek009-hub/Food-Delivery-App
cd your-repo
```

## 2. Install dependencies

### Backend
```bash
cd backend
npm install
```

### Frontend
```bash
cd frontend
npm install
```

## 3. Setup `.env` in backend

```
MONGO_URI=your_mongo_url
JWT_SECRET=your_secret_key
RAZORPAY_KEY_ID=your_key
RAZORPAY_KEY_SECRET=your_secret
CLOUDINARY_CLOUD_NAME="your_name"
CLOUDINARY_API_KEY="your_key"
CLOUDINARY_API_SECRET="your_secret"
```

## 4. Run project

### Backend
```bash
npm run dev
```

### Frontend
```bash
npm start
```

---

# 📊 Delivery Partner Dashboard
- Daily earnings chart  
- Completed deliveries  
- Earnings insights  

---

# 📷 Screenshots



<img width="1514" height="914" alt="Screenshot 2025-12-03 000851" src="https://github.com/user-attachments/assets/e21e21c9-68d1-4f9b-b02c-308d2b3033ee" />


<img width="915" height="708" alt="Screenshot 2025-12-03 001012" src="https://github.com/user-attachments/assets/dc180af1-284f-4ab0-ad62-0168b24b4df5" />

<img width="985" height="908" alt="Screenshot 2025-12-03 000940" src="https://github.com/user-attachments/assets/5f62b782-14c1-4688-8426-9343bbff8784" />



---

# 🤝 Contributing
Submit PRs or issues for improvements.
