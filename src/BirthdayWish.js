import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Confetti from "react-confetti";
import { Gift, PartyPopper, Sparkles } from "lucide-react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

// Simple 3D Cake using three.js primitives
function Cake3D({ candlesBlown }) {
  return (
    <>
      {/* Cake layers */}
      <mesh position={[0, -0.5, 0]}>
        <cylinderGeometry args={[1.5, 1.5, 0.6, 32]} />
        <meshStandardMaterial color="#ffb6c1" />
      </mesh>
      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[1.2, 1.2, 0.5, 32]} />
        <meshStandardMaterial color="#ff69b4" />
      </mesh>
      <mesh position={[0, 0.8, 0]}>
        <cylinderGeometry args={[0.9, 0.9, 0.4, 32]} />
        <meshStandardMaterial color="#ff85c1" />
      </mesh>

      {/* Candles */}
      {Array.from({ length: 5 }).map((_, i) => (
        <group key={i} position={[Math.cos((i / 5) * Math.PI * 2) * 0.6, 1.2, Math.sin((i / 5) * Math.PI * 2) * 0.6]}>
          <mesh>
            <cylinderGeometry args={[0.05, 0.05, 0.3, 16]} />
            <meshStandardMaterial color="#ffff99" />
          </mesh>
          {!candlesBlown && (
            <mesh position={[0, 0.25, 0]}>
              <sphereGeometry args={[0.07, 16, 16]} />
              <meshStandardMaterial emissive="orange" emissiveIntensity={2} color="yellow" />
            </mesh>
          )}
        </group>
      ))}
    </>
  );
}

export default function BirthdayWish() {
  const [opened, setOpened] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const [candlesBlown, setCandlesBlown] = useState(false);
  const [name, setName] = useState("");
  const [finalName, setFinalName] = useState("");
  const audioRef = useRef(null);

  useEffect(() => {
    setWindowSize({ width: window.innerWidth, height: window.innerHeight });
  }, []);

  useEffect(() => {
    if (opened && audioRef.current) {
      audioRef.current.play().catch(() => {});
    }
  }, [opened]);

  // Floating balloons
  const Balloons = () => {
    const balloons = Array.from({ length: 7 });
    return (
      <>
        {balloons.map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-4xl"
            initial={{ y: windowSize.height + 100, x: Math.random() * windowSize.width }}
            animate={{ y: -200 }}
            transition={{
              duration: 10 + Math.random() * 5,
              repeat: Infinity,
              delay: i * 2,
            }}
          >
            🎈
          </motion.div>
        ))}
      </>
    );
  };

  // Floating sparkles
  const SparkleEffect = () => {
    const sparkles = Array.from({ length: 15 });
    return (
      <>
        {sparkles.map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-yellow-400"
            initial={{ opacity: 0, scale: 0, x: Math.random() * windowSize.width, y: Math.random() * windowSize.height }}
            animate={{ opacity: [0, 1, 0], scale: [0, 1.5, 0] }}
            transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 }}
          >
            <Sparkles size={20} />
          </motion.div>
        ))}
      </>
    );
  };

  // Fireworks after blowing candles
  const Fireworks = () => {
    const explosions = Array.from({ length: 6 });
    return (
      <>
        {explosions.map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-5xl"
            initial={{
              opacity: 0,
              scale: 0,
              x: Math.random() * windowSize.width,
              y: Math.random() * (windowSize.height / 2),
            }}
            animate={{ opacity: [0, 1, 0], scale: [0, 2, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 1.5 }}
          >
            🎆
          </motion.div>
        ))}
      </>
    );
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-tr from-pink-200 via-purple-200 to-blue-200 relative overflow-hidden">
      {/* Background Music */}
      <audio ref={audioRef} src="https://www.bensound.com/bensound-music/bensound-celebration.mp3" loop />

      {/* Confetti */}
      {opened && <Confetti width={windowSize.width} height={windowSize.height} />}

      {/* Balloons */}
      {opened && <Balloons />}

      {/* Sparkles */}
      {opened && <SparkleEffect />}

      {/* Fireworks after candles blown */}
      {candlesBlown && <Fireworks />}

      {/* Gift Box */}
      <AnimatePresence>
        {!opened && (
          <motion.div
            className="flex flex-col items-center cursor-pointer"
            onClick={() => setOpened(true)}
            initial={{ scale: 0 }}
            animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
            transition={{ duration: 1, type: "spring" }}
            exit={{ opacity: 0, y: -100 }}
          >
            <Gift size={100} className="text-pink-600 drop-shadow-lg" />
            <p className="mt-4 text-xl font-semibold text-pink-700 animate-bounce">
              Tap to open 🎁
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Birthday Wishes */}
      <AnimatePresence>
        {opened && (
          <motion.div
            className="absolute flex flex-col items-center text-center p-6 bg-white/80 rounded-2xl shadow-2xl backdrop-blur-md"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", duration: 1 }}
          >
            <PartyPopper size={60} className="text-yellow-500 animate-spin-slow" />
            <h1 className="text-4xl font-bold text-pink-600 mt-4">
              🎉 Happy Birthday {finalName || ""} 🎉
            </h1>
            <p className="mt-2 text-lg text-gray-700">
              Wishing you a day filled with love, laughter, and joy 💖
            </p>
            <p className="mt-4 text-md text-purple-700 font-semibold animate-pulse">
              ✨ Make a wish and let the magic begin ✨
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

            {/* 3D Cake with Candles */}
            <div className="mt-6 w-64 h-64">
              <Canvas camera={{ position: [0, 2, 4], fov: 50 }}>
                <ambientLight intensity={0.5} />
                <directionalLight position={[5, 5, 5]} intensity={1} />
                <Cake3D candlesBlown={candlesBlown} />
                <OrbitControls enableZoom={false} />
              </Canvas>
            </div>

            {!candlesBlown ? (
              <motion.button
                className="mt-4 flex items-center gap-2 bg-pink-500 text-white px-4 py-2 rounded-full shadow-lg hover:bg-pink-600"
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
                className="text-2xl text-orange-600 font-bold mt-4"
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
