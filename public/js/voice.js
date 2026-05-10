(function () {
    'use strict';

    var SAMPLE_RATE = 16000;
    var CHUNK_SIZE  = 2048;

    var localStream = null;
    var captureCtx  = null;
    var processor   = null;
    var muted       = false;

    var playCtx        = null;
    var senderNextTime = {};   // sid -> scheduled end time
    var mutedSpeakers  = {};   // playerNum -> true

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
        /* Per-speaker mute check */
        var pNum = (typeof sidToPlayer !== 'undefined') ? sidToPlayer[payload.from] : null;
        if (pNum && mutedSpeakers[pNum]) return;

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
        navigator.mediaDevices.getUserMedia({
            audio: {
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true
            },
            video: false
        })
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
                showMicBtn(true);
                showOwnDot(true);
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
        showOwnDot(false);
        setJoinBtn(false);
        showMicBtn(false);
        var mb = myPlayerNum ? document.getElementById('pv-mic-' + myPlayerNum) : null;
        if (mb) mb.textContent = '🎤 Mic';
    }

    /* ── Public controls ─────────────────────────────────────── */
    window.voiceToggle = function () { if (!localStream) start(); else stop(); };

    window.voiceMute = function () {
        if (!localStream) return;
        muted = !muted;
        localStream.getAudioTracks().forEach(function (t) { t.enabled = !muted; });
        var mb = myPlayerNum ? document.getElementById('pv-mic-' + myPlayerNum) : null;
        if (mb) mb.textContent = muted ? '🔇 Mic' : '🎤 Mic';
    };

    window.toggleSpeakerMute = function (playerNum) {
        mutedSpeakers[playerNum] = !mutedSpeakers[playerNum];
        var btn = document.getElementById('pv-spk-' + playerNum);
        if (btn) {
            btn.textContent = mutedSpeakers[playerNum] ? '🔇' : '🔊';
            btn.classList.toggle('spk-muted', mutedSpeakers[playerNum]);
        }
    };

    /* ── Presence indicators ─────────────────────────────────── */
    socket.on('voice-peers',  function (list) { list.forEach(function (p) { addIndicator(p.sid); }); });
    socket.on('voice-joined', function (d)    { addIndicator(d.sid); });
    socket.on('voice-left',   function (d)    { removeIndicator(d.sid); delete senderNextTime[d.sid]; });

    /* ── UI helpers ──────────────────────────────────────────── */
    function setJoinBtn(on) {
        if (!myPlayerNum) return;
        var b = document.getElementById('pv-join-' + myPlayerNum);
        if (!b) return;
        b.textContent = on ? '🔊 Leave' : '🎤 Join';
        b.classList.toggle('voice-on', on);
    }
    function showMicBtn(show) {
        if (!myPlayerNum) return;
        var b = document.getElementById('pv-mic-' + myPlayerNum);
        if (b) b.style.display = show ? '' : 'none';
    }
    function showOwnDot(show) {
        if (!myPlayerNum) return;
        var dot = document.getElementById('pv-dot-' + myPlayerNum);
        if (dot) dot.style.display = show ? '' : 'none';
    }
    function addIndicator(sid) {
        var pNum = (typeof sidToPlayer !== 'undefined') ? sidToPlayer[sid] : null;
        if (!pNum) return;
        var dot = document.getElementById('pv-dot-' + pNum);
        if (dot) dot.style.display = '';
    }
    function removeIndicator(sid) {
        var pNum = (typeof sidToPlayer !== 'undefined') ? sidToPlayer[sid] : null;
        if (!pNum) return;
        var dot = document.getElementById('pv-dot-' + pNum);
        if (dot) dot.style.display = 'none';
    }

}());
