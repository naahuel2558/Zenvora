# Wellness Affiliate Backend

A lightweight full-stack backend system for a wellness affiliate website, focusing on simplicity and performance.

## Prerequisites
- Node.js (v14 or higher)
- npm

## Setup & Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the server:
   ```bash
   node server.js
   ```
   The server will run at `http://localhost:3000`.

## API Documentation

### Authentication

#### Register User
`POST /register`
- Body: `{ "username": "JohnDoe", "email": "john@example.com", "password": "securepassword" }`

#### Login
`POST /login`
- Body: `{ "email": "john@example.com", "password": "securepassword" }`

### Blog Posts

#### Get All Posts
`GET /posts`

#### Create Post
`POST /posts`
- Body: 
  ```json
  {
    "userId": "123456",
    "title": "5 Best Superfoods for Energy",
    "content": "Full article content here...",
    "category": "Nutrition",
    "images": ["url1", "url2"],
    "links": ["affiliate-link-1"]
  }
  ```

#### Edit Post
`PUT /posts/:id`
- Body: Same as create (include `userId` for permission check)

#### Delete Post
`DELETE /posts/:id`
- Body: `{ "userId": "123456" }`

## Project Structure
- `server.js`: Main Express logic.
- `data/`: Folder containing JSON database files.
- `package.json`: Project dependencies and metadata.

## Future Enhancements
- Integration with MongoDB for database persistence.
- JWT (JSON Web Tokens) for modern session management.
- Image upload support via Multer/Cloudinary.
