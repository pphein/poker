(function () {
    'use strict';

    var SAMPLE_RATE = 16000;
    var CHUNK_SIZE  = 2048;

    var localStream = null;
    var captureCtx  = null;
    var processor   = null;
    var micMuted    = false;
    var spkMuted    = false;

    var playCtx        = null;
    var senderNextTime = {};

    /* ── Playback context ─────────────────────────────────────── */
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

    /* ── Receive and play a PCM chunk from a peer ─────────────── */
    socket.on('voice-chunk', function (payload) {
        if (spkMuted) return;  // self-deafen: drop all incoming audio

        var ctx = getPlayCtx();
        var samples;
        try { samples = new Float32Array(payload.buf); }
        catch (e) { return; }

        var buf = ctx.createBuffer(1, samples.length, SAMPLE_RATE);
        buf.getChannelData(0).set(samples);

        var src = ctx.createBufferSource();
        src.buffer = buf;
        src.connect(ctx.destination);

        var sid  = payload.from;
        var now  = ctx.currentTime;
        var next = senderNextTime[sid] || 0;
        var start = (next - now > 0.3) ? now + 0.05 : Math.max(now + 0.05, next);
        src.start(start);
        senderNextTime[sid] = start + buf.duration;
    });

    /* ── Receive mute status from peers ──────────────────────── */
    socket.on('voice-status', function (data) {
        var pNum = (typeof sidToPlayer !== 'undefined') ? sidToPlayer[data.sid] : null;
        if (!pNum) return;
        setMicStatus(pNum, data.micMuted);
        setSpkStatus(pNum, data.spkMuted);
    });

    function emitStatus() {
        if (localStream) {
            socket.emit('voice-status', { micMuted: micMuted, spkMuted: spkMuted });
        }
    }

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
                    if (micMuted) return;
                    var samples = new Float32Array(e.inputBuffer.getChannelData(0));
                    socket.emit('voice-chunk', samples.buffer);
                };

                var silent = captureCtx.createGain();
                silent.gain.value = 0;
                src.connect(processor);
                processor.connect(silent);
                silent.connect(captureCtx.destination);

                setJoinBtn(true);
                showVoiceCtrl(true);
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
        micMuted = false;
        spkMuted = false;
        senderNextTime = {};
        showOwnDot(false);
        setJoinBtn(false);
        showVoiceCtrl(false);
        if (myPlayerNum) {
            setMicStatus(myPlayerNum, false);
            setSpkStatus(myPlayerNum, false);
        }
        resetCtrlBtns();
    }

    /* ── Public controls ─────────────────────────────────────── */
    window.voiceToggle = function () { if (!localStream) start(); else stop(); };

    window.voiceMute = function () {
        if (!localStream) return;
        micMuted = !micMuted;
        localStream.getAudioTracks().forEach(function (t) { t.enabled = !micMuted; });
        var b = myPlayerNum ? document.getElementById('pv-mic-' + myPlayerNum) : null;
        if (b) { b.textContent = micMuted ? '🔇 Mic' : '🎤 Mic'; b.classList.toggle('muted', micMuted); }
        if (myPlayerNum) setMicStatus(myPlayerNum, micMuted);
        emitStatus();
    };

    window.voiceSpkMute = function () {
        if (!localStream) return;
        spkMuted = !spkMuted;
        var b = myPlayerNum ? document.getElementById('pv-spk-' + myPlayerNum) : null;
        if (b) { b.textContent = spkMuted ? '🔇 Spk' : '🔊 Spk'; b.classList.toggle('muted', spkMuted); }
        if (myPlayerNum) setSpkStatus(myPlayerNum, spkMuted);
        emitStatus();
    };

    /* ── Presence indicators ─────────────────────────────────── */
    socket.on('voice-peers',  function (list) { list.forEach(function (p) { addIndicator(p.sid); }); });
    socket.on('voice-joined', function (d)    { addIndicator(d.sid); });
    socket.on('voice-left',   function (d) {
        removeIndicator(d.sid);
        delete senderNextTime[d.sid];
        var pNum = (typeof sidToPlayer !== 'undefined') ? sidToPlayer[d.sid] : null;
        if (pNum) { setMicStatus(pNum, false); setSpkStatus(pNum, false); }
    });

    /* ── UI helpers ──────────────────────────────────────────── */
    function setJoinBtn(on) {
        if (!myPlayerNum) return;
        var b = document.getElementById('pv-join-' + myPlayerNum);
        if (!b) return;
        b.textContent = on ? '🔊 Leave' : '🎤 Join';
        b.classList.toggle('voice-on', on);
    }
    function showVoiceCtrl(show) {
        if (!myPlayerNum) return;
        ['pv-mic-', 'pv-spk-'].forEach(function (pfx) {
            var b = document.getElementById(pfx + myPlayerNum);
            if (b) b.style.display = show ? '' : 'none';
        });
    }
    function resetCtrlBtns() {
        if (!myPlayerNum) return;
        var mic = document.getElementById('pv-mic-' + myPlayerNum);
        if (mic) { mic.textContent = '🎤 Mic'; mic.classList.remove('muted'); }
        var spk = document.getElementById('pv-spk-' + myPlayerNum);
        if (spk) { spk.textContent = '🔊 Spk'; spk.classList.remove('muted'); }
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
    function setMicStatus(pNum, on) {
        var el = document.getElementById('pv-mic-st-' + pNum);
        if (el) el.style.display = on ? '' : 'none';
    }
    function setSpkStatus(pNum, on) {
        var el = document.getElementById('pv-spk-st-' + pNum);
        if (el) el.style.display = on ? '' : 'none';
    }

}());
