(function () {
    'use strict';

    var localStream = null;
    var muted = false;
    var peers = {};   // socketId -> RTCPeerConnection

    var ICE = {
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            /* TURN relay — needed for devices on different networks / behind NAT */
            {
                urls: [
                    'turn:openrelay.metered.ca:80',
                    'turn:openrelay.metered.ca:443',
                    'turn:openrelay.metered.ca:443?transport=tcp'
                ],
                username: 'openrelayproject',
                credential: 'openrelayproject'
            }
        ]
    };

    /* ────────────────────────────────────────────
       UI
    ──────────────────────────────────────────── */
    function setStatus(text, on) {
        var btn = document.getElementById('btn-voice');
        if (btn) { btn.textContent = text; btn.classList.toggle('voice-on', !!on); }
    }

    function addIndicator(sid) {
        if (document.getElementById('vi-' + sid)) return;
        var el = document.createElement('span');
        el.id = 'vi-' + sid;
        el.className = 'voice-indicator';
        el.textContent = '🎤';
        document.getElementById('voice-users').appendChild(el);
    }

    function removeIndicator(sid) {
        var el = document.getElementById('vi-' + sid);
        if (el) el.remove();
    }

    function attachAudio(sid, stream) {
        var el = document.querySelector('audio[data-sid="' + sid + '"]');
        if (!el) {
            el = document.createElement('audio');
            el.autoplay = true;
            el.dataset.sid = sid;
            el.style.display = 'none';
            document.body.appendChild(el);
        }
        el.srcObject = stream;
    }

    function detachAudio(sid) {
        var el = document.querySelector('audio[data-sid="' + sid + '"]');
        if (el) el.remove();
    }

    /* ────────────────────────────────────────────
       Peer connection
    ──────────────────────────────────────────── */
    function createPC(sid) {
        if (peers[sid]) { peers[sid].close(); }

        var pc = new RTCPeerConnection(ICE);
        peers[sid] = pc;

        /* Add our mic tracks */
        if (localStream) {
            localStream.getTracks().forEach(function (t) { pc.addTrack(t, localStream); });
        }

        /* Play remote audio */
        pc.ontrack = function (e) { attachAudio(sid, e.streams[0]); };

        /* Send ICE candidates through signalling server */
        pc.onicecandidate = function (e) {
            if (e.candidate) {
                socket.emit('voice-ice', { to: sid, candidate: e.candidate });
            }
        };

        pc.oniceconnectionstatechange = function () {
            if (pc.iceConnectionState === 'failed') { pc.restartIce(); }
            if (pc.iceConnectionState === 'closed' ||
                pc.iceConnectionState === 'disconnected') { removePeer(sid); }
        };

        return pc;
    }

    function removePeer(sid) {
        if (peers[sid]) { peers[sid].close(); delete peers[sid]; }
        detachAudio(sid);
        removeIndicator(sid);
    }

    /* ────────────────────────────────────────────
       Start / stop / mute
    ──────────────────────────────────────────── */
    function showMuteBtn(visible) {
        var b = document.getElementById('btn-mute');
        if (b) b.style.display = visible ? '' : 'none';
    }

    function start() {
        navigator.mediaDevices.getUserMedia({ audio: true, video: false })
            .then(function (stream) {
                localStream = stream;
                setStatus('🔊 Connected', true);
                showMuteBtn(true);
                addIndicator('me');
                socket.emit('voice-join');
            })
            .catch(function (err) {
                alert('Microphone error: ' + err.message);
            });
    }

    function stop() {
        Object.keys(peers).forEach(removePeer);
        if (localStream) { localStream.getTracks().forEach(function (t) { t.stop(); }); localStream = null; }
        removeIndicator('me');
        setStatus('🎤 Join Voice', false);
        showMuteBtn(false);
        muted = false;
        socket.emit('voice-leave');
    }

    window.voiceToggle = function () {
        if (!localStream) { start(); } else { stop(); }
    };

    window.voiceMute = function () {
        if (!localStream) return;
        muted = !muted;
        localStream.getAudioTracks().forEach(function (t) { t.enabled = !muted; });
        document.getElementById('btn-mute').textContent = muted ? '🔇 Unmute' : '🔈 Mute';
    };

    /* ────────────────────────────────────────────
       Signalling
    ──────────────────────────────────────────── */

    /* We joined — server sends us the list of existing users */
    socket.on('voice-peers', function (list) {
        list.forEach(function (p) {
            addIndicator(p.sid);
            var pc = createPC(p.sid);
            /* We initiate the offer to the existing peer */
            pc.createOffer({ offerToReceiveAudio: true })
                .then(function (offer) { return pc.setLocalDescription(offer); })
                .then(function () {
                    socket.emit('voice-offer', { to: p.sid, offer: pc.localDescription });
                });
        });
    });

    /* New user joined — they will send us an offer shortly */
    socket.on('voice-joined', function (data) {
        addIndicator(data.sid);
    });

    /* Incoming offer from a peer who joined after us */
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
    socket.on('voice-left', function (data) { removePeer(data.sid); });

}());
