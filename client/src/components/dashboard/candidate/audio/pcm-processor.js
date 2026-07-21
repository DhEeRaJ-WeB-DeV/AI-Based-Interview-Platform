class PCMProcessor extends AudioWorkletProcessor {

    process(inputs) {

        const input = inputs[0];

        if (!input.length) return true;

        const channel = input[0];

        const pcm = new Int16Array(channel.length);

        for (let i = 0; i < channel.length; i++) {

            let s = Math.max(-1, Math.min(1, channel[i]));

            pcm[i] = s < 0
                ? s * 0x8000
                : s * 0x7FFF;
        }

        this.port.postMessage({
            samples: pcm.length,
            buffer: pcm.buffer
        });

        return true;
    }
}

registerProcessor("pcm-processor", PCMProcessor);