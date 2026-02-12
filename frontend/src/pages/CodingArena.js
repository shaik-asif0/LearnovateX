import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from "react";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import { Input } from "../components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Code,
  Play,
  Loader2,
  Trophy,
  Clock,
  CheckCircle2,
  XCircle,
  Zap,
  Target,
  BookOpen,
  TrendingUp,
  RefreshCw,
  Copy,
  Check,
  FileCode,
  Sparkles,
  AlertCircle,
  Star,
  Bot,
  MessageSquare,
  Send,
  User,
  Lightbulb,
  ChevronRight,
  Flame,
  Award,
  BarChart3,
  History,
  ThumbsUp,
  ArrowRight,
  CircleDot,
  Timer,
  Pause,
  RotateCcw,
  Terminal,
  Crosshair,
  Trash2,
} from "lucide-react";
import Editor from "@monaco-editor/react";
import axiosInstance from "../lib/axios";
import { toast } from "sonner";
import { getUser } from "../lib/utils";
import { useI18n } from "../i18n/I18nProvider";

const PROGRAM_CATEGORIES = [
  { id: "arrays", name: "Arrays" },
  { id: "strings", name: "Strings" },
  { id: "hashing", name: "Hashing" },
  { id: "two-pointers", name: "Two Pointers" },
  { id: "stack-queue", name: "Stack & Queue" },
  { id: "binary-search", name: "Binary Search" },
  { id: "linked-list", name: "Linked List" },
  { id: "trees", name: "Trees" },
  { id: "graphs", name: "Graphs" },
  { id: "dynamic-programming", name: "Dynamic Programming" },
  { id: "greedy", name: "Greedy" },
  { id: "math", name: "Math" },
];

const DIFFICULTIES = ["Easy", "Medium", "Hard"];

const getCategoryLabel = (categoryId) => {
  return PROGRAM_CATEGORIES.find((c) => c.id === categoryId)?.name || "General";
};

const inferCategoryIdFromTags = (tags = []) => {
  const set = new Set((tags || []).map((t) => String(t).toLowerCase()));
  if (set.has("array")) return "arrays";
  if (set.has("string")) return "strings";
  if (set.has("hash table") || set.has("hashing")) return "hashing";
  if (set.has("two pointers")) return "two-pointers";
  if (set.has("stack") || set.has("queue")) return "stack-queue";
  if (set.has("binary search")) return "binary-search";
  if (set.has("linked list")) return "linked-list";
  if (set.has("tree") || set.has("trees")) return "trees";
  if (set.has("graph") || set.has("graphs")) return "graphs";
  if (set.has("dynamic programming") || set.has("dp"))
    return "dynamic-programming";
  if (set.has("greedy")) return "greedy";
  if (set.has("math")) return "math";
  return "arrays";
};

const makeGenericStarterCode = (fnName) => ({
  python: `def ${fnName}(*args):\n    # Write your code here\n    pass\n\n# Add custom tests here\n`,
  javascript: `function ${fnName}(...args) {\n  // Write your code here\n}\n\n// Add custom tests here\n`,
  java: `public class Solution {\n    public static Object ${fnName}(Object... args) {\n        // Write your code here\n        return null;\n    }\n\n    public static void main(String[] args) {\n        // Add custom tests here\n    }\n}\n`,
});

const hashToInt = (text) => {
  // Deterministic, fast, non-crypto hash.
  let h = 2166136261;
  const s = String(text);
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
};

const makeRng = (seedText) => {
  let seed = hashToInt(seedText) || 1;
  // Mulberry32
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const pick = (rng, list) => {
  if (!list || list.length === 0) return undefined;
  const idx = Math.floor(rng() * list.length);
  return list[Math.min(Math.max(idx, 0), list.length - 1)];
};

const intBetween = (rng, min, max) => {
  const a = Math.ceil(min);
  const b = Math.floor(max);
  return Math.floor(rng() * (b - a + 1)) + a;
};

const makeIntArray = (rng, len, min, max) => {
  const out = [];
  for (let i = 0; i < len; i++) out.push(intBetween(rng, min, max));
  return out;
};

const makeString = (rng, len) => {
  const alphabet = "abcdefghijklmnopqrstuvwxyz";
  let s = "";
  for (let i = 0; i < len; i++)
    s += alphabet[intBetween(rng, 0, alphabet.length - 1)];
  return s;
};

const formatExampleValue = (value) => {
  if (typeof value === "string") return value;
  return JSON.stringify(value);
};

const buildExample = ({ input, output, explanation }) => {
  const lines = [
    `Example 1:`,
    `Input: ${input}`,
    `Output: ${formatExampleValue(output)}`,
  ];
  if (explanation) lines.push(`Explanation: ${explanation}`);
  return lines.join("\n");
};

const maxSumWindow = (nums, k) => {
  if (!Array.isArray(nums) || nums.length === 0 || k <= 0) return 0;
  if (k >= nums.length) return nums.reduce((a, b) => a + b, 0);
  let sum = 0;
  for (let i = 0; i < k; i++) sum += nums[i];
  let best = sum;
  for (let i = k; i < nums.length; i++) {
    sum += nums[i] - nums[i - k];
    if (sum > best) best = sum;
  }
  return best;
};

const countPairsSum = (nums, target) => {
  const freq = new Map();
  let count = 0;
  for (const x of nums) {
    const need = target - x;
    count += freq.get(need) || 0;
    freq.set(x, (freq.get(x) || 0) + 1);
  }
  return count;
};

const rotateRight = (nums, k) => {
  const arr = [...nums];
  if (arr.length === 0) return arr;
  const r = ((k % arr.length) + arr.length) % arr.length;
  if (r === 0) return arr;
  return [...arr.slice(-r), ...arr.slice(0, arr.length - r)];
};

const subarraySumEqualsK = (nums, k) => {
  const seen = new Map();
  seen.set(0, 1);
  let sum = 0;
  let ans = 0;
  for (const x of nums) {
    sum += x;
    ans += seen.get(sum - k) || 0;
    seen.set(sum, (seen.get(sum) || 0) + 1);
  }
  return ans;
};

const firstUniqueCharIndex = (s) => {
  const freq = new Map();
  for (const ch of s) freq.set(ch, (freq.get(ch) || 0) + 1);
  for (let i = 0; i < s.length; i++) if (freq.get(s[i]) === 1) return i;
  return -1;
};

const reverseWords = (s) => {
  return String(s).trim().split(/\s+/).filter(Boolean).reverse().join(" ");
};

const longestUniqueSubstringLen = (s) => {
  const last = new Map();
  let left = 0;
  let best = 0;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (last.has(ch)) left = Math.max(left, last.get(ch) + 1);
    last.set(ch, i);
    best = Math.max(best, i - left + 1);
  }
  return best;
};

const mostFrequentElement = (nums) => {
  const freq = new Map();
  let bestVal = nums[0];
  let bestCount = -1;
  for (const x of nums) {
    const c = (freq.get(x) || 0) + 1;
    freq.set(x, c);
    if (c > bestCount) {
      bestCount = c;
      bestVal = x;
    }
  }
  return bestVal;
};

const firstKDistinct = (nums, k) => {
  const seen = new Set();
  const out = [];
  for (const x of nums) {
    if (!seen.has(x)) {
      seen.add(x);
      out.push(x);
      if (out.length === k) break;
    }
  }
  return out;
};

const twoSumFirst = (nums, target) => {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const need = target - nums[i];
    if (map.has(need)) return [map.get(need), i];
    if (!map.has(nums[i])) map.set(nums[i], i);
  }
  return [-1, -1];
};

const dedupeSortedLength = (nums) => {
  if (nums.length === 0) return 0;
  let write = 1;
  for (let i = 1; i < nums.length; i++) {
    if (nums[i] !== nums[i - 1]) {
      nums[write] = nums[i];
      write++;
    }
  }
  return write;
};

const maxContainerArea = (heights) => {
  let l = 0;
  let r = heights.length - 1;
  let best = 0;
  while (l < r) {
    const h = Math.min(heights[l], heights[r]);
    best = Math.max(best, h * (r - l));
    if (heights[l] < heights[r]) l++;
    else r--;
  }
  return best;
};

const moveZerosToEnd = (nums) => {
  const out = [...nums];
  let write = 0;
  for (const x of out) if (x !== 0) out[write++] = x;
  while (write < out.length) out[write++] = 0;
  return out;
};

const isValidParentheses = (s) => {
  const st = [];
  const match = { ")": "(", "]": "[", "}": "{" };
  for (const ch of s) {
    if (ch === "(" || ch === "[" || ch === "{") st.push(ch);
    else {
      if (st.length === 0) return false;
      const top = st.pop();
      if (top !== match[ch]) return false;
    }
  }
  return st.length === 0;
};

const nextGreaterElements = (nums) => {
  const out = new Array(nums.length).fill(-1);
  const st = [];
  for (let i = 0; i < nums.length; i++) {
    while (st.length && nums[i] > nums[st[st.length - 1]]) {
      out[st.pop()] = nums[i];
    }
    st.push(i);
  }
  return out;
};

const slidingWindowMaximum = (nums, k) => {
  if (k <= 0 || nums.length === 0) return [];
  const deque = [];
  const out = [];
  for (let i = 0; i < nums.length; i++) {
    while (deque.length && deque[0] <= i - k) deque.shift();
    while (deque.length && nums[deque[deque.length - 1]] <= nums[i])
      deque.pop();
    deque.push(i);
    if (i >= k - 1) out.push(nums[deque[0]]);
  }
  return out;
};

const searchInsertPosition = (nums, target) => {
  let l = 0;
  let r = nums.length;
  while (l < r) {
    const m = (l + r) >> 1;
    if (nums[m] < target) l = m + 1;
    else r = m;
  }
  return l;
};

const firstLastPosition = (nums, target) => {
  const left = (() => {
    let l = 0,
      r = nums.length;
    while (l < r) {
      const m = (l + r) >> 1;
      if (nums[m] < target) l = m + 1;
      else r = m;
    }
    return l;
  })();
  const right = (() => {
    let l = 0,
      r = nums.length;
    while (l < r) {
      const m = (l + r) >> 1;
      if (nums[m] <= target) l = m + 1;
      else r = m;
    }
    return l - 1;
  })();
  if (left >= nums.length || nums[left] !== target) return [-1, -1];
  return [left, right];
};

const minInRotated = (nums) => {
  let l = 0;
  let r = nums.length - 1;
  while (l < r) {
    const m = (l + r) >> 1;
    if (nums[m] <= nums[r]) r = m;
    else l = m + 1;
  }
  return nums[l];
};

const binarySearchIndex = (nums, target) => {
  let l = 0;
  let r = nums.length - 1;
  while (l <= r) {
    const m = (l + r) >> 1;
    if (nums[m] === target) return m;
    if (nums[m] < target) l = m + 1;
    else r = m - 1;
  }
  return -1;
};

const maxProfitOnce = (prices) => {
  let minP = Infinity;
  let best = 0;
  for (const p of prices) {
    if (p < minP) minP = p;
    best = Math.max(best, p - minP);
  }
  return best;
};

const gcd = (a, b) => {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) {
    const t = x % y;
    x = y;
    y = t;
  }
  return x;
};

const isPrime = (n) => {
  const x = Math.floor(Math.abs(n));
  if (x < 2) return false;
  if (x % 2 === 0) return x === 2;
  for (let d = 3; d * d <= x; d += 2) if (x % d === 0) return false;
  return true;
};

const powMod = (base, exp, mod) => {
  let b = ((base % mod) + mod) % mod;
  let e = exp;
  let res = 1 % mod;
  while (e > 0) {
    if (e & 1) res = (res * b) % mod;
    b = (b * b) % mod;
    e >>= 1;
  }
  return res;
};

const sumAbsDiffs = (nums) => {
  let s = 0;
  for (let i = 1; i < nums.length; i++) s += Math.abs(nums[i] - nums[i - 1]);
  return s;
};

const formatLinkedList = (values) => {
  return `${values.join("->")}->null`;
};

const maxNonOverlappingIntervals = (intervals) => {
  const sorted = [...intervals].sort((a, b) => a[1] - b[1]);
  let count = 0;
  let end = -Infinity;
  for (const [s, e] of sorted) {
    if (s >= end) {
      count++;
      end = e;
    }
  }
  return count;
};

const canJump = (nums) => {
  let farthest = 0;
  for (let i = 0; i < nums.length; i++) {
    if (i > farthest) return false;
    farthest = Math.max(farthest, i + nums[i]);
  }
  return true;
};

const minimizeSumAfterKHalves = (nums, k) => {
  const arr = [...nums];
  for (let op = 0; op < k; op++) {
    let bestIdx = 0;
    for (let i = 1; i < arr.length; i++) if (arr[i] > arr[bestIdx]) bestIdx = i;
    arr[bestIdx] = Math.floor(arr[bestIdx] / 2);
  }
  return arr.reduce((a, b) => a + b, 0);
};

const coinChangeMinCoins = (coins, amount) => {
  const dp = new Array(amount + 1).fill(Infinity);
  dp[0] = 0;
  for (const c of coins) {
    for (let x = c; x <= amount; x++) {
      if (dp[x - c] + 1 < dp[x]) dp[x] = dp[x - c] + 1;
    }
  }
  return dp[amount] === Infinity ? -1 : dp[amount];
};

const lisLength = (nums) => {
  const tails = [];
  for (const x of nums) {
    let l = 0;
    let r = tails.length;
    while (l < r) {
      const m = (l + r) >> 1;
      if (tails[m] < x) l = m + 1;
      else r = m;
    }
    tails[l] = x;
  }
  return tails.length;
};

const houseRobberMax = (nums) => {
  let take = 0;
  let skip = 0;
  for (const val of nums) {
    const newTake = skip + val;
    const newSkip = Math.max(skip, take);
    take = newTake;
    skip = newSkip;
  }
  return Math.max(take, skip);
};

const knapsack01Max = (weights, values, capacity) => {
  const dp = new Array(capacity + 1).fill(0);
  for (let i = 0; i < weights.length; i++) {
    const w = weights[i];
    const v = values[i];
    for (let c = capacity; c >= w; c--) {
      dp[c] = Math.max(dp[c], dp[c - w] + v);
    }
  }
  return dp[capacity];
};

const buildAdj = (n, edges, directed = false) => {
  const adj = Array.from({ length: n }, () => []);
  for (const [u, v] of edges) {
    if (u < 0 || v < 0 || u >= n || v >= n) continue;
    adj[u].push(v);
    if (!directed) adj[v].push(u);
  }
  return adj;
};

const countComponents = (n, edges) => {
  const adj = buildAdj(n, edges, false);
  const seen = new Array(n).fill(false);
  let comps = 0;
  for (let i = 0; i < n; i++) {
    if (seen[i]) continue;
    comps++;
    const q = [i];
    seen[i] = true;
    while (q.length) {
      const cur = q.shift();
      for (const nxt of adj[cur]) {
        if (!seen[nxt]) {
          seen[nxt] = true;
          q.push(nxt);
        }
      }
    }
  }
  return comps;
};

const shortestPathUnweighted = (n, edges, start, end) => {
  const adj = buildAdj(n, edges, false);
  const dist = new Array(n).fill(-1);
  const q = [start];
  dist[start] = 0;
  while (q.length) {
    const cur = q.shift();
    if (cur === end) return dist[cur];
    for (const nxt of adj[cur]) {
      if (dist[nxt] === -1) {
        dist[nxt] = dist[cur] + 1;
        q.push(nxt);
      }
    }
  }
  return -1;
};

const hasCycleUndirected = (n, edges) => {
  const parent = Array.from({ length: n }, (_, i) => i);
  const rank = new Array(n).fill(0);
  const find = (x) => {
    while (parent[x] !== x) {
      parent[x] = parent[parent[x]];
      x = parent[x];
    }
    return x;
  };
  const union = (a, b) => {
    let ra = find(a);
    let rb = find(b);
    if (ra === rb) return false;
    if (rank[ra] < rank[rb]) [ra, rb] = [rb, ra];
    parent[rb] = ra;
    if (rank[ra] === rank[rb]) rank[ra]++;
    return true;
  };
  for (const [u, v] of edges) {
    if (u < 0 || v < 0 || u >= n || v >= n) continue;
    if (!union(u, v)) return true;
  }
  return false;
};

const topoSortKahn = (n, edges) => {
  const adj = buildAdj(n, edges, true);
  const indeg = new Array(n).fill(0);
  for (const [u, v] of edges) {
    if (u < 0 || v < 0 || u >= n || v >= n) continue;
    indeg[v]++;
  }
  const q = [];
  for (let i = 0; i < n; i++) if (indeg[i] === 0) q.push(i);
  const out = [];
  while (q.length) {
    const cur = q.shift();
    out.push(cur);
    for (const nxt of adj[cur]) {
      indeg[nxt]--;
      if (indeg[nxt] === 0) q.push(nxt);
    }
  }
  return out;
};

const buildTreeFromLevelOrder = (arr) => {
  if (!arr || arr.length === 0 || arr[0] == null) return null;
  const nodes = arr.map((v) =>
    v == null ? null : { val: v, left: null, right: null }
  );
  let j = 1;
  for (let i = 0; i < nodes.length && j < nodes.length; i++) {
    if (!nodes[i]) continue;
    nodes[i].left = nodes[j] || null;
    j++;
    if (j < nodes.length) {
      nodes[i].right = nodes[j] || null;
      j++;
    }
  }
  return nodes[0];
};

const serializeTreeLevelOrder = (root) => {
  if (!root) return [];
  const out = [];
  const q = [root];
  while (q.length) {
    const node = q.shift();
    if (!node) {
      out.push(null);
      continue;
    }
    out.push(node.val);
    q.push(node.left);
    q.push(node.right);
  }
  // trim trailing nulls
  while (out.length && out[out.length - 1] == null) out.pop();
  return out;
};

const treeMaxDepth = (root) => {
  if (!root) return 0;
  return 1 + Math.max(treeMaxDepth(root.left), treeMaxDepth(root.right));
};

const invertTree = (root) => {
  if (!root) return null;
  const left = invertTree(root.left);
  const right = invertTree(root.right);
  root.left = right;
  root.right = left;
  return root;
};

const levelOrderTraversal = (root) => {
  if (!root) return [];
  const res = [];
  const q = [root];
  while (q.length) {
    const size = q.length;
    const level = [];
    for (let i = 0; i < size; i++) {
      const node = q.shift();
      level.push(node.val);
      if (node.left) q.push(node.left);
      if (node.right) q.push(node.right);
    }
    res.push(level);
  }
  return res;
};

const isValidBST = (root) => {
  const dfs = (node, lo, hi) => {
    if (!node) return true;
    if (node.val <= lo || node.val >= hi) return false;
    return dfs(node.left, lo, node.val) && dfs(node.right, node.val, hi);
  };
  return dfs(root, -Infinity, Infinity);
};

const generateProblemSpec = ({ categoryId, difficulty, index }) => {
  const id = `${categoryId}-${difficulty.toLowerCase()}-${index}`;
  const rng = makeRng(id);
  const n = intBetween(
    rng,
    difficulty === "Easy" ? 5 : 8,
    difficulty === "Hard" ? 18 : 12
  );

  const difficultyHint =
    difficulty === "Easy"
      ? "Aim for a clear, correct solution."
      : difficulty === "Medium"
      ? "Try to keep it O(n log n) or O(n)."
      : "Look for an optimal approach; brute force may TLE.";

  const commonHints = [
    "Write down the input/output clearly before coding.",
    "Handle edge cases like empty input and duplicates.",
    "Think about time and space complexity.",
    difficultyHint,
  ];

  // Category-specific variants (cycled via index and seeded params)
  if (categoryId === "arrays") {
    const variant = index % 4;
    if (variant === 0) {
      const arr = makeIntArray(rng, n, -9, 12);
      const k = intBetween(rng, 2, Math.min(5, Math.max(2, n - 1)));
      const out = maxSumWindow(arr, k);
      return {
        id,
        title: `Max Sum Subarray of Size ${k} (#${index})`,
        description: `Given an integer array nums, find the maximum sum of any contiguous subarray of length k. Return the max sum.`,
        examples: buildExample({
          input: `nums=${JSON.stringify(arr)}, k=${k}`,
          output: out,
          explanation: "Slide a window of size k and track the maximum sum.",
        }),
        hints: [
          "Sliding window: keep a running sum of the last k elements.",
          "Initialize the first window, then slide by adding next and removing previous.",
          ...commonHints,
        ],
        fnName: `max_sum_window_${k}_${index}`,
        tags: ["Array", "Sliding Window", difficulty],
      };
    }
    if (variant === 1) {
      const arr = makeIntArray(rng, n, 0, 20);
      const target = intBetween(rng, 6, 25);
      const out = countPairsSum(arr, target);
      return {
        id,
        title: `Count Pairs With Sum = ${target} (#${index})`,
        description:
          "Given an integer array nums and an integer target, count the number of unique index pairs (i, j) with i < j such that nums[i] + nums[j] = target.",
        examples: buildExample({
          input: `nums=${JSON.stringify(arr)}, target=${target}`,
          output: out,
          explanation:
            "Count complements using a frequency map as you iterate.",
        }),
        hints: [
          "Use a hash map for frequencies as you iterate.",
          "For each x, add freq[target - x] to the count, then increment freq[x].",
          ...commonHints,
        ],
        fnName: `count_pairs_sum_${target}_${index}`,
        tags: ["Array", "Hashing", difficulty],
      };
    }
    if (variant === 2) {
      const arr = makeIntArray(rng, n, 1, 9);
      const k = intBetween(rng, 1, Math.min(6, n));
      const out = rotateRight(arr, k);
      return {
        id,
        title: `Rotate Array by ${k} (#${index})`,
        description:
          "Given an integer array nums, rotate it to the right by k steps (k may be larger than the array length). Return the rotated array.",
        examples: buildExample({
          input: `nums=${JSON.stringify(arr)}, k=${k}`,
          output: out,
          explanation:
            "Normalize k and rotate using slicing or reverse-in-place.",
        }),
        hints: [
          "Normalize k with k % n.",
          "Try reverse-in-place: reverse whole array, then reverse first k, then reverse rest.",
          ...commonHints,
        ],
        fnName: `rotate_array_${k}_${index}`,
        tags: ["Array", "Two Pointers", difficulty],
      };
    }
    // variant 3
    const arr = makeIntArray(rng, n, -5, 10);
    const target = intBetween(rng, -2, 12);
    const out = subarraySumEqualsK(arr, target);
    return {
      id,
      title: `Subarray Sum Equals ${target} (#${index})`,
      description:
        "Given an integer array nums and an integer k, return the number of contiguous subarrays whose sum equals k.",
      examples: buildExample({
        input: `nums=${JSON.stringify(arr)}, k=${target}`,
        output: out,
        explanation:
          "Use prefix sums and count how many times (sum-k) appeared before.",
      }),
      hints: [
        "Prefix sum + hash map of seen prefix sums.",
        "If current prefix is s, you need count of (s - k) seen so far.",
        ...commonHints,
      ],
      fnName: `subarray_sum_${target}_${index}`,
      tags: ["Array", "Prefix Sum", "Hashing", difficulty],
    };
  }

  if (categoryId === "strings") {
    const variant = index % 4;
    if (variant === 0) {
      const s = makeString(rng, intBetween(rng, 6, 12));
      const out = firstUniqueCharIndex(s);
      return {
        id,
        title: `First Unique Character (#${index})`,
        description:
          "Given a lowercase string s, return the index of the first non-repeating character. If none exists, return -1.",
        examples: buildExample({
          input: `s="${s}"`,
          output: out,
          explanation:
            "Count frequencies, then scan for the first character with count 1.",
        }),
        hints: [
          "Count frequencies, then scan again for the first char with count 1.",
          ...commonHints,
        ],
        fnName: `first_unique_${index}`,
        tags: ["String", "Counting", difficulty],
      };
    }
    if (variant === 1) {
      const a = makeString(rng, intBetween(rng, 5, 10));
      const b = a
        .split("")
        .sort(() => rng() - 0.5)
        .join("");
      return {
        id,
        title: `Check Anagram (#${index})`,
        description:
          "Given two lowercase strings a and b, return true if b is an anagram of a, else false.",
        examples: `Example:\nInput: a="${a}", b="${b}"\nOutput: true`,
        hints: [
          "Use a 26-sized frequency array or a map.",
          "Early exit if lengths differ.",
          ...commonHints,
        ],
        fnName: `is_anagram_${index}`,
        tags: ["String", "Hashing", difficulty],
      };
    }
    if (variant === 2) {
      const s = `${makeString(rng, 4)} ${makeString(rng, 5)} ${makeString(
        rng,
        3
      )}`;
      const out = reverseWords(s);
      return {
        id,
        title: `Reverse Words in Sentence (#${index})`,
        description:
          "Given a sentence string s, reverse the order of words and return the resulting string (single spaces between words).",
        examples: buildExample({
          input: `s="${s}"`,
          output: out,
          explanation:
            "Split into words, reverse, then join with single spaces.",
        }),
        hints: [
          "Split by spaces, filter empty, reverse, and join.",
          ...commonHints,
        ],
        fnName: `reverse_words_${index}`,
        tags: ["String", "Parsing", difficulty],
      };
    }
    const s = makeString(rng, intBetween(rng, 8, 14));
    const out = longestUniqueSubstringLen(s);
    return {
      id,
      title: `Longest Substring Without Repeats (#${index})`,
      description:
        "Given a string s, return the length of the longest substring without repeating characters.",
      examples: buildExample({
        input: `s="${s}"`,
        output: out,
        explanation:
          "Maintain a sliding window with last-seen positions to avoid repeats.",
      }),
      hints: [
        "Use a sliding window with a map of last seen indices.",
        "Move the left pointer when you see a repeated character.",
        ...commonHints,
      ],
      fnName: `longest_unique_${index}`,
      tags: ["String", "Sliding Window", difficulty],
    };
  }

  if (categoryId === "hashing") {
    const variant = index % 3;
    const arr = makeIntArray(rng, n, 0, 15);
    if (variant === 0) {
      const out = mostFrequentElement(arr);
      return {
        id,
        title: `Top Frequency Element (#${index})`,
        description:
          "Given an integer array nums, return the element that appears most frequently. If multiple, return any one of them.",
        examples: buildExample({
          input: `nums=${JSON.stringify(arr)}`,
          output: out,
          explanation: "Count frequencies and keep track of the maximum.",
        }),
        hints: [
          "Use a frequency map.",
          "Track max frequency as you build counts.",
          ...commonHints,
        ],
        fnName: `most_frequent_${index}`,
        tags: ["Hashing", "Frequency", difficulty],
      };
    }
    if (variant === 1) {
      const k = intBetween(rng, 2, 5);
      const out = firstKDistinct(arr, k);
      return {
        id,
        title: `Find First ${k} Distinct (#${index})`,
        description: `Given an integer array nums, return an array containing the first ${k} distinct values in the order they appear. If fewer than ${k} distinct values exist, return all distinct values.`,
        examples: buildExample({
          input: `nums=${JSON.stringify(arr)}, k=${k}`,
          output: out,
          explanation: "Scan and collect distinct values using a set.",
        }),
        hints: [
          "Use a set to track seen values.",
          "Stop once you collected k items.",
          ...commonHints,
        ],
        fnName: `first_k_distinct_${k}_${index}`,
        tags: ["Hashing", "Set", difficulty],
      };
    }
    // Pick a guaranteed solvable target based on a real pair.
    const i = intBetween(rng, 0, Math.max(0, arr.length - 2));
    const j = intBetween(rng, i + 1, Math.max(i + 1, arr.length - 1));
    const target = (arr[i] || 0) + (arr[j] || 0);
    const out = twoSumFirst(arr, target);
    return {
      id,
      title: `Two Sum Variant = ${target} (#${index})`,
      description:
        "Given an integer array nums and a target, return indices of two numbers such that they add up to target. You may assume exactly one solution.",
      examples: buildExample({
        input: `nums=${JSON.stringify(arr)}, target=${target}`,
        output: out,
        explanation:
          "Store seen values in a hash map to find complements in O(n).",
      }),
      hints: [
        "Hash map from value to index.",
        "Check complement before inserting current.",
        ...commonHints,
      ],
      fnName: `two_sum_${target}_${index}`,
      tags: ["Hashing", "Array", difficulty],
    };
  }

  if (categoryId === "two-pointers") {
    const variant = index % 3;
    const arr = makeIntArray(rng, n, 0, 9);
    if (variant === 0) {
      const sorted = [...arr].sort((a, b) => a - b);
      const out = dedupeSortedLength([...sorted]);
      return {
        id,
        title: `Remove Duplicates In-Place (#${index})`,
        description:
          "Given a sorted integer array nums, remove duplicates in-place such that each element appears once. Return the new length.",
        examples: buildExample({
          input: `nums=${JSON.stringify(sorted)}`,
          output: out,
          explanation:
            "Use two pointers (read/write) to compact unique values.",
        }),
        hints: [
          "Use two pointers: write index and read index.",
          ...commonHints,
        ],
        fnName: `dedupe_sorted_${index}`,
        tags: ["Two Pointers", "Array", difficulty],
      };
    }
    if (variant === 1) {
      const arr2 = makeIntArray(rng, n, 1, 12);
      const out = maxContainerArea(arr2);
      return {
        id,
        title: `Container With Most Water (#${index})`,
        description:
          "Given an array heights where heights[i] represents a vertical line, find the maximum area of water a container can store.",
        examples: buildExample({
          input: `heights=${JSON.stringify(arr2)}`,
          output: out,
          explanation:
            "Two pointers from both ends; move the shorter height inward.",
        }),
        hints: [
          "Start with both ends and move the shorter side inward.",
          ...commonHints,
        ],
        fnName: `max_area_${index}`,
        tags: ["Two Pointers", "Greedy", difficulty],
      };
    }
    const out = moveZerosToEnd(arr);
    return {
      id,
      title: `Move Zeros To End (#${index})`,
      description:
        "Given an integer array nums, move all 0s to the end while maintaining the relative order of the non-zero elements.",
      examples: buildExample({
        input: `nums=${JSON.stringify(arr)}`,
        output: out,
        explanation: "Write non-zeros forward, then fill the rest with zeros.",
      }),
      hints: [
        "Use a write pointer for next non-zero position.",
        ...commonHints,
      ],
      fnName: `move_zeros_${index}`,
      tags: ["Two Pointers", "Array", difficulty],
    };
  }

  if (categoryId === "stack-queue") {
    const variant = index % 3;
    if (variant === 0) {
      const s =
        pick(rng, ["()[]{}", "([{}])", "(]", "((()))", "{[()]}[]"]) || "()";
      const out = isValidParentheses(s);
      return {
        id,
        title: `Valid Parentheses (#${index})`,
        description:
          "Given a string containing only parentheses characters '()[]{}', determine if the input string is valid.",
        examples: buildExample({
          input: `s="${s}"`,
          output: out,
          explanation:
            "Use a stack; every closing bracket must match the most recent opening.",
        }),
        hints: [
          "Use a stack and match closing brackets with the last opening bracket.",
          ...commonHints,
        ],
        fnName: `is_valid_parens_${index}`,
        tags: ["Stack", "String", difficulty],
      };
    }
    if (variant === 1) {
      const arr = makeIntArray(rng, n, 0, 20);
      const out = nextGreaterElements(arr);
      return {
        id,
        title: `Next Greater Element (#${index})`,
        description:
          "Given an array nums, for each element find the next greater element to its right. If none exists, output -1 for that element.",
        examples: buildExample({
          input: `nums=${JSON.stringify(arr)}`,
          output: out,
          explanation: "Maintain a monotonic decreasing stack of indices.",
        }),
        hints: ["Monotonic decreasing stack of indices.", ...commonHints],
        fnName: `next_greater_${index}`,
        tags: ["Stack", "Array", difficulty],
      };
    }
    const arr = makeIntArray(rng, n, 0, 20);
    const k = intBetween(rng, 2, Math.min(6, n));
    const out = slidingWindowMaximum(arr, k);
    return {
      id,
      title: `Sliding Window Maximum (k=${k}) (#${index})`,
      description:
        "Given an array nums and an integer k, return an array of the maximum value in each sliding window of size k.",
      examples: buildExample({
        input: `nums=${JSON.stringify(arr)}, k=${k}`,
        output: out,
        explanation: "Use a deque to keep indices in decreasing value order.",
      }),
      hints: [
        "Use a deque to keep indices of useful elements in decreasing order.",
        ...commonHints,
      ],
      fnName: `sliding_max_${k}_${index}`,
      tags: ["Queue", "Deque", "Sliding Window", difficulty],
    };
  }

  if (categoryId === "binary-search") {
    const variant = index % 4;
    const sorted = makeIntArray(rng, n, 0, 30).sort((a, b) => a - b);
    if (variant === 0) {
      const target = pick(rng, sorted) ?? sorted[0] ?? 0;
      const out = searchInsertPosition(sorted, target);
      return {
        id,
        title: `Search Insert Position = ${target} (#${index})`,
        description:
          "Given a sorted array nums and a target value, return the index if the target is found. If not, return the index where it would be inserted in order.",
        examples: buildExample({
          input: `nums=${JSON.stringify(sorted)}, target=${target}`,
          output: out,
          explanation:
            "Binary search for the leftmost position where nums[mid] >= target.",
        }),
        hints: [
          "Classic binary search boundary problem.",
          "Maintain low/high; move high when mid >= target.",
          ...commonHints,
        ],
        fnName: `search_insert_${target}_${index}`,
        tags: ["Binary Search", "Array", difficulty],
      };
    }
    if (variant === 1) {
      // Add duplicates deterministically
      const dupVal = pick(rng, sorted) ?? 1;
      const nums = [...sorted, dupVal, dupVal].sort((a, b) => a - b);
      const out = firstLastPosition(nums, dupVal);
      return {
        id,
        title: `First & Last Position of ${dupVal} (#${index})`,
        description:
          "Given a sorted array nums with possible duplicates and a target, return the first and last index of target. If not found, return [-1, -1].",
        examples: buildExample({
          input: `nums=${JSON.stringify(nums)}, target=${dupVal}`,
          output: out,
          explanation:
            "Two boundary binary searches: one for first, one for last.",
        }),
        hints: [
          "Run binary search twice: one for left boundary and one for right boundary.",
          "When nums[mid] == target, keep searching left/right depending on boundary.",
          ...commonHints,
        ],
        fnName: `first_last_${dupVal}_${index}`,
        tags: ["Binary Search", "Boundaries", difficulty],
      };
    }
    if (variant === 2) {
      // Rotated sorted array
      const pivot = intBetween(rng, 0, Math.max(0, sorted.length - 1));
      const rotated = [...sorted.slice(pivot), ...sorted.slice(0, pivot)];
      const out = minInRotated(rotated);
      return {
        id,
        title: `Find Min in Rotated Sorted Array (#${index})`,
        description:
          "Given a rotated sorted array with distinct integers, find the minimum element in O(log n).",
        examples: buildExample({
          input: `nums=${JSON.stringify(rotated)}`,
          output: out,
          explanation:
            "Binary search by comparing mid with high to locate the pivot/min.",
        }),
        hints: [
          "Compare mid with high to decide which half contains the min.",
          "If nums[mid] <= nums[high], the min is in the left half (including mid).",
          ...commonHints,
        ],
        fnName: `min_rotated_${index}`,
        tags: ["Binary Search", "Array", difficulty],
      };
    }
    // variant 3
    const target = pick(rng, sorted) ?? sorted[0] ?? 0;
    const out = binarySearchIndex(sorted, target);
    return {
      id,
      title: `Binary Search - Find ${target} (#${index})`,
      description:
        "Given a sorted integer array nums and a target, return the index of target. If not found, return -1.",
      examples: buildExample({
        input: `nums=${JSON.stringify(sorted)}, target=${target}`,
        output: out,
        explanation: "Standard O(log n) binary search.",
      }),
      hints: ["Standard binary search with low/high pointers.", ...commonHints],
      fnName: `binary_search_${target}_${index}`,
      tags: ["Binary Search", "Array", difficulty],
    };
  }

  if (categoryId === "linked-list") {
    const variant = index % 4;
    const values = makeIntArray(rng, intBetween(rng, 4, 9), 1, 9);
    const listStr = `${values.join("->")}->null`;
    if (variant === 0) {
      const out = formatLinkedList([...values].reverse());
      return {
        id,
        title: `Reverse a Linked List (#${index})`,
        description:
          "Given the head of a singly linked list, reverse the list and return the new head.",
        examples: buildExample({
          input: `head=${listStr}`,
          output: out,
          explanation: "Reverse pointers iteratively (prev/curr/next).",
        }),
        hints: [
          "Iterative: keep prev, curr, next pointers.",
          "Update curr.next to prev while advancing.",
          ...commonHints,
        ],
        fnName: `reverse_list_${index}`,
        tags: ["Linked List", "Pointers", difficulty],
      };
    }
    if (variant === 1) {
      const nFromEnd = intBetween(rng, 1, Math.min(4, values.length));
      const copy = [...values];
      const idxToRemove = copy.length - nFromEnd;
      if (idxToRemove >= 0 && idxToRemove < copy.length)
        copy.splice(idxToRemove, 1);
      const out = formatLinkedList(copy);
      return {
        id,
        title: `Remove ${nFromEnd}th Node From End (#${index})`,
        description:
          "Given the head of a linked list, remove the n-th node from the end and return the head.",
        examples: buildExample({
          input: `head=${listStr}, n=${nFromEnd}`,
          output: out,
          explanation:
            "Use a fast pointer n steps ahead, then move both until fast ends.",
        }),
        hints: [
          "Two pointers: advance fast by n steps, then move both until fast reaches end.",
          "Use a dummy head to simplify edge cases.",
          ...commonHints,
        ],
        fnName: `remove_nth_${nFromEnd}_${index}`,
        tags: ["Linked List", "Two Pointers", difficulty],
      };
    }
    if (variant === 2) {
      const a = makeIntArray(rng, intBetween(rng, 3, 6), 1, 20).sort(
        (x, y) => x - y
      );
      const b = makeIntArray(rng, intBetween(rng, 3, 6), 1, 20).sort(
        (x, y) => x - y
      );
      const merged = [];
      let i = 0;
      let j = 0;
      while (i < a.length && j < b.length) {
        if (a[i] <= b[j]) merged.push(a[i++]);
        else merged.push(b[j++]);
      }
      while (i < a.length) merged.push(a[i++]);
      while (j < b.length) merged.push(b[j++]);
      const out = formatLinkedList(merged);
      return {
        id,
        title: `Merge Two Sorted Lists (#${index})`,
        description:
          "Given the heads of two sorted linked lists, merge them into one sorted list and return the head.",
        examples: buildExample({
          input: `l1=${formatLinkedList(a)}, l2=${formatLinkedList(b)}`,
          output: out,
          explanation:
            "Merge like merge step of merge-sort using a dummy head.",
        }),
        hints: [
          "Use a dummy head and a tail pointer.",
          "At each step, append the smaller node.",
          ...commonHints,
        ],
        fnName: `merge_sorted_lists_${index}`,
        tags: ["Linked List", "Merge", difficulty],
      };
    }
    // variant 3
    const pos = intBetween(rng, -1, Math.min(values.length - 1, 3));
    const out = pos !== -1;
    return {
      id,
      title: `Detect Cycle in Linked List (#${index})`,
      description:
        "Given the head of a linked list, determine if the list has a cycle. A cycle exists if some node's next points to a previous node.",
      examples: buildExample({
        input: `head=${listStr}, pos=${pos}`,
        output: out,
        explanation:
          "Use Floyd's tortoise-hare pointers; if they meet, a cycle exists.",
      }),
      hints: [
        "Floyd's cycle detection: slow moves 1 step, fast moves 2 steps.",
        "If they meet, there is a cycle.",
        ...commonHints,
      ],
      fnName: `has_cycle_${index}`,
      tags: ["Linked List", "Two Pointers", difficulty],
    };
  }

  if (categoryId === "trees") {
    const variant = index % 4;
    // Simple level-order representation with nulls.
    const tree = [
      intBetween(rng, 1, 9),
      intBetween(rng, 1, 9),
      intBetween(rng, 1, 9),
      pick(rng, [null, intBetween(rng, 1, 9)]),
      pick(rng, [null, intBetween(rng, 1, 9)]),
      pick(rng, [null, intBetween(rng, 1, 9)]),
      pick(rng, [null, intBetween(rng, 1, 9)]),
    ];
    const treeStr = JSON.stringify(tree);
    if (variant === 0) {
      const root = buildTreeFromLevelOrder(tree);
      const out = treeMaxDepth(root);
      return {
        id,
        title: `Max Depth of Binary Tree (#${index})`,
        description:
          "Given the root of a binary tree, return its maximum depth (number of nodes along the longest path from root to leaf).",
        examples: buildExample({
          input: `root=${treeStr}`,
          output: out,
          explanation: "Depth is 1 + max(depth(left), depth(right)).",
        }),
        hints: [
          "Recursion: depth = 1 + max(leftDepth, rightDepth).",
          "Or BFS level-order counting levels.",
          ...commonHints,
        ],
        fnName: `max_depth_${index}`,
        tags: ["Tree", "DFS", "BFS", difficulty],
      };
    }
    if (variant === 1) {
      const root = buildTreeFromLevelOrder(tree);
      const out = serializeTreeLevelOrder(invertTree(root));
      return {
        id,
        title: `Invert Binary Tree (#${index})`,
        description:
          "Given the root of a binary tree, invert the tree (swap left and right children for all nodes) and return the root.",
        examples: buildExample({
          input: `root=${treeStr}`,
          output: out,
          explanation: "Swap left and right children at every node.",
        }),
        hints: [
          "Swap left/right at each node recursively.",
          "You can also do this iteratively with a queue.",
          ...commonHints,
        ],
        fnName: `invert_tree_${index}`,
        tags: ["Tree", "DFS", difficulty],
      };
    }
    if (variant === 2) {
      const root = buildTreeFromLevelOrder(tree);
      const out = levelOrderTraversal(root);
      return {
        id,
        title: `Binary Tree Level Order Traversal (#${index})`,
        description:
          "Given the root of a binary tree, return its level order traversal (values level by level).",
        examples: buildExample({
          input: `root=${treeStr}`,
          output: out,
          explanation: "BFS level-by-level using a queue.",
        }),
        hints: [
          "Use a queue; process nodes level by level.",
          "Track the current level size to group values.",
          ...commonHints,
        ],
        fnName: `level_order_${index}`,
        tags: ["Tree", "BFS", difficulty],
      };
    }
    // variant 3
    const root = buildTreeFromLevelOrder(tree);
    const out = isValidBST(root);
    return {
      id,
      title: `Validate Binary Search Tree (#${index})`,
      description:
        "Given the root of a binary tree, determine if it is a valid binary search tree (BST).",
      examples: buildExample({
        input: `root=${treeStr}`,
        output: out,
        explanation: "DFS with allowed (min,max) ranges for each node.",
      }),
      hints: [
        "DFS with valid range (min, max) for each node.",
        "Inorder traversal of BST should be strictly increasing.",
        ...commonHints,
      ],
      fnName: `is_valid_bst_${index}`,
      tags: ["Tree", "BST", "DFS", difficulty],
    };
  }

  if (categoryId === "graphs") {
    const variant = index % 4;
    const nodes = intBetween(rng, 4, 7);
    const edgesCount = intBetween(rng, nodes - 1, nodes + 2);
    const edges = [];
    for (let i = 0; i < edgesCount; i++) {
      const u = intBetween(rng, 0, nodes - 1);
      let v = intBetween(rng, 0, nodes - 1);
      if (v === u) v = (v + 1) % nodes;
      edges.push([u, v]);
    }
    const edgesStr = JSON.stringify(edges);
    if (variant === 0) {
      const out = countComponents(nodes, edges);
      return {
        id,
        title: `Count Connected Components (#${index})`,
        description:
          "Given n nodes labeled 0..n-1 and a list of undirected edges, return the number of connected components.",
        examples: buildExample({
          input: `n=${nodes}, edges=${edgesStr}`,
          output: out,
          explanation:
            "Run BFS/DFS from each unvisited node to count components.",
        }),
        hints: [
          "Build adjacency list then run DFS/BFS from each unvisited node.",
          "Union-Find is another good option.",
          ...commonHints,
        ],
        fnName: `count_components_${index}`,
        tags: ["Graph", "DFS", "BFS", "Union Find", difficulty],
      };
    }
    if (variant === 1) {
      const start = 0;
      const end = nodes - 1;
      const out = shortestPathUnweighted(nodes, edges, start, end);
      return {
        id,
        title: `Shortest Path (Unweighted) ${start} → ${end} (#${index})`,
        description:
          "Given an unweighted graph, return the length of the shortest path between start and end. If unreachable, return -1.",
        examples: buildExample({
          input: `n=${nodes}, edges=${edgesStr}, start=${start}, end=${end}`,
          output: out,
          explanation:
            "BFS explores layers; first time reaching end gives shortest path length.",
        }),
        hints: [
          "Use BFS from start; the first time you reach end is shortest.",
          "Track visited and distance.",
          ...commonHints,
        ],
        fnName: `shortest_path_${index}`,
        tags: ["Graph", "BFS", difficulty],
      };
    }
    if (variant === 2) {
      const out = hasCycleUndirected(nodes, edges);
      return {
        id,
        title: `Detect Cycle in Undirected Graph (#${index})`,
        description:
          "Given n nodes and undirected edges, determine if the graph contains a cycle.",
        examples: buildExample({
          input: `n=${nodes}, edges=${edgesStr}`,
          output: out,
          explanation:
            "Union-Find detects a cycle if an edge connects two nodes already in the same set.",
        }),
        hints: [
          "DFS with parent tracking, or Union-Find to detect a cycle.",
          "In DFS, a visited neighbor that's not the parent indicates a cycle.",
          ...commonHints,
        ],
        fnName: `has_cycle_graph_${index}`,
        tags: ["Graph", "DFS", "Union Find", difficulty],
      };
    }
    // variant 3: topological ordering
    const dagNodes = intBetween(rng, 4, 7);
    const dagEdges = [];
    for (let i = 0; i < dagNodes + 1; i++) {
      const u = intBetween(rng, 0, dagNodes - 2);
      const v = intBetween(rng, u + 1, dagNodes - 1);
      dagEdges.push([u, v]);
    }
    const out = topoSortKahn(dagNodes, dagEdges);
    return {
      id,
      title: `Topological Sort (#${index})`,
      description:
        "Given a directed acyclic graph (DAG) with n nodes and edges, return any valid topological ordering of nodes.",
      examples: buildExample({
        input: `n=${dagNodes}, edges=${JSON.stringify(dagEdges)}`,
        output: out,
        explanation:
          "Kahn's algorithm uses indegrees and a queue to build an ordering.",
      }),
      hints: [
        "Kahn's algorithm: indegree + queue.",
        "Or DFS postorder then reverse.",
        ...commonHints,
      ],
      fnName: `toposort_${index}`,
      tags: ["Graph", "Topological Sort", difficulty],
    };
  }

  if (categoryId === "dynamic-programming") {
    const variant = index % 4;
    if (variant === 0) {
      const coins = Array.from(
        new Set(makeIntArray(rng, intBetween(rng, 3, 5), 1, 9))
      ).sort((a, b) => a - b);
      const amount = intBetween(rng, 8, 30);
      const out = coinChangeMinCoins(coins, amount);
      return {
        id,
        title: `Coin Change (amount=${amount}) (#${index})`,
        description:
          "Given coin denominations and a total amount, return the minimum number of coins needed to make up that amount. If impossible, return -1.",
        examples: buildExample({
          input: `coins=${JSON.stringify(coins)}, amount=${amount}`,
          output: out,
          explanation:
            "Unbounded DP over amount: dp[x] = min(dp[x], dp[x-coin]+1).",
        }),
        hints: [
          "DP: dp[x] = min(dp[x], dp[x-coin] + 1).",
          "Initialize dp[0]=0 and others to Infinity.",
          ...commonHints,
        ],
        fnName: `coin_change_${amount}_${index}`,
        tags: ["DP", "Unbounded Knapsack", difficulty],
      };
    }
    if (variant === 1) {
      const nums = makeIntArray(rng, n, 1, 20);
      const out = lisLength(nums);
      return {
        id,
        title: `Longest Increasing Subsequence (#${index})`,
        description:
          "Given an integer array nums, return the length of the longest strictly increasing subsequence.",
        examples: buildExample({
          input: `nums=${JSON.stringify(nums)}`,
          output: out,
          explanation:
            "Use tails[] with binary search (patience sorting) for O(n log n).",
        }),
        hints: [
          "O(n^2) DP: dp[i] = 1 + max(dp[j]) for j<i and nums[j]<nums[i].",
          "Optional: O(n log n) with patience sorting tails array.",
          ...commonHints,
        ],
        fnName: `lis_${index}`,
        tags: ["DP", "Array", difficulty],
      };
    }
    if (variant === 2) {
      const houses = makeIntArray(rng, n, 1, 25);
      const out = houseRobberMax(houses);
      return {
        id,
        title: `House Robber (#${index})`,
        description:
          "Given an array where each element represents money in a house, you cannot rob adjacent houses. Return the maximum amount you can rob.",
        examples: buildExample({
          input: `nums=${JSON.stringify(houses)}`,
          output: out,
          explanation:
            "DP: at each house, choose max of robbing it or skipping it.",
        }),
        hints: [
          "DP with two states: take vs skip.",
          "Transition: newTake = skip + val; newSkip = max(skip, take).",
          ...commonHints,
        ],
        fnName: `house_robber_${index}`,
        tags: ["DP", "Greedy", difficulty],
      };
    }
    // variant 3
    const weights = makeIntArray(rng, intBetween(rng, 4, 7), 1, 9);
    const values = makeIntArray(rng, weights.length, 1, 20);
    const cap = intBetween(rng, 8, 20);
    const out = knapsack01Max(weights, values, cap);
    return {
      id,
      title: `0/1 Knapsack (cap=${cap}) (#${index})`,
      description:
        "Given weights and values of items and a capacity, return the maximum value you can carry (each item at most once).",
      examples: buildExample({
        input: `weights=${JSON.stringify(weights)}, values=${JSON.stringify(
          values
        )}, capacity=${cap}`,
        output: out,
        explanation:
          "0/1 knapsack DP with 1D array iterating capacity downward.",
      }),
      hints: [
        "Classic DP: dp[i][w] or 1D dp[w] iterating w descending.",
        "If using 1D, iterate capacity downwards to avoid reusing items.",
        ...commonHints,
      ],
      fnName: `knapsack_${cap}_${index}`,
      tags: ["DP", "Knapsack", difficulty],
    };
  }

  if (categoryId === "greedy") {
    const variant = index % 4;
    if (variant === 0) {
      const intervals = [];
      const m = intBetween(rng, 4, 7);
      let start = 0;
      for (let i = 0; i < m; i++) {
        start += intBetween(rng, 0, 3);
        const end = start + intBetween(rng, 1, 5);
        intervals.push([start, end]);
      }
      const out = maxNonOverlappingIntervals(intervals);
      return {
        id,
        title: `Select Max Non-Overlapping Intervals (#${index})`,
        description:
          "Given intervals [start, end], select the maximum number of non-overlapping intervals.",
        examples: buildExample({
          input: `intervals=${JSON.stringify(intervals)}`,
          output: out,
          explanation:
            "Sort by end time and greedily pick the earliest finishing intervals.",
        }),
        hints: [
          "Sort intervals by end time.",
          "Pick the interval with earliest finishing time, then continue.",
          ...commonHints,
        ],
        fnName: `max_nonoverlap_${index}`,
        tags: ["Greedy", "Sorting", difficulty],
      };
    }
    if (variant === 1) {
      const nums = makeIntArray(rng, n, 0, 8);
      const out = canJump(nums);
      return {
        id,
        title: `Jump Game (#${index})`,
        description:
          "Given an array nums where nums[i] is your maximum jump length at position i, return true if you can reach the last index.",
        examples: buildExample({
          input: `nums=${JSON.stringify(nums)}`,
          output: out,
          explanation:
            "Track farthest reachable index; if you get stuck before the end, return false.",
        }),
        hints: [
          "Greedy: track the farthest reachable index so far.",
          "If current index is beyond farthest, you are stuck.",
          ...commonHints,
        ],
        fnName: `can_jump_${index}`,
        tags: ["Greedy", "Array", difficulty],
      };
    }
    if (variant === 2) {
      const nums = makeIntArray(rng, n, 1, 20);
      const kOps = intBetween(rng, 2, 6);
      const out = minimizeSumAfterKHalves(nums, kOps);
      return {
        id,
        title: `Minimize Sum After K Operations (#${index})`,
        description:
          "Given an array nums and an integer k, repeat k times: pick the current largest element x and replace it with floor(x/2). Return the final sum.",
        examples: buildExample({
          input: `nums=${JSON.stringify(nums)}, k=${kOps}`,
          output: out,
          explanation:
            "Greedy: always reduce the current maximum (max-heap is typical).",
        }),
        hints: [
          "Problems like this often use a max-heap to always reduce the current largest.",
          "Greedy choice should be locally optimal and repeatable.",
          ...commonHints,
        ],
        fnName: `min_sum_k_ops_${index}`,
        tags: ["Greedy", "Heap", difficulty],
      };
    }
    // variant 3
    const prices = makeIntArray(rng, n, 1, 30);
    const out = maxProfitOnce(prices);
    return {
      id,
      title: `Best Time to Buy/Sell Stock (#${index})`,
      description:
        "Given an array prices where prices[i] is the price on day i, return the maximum profit you can achieve by buying once and selling once later.",
      examples: buildExample({
        input: `prices=${JSON.stringify(prices)}`,
        output: out,
        explanation:
          "Track minimum price so far and maximize price - minPrice.",
      }),
      hints: [
        "Track the minimum price so far and update best profit.",
        "One pass is enough.",
        ...commonHints,
      ],
      fnName: `max_profit_${index}`,
      tags: ["Greedy", "Array", difficulty],
    };
  }

  if (categoryId === "math") {
    const variant = index % 4;
    if (variant === 0) {
      const a = intBetween(rng, 20, 200);
      const b = intBetween(rng, 20, 200);
      const out = gcd(a, b);
      return {
        id,
        title: `GCD of Two Numbers (#${index})`,
        description:
          "Given two integers a and b, compute gcd(a, b) using an efficient method.",
        examples: buildExample({
          input: `a=${a}, b=${b}`,
          output: out,
          explanation: "Euclidean algorithm reduces gcd(a,b) to gcd(b,a%b).",
        }),
        hints: [
          "Euclidean algorithm: gcd(a, b) = gcd(b, a % b).",
          "Stop when b becomes 0.",
          ...commonHints,
        ],
        fnName: `gcd_${index}`,
        tags: ["Math", "Euclid", difficulty],
      };
    }
    if (variant === 1) {
      const x = intBetween(rng, 2, 500);
      const out = isPrime(x);
      return {
        id,
        title: `Check Prime (#${index})`,
        description:
          "Given an integer n, return true if it is prime, else false.",
        examples: buildExample({
          input: `n=${x}`,
          output: out,
          explanation: "Check divisors up to sqrt(n).",
        }),
        hints: [
          "Check divisibility up to sqrt(n).",
          "Handle n < 2 as not prime.",
          ...commonHints,
        ],
        fnName: `is_prime_${x}_${index}`,
        tags: ["Math", "Primes", difficulty],
      };
    }
    if (variant === 2) {
      const base = intBetween(rng, 2, 12);
      const exp = intBetween(rng, 3, 20);
      const mod = pick(rng, [97, 101, 1_000_000_007]) ?? 97;
      const out = powMod(base, exp, mod);
      return {
        id,
        title: `Fast Power (${base}^${exp} mod ${mod}) (#${index})`,
        description: "Compute (base^exp) % mod efficiently.",
        examples: buildExample({
          input: `base=${base}, exp=${exp}, mod=${mod}`,
          output: out,
          explanation:
            "Binary exponentiation multiplies only when a bit of exp is set.",
        }),
        hints: [
          "Use binary exponentiation (exponentiation by squaring).",
          "Multiply into result when the current bit of exp is 1.",
          ...commonHints,
        ],
        fnName: `powmod_${index}`,
        tags: ["Math", "Binary Exponentiation", difficulty],
      };
    }
    // variant 3
    const nums = makeIntArray(rng, intBetween(rng, 5, 10), -20, 20);
    const out = sumAbsDiffs(nums);
    return {
      id,
      title: `Sum of Absolute Differences (#${index})`,
      description:
        "Given an integer array nums, compute the sum of absolute differences between consecutive elements.",
      examples: buildExample({
        input: `nums=${JSON.stringify(nums)}`,
        output: out,
        explanation: "Sum Math.abs(nums[i] - nums[i-1]) for i=1..n-1.",
      }),
      hints: [
        "Iterate once: add Math.abs(nums[i] - nums[i-1]).",
        ...commonHints,
      ],
      fnName: `sum_abs_diff_${index}`,
      tags: ["Math", "Array", difficulty],
    };
  }

  // For the remaining categories, provide deterministic unique text + hints.
  const title = `${getCategoryLabel(categoryId)} Challenge (#${index})`;
  const fnName = `solve_${categoryId.replace(
    /[^a-z0-9]+/g,
    "_"
  )}_${difficulty.toLowerCase()}_${index}`;
  const exampleSeed = intBetween(rng, 10, 99);
  return {
    id,
    title,
    description: `Solve a ${difficulty.toLowerCase()} ${getCategoryLabel(
      categoryId
    ).toLowerCase()} problem. Use an efficient approach and handle edge cases.`,
    examples: buildExample({
      input: `seed=${exampleSeed}`,
      output: exampleSeed,
      explanation:
        "This is a preview example. The exact input/output format depends on the specific prompt.",
    }),
    hints: [
      `Use patterns commonly used in ${getCategoryLabel(
        categoryId
      )} (e.g., recursion, BFS/DFS, greedy, DP).`,
      ...commonHints,
    ],
    fnName,
    tags: [getCategoryLabel(categoryId), difficulty],
  };
};

const buildProblemBank = (seedProblems) => {
  const perCategory = {
    Easy: 40,
    Medium: 30,
    Hard: 15,
  };

  const generated = [];
  for (const category of PROGRAM_CATEGORIES) {
    for (const difficulty of DIFFICULTIES) {
      const count = perCategory[difficulty] || 0;
      for (let i = 1; i <= count; i++) {
        const spec = generateProblemSpec({
          categoryId: category.id,
          difficulty,
          index: i,
        });
        generated.push({
          id: spec.id,
          title: spec.title,
          difficulty,
          categoryId: category.id,
          description: spec.description,
          examples: spec.examples,
          hints: spec.hints,
          starterCode: makeGenericStarterCode(spec.fnName),
          tags: spec.tags,
        });
      }
    }
  }

  const normalizedSeed = (seedProblems || []).map((p) => ({
    ...p,
    categoryId: p.categoryId || inferCategoryIdFromTags(p.tags),
  }));

  const byId = new Map();
  for (const p of [...normalizedSeed, ...generated]) {
    if (!byId.has(p.id)) byId.set(p.id, p);
  }

  return Array.from(byId.values());
};

const CodingArena = () => {
  const { t } = useI18n();
  const user = getUser();
  const codingSubmissionsKey =
    user?.id || user?._id || user?.email
      ? `codingSubmissions:${user.id || user._id || user.email}`
      : "codingSubmissions:anonymous";

  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("python");
  const [problemId, setProblemId] = useState("add-two-numbers");
  const [loading, setLoading] = useState(false);
  const [evaluation, setEvaluation] = useState(null);
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [copied, setCopied] = useState(false);
  const [submissions, setSubmissions] = useState([]);
  const [activeTab, setActiveTab] = useState("problem");
  const [submissionContextIndex, setSubmissionContextIndex] = useState(null);
  const submissionLongPressTimerRef = useRef(null);

  // Programs browser (1000+ problems)
  const [programsOpen, setProgramsOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState("all");
  const [programSearch, setProgramSearch] = useState("");
  const [programDifficulty, setProgramDifficulty] = useState("all");

  // AI Chatbot states
  const [aiStatus, setAiStatus] = useState("online"); // online, thinking, analyzing, responding, error
  const [displayedEvaluation, setDisplayedEvaluation] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [aiMessages, setAiMessages] = useState([]);
  const [userQuestion, setUserQuestion] = useState("");
  const [showAiChat, setShowAiChat] = useState(false);
  const [streak, setStreak] = useState(0);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const refreshSubmissionHistoryFromServer = useCallback(async () => {
    try {
      const res = await axiosInstance.get("/code/submissions", {
        params: { limit: 10 },
      });
      const rows = Array.isArray(res?.data) ? res.data : [];
      const mapped = rows.map((s) => ({
        id: s.id,
        problemId: s.problem_id,
        problemTitle: s.problem_id,
        language: s.language,
        score: s.score,
        passed: !!s.passed,
        time: s.solve_time_seconds,
        timestamp: s.created_at,
      }));
      setSubmissions(mapped);
    } catch (e) {
      // Fallback to local cache if server isn't reachable.
      try {
        const savedSubmissions = localStorage.getItem(codingSubmissionsKey);
        if (savedSubmissions) {
          setSubmissions(JSON.parse(savedSubmissions));
          return;
        }
      } catch {
        // ignore
      }
    }
  }, [codingSubmissionsKey]);

  const refreshCodingStreakFromServer = useCallback(async () => {
    try {
      const res = await axiosInstance.get("/dashboard/stats");
      const serverStreak = res?.data?.coding_display_current_streak;
      setStreak(typeof serverStreak === "number" ? serverStreak : 0);
    } catch (e) {
      // Keep UI usable even if stats cannot be fetched.
    }
  }, []);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [aiMessages, displayedEvaluation]);

  useEffect(() => {
    refreshCodingStreakFromServer();
  }, [refreshCodingStreakFromServer]);

  useEffect(() => {
    refreshSubmissionHistoryFromServer();
  }, [refreshSubmissionHistoryFromServer]);

  // Typing simulation effect for evaluation
  useEffect(() => {
    if (evaluation?.evaluation && !isTyping) {
      setIsTyping(true);
      setDisplayedEvaluation("");
      let index = 0;
      const text = evaluation.evaluation;

      const typeChar = () => {
        if (index < text.length) {
          setDisplayedEvaluation(text.substring(0, index + 1));
          index++;
          typingTimeoutRef.current = setTimeout(typeChar, 10);
        } else {
          setIsTyping(false);
          setAiStatus("online");
        }
      };

      typeChar();
    }

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [evaluation]);

  const seedProblems = [
    {
      id: "add-two-numbers",
      title: "Add Two Numbers",
      difficulty: "Easy",
      description:
        "Write a function that takes two numbers as input and returns their sum. This is a fundamental programming concept that demonstrates basic arithmetic operations.",
      examples: "Input: a=5, b=3\nOutput: 8\n\nInput: a=10, b=20\nOutput: 30",
      starterCode: {
        python:
          'def add_two_numbers(a, b):\n    # Write your code here\n    # Add the two numbers and return the result\n    pass\n\n# Test your function\nresult = add_two_numbers(5, 3)\nprint(f"5 + 3 = {result}")\n\n# Test with different values\nresult2 = add_two_numbers(10, 20)\nprint(f"10 + 20 = {result2}")',
        javascript:
          "function addTwoNumbers(a, b) {\n    // Write your code here\n    // Add the two numbers and return the result\n}\n\n// Test your function\nlet result = addTwoNumbers(5, 3);\nconsole.log(`5 + 3 = ${result}`);\n\n// Test with different values\nlet result2 = addTwoNumbers(10, 20);\nconsole.log(`10 + 20 = ${result2}`);",
        java: 'public class Solution {\n    public static int addTwoNumbers(int a, int b) {\n        // Write your code here\n        // Add the two numbers and return the result\n        return 0;\n    }\n    \n    public static void main(String[] args) {\n        // Test your function\n        int result = addTwoNumbers(5, 3);\n        System.out.println("5 + 3 = " + result);\n        \n        // Test with different values\n        int result2 = addTwoNumbers(10, 20);\n        System.out.println("10 + 20 = " + result2);\n    }\n}',
      },
      tags: ["Math", "Arithmetic", "Beginner"],
    },
    {
      id: "fibonacci",
      title: "Fibonacci Series",
      difficulty: "Easy",
      description:
        "Write a function to return the nth Fibonacci number. The Fibonacci sequence is 0, 1, 1, 2, 3, 5, 8, 13...",
      examples: "Input: n=5\nOutput: 5\n\nInput: n=10\nOutput: 55",
      starterCode: {
        python:
          "def fibonacci(n):\n    # Write your code here\n    pass\n\n# Test your function\nprint(fibonacci(10))",
        javascript:
          "function fibonacci(n) {\n    // Write your code here\n}\n\n// Test your function\nconsole.log(fibonacci(10));",
        java: "public class Solution {\n    public static int fibonacci(int n) {\n        // Write your code here\n        return 0;\n    }\n    \n    public static void main(String[] args) {\n        System.out.println(fibonacci(10));\n    }\n}",
      },
      tags: ["Recursion", "Dynamic Programming"],
    },
    {
      id: "reverse-string",
      title: "Reverse String",
      difficulty: "Easy",
      description:
        "Write a function that reverses a string. The input string is given as an array of characters.",
      examples:
        "Input: 'hello'\nOutput: 'olleh'\n\nInput: 'world'\nOutput: 'dlrow'",
      starterCode: {
        python:
          "def reverse_string(s):\n    # Write your code here\n    pass\n\n# Test your function\nprint(reverse_string('hello'))",
        javascript:
          "function reverseString(s) {\n    // Write your code here\n}\n\n// Test your function\nconsole.log(reverseString('hello'));",
        java: 'public class Solution {\n    public static String reverseString(String s) {\n        // Write your code here\n        return "";\n    }\n    \n    public static void main(String[] args) {\n        System.out.println(reverseString("hello"));\n    }\n}',
      },
      tags: ["String", "Two Pointers"],
    },
    {
      id: "two-sum",
      title: "Two Sum",
      difficulty: "Medium",
      description:
        "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
      examples:
        "Input: nums=[2,7,11,15], target=9\nOutput: [0,1]\n\nInput: nums=[3,2,4], target=6\nOutput: [1,2]",
      starterCode: {
        python:
          "def two_sum(nums, target):\n    # Write your code here\n    pass\n\n# Test your function\nprint(two_sum([2,7,11,15], 9))",
        javascript:
          "function twoSum(nums, target) {\n    // Write your code here\n}\n\n// Test your function\nconsole.log(twoSum([2,7,11,15], 9));",
        java: "import java.util.*;\n\npublic class Solution {\n    public static int[] twoSum(int[] nums, int target) {\n        // Write your code here\n        return new int[]{};\n    }\n    \n    public static void main(String[] args) {\n        int[] result = twoSum(new int[]{2,7,11,15}, 9);\n        System.out.println(Arrays.toString(result));\n    }\n}",
      },
      tags: ["Array", "Hash Table"],
    },
    {
      id: "palindrome",
      title: "Palindrome Check",
      difficulty: "Easy",
      description:
        "Write a function that checks if a given string is a palindrome. Consider only alphanumeric characters and ignore cases.",
      examples:
        "Input: 'A man a plan a canal Panama'\nOutput: true\n\nInput: 'race a car'\nOutput: false",
      starterCode: {
        python:
          "def is_palindrome(s):\n    # Write your code here\n    pass\n\n# Test your function\nprint(is_palindrome('A man a plan a canal Panama'))",
        javascript:
          "function isPalindrome(s) {\n    // Write your code here\n}\n\n// Test your function\nconsole.log(isPalindrome('A man a plan a canal Panama'));",
        java: 'public class Solution {\n    public static boolean isPalindrome(String s) {\n        // Write your code here\n        return false;\n    }\n    \n    public static void main(String[] args) {\n        System.out.println(isPalindrome("A man a plan a canal Panama"));\n    }\n}',
      },
      tags: ["String", "Two Pointers"],
    },
    {
      id: "binary-search",
      title: "Binary Search",
      difficulty: "Medium",
      description:
        "Implement binary search to find the target in a sorted array. Return the index if found, otherwise return -1.",
      examples:
        "Input: nums=[-1,0,3,5,9,12], target=9\nOutput: 4\n\nInput: nums=[-1,0,3,5,9,12], target=2\nOutput: -1",
      starterCode: {
        python:
          "def binary_search(nums, target):\n    # Write your code here\n    pass\n\n# Test your function\nprint(binary_search([-1,0,3,5,9,12], 9))",
        javascript:
          "function binarySearch(nums, target) {\n    // Write your code here\n}\n\n// Test your function\nconsole.log(binarySearch([-1,0,3,5,9,12], 9));",
        java: "public class Solution {\n    public static int binarySearch(int[] nums, int target) {\n        // Write your code here\n        return -1;\n    }\n    \n    public static void main(String[] args) {\n        System.out.println(binarySearch(new int[]{-1,0,3,5,9,12}, 9));\n    }\n}",
      },
      tags: ["Binary Search", "Array"],
    },
    {
      id: "merge-sorted",
      title: "Merge Sorted Arrays",
      difficulty: "Hard",
      description:
        "Merge two sorted arrays into one sorted array. Do not use built-in sorting functions.",
      examples: "Input: arr1=[1,3,5], arr2=[2,4,6]\nOutput: [1,2,3,4,5,6]",
      starterCode: {
        python:
          "def merge_sorted(arr1, arr2):\n    # Write your code here\n    pass\n\n# Test your function\nprint(merge_sorted([1,3,5], [2,4,6]))",
        javascript:
          "function mergeSorted(arr1, arr2) {\n    // Write your code here\n}\n\n// Test your function\nconsole.log(mergeSorted([1,3,5], [2,4,6]));",
        java: "import java.util.*;\n\npublic class Solution {\n    public static int[] mergeSorted(int[] arr1, int[] arr2) {\n        // Write your code here\n        return new int[]{};\n    }\n    \n    public static void main(String[] args) {\n        int[] result = mergeSorted(new int[]{1,3,5}, new int[]{2,4,6});\n        System.out.println(Arrays.toString(result));\n    }\n}",
      },
      tags: ["Array", "Two Pointers", "Sorting"],
    },
  ];

  const problems = useMemo(() => buildProblemBank(seedProblems), []);
  const currentProblem =
    problems.find((p) => p.id === problemId) || problems[0];

  const categoryItems = useMemo(() => {
    return [{ id: "all", name: "All" }, ...PROGRAM_CATEGORIES];
  }, []);

  const filteredProblems = useMemo(() => {
    const q = String(programSearch || "")
      .trim()
      .toLowerCase();
    const list = (
      selectedCategoryId === "all"
        ? problems
        : problems.filter((p) => p.categoryId === selectedCategoryId)
    ).filter((p) => {
      if (programDifficulty !== "all" && p.difficulty !== programDifficulty)
        return false;
      if (!q) return true;
      const hay = [
        p.title,
        p.description,
        p.difficulty,
        getCategoryLabel(p.categoryId),
        ...(p.tags || []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
    // Stable ordering: Easy → Medium → Hard, then title
    const diffOrder = new Map([
      ["Easy", 1],
      ["Medium", 2],
      ["Hard", 3],
    ]);
    return [...list].sort((a, b) => {
      const da = diffOrder.get(a.difficulty) || 99;
      const db = diffOrder.get(b.difficulty) || 99;
      if (da !== db) return da - db;
      return String(a.title).localeCompare(String(b.title));
    });
  }, [problems, selectedCategoryId, programSearch, programDifficulty]);

  useEffect(() => {
    // Load starter code when problem or language changes
    if (currentProblem.starterCode[language]) {
      setCode(currentProblem.starterCode[language]);
    }
  }, [problemId, language]);

  useEffect(() => {
    let interval;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const startSubmissionLongPress = (index) => {
    if (typeof index !== "number") return;
    if (submissionLongPressTimerRef.current) {
      clearTimeout(submissionLongPressTimerRef.current);
    }
    submissionLongPressTimerRef.current = setTimeout(() => {
      setSubmissionContextIndex(index);
    }, 500);
  };

  const cancelSubmissionLongPress = () => {
    if (submissionLongPressTimerRef.current) {
      clearTimeout(submissionLongPressTimerRef.current);
      submissionLongPressTimerRef.current = null;
    }
  };

  const deleteSubmissionAtIndex = async (index) => {
    if (typeof index !== "number") return;

    const target = submissions?.[index];
    const submissionId = target?.id;
    if (submissionId) {
      try {
        await axiosInstance.delete(`/code/submissions/${submissionId}`);
      } catch (e) {
        toast.error("Failed to delete submission. Please retry.");
        return;
      }
    }

    setSubmissions((prev) => {
      const next = prev.filter((_, i) => i !== index);

      try {
        localStorage.setItem(codingSubmissionsKey, JSON.stringify(next));
      } catch (e) {
        // ignore storage failures
      }

      return next;
    });

    setSubmissionContextIndex(null);
    toast.success("Submission deleted");
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "Easy":
        return "text-[rgb(var(--accent-rgb))] bg-[rgba(var(--accent-rgb),0.10)]";
      case "Medium":
        return "text-[rgb(var(--accent-rgb))] bg-[rgba(var(--accent-rgb),0.10)]";
      case "Hard":
        return "text-red-400 bg-red-500/10";
      default:
        return "text-zinc-400 bg-zinc-500/10";
    }
  };

  const handleEvaluate = async () => {
    if (!code.trim()) {
      toast.error("Please write some code first");
      return;
    }

    setLoading(true);
    setEvaluation(null);
    setDisplayedEvaluation("");
    setIsTimerRunning(false);
    setAiStatus("analyzing");

    // Add user submission message
    const userMsg = {
      role: "user",
      content: `Submitted ${language} solution for "${currentProblem.title}"`,
      timestamp: new Date(),
      code: code,
    };
    setAiMessages((prev) => [...prev, userMsg]);

    // Simulate AI thinking phases
    setTimeout(() => setAiStatus("thinking"), 500);

    try {
      const response = await axiosInstance.post("/code/evaluate", {
        code,
        language,
        problem_id: problemId,
        user_id: "current",
        topic: currentProblem?.tags?.[0] || "Coding",
        difficulty: currentProblem?.difficulty || null,
        solve_time_seconds: typeof timer === "number" ? timer : null,
      });

      setAiStatus("responding");
      setEvaluation(response.data);

      // Add AI response message
      const aiMsg = {
        role: "assistant",
        content: response.data.passed
          ? `🎉 Excellent work! Your solution passed all test cases with a score of ${response.data.score}/100!`
          : `📝 Good attempt! Your solution scored ${response.data.score}/100. Let me explain what can be improved...`,
        timestamp: new Date(),
        evaluation: response.data,
      };
      setAiMessages((prev) => [...prev, aiMsg]);

      // Save submission
      const newSubmission = {
        id: response.data.id,
        problemId: response.data.problem_id || problemId,
        problemTitle: currentProblem.title,
        language: response.data.language || language,
        score: response.data.score,
        passed: !!response.data.passed,
        time:
          typeof response.data.solve_time_seconds === "number"
            ? response.data.solve_time_seconds
            : timer,
        timestamp: response.data.created_at || new Date().toISOString(),
      };
      setSubmissions((prev) => {
        const next = [newSubmission, ...(prev || [])].slice(0, 10);
        try {
          localStorage.setItem(codingSubmissionsKey, JSON.stringify(next));
        } catch {
          // ignore
        }
        return next;
      });

      // Update streak (server-side, daily cadence)
      if (response.data.passed) {
        await refreshCodingStreakFromServer();
        await refreshSubmissionHistoryFromServer();
        toast.success("Excellent! Your code passed all test cases! 🎉");
      } else {
        toast.warning("Code needs improvement. Check the AI feedback.");
      }
    } catch (error) {
      setAiStatus("error");
      toast.error("Failed to evaluate code. Please try again.");

      const errorMsg = {
        role: "assistant",
        content:
          "❌ Sorry, I encountered an error while evaluating your code. Please try again.",
        timestamp: new Date(),
        isError: true,
      };
      setAiMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  // Ask AI for help
  const askAiHelp = async () => {
    if (!userQuestion.trim()) return;

    const userMsg = {
      role: "user",
      content: userQuestion,
      timestamp: new Date(),
    };
    setAiMessages((prev) => [...prev, userMsg]);
    setUserQuestion("");
    setAiStatus("thinking");

    try {
      const response = await axiosInstance.post("/tutor/chat", {
        message: `Regarding the "${currentProblem.title}" coding problem: ${userQuestion}`,
        topic: "coding",
        user_id: "current",
      });

      setAiStatus("responding");
      const aiMsg = {
        role: "assistant",
        content: response.data.response,
        timestamp: new Date(),
      };
      setAiMessages((prev) => [...prev, aiMsg]);
      setTimeout(() => setAiStatus("online"), 1000);
    } catch (error) {
      setAiStatus("error");
      const errorMsg = {
        role: "assistant",
        content: "Sorry, I couldn't process your question. Please try again.",
        timestamp: new Date(),
        isError: true,
      };
      setAiMessages((prev) => [...prev, errorMsg]);
    }
  };

  // Get AI status display
  const getAiStatusDisplay = () => {
    switch (aiStatus) {
      case "online":
        return {
          text: "AI Online",
          color: "text-[rgb(var(--accent-rgb))]",
          bg: "bg-[rgb(var(--accent-rgb))]",
        };
      case "thinking":
        return {
          text: "Thinking...",
          color: "text-[rgb(var(--accent-rgb))]",
          bg: "bg-[rgb(var(--accent-rgb))]",
        };
      case "analyzing":
        return {
          text: "Analyzing Code...",
          color: "text-[rgb(var(--accent-rgb))]",
          bg: "bg-[rgb(var(--accent-rgb))]",
        };
      case "responding":
        return {
          text: "Responding...",
          color: "text-[rgb(var(--accent-rgb))]",
          bg: "bg-[rgb(var(--accent-rgb))]",
        };
      case "error":
        return { text: "Error", color: "text-red-400", bg: "bg-red-400" };
      default:
        return {
          text: "AI Online",
          color: "text-[rgb(var(--accent-rgb))]",
          bg: "bg-[rgb(var(--accent-rgb))]",
        };
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Code copied to clipboard!");
  };

  const resetCode = () => {
    setCode(currentProblem.starterCode[language] || "");
    setEvaluation(null);
    setDisplayedEvaluation("");
    setTimer(0);
    setIsTimerRunning(false);
    toast.info("Code reset to starter template");
  };

  const aiStatusInfo = getAiStatusDisplay();

  return (
    <div className="min-h-screen bg-black text-white">
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-r from-[rgb(var(--accent-rgb))] to-[rgba(var(--accent-rgb),0.85)] rounded-2xl relative shadow-lg">
              <Code className="w-8 h-8 text-white" />
              <div
                className={`absolute -bottom-1 -right-1 w-3 h-3 ${
                  aiStatusInfo.bg
                } rounded-full border-2 border-black ${
                  aiStatus !== "online" ? "animate-pulse" : ""
                }`}
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                {t("nav.codingArena", "Coding Arena")}
                <Sparkles className="w-5 h-5 text-white" />
              </h1>
              <p
                className={`text-sm flex items-center gap-2 ${aiStatusInfo.color}`}
              >
                <Bot className="w-4 h-4" />
                {aiStatusInfo.text} •{" "}
                {t("codingArena.aiPowered", "AI-powered evaluation")}
              </p>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="hidden md:flex items-center gap-4">
            {/* Streak */}
            <div className="flex items-center gap-2 px-3 py-2 bg-zinc-800 rounded-lg border border-zinc-700">
              <div className="w-4 h-4 bg-gradient-to-r from-[rgb(var(--accent-rgb))] to-[rgba(var(--accent-rgb),0.85)] rounded flex items-center justify-center">
                <Flame className="w-3 h-3 text-white" />
              </div>
              <span className="text-sm text-white font-semibold">
                {streak} {t("codingArena.streak", "streak")}
              </span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-zinc-900 rounded-lg">
              <div className="w-4 h-4 bg-gradient-to-r from-[rgb(var(--accent-rgb))] to-[rgba(var(--accent-rgb),0.85)] rounded flex items-center justify-center">
                <Timer className="w-3 h-3 text-white" />
              </div>
              <span className="text-sm text-white font-mono">
                {formatTime(timer)}
              </span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-zinc-900 rounded-lg">
              <div className="w-4 h-4 bg-gradient-to-r from-[rgb(var(--accent-rgb))] to-[rgba(var(--accent-rgb),0.85)] rounded flex items-center justify-center">
                <Trophy className="w-3 h-3 text-white" />
              </div>
              <span className="text-sm text-white">
                {submissions.filter((s) => s.passed).length}{" "}
                {t("codingArena.solved", "solved")}
              </span>
            </div>
            <Button
              variant={isTimerRunning ? "destructive" : "outline"}
              size="sm"
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              className={
                isTimerRunning
                  ? "bg-red-500 hover:bg-red-600"
                  : "border-zinc-700 text-white hover:bg-zinc-800"
              }
            >
              {isTimerRunning ? (
                <Pause className="w-4 h-4 mr-1" />
              ) : (
                <Play className="w-4 h-4 mr-1" />
              )}
              {isTimerRunning
                ? t("codingArena.pause", "Pause")
                : t("codingArena.start", "Start")}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Panel - Problem & Editor */}
          <div className="space-y-4">
            {/* Problem Selection */}
            <Card className="bg-zinc-900 border-zinc-800">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 justify-between bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-800/70"
                    onClick={() => setProgramsOpen(true)}
                  >
                    <span className="flex items-center gap-2 min-w-0">
                      <BookOpen className="w-4 h-4 flex-shrink-0" />
                      <span className="font-medium">
                        {t("codingArena.programs", "Programs")}
                      </span>
                      <span className="text-zinc-400 text-xs truncate">
                        {currentProblem?.title}
                      </span>
                    </span>
                    <ChevronRight className="w-4 h-4 text-zinc-400" />
                  </Button>

                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger
                      data-testid="language-select"
                      className="w-40 bg-zinc-800 border-zinc-700 text-white"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-800">
                      <SelectItem value="python">
                        <span className="flex items-center gap-2">
                          <FileCode className="w-4 h-4" />
                          Python
                        </span>
                      </SelectItem>
                      <SelectItem value="javascript">
                        <span className="flex items-center gap-2">
                          <FileCode className="w-4 h-4" />
                          JavaScript
                        </span>
                      </SelectItem>
                      <SelectItem value="java">
                        <span className="flex items-center gap-2">
                          <FileCode className="w-4 h-4" />
                          Java
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Dialog open={programsOpen} onOpenChange={setProgramsOpen}>
              <DialogContent className="w-[calc(100vw-2rem)] max-w-4xl bg-zinc-950 border-zinc-800 text-white">
                <DialogHeader>
                  <DialogTitle>
                    {t("codingArena.programs", "Programs")}
                  </DialogTitle>
                  <DialogDescription className="text-zinc-400">
                    {t(
                      "codingArena.chooseProblems",
                      "Choose from 1000+ coding problems by category."
                    )}
                  </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <div className="flex-1">
                    <Input
                      value={programSearch}
                      onChange={(e) => setProgramSearch(e.target.value)}
                      placeholder={t(
                        "codingArena.searchPlaceholder",
                        "Search problems (title, tag, keyword)"
                      )}
                      className="bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-500"
                    />
                  </div>
                  <div className="sm:w-52">
                    <Select
                      value={programDifficulty}
                      onValueChange={setProgramDifficulty}
                    >
                      <SelectTrigger className="bg-zinc-950 border-zinc-800 text-white">
                        <SelectValue placeholder="Difficulty" />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-950 border-zinc-800 text-white">
                        <SelectItem value="all">All difficulties</SelectItem>
                        <SelectItem value="Easy">Easy</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex gap-2 overflow-x-auto pb-2">
                  {categoryItems.map((c) => {
                    const active = c.id === selectedCategoryId;
                    return (
                      <Button
                        key={c.id}
                        type="button"
                        variant={active ? "default" : "outline"}
                        className={
                          active
                            ? "bg-white text-black hover:bg-white/90"
                            : "border-zinc-700 text-white hover:bg-zinc-900"
                        }
                        onClick={() => setSelectedCategoryId(c.id)}
                      >
                        {c.name}
                      </Button>
                    );
                  })}
                </div>

                <div className="max-h-[60vh] overflow-y-auto rounded-md border border-zinc-800">
                  {filteredProblems.length === 0 ? (
                    <div className="p-6 text-sm text-zinc-400">
                      No problems found. Try a different keyword or filter.
                    </div>
                  ) : (
                    filteredProblems.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        className="w-full text-left px-4 py-3 border-b border-zinc-800 hover:bg-zinc-900 transition-colors"
                        onClick={() => {
                          setProblemId(p.id);
                          setActiveTab("problem");
                          setProgramsOpen(false);
                        }}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <div className="font-medium truncate">
                              {p.title}
                            </div>
                            <div className="text-xs text-zinc-400 truncate">
                              {getCategoryLabel(p.categoryId)}
                              {p.tags && p.tags.length ? (
                                <span className="ml-2 text-zinc-500">
                                  {p.tags.slice(0, 2).join(" · ")}
                                </span>
                              ) : null}
                            </div>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded text-xs flex-shrink-0 ${getDifficultyColor(
                              p.difficulty
                            )}`}
                          >
                            {p.difficulty}
                          </span>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </DialogContent>
            </Dialog>

            {/* Problem Description Tabs */}
            <Card className="bg-zinc-900 border-zinc-800">
              <div className="flex border-b border-zinc-800">
                {["problem", "examples", "hints"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-3 text-sm font-medium capitalize transition-colors ${
                      activeTab === tab
                        ? "text-white border-b-2 border-white"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              <CardContent className="p-4">
                {activeTab === "problem" && (
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-lg font-semibold text-white">
                        {currentProblem.title}
                      </h3>
                      <span
                        className={`px-2 py-1 rounded text-xs ${getDifficultyColor(
                          currentProblem.difficulty
                        )}`}
                      >
                        {currentProblem.difficulty}
                      </span>
                    </div>
                    <p className="text-zinc-400 text-sm mb-4">
                      {currentProblem.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {currentProblem.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-zinc-800 rounded-full text-xs text-zinc-300"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {activeTab === "examples" && (
                  <pre className="text-sm text-zinc-300 whitespace-pre-wrap font-mono bg-zinc-800 p-3 rounded-lg">
                    {currentProblem.examples}
                  </pre>
                )}
                {activeTab === "hints" && (
                  <div className="space-y-2">
                    {(currentProblem.hints && currentProblem.hints.length > 0
                      ? currentProblem.hints
                      : [
                          "Think about edge cases like empty inputs",
                          "Consider time and space complexity",
                        ]
                    ).map((hint, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2 text-sm text-zinc-400"
                      >
                        <Zap className="w-4 h-4 text-[rgb(var(--accent-rgb))] mt-0.5" />
                        <span>{hint}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Code Editor */}
            <Card className="bg-zinc-900 border-zinc-800 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-zinc-400" />
                  <span className="text-sm text-zinc-400">Code Editor</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-zinc-400 hover:text-white"
                    onClick={copyCode}
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-zinc-400 hover:text-white"
                    onClick={resetCode}
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div data-testid="code-editor" className="h-[400px]">
                <Editor
                  height="400px"
                  language={language}
                  value={code}
                  onChange={(value) => setCode(value || "")}
                  theme="vs-dark"
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    lineNumbers: "on",
                    roundedSelection: false,
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    padding: { top: 16 },
                  }}
                />
              </div>
            </Card>

            {/* Submit Button */}
            <Button
              data-testid="evaluate-btn"
              onClick={handleEvaluate}
              disabled={loading}
              className="w-full bg-white text-black hover:bg-zinc-200 font-semibold h-12"
              size="lg"
            >
              {loading ? (
                <>
                  <Bot className="w-5 h-5 mr-2 animate-pulse" />
                  AI is Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Run & Get AI Evaluation
                </>
              )}
            </Button>
          </div>

          {/* Right Panel - AI Results */}
          <div className="space-y-4">
            {/* AI Chat Header */}
            <Card className="bg-zinc-900 border-zinc-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                        <Bot className="w-6 h-6 text-black" />
                      </div>
                      <div
                        className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 ${
                          aiStatusInfo.bg
                        } rounded-full border-2 border-zinc-900 ${
                          aiStatus !== "online" ? "animate-pulse" : ""
                        }`}
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white flex items-center gap-2">
                        Code Evaluator AI
                        <Badge className="bg-[rgba(var(--accent-rgb),0.20)] text-[rgb(var(--accent-rgb))] text-xs">
                          Gemini
                        </Badge>
                      </h3>
                      <p className={`text-sm ${aiStatusInfo.color}`}>
                        {aiStatusInfo.text}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAiChat(!showAiChat)}
                    className="border-[rgba(var(--accent-rgb),0.30)] text-[rgb(var(--accent-rgb))] hover:bg-[rgba(var(--accent-rgb),0.10)]"
                  >
                    <MessageSquare className="w-4 h-4 mr-1" />
                    {showAiChat ? "Hide" : "Ask AI"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* AI Chat Panel */}
            {showAiChat && (
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader className="border-b border-zinc-800 pb-3">
                  <CardTitle className="text-sm text-zinc-400 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Ask AI for Help
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="h-48 overflow-y-auto mb-4 space-y-3">
                    {aiMessages.length === 0 ? (
                      <div className="text-center py-8">
                        <Lightbulb className="w-8 h-8 mx-auto mb-2 text-[rgba(var(--accent-rgb),0.50)]" />
                        <p className="text-sm text-zinc-500">
                          Ask me anything about this problem!
                        </p>
                      </div>
                    ) : (
                      aiMessages.map((msg, idx) => (
                        <div
                          key={idx}
                          className={`flex gap-2 ${
                            msg.role === "user"
                              ? "justify-end"
                              : "justify-start"
                          }`}
                        >
                          {msg.role === "assistant" && (
                            <div className="w-7 h-7 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                              <Bot className="w-4 h-4 text-black" />
                            </div>
                          )}
                          <div
                            className={`max-w-[80%] p-3 rounded-xl text-sm ${
                              msg.role === "user"
                                ? "bg-zinc-700 text-white"
                                : msg.isError
                                ? "bg-red-500/10 text-red-300 border border-red-500/30"
                                : "bg-zinc-800 text-zinc-300"
                            }`}
                          >
                            {msg.content}
                          </div>
                          {msg.role === "user" && (
                            <div className="w-7 h-7 bg-zinc-700 rounded-full flex items-center justify-center flex-shrink-0">
                              <User className="w-4 h-4 text-zinc-300" />
                            </div>
                          )}
                        </div>
                      ))
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={userQuestion}
                      onChange={(e) => setUserQuestion(e.target.value)}
                      placeholder="Ask for hints or explanations..."
                      className="bg-zinc-800 border-zinc-700 text-white"
                      onKeyPress={(e) => e.key === "Enter" && askAiHelp()}
                    />
                    <Button
                      onClick={askAiHelp}
                      disabled={!userQuestion.trim() || aiStatus === "thinking"}
                      className="bg-[rgb(var(--accent-rgb))] hover:bg-[rgba(var(--accent-rgb),0.90)]"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Evaluation Results */}
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader className="border-b border-zinc-800">
                <CardTitle className="text-white flex items-center gap-2">
                  <Crosshair className="w-5 h-5" />
                  AI Evaluation
                  {loading && (
                    <Badge className="bg-[rgba(var(--accent-rgb),0.20)] text-[rgb(var(--accent-rgb))] ml-2">
                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                      Analyzing
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription className="text-zinc-500">
                  Real-time code analysis powered by Gemini AI
                </CardDescription>
              </CardHeader>
              <CardContent data-testid="evaluation-results" className="p-4">
                {!evaluation && !loading && (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 bg-zinc-800 rounded-full flex items-center justify-center">
                      <Code className="w-8 h-8 text-zinc-500" />
                    </div>
                    <p className="text-zinc-500 mb-2">
                      Submit your code to see AI evaluation
                    </p>
                    <p className="text-xs text-zinc-600">
                      Gemini AI will analyze your code for correctness,
                      efficiency, and style
                    </p>
                  </div>
                )}

                {loading && (
                  <div className="py-8">
                    <div className="flex items-center justify-center gap-3 mb-4">
                      <div className="relative">
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                          <Bot className="w-6 h-6 text-black animate-pulse" />
                        </div>
                        <div className="absolute inset-0 rounded-full border-2 border-white/50 animate-ping" />
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-white font-medium mb-2">
                        {aiStatusInfo.text}
                      </p>
                      <div className="flex justify-center gap-1">
                        {[0, 1, 2].map((i) => (
                          <div
                            key={i}
                            className="w-2 h-2 bg-[rgb(var(--accent-rgb))] rounded-full animate-bounce"
                            style={{ animationDelay: `${i * 0.15}s` }}
                          />
                        ))}
                      </div>
                    </div>
                    <Progress value={45} className="mt-4 h-1" />
                  </div>
                )}

                {evaluation && (
                  <div className="space-y-4">
                    {/* Status */}
                    <div
                      className={`p-4 rounded-xl flex items-center justify-between ${
                        evaluation.passed
                          ? "bg-green-500/10 border border-green-500/30"
                          : "bg-[rgba(var(--accent-rgb),0.10)] border border-[rgba(var(--accent-rgb),0.30)]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {evaluation.passed ? (
                          <div className="relative">
                            <CheckCircle2 className="w-10 h-10 text-green-400" />
                            <Sparkles className="w-4 h-4 text-[rgb(var(--accent-rgb))] absolute -top-1 -right-1" />
                          </div>
                        ) : (
                          <AlertCircle className="w-10 h-10 text-[rgb(var(--accent-rgb))]" />
                        )}
                        <div>
                          <p
                            className={`font-semibold text-lg ${
                              evaluation.passed
                                ? "text-green-400"
                                : "text-[rgb(var(--accent-rgb))]"
                            }`}
                          >
                            {evaluation.passed
                              ? "🎉 All Tests Passed!"
                              : "💡 Needs Improvement"}
                          </p>
                          <p className="text-xs text-zinc-400">
                            Completed in {formatTime(timer)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-4xl font-bold text-white">
                          {evaluation.score}
                        </p>
                        <p className="text-xs text-zinc-400">/ 100 points</p>
                      </div>
                    </div>

                    {/* Score Breakdown */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="p-3 bg-zinc-800 rounded-lg text-center">
                        <Star className="w-5 h-5 text-[rgb(var(--accent-rgb))] mx-auto mb-1" />
                        <p className="text-xs text-zinc-400 mb-1">
                          Correctness
                        </p>
                        <span className="font-bold text-white">
                          {Math.min(evaluation.score, 100)}%
                        </span>
                      </div>
                      <div className="p-3 bg-zinc-800 rounded-lg text-center">
                        <TrendingUp className="w-5 h-5 text-[rgb(var(--accent-rgb))] mx-auto mb-1" />
                        <p className="text-xs text-zinc-400 mb-1">Quality</p>
                        <span className="font-bold text-white">
                          {evaluation.passed ? "Good" : "Fair"}
                        </span>
                      </div>
                      <div className="p-3 bg-zinc-800 rounded-lg text-center">
                        <Zap className="w-5 h-5 text-[rgb(var(--accent-rgb))] mx-auto mb-1" />
                        <p className="text-xs text-zinc-400 mb-1">Efficiency</p>
                        <span className="font-bold text-white">
                          {evaluation.score >= 80 ? "Optimal" : "Moderate"}
                        </span>
                      </div>
                    </div>

                    {/* Suggestions */}
                    {evaluation.suggestions && (
                      <div className="p-4 bg-[rgba(var(--accent-rgb),0.08)] rounded-xl border border-[rgba(var(--accent-rgb),0.20)]">
                        <h4 className="font-semibold mb-2 flex items-center gap-2 text-white">
                          <Lightbulb className="w-4 h-4 text-[rgb(var(--accent-rgb))]" />
                          AI Suggestions
                        </h4>
                        <p className="text-sm text-zinc-300">
                          {evaluation.suggestions}
                        </p>
                      </div>
                    )}

                    {/* Detailed Analysis with Typing Effect */}
                    <div className="p-4 bg-zinc-800 rounded-xl">
                      <h4 className="font-semibold mb-3 flex items-center gap-2 text-white">
                        <Bot className="w-4 h-4 text-[rgb(var(--accent-rgb))]" />
                        AI Analysis
                        {isTyping && (
                          <span className="text-xs text-[rgb(var(--accent-rgb))] animate-pulse">
                            typing...
                          </span>
                        )}
                      </h4>
                      <div className="max-h-48 overflow-y-auto">
                        <pre className="text-sm text-zinc-300 whitespace-pre-wrap font-mono leading-relaxed">
                          {displayedEvaluation}
                          {isTyping && (
                            <span className="inline-block w-2 h-4 bg-[rgb(var(--accent-rgb))] animate-pulse ml-0.5" />
                          )}
                        </pre>
                      </div>
                    </div>

                    {/* Feedback Actions */}
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-zinc-400 hover:text-[rgb(var(--accent-rgb))]"
                        >
                          <ThumbsUp className="w-4 h-4 mr-1" />
                          Helpful
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-zinc-400 hover:text-[rgb(var(--accent-rgb))]"
                        >
                          <MessageSquare className="w-4 h-4 mr-1" />
                          Ask Follow-up
                        </Button>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={resetCode}
                        className="border-zinc-700 text-zinc-400 hover:text-white"
                      >
                        <RotateCcw className="w-4 h-4 mr-1" />
                        Try Again
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Submissions */}
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader className="border-b border-zinc-800 pb-3">
                <CardTitle className="text-sm text-zinc-400 flex items-center gap-2">
                  <History className="w-4 h-4" />
                  Submission History
                  <Badge className="bg-zinc-800 text-zinc-400 text-xs ml-auto">
                    {submissions.length} total
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                {submissions.length === 0 ? (
                  <div className="text-center py-6">
                    <BarChart3 className="w-8 h-8 mx-auto mb-2 text-zinc-600" />
                    <p className="text-sm text-zinc-500">No submissions yet</p>
                    <p className="text-xs text-zinc-600">
                      Your coding history will appear here
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {submissions.slice(0, 5).map((sub, idx) => {
                      const subKey = `${sub?.timestamp || "no-ts"}:${idx}`;
                      const isContextOpen = submissionContextIndex === idx;
                      return (
                        <div
                          key={subKey}
                          className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg hover:bg-zinc-700/50 transition-colors cursor-pointer group"
                          onClick={() => {
                            if (isContextOpen) {
                              setSubmissionContextIndex(null);
                            }
                          }}
                          onContextMenu={(e) => {
                            e.preventDefault();
                            setSubmissionContextIndex(idx);
                          }}
                          onTouchStart={() => startSubmissionLongPress(idx)}
                          onTouchEnd={cancelSubmissionLongPress}
                          onTouchCancel={cancelSubmissionLongPress}
                        >
                          <div className="flex items-center gap-3">
                            {sub.passed ? (
                              <div className="w-8 h-8 bg-[rgba(var(--accent-rgb),0.20)] rounded-full flex items-center justify-center">
                                <CheckCircle2 className="w-4 h-4 text-[rgb(var(--accent-rgb))]" />
                              </div>
                            ) : (
                              <div className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center">
                                <XCircle className="w-4 h-4 text-red-400" />
                              </div>
                            )}
                            <div>
                              <p className="text-sm font-medium text-white group-hover:text-[rgb(var(--accent-rgb))] transition-colors">
                                {sub.problemTitle}
                              </p>
                              <p className="text-xs text-zinc-500 flex items-center gap-2">
                                <FileCode className="w-3 h-3" />
                                {sub.language}
                                <span className="text-zinc-600">•</span>
                                <Timer className="w-3 h-3" />
                                {formatTime(sub.time)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 relative">
                            <span
                              className={`text-sm font-bold ${
                                sub.passed
                                  ? "text-[rgb(var(--accent-rgb))]"
                                  : "text-red-400"
                              }`}
                            >
                              {sub.score}
                            </span>
                            {isContextOpen && (
                              <button
                                type="button"
                                aria-label="Delete submission"
                                title="Delete"
                                className="p-1 rounded hover:bg-zinc-700 z-10 pointer-events-auto"
                                onPointerDown={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  deleteSubmissionAtIndex(idx);
                                }}
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  deleteSubmissionAtIndex(idx);
                                }}
                                onTouchStart={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  deleteSubmissionAtIndex(idx);
                                }}
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  deleteSubmissionAtIndex(idx);
                                }}
                              >
                                <Trash2 className="w-4 h-4 text-zinc-400 hover:text-red-400" />
                              </button>
                            )}
                            <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Tips */}
            <Card className="bg-[rgba(var(--accent-rgb),0.10)] border-[rgba(var(--accent-rgb),0.20)]">
              <CardContent className="p-4">
                <h4 className="font-semibold text-white flex items-center gap-2 mb-3">
                  <Lightbulb className="w-4 h-4 text-[rgb(var(--accent-rgb))]" />
                  AI Tips
                </h4>
                <div className="space-y-2 text-sm text-zinc-400">
                  <div className="flex items-start gap-2">
                    <ArrowRight className="w-4 h-4 text-[rgb(var(--accent-rgb))] mt-0.5 flex-shrink-0" />
                    <span>
                      Use the "Ask AI" button for hints without revealing the
                      solution
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <ArrowRight className="w-4 h-4 text-[rgb(var(--accent-rgb))] mt-0.5 flex-shrink-0" />
                    <span>
                      AI analyzes time complexity and suggests optimizations
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <ArrowRight className="w-4 h-4 text-[rgb(var(--accent-rgb))] mt-0.5 flex-shrink-0" />
                    <span>Build your streak by solving problems daily!</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CodingArena;
