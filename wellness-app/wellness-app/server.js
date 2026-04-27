const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// JSON Database Files
const USERS_FILE = path.join(__dirname, 'data', 'users.json');
const POSTS_FILE = path.join(__dirname, 'data', 'posts.json');
const PRODUCTS_FILE = path.join(__dirname, 'data', 'products.json');

// --- Helper Functions ---
const readData = (filePath) => {
  const data = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(data);
};

const writeData = (filePath, data) => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

// --- Authentication Routes ---

// Register
app.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Please provide all fields' });
  }

  const users = readData(USERS_FILE);
  if (users.find(u => u.email === email)) {
    return res.status(400).json({ error: 'User already exists' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = {
    id: Date.now().toString(),
    username,
    email,
    password: hashedPassword,
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  writeData(USERS_FILE, users);
  res.status(201).json({ message: 'User registered successfully', userId: newUser.id });
});

// Login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const users = readData(USERS_FILE);
  const user = users.find(u => u.email === email);

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  res.json({ message: 'Login successful', userId: user.id, username: user.username });
});

// --- Product Routes ---
app.get('/products', (req, res) => {
  const products = readData(PRODUCTS_FILE);
  res.json(products);
});

// --- Blog Post Routes ---

// Get All Posts
app.get('/posts', (req, res) => {
  const posts = readData(POSTS_FILE);
  res.json(posts);
});

// Create Post
app.post('/posts', (req, res) => {
  const { userId, title, content, images, links, category } = req.body;
  if (!userId || !title || !content) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const posts = readData(POSTS_FILE);
  const newPost = {
    id: Date.now().toString(),
    userId,
    title,
    content,
    images: images || [],
    links: links || [],
    category: category || 'General',
    createdAt: new Date().toISOString()
  };

  posts.push(newPost);
  writeData(POSTS_FILE, posts);
  res.status(201).json(newPost);
});

// Edit Post
app.put('/posts/:id', (req, res) => {
  const { id } = req.params;
  const { userId, title, content, images, links, category } = req.body;
  const posts = readData(POSTS_FILE);
  const postIndex = posts.findIndex(p => p.id === id);

  if (postIndex === -1) return res.status(404).json({ error: 'Post not found' });
  
  // Basic security: only author can edit
  if (posts[postIndex].userId !== userId) {
    return res.status(403).json({ error: 'Unauthorized to edit this post' });
  }

  posts[postIndex] = {
    ...posts[postIndex],
    title: title || posts[postIndex].title,
    content: content || posts[postIndex].content,
    images: images || posts[postIndex].images,
    links: links || posts[postIndex].links,
    category: category || posts[postIndex].category
  };

  writeData(POSTS_FILE, posts);
  res.json(posts[postIndex]);
});

// Delete Post
app.delete('/posts/:id', (req, res) => {
  const { id } = req.params;
  const { userId } = req.body; // In a real app, this would come from a JWT/Session
  let posts = readData(POSTS_FILE);
  const post = posts.find(p => p.id === id);

  if (!post) return res.status(404).json({ error: 'Post not found' });
  
  if (post.userId !== userId) {
    return res.status(403).json({ error: 'Unauthorized to delete this post' });
  }

  posts = posts.filter(p => p.id !== id);
  writeData(POSTS_FILE, posts);
  res.json({ message: 'Post deleted successfully' });
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
