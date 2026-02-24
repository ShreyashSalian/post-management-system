🚀 Post Management System

- A scalable and production-ready Post Management System built with Node.js, Express, and MongoDB.

- This application allows users to:

- Create posts with images/videos

- Like or dislike posts (scalable reaction module)

- Add comments and nested sub-comments

- Authenticate securely using JWT

- Fetch posts with optimized counters and indexing

- Designed using a clean MVC architecture and optimized for scalability.

📌 Features
👤 Authentication

- User registration & login

- JWT-based authentication

- Password hashing with bcrypt

📝 Post Module

- Create posts with media (images/videos)

- Store media using Multer (can integrate with S3/Cloudinary)

- Fetch all posts with pagination

Like & dislike counters

👍 Reaction Module (Scalable Architecture)

- Separate Reaction collection

- Prevent duplicate reactions using compound index

- Toggle like/dislike

- Atomic counter updates

💬 Comment Module

- Add comments

- Add sub-comments (nested comments)

- Fetch post-wise comments

Installation & Setup

1️⃣ Clone the Repository

- git clone https://github.com/ShreyashSalian/post-management-system.git
- cd post-management-system

2️⃣ Install Dependencies

```bash
 npm install
```

-

3️⃣ Create .env File

- PORT=5000
- MONGO_URI=your_mongodb_connection_string
- JWT_SECRET=your_secret_key

4️⃣ Built the application

```
npm run built
```

5 Run the application

```
npm start
```
