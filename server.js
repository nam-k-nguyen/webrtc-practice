// Dependencies
const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const { v4: generateID } = require('uuid')


// App settings
app.set('view engine', 'ejs')
app.use(express.static(__dirname + "/public"))


// Routes
app.get('/', (req, res) => {res.redirect(`/${generateID()}`)})
app.get('/:id', (req, res) => {res.render('room.ejs', { roomId: req.params.id })})


// On socket connection with a user
io.on('connection', socket => {
    socket.emit('welcome', 'Hi new user')
    socket.on('join-room', (roomId, connectedUserId) => {
        socket.join(roomId)
        socket.to(roomId).emit('user-connected', connectedUserId)
        socket.on('disconnect', () => {socket.to(roomId).emit('user-disconnected', connectedUserId)})
    })
})


// Create a server that listens on for 
server.listen(process.env.PORT || 3000)