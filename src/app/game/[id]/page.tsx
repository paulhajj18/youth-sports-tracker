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
    strikeout_swinging: 0,
    strikeout_looking: 0,
    ground_out: 0,
    fly_out: 0,
    other_out: 0,
  });

  const [comments, setComments] = useState<string[]>([]);
  const [log, setLog] = useState<ActionLog[]>([]);
  const [comment, setComment] = useState("");

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
        strikeout_swinging: data.strikeout_swinging || 0,
        strikeout_looking: data.strikeout_looking || 0,
        ground_out: data.ground_out || 0,
        fly_out: data.fly_out || 0,
        other_out: data.other_out || 0,
      });

      setComments(data.comments || []);
      setLog(data.log || []);
    });

    return () => unsub();
  }, []);

  const addStat = async (key: keyof Stats) => {
    await updateDoc(gameRef, {
      [key]: increment(1),
      log: arrayUnion({
        type: key,
        timestamp: Date.now(),
      }),
    });
  };

  const undoLast = async () => {
    const last = log[log.length - 1];
    if (!last) return;

    await updateDoc(gameRef, {
      [last.type]: increment(-1),
      log: log.slice(0, -1),
    });
  };

  const addComment = async () => {
    if (!comment.trim()) return;

    await updateDoc(gameRef, {
      comments: arrayUnion(comment),
    });

    setComment("");
  };

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

  const shareGame = () => {
    const url = `${window.location.origin}/game/${gameId}?view=true`;

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
    window.location.href = `/game/${gameId}/summary`;
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4">

      <div className="max-w-3xl mx-auto">

        {/* HEADER */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-5 shadow-2xl mb-5">

          <div className="flex justify-between items-start gap-4">

            <div>
              <p className="text-sm opacity-80 mb-1">
                ⚾ Live Game
              </p>

              <h1 className="text-3xl font-bold">
                {kidName || "Player"}
              </h1>

              <p className="text-sm opacity-75 mt-1 break-all">
                Game ID: {gameId}
              </p>
            </div>

          </div>

        </div>

        {/* ACTIONS */}
        {!isViewer && (
          <div className="grid grid-cols-3 gap-2 mb-5">

            <button
              onClick={shareGame}
              className="bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-2xl font-semibold shadow-lg"
            >
              Share
            </button>

            <button
              onClick={undoLast}
              className="bg-slate-700 hover:bg-slate-600 text-white p-3 rounded-2xl font-semibold shadow-lg"
            >
              Undo
            </button>

            <button
              onClick={goToSummary}
              className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-2xl font-semibold shadow-lg"
            >
              Summary
            </button>

          </div>
        )}

        {/* TOP STATS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">

          <div className="bg-green-600 rounded-2xl p-4 shadow-lg">
            <p className="text-sm opacity-80">
              Hits
            </p>

            <p className="text-3xl font-bold">
              {hits}
            </p>
          </div>

          <div className="bg-red-600 rounded-2xl p-4 shadow-lg">
            <p className="text-sm opacity-80">
              Outs
            </p>

            <p className="text-3xl font-bold">
              {outs}
            </p>
          </div>

          <div className="bg-slate-800 rounded-2xl p-4 shadow-lg border border-slate-700">
            <p className="text-sm opacity-80">
              At Bats
            </p>

            <p className="text-3xl font-bold">
              {atBats}
            </p>
          </div>

          <div className="bg-yellow-500 text-black rounded-2xl p-4 shadow-lg">
            <p className="text-sm opacity-70">
              AVG
            </p>

            <p className="text-3xl font-bold">
              {avg}
            </p>
          </div>

        </div>

        {/* HITS */}
        {!isViewer && (
          <div className="bg-slate-800 rounded-3xl p-5 shadow-xl mb-5">

            <h2 className="text-xl font-bold mb-4 text-green-400">
              Hits
            </h2>

            <div className="grid grid-cols-2 gap-3">

              <button
                onClick={() => addStat("single")}
                className="bg-green-600 hover:bg-green-700 p-4 rounded-2xl font-bold shadow"
              >
                Single
              </button>

              <button
                onClick={() => addStat("double")}
                className="bg-green-700 hover:bg-green-800 p-4 rounded-2xl font-bold shadow"
              >
                Double
              </button>

              <button
                onClick={() => addStat("triple")}
                className="bg-green-800 hover:bg-green-900 p-4 rounded-2xl font-bold shadow"
              >
                Triple
              </button>

              <button
                onClick={() => addStat("homerun")}
                className="bg-yellow-500 hover:bg-yellow-400 text-black p-4 rounded-2xl font-bold shadow"
              >
                Home Run
              </button>

            </div>

          </div>
        )}

        {/* OUTS */}
        {!isViewer && (
          <div className="bg-slate-800 rounded-3xl p-5 shadow-xl mb-5">

            <h2 className="text-xl font-bold mb-4 text-red-400">
              Outs
            </h2>

            <div className="grid grid-cols-2 gap-3">

              <button
                onClick={() => addStat("strikeout_swinging")}
                className="bg-red-600 hover:bg-red-700 p-4 rounded-2xl font-bold shadow"
              >
                K Swing
              </button>

              <button
                onClick={() => addStat("strikeout_looking")}
                className="bg-red-700 hover:bg-red-800 p-4 rounded-2xl font-bold shadow"
              >
                K Looking
              </button>

              <button
                onClick={() => addStat("ground_out")}
                className="bg-slate-700 hover:bg-slate-600 p-4 rounded-2xl font-bold shadow"
              >
                Ground Out
              </button>

              <button
                onClick={() => addStat("fly_out")}
                className="bg-slate-700 hover:bg-slate-600 p-4 rounded-2xl font-bold shadow"
              >
                Fly Out
              </button>

              <button
                onClick={() => addStat("other_out")}
                className="bg-slate-600 hover:bg-slate-500 p-4 rounded-2xl font-bold shadow col-span-2"
              >
                Other Out
              </button>

            </div>

          </div>
        )}

        {/* LIVE COMMENTARY */}
        <div className="bg-slate-800 rounded-3xl p-5 shadow-xl">

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
                className="bg-slate-700 border border-slate-600 p-3 flex-1 rounded-2xl text-white"
                placeholder="Add commentary..."
              />

              <button
                onClick={addComment}
                className="bg-blue-600 hover:bg-blue-700 px-5 rounded-2xl font-semibold"
              >
                Send
              </button>

            </div>
          )}

          {comments.length === 0 && (
            <p className="text-slate-400">
              No commentary yet.
            </p>
          )}

          <div className="space-y-3">

            {comments
              .slice()
              .reverse()
              .map((c, i) => (
                <div
                  key={i}
                  className="bg-slate-700 rounded-2xl p-3 border border-slate-600"
                >
                  {c}
                </div>
              ))}

          </div>

        </div>

      </div>

    </div>
  );
}