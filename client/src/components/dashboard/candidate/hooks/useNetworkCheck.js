//browser

// import { useState } from "react";
// import toast from "react-hot-toast";

// // Gauge scale, all in MB/s (megabytes per second). Exported so consuming
// // components (e.g. the gauge UI) can stay in sync with these thresholds.
// export const NETWORK_GAUGE_MAX_MBPS = 12; // right end of the gauge
// export const NETWORK_POOR_MAX_MBPS = 1; // below this = red / not good enough
// export const NETWORK_FAIR_MAX_MBPS = 3; // between poor and fair = amber, above = green

// // Cache-busted, CORS-enabled test file used to measure download throughput.
// const SPEED_TEST_URL = "https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css";
// const PING_TEST_URL = "https://www.gstatic.com/generate_204";

// export default function useNetworkCheck() {
//   const [internetStatus, setInternetStatus] = useState("idle");
//   const [downloadMBps, setDownloadMBps] = useState(null);
//   const [pingMs, setPingMs] = useState(null);
//   const [jitterMs, setJitterMs] = useState(null);

//   // Runs a handful of small round trips to estimate ping (average) and
//   // jitter (standard deviation between round trips).
//   const measurePing = async (rounds = 4) => {
//     const times = [];
//     for (let i = 0; i < rounds; i++) {
//       const start = performance.now();
//       try {
//         await fetch(`${PING_TEST_URL}?cb=${Date.now()}_${i}`, {
//           mode: "no-cors",
//           cache: "no-store",
//         });
//       } catch {
//         // ignore individual failures, still record the elapsed time
//       }
//       times.push(performance.now() - start);
//     }
//     const avg = times.reduce((a, b) => a + b, 0) / times.length;
//     const variance = times.reduce((a, b) => a + (b - avg) ** 2, 0) / times.length;
//     return { avg, jitter: Math.sqrt(variance) };
//   };

//   const checkInternet = async () => {
//     if (internetStatus === "checking") return;
//     setInternetStatus("checking");
//     setDownloadMBps(null);
//     setPingMs(null);
//     setJitterMs(null);

//     if (!navigator.onLine) {
//       setInternetStatus("error");
//       toast.error("No internet connection detected.");
//       return;
//     }

//     try {
//       const { avg, jitter } = await measurePing();
//       setPingMs(avg);
//       setJitterMs(jitter);

//       const start = performance.now();
//       const response = await fetch(`${SPEED_TEST_URL}?cb=${Date.now()}`, {
//         cache: "no-store",
//       });
//       const blob = await response.blob();
//       const durationSeconds = (performance.now() - start) / 1000;

//       const bytesPerSecond = durationSeconds > 0 ? blob.size / durationSeconds : 0;
//       const mbPerSecond = bytesPerSecond / (1024 * 1024);
//       setDownloadMBps(mbPerSecond);

//       if (mbPerSecond >= NETWORK_POOR_MAX_MBPS) {
//         setInternetStatus("success");
//       } else {
//         setInternetStatus("error");
//         toast.error(
//           `Your connection is too slow (${mbPerSecond.toFixed(2)} MB/s). Need at least ${NETWORK_POOR_MAX_MBPS} MB/s.`
//         );
//       }
//     } catch (err) {
//       setInternetStatus("error");
//       toast.error("Could not verify your internet connection.");
//     }
//   };

//   return {
//     internetStatus,
//     downloadMBps,
//     pingMs,
//     jitterMs,
//     checkInternet,
//   };
// }

//cloudflare 
import { useState } from "react";
import toast from "react-hot-toast";

export const NETWORK_GAUGE_MAX_MBPS = 12;
export const NETWORK_POOR_MAX_MBPS = 1;
export const NETWORK_FAIR_MAX_MBPS = 3; 

const CLOUDFLARE_DOWN_URL = "https://speed.cloudflare.com/__down";
const FALLBACK_SPEED_TEST_URL =
  "https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css";
const PING_TEST_URL = "https://www.gstatic.com/generate_204";


const TEST_BYTES = Math.round(
  Math.min(
    25 * 1024 * 1024,
    Math.max(2 * 1024 * 1024, NETWORK_GAUGE_MAX_MBPS * 1024 * 1024 * 1.5)
  )
);

export default function useNetworkCheck() {
  const [internetStatus, setInternetStatus] = useState("idle");
  const [downloadMBps, setDownloadMBps] = useState(null);
  const [pingMs, setPingMs] = useState(null);
  const [jitterMs, setJitterMs] = useState(null);


  const measurePing = async (rounds = 4) => {
    const times = [];
    for (let i = 0; i < rounds; i++) {
      const start = performance.now();
      try {
        await fetch(`${PING_TEST_URL}?cb=${Date.now()}_${i}`, {
          mode: "no-cors",
          cache: "no-store",
        });
      } catch(err) {
        console.log(err.message);
      }
      times.push(performance.now() - start);
    }
    const avg = times.reduce((a, b) => a + b, 0) / times.length;
    const variance = times.reduce((a, b) => a + (b - avg) ** 2, 0) / times.length;
    return { avg, jitter: Math.sqrt(variance) };
  };


  const timeDownload = async (url) => {
    const start = performance.now();
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) throw new Error(`Bad response: ${response.status}`);
    const blob = await response.blob();
    const durationSeconds = (performance.now() - start) / 1000;
    const bytesPerSecond = durationSeconds > 0 ? blob.size / durationSeconds : 0;
    return bytesPerSecond / (1024 * 1024);
  };

  const measureDownload = async () => {
    
    try {
      return await timeDownload(`${CLOUDFLARE_DOWN_URL}?bytes=${TEST_BYTES}&cb=${Date.now()}`);
    } catch (err) {
      return await timeDownload(`${FALLBACK_SPEED_TEST_URL}?cb=${Date.now()}`);
    }
  };

  const checkInternet = async () => {
    if (internetStatus === "checking") return;
    setInternetStatus("checking");
    setDownloadMBps(null);
    setPingMs(null);
    setJitterMs(null);

    if (!navigator.onLine) {
      setInternetStatus("error");
      toast.error("No internet connection detected.");
      return;
    }

    try {
      const { avg, jitter } = await measurePing();
      setPingMs(avg);
      setJitterMs(jitter);

      const mbPerSecond = await measureDownload();
      setDownloadMBps(mbPerSecond);

      if (mbPerSecond >= NETWORK_POOR_MAX_MBPS) {
        setInternetStatus("success");
      } else {
        setInternetStatus("error");
        toast.error(
          `Your connection is too slow (${mbPerSecond.toFixed(2)} MB/s). Need at least ${NETWORK_POOR_MAX_MBPS} MB/s.`
        );
      }
    } catch (err) {
      setInternetStatus("error");
      toast.error("Could not verify your internet connection.");
    }
  };

  return {
    internetStatus,
    downloadMBps,
    pingMs,
    jitterMs,
    checkInternet,
  };
}