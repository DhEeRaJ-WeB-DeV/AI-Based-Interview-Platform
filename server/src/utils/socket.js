const WebSocket = require("ws");

// npm install ws   (if not already in package.json)

module.exports = (io) => {

    const interviewSessions = new Map();

    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

    if (!OPENAI_API_KEY) {
        console.warn(
            "OPENAI_API_KEY is not set — realtime transcription will fail to authenticate."
        );
    }

    // ?intent=transcription opens a transcription-only session (no spoken
    // assistant response, no conversation.create). This is the correct
    // endpoint for "just turn this audio into text".
    const REALTIME_WS_URL = "wss://api.openai.com/v1/realtime?intent=transcription";

    // gpt-4o-transcribe (not the "mini" variant) — mini is cheaper but
    // hallucinates more often on silence/noise, which is what produced the
    // random Urdu/Japanese text. Costs more per minute, worth it here.
    // + server_vad = OpenAI auto-detects speech turns and auto-commits the
    // buffer, so you don't need a manual commit loop.
    // If you switch to "gpt-realtime-whisper" for lower latency, you MUST
    // set turn_detection to null and commit manually on an interval instead
    // (see commented alternative below).
    const TRANSCRIPTION_MODEL = "gpt-4o-transcribe";

    // Must match the sampleRate the frontend's AudioContext is created
    // with. OpenAI enforces rate >= 24000 for "audio/pcm" — 16000 is
    // rejected outright, so this needs to be 24000 (or higher) on both
    // ends. If you change this, change it in useRealtimeAudio.js too.
    const INPUT_SAMPLE_RATE = 24000;

    function connectRealtimeTranscription(interviewId, session) {

        const ws = new WebSocket(REALTIME_WS_URL, {
            headers: {
                Authorization: `Bearer ${OPENAI_API_KEY}`,
            },
        });

        ws.on("open", () => {

            console.log(`Realtime transcription connected: ${interviewId}`);

            ws.send(JSON.stringify({
                type: "session.update",
                session: {
                    type: "transcription",
                    audio: {
                        input: {
                            format: {
                                type: "audio/pcm",
                                rate: INPUT_SAMPLE_RATE,
                            },
                            // Filters the audio before it reaches VAD/the
                            // model. "near_field" = headset/earbud mic close
                            // to the mouth. Switch to "far_field" if most
                            // candidates use a laptop's built-in mic.
                            noise_reduction: {
                                type: "near_field",
                            },
                            transcription: {
                                model: TRANSCRIPTION_MODEL,
                                language: "en",
                                // Primes the model on what to expect so it
                                // doesn't mishear an unfamiliar Indian
                                // place/city name and switch to another
                                // script (Japanese, Arabic, etc). This is
                                // guidance, not a hard guarantee — keep it
                                // short, it's not a system prompt.
                                prompt: "English interview with Indian names. Use Latin alphabet."
                            },
                            turn_detection: {
                                type: "server_vad",
                                // Higher threshold = needs louder/clearer
                                // speech to count as a turn, so ambient
                                // noise and breathing don't get sent as an
                                // "utterance" for the model to hallucinate
                                // on.
                                threshold: 0.6,
                                prefix_padding_ms: 300,
                                // Wait for a longer pause before treating
                                // the turn as finished, so it doesn't cut
                                // mid-sentence on every breath.
                                silence_duration_ms: 1000,
                            },
                        },
                    },
                },
            }));

        });

        ws.on("message", (raw) => {

            let event;

            try {
                event = JSON.parse(raw.toString());
            } catch (err) {
                console.error(`Failed to parse realtime event [${interviewId}]:`, err);
                return;
            }

            if (event.type === "conversation.item.input_audio_transcription.delta") {

                // Partial text as it streams in — good for showing a live
                // "typing" transcript in the UI before the turn finishes.
                io.to(interviewId).emit("transcript", {
                    transcript: event.delta,
                    fullTranscript: session.transcript + event.delta,
                    partial: true,
                    questionSeq: session.questionSeq,
                });

                return;
            }

            if (event.type === "conversation.item.input_audio_transcription.completed") {

                session.transcript += event.transcript + " ";

                io.to(interviewId).emit("transcript", {
                    transcript: event.transcript,
                    fullTranscript: session.transcript,
                    partial: false,
                    questionSeq: session.questionSeq,
                });

                io.to(interviewId).emit("transcript_commit_complete");
                return;
            }

            if (event.type === "error") {
                console.error(`Realtime API error [${interviewId}]:`, event.error);

                if (event.error?.code === "input_audio_buffer_commit_empty") {
                    io.to(interviewId).emit("transcript_commit_complete");
                }
                return;
            }

        });

        ws.on("error", (err) => {
            console.error(`Realtime WS error [${interviewId}]:`, err);
        });

        ws.on("close", (code, reason) => {
            console.log(`Realtime WS closed [${interviewId}]:`, code, reason?.toString());
        });

        return ws;

    }

    // --- Alternative for gpt-realtime-whisper (manual commit) ---
    // setInterval(() => {
    //     for (const session of interviewSessions.values()) {
    //         if (session.ws && session.ws.readyState === WebSocket.OPEN) {
    //             session.ws.send(JSON.stringify({ type: "input_audio_buffer.commit" }));
    //         }
    //     }
    // }, 1000);

    io.on("connection", (socket) => {

        console.log("Socket connected:", socket.id);

        socket.on("join_interview", ({ interviewId }) => {

            socket.join(interviewId);

            socket.data.interviewId = interviewId;

            if (!interviewSessions.has(interviewId)) {

                const session = {
                    transcript: "",
                    ws: null,
                    // Bumped on every "start_question". Stamped onto every
                    // transcript event so the frontend can tell a late/stale
                    // event from a previous question apart from a current one.
                    questionSeq: 0,
                };

                session.ws = connectRealtimeTranscription(interviewId, session);

                interviewSessions.set(interviewId, session);

            }

            socket.emit("joined_interview", {
                interviewId,
            });

        });

        // Frontend fires this right before starting to stream a new
        // question's answer. Without this, session.transcript would keep
        // accumulating across the whole interview instead of being scoped
        // to one question's answer.
        socket.on("start_question", () => {

            const interviewId = socket.data.interviewId;

            const session = interviewSessions.get(interviewId);

            if (session) {
                session.transcript = "";
                session.questionSeq += 1;
            }

        });

        // Frontend fires this right before it stops streaming (e.g. user
        // clicked "Next" or the timer ran out). Forces OpenAI to finalize
        // whatever's still sitting in the buffer so the last sentence isn't
        // silently dropped from the transcript.
        socket.on("commit_audio", () => {

            const interviewId = socket.data.interviewId;

            const session = interviewSessions.get(interviewId);

            if (!session?.ws || session.ws.readyState !== WebSocket.OPEN) {
                return;
            }

            try {
                session.ws.send(JSON.stringify({ type: "input_audio_buffer.commit" }));
            } catch (err) {
                // Harmless if the buffer was already empty (server_vad had
                // already committed everything) — OpenAI just returns an
                // error event for it, already handled in the message handler.
                console.error(`Manual commit failed [${interviewId}]:`, err);
            }

        });

        socket.on("audio_chunk", (pcm) => {

            const interviewId = socket.data.interviewId;

            const session = interviewSessions.get(interviewId);

            if (!session || !session.ws || session.ws.readyState !== WebSocket.OPEN) {
                return;
            }

            const base64 = Buffer.from(pcm).toString("base64");

            session.ws.send(JSON.stringify({
                type: "input_audio_buffer.append",
                audio: base64,
            }));

        });

        socket.on("disconnect", () => {

            const interviewId = socket.data.interviewId;

            const session = interviewSessions.get(interviewId);

            if (session?.ws) {
                session.ws.close();
            }

            interviewSessions.delete(interviewId);

            console.log(socket.id, "disconnected");

        });

    });

};