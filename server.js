const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io').server
const { v4: generateID } = require('uuid')

app.set('view engine', 'ejs')

app.get('/', (req, res) => {
    res.render('room.ejs')
})

console.log('testing')

server.listen(process.env.PORT || 3000)