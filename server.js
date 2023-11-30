
const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient(); 
const cors = require('cors');
// const postRoutes=require("./Routes/Route")


const app = express();
app.use(cors());
app.use(bodyParser.json());
// app.use('/posts', postRoutes);





// Middleware to extract user details from JWT token
const authenticateUser = (req, res, next) => {
    const authHeader = req.headers.authorization;
  
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  
    const token = authHeader.substring(7); // Extract the token from the "Bearer " prefix
  
    try {
      const decodedToken = jwt.verify(token, 'secret_key');
      req.user = { id: decodedToken.password }; // Set the user details in req.user
      next();
    } catch (error) {
      return res.status(401).json({ error: 'Invalid token' });
    }
  };

  app.options('/users', (req, res) => {
    // Set the appropriate headers for the preflight request
    res.header('Access-Control-Allow-Methods', 'GET, POST');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.sendStatus(200);
  });

// Create a new user
app.post('/users', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password,
      },
    });

    // res.json(newUser );
    res.json({ message: 'Success', user: newUser });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
  
    try {
      const user = await prisma.user.findFirst({
        where: {
          email,
        },
      });
  
      if (!user) {
        // User not found
        return res.status(404).json({ error: 'User not found' });
      }
  
      if (user.password !== password) {
        // Incorrect password
        return res.status(401).json({ error: 'Incorrect password' });
      }
  
  
      // const token = jwt.sign({ password: user.password }, 'secret_key'); 
      const token = jwt.sign({ password: user.id }, 'secret_key');
  
      res.json({ message: 'Login successful', token :token});
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  app.get('/auth', async (req, res) => {
    const authHeader = req.headers.authorization;
  
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  
    const token = authHeader.substring(7); // Extract the token from the "Bearer " prefix
    let decodedToken;
  
    try {
      decodedToken = jwt.verify(token, 'secret_key');
    } catch (error) {
      return res.status(401).json({ error: 'Invalid token' });
    }
  
    try {
      const userId = decodedToken.password;
      const userDetails = await prisma.user.findUnique({ where: { id: userId } });
  
      if (!userDetails) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json({ message: 'User details parsed successfully',  userDetails  });
      // res.json({ userDetails });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    
    }
    
  });

  app.use('/posts', authenticateUser);

  
  

 // create a post
app.post('/posts',  async (req, res) => {
    const { title, content } = req.body;
    const userId = req.user.id;
    console.log("user id",userId)
  
    try {
      const user = await prisma.user.findUnique({
        where: {
          id: userId,
        },
        select: {
          name: true,
          email: true,
          password: true,
        },
      });
  
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      const newPost = await prisma.post.create({
        data: {
          title,
          content,
          userId,
        },
      });
  
      res.json({ message: 'Post created successfully', post: newPost, user });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });




  
// // Get all posts of the authenticated user
app.get('/posts',authenticateUser, async (req, res) => {
    const userId = req.user.id;
  
    try {
      const posts = await prisma.post.findMany({
        where: {
          userId,
        },
      });
  
      res.json({ message: 'Posts retrieved successfully', posts });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Get a specific post by its ID
// Get a specific post by its ID
app.get('/posts/:postId', async (req, res) => {
    const postId = parseInt(req.params.postId);
    const userId = req.user.id;
  
    if (isNaN(postId)) {
      return res.status(400).json({ error: 'Invalid postId' });
    }
  
    try {
      const post = await prisma.post.findFirst({
        where: {
          id: postId,
          userId,
        },
      });
  
      if (!post) {
        return res.status(404).json({ error: 'Post not found' });
      }
  
      res.json({ message: 'Post retrieved successfully', post });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  
  
  
  // Update a post
  app.put('/posts/:postId', async (req, res) => {
    const postId = parseInt(req.params.postId);
    const userId = req.user.id;
    const { title, content } = req.body;
  
    try {
      const updatedPost = await prisma.post.update({
        where: {
          id: postId
       
        },
        data: {
          title,
          content,
             userId,
        },
      });
  
      res.json({ message: 'Post updated successfully', post: updatedPost });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  // Delete a post
  app.delete('/posts/:postId', async (req, res) => {
    const postId = parseInt(req.params.postId);
    // const userId = req.user.id;
  
    try {
      await prisma.post.delete({
        where: {
          id: postId,
          // userId,
        },
      });
  
      res.json({ message: 'Post deleted successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  


                    

// Start the server
app.listen(8000, () => {
    console.log('Server is running on port 8000');
  });



                                                  



// const express = require('express');
// const bodyParser = require('body-parser');
// const { PrismaClient } = require('@prisma/client');
// const cors = require('cors');

// const prisma = new PrismaClient();
// const app = express();

// app.use(cors());
// app.use(bodyParser.json());

// // Import the routes
// const routes = require('./Routes/Route');
// app.use('/', routes);

// // Start the server
// app.listen(9000, () => {
//   console.log('Server is running on port 8000');
// });
