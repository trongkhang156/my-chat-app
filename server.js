const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.static('public'));

io.on('connection', (socket) => {
    socket.on('chat message', (msg) => {
        io.emit('chat message', msg);
    });
});

// Đừng gán cứng 3003, hãy để hệ thống của Render tự cấp
const PORT = process.env.PORT || 3003;
http.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));