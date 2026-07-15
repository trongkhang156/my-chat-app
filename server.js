const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, { cors: { origin: "*" } });
const fs = require('fs');
const path = require('path');

const LOG_FILE = path.join(__dirname, 'messages.txt');

app.use(express.static('public'));

io.on('connection', (socket) => {
    // 1. Gửi lịch sử (Chỉ gửi cho người vừa kết nối)
    if (fs.existsSync(LOG_FILE)) {
        fs.readFile(LOG_FILE, 'utf8', (err, data) => {
            if (!err && data) {
                // Tách dòng, loại bỏ dòng rỗng, parse từng dòng thành object
                const lines = data.split('\n').filter(line => line.trim() !== '');
                const history = lines.map(line => {
                    try { return JSON.parse(line); } catch(e) { return null; }
                }).filter(item => item !== null);
                
                socket.emit('load history', history);
            }
        });
    }

    // 2. Nhận tin nhắn
    socket.on('chat message', (msg) => {
        // Lưu vào file
        fs.appendFile(LOG_FILE, JSON.stringify(msg) + '\n', (err) => {
            if (err) console.error("Lỗi khi lưu tin nhắn:", err);
        });
        // Gửi cho tất cả mọi người (bao gồm cả người gửi)
        io.emit('chat message', msg);
    });
});
const PORT = process.env.PORT || 3003;
http.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));