const express = require('express')
const app = express()
const ip = require('ip')
const server =require('http').Server(app)
const io = require('socket.io')(server)
const string = "0123456789abcdefghijklmnopjrstuvwxyz"
const userId = ipTransform(ip.address())
const PORT = process.env.PORT || 80

app.set('view engine', 'ejs')
app.use(express.static('public'))

app.get('/', (req, res)=>{
    res.render('index', {roomId: userId})
})

io.on('connection', socket =>{
    socket.on('join-room', (roomId, userId) =>{
        socket.join(roomId)
        socket.to(roomId).emit('user-connected', userId)

        socket.on('disconnect', () =>{
            socket.to(roomId).emit('user-disconnected', userId)
        })
    })
})

function divme(a, b) {
    return (a - a % b) / b
}

function ipTransform(ip) {
    ip = String(ip).replaceAll('.', '').replaceAll(':', '')
    ip = Number(ip)
    let pi = ""
    while (ip > 0) {
        pi += string[ip % 36]
        ip = divme(ip, 36)
    }
    return pi
}

server.listen(PORT)

