"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

import { db } from "@/lib/firebase";

import {
  doc,
  onSnapshot,
  setDoc,
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
  const gameId = params.id as string;

  const gameRef = doc(db, "games", gameId);

  const [kidName, setKidName] = useState("Player");

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

  // INIT GAME
  useEffect(() => {
    const init = async () => {
      await setDoc(
        gameRef,
        {
          kidName: "Player",
          ...stats,
          comments: [],
          log: [],
        },
        { merge: true }
      );
    };

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // REALTIME SYNC
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

  // ADD STAT + LOG IT FOR UNDO
  const addStat = async (key: keyof Stats) => {
    await updateDoc(gameRef, {
      [key]: increment(1),
      log: arrayUnion({ type: key, timestamp: Date.now() }),
    });
  };

  // UNDO LAST ACTION
  const undoLast = async () => {
    const last = log[log.length - 1];
    if (!last) return;

    await updateDoc(gameRef, {
      [last.type]: increment(-1),
      log: log.slice(0, -1),
    });
  };

  // COMMENT
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

  const avg = atBats > 0 ? (hits / atBats).toFixed(3) : "0.000";

  return (
    <div className="min-h-screen p-6 max-w-xl mx-auto">

      {/* HEADER */}
      <h1 className="text-2xl font-bold mb-1">
        Live Game for {kidName}
      </h1>

      <p className="text-gray-500 mb-3">
        Game ID: {gameId}
      </p>

      {/* SHARE + UNDO */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => navigator.share?.({
            title: "Live Game",
            url: window.location.href,
          }) || navigator.clipboard.writeText(window.location.href)}
          className="bg-purple-600 text-white px-3 py-2 rounded"
        >
          Share
        </button>

        <button
          onClick={undoLast}
          className="bg-black text-white px-3 py-2 rounded"
        >
          Undo
        </button>
      </div>

      {/* HITS */}
      <h2 className="font-semibold mb-2">Hits</h2>
      <div className="grid grid-cols-2 gap-2 mb-2">
        <button onClick={() => addStat("single")} className="bg-green-600 text-white p-2 rounded">Single</button>
        <button onClick={() => addStat("double")} className="bg-green-700 text-white p-2 rounded">Double</button>
        <button onClick={() => addStat("triple")} className="bg-green-800 text-white p-2 rounded">Triple</button>
        <button onClick={() => addStat("homerun")} className="bg-yellow-600 text-white p-2 rounded">HR</button>
      </div>

      {/* OUTS */}
      <h2 className="font-semibold mb-2">Outs</h2>
      <div className="grid grid-cols-2 gap-2 mb-4">
        <button onClick={() => addStat("strikeout_swinging")} className="bg-red-600 text-white p-2 rounded">K Swing</button>
        <button onClick={() => addStat("strikeout_looking")} className="bg-red-700 text-white p-2 rounded">K Looking</button>
        <button onClick={() => addStat("ground_out")} className="bg-gray-600 text-white p-2 rounded">Ground Out</button>
        <button onClick={() => addStat("fly_out")} className="bg-gray-700 text-white p-2 rounded">Fly Out</button>
        <button onClick={() => addStat("other_out")} className="bg-gray-800 text-white p-2 rounded col-span-2">Other Out</button>
      </div>

      {/* SUMMARY */}
      <div className="border p-4 rounded mb-6">
        <h2 className="font-semibold mb-2">Summary</h2>

        <p><b>Hits:</b></p>
        <p>Single: {stats.single}</p>
        <p>Double: {stats.double}</p>
        <p>Triple: {stats.triple}</p>
        <p>Home Run: {stats.homerun}</p>

        <hr className="my-2" />

        <p><b>Outs:</b></p>
        <p>K Swing: {stats.strikeout_swinging}</p>
        <p>K Looking: {stats.strikeout_looking}</p>
        <p>Ground Out: {stats.ground_out}</p>
        <p>Fly Out: {stats.fly_out}</p>
        <p>Other Out: {stats.other_out}</p>

        <hr className="my-2" />

        <p>Hits: {hits}</p>
        <p>Outs: {outs}</p>
        <p>At Bats: {atBats}</p>
        <p>AVG: {avg}</p>
      </div>

      {/* COMMENTARY */}
      <div className="border p-4 rounded">
        <h2 className="font-semibold mb-2">Live Commentary</h2>

        <div className="flex gap-2 mb-3">
          <input
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="border p-2 flex-1 rounded"
            placeholder="Say something..."
          />
          <button onClick={addComment} className="bg-blue-600 text-white px-3 rounded">
            Send
          </button>
        </div>

        <div className="space-y-1">
          {comments.slice().reverse().map((c, i) => (
            <div key={i} className="bg-gray-100 p-2 rounded text-sm">
              {c}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}