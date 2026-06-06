const Message = require("../models/Message");
const Conversation = require("../models/Conversation");

module.exports = (io) => {
  // Map userId -> socketId
  const onlineUsers = new Map();

  io.on("connection", (socket) => {
    console.log("⚡ Socket connected:", socket.id);

    // User join với userId
    socket.on("user:join", (userId) => {
      onlineUsers.set(userId, socket.id);
      socket.userId = userId;
      console.log(`👤 User ${userId} online`);
    });

    // Join conversation room
    socket.on("conversation:join", (conversationId) => {
      socket.join(conversationId);
      console.log(`💬 User joined conversation: ${conversationId}`);
    });

    // Leave conversation room
    socket.on("conversation:leave", (conversationId) => {
      socket.leave(conversationId);
    });

    // Gửi message realtime
    socket.on("message:send", async (data) => {
      try {
        const { conversationId, content, senderId } = data;

        const conversation = await Conversation.findById(conversationId);
        if (!conversation) return;

        // Lưu vào DB
        const message = await Message.create({
          conversationId,
          senderId,
          content,
        });

        await message.populate("senderId", "name username avatar");

        // Cập nhật lastMessage
        conversation.lastMessage = {
          content,
          senderId,
          sentAt: new Date(),
        };
        await conversation.save();

        // Broadcast tới tất cả trong room
        io.to(conversationId).emit("message:receive", message);

        // Notify receiver nếu không ở trong room
        const receiverId = conversation.participants
          .find((p) => p.toString() !== senderId)
          ?.toString();

        if (receiverId) {
          const receiverSocketId = onlineUsers.get(receiverId);
          if (receiverSocketId) {
            io.to(receiverSocketId).emit("notification:new_message", {
              conversationId,
              message,
            });
          }
        }
      } catch (error) {
        console.error("Socket message error:", error);
        socket.emit("error", { message: error.message });
      }
    });

    // Typing indicator
    socket.on("typing:start", (data) => {
      socket.to(data.conversationId).emit("typing:start", {
        userId: socket.userId,
        conversationId: data.conversationId,
      });
    });

    socket.on("typing:stop", (data) => {
      socket.to(data.conversationId).emit("typing:stop", {
        userId: socket.userId,
        conversationId: data.conversationId,
      });
    });

    socket.on("disconnect", () => {
      if (socket.userId) {
        onlineUsers.delete(socket.userId);
        console.log(`👤 User ${socket.userId} offline`);
      }
    });
  });
};
