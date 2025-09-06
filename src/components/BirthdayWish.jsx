

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Confetti from "react-confetti";
import { Gift, PartyPopper } from "lucide-react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

// Cake Component
function Cake3D({ candlesBlown }) {
  return (
    <>
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[1.5, 1.5, 0.6, 32]} />
        <meshStandardMaterial color="#ffb6c1" />
      </mesh>
      <mesh position={[0, 0.6, 0]}>
        <cylinderGeometry args={[1.2, 1.2, 0.5, 32]} />
        <meshStandardMaterial color="#ff69b4" />
      </mesh>
      <mesh position={[0, 1.1, 0]}>
        <cylinderGeometry args={[0.9, 0.9, 0.4, 32]} />
        <meshStandardMaterial color="#ff85c1" />
      </mesh>

      {Array.from({ length: 5 }).map((_, i) => (
        <group
          key={i}
          position={[
            Math.cos((i / 5) * Math.PI * 2) * 0.6,
            1.5,
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
              <meshStandardMaterial emissive="orange" emissiveIntensity={2} color="yellow" />
            </mesh>
          )}
        </group>
      ))}
    </>
  );
}

// Floating Balloon Component
function Balloon({ position }) {
  const ref = useRef();
  const speed = 0.002 + Math.random() * 0.003;
  const sway = Math.random() * 0.5;

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.position.y += speed;
      ref.current.position.x += Math.sin(clock.elapsedTime + sway) * 0.002;
      if (ref.current.position.y > 5) ref.current.position.y = -2;
    }
  });

  return (
    <group ref={ref} position={position}>
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

// Firework Particle Component
function FireworkParticle({ position }) {
  const ref = useRef();
  const velocity = useRef(
    Array.from({ length: 20 }).map(() => new THREE.Vector3(
      (Math.random() - 0.5) * 2,
      Math.random() * 2,
      (Math.random() - 0.5) * 2
    ))
  );

  useFrame(() => {
    if (ref.current) {
      ref.current.children.forEach((child, i) => {
        child.position.add(velocity.current[i]);
        velocity.current[i].multiplyScalar(0.95); // slow down
      });
    }
  });

  return (
    <group ref={ref} position={position}>
      {Array.from({ length: 20 }).map((_, i) => (
        <mesh key={i}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial emissive="yellow" emissiveIntensity={2} color="orange" />
        </mesh>
      ))}
    </group>
  );
}

// Sparkle Component
function Sparkles({ count = 15 }) {
  const groupRef = useRef();
  const sparkles = useRef(
    Array.from({ length: count }).map(() => ({
      pos: new THREE.Vector3((Math.random() - 0.5) * 3, Math.random() * 2 + 0.5, (Math.random() - 0.5) * 3),
      speed: Math.random() * 0.01 + 0.002,
      sway: Math.random() * 0.5,
    }))
  );

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.children.forEach((child, i) => {
        const s = sparkles.current[i];
        s.pos.y += s.speed;
        s.pos.x += Math.sin(clock.elapsedTime + s.sway) * 0.002;
        if (s.pos.y > 3) s.pos.y = 0.5;
        child.position.copy(s.pos);
      });
    }
  });

  return (
    <group ref={groupRef}>
      {sparkles.current.map((_, i) => (
        <mesh key={i}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial emissive="white" emissiveIntensity={2} color="#fff" />
        </mesh>
      ))}
    </group>
  );
}

// Responsive Canvas Wrapper
function ResponsiveCanvas({ children }) {
  const containerRef = useRef(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const observer = new ResizeObserver(() => {
      if (containerRef.current) {
        setSize({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full max-w-md h-96 md:h-[500px] lg:h-[600px] pointer-events-auto"
    >
      {size.width && size.height && (
        <Canvas
          style={{ width: "100%", height: "100%" }}
          camera={{ position: [0, 3, 6], fov: size.width < 500 ? 60 : 50 }}
        >
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 5, 5]} intensity={1} />
          {children}
          <OrbitControls enableZoom={false} />
        </Canvas>
      )}
    </div>
  );
}

// Main Component
export default function BirthdayWish() {
  const [opened, setOpened] = useState(false);
  const [candlesBlown, setCandlesBlown] = useState(false);
  const [name, setName] = useState("");
  const [finalName, setFinalName] = useState("");
  const audioRef = useRef(null);

  useEffect(() => {
    if (opened && audioRef.current) audioRef.current.play().catch(() => {});
  }, [opened]);

  return (
    <div className="flex flex-col items-center justify-center h-screen w-screen bg-gradient-to-tr from-pink-200 via-purple-200 to-blue-200 relative overflow-visible">
      <audio ref={audioRef} src="/audio/happybirthday.mp3" autoPlay loop />

      {opened && <Confetti width={window.innerWidth} height={window.innerHeight} />}

      {!opened && (
        <motion.div
          className="flex flex-col items-center cursor-pointer"
          onClick={() => setOpened(true)}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 1 }}
        >
          <Gift size={100} className="text-pink-600 drop-shadow-lg" />
          <p className="mt-4 text-xl font-semibold text-pink-700 animate-bounce">
            Tap to open 🎁
          </p>
        </motion.div>
      )}

      <AnimatePresence>
        {opened && (
          <motion.div
            className="absolute flex flex-col items-center text-center p-4 md:p-6 bg-white/80 rounded-2xl shadow-2xl backdrop-blur-md pointer-events-auto w-full max-w-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
          >
            <PartyPopper size={60} className="text-yellow-500 animate-spin-slow" />
            <h1 className="text-3xl md:text-4xl font-bold text-pink-600 mt-4">
              🎉 Happy Birthday {finalName || ""} 🎉
            </h1>
            <p className="mt-2 text-base md:text-lg text-gray-700">
              Wishing you a day filled with love, laughter, and joy 💖
            </p>

            {!finalName && (
              <div className="mt-4 flex gap-2 w-full justify-center">
                <input
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg border border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
                <button
                  onClick={() => setFinalName(name)}
                  className="bg-pink-500 text-white px-4 py-2 rounded-lg shadow hover:bg-pink-600"
                >
                  Save
                </button>
              </div>
            )}

            <ResponsiveCanvas>
              <Cake3D candlesBlown={candlesBlown} />
              {opened &&
                Array.from({ length: 6 }).map((_, i) => (
                  <Balloon
                    key={i}
                    position={[Math.random() * 4 - 2, Math.random() * 2, Math.random() * 4 - 2]}
                  />
                ))}
              {candlesBlown &&
                Array.from({ length: 3 }).map((_, i) => (
                  <FireworkParticle
                    key={i}
                    position={[Math.random() * 4 - 2, 2 + i, Math.random() * 4 - 2]}
                  />
                ))}
              <Sparkles count={20} />
            </ResponsiveCanvas>

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
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-lg md:text-2xl text-orange-600 font-bold mt-4"
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

