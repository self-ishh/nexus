import { Server } from "socket.io";

let connections = {}; // { roomId: [ socketId1, socketId2, ... ] }
let messages = {}; // chat history per room
let timeOnline = {};

export const connectToSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      allowedHeaders: ["*"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("New socket connection:", socket.id);

    // 🟢 JOIN CALL
    socket.on("join-call", (path) => {
      if (!connections[path]) connections[path] = [];
      connections[path].push(socket.id);
      timeOnline[socket.id] = Date.now();

      // Notify everyone else in the same room
      connections[path].forEach((id) => {
        io.to(id).emit("user-joined", socket.id, connections[path]);
      });

      // Send existing chat history
      if (messages[path]) {
        messages[path].forEach((msg) => {
          io.to(socket.id).emit(
            "chat-message",
            msg.data,
            msg.sender,
            msg["socket-id-sender"]
          );
        });
      }
    });

    // 🟣 SIGNAL HANDLER
    socket.on("signal", (toId, message) => {
      io.to(toId).emit("signal", socket.id, message);
    });

    // 🟡 CHAT HANDLER
    socket.on("chat-message", (data, sender) => {
      const [matchingRoom, users] = Object.entries(connections).find(
        ([_, ids]) => ids.includes(socket.id)
      ) || ["", []];

      if (!matchingRoom) return;

      if (!messages[matchingRoom]) messages[matchingRoom] = [];
      messages[matchingRoom].push({
        data,
        sender,
        "socket-id-sender": socket.id,
      });

      users.forEach((id) => {
        io.to(id).emit("chat-message", data, sender, socket.id);
      });
    });

    // 🔴 DISCONNECT
    socket.on("disconnect", () => {
      for (const room in connections) {
        if (connections[room].includes(socket.id)) {
          connections[room] = connections[room].filter(
            (id) => id !== socket.id
          );
          delete timeOnline[socket.id];

          // Tell others someone left
          connections[room].forEach((id) => {
            io.to(id).emit("user-left", socket.id);
          });
          break;
        }
      }
      console.log("Socket disconnected:", socket.id);
    });
  });

  return io;
};
