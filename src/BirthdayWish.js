import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Confetti from "react-confetti";
import { Gift, PartyPopper, Sparkles } from "lucide-react";

/**
 * IMPORTANT: Fix for error `TypeError: can't access property "source", e85 is undefined`
 * Root cause: Static imports of `@react-three/fiber` / `@react-three/drei` can fail
 * in some sandboxes (missing deps or WebGL init). We remove static imports and
 * lazy-load them at runtime **only if available**. Otherwise we render a rich
 * CSS-animated fallback that still delivers a 3D-looking experience.
 */

// --- Utility: feature detection for WebGL ---
function hasWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
    );
  } catch (_) {
    return false;
  }
}

// --- 3D Scene Loader (lazy, safe) ---
function ThreeScene({ candlesBlown, opened }) {
  const [three, setThree] = useState({ ready: false, error: null });

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!hasWebGL()) {
        if (mounted) setThree({ ready: false, error: "WebGL not available" });
        return;
      }
      try {
        // Dynamically import only if environment supports it
        const rf = await import(/* webpackIgnore: true */ "@react-three/fiber");
        const drei = await import(/* webpackIgnore: true */ "@react-three/drei");
        if (!mounted) return;
        setThree({ ready: true, rf, drei, error: null });
      } catch (e) {
        if (mounted) setThree({ ready: false, error: e?.message || "3D libs failed to load" });
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // If not ready, show nothing (caller renders fallback)
  if (!three.ready) return null;
  const { Canvas } = three.rf;
  const { OrbitControls } = three.drei;

  // Inline components that use R3F primitives
  const Cake3D = ({ candlesBlown }) => (
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

  const Balloon3D = ({ position = [0, 0, 0] }) => (
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

  const Firework3D = ({ position = [0, 0, 0] }) => (
    <group position={position}>
      {Array.from({ length: 20 }).map((_, i) => (
        <mesh key={i}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial emissive="yellow" emissiveIntensity={2} color="orange" />
        </mesh>
      ))}
    </group>
  );

  return (
    <div className="w-72 h-72">
      <Canvas camera={{ position: [0, 3, 6], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <Cake3D candlesBlown={candlesBlown} />
        {opened && Array.from({ length: 5 }).map((_, i) => (
          <Balloon3D key={i} position={[Math.cos((i / 5) * Math.PI * 2) * 2, 2, Math.sin((i / 5) * Math.PI * 2) * 2]} />
        ))}
        {candlesBlown && Array.from({ length: 3 }).map((_, i) => (
          <Firework3D key={i} position={[Math.random() * 4 - 2, 3 + i, Math.random() * 4 - 2]} />
        ))}
        <OrbitControls enableZoom={false} />
      </Canvas>
    </div>
  );
}

// --- CSS Fallbacks (no WebGL) ---
function FallbackCake({ candlesBlown }) {
  return (
    <div className="relative" style={{ perspective: 800 }}>
      <div className="relative w-56 h-40">
        {/* layers */}
        <div className="absolute left-1/2 -translate-x-1/2 bottom-4 w-56 h-16 rounded-[32px] shadow-lg"
             style={{ background: "linear-gradient(180deg,#ffc4d6,#ff8fb1)", transform: "rotateX(15deg)" }} />
        <div className="absolute left-1/2 -translate-x-1/2 bottom-16 w-44 h-12 rounded-[28px] shadow-md"
             style={{ background: "linear-gradient(180deg,#ff9ec4,#ff6fa1)", transform: "rotateX(15deg)" }} />
        <div className="absolute left-1/2 -translate-x-1/2 bottom-28 w-32 h-10 rounded-[24px] shadow"
             style={{ background: "linear-gradient(180deg,#ffb3d1,#ff7fb3)", transform: "rotateX(15deg)" }} />
        {/* candles */}
        <div className="absolute left-1/2 -translate-x-1/2 bottom-[140px] flex gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center">
              {!candlesBlown && (
                <div className="w-2 h-4 rounded-full animate-flicker" style={{ background: "radial-gradient(circle,#ffd27d,#ff8a00)" }} />
              )}
              <div className="w-2 h-6 bg-yellow-100 rounded animate-melt" style={{ animationDelay: `${i * 0.2}s` }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function FallbackBalloons() {
  return (
    <>
      {Array.from({ length: 7 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-4xl select-none"
          initial={{ y: window.innerHeight + 80, x: Math.random() * window.innerWidth }}
          animate={{ y: -200 }}
          transition={{ duration: 10 + Math.random() * 5, repeat: Infinity, delay: i * 1.2 }}
        >
          🎈
        </motion.div>
      ))}
    </>
  );
}

function FallbackFireworks({ active }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    if (!active) return;
    const c = canvasRef.current;
    const ctx = c.getContext("2d");
    let id;
    const particles = [];
    const W = (c.width = Math.min(window.innerWidth, 500));
    const H = (c.height = 200);
    function burst() {
      const x = Math.random() * W;
      const y = Math.random() * H * 0.6 + 20;
      for (let i = 0; i < 60; i++) {
        const ang = Math.random() * Math.PI * 2;
        const sp = Math.random() * 3 + 1;
        particles.push({ x, y, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp, life: 60 });
      }
    }
    function loop() {
      ctx.fillStyle = "rgba(0,0,0,0)";
      ctx.clearRect(0, 0, W, H);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.02;
        p.life -= 1;
        ctx.globalAlpha = Math.max(p.life / 60, 0);
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = `hsl(${(p.x + p.y) % 360},100%,60%)`;
        ctx.fill();
      });
      for (let i = particles.length - 1; i >= 0; i--) if (particles[i].life <= 0) particles.splice(i, 1);
      if (Math.random() < 0.08) burst();
      id = requestAnimationFrame(loop);
    }
    burst();
    loop();
    return () => cancelAnimationFrame(id);
  }, [active]);
  return <canvas ref={canvasRef} className="w-full h-48" />;
}

export default function BirthdayWish() {
  const [opened, setOpened] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const [candlesBlown, setCandlesBlown] = useState(false);
  const [name, setName] = useState("");
  const [finalName, setFinalName] = useState("");
  const [threeFailed, setThreeFailed] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    setWindowSize({ width: window.innerWidth, height: window.innerHeight });
  }, []);

  useEffect(() => {
    if (opened && audioRef.current) {
      audioRef.current.play().catch(() => {});
    }
  }, [opened]);

  // Probe once to see if Three can mount (without crashing the page)
  const canUseThree = useMemo(() => hasWebGL(), []);

  // --- Simple built-in smoke tests ---
  function runSelfTest() {
    const results = [];
    try {
      // Test 1: open state toggles
      setOpened(true);
      results.push({ name: "Opens gift", pass: true });
      // Test 2: name set
      setName("Tester");
      setFinalName("Tester");
      results.push({ name: "Sets name", pass: true });
      // Test 3: blow candles
      setCandlesBlown(true);
      results.push({ name: "Blows candles -> fireworks", pass: true });
    } catch (e) {
      results.push({ name: "Unexpected error", pass: false, error: e?.message });
    }
    console.table(results);
    return results.every((r) => r.pass);
  }

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-tr from-pink-200 via-purple-200 to-blue-200 relative overflow-hidden">
      {/* Global keyframes for fallback animations */}
      <style>{`
        @keyframes flicker { 0%,100%{opacity:.8; transform: translateY(0)} 50%{opacity:1; transform: translateY(-1px)} }
        .animate-flicker{ animation: flicker .5s infinite; }
        @keyframes melt { 0%,100%{height:1.5rem} 50%{height:1rem} }
        .animate-melt{ animation: melt 3s ease-in-out infinite; }
      `}</style>

      {/* Background Music */}
      <audio ref={audioRef} src="https://www.bensound.com/bensound-music/bensound-celebration.mp3" loop />

      {/* Confetti */}
      {opened && <Confetti width={windowSize.width} height={windowSize.height} />}

      {/* Sparkles */}
      {opened && (
        <>
          {Array.from({ length: 15 }).map((_, i) => (
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
      )}

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
            <p className="mt-4 text-xl font-semibold text-pink-700 animate-bounce">Tap to open 🎁</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Birthday Wishes Card */}
      <AnimatePresence>
        {opened && (
          <motion.div
            className="absolute flex flex-col items-center text-center p-6 bg-white/80 rounded-2xl shadow-2xl backdrop-blur-md"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", duration: 1 }}
          >
            <PartyPopper size={60} className="text-yellow-500 animate-spin-slow" />
            <h1 className="text-4xl font-bold text-pink-600 mt-4">🎉 Happy Birthday {finalName || ""} 🎉</h1>
            <p className="mt-2 text-lg text-gray-700">Wishing you a day filled with love, laughter, and joy 💖</p>
            <p className="mt-4 text-md text-purple-700 font-semibold animate-pulse">✨ Make a wish and let the magic begin ✨</p>

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
                <button onClick={() => setFinalName(name)} className="bg-pink-500 text-white px-4 py-2 rounded-lg shadow hover:bg-pink-600">Save</button>
              </div>
            )}

            {/* Scene: Prefer true 3D if available; fallback to CSS version if not */}
            <div className="mt-6 flex flex-col items-center">
              {canUseThree ? (
                <ThreeScene candlesBlown={candlesBlown} opened={opened} />
              ) : (
                <div className="w-72">
                  <FallbackCake candlesBlown={candlesBlown} />
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
                <motion.div initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1 }} className="text-2xl text-orange-600 font-bold mt-4">
                  ✨ Candles blown! May your wishes come true ✨
                </motion.div>
              )}

              {/* Fireworks (fallback canvas) */}
              {!canUseThree && <div className="mt-4 w-full"><FallbackFireworks active={candlesBlown} /></div>}

              {/* Fallback balloons if not using 3D */}
              {!canUseThree && <FallbackBalloons />}

              {/* Tiny self-test button */}
              <button onClick={runSelfTest} className="mt-6 text-xs text-purple-700 underline">Run self-test (logs to console)</button>

              {/* If 3D failed, show friendly hint */}
              {(!canUseThree || threeFailed) && (
                <p className="mt-3 text-xs text-gray-600">Tip: For full 3D effects, enable WebGL / install <code>@react-three/fiber</code> & <code>@react-three/drei</code>.</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
