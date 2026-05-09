(function () {
    'use strict';

    var localStream = null;
    var peers = {};        // socketId -> RTCPeerConnection
    var voiceActive = false;

    var ICE_CONFIG = {
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' }
        ]
    };

    /* ── UI helpers ── */
    function setBtn(on) {
        var btn = document.getElementById('btn-voice');
        if (!btn) return;
        btn.textContent = on ? '🔇 Leave Voice' : '🎤 Join Voice';
        btn.classList.toggle('voice-on', on);
    }

    function addIndicator(sid, label) {
        if (document.getElementById('vi-' + sid)) return;
        var el = document.createElement('span');
        el.id = 'vi-' + sid;
        el.className = 'voice-indicator';
        el.textContent = label;
        document.getElementById('voice-users').appendChild(el);
    }

    function removeIndicator(sid) {
        var el = document.getElementById('vi-' + sid);
        if (el) el.remove();
    }

    function addAudio(sid, stream) {
        var existing = document.querySelector('audio[data-sid="' + sid + '"]');
        if (existing) { existing.srcObject = stream; return; }
        var audio = document.createElement('audio');
        audio.autoplay = true;
        audio.dataset.sid = sid;
        audio.style.display = 'none';
        document.body.appendChild(audio);
        audio.srcObject = stream;
    }

    function removeAudio(sid) {
        var el = document.querySelector('audio[data-sid="' + sid + '"]');
        if (el) el.remove();
    }

    /* ── Peer connection ── */
    function createPC(sid) {
        var pc = new RTCPeerConnection(ICE_CONFIG);
        peers[sid] = pc;

        if (localStream) {
            localStream.getTracks().forEach(function (t) {
                pc.addTrack(t, localStream);
            });
        }

        pc.ontrack = function (e) {
            addAudio(sid, e.streams[0]);
        };

        pc.onicecandidate = function (e) {
            if (e.candidate) {
                socket.emit('voice-ice', { to: sid, candidate: e.candidate });
            }
        };

        pc.oniceconnectionstatechange = function () {
            if (pc.iceConnectionState === 'disconnected' ||
                pc.iceConnectionState === 'failed' ||
                pc.iceConnectionState === 'closed') {
                removePeer(sid);
            }
        };

        return pc;
    }

    function removePeer(sid) {
        if (peers[sid]) { peers[sid].close(); delete peers[sid]; }
        removeAudio(sid);
        removeIndicator(sid);
    }

    /* ── Public: join / leave ── */
    window.voiceToggle = function () {
        if (voiceActive) {
            voiceLeave();
        } else {
            voiceJoin();
        }
    };

    function voiceJoin() {
        navigator.mediaDevices.getUserMedia({ audio: true, video: false })
            .then(function (stream) {
                localStream = stream;
                voiceActive = true;
                setBtn(true);
                socket.emit('voice-join');
            })
            .catch(function (err) {
                alert('Microphone access denied: ' + err.message);
            });
    }

    function voiceLeave() {
        if (localStream) {
            localStream.getTracks().forEach(function (t) { t.stop(); });
            localStream = null;
        }
        Object.keys(peers).forEach(removePeer);
        voiceActive = false;
        setBtn(false);
        socket.emit('voice-leave');
    }

    /* ── Signaling ── */

    /* Server sends existing peers when we join */
    socket.on('voice-peers', function (list) {
        list.forEach(function (p) {
            addIndicator(p.sid, p.label);
            var pc = createPC(p.sid);
            pc.createOffer()
                .then(function (offer) { return pc.setLocalDescription(offer); })
                .then(function () {
                    socket.emit('voice-offer', { to: p.sid, offer: pc.localDescription });
                });
        });
    });

    /* Someone new joined — they will send us an offer */
    socket.on('voice-joined', function (data) {
        addIndicator(data.sid, data.label);
    });

    /* Incoming offer */
    socket.on('voice-offer', function (data) {
        var pc = createPC(data.from);
        pc.setRemoteDescription(new RTCSessionDescription(data.offer))
            .then(function () { return pc.createAnswer(); })
            .then(function (ans) { return pc.setLocalDescription(ans); })
            .then(function () {
                socket.emit('voice-answer', { to: data.from, answer: pc.localDescription });
            });
    });

    /* Incoming answer */
    socket.on('voice-answer', function (data) {
        var pc = peers[data.from];
        if (pc) pc.setRemoteDescription(new RTCSessionDescription(data.answer));
    });

    /* Incoming ICE candidate */
    socket.on('voice-ice', function (data) {
        var pc = peers[data.from];
        if (pc && data.candidate) {
            pc.addIceCandidate(new RTCIceCandidate(data.candidate)).catch(function () {});
        }
    });

    /* Someone left */
    socket.on('voice-left', function (data) {
        removePeer(data.sid);
    });

}());
