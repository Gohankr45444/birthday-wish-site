


import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Confetti from "react-confetti";
import { Gift, PartyPopper } from "lucide-react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

// 3D Cake
function Cake3D({ candlesBlown }) {
  return (
    <>
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
        <group
          key={i}
          position={[
            Math.cos((i / 5) * Math.PI * 2) * 0.6,
            1.2,
            Math.sin((i / 5) * Math.PI * 2) * 0.6,
          ]}
        >
          <mesh>
            <cylinderGeometry args={[0.05, 0.05, 0.3, 16]} />
            <meshStandardMaterial color="#ffff99" />
          </mesh>
          {!candlesBlown && (
            <mesh position={[0, 0.25, 0]}>
              <sphereGeometry args={[0.07, 16, 16]} />
              <meshStandardMaterial
                emissive="orange"
                emissiveIntensity={2}
                color="yellow"
              />
            </mesh>
          )}
        </group>
      ))}
    </>
  );
}

// Interactive Balloon
function Balloon({ position }) {
  const ref = useRef();
  const [popped, setPopped] = useState(false);
  const speed = 0.002 + Math.random() * 0.003;
  const sway = Math.random() * 0.5;
  const popHeight = useRef(0);

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.position.y += speed;
      ref.current.position.x += Math.sin(clock.elapsedTime + sway) * 0.002;

      if (popped) {
        popHeight.current += 0.08;
        ref.current.position.y += 0.08;
        ref.current.scale.setScalar(1 + Math.sin(popHeight.current * 5) * 0.2);
        if (popHeight.current > 1.5) setPopped(false);
      }

      if (ref.current.position.y > 5) ref.current.position.y = -2;
    }
  });

  return (
    <group
      ref={ref}
      position={position}
      onClick={() => setPopped(true)}
      onPointerDown={() => setPopped(true)}
      style={{ cursor: "pointer" }}
    >
      <mesh>
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshStandardMaterial color={`hsl(${Math.random() * 360}, 70%, 60%)`} />
      </mesh>
      <mesh position={[0, -0.5, 0]}>
        <cylinderGeometry args={[0.01, 0.01, 1, 8]} />
        <meshStandardMaterial color="gray" />
      </mesh>
    </group>
  );
}

// Firework
function Firework3D({ position }) {
  return (
    <group position={position}>
      {Array.from({ length: 20 }).map((_, i) => (
        <mesh key={i}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial
            emissive="yellow"
            emissiveIntensity={2}
            color="orange"
          />
        </mesh>
      ))}
    </group>
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
    const handleResize = () =>
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (opened && audioRef.current) audioRef.current.play().catch(() => {});
  }, [opened]);

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-tr from-pink-200 via-purple-200 to-blue-200 relative overflow-hidden">
      {/* Music */}
      <audio ref={audioRef} src="/audio/happybirthday.mp3" autoPlay loop />

      {/* Confetti */}
      {opened && <Confetti width={windowSize.width} height={windowSize.height} />}

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
            className="absolute flex flex-col items-center text-center p-6 bg-white/80 rounded-2xl shadow-2xl backdrop-blur-md max-w-sm"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", duration: 1 }}
          >
            <PartyPopper size={50} className="text-yellow-500 animate-spin-slow" />
            <h1 className="text-3xl font-bold text-pink-600 mt-4">
              🎉 Happy Birthday {finalName || ""} 🎉
            </h1>
            <p className="mt-2 text-sm text-gray-700">
              Wishing you a day filled with love, laughter, and joy 💖
            </p>
            <p className="mt-2 text-sm text-purple-700 font-semibold animate-pulse">
              ✨ Make a wish and let the magic begin ✨
            </p>

            {!finalName && (
              <div className="mt-4 flex gap-2">
                <input
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
                />
                <button
                  onClick={() => setFinalName(name)}
                  className="bg-pink-500 text-white px-4 py-2 rounded-lg shadow hover:bg-pink-600 text-sm"
                >
                  Save
                </button>
              </div>
            )}

            {/* 3D Canvas */}
            <div className="mt-4 w-full h-72 md:h-96">
              <Canvas camera={{ position: [0, 3, 6], fov: 50 }}>
                <ambientLight intensity={0.5} />
                <directionalLight position={[5, 5, 5]} intensity={1} />
                <Cake3D candlesBlown={candlesBlown} />

                {/* Balloons */}
                {opened &&
                  Array.from({ length: 5 }).map((_, i) => (
                    <Balloon
                      key={i}
                      position={[
                        Math.cos((i / 5) * Math.PI * 2) * 2,
                        2,
                        Math.sin((i / 5) * Math.PI * 2) * 2,
                      ]}
                    />
                  ))}

                {/* Fireworks */}
                {candlesBlown &&
                  Array.from({ length: 3 }).map((_, i) => (
                    <Firework3D
                      key={i}
                      position={[Math.random() * 4 - 2, 3 + i, Math.random() * 4 - 2]}
                    />
                  ))}

                <OrbitControls enableZoom={false} />
              </Canvas>
            </div>

            {!candlesBlown ? (
              <motion.button
                className="mt-4 flex items-center gap-2 bg-pink-500 text-white px-4 py-2 rounded-full shadow-lg hover:bg-pink-600 text-sm md:text-base"
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
                className="text-lg md:text-2xl text-orange-600 font-bold mt-2"
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


