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

export default function GamePage() {
  const params = useParams();
  const gameId = params.id as string;

  const gameRef = doc(db, "games", gameId);

  const [stats, setStats] = useState({
    single: 0,
    double: 0,
    triple: 0,
    homerun: 0,
    walk: 0,
    strikeout: 0,
    out: 0,
  });

  const [comment, setComment] = useState("");

  const [comments, setComments] = useState<string[]>([]);

  // Initialize game document if missing
  useEffect(() => {
    const initializeGame = async () => {
      await setDoc(
        gameRef,
        {
          single: 0,
          double: 0,
          triple: 0,
          homerun: 0,
          walk: 0,
          strikeout: 0,
          out: 0,
          comments: [],
        },
        { merge: true }
      );
    };

    initializeGame();
  }, []);

  // Realtime listener
  useEffect(() => {
    const unsubscribe = onSnapshot(gameRef, (snapshot) => {
      const data = snapshot.data();

      if (data) {
        setStats({
          single: data.single || 0,
          double: data.double || 0,
          triple: data.triple || 0,
          homerun: data.homerun || 0,
          walk: data.walk || 0,
          strikeout: data.strikeout || 0,
          out: data.out || 0,
        });

        setComments(data.comments || []);
      }
    });

    return () => unsubscribe();
  }, []);

  // Add stat
  const addStat = async (stat: string) => {
    await updateDoc(gameRef, {
      [stat]: increment(1),
    });
  };

  // Add commentary
  const addComment = async () => {
    if (!comment.trim()) return;

    await updateDoc(gameRef, {
      comments: arrayUnion(comment),
    });

    setComment("");
  };

  // Calculated stats
  const totalHits =
    stats.single +
    stats.double +
    stats.triple +
    stats.homerun;

  const atBats =
    totalHits +
    stats.strikeout +
    stats.out;

  const battingAverage =
    atBats > 0
      ? (totalHits / atBats).toFixed(3)
      : "0.000";

  return (
    <div className="min-h-screen p-6 max-w-xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">
        Live Game Tracker
      </h1>

      <p className="text-gray-600 mb-6">
        Game ID: {gameId}
      </p>

      {/* Stat Buttons */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <button
          onClick={() => addStat("single")}
          className="bg-green-600 text-white p-3 rounded"
        >
          Single
        </button>

        <button
          onClick={() => addStat("double")}
          className="bg-green-700 text-white p-3 rounded"
        >
          Double
        </button>

        <button
          onClick={() => addStat("triple")}
          className="bg-green-800 text-white p-3 rounded"
        >
          Triple
        </button>

        <button
          onClick={() => addStat("homerun")}
          className="bg-yellow-600 text-white p-3 rounded"
        >
          Home Run
        </button>

        <button
          onClick={() => addStat("walk")}
          className="bg-blue-600 text-white p-3 rounded"
        >
          Walk
        </button>

        <button
          onClick={() => addStat("strikeout")}
          className="bg-red-600 text-white p-3 rounded"
        >
          Strikeout
        </button>

        <button
          onClick={() => addStat("out")}
          className="bg-gray-700 text-white p-3 rounded col-span-2"
        >
          Out
        </button>
      </div>

      {/* Live Stats */}
      <div className="border rounded p-4 space-y-2">
        <h2 className="text-xl font-semibold mb-2">
          Live Stats
        </h2>

        <p>Singles: {stats.single}</p>
        <p>Doubles: {stats.double}</p>
        <p>Triples: {stats.triple}</p>
        <p>Home Runs: {stats.homerun}</p>
        <p>Walks: {stats.walk}</p>
        <p>Strikeouts: {stats.strikeout}</p>
        <p>Outs: {stats.out}</p>

        <hr className="my-2" />

        <p>Total Hits: {totalHits}</p>
        <p>At Bats: {atBats}</p>
        <p>Batting Average: {battingAverage}</p>
      </div>

      {/* Commentary */}
      <div className="border rounded p-4 mt-6">
        <h2 className="text-xl font-semibold mb-4">
          Live Commentary
        </h2>

        <div className="flex gap-2 mb-4">
          <input
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Enter live update..."
            className="border p-2 rounded flex-1"
          />

          <button
            onClick={addComment}
            className="bg-blue-600 text-white px-4 rounded"
          >
            Send
          </button>
        </div>

        <div className="space-y-2">
          {comments
            .slice()
            .reverse()
            .map((c, index) => (
              <div
                key={index}
                className="bg-gray-100 p-2 rounded"
              >
                {c}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}