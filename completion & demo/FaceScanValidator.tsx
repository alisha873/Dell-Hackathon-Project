/**
 * components/FaceScanValidator.tsx
 * HackOS — FaceScan Personhood Validation (Mock UI)
 *
 * A polished 5-state liveness check UI that:
 * 1. Shows a real webcam feed (using getUserMedia)
 * 2. Simulates liveness challenges with animated timers
 * 3. Resolves to a scripted outcome (VERIFIED or REVIEW_REQUIRED)
 * 4. Emits the result to the parent registration form
 *
 * The webcam is REAL. The challenge detection is a JavaScript timer.
 * This demonstrates the UX design and privacy model.
 *
 * Demo setup:
 *   - Add ?facescan=verified to URL → always resolves to VERIFIED
 *   - Add ?facescan=review    to URL → always resolves to REVIEW_REQUIRED
 *   - Default: randomly resolves (for non-demo use)
 */

import React, { useState, useEffect, useRef, useCallback } from "react";

type ScanState =
  | "CONSENT"
  | "CAMERA_READY"
  | "LIVENESS_CHECK"
  | "ANALYZING"
  | "VERIFIED"
  | "REVIEW_REQUIRED"
  | "SKIPPED";

interface Challenge {
  id: string;
  label: string;
  emoji: string;
  duration_ms: number;
  status: "pending" | "in_progress" | "done";
  progress: number; // 0-100
}

interface FaceScanResult {
  status: "verified" | "review_required" | "skipped";
  score: number | null;
  audit_hash: string | null;
  consent_at: string | null;
  data_deleted_at: string | null;
}

interface Props {
  onResult: (result: FaceScanResult) => void;
  onSkip: () => void;
}

const CHALLENGES: Omit<Challenge, "status" | "progress">[] = [
  { id: "face_present", label: "Look directly at the camera", emoji: "👁", duration_ms: 2500 },
  { id: "blink",        label: "Blink twice slowly",          emoji: "😑", duration_ms: 3000 },
  { id: "head_turn",    label: "Turn head slightly left",      emoji: "↩", duration_ms: 2500 },
];

function hashString(str: string): string {
  // Fake SHA-256-looking hash for demo (not a real hash)
  const chars = "abcdef0123456789";
  let hash = "";
  for (let i = 0; i < 64; i++) {
    hash += chars[Math.floor(Math.abs(Math.sin(str.charCodeAt(i % str.length) * (i + 1))) * 16)];
  }
  return hash;
}

function getDemoOutcome(): "verified" | "review_required" {
  const params = new URLSearchParams(window.location.search);
  const param = params.get("facescan");
  if (param === "review") return "review_required";
  if (param === "verified") return "verified";
  return Math.random() > 0.15 ? "verified" : "review_required"; // 85% pass rate default
}

export default function FaceScanValidator({ onResult, onSkip }: Props) {
  const [state, setState] = useState<ScanState>("CONSENT");
  const [challenges, setChallenges] = useState<Challenge[]>(
    CHALLENGES.map((c) => ({ ...c, status: "pending", progress: 0 }))
  );
  const [currentChallenge, setCurrentChallenge] = useState(0);
  const [consentAt] = useState(new Date().toISOString());
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 320, height: 240, facingMode: "user" },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setState("CAMERA_READY");
    } catch {
      // Camera permission denied — route to manual review
      onResult({
        status: "review_required",
        score: null,
        audit_hash: null,
        consent_at: consentAt,
        data_deleted_at: new Date().toISOString(),
      });
    }
  }, [consentAt, onResult]);

  const startLivenessCheck = useCallback(() => {
    setState("LIVENESS_CHECK");
    setCurrentChallenge(0);
    setChallenges(CHALLENGES.map((c) => ({ ...c, status: "pending", progress: 0 })));
  }, []);

  // Run challenges sequentially
  useEffect(() => {
    if (state !== "LIVENESS_CHECK") return;
    if (currentChallenge >= CHALLENGES.length) {
      setState("ANALYZING");
      return;
    }

    // Mark current challenge as in_progress
    setChallenges((prev) =>
      prev.map((c, i) => (i === currentChallenge ? { ...c, status: "in_progress" } : c))
    );

    const challenge = CHALLENGES[currentChallenge];
    const steps = 20;
    const interval = challenge.duration_ms / steps;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      const progress = Math.min(100, (step / steps) * 100);
      setChallenges((prev) =>
        prev.map((c, i) => (i === currentChallenge ? { ...c, progress } : c))
      );

      if (step >= steps) {
        clearInterval(timer);
        setChallenges((prev) =>
          prev.map((c, i) => (i === currentChallenge ? { ...c, status: "done", progress: 100 } : c))
        );
        setTimeout(() => setCurrentChallenge((n) => n + 1), 300);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [state, currentChallenge]);

  // Resolve after analyzing
  useEffect(() => {
    if (state !== "ANALYZING") return;
    const outcome = getDemoOutcome();
    const timer = setTimeout(() => {
      stopCamera();
      const score = outcome === "verified" ? 0.88 + Math.random() * 0.1 : 0.52 + Math.random() * 0.12;
      const now = new Date().toISOString();
      setState(outcome === "verified" ? "VERIFIED" : "REVIEW_REQUIRED");
      onResult({
        status: outcome,
        score: Math.round(score * 100) / 100,
        audit_hash: hashString(`facescan_${consentAt}_${score}`),
        consent_at: consentAt,
        data_deleted_at: now,  // Immediate deletion
      });
    }, 1800);
    return () => clearTimeout(timer);
  }, [state, consentAt, onResult, stopCamera]);

  useEffect(() => () => stopCamera(), [stopCamera]);

  // ── Render ─────────────────────────────────────────────────────────────────

  if (state === "CONSENT") {
    return (
      <div className="border border-blue-200 rounded-xl p-5 bg-blue-50 space-y-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl">🎥</span>
          <div>
            <p className="font-semibold text-blue-900">Optional: FaceScan Personhood Validation</p>
            <p className="text-sm text-blue-700 mt-1">
              This step verifies you are a real person — not a bot — using a liveness check.
            </p>
          </div>
        </div>
        <ul className="text-sm text-blue-800 space-y-1 ml-8">
          <li>✓ Your face is <strong>not stored</strong> or compared against other users</li>
          <li>✓ Raw frames are <strong>deleted immediately</strong> after validation</li>
          <li>✓ Used only to prevent bot registrations</li>
          <li>✓ You can delete this data at any time from Profile Settings</li>
        </ul>
        <div className="flex gap-3 mt-2">
          <button
            onClick={() => { setState("SKIPPED"); onSkip(); }}
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 transition"
          >
            Skip — Use Manual Review
          </button>
          <button
            onClick={startCamera}
            className="flex-1 bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700 transition"
          >
            Enable FaceScan →
          </button>
        </div>
      </div>
    );
  }

  if (state === "CAMERA_READY") {
    return (
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <div className="relative bg-black">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-48 object-cover mirror"
            style={{ transform: "scaleX(-1)" }}
          />
          <div className="absolute inset-0 border-4 border-green-400 rounded pointer-events-none opacity-70" />
          <div className="absolute bottom-2 left-0 right-0 text-center">
            <span className="bg-green-500 text-white text-xs px-3 py-1 rounded-full">
              ● Face detected
            </span>
          </div>
        </div>
        <div className="p-4 text-center">
          <p className="text-sm text-gray-600 mb-3">Position your face in the frame and look directly at the camera.</p>
          <button
            onClick={startLivenessCheck}
            className="bg-green-600 text-white rounded-lg px-6 py-2 text-sm font-medium hover:bg-green-700 transition"
          >
            Begin Liveness Check →
          </button>
        </div>
      </div>
    );
  }

  if (state === "LIVENESS_CHECK") {
    return (
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <div className="relative bg-black">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-40 object-cover"
            style={{ transform: "scaleX(-1)" }}
          />
        </div>
        <div className="p-4 space-y-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Liveness Checks</p>
          {challenges.map((c, i) => (
            <div key={c.id} className={`flex items-center gap-3 ${i > currentChallenge ? "opacity-40" : ""}`}>
              <span className="text-lg w-8 text-center">{c.emoji}</span>
              <div className="flex-1">
                <div className="flex justify-between text-sm mb-1">
                  <span className={c.status === "done" ? "text-green-700 font-medium" : "text-gray-700"}>
                    {c.label}
                  </span>
                  {c.status === "done" && <span className="text-green-600 font-bold">✓</span>}
                  {c.status === "in_progress" && (
                    <span className="text-blue-600 text-xs">{Math.round(c.progress)}%</span>
                  )}
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-200 ${
                      c.status === "done" ? "bg-green-500" : "bg-blue-500"
                    }`}
                    style={{ width: `${c.progress}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (state === "ANALYZING") {
    return (
      <div className="border border-gray-200 rounded-xl p-6 text-center space-y-3">
        <div className="animate-spin w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full mx-auto" />
        <p className="text-sm text-gray-600">Analyzing liveness signals…</p>
        <p className="text-xs text-gray-400">Deleting raw frames</p>
      </div>
    );
  }

  if (state === "VERIFIED") {
    return (
      <div className="border border-green-200 rounded-xl p-5 bg-green-50 space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl">✅</span>
          <p className="font-semibold text-green-800">Person Verified</p>
        </div>
        <div className="text-xs text-green-700 space-y-1 ml-9">
          <p>Raw frames: <strong>Deleted (0ms retention)</strong></p>
          <p>Consent recorded: {new Date(consentAt).toLocaleTimeString()}</p>
        </div>
      </div>
    );
  }

  if (state === "REVIEW_REQUIRED") {
    return (
      <div className="border border-amber-200 rounded-xl p-5 bg-amber-50 space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl">⚠️</span>
          <p className="font-semibold text-amber-800">Manual Review Required</p>
        </div>
        <p className="text-sm text-amber-700 ml-9">
          Liveness check inconclusive. An organizer will verify your registration.
          Your registration is still active — this won't delay your participation.
        </p>
      </div>
    );
  }

  return null;
}
