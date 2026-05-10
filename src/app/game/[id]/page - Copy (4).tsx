"use client";

import { useEffect, useState } from "react";
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

export default function GamePage() {
  const params = useParams();
  const gameId = params.id as string;

  const gameRef = doc(db, "games", gameId);

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

  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<string[]>([]);

  // Initialize game doc
  useEffect(() => {
    const init = async () => {
      await setDoc(
        gameRef,
        {
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
          comments: [],
        },
        { merge: true }
      );
    };

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Realtime listener
  useEffect(() => {
    const unsub = onSnapshot(gameRef, (snap) => {
      const data = snap.data();
      if (!data) return;

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
    });

    return () => unsub();
  }, []);

  const addStat = async (key: keyof Stats) => {
    await updateDoc(gameRef, {
      [key]: increment(1),
    });
  };

  const addComment = async () => {
    if (!comment.trim()) return;

    await updateDoc(gameRef, {
      comments: arrayUnion(comment),
    });

    setComment("");
  };

  // SHARE FUNCTION
  const shareGame = async () => {
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Youth Sports Live Game",
          text: "Follow this live game!",
          url,
        });
      } catch (err) {
        console.log("Share cancelled");
      }
    } else {
      await navigator.clipboard.writeText(url);
      alert("Game link copied to clipboard!");
    }
  };

  const hits =
    stats.single +
    stats.double +
    stats.triple +
    stats.homerun;

  const outs =
    stats.strikeout_swinging +
    stats.strikeout_looking +
    stats.ground_out +
    stats.fly_out +
    stats.other_out;

  const atBats = hits + outs;

  const avg =
    atBats > 0 ? (hits / atBats).toFixed(3) : "0.000";

  return (
    <div className="min-h-screen p-6 max-w-xl mx-auto">

      <h1 className="text-2xl font-bold mb-2">Live Game</h1>

      {/* SHARE BUTTON */}
      <button
        onClick={shareGame}
        className="bg-purple-600 text-white px-4 py-2 rounded mb-4"
      >
        Share Game
      </button>

      <p className="text-gray-500 mb-4">
        Game ID: {gameId}
      </p>

      {/* HITS */}
      <h2 className="font-semibold mb-2">Hits</h2>
      <div className="grid grid-cols-2 gap-2 mb-4">
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

      {/* STATS */}
      <div className="border p-4 rounded mb-6">
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