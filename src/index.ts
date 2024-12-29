import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import { graphqlHTTP } from 'express-graphql';
import schema from './graphql/schema';
import { authenticate } from './auth/auth';

const app = express();

// Set up the HTTP server and Socket.IO server
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*', // Adjust for your production setup
    methods: ['GET', 'POST'],
  },
});

import { setSocketServer } from './resolvers/user';
// Pass the Socket.IO instance to resolvers
setSocketServer(io);


// Middleware for GraphQL
app.use('/graphql', graphqlHTTP({
  schema,
  graphiql: true,
}));

// JWT-based Socket.IO Authentication Middleware
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) {
    return next(new Error('Authentication error'));
  }

  try {
    const user = authenticate(token);
    (socket as any).user = user; // Attach user info to socket
    next();
  } catch (err) {
    next(new Error('Invalid token'));
  }
});

// Socket.IO Events
io.on('connection', (socket) => {
  console.log(`User connected: ${(socket as any).user.id}`);

  // Join a specific room
  socket.on('join-room', (room) => {
    socket.join(room);
    console.log(`User ${(socket as any).user.id} joined room: ${room}`);
  });

  // Handle messages and broadcast
  socket.on('message', ({ room, message }) => {
    io.to(room).emit('message', {
      user: (socket as any).user.id,
      message,
    });
  });

  // Disconnect event
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${(socket as any).user.id}`);
  });
});

// Start the server
const PORT = 4000;
httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}/graphql`);
});
