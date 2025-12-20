const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: { origin: '*' }
});

// Serve the chat page
app.get('/', (req, res) => {
    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Ligma Chat</title>
<style>
    body { font-family: Arial, sans-serif; background: #1a1a1a; color: #fff; display: flex; flex-direction: column; height: 100vh; margin: 0; }
    h1 { text-align: center; margin: 10px 0; color: #ff4757; }
    #join, #chat { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; }
    #messages { flex: 1; overflow-y: auto; padding: 10px; list-style: none; margin: 0; width: 100%; max-width: 500px; }
    #messages li { padding: 8px 12px; margin-bottom: 6px; background: #2f2f2f; border-radius: 8px; word-break: break-word; }
    input { padding: 10px; border: none; border-radius: 5px; background: #444; color: #fff; margin-bottom: 10px; width: 100%; max-width: 300px; }
    button { padding: 10px 20px; border: none; border-radius: 5px; background: #ff4757; color: #fff; cursor: pointer; }
    button:hover { background: #ff6b81; }
    form { display: flex; width: 100%; max-width: 500px; }
    form input { flex: 1; margin-right: 5px; }
</style>
</head>
<body>
<h1>Ligma Chat 💬</h1>

<div id="join">
    <input id="username-input" placeholder="Enter your username" />
    <input id="room-input" placeholder="Enter room code" />
    <button id="join-btn">Join Room</button>
</div>

<div id="chat" style="display:none; flex-direction: column; flex:1; width:100%; align-items:center;">
    <ul id="messages"></ul>
    <form id="chat-form">
        <input id="message-input" autocomplete="off" placeholder="Type your Ligma message..." />
        <button type="submit">Send</button>
    </form>
</div>

<script src="https://cdn.socket.io/4.7.2/socket.io.min.js" integrity="sha384-3GbFV6IEg7v2sZK7t2Td+Z+FJ5LQ2S3Jx8CNj0f+JKwR5K3Sx8kmzVJJ0bX4Fn1M" crossorigin="anonymous"></script>
<script>
    const socket = io();
    const joinDiv = document.getElementById('join');
    const chatDiv = document.getElementById('chat');
    const joinBtn = document.getElementById('join-btn');
    const roomInput = document.getElementById('room-input');
    const usernameInput = document.getElementById('username-input');
    const form = document.getElementById('chat-form');
    const input = document.getElementById('message-input');
    const messages = document.getElementById('messages');

    let room = '';
    let username = '';
    const userColors = {};

    function getRandomColor() {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }

    joinBtn.addEventListener('click', () => {
        const code = roomInput.value.trim();
        const name = usernameInput.value.trim() || 'Anonymous';
        if(code) {
            room = code;
            username = name;
            socket.emit('join room', { room, username });
            joinDiv.style.display = 'none';
            chatDiv.style.display = 'flex';
        }
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        if(input.value && room && username) {
            socket.emit('chat message', { room, username, message: input.value });
            input.value = '';
        }
    });

    socket.on('chat message', ({ room: msgRoom, username: msgUser, message }) => {
        if(msgRoom === room) {
            if(!userColors[msgUser]) userColors[msgUser] = getRandomColor();
            const li = document.createElement('li');
            li.innerHTML = '<strong style="color:'+userColors[msgUser]+'">'+msgUser+'</strong>: '+message;
            messages.appendChild(li);
            messages.scrollTop = messages.scrollHeight;
        }
    });
</script>
</body>
</html>`);
});

// Socket.IO logic with rooms
io.on('connection', (socket) => {
    console.log('A user connected to Ligma Chat');

    socket.on('join room', ({ room, username }) => {
        socket.join(room);
        console.log(`User "${username}" joined room: ${room}`);
    });

    socket.on('chat message', ({ room, username, message }) => {
        io.to(room).emit('chat message', { room, username, message });
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected from Ligma Chat');
    });
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
    console.log(`Ligma Chat running on port ${PORT}`);
});
