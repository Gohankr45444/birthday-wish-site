import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Confetti from "react-confetti";
import { Gift, PartyPopper } from "lucide-react";

// 🎂 Cake with candles (simple shapes + flickering flames)
function Cake({ candlesBlown }) {
  return (
    <div className="relative flex flex-col items-center mt-6">
      {/* Cake base */}
      <div className="w-48 h-24 bg-pink-400 rounded-t-xl shadow-lg relative">
        <div className="absolute top-0 left-0 w-full h-6 bg-pink-500 rounded-t-xl"></div>
      </div>

      {/* Candles */}
      <div className="absolute -top-10 flex gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center">
            <div className="w-2 h-8 bg-yellow-200 rounded"></div>
            {!candlesBlown && (
              <div
                className="w-3 h-3 rounded-full bg-yellow-400 animate-flicker"
                style={{ boxShadow: "0 0 10px orange" }}
              ></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// 🎈 Balloons floating background
function Balloons({ width, height }) {
  return (
    <>
      {Array.from({ length: 8 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-5xl"
          style={{ left: `${Math.random() * width}px` }}
          initial={{ y: height + 100 }}
          animate={{ y: -200, rotate: [0, 10, -10, 0] }}
          transition={{
            duration: 10 + Math.random() * 5,
            repeat: Infinity,
            delay: i * 1.5,
          }}
        >
          🎈
        </motion.div>
      ))}
    </>
  );
}

// 🎆 Fireworks after blowing candles
function Fireworks({ width, height }) {
  return (
    <>
      {Array.from({ length: 6 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-5xl"
          initial={{
            opacity: 0,
            scale: 0,
            x: Math.random() * width,
            y: Math.random() * (height / 2),
          }}
          animate={{ opacity: [0, 1, 0], scale: [0, 2, 0] }}
          transition={{ duration: 2, repeat: Infinity, delay: i * 1.5 }}
        >
          🎆
        </motion.div>
      ))}
    </>
  );
}

export default function BirthdayWish() {
  const [opened, setOpened] = useState(false);
  const [candlesBlown, setCandlesBlown] = useState(false);
  const [name, setName] = useState("");
  const [finalName, setFinalName] = useState("");
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const audioRef = useRef(null);

  useEffect(() => {
    const handleResize = () =>
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const startCelebration = () => {
    setOpened(true);
    if (audioRef.current) {
      audioRef.current.play().catch(() => {});
    }
  };

  return (
    <div className="flex items-center justify-center h-screen w-screen relative overflow-hidden bg-gradient-to-r from-pink-300 via-purple-300 to-blue-300 animate-gradient">
      {/* Background Music */}
      <audio
        ref={audioRef}
        src="https://www.bensound.com/bensound-music/bensound-celebration.mp3"
        loop
      />

      {/* Confetti */}
      {opened && <Confetti width={windowSize.width} height={windowSize.height} />}

      {/* Balloons */}
      {opened && <Balloons width={windowSize.width} height={windowSize.height} />}

      {/* Fireworks */}
      {candlesBlown && <Fireworks width={windowSize.width} height={windowSize.height} />}

      {/* Gift Box */}
      <AnimatePresence>
        {!opened && (
          <motion.div
            className="flex flex-col items-center cursor-pointer z-20"
            onClick={startCelebration}
            initial={{ scale: 0 }}
            animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
            transition={{ duration: 1, type: "spring" }}
            exit={{ opacity: 0, y: -100 }}
          >
            <Gift size={120} className="text-pink-600 drop-shadow-xl" />
            <p className="mt-4 text-2xl font-bold text-pink-700 animate-bounce">
              Tap to open 🎁
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Birthday Wishes */}
      <AnimatePresence>
        {opened && (
          <motion.div
            className="absolute flex flex-col items-center text-center p-8 bg-white/90 rounded-3xl shadow-2xl backdrop-blur-md z-10 max-w-md"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", duration: 1 }}
          >
            <PartyPopper size={70} className="text-yellow-500 animate-spin-slow" />
            <h1 className="text-4xl font-bold text-pink-600 mt-4">
              🎉 Happy Birthday {finalName || ""} 🎉
            </h1>
            <p className="mt-2 text-lg text-gray-700">
              Wishing you a day filled with love, laughter, and joy 💖
            </p>

            {/* Name Input */}
            {!finalName && (
              <div className="mt-4 flex gap-2">
                <input
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
                <button
                  onClick={() => setFinalName(name)}
                  className="bg-pink-500 text-white px-4 py-2 rounded-lg shadow hover:bg-pink-600"
                >
                  Save
                </button>
              </div>
            )}

            {/* Cake */}
            <Cake candlesBlown={candlesBlown} />

            {/* Blow Candles Button */}
            {!candlesBlown ? (
              <motion.button
                className="mt-6 bg-pink-500 text-white px-6 py-3 rounded-full shadow-lg hover:bg-pink-600"
                onClick={() => setCandlesBlown(true)}
                whileTap={{ scale: 0.9 }}
              >
                Blow the candles 🎂
              </motion.button>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1 }}
                className="text-xl text-orange-600 font-bold mt-6"
              >
                ✨ Candles blown! May your wishes come true ✨
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
