const express = require('express');
const app = express();
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const port = 3000;

app.use(express.json());

// CORS পলিসি সঠিকভাবে সেট করা
app.use(
    cors({
        origin: 'http://localhost:5173', // আপনার ফ্রন্টএন্ডের URL
        methods: ['GET', 'POST'],
        credentials: true, // Credentials অনুমতি দিন (যদি প্রয়োজন)
    })
);

const server = http.createServer(app);

// Socket.IO এর জন্য আলাদা CORS পলিসি
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:5173', // ফ্রন্টএন্ডের URL
        methods: ['GET', 'POST'],
    },
});

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('offer', (data) => {
        socket.to(data.to).emit('offer', { offer: data.offer, from: socket.id });
    });

    socket.on('answer', (data) => {
        socket.to(data.to).emit('answer', { answer: data.answer, from: socket.id });
    });

    socket.on('ice-candidate', (data) => {
        socket.to(data.to).emit('ice-candidate', { candidate: data.candidate, from: socket.id });
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected:', socket.id);
    });
});

// Test Route
app.get('/', (req, res) => {
    res.send('Hello World from server');
});

// Server Listening
server.listen(port, async () => {
    try {
        const chalk = (await import('chalk')).default;
        console.log(chalk.green.bold(`✅ Server is running on port ${port}`));
    } catch (err) {
        const chalk = (await import('chalk')).default;
        console.error(chalk.red.bold(`❌ Failed to start server: ${err.message}`));
        process.exit(1);
    }
});
