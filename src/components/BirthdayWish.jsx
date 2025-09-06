import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Confetti from "react-confetti";
import { Gift, PartyPopper } from "lucide-react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

// Define cake dimensions and positions globally within this file
// This makes them accessible to both Cake3D and BirthdayWish components.
const layer1Height = 1.2; // Bottom layer height
const layer1Radius = 2.5; // Bottom layer radius
const layer1Y = layer1Height / 2; // Center Y for bottom layer to sit on y=0

const layer2Height = 1.0; // Middle layer height
const layer2Radius = 1.8; // Middle layer radius
// Center Y for middle layer, stacked on top of layer1
const layer2Y = layer1Y + (layer1Height / 2) + (layer2Height / 2);

const layer3Height = 0.8; // Top layer height
const layer3Radius = 1.2; // Top layer radius
// Center Y for top layer, stacked on top of layer2
const layer3Y = layer2Y + (layer2Height / 2) + (layer3Height / 2);

// Position for the base of the candles, slightly above the top layer
const candleBaseY = layer3Y + (layer3Height / 2) + 0.1;
// Radius for candle placement on the top layer
const candlePlacementRadius = layer3Radius * 0.7; // 70% of top layer radius


// 3D Cake
function Cake3D({ candlesBlown }) {
  return (
    <>
      {/* Bottom Layer */}
      <mesh position={[0, layer1Y, 0]}>
        <cylinderGeometry args={[layer1Radius, layer1Radius, layer1Height, 32]} />
        <meshStandardMaterial color="#ffb6c1" />
      </mesh>
      {/* Middle Layer */}
      <mesh position={[0, layer2Y, 0]}>
        <cylinderGeometry args={[layer2Radius, layer2Radius, layer2Height, 32]} />
        <meshStandardMaterial color="#ff69b4" />
      </mesh>
      {/* Top Layer */}
      <mesh position={[0, layer3Y, 0]}>
        <cylinderGeometry args={[layer3Radius, layer3Radius, layer3Height, 32]} />
        <meshStandardMaterial color="#ff85c1" />
      </mesh>

      {/* Candles */}
      {Array.from({ length: 5 }).map((_, i) => (
        <group
          key={i}
          position={[
            Math.cos((i / 5) * Math.PI * 2) * candlePlacementRadius,
            candleBaseY,
            Math.sin((i / 5) * Math.PI * 2) * candlePlacementRadius,
          ]}
        >
          <mesh>
            <cylinderGeometry args={[0.05, 0.05, 0.3, 16]} />
            <meshStandardMaterial color="#ffff99" />
          </mesh>
          {!candlesBlown && (
            <mesh position={[0, 0.25, 0]}> {/* Flame position relative to candle */}
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

// 3D Balloon
function Balloon3D({ position }) {
  return (
    <group position={position}>
      <mesh>
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshStandardMaterial color={"#ff4d6d"} />
      </mesh>
      <mesh position={[0, -0.5, 0]}>
        <cylinderGeometry args={[0.01, 0.01, 1, 8]} />
        <meshStandardMaterial color="gray" />
      </mesh>
    </group>
  );
}

// 3D Firework
function Firework3D({ position }) {
  return (
    <group position={position}>
      {Array.from({ length: 20 }).map((_, i) => (
        <mesh key={i}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial emissive="yellow" emissiveIntensity={2} color="orange" />
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
  const [ready, setReady] = useState(false);
  const audioRef = useRef(null);

  // Wait for mount
  useEffect(() => {
    setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    setReady(true);
  }, []);

  useEffect(() => {
    if (opened && audioRef.current) {
      audioRef.current.play().catch(() => {});
    }
  }, [opened]);

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-tr from-pink-200 via-purple-200 to-blue-200 relative overflow-hidden">
      {/* Background Music */}
      {/* The audio source '/audio/happybirthday.mp3' must be available in the public folder or correctly imported */}
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

            {/* 3D Scene */}
            {ready && (
              <div className="mt-6 w-72 h-72"> {/* This div size (w-72 h-72) is fixed, which might constrain the view */}
                <Canvas camera={{ position: [0, 2.5, 5], fov: 50 }}> {/* Adjusted camera position */}
                  <ambientLight intensity={0.5} />
                  <directionalLight position={[5, 5, 5]} intensity={1} />

                  {/* Cake */}
                  <Cake3D candlesBlown={candlesBlown} />

                  {/* Balloons */}
                  {opened &&
                    Array.from({ length: 5 }).map((_, i) => (
                      <Balloon3D
                        key={i}
                        position={[
                          Math.cos((i / 5) * Math.PI * 2) * 2,
                          layer3Y + layer3Height + 1.5, // Lift balloons higher, relative to cake top
                          Math.sin((i / 5) * Math.PI * 2) * 2,
                        ]}
                      />
                    ))}

                  {/* Fireworks */}
                  {candlesBlown &&
                    Array.from({ length: 3 }).map((_, i) => (
                      <Firework3D
                        key={i}
                        position={[Math.random() * 4 - 2, layer3Y + layer3Height + 2 + i, Math.random() * 4 - 2]} // Lift fireworks higher
                      />
                    ))}

                  <OrbitControls enableZoom={false} />
                </Canvas>
              </div>
            )}

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