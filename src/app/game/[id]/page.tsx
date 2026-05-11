"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";

import { db } from "@/lib/firebase";

import {
  doc,
  onSnapshot,
  updateDoc,
  increment,
  arrayUnion,
} from "firebase/firestore";

type Stats = {
  single: number;
  double: number;
  triple: number;
  homerun: number;
  walk: number;

  rbi: number;
  stolen_base: number;
  run_scored: number;

  strikeout_swinging: number;
  strikeout_looking: number;

  ground_out: number;
  fly_out: number;
  other_out: number;
};

type ActionLog = {
  type: keyof Stats;
  timestamp: number;
};

export default function GamePage() {
  const params = useParams();
  const searchParams = useSearchParams();

  const gameId = params.id as string;
  const isViewer = searchParams.get("view") === "true";

  const gameRef = doc(db, "games", gameId);

  const [kidName, setKidName] = useState("");

  const [stats, setStats] = useState<Stats>({
    single: 0,
    double: 0,
    triple: 0,
    homerun: 0,
    walk: 0,

    rbi: 0,
    stolen_base: 0,
    run_scored: 0,

    strikeout_swinging: 0,
    strikeout_looking: 0,

    ground_out: 0,
    fly_out: 0,
    other_out: 0,
  });

  const [comments, setComments] = useState<string[]>([]);
  const [log, setLog] = useState<ActionLog[]>([]);
  const [comment, setComment] = useState("");

  // LIVE SYNC
  useEffect(() => {
    const unsub = onSnapshot(gameRef, (snap) => {
      const data = snap.data();

      if (!data) return;

      setKidName(data.kidName || "Player");

      setStats({
        single: data.single || 0,
        double: data.double || 0,
        triple: data.triple || 0,
        homerun: data.homerun || 0,
        walk: data.walk || 0,

        rbi: data.rbi || 0,
        stolen_base: data.stolen_base || 0,
        run_scored: data.run_scored || 0,

        strikeout_swinging:
          data.strikeout_swinging || 0,

        strikeout_looking:
          data.strikeout_looking || 0,

        ground_out: data.ground_out || 0,
        fly_out: data.fly_out || 0,
        other_out: data.other_out || 0,
      });

      setComments(data.comments || []);
      setLog(data.log || []);
    });

    return () => unsub();
  }, []);

  // AUTO COMMENTARY
  const commentaryMap: Record<keyof Stats, string> = {
    single: `${kidName} hits a single!`,
    double: `${kidName} rips a double!`,
    triple: `${kidName} smacks a triple!`,
    homerun: `${kidName} CRUSHES a home run!`,
    walk: `${kidName} draws a walk.`,

    rbi: `RBI for ${kidName}!`,
    stolen_base: `${kidName} steals a base!`,
    run_scored: `${kidName} scores a run!`,

    strikeout_swinging:
      `${kidName} strikes out swinging.`,

    strikeout_looking:
      `${kidName} goes down looking.`,

    ground_out: `${kidName} grounds out.`,
    fly_out: `${kidName} flies out.`,
    other_out: `${kidName} is out.`,
  };

  // ADD STAT
  const addStat = async (key: keyof Stats) => {
    await updateDoc(gameRef, {
      [key]: increment(1),

      log: arrayUnion({
        type: key,
        timestamp: Date.now(),
      }),

      comments: arrayUnion(commentaryMap[key]),
    });
  };

  // UNDO
  const undoLast = async () => {
    const last = log[log.length - 1];

    if (!last) return;

    await updateDoc(gameRef, {
      [last.type]: increment(-1),
      log: log.slice(0, -1),
    });
  };

  // ADD COMMENT
  const addComment = async () => {
    if (!comment.trim()) return;

    await updateDoc(gameRef, {
      comments: arrayUnion(comment),
    });

    setComment("");
  };

  // CALCULATIONS
  const hits = useMemo(
    () =>
      stats.single +
      stats.double +
      stats.triple +
      stats.homerun,
    [stats]
  );

  const outs = useMemo(
    () =>
      stats.strikeout_swinging +
      stats.strikeout_looking +
      stats.ground_out +
      stats.fly_out +
      stats.other_out,
    [stats]
  );

  const atBats = hits + outs;

  const avg =
    atBats > 0
      ? (hits / atBats).toFixed(3)
      : "0.000";

  const obpDenominator =
    atBats + stats.walk;

  const obp =
    obpDenominator > 0
      ? (
          (hits + stats.walk) /
          obpDenominator
        ).toFixed(3)
      : "0.000";

  // SHARE
  const shareGame = () => {
    const url =
      `${window.location.origin}/game/${gameId}?view=true`;

    if (navigator.share) {
      navigator.share({
        title: `Live Game for ${kidName}`,
        text: "Follow this live game!",
        url,
      });
    } else {
      navigator.clipboard.writeText(url);
      alert("Read-only link copied!");
    }
  };

  const goToSummary = () => {
    window.location.href =
      `/game/${gameId}/summary`;
  };

  const buttonClass =
    "text-white p-3 rounded-xl font-semibold shadow active:scale-95 transition transform duration-75";

  return (
    <div className="min-h-screen bg-slate-900 text-white p-5 max-w-xl mx-auto">

      {/* HEADER */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-5 shadow-lg mb-5">

        <h1 className="text-3xl font-bold">
          Live Game
        </h1>

        <p className="text-lg opacity-90">
          {kidName || "Player"}
        </p>

      </div>

      {/* ACTIONS */}
      {!isViewer && (
        <div className="flex flex-wrap gap-2 mb-5">

          <button
            onClick={shareGame}
            className="bg-purple-600 px-4 py-2 rounded-xl font-semibold active:scale-95 transition"
          >
            Share
          </button>

          <button
            onClick={undoLast}
            className="bg-black px-4 py-2 rounded-xl font-semibold active:scale-95 transition"
          >
            Undo
          </button>

          <button
            onClick={goToSummary}
            className="bg-blue-600 px-4 py-2 rounded-xl font-semibold active:scale-95 transition"
          >
            View Summary
          </button>

        </div>
      )}

      {/* COMPACT STATS */}
      <div className="bg-slate-800 rounded-2xl p-4 shadow-lg mb-6">

        <div className="grid grid-cols-4 gap-2 text-center text-xs">

          <div className="bg-green-700 rounded-lg p-2">
            <div className="opacity-70">H</div>
            <div className="text-lg font-bold">
              {hits}
            </div>
          </div>

          <div className="bg-red-700 rounded-lg p-2">
            <div className="opacity-70">O</div>
            <div className="text-lg font-bold">
              {outs}
            </div>
          </div>

          <div className="bg-yellow-500 text-black rounded-lg p-2">
            <div className="opacity-70">AVG</div>
            <div className="text-lg font-bold">
              {avg}
            </div>
          </div>

          <div className="bg-blue-700 rounded-lg p-2">
            <div className="opacity-70">OBP</div>
            <div className="text-lg font-bold">
              {obp}
            </div>
          </div>

        </div>

        {/* SECOND ROW */}
        <div className="grid grid-cols-4 gap-2 text-center text-xs mt-2">

          <div className="bg-slate-700 rounded-lg p-2">
            <div className="opacity-70">BB</div>
            <div className="text-lg font-bold">
              {stats.walk}
            </div>
          </div>

          <div className="bg-indigo-700 rounded-lg p-2">
            <div className="opacity-70">RBI</div>
            <div className="text-lg font-bold">
              {stats.rbi}
            </div>
          </div>

          <div className="bg-cyan-700 rounded-lg p-2">
            <div className="opacity-70">SB</div>
            <div className="text-lg font-bold">
              {stats.stolen_base}
            </div>
          </div>

          <div className="bg-pink-700 rounded-lg p-2">
            <div className="opacity-70">RUN</div>
            <div className="text-lg font-bold">
              {stats.run_scored}
            </div>
          </div>

        </div>

      </div>

      {/* HITS */}
      {!isViewer && (
        <>
          <h2 className="font-bold text-lg mb-2">
            Hits
          </h2>

          <div className="grid grid-cols-2 gap-2 mb-5">

            <button
              onClick={() => addStat("single")}
              className={`bg-green-600 ${buttonClass}`}
            >
              Single
            </button>

            <button
              onClick={() => addStat("double")}
              className={`bg-green-700 ${buttonClass}`}
            >
              Double
            </button>

            <button
              onClick={() => addStat("triple")}
              className={`bg-green-800 ${buttonClass}`}
            >
              Triple
            </button>

            <button
              onClick={() => addStat("homerun")}
              className={`bg-yellow-600 ${buttonClass}`}
            >
              Home Run
            </button>

          </div>

          {/* BASE RUNNING */}
          <h2 className="font-bold text-lg mb-2">
            Base Running
          </h2>

          <div className="grid grid-cols-2 gap-2 mb-5">

            <button
              onClick={() => addStat("walk")}
              className={`bg-blue-600 ${buttonClass}`}
            >
              Walk
            </button>

            <button
              onClick={() => addStat("rbi")}
              className={`bg-indigo-600 ${buttonClass}`}
            >
              RBI
            </button>

            <button
              onClick={() => addStat("stolen_base")}
              className={`bg-cyan-600 ${buttonClass}`}
            >
              Stolen Base
            </button>

            <button
              onClick={() => addStat("run_scored")}
              className={`bg-pink-600 ${buttonClass}`}
            >
              Run Scored
            </button>

          </div>

          {/* OUTS */}
          <h2 className="font-bold text-lg mb-2">
            Outs
          </h2>

          <div className="grid grid-cols-2 gap-2 mb-6">

            <button
              onClick={() =>
                addStat("strikeout_swinging")
              }
              className={`bg-red-600 ${buttonClass}`}
            >
              K Swing
            </button>

            <button
              onClick={() =>
                addStat("strikeout_looking")
              }
              className={`bg-red-700 ${buttonClass}`}
            >
              K Looking
            </button>

            <button
              onClick={() => addStat("ground_out")}
              className={`bg-slate-600 ${buttonClass}`}
            >
              Ground Out
            </button>

            <button
              onClick={() => addStat("fly_out")}
              className={`bg-slate-700 ${buttonClass}`}
            >
              Fly Out
            </button>

            <button
              onClick={() => addStat("other_out")}
              className={`bg-slate-800 ${buttonClass} col-span-2`}
            >
              Other Out
            </button>

          </div>
        </>
      )}

      {/* COMMENTARY */}
      <div className="bg-slate-800 rounded-2xl p-5 shadow-lg">

        <h2 className="text-xl font-bold mb-4">
          Live Commentary
        </h2>

        {!isViewer && (
          <div className="flex gap-2 mb-4">

            <input
              value={comment}
              onChange={(e) =>
                setComment(e.target.value)
              }
              className="flex-1 rounded-xl p-3 bg-slate-700 text-white border border-slate-600"
              placeholder="Add commentary..."
            />

            <button
              onClick={addComment}
              className="bg-blue-600 px-4 rounded-xl font-semibold active:scale-95 transition"
            >
              Send
            </button>

          </div>
        )}

        <div className="space-y-2">

          {comments
            .slice()
            .reverse()
            .map((c, i) => (
              <div
                key={i}
                className="bg-slate-700 rounded-xl p-3"
              >
                {c}
              </div>
            ))}

        </div>

      </div>

    </div>
  );
}