(function () {
    'use strict';

    var SAMPLE_RATE = 16000;
    var CHUNK_SIZE  = 2048;

    var localStream = null;
    var captureCtx  = null;
    var processor   = null;
    var muted       = false;

    var playCtx         = null;
    var senderNextTime  = {};   // sid -> scheduled end time

    /* ── Playback context (lazy, resumes on user gesture) ─── */
    function getPlayCtx() {
        if (!playCtx) {
            playCtx = new (window.AudioContext || window.webkitAudioContext)(
                { sampleRate: SAMPLE_RATE }
            );
        }
        if (playCtx.state === 'suspended') {
            playCtx.resume().catch(function () {});
        }
        return playCtx;
    }

    /* ── Receive and play a PCM chunk from a peer ─────────── */
    socket.on('voice-chunk', function (payload) {
        var ctx = getPlayCtx();
        var samples;
        try { samples = new Float32Array(payload.buf); }
        catch (e) { return; }

        var buf = ctx.createBuffer(1, samples.length, SAMPLE_RATE);
        buf.getChannelData(0).set(samples);

        var src = ctx.createBufferSource();
        src.buffer = buf;
        src.connect(ctx.destination);

        /* Schedule seamlessly per-sender, reset if gap > 300 ms */
        var sid  = payload.from;
        var now  = ctx.currentTime;
        var next = senderNextTime[sid] || 0;
        var start = (next - now > 0.3) ? now + 0.05 : Math.max(now + 0.05, next);
        src.start(start);
        senderNextTime[sid] = start + buf.duration;
    });

    /* ── Start capturing microphone ─────────────────────────── */
    function start() {
        navigator.mediaDevices.getUserMedia({ audio: true, video: false })
            .then(function (stream) {
                localStream = stream;

                captureCtx = new (window.AudioContext || window.webkitAudioContext)(
                    { sampleRate: SAMPLE_RATE }
                );
                var src     = captureCtx.createMediaStreamSource(stream);
                processor   = captureCtx.createScriptProcessor(CHUNK_SIZE, 1, 1);

                processor.onaudioprocess = function (e) {
                    if (muted) return;
                    var samples = new Float32Array(e.inputBuffer.getChannelData(0));
                    socket.emit('voice-chunk', samples.buffer);
                };

                /* Silent gain keeps the graph alive without self-playback */
                var silent = captureCtx.createGain();
                silent.gain.value = 0;
                src.connect(processor);
                processor.connect(silent);
                silent.connect(captureCtx.destination);

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
        if (processor)   { processor.disconnect(); processor = null; }
        if (captureCtx)  { captureCtx.close(); captureCtx = null; }
        if (localStream) { localStream.getTracks().forEach(function (t) { t.stop(); }); localStream = null; }
        muted = false;
        senderNextTime = {};
        removeIndicator('me');
        setJoinBtn(false);
        showMuteBtn(false);
        var mb = document.getElementById('btn-mute');
        if (mb) mb.textContent = '🔈 Mute';
    }

    /* ── Public controls ─────────────────────────────────────── */
    window.voiceToggle = function () { if (!localStream) start(); else stop(); };

    window.voiceMute = function () {
        if (!localStream) return;
        muted = !muted;
        localStream.getAudioTracks().forEach(function (t) { t.enabled = !muted; });
        var mb = document.getElementById('btn-mute');
        if (mb) mb.textContent = muted ? '🔇 Unmute' : '🔈 Mute';
    };

    /* ── Presence indicators only (no WebRTC) ─────────────────── */
    socket.on('voice-peers',  function (list) { list.forEach(function (p) { addIndicator(p.sid); }); });
    socket.on('voice-joined', function (d)    { addIndicator(d.sid); });
    socket.on('voice-left',   function (d)    { removeIndicator(d.sid); delete senderNextTime[d.sid]; });

    /* ── UI helpers ──────────────────────────────────────────── */
    function setJoinBtn(on) {
        var b = document.getElementById('btn-voice');
        if (!b) return;
        b.textContent = on ? '🔊 Connected' : '🎤 Join Voice';
        b.classList.toggle('voice-on', on);
    }
    function showMuteBtn(show) {
        var b = document.getElementById('btn-mute');
        if (b) b.style.display = show ? '' : 'none';
    }
    function addIndicator(sid) {
        var id = 'vi-' + sid;
        if (document.getElementById(id)) return;
        var el = document.createElement('span');
        el.id = id; el.className = 'voice-indicator'; el.textContent = '🎤';
        var w = document.getElementById('voice-users');
        if (w) w.appendChild(el);
    }
    function removeIndicator(sid) {
        var el = document.getElementById('vi-' + sid);
        if (el) el.remove();
    }

}());
