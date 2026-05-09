var express = require('express');
var socket = require('socket.io');

// App setup
var app = express();
var server = app.listen(80, function () {
    console.log('listening for requests on port 80, https://poker-iyrv.onrender.com/');
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

    socket.on('autoDecide', function () {
        io.sockets.emit('autoDecide');
    })

    /* ── Voice signaling ── */
    var voiceUsers = {};   // lives in outer scope so all socket handlers share it

    socket.on('voice-join', function () {
        var label = 'Player ' + (Object.keys(voiceUsers).length + 1);
        voiceUsers[socket.id] = { sid: socket.id, label: label };

        // Send the new joiner a list of everyone already in the channel
        var existing = Object.values(voiceUsers).filter(function (u) {
            return u.sid !== socket.id;
        });
        socket.emit('voice-peers', existing);

        // Tell everyone else a new person joined
        socket.broadcast.emit('voice-joined', { sid: socket.id, label: label });
    });

    socket.on('voice-leave', function () {
        delete voiceUsers[socket.id];
        socket.broadcast.emit('voice-left', { sid: socket.id });
    });

    socket.on('voice-offer', function (data) {
        io.to(data.to).emit('voice-offer', { from: socket.id, offer: data.offer });
    });

    socket.on('voice-answer', function (data) {
        io.to(data.to).emit('voice-answer', { from: socket.id, answer: data.answer });
    });

    socket.on('voice-ice', function (data) {
        io.to(data.to).emit('voice-ice', { from: socket.id, candidate: data.candidate });
    });

    socket.on('disconnect', function () {
        if (voiceUsers[socket.id]) {
            delete voiceUsers[socket.id];
            socket.broadcast.emit('voice-left', { sid: socket.id });
        }
    });

})