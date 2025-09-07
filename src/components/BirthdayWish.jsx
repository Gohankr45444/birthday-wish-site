import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Confetti from "react-confetti";
import { Gift, PartyPopper } from "lucide-react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

// =================== Cake ===================
function Cake3D({ candlesBlown }) {
  return (
    <>
      {/* Cake layers */}
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

      {/* Candles */}
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

// =================== Balloons ===================
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
        <meshStandardMaterial
          color={`hsl(${Math.random() * 360}, 70%, 60%)`}
        />
      </mesh>
      <mesh position={[0, -0.5, 0]}>
        <cylinderGeometry args={[0.01, 0.01, 1, 8]} />
        <meshStandardMaterial color="gray" />
      </mesh>
    </group>
  );
}

// =================== Fireworks ===================
function FireworkParticle({ position }) {
  const ref = useRef();
  const velocity = useRef(
    Array.from({ length: 20 }).map(
      () =>
        new THREE.Vector3(
          (Math.random() - 0.5) * 2,
          Math.random() * 2,
          (Math.random() - 0.5) * 2
        )
    )
  );

  useFrame(() => {
    if (ref.current) {
      ref.current.children.forEach((child, i) => {
        child.position.add(velocity.current[i]);
        velocity.current[i].multiplyScalar(0.95);
      });
    }
  });

  return (
    <group ref={ref} position={position}>
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

// =================== Responsive Canvas ===================
function ResponsiveCanvas({ children }) {
  return (
    <div className="w-full max-w-md h-96 pointer-events-auto">
      <Canvas
        style={{ width: "100%", height: "100%" }}
        camera={{ position: [0, 3, 6], fov: 50 }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        {children}
        <OrbitControls enableZoom={false} />
      </Canvas>
    </div>
  );
}

// =================== Main Component ===================
export default function BirthdayWish() {
  const [opened, setOpened] = useState(false);
  const [candlesBlown, setCandlesBlown] = useState(false);
  const audioRef = useRef(null);
  const touchStartY = useRef(0);

  // Play music
  useEffect(() => {
    if (opened && audioRef.current) {
      audioRef.current.play().catch(() => {});
    }
  }, [opened]);

  // Mic-based blow detection 🎤
  useEffect(() => {
    if (!opened || candlesBlown) return;

    let audioContext;
    let analyser;
    let dataArray;

    const startMic = async () => {
      try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const source = audioContext.createMediaStreamSource(stream);
        analyser = audioContext.createAnalyser();
        source.connect(analyser);
        analyser.fftSize = 256;
        dataArray = new Uint8Array(analyser.frequencyBinCount);

        const detectBlow = () => {
          if (!candlesBlown) {
            analyser.getByteFrequencyData(dataArray);
            let volume = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
            if (volume > 40) {
              setCandlesBlown(true);
            } else {
              requestAnimationFrame(detectBlow);
            }
          }
        };
        detectBlow();
      } catch (err) {
        console.error("Mic access denied", err);
      }
    };

    startMic();

    return () => {
      if (audioContext) audioContext.close();
    };
  }, [opened, candlesBlown]);

  // Swipe detection 📱
  const handleTouchStart = (e) => {
    touchStartY.current = e.touches[0].clientY;
  };
  const handleTouchEnd = (e) => {
    const endY = e.changedTouches[0].clientY;
    if (touchStartY.current - endY > 50) {
      setCandlesBlown(true);
    }
  };

  return (
    <div
      className="flex flex-col items-center justify-center h-screen w-screen bg-gradient-to-tr from-pink-200 via-purple-200 to-blue-200 relative overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <audio ref={audioRef} src="/audio/happybirthday.mp3" autoPlay loop />

      {opened && <Confetti width={window.innerWidth} height={window.innerHeight} />}

      {/* Gift Box */}
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

      {/* Birthday Scene */}
      <AnimatePresence>
        {opened && (
          <motion.div
            className="absolute flex flex-col items-center text-center p-6 bg-white/80 rounded-2xl shadow-2xl backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
            <PartyPopper size={60} className="text-yellow-500 animate-spin-slow" />
            <h1 className="text-3xl md:text-4xl font-bold text-pink-600 mt-4">
              🎉 Happy Birthday 🎉
            </h1>
            <p className="mt-2 text-lg text-gray-700">
              Wishing you a day filled with love, laughter, and joy 💖
            </p>

            <ResponsiveCanvas>
              <Cake3D candlesBlown={candlesBlown} />
              {!candlesBlown &&
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
            </ResponsiveCanvas>

            {/* Instructions */}
            {!candlesBlown && (
              <p className="mt-4 text-md text-purple-700 font-semibold animate-pulse">
                🎤 Blow into your mic or swipe down to put out the candles 🎂
              </p>
            )}

            {/* Fallback Button */}
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
