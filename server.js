const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, { cors: { origin: "*" } });
const fs = require('fs');
const path = require('path');

const LOG_FILE = path.join(__dirname, 'messages.txt');

app.use(express.static('public'));

io.on('connection', (socket) => {
    // 1. Khi có người kết nối, gửi lịch sử cũ từ file cho họ
    if (fs.existsSync(LOG_FILE)) {
        fs.readFile(LOG_FILE, 'utf8', (err, data) => {
            if (!err && data) {
                const history = data.split('\n').filter(line => line).map(line => JSON.parse(line));
                socket.emit('load history', history);
            }
        });
    }

    // 2. Khi nhận tin nhắn, lưu vào file và gửi cho mọi người
    socket.on('chat message', (msg) => {
        fs.appendFile(LOG_FILE, JSON.stringify(msg) + '\n', (err) => {
            if (err) console.error("Lỗi khi lưu tin nhắn:", err);
        });
        io.emit('chat message', msg);
    });
});

const PORT = process.env.PORT || 3003;
http.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));