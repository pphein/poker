(function () {
    'use strict';

    var localStream = null;
    var muted       = false;
    var peers       = {};   // socketId -> RTCPeerConnection

    var ICE_SERVERS = {
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun2.l.google.com:19302' },
            {
                urls: [
                    'turn:openrelay.metered.ca:80',
                    'turn:openrelay.metered.ca:443',
                    'turn:openrelay.metered.ca:443?transport=tcp'
                ],
                username:   'openrelayproject',
                credential: 'openrelayproject'
            }
        ]
    };

    /* ── Audio playback ─────────────────────────────────────── */
    function playAudio(el) {
        el.muted = false;
        var p = el.play();
        if (p && typeof p.catch === 'function') {
            p.catch(function () {
                /* Autoplay blocked — resume on next user tap/click */
                function resume() {
                    el.play().catch(function () {});
                    document.removeEventListener('click',      resume);
                    document.removeEventListener('touchstart', resume);
                }
                document.addEventListener('click',      resume, { once: true });
                document.addEventListener('touchstart', resume, { once: true });
            });
        }
    }

    function attachAudio(sid, stream) {
        var el = document.querySelector('audio[data-sid="' + sid + '"]');
        if (!el) {
            el = document.createElement('audio');
            el.dataset.sid = sid;
            el.setAttribute('playsinline', '');
            el.style.display = 'none';
            document.body.appendChild(el);
        }
        el.srcObject = stream;
        playAudio(el);
    }

    function detachAudio(sid) {
        var el = document.querySelector('audio[data-sid="' + sid + '"]');
        if (el) { el.srcObject = null; el.remove(); }
    }

    /* ── UI ─────────────────────────────────────────────────── */
    function setJoinBtn(connected) {
        var b = document.getElementById('btn-voice');
        if (!b) return;
        b.textContent = connected ? '🔊 Connected' : '🎤 Join Voice';
        b.classList.toggle('voice-on', connected);
    }

    function showMuteBtn(show) {
        var b = document.getElementById('btn-mute');
        if (b) b.style.display = show ? '' : 'none';
    }

    function addIndicator(sid) {
        var id = 'vi-' + sid;
        if (document.getElementById(id)) return;
        var el = document.createElement('span');
        el.id = id;
        el.className = 'voice-indicator';
        el.textContent = '🎤';
        var wrap = document.getElementById('voice-users');
        if (wrap) wrap.appendChild(el);
    }

    function removeIndicator(sid) {
        var el = document.getElementById('vi-' + sid);
        if (el) el.remove();
    }

    /* ── Peer connection ────────────────────────────────────── */
    function makePC(sid) {
        if (peers[sid]) { try { peers[sid].close(); } catch (e) {} }

        var pc = new RTCPeerConnection(ICE_SERVERS);
        peers[sid] = pc;

        /* Send our mic audio to the peer */
        if (localStream) {
            localStream.getTracks().forEach(function (t) {
                pc.addTrack(t, localStream);
            });
        }

        /* Receive peer's audio */
        pc.ontrack = function (e) {
            if (e.streams && e.streams[0]) {
                attachAudio(sid, e.streams[0]);
            }
        };

        /* Forward ICE candidates */
        pc.onicecandidate = function (e) {
            if (e.candidate) {
                socket.emit('voice-ice', { to: sid, candidate: e.candidate });
            }
        };

        pc.oniceconnectionstatechange = function () {
            if (pc.iceConnectionState === 'closed' ||
                pc.iceConnectionState === 'failed') {
                removePeer(sid);
            }
        };

        return pc;
    }

    function removePeer(sid) {
        if (peers[sid]) {
            try { peers[sid].close(); } catch (e) {}
            delete peers[sid];
        }
        detachAudio(sid);
        removeIndicator(sid);
    }

    /* ── Join / Leave / Mute ────────────────────────────────── */
    function start() {
        navigator.mediaDevices.getUserMedia({ audio: true, video: false })
            .then(function (stream) {
                localStream = stream;
                setJoinBtn(true);
                showMuteBtn(true);
                addIndicator('me');
                socket.emit('voice-join');
            })
            .catch(function (err) {
                alert('Microphone error: ' + err.message);
            });
    }

    function stop() {
        socket.emit('voice-leave');
        Object.keys(peers).forEach(removePeer);
        if (localStream) {
            localStream.getTracks().forEach(function (t) { t.stop(); });
            localStream = null;
        }
        removeIndicator('me');
        setJoinBtn(false);
        showMuteBtn(false);
        muted = false;
        var mb = document.getElementById('btn-mute');
        if (mb) mb.textContent = '🔈 Mute';
    }

    window.voiceToggle = function () {
        if (!localStream) { start(); } else { stop(); }
    };

    window.voiceMute = function () {
        if (!localStream) return;
        muted = !muted;
        localStream.getAudioTracks().forEach(function (t) { t.enabled = !muted; });
        var mb = document.getElementById('btn-mute');
        if (mb) mb.textContent = muted ? '🔇 Unmute' : '🔈 Mute';
    };

    /* ── Signalling ─────────────────────────────────────────── */

    /* Server sends the list of people already in the call */
    socket.on('voice-peers', function (list) {
        list.forEach(function (p) {
            addIndicator(p.sid);
            var pc = makePC(p.sid);
            pc.createOffer({ offerToReceiveAudio: true })
                .then(function (offer) { return pc.setLocalDescription(offer); })
                .then(function () {
                    socket.emit('voice-offer', { to: p.sid, offer: pc.localDescription });
                })
                .catch(function (e) { console.error('offer error', e); });
        });
    });

    /* A new person joined — they will send us an offer */
    socket.on('voice-joined', function (data) {
        addIndicator(data.sid);
    });

    /* Incoming offer */
    socket.on('voice-offer', function (data) {
        var pc = makePC(data.from);
        pc.setRemoteDescription(new RTCSessionDescription(data.offer))
            .then(function () { return pc.createAnswer(); })
            .then(function (ans) { return pc.setLocalDescription(ans); })
            .then(function () {
                socket.emit('voice-answer', { to: data.from, answer: pc.localDescription });
            })
            .catch(function (e) { console.error('answer error', e); });
    });

    /* Incoming answer */
    socket.on('voice-answer', function (data) {
        var pc = peers[data.from];
        if (pc) {
            pc.setRemoteDescription(new RTCSessionDescription(data.answer))
                .catch(function (e) { console.error('setRemote error', e); });
        }
    });

    /* Incoming ICE candidate */
    socket.on('voice-ice', function (data) {
        var pc = peers[data.from];
        if (pc && data.candidate) {
            pc.addIceCandidate(new RTCIceCandidate(data.candidate))
                .catch(function () {});
        }
    });

    /* Peer left */
    socket.on('voice-left', function (data) {
        removePeer(data.sid);
    });

}());
