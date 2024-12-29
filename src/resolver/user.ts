import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';

import { getCachedData, setCachedData } from '../utils/cache';


const SECRET_KEY = "your_secret_key";
import { Server } from 'socket.io';

// Pass `io` to your resolvers
let io: Server;

export const setSocketServer = (socketServer: Server) => {
  io = socketServer;
};


export const userResolvers = {
  hello: () => {
    return "Hello, World!";
  },

  getUser: async ({ id }: { id: string }) => {
    const cachedUser = getCachedData(id);
    if (cachedUser) {
      console.log('Returning user from cache');
      return cachedUser;
    }
    const user = await User.findById(id);
    if (!user) {
      throw new Error('User not found');
    }
    const userData = { id: user.id, username: user.username, email: user.email };
    setCachedData(id, userData);
    return userData;
  },

register: async ({ username, email, password }: { username: string; email: string; password: string }) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User({
    username,
    email,
    password: hashedPassword,
  });
  const user = await newUser.save();

  const token = jwt.sign({ id: user.id }, SECRET_KEY, { expiresIn: '1h' });

  // Broadcast the new user event
  io.emit('user-registered', {
    id: user.id,
    username: user.username,
    email: user.email,
  });

  return { ...user.toObject(), id: user.id, token };
},
  
  login: async ({ email, password }: { email: string; password: string }) => {
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error('User not found');
    }
  
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error('Invalid credentials');
    }
  
    const token = jwt.sign({ id: user.id }, SECRET_KEY, { expiresIn: '1h' });
  
    return { ...user.toObject(), id: user.id, token };
  },  
};
