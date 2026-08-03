import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

export default function useDeviceCheck() {
  const [deviceStatus, setDeviceStatus] = useState("idle");
  const [audioLevel, setAudioLevel] = useState(0);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const rafRef = useRef(null);

  const stopDeviceCheck = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close();
      audioCtxRef.current = null;
    }
    setAudioLevel(0);
  };


  useEffect(() => stopDeviceCheck, []);
  useEffect(() => {
    if (deviceStatus === "previewing" && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(() => {});
    }
  }, [deviceStatus]);

  const startDeviceCheck = async () => {
    if (deviceStatus === "requesting" || deviceStatus === "previewing") return;
    setDeviceStatus("requesting");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      streamRef.current = stream;

      // audio level meter
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      audioCtxRef.current = audioCtx;
      analyserRef.current = analyser;

      const data = new Uint8Array(analyser.frequencyBinCount);
      const tick = () => {
        analyser.getByteFrequencyData(data);
        const avg = data.reduce((sum, v) => sum + v, 0) / data.length;
        setAudioLevel(Math.min(100, Math.round((avg / 255) * 100 * 2)));
        rafRef.current = requestAnimationFrame(tick);
      };
      tick();

      setDeviceStatus("previewing");
    } catch (err) {
      setDeviceStatus("error");
      toast.error("Camera/microphone access denied. Please allow it in your browser settings.");
    }
  };

  const confirmDeviceCheck = () => {
    stopDeviceCheck();
    setDeviceStatus("success");
  };

  const retryDeviceCheck = () => {
    stopDeviceCheck();
    setDeviceStatus("idle");
  };

  return {
    videoRef,
    deviceStatus,
    audioLevel,
    startDeviceCheck,
    confirmDeviceCheck,
    retryDeviceCheck,
  };
}