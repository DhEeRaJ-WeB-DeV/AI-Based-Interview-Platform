import { useRef } from "react";
import socket from "../../../../socket/socketclient";

export const useRealtimeAudio = () => {

    const contextRef = useRef(null);

    const workletRef = useRef(null);

    const sourceRef = useRef(null);

    const streamRef = useRef(null);

    const startStreaming = async (stream) => {

        streamRef.current = stream;

        const context = new AudioContext({
            sampleRate:  24000 
        });

        contextRef.current = context;

        await context.audioWorklet.addModule(
            new URL("../audio/pcm-processor.js", import.meta.url)
        );

        console.log("AudioWorklet loaded");

        const source =
            context.createMediaStreamSource(stream);

        sourceRef.current = source;

        const node =
            new AudioWorkletNode(
                context,
                "pcm-processor"
            );

        workletRef.current = node;

        node.port.onmessage = ({ data }) => {

            console.log("Samples:", data.samples);

            socket.emit("audio_chunk", data.buffer);


        };
        
        const silent = context.createGain();
        silent.gain.value = 0;

        source.connect(node);
        node.connect(silent);
        silent.connect(context.destination);

        console.log("sample rate:", context.sampleRate);
    };

    const stopStreaming = async () => {

        workletRef.current?.disconnect();
        workletRef.current = null;

        sourceRef.current?.disconnect();
        sourceRef.current = null;

       if (contextRef.current && contextRef.current.state !== "closed") 
        {
           await contextRef.current.close();
      }
      contextRef.current = null;

    };

    return {

        startStreaming,

        stopStreaming

    };

};