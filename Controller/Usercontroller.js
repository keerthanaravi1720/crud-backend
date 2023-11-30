const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const createUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password,
      },
    });

    res.json({ message: 'Success', user: newUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findFirst({
      where: {
        email,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.password !== password) {
      return res.status(401).json({ error: 'Incorrect password' });
    }

    const token = jwt.sign({ password: user.id }, 'secret_key');

    res.json({ message: 'Login successful', token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const authenticateUser = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.substring(7);

  try {
    const decodedToken = jwt.verify(token, 'secret_key');
    req.user = { id: decodedToken.password };
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

const getUserDetails = async (req, res) => {
  const userId = req.user.id;

  try {
    const userDetails = await prisma.user.findUnique({ where: { id: userId } });

    if (!userDetails) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User details parsed successfully', userDetails });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  createUser,
  loginUser,
  authenticateUser,
  getUserDetails,
};

