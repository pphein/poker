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

/* Shared voice-channel registry — must be outside connection handler
   so all sockets see the same object */
var voiceUsers = {};

/* Device slot registry — 4 slots, assigned in connection order */
var deviceSlots = [null, null, null, null];

/* ဒေါင်းပြီ agreement state */
var dawngPiReq = null; // { requester: sid, agreed: [sid,...] }

/* Wrong counter & bet amount — shared state */
var wrongCounts = { 1: 0, 2: 0, 3: 0, 4: 0 };
var betAmount = 100;

function buildSlots() {
    return deviceSlots.map(function (d, i) {
        return d ? { player: i + 1, deviceId: d.shortId, sid: d.sid } : null;
    });
}

function finishDawngPi() {
    dawngPiReq = null;
    io.sockets.emit('dawngPi');
}

io.on('connection', (socket) => {
    console.log("Someone connected id", socket.id);

    /* ── Device slot assignment ── */
    var slotIndex = deviceSlots.indexOf(null);
    if (slotIndex === -1) {
        socket.emit('device-full');
        setTimeout(function () { socket.disconnect(true); }, 500);
        return;
    }
    var shortId = socket.id.slice(0, 5);
    deviceSlots[slotIndex] = { sid: socket.id, shortId: shortId };
    socket.emit('player-assigned', { player: slotIndex + 1, deviceId: shortId });
    io.sockets.emit('device-slots', buildSlots());

    /* Send current wrong counts and bet amount to newly connected client */
    socket.emit('wrong-state', { wrongCounts: wrongCounts, betAmount: betAmount });

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

    /* ── Wrong counter & bet amount ── */
    socket.on('wrong-update', function (data) {
        var p = data.player;
        if (p < 1 || p > 4) return;
        wrongCounts[p] = Math.max(0, wrongCounts[p] + data.delta);
        io.sockets.emit('wrong-update', { player: p, count: wrongCounts[p] });
    });

    socket.on('bet-update', function (data) {
        betAmount = Math.max(0, parseInt(data.betAmount) || 0);
        io.sockets.emit('bet-update', { betAmount: betAmount });
    });

    /* ── ဒေါင်းပြီ agreement flow ── */
    socket.on('dawngPi-request', function (data) {
        var connected = deviceSlots.filter(function (d) { return d !== null; }).length;
        /* Check if the socket is the actual owner of data.player.
           If AI is acting on behalf of an unconnected player, start agreed=[]
           so all connected players must explicitly agree. */
        var slotIdx = deviceSlots.findIndex(function (d) { return d && d.sid === socket.id; });
        var socketPlayer = slotIdx + 1;
        var isOwnRequest = socketPlayer === data.player;
        var initialAgreed = isOwnRequest ? [socket.id] : [];
        dawngPiReq = { requester: socket.id, agreed: initialAgreed };
        io.sockets.emit('dawngPi-request', {
            sid: socket.id, player: data.player,
            agreedCount: initialAgreed.length, totalCount: connected
        });
        if (initialAgreed.length >= connected && connected > 0) { finishDawngPi(); }
    });

    socket.on('dawngPi-agree', function () {
        if (!dawngPiReq) return;
        if (dawngPiReq.agreed.indexOf(socket.id) === -1) {
            dawngPiReq.agreed.push(socket.id);
        }
        var connected = deviceSlots.filter(function (d) { return d !== null; }).length;
        io.sockets.emit('dawngPi-agreed', {
            sid: socket.id,
            agreedCount: dawngPiReq.agreed.length,
            totalCount: connected
        });
        if (dawngPiReq.agreed.length >= connected) { finishDawngPi(); }
    });

    socket.on('firstTurn', function (data) {
        io.sockets.emit('firstTurn', data);
    });

    socket.on('dawngPi-disagree', function () {
        if (!dawngPiReq) return;
        var slotIdx = deviceSlots.findIndex(function (d) { return d && d.sid === socket.id; });
        var playerNum = slotIdx + 1;
        var deviceId  = slotIdx !== -1 ? deviceSlots[slotIdx].shortId : '?';
        dawngPiReq = null;
        io.sockets.emit('dawngPi-disagreed', { player: playerNum, deviceId: deviceId });
    });

    /* ── Voice signaling ── */
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

    socket.on('voice-chunk', function (data) {
        socket.broadcast.emit('voice-chunk', { from: socket.id, buf: data });
    });

    socket.on('voice-status', function (data) {
        socket.broadcast.emit('voice-status', { sid: socket.id, micMuted: data.micMuted, spkMuted: data.spkMuted });
    });

    socket.on('disconnect', function () {
        /* Free device slot */
        var idx = deviceSlots.findIndex(function (d) { return d && d.sid === socket.id; });
        if (idx !== -1) { deviceSlots[idx] = null; }
        io.sockets.emit('device-slots', buildSlots());

        /* Voice cleanup */
        if (voiceUsers[socket.id]) {
            delete voiceUsers[socket.id];
            socket.broadcast.emit('voice-left', { sid: socket.id });
        }

        /* ဒေါင်းပြီ: if requester disconnects, cancel; else recheck agreement */
        if (dawngPiReq) {
            if (dawngPiReq.requester === socket.id) {
                dawngPiReq = null;
                io.sockets.emit('dawngPi-cancelled');
            } else {
                var connected = deviceSlots.filter(function (d) { return d !== null; }).length;
                if (dawngPiReq.agreed.length >= connected) { finishDawngPi(); }
            }
        }
    });

})