// hooks/useSpeechSynthesis.js

import { useRef } from "react";

export const useSpeechSynthesis = () => {
  const utteranceRef = useRef(null);

const speak = (text, onEnd) => {

    speechSynthesis.cancel();

    const utterance =
        new SpeechSynthesisUtterance(text);

    utterance.onend = () => {

        if(onEnd)
            onEnd();

    }

    speechSynthesis.speak(utterance);

}

  const stopSpeaking = () => {
    speechSynthesis.cancel();
  };

  return { speak, stopSpeaking };
};