import { useState } from "react";
import "../assets/css/cake.css";
import { CakeSVG, confetti } from "../assets";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

function Cake() {
  const [candlesBlownOut, setCandlesBlownOut] = useState(false);
  const [micPermissionGranted, setMicPermissionGranted] = useState(false);
  const [micLevel, setMicLevel] = useState(0);

  const startMic = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      await audioContext.resume();

      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);

      analyser.fftSize = 512;
      const bufferLength = analyser.fftSize;
      const dataArray = new Uint8Array(bufferLength);
      source.connect(analyser);

      let smoothedLevel = 0;
      let blowStartTime = null;
      const blowThreshold = 50; // sensitivity
      const requiredDuration = 1000; // ms continuous blowing

      function detectBlow() {
        analyser.getByteTimeDomainData(dataArray);

        // RMS calculation
        let sumSquares = 0;
        for (let i = 0; i < dataArray.length; i++) {
          const val = (dataArray[i] - 128) / 128;
          sumSquares += val * val;
        }
        const rms = Math.sqrt(sumSquares / dataArray.length);

        // Scale to 0–100
        const level = Math.round(rms * 1000);

        // Smooth values
        smoothedLevel = smoothedLevel * 0.8 + level * 0.2;

        setMicLevel(Math.round(smoothedLevel));

        // Blow detection
        if (smoothedLevel > blowThreshold) {
          if (!blowStartTime) {
            blowStartTime = performance.now();
          } else if (performance.now() - blowStartTime > requiredDuration) {
            setCandlesBlownOut(true);
          }
        } else {
          blowStartTime = null;
        }

        requestAnimationFrame(detectBlow);
      }

      detectBlow();
      setMicPermissionGranted(true);
    } catch (err) {
      console.error("Microphone access denied:", err);
    }
  };

  return (
    <div className="bg-black/80 h-screen w-screen flex items-center justify-center overflow-hidden relative">
      {/* Confetti */}
      {candlesBlownOut && (
        <div
          className="absolute inset-0 bg-cover bg-center z-50"
          style={{ backgroundImage: `url(${confetti})` }}
        />
      )}

      {/* Birthday message */}
      {candlesBlownOut && (
        <motion.div
          className="absolute top-20 text-white text-3xl font-bold z-50"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <svg width="800" height="200" viewBox="0 0 400 200">
            <defs>
              <path id="curve" d="M50,150 Q200,50 350,150" fill="transparent" />
            </defs>
            <text fontSize="37" fill="white" textAnchor="middle">
              <textPath href="#curve" startOffset="50%">
                Happy Birthday, Ma!
              </textPath>
            </text>
          </svg>
          <Link to="/present" className="flex justify-center items-center mt-6">
  <p className="px-7 py-3 bg-pink-500 text-white rounded-full hover:bg-pink-600 font-medium text-base text-center shadow-lg">
    Next Page
  </p>
</Link>


        </motion.div>
      )}

      {/* Enable mic button */}
      {!micPermissionGranted && !candlesBlownOut && (
        <button
          onClick={startMic}
          className="absolute top-10 px-6 py-3 bg-pink-600 text-white rounded-lg shadow-lg z-50"
        >
           Enable Mic
        </button>
      )}

      {/* Mic Debug */}
      {micPermissionGranted && !candlesBlownOut && (
        <div className="absolute top-20 text-white text-lg z-50 flex flex-col items-center gap-2 w-64">
          <p>Mic Level: {micLevel}</p>
          {/* Volume bar */}
          <div className="w-full h-4 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 transition-all duration-100"
              style={{ width: `${Math.min(micLevel, 100)}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-300">(Threshold ≈ 50)</p>
        </div>
      )}

      {/* Cake + Candle */}
      <div className="relative z-10">
        <div className="absolute -top-48 left-1/2 transform -translate-x-1/2">
          <div className="candle">
            {!candlesBlownOut && (
              <div>
                {/* floating "blow" text */}
                <div className="absolute -top-[200px] text-gray-200 text-3xl">
                  <motion.div
                    animate={{ opacity: [0, 0.25, 0] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 2 }}
                    className="block -translate-x-[60px] translate-y-[105px] -rotate-[30deg] text-gray-200 text-xl "
                  >
                    blow
                  </motion.div>
                  <motion.div
                    animate={{ opacity: [0, 0.25, 0] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 3 }}
                    className="block translate-x-10 translate-y-[80px] rotate-[30deg] text-gray-200 text-xl"
                  >
                    blow
                  </motion.div>
                </div>

                {/* flame */}
                <div>
                  <div className="flame"></div>
                  <div className="flame"></div>
                  <div className="flame"></div>
                  <div className="flame"></div>
                  <div className="flame"></div>
                </div>
              </div>
            )}
          </div>
        </div>
        <CakeSVG />
      </div>
    </div>
  );
}

export default Cake;
