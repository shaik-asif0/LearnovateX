import React, { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Code, Play, RotateCcw, Square, Zap } from "lucide-react";

const CRASH_MESSAGES = {
  infinite_loop: "Infinite loop detected — game crashed.",
  performance: "Poor performance detected — game crashed.",
  defeated: "You were defeated.",
  invalid: "Could not interpret your logic.",
};

const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

const computeRank = (xp) => {
  if (xp >= 600) return "Legend";
  if (xp >= 300) return "Elite";
  if (xp >= 150) return "Pro";
  return "Rookie";
};

const parseLogic = (rawCode) => {
  const code = String(rawCode || "");
  const normalized = code.toLowerCase();

  if (code.length > 5000) {
    return { ok: false, error: "performance" };
  }

  const infiniteLoopPatterns = [
    /while\s*\(\s*true\s*\)/i,
    /for\s*\(\s*;\s*;\s*\)/i,
    /repeat\s*forever/i,
    /loop\s*forever/i,
  ];
  if (infiniteLoopPatterns.some((re) => re.test(code))) {
    return { ok: false, error: "infinite_loop" };
  }

  let speed = 1.0;
  const speedMatch =
    code.match(/\bspeed\s*[:=]\s*(\d+(?:\.\d+)?)/i) ||
    code.match(/\bset\s*speed\s*\(\s*(\d+(?:\.\d+)?)\s*\)/i) ||
    code.match(/\bsetSpeed\s*\(\s*(\d+(?:\.\d+)?)\s*\)/i);
  if (speedMatch?.[1]) {
    const parsed = Number(speedMatch[1]);
    if (Number.isFinite(parsed)) speed = clamp(parsed, 0.25, 4);
  }

  const actions = [];
  const lines = code
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  for (const line of lines) {
    const l = line.toLowerCase();
    const has = (kw) => l.includes(kw);

    if (
      has("move forward") ||
      has("forward()") ||
      has("moveforward") ||
      has("forward;") ||
      (has("forward") && !has("back"))
    ) {
      actions.push({ type: "move", dir: "forward" });
      continue;
    }
    if (has("move back") || has("backward") || has("moveback")) {
      actions.push({ type: "move", dir: "back" });
      continue;
    }
    if (has("left") || has("turnleft") || has("move left")) {
      actions.push({ type: "move", dir: "left" });
      continue;
    }
    if (has("right") || has("turnright") || has("move right")) {
      actions.push({ type: "move", dir: "right" });
      continue;
    }
    if (has("attack") || has("shoot") || has("hit")) {
      actions.push({ type: "attack" });
      continue;
    }
  }

  if (normalized.includes("if") && actions.length === 0) {
    return { ok: false, error: "invalid" };
  }

  if (actions.length > 300) {
    return { ok: false, error: "performance" };
  }

  return { ok: true, speed, actions };
};

const makeEnemies = (count) => {
  const enemies = [];
  for (let i = 0; i < count; i += 1) {
    enemies.push({
      id: `${Date.now()}-${i}-${Math.random().toString(16).slice(2)}`,
      pos: new THREE.Vector3(
        (Math.random() - 0.5) * 8,
        0.35,
        (Math.random() - 0.5) * 8
      ),
    });
  }
  return enemies;
};

const World = ({
  running,
  speed,
  actions,
  onCrash,
  onKill,
  level,
  resetSignal,
}) => {
  const playerRef = useRef(null);
  const flashRef = useRef(null);
  const [enemies, setEnemies] = useState(() => makeEnemies(3));

  const runtimeRef = useRef({
    actionIndex: 0,
    actionElapsed: 0,
    attackCooldown: 0,
    flashT: 0,
  });

  useEffect(() => {
    runtimeRef.current = {
      actionIndex: 0,
      actionElapsed: 0,
      attackCooldown: 0,
      flashT: 0,
    };
    if (playerRef.current) {
      playerRef.current.position.set(0, 0.35, 0);
    }
    setEnemies(makeEnemies(clamp(2 + level, 2, 12)));
  }, [level, resetSignal]);

  useFrame((_, delta) => {
    if (!running) return;
    if (!playerRef.current) return;

    const rt = runtimeRef.current;
    rt.attackCooldown = Math.max(0, rt.attackCooldown - delta);
    rt.flashT = Math.max(0, rt.flashT - delta);

    if (flashRef.current) {
      flashRef.current.visible = rt.flashT > 0;
      flashRef.current.material.opacity = clamp(rt.flashT * 2, 0, 0.6);
    }

    const player = playerRef.current.position;
    const step = clamp(speed, 0.25, 4) * 1.6;

    const actionList = Array.isArray(actions) ? actions : [];
    const current = actionList.length
      ? actionList[rt.actionIndex % actionList.length]
      : null;
    rt.actionElapsed += delta;

    if (current?.type === "move") {
      const dir = current.dir;
      const v = step * delta;
      if (dir === "forward") player.z -= v;
      if (dir === "back") player.z += v;
      if (dir === "left") player.x -= v;
      if (dir === "right") player.x += v;
    }

    if (current?.type === "attack" && rt.attackCooldown <= 0) {
      rt.attackCooldown = 0.6;
      rt.flashT = 0.25;
      if (flashRef.current) {
        flashRef.current.position.set(player.x, 0.35, player.z);
      }

      setEnemies((prev) => {
        if (!prev.length) return prev;
        let nearestIdx = -1;
        let nearestDist = Infinity;
        for (let i = 0; i < prev.length; i += 1) {
          const d = prev[i].pos.distanceTo(player);
          if (d < nearestDist) {
            nearestDist = d;
            nearestIdx = i;
          }
        }
        if (nearestIdx >= 0 && nearestDist <= 1.35) {
          onKill?.();
          return prev.filter((_, i) => i !== nearestIdx);
        }
        return prev;
      });
    }

    const commandDuration = 0.5;
    if (rt.actionElapsed >= commandDuration) {
      rt.actionElapsed = 0;
      rt.actionIndex =
        (rt.actionIndex + 1) % Math.max(1, actionList.length || 1);
    }

    player.x = clamp(player.x, -5, 5);
    player.z = clamp(player.z, -5, 5);

    const enemySpeed = 0.5 + level * 0.08;
    let touched = false;

    setEnemies((prev) => {
      const next = prev.map((e) => {
        const dir = new THREE.Vector3()
          .subVectors(player, e.pos)
          .setY(0);
        const dist = dir.length();
        if (dist > 0.0001) {
          dir.normalize();
          e.pos.addScaledVector(dir, enemySpeed * delta);
        }
        if (dist <= 0.55) touched = true;
        return e;
      });
      return next;
    });

    if (touched) {
      onCrash?.("defeated");
    }
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 10, 5]} intensity={1.0} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[14, 14]} />
        <meshStandardMaterial color="#111827" />
      </mesh>

      <mesh ref={playerRef} position={[0, 0.35, 0]}>
        <boxGeometry args={[0.6, 0.6, 0.6]} />
        <meshStandardMaterial color="#f97316" />
      </mesh>

      <mesh ref={flashRef} visible={false} position={[0, 0.35, 0]}>
        <sphereGeometry args={[1.1, 24, 24]} />
        <meshStandardMaterial
          color="#fb923c"
          transparent
          opacity={0.0}
          emissive="#f97316"
          emissiveIntensity={0.7}
        />
      </mesh>

      {enemies.map((e) => (
        <mesh key={e.id} position={e.pos}>
          <sphereGeometry args={[0.35, 24, 24]} />
          <meshStandardMaterial color="#e11d48" />
        </mesh>
      ))}
    </>
  );
};

const Scene = (props) => {
  return (
    <Canvas camera={{ position: [0, 7.5, 8.5], fov: 55 }}>
      <World {...props} />
    </Canvas>
  );
};

const InteractiveCodingGamePrompt = () => {
  const [code, setCode] = useState(
    `# Write code in any language — only logic matters\n\n# examples (any style):\n# speed = 2\n# moveForward()\n# left\n# attack()`
  );
  const [running, setRunning] = useState(false);
  const [crash, setCrash] = useState(null);
  const [speed, setSpeed] = useState(1.0);
  const [actions, setActions] = useState([]);
  const [xp, setXp] = useState(0);
  const [kills, setKills] = useState(0);
  const [resetSignal, setResetSignal] = useState(0);
  const [level, setLevel] = useState(1);

  const rank = useMemo(() => computeRank(xp), [xp]);

  useEffect(() => {
    const nextLevel = 1 + Math.floor(xp / 120);
    if (nextLevel !== level) setLevel(nextLevel);
  }, [xp, level]);

  const crashGame = (reason) => {
    setRunning(false);
    setCrash(reason || "invalid");
  };

  const run = () => {
    const parsed = parseLogic(code);
    if (!parsed.ok) {
      crashGame(parsed.error);
      return;
    }
    setCrash(null);
    setSpeed(parsed.speed);
    setActions(parsed.actions);
    setRunning(true);
  };

  const stop = () => {
    setRunning(false);
  };

  const reset = () => {
    setRunning(false);
    setCrash(null);
    setXp(0);
    setKills(0);
    setLevel(1);
    setResetSignal((n) => n + 1);
  };

  const onKill = () => {
    setKills((k) => k + 1);
    setXp((prev) => {
      const actionCount = Array.isArray(actions) ? actions.length : 0;
      const base = 25;
      const efficiencyBonus = clamp(20 - actionCount, 0, 20);
      return prev + base + efficiencyBonus;
    });
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
              <Code className="w-7 h-7 text-orange-400" />
              3D Animated Coding Game
              <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                Prototype
              </Badge>
            </h1>
            <p className="text-zinc-400 text-sm mt-1">
              Your code controls the player live. Errors crash.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg">
              <Zap className="w-4 h-4 text-orange-400" />
              <span className="text-sm text-white font-semibold">XP</span>
              <span className="text-sm text-zinc-300">{xp}</span>
              <span className="text-xs text-zinc-500">({rank})</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg">
              <span className="text-sm text-white font-semibold">Level</span>
              <span className="text-sm text-zinc-300">{level}</span>
              <span className="text-xs text-zinc-500">Kills {kills}</span>
            </div>

            {!running ? (
              <Button onClick={run} className="gap-2">
                <Play className="w-4 h-4" />
                Run
              </Button>
            ) : (
              <Button variant="outline" onClick={stop} className="gap-2">
                <Square className="w-4 h-4" />
                Stop
              </Button>
            )}
            <Button variant="outline" onClick={reset} className="gap-2">
              <RotateCcw className="w-4 h-4" />
              Reset
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          <Card className="bg-zinc-900 border-zinc-800 lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-white">Player Code</CardTitle>
              <CardDescription className="text-zinc-400">
                Language-agnostic logic interpreter (movement/speed/attack).
              </CardDescription>
            </CardHeader>
            <CardContent>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full h-80 md:h-[520px] bg-black/30 border border-zinc-800 rounded-lg p-3 text-sm text-zinc-100 font-mono focus:outline-none focus:border-orange-500"
                spellCheck={false}
              />
              <div className="mt-3 text-xs text-zinc-500 leading-relaxed">
                Interprets intent keywords like: forward/back/left/right, speed,
                attack.
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800 lg:col-span-3 overflow-hidden relative">
            <CardHeader>
              <CardTitle className="text-white">Game World</CardTitle>
              <CardDescription className="text-zinc-400">
                Avoid enemies. Attack when close.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-[420px] md:h-[620px]">
                <Scene
                  running={running}
                  speed={speed}
                  actions={actions}
                  level={level}
                  resetSignal={resetSignal}
                  onCrash={crashGame}
                  onKill={onKill}
                />
              </div>

              {crash && (
                <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                  <div className="text-center px-6">
                    <div className="text-3xl font-extrabold text-orange-400 mb-2">
                      CRASH
                    </div>
                    <div className="text-sm text-zinc-200">
                      {CRASH_MESSAGES[crash] || "Game crashed."}
                    </div>
                    <div className="mt-4 flex items-center justify-center gap-2">
                      <Button onClick={run} className="gap-2">
                        <Play className="w-4 h-4" />
                        Try Again
                      </Button>
                      <Button
                        variant="outline"
                        onClick={reset}
                        className="gap-2"
                      >
                        <RotateCcw className="w-4 h-4" />
                        Reset
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default InteractiveCodingGamePrompt;
