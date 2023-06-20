var express = require('express');
var socket = require('socket.io');

// App setup
var app = express();
var server = app.listen(8000, function () {
    console.log('listening for requests on port 8000, http://localhost:8000');
});

// Static files
app.use(express.static('public'));

// Socket setup & pass server
var io = socket(server);
io.on('connection', (socket) => {
    console.log("Someone connected id", socket.id);

    socket.on('saMal', function (data) {
        io.sockets.emit('saMal', data);
    });

    socket.on('wayMal', function (data) {
        io.sockets.emit('wayMal', data);
    })

    socket.on('showFirstCard', function () {
        io.sockets.emit('showFirstCard');
    })

    socket.on('showWinnerCarduser1', function () {
        io.sockets.emit('showWinnerCarduser1');
    })

    socket.on('showWinnerCarduser2', function () {
        io.sockets.emit('showWinnerCarduser2');
    })

    socket.on('showWinnerCarduser3', function () {
        io.sockets.emit('showWinnerCarduser3');
    })

    socket.on('showWinnerCarduser4', function () {
        io.sockets.emit('showWinnerCarduser4');
    })

    socket.on('swalMaluser1', function () {
        io.sockets.emit('swalMaluser1');
    })

    socket.on('swalMaluser2', function () {
        io.sockets.emit('swalMaluser2');
    })

    socket.on('swalMaluser3', function () {
        io.sockets.emit('swalMaluser3');
    })

    socket.on('swalMaluser4', function () {
        io.sockets.emit('swalMaluser4');
    })

    socket.on('sarMaluser1', function () {
        io.sockets.emit('sarMaluser1');
    })

    socket.on('sarMaluser2', function () {
        io.sockets.emit('sarMaluser2');
    })

    socket.on('sarMaluser3', function () {
        io.sockets.emit('sarMaluser3');
    })

    socket.on('sarMaluser4', function () {
        io.sockets.emit('sarMaluser4');
    })

    socket.on('pyitMaluser1', function (data) {
        io.sockets.emit('pyitMaluser1', data);
    })

    socket.on('pyitMaluser2', function (data) {
        io.sockets.emit('pyitMaluser2', data);
    })

    socket.on('pyitMaluser3', function (data) {
        io.sockets.emit('pyitMaluser3', data);
    })

    socket.on('pyitMaluser4', function (data) {
        io.sockets.emit('pyitMaluser4', data);
    })

    socket.on('firstCardLoseruser1', function (data) {
        io.sockets.emit('firstCardLoseruser1', data);
    })

    socket.on('firstCardLoseruser2', function (data) {
        io.sockets.emit('firstCardLoseruser2', data);
    })

    socket.on('firstCardLoseruser3', function (data) {
        io.sockets.emit('firstCardLoseruser3', data);
    })

    socket.on('firstCardLoseruser4', function (data) {
        io.sockets.emit('firstCardLoseruser4', data);
    })

})