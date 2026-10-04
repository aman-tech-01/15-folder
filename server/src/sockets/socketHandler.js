export const registerSocketHandlers = (io) => {
  io.on('connection', (socket) => {
    console.log(`[Socket.IO] Client connected: ${socket.id}`);

    // Join channel room
    socket.on('channel:join', (channelName) => {
      socket.join(`channel:${channelName}`);
      console.log(`[Socket.IO] ${socket.id} joined channel:${channelName}`);
    });

    // Leave channel room
    socket.on('channel:leave', (channelName) => {
      socket.leave(`channel:${channelName}`);
    });

    // Join user room for targeted notifications
    socket.on('user:join', (userId) => {
      if (userId) {
        socket.join(`user:${userId}`);
      }
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
    });
  });
};
