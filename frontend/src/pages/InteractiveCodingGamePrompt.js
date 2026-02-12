import React, { useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Car,
  CircleHelp,
  Code,
  Play,
  RotateCcw,
  Square,
  Star,
  X,
} from "lucide-react";

const LANES = [-2.2, 0, 2.2];
const LANE_NAMES = ["Left", "Center", "Right"];

const CRASH_MESSAGES = {
  traffic: "Traffic collision. Race over.",
  invalid: "Could not interpret your logic.",
  defeated: "You were defeated.",
};

const HOW_TO_PLAY_STEPS = [
  "Pick a coding language to load that language's quiz questions.",
  "Write commands in the code box: left, right, forward, back, attack.",
  "Your car auto-races. Stars are answer options for the current question.",
  "Attack near a star to select that answer. Correct hit gives +5 points.",
  "Avoid traffic cars. Crashes reduce lives. 0 lives ends the game.",
];

const QUESTION_BANK = {
  javascript: [
    {
      id: "js-1",
      prompt: "Which keyword declares a block-scoped variable?",
      choices: ["let", "var", "global"],
      answer: "let",
    },
    {
      id: "js-2",
      prompt: "What does `===` check?",
      choices: ["Type and value", "Only value", "Only type"],
      answer: "Type and value",
    },
    {
      id: "js-3",
      prompt: "Which method adds item to array end?",
      choices: ["push", "pop", "shift"],
      answer: "push",
    },
  ],
  python: [
    {
      id: "py-1",
      prompt: "Which keyword defines a function?",
      choices: ["def", "func", "lambda"],
      answer: "def",
    },
    {
      id: "py-2",
      prompt: "What data type is `[1, 2, 3]`?",
      choices: ["list", "tuple", "dict"],
      answer: "list",
    },
    {
      id: "py-3",
      prompt: "How do you start a for loop?",
      choices: ["for x in y:", "foreach x in y", "loop x in y"],
      answer: "for x in y:",
    },
  ],
  java: [
    {
      id: "java-1",
      prompt: "Which method is Java entry point?",
      choices: ["main", "start", "run"],
      answer: "main",
    },
    {
      id: "java-2",
      prompt: "Which keyword creates subclass inheritance?",
      choices: ["extends", "inherits", "implements"],
      answer: "extends",
    },
    {
      id: "java-3",
      prompt: "Primitive type for true/false?",
      choices: ["boolean", "bool", "flag"],
      answer: "boolean",
    },
  ],
  cpp: [
    {
      id: "cpp-1",
      prompt: "Which operator accesses pointer member?",
      choices: ["->", ".", "::"],
      answer: "->",
    },
    {
      id: "cpp-2",
      prompt: "Header for `std::cout`?",
      choices: ["<iostream>", "<stdio.h>", "<ostream.h>"],
      answer: "<iostream>",
    },
    {
      id: "cpp-3",
      prompt: "Keyword for constant variable?",
      choices: ["const", "final", "static"],
      answer: "const",
    },
  ],
};

const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

const shuffle = (arr) => {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const createRound = (language, previousQuestionId = null) => {
  const set = QUESTION_BANK[language] || QUESTION_BANK.javascript;
  const pool =
    set.filter((q) => q.id !== previousQuestionId).length > 0
      ? set.filter((q) => q.id !== previousQuestionId)
      : set;
  const question = pool[Math.floor(Math.random() * pool.length)];
  const laneOrder = shuffle([0, 1, 2]);
  const options = shuffle(question.choices).map((choice, idx) => {
    const laneIndex = laneOrder[idx % 3];
    return {
      id: `${question.id}-${choice}-${idx}`,
      text: choice,
      isCorrect: choice === question.answer,
      laneIndex,
      laneX: LANES[laneIndex],
      laneName: LANE_NAMES[laneIndex],
    };
  });
  return {
    key: `${question.id}-${Date.now()}-${Math.random().toString(16).slice(2, 7)}`,
    questionId: question.id,
    question: question.prompt,
    answer: question.answer,
    options,
  };
};

const parseLogic = (rawCode) => {
  const code = String(rawCode || "");
  const normalized = code.toLowerCase();

  if (code.length > 5000) {
    return { ok: false, error: "invalid" };
  }

  const infiniteLoopPatterns = [
    /while\s*\(\s*true\s*\)/i,
    /for\s*\(\s*;\s*;\s*\)/i,
    /repeat\s*forever/i,
    /loop\s*forever/i,
  ];
  if (infiniteLoopPatterns.some((re) => re.test(code))) {
    return { ok: false, error: "invalid" };
  }

  let speed = 1.1;
  const speedMatch =
    code.match(/\bspeed\s*[:=]\s*(\d+(?:\.\d+)?)/i) ||
    code.match(/\bset\s*speed\s*\(\s*(\d+(?:\.\d+)?)\s*\)/i) ||
    code.match(/\bsetSpeed\s*\(\s*(\d+(?:\.\d+)?)\s*\)/i);
  if (speedMatch?.[1]) {
    const parsed = Number(speedMatch[1]);
    if (Number.isFinite(parsed)) speed = clamp(parsed, 0.6, 2.4);
  }

  const actions = [];
  const lines = code
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  for (const line of lines) {
    const l = line.toLowerCase();
    const has = (kw) => l.includes(kw);

    if (has("left")) {
      actions.push({ type: "lane", dir: "left" });
      continue;
    }
    if (has("right")) {
      actions.push({ type: "lane", dir: "right" });
      continue;
    }
    if (has("attack") || has("shoot") || has("hit")) {
      actions.push({ type: "attack" });
      continue;
    }
    if (has("forward") || has("boost") || has("accelerate")) {
      actions.push({ type: "boost" });
      continue;
    }
    if (has("back") || has("brake") || has("slow")) {
      actions.push({ type: "brake" });
      continue;
    }
  }

  if (normalized.includes("if") && actions.length === 0) {
    return { ok: false, error: "invalid" };
  }

  return { ok: true, speed, actions };
};

const makeTrafficCars = (count) => {
  const cars = [];
  for (let i = 0; i < count; i += 1) {
    const laneIndex = Math.floor(Math.random() * LANES.length);
    cars.push({
      id: `traffic-${Date.now()}-${i}-${Math.random().toString(16).slice(2)}`,
      laneIndex,
      x: LANES[laneIndex] + (Math.random() - 0.5) * 0.2,
      z: 5 + i * 3.2 + Math.random() * 4,
      speedMul: 0.8 + Math.random() * 0.8,
      driftSeed: Math.random() * Math.PI * 2,
    });
  }
  return cars;
};

const makeStarsForRound = (round) => {
  return round.options.map((opt, idx) => ({
    id: `star-${round.key}-${idx}`,
    optionId: opt.id,
    text: opt.text,
    isCorrect: opt.isCorrect,
    laneIndex: opt.laneIndex,
    x: opt.laneX,
    z: 9 + idx * 1.6,
    spin: Math.random() * Math.PI * 2,
  }));
};

const RacingWorld = ({
  running,
  speed,
  actions,
  round,
  level,
  resetSignal,
  onTrafficHit,
  onAnswerAttack,
  onActionStep,
}) => {
  const playerRef = useRef(null);
  const pulseRef = useRef(null);
  const stripeRefs = useRef([]);
  const [traffic, setTraffic] = useState(() => makeTrafficCars(6));
  const [stars, setStars] = useState(() => makeStarsForRound(round));

  const runtimeRef = useRef({
    laneIndex: 1,
    commandIndex: 0,
    commandElapsed: 0,
    attackCooldown: 0,
    pulseT: 0,
    speedMod: 1,
    trafficHitCooldown: 0,
  });

  useEffect(() => {
    runtimeRef.current = {
      laneIndex: 1,
      commandIndex: 0,
      commandElapsed: 0,
      attackCooldown: 0,
      pulseT: 0,
      speedMod: 1,
      trafficHitCooldown: 0,
    };
    if (playerRef.current) {
      playerRef.current.position.set(0, 0.35, -3.5);
    }
    onActionStep?.(0);
    setTraffic(makeTrafficCars(clamp(5 + level, 5, 10)));
    setStars(makeStarsForRound(round));
  }, [level, resetSignal, round, onActionStep]);

  const fireAttack = () => {
    runtimeRef.current.attackCooldown = 0.55;
    runtimeRef.current.pulseT = 0.28;
    const playerPos = playerRef.current?.position;
    if (!playerPos) return;

    let hitResult = null;
    setStars((prev) => {
      let nearestIdx = -1;
      let nearestDist = Infinity;
      for (let i = 0; i < prev.length; i += 1) {
        const s = prev[i];
        const dx = s.x - playerPos.x;
        const dz = s.z - playerPos.z;
        const d = Math.sqrt(dx * dx + dz * dz);
        if (d < nearestDist) {
          nearestDist = d;
          nearestIdx = i;
        }
      }

      if (nearestIdx >= 0 && nearestDist <= 1.55) {
        const hit = prev[nearestIdx];
        hitResult = {
          hit: true,
          correct: hit.isCorrect,
          text: hit.text,
        };
      }
      return prev;
    });

    if (hitResult) {
      onAnswerAttack?.(hitResult);
    } else {
      onAnswerAttack?.({ hit: false });
    }
  };

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();
    const rt = runtimeRef.current;

    rt.attackCooldown = Math.max(0, rt.attackCooldown - delta);
    rt.pulseT = Math.max(0, rt.pulseT - delta);
    rt.trafficHitCooldown = Math.max(0, rt.trafficHitCooldown - delta);
    rt.speedMod += (1 - rt.speedMod) * delta * 2.8;

    if (pulseRef.current) {
      pulseRef.current.visible = rt.pulseT > 0;
      pulseRef.current.material.opacity = clamp(rt.pulseT * 2.8, 0, 0.65);
      const scale = 1 + (0.28 - rt.pulseT) * 5.4;
      pulseRef.current.scale.set(scale, 1, scale);
      if (playerRef.current) {
        pulseRef.current.position.set(
          playerRef.current.position.x,
          0.14,
          playerRef.current.position.z
        );
      }
    }

    if (!running) return;
    if (!playerRef.current) return;

    const actionList = Array.isArray(actions) ? actions : [];
    const player = playerRef.current.position;
    const roadSpeed = (2.8 + level * 0.18) * clamp(speed, 0.6, 2.4) * rt.speedMod;
    const frameMove = roadSpeed * delta;

    rt.commandElapsed += delta;
    if (rt.commandElapsed >= 0.42) {
      rt.commandElapsed = 0;
      const currentAction = actionList.length
        ? actionList[rt.commandIndex % actionList.length]
        : null;

      if (currentAction?.type === "lane") {
        if (currentAction.dir === "left") {
          rt.laneIndex = clamp(rt.laneIndex - 1, 0, 2);
        } else if (currentAction.dir === "right") {
          rt.laneIndex = clamp(rt.laneIndex + 1, 0, 2);
        }
      } else if (currentAction?.type === "boost") {
        rt.speedMod = clamp(rt.speedMod + 0.23, 1, 1.65);
      } else if (currentAction?.type === "brake") {
        rt.speedMod = clamp(rt.speedMod - 0.25, 0.65, 1.2);
      } else if (currentAction?.type === "attack" && rt.attackCooldown <= 0) {
        fireAttack();
      }

      rt.commandIndex = (rt.commandIndex + 1) % Math.max(1, actionList.length || 1);
      onActionStep?.(rt.commandIndex);
    }

    const targetX = LANES[rt.laneIndex];
    player.x += (targetX - player.x) * clamp(delta * 9, 0, 1);
    player.y = 0.35;
    player.z = -3.5;

    if (stripeRefs.current.length) {
      stripeRefs.current.forEach((stripe) => {
        if (!stripe) return;
        stripe.position.z -= frameMove * 2;
        if (stripe.position.z < -8.5) {
          stripe.position.z += 18;
        }
      });
    }

    setStars((prev) =>
      prev.map((s) => {
        const nextZ = s.z - frameMove * 1.15;
        const resetZ = nextZ < -8 ? 8 + Math.random() * 4 : nextZ;
        return {
          ...s,
          z: resetZ,
          spin: s.spin + delta * 2.8,
        };
      })
    );

    let touchedTraffic = false;
    setTraffic((prev) =>
      prev.map((c) => {
        let nextZ = c.z - frameMove * c.speedMul;
        let nextLane = c.laneIndex;
        if (nextZ < -9) {
          nextZ = 9 + Math.random() * 7;
          nextLane = Math.floor(Math.random() * 3);
        }
        const nx = LANES[nextLane] + Math.sin(t + c.driftSeed) * 0.16;
        if (
          rt.trafficHitCooldown <= 0 &&
          Math.abs(nx - player.x) < 0.7 &&
          Math.abs(nextZ - player.z) < 0.85
        ) {
          touchedTraffic = true;
        }
        return {
          ...c,
          laneIndex: nextLane,
          x: nx,
          z: nextZ,
        };
      })
    );

    if (touchedTraffic) {
      rt.trafficHitCooldown = 1.0;
      onTrafficHit?.();
    }
  });

  return (
    <>
      <ambientLight intensity={0.52} />
      <directionalLight position={[4, 10, 5]} intensity={1.1} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[10, 20]} />
        <meshStandardMaterial color="#0a0f1f" />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-3.2, 0.01, 0]}>
        <planeGeometry args={[0.2, 20]} />
        <meshStandardMaterial color="#1f2937" emissive="#111827" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[3.2, 0.01, 0]}>
        <planeGeometry args={[0.2, 20]} />
        <meshStandardMaterial color="#1f2937" emissive="#111827" />
      </mesh>

      {Array.from({ length: 12 }).map((_, i) => (
        <mesh
          key={`stripe-${i}`}
          ref={(el) => {
            stripeRefs.current[i] = el;
          }}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.02, -7.8 + i * 1.55]}
        >
          <planeGeometry args={[0.22, 0.7]} />
          <meshStandardMaterial color="#e5e7eb" emissive="#9ca3af" emissiveIntensity={0.2} />
        </mesh>
      ))}

      <group ref={playerRef} position={[0, 0.35, -3.5]}>
        <mesh position={[0, 0.18, 0]}>
          <boxGeometry args={[0.95, 0.3, 1.65]} />
          <meshStandardMaterial color="#fb923c" />
        </mesh>
        <mesh position={[0, 0.37, -0.15]}>
          <boxGeometry args={[0.56, 0.2, 0.66]} />
          <meshStandardMaterial color="#f59e0b" />
        </mesh>
      </group>

      <mesh ref={pulseRef} visible={false} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.14, -3.5]}>
        <ringGeometry args={[0.55, 1.2, 48]} />
        <meshStandardMaterial color="#fde047" emissive="#facc15" emissiveIntensity={0.8} transparent opacity={0} />
      </mesh>

      {traffic.map((car) => (
        <group key={car.id} position={[car.x, 0.3, car.z]}>
          <mesh position={[0, 0.16, 0]}>
            <boxGeometry args={[0.86, 0.28, 1.45]} />
            <meshStandardMaterial color="#ef4444" />
          </mesh>
          <mesh position={[0, 0.34, -0.1]}>
            <boxGeometry args={[0.48, 0.18, 0.56]} />
            <meshStandardMaterial color="#dc2626" />
          </mesh>
        </group>
      ))}

      {stars.map((s) => (
        <group key={s.id} position={[s.x, 0.54, s.z]} rotation={[0, s.spin, 0]}>
          <mesh>
            <icosahedronGeometry args={[0.34, 0]} />
            <meshStandardMaterial
              color={s.isCorrect ? "#22c55e" : "#38bdf8"}
              emissive={s.isCorrect ? "#16a34a" : "#0284c7"}
              emissiveIntensity={0.65}
            />
          </mesh>
          <mesh position={[0, -0.35, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.25, 0.36, 24]} />
            <meshStandardMaterial color="#f8fafc" emissive="#cbd5e1" emissiveIntensity={0.3} />
          </mesh>
        </group>
      ))}
    </>
  );
};

const Scene = (props) => {
  return (
    <Canvas camera={{ position: [0, 8, 6], fov: 52 }}>
      <RacingWorld {...props} />
    </Canvas>
  );
};

const languageLabel = (lang) => {
  if (lang === "javascript") return "JavaScript";
  if (lang === "python") return "Python";
  if (lang === "java") return "Java";
  return "C++";
};

const commandLabel = (action) => {
  if (!action) return "No command";
  if (action.type === "lane") return action.dir === "left" ? "Lane Left" : "Lane Right";
  if (action.type === "attack") return "Attack";
  if (action.type === "boost") return "Boost";
  if (action.type === "brake") return "Brake";
  return "No command";
};

const InteractiveCodingGamePrompt = () => {
  const [language, setLanguage] = useState("javascript");
  const [round, setRound] = useState(() => createRound("javascript"));
  const [code, setCode] = useState(
    "# Racing bot commands\nspeed = 1.2\nleft\nforward\nattack\nright\nforward\nattack"
  );
  const [running, setRunning] = useState(false);
  const [crash, setCrash] = useState(null);
  const [speed, setSpeed] = useState(1.1);
  const [actions, setActions] = useState([]);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(1);
  const [activeActionIndex, setActiveActionIndex] = useState(0);
  const [resetSignal, setResetSignal] = useState(0);
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [lastEvent, setLastEvent] = useState("Attack the correct star to score.");

  const activeAction = actions.length
    ? actions[activeActionIndex % actions.length]
    : null;

  useEffect(() => {
    setRound(createRound(language, round.questionId));
    setStreak(0);
    setLastEvent(`Language switched to ${languageLabel(language)}.`);
    setResetSignal((n) => n + 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  useEffect(() => {
    const nextLevel = 1 + Math.floor(score / 25);
    if (nextLevel !== level) setLevel(nextLevel);
  }, [score, level]);

  const crashGame = (reason) => {
    setRunning(false);
    setCrash(reason || "traffic");
  };

  const run = () => {
    const parsed = parseLogic(code);
    if (!parsed.ok) {
      crashGame(parsed.error || "invalid");
      return;
    }
    setCrash(null);
    setSpeed(parsed.speed);
    setActions(parsed.actions);
    setRunning(true);
    setLastEvent("Race started. Attack the right answer star.");
  };

  const stop = () => {
    setRunning(false);
    setLastEvent("Race paused.");
  };

  const reset = () => {
    setRunning(false);
    setCrash(null);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setLives(3);
    setLevel(1);
    setActiveActionIndex(0);
    setRound(createRound(language));
    setResetSignal((n) => n + 1);
    setLastEvent("Race reset.");
  };

  const handleAnswerAttack = (result) => {
    if (!result?.hit) {
      setStreak(0);
      setLastEvent("Attack missed. Hit a nearby star.");
      return;
    }

    if (result.correct) {
      setScore((s) => s + 5);
      setStreak((prev) => {
        const next = prev + 1;
        setBestStreak((b) => Math.max(b, next));
        return next;
      });
      setLastEvent(`Correct: "${result.text}" (+5)`);
    } else {
      setScore((s) => Math.max(0, s - 2));
      setStreak(0);
      setLastEvent(`Wrong: "${result.text}" (-2)`);
    }
    setRound(createRound(language, round.questionId));
  };

  const handleTrafficHit = () => {
    setLives((prev) => {
      const next = prev - 1;
      if (next <= 0) {
        crashGame("traffic");
        return 0;
      }
      setLastEvent("Traffic hit: -1 life");
      setResetSignal((n) => n + 1);
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Button
        type="button"
        variant="outline"
        onClick={() => setShowHowToPlay(true)}
        className="fixed top-4 right-4 z-50 gap-2 bg-zinc-900/95 border-zinc-700 hover:bg-zinc-800"
      >
        <CircleHelp className="w-4 h-4" />
        How to Play
      </Button>

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
              <Car className="w-7 h-7 text-orange-400" />
              Code Racing Quiz Arena
              <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                Interactive
              </Badge>
            </h1>
            <p className="text-zinc-400 text-sm mt-1">
              One car. Moving traffic. Attack answer stars based on your code.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="w-44">
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="bg-zinc-900 border-zinc-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-700 text-white">
                  <SelectItem value="javascript">JavaScript</SelectItem>
                  <SelectItem value="python">Python</SelectItem>
                  <SelectItem value="java">Java</SelectItem>
                  <SelectItem value="cpp">C++</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-sm">
              Score <span className="text-orange-400 font-semibold">{score}</span>
            </div>
            <div className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-sm">
              Lives <span className="text-red-400 font-semibold">{lives}</span>
            </div>
            <div className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-sm">
              Streak <span className="text-emerald-400 font-semibold">{streak}</span> / {bestStreak}
            </div>
            <div className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-sm">
              Level <span className="text-sky-400 font-semibold">{level}</span>
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
              <CardTitle className="text-white flex items-center gap-2">
                <Code className="w-5 h-5 text-orange-400" />
                Car Control Code
              </CardTitle>
              <CardDescription className="text-zinc-400">
                Commands: left, right, forward, back, attack, speed = 1.2
              </CardDescription>
            </CardHeader>
            <CardContent>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full h-80 md:h-[560px] bg-black/40 border border-zinc-800 rounded-lg p-3 text-sm text-zinc-100 font-mono focus:outline-none focus:border-orange-500"
                spellCheck={false}
              />
              <div className="mt-3 text-xs text-zinc-500">
                Active Command:{" "}
                <span className="text-orange-400 font-semibold">{commandLabel(activeAction)}</span>
              </div>
              <div className="mt-2 text-xs text-zinc-500">{lastEvent}</div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800 lg:col-span-3 overflow-hidden relative">
            <CardHeader>
              <CardTitle className="text-white">Racing Track</CardTitle>
              <CardDescription className="text-zinc-400">
                Attack the correct answer star. Avoid other cars.
              </CardDescription>
            </CardHeader>
            <div className="px-5 pb-2">
              <div className="text-xs text-zinc-400 mb-2">Question (on your car)</div>
              <div className="inline-block bg-zinc-800 border border-zinc-700 rounded-md px-2.5 py-1.5 text-xs text-zinc-100">
                {round.question}
              </div>
            </div>
            <div className="px-5 pb-3 grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
              {round.options.map((opt) => (
                <div key={opt.id} className="bg-zinc-800/70 border border-zinc-700 rounded-md px-2 py-1.5 text-zinc-200">
                  <Star className="inline w-3.5 h-3.5 mr-1.5 text-yellow-400" />
                  {opt.laneName}: {opt.text}
                </div>
              ))}
            </div>
            <CardContent className="p-0">
              <div className="h-[430px] md:h-[620px]">
                <Scene
                  running={running}
                  speed={speed}
                  actions={actions}
                  round={round}
                  level={level}
                  resetSignal={resetSignal}
                  onTrafficHit={handleTrafficHit}
                  onAnswerAttack={handleAnswerAttack}
                  onActionStep={setActiveActionIndex}
                />
              </div>

              {crash && (
                <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                  <div className="text-center px-6">
                    <div className="text-3xl font-extrabold text-orange-400 mb-2">CRASH</div>
                    <div className="text-sm text-zinc-200">
                      {CRASH_MESSAGES[crash] || "Race ended."}
                    </div>
                    <div className="mt-4 flex items-center justify-center gap-2">
                      <Button onClick={run} className="gap-2">
                        <Play className="w-4 h-4" />
                        Try Again
                      </Button>
                      <Button variant="outline" onClick={reset} className="gap-2">
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

      {showHowToPlay && (
        <div className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-4">
          <Card className="w-full max-w-xl bg-zinc-900 border-zinc-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-white">How to Play</CardTitle>
                <CardDescription className="text-zinc-400">
                  Code-driven racing quiz controls.
                </CardDescription>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setShowHowToPlay(false)}
                className="text-zinc-300 hover:text-white hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </Button>
            </CardHeader>
            <CardContent>
              <ol className="list-decimal pl-5 space-y-2 text-sm text-zinc-200">
                {HOW_TO_PLAY_STEPS.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
              <div className="mt-4 text-xs text-zinc-400">
                Tip: Use simple loops of lane + attack commands for steady scoring.
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default InteractiveCodingGamePrompt;
