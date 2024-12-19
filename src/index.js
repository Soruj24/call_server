const express = require('express');
const app = express();
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io'); // Import Server from socket.io

const port = 3000; // Define the port number

app.use(express.json());
app.use(
    cors({
        origin: 'http://localhost:5173',
        methods: ['GET', 'POST'],
        credentials: true,
    })
);

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

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

server.listen(port, async () => {
    try {
        const chalk = (await import('chalk')).default; // Dynamically import chalk
        console.log(chalk.green.bold(`✅ Server is running on port ${port}`)); // Green for success
    } catch (err) {
        const chalk = (await import('chalk')).default; // Import again for error
        console.error(chalk.red.bold(`❌ Failed to start server: ${err.message}`)); // Red for errors
        process.exit(1);
    }
});
