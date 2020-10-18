const express = require("express");
const path = require("path");
const http = require("http");
const socketio = require("socket.io");
const {generateMessage} = require('./utils/message');
const { addUser, getUser, getUsersInRoom, removeUser } = require("./utils/users");

const PORT = process.env.PORT || 3000;

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const publicDirectoryPath = path.join(__dirname, "../public");
app.use(express.static(publicDirectoryPath));

let welcome = "welcome";

io.on("connection", (socket) => {

  socket.on('join', (options, callback) => {
    const {error, user} = addUser({id: socket.id, ...options})
    if(error){
      callback(error);
    } else {
      socket.join(user.room)
      socket.emit("message", generateMessage("Admin", welcome));
    socket.broadcast.to(user.room).emit("message", generateMessage("Admin",`${user.username} has joined the chat`));

    io.to(user.room).emit('roomData', {
      room: user.room,
      users: getUsersInRoom(user.room),
    })
    }
    
  })

  socket.on("sendMessage", (message, callback) => {
    const user = getUser(socket.id);
    io.to(user.room).emit("message", generateMessage(user.username, message));
  });

  socket.on("sendLocation", (location, callback) => {
    const user = getUser(socket.id);
    const { latitude, longitude } = location;
    io.to(user.room).emit('locationMessage', generateMessage(user.username, `https://google.com/maps?q=${latitude},${longitude}`));
    callback()
  });


  socket.on("disconnect", () => {
    const user = removeUser(socket.id);
    if(user){
      io.to(user.room).emit("message", generateMessage("Admin", `${user.username} has left the chat`));
    }
    
  });
});

app.get("/", (req, res) => {
  res.sendFile("index");
});

server.listen(PORT, () => {
  console.log(`App running on on port: ${PORT}`);
});
