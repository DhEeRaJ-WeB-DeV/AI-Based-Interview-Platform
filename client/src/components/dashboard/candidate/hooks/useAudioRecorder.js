import { useRef, useState } from "react";
import socket from "../../../../socket/socketclient";

export const useAudioRecorder = () => {
  const mediaRecorderRef = useRef(null);
  const chunksRef        = useRef([]);
  const streamRef        = useRef(null);
  const [recording, setRecording] = useState(false);

 const startRecording = (stream) => {
const audioStream = new MediaStream(
    stream.getAudioTracks()
);

streamRef.current = audioStream;

chunksRef.current = [];

const recorder =
    new MediaRecorder(audioStream);
   recorder.ondataavailable = (e) => {

    if (e.data.size === 0)
        return;

    chunksRef.current.push(e.data);

};

    mediaRecorderRef.current = recorder;
    recorder.start(1000);
    setRecording(true);
  };

  const stopRecording = () => {
    return new Promise((resolve) => {
      const recorder = mediaRecorderRef.current;
      if (!recorder || recorder.state === "inactive") return resolve(null);

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setRecording(false);
        resolve(blob);
      };

      recorder.stop();
    });
  };

  return { startRecording, stopRecording, recording, streamRef };
};