"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";

type Stats = {
  single: number;
  double: number;
  triple: number;
  homerun: number;

  strikeout_swinging: number;
  strikeout_looking: number;

  ground_out: number;
  fly_out: number;
  other_out: number;
};

type Comment = {
  text: string;
  timestamp: number;
};

export default function SummaryPage() {
  const params = useParams();
  const gameId = params.id as string;

  const gameRef = doc(db, "games", gameId);

  const [kidName, setKidName] = useState("");
  const [stats, setStats] = useState<Stats | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);

  // 🔥 LIVE DATA
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

        strikeout_swinging: data.strikeout_swinging || 0,
        strikeout_looking: data.strikeout_looking || 0,

        ground_out: data.ground_out || 0,
        fly_out: data.fly_out || 0,
        other_out: data.other_out || 0,
      });

      setComments(data.comments || []);
    });

    return () => unsub();
  }, [gameId]);

  if (!stats) return <div className="p-6">Loading...</div>;

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
  const avg = atBats > 0 ? (hits / atBats).toFixed(3) : "0.000";

  return (
    <div className="min-h-screen bg-white text-black p-6 max-w-xl mx-auto">

      {/* HEADER */}
      <h1 className="text-2xl font-bold mb-1">
        {kidName} - Game Summary
      </h1>

      {/* STATS CARD */}
      <div className="bg-white border rounded-xl p-4 shadow-sm mb-4">

        <p><b>Hits:</b> {hits}</p>
        <p><b>Outs:</b> {outs}</p>
        <p><b>At Bats:</b> {atBats}</p>
        <p><b>AVG:</b> {avg}</p>

        <hr className="my-2" />

        <p className="font-semibold">Breakdown</p>

        <p>Single: {stats.single}</p>
        <p>Double: {stats.double}</p>
        <p>Triple: {stats.triple}</p>
        <p>Home Run: {stats.homerun}</p>

        <p>K Swing: {stats.strikeout_swinging}</p>
        <p>K Looking: {stats.strikeout_looking}</p>
        <p>Ground Out: {stats.ground_out}</p>
        <p>Fly Out: {stats.fly_out}</p>
        <p>Other Out: {stats.other_out}</p>

      </div>

      {/* 🧠 COMMENTS (FIXED GAMECHANGER STYLE) */}
      <div className="bg-white border rounded-xl p-4 shadow-sm">

        <h2 className="font-semibold mb-2">Live Commentary</h2>

        {comments.length === 0 && (
          <p className="text-gray-400 text-sm">
            No comments yet
          </p>
        )}

        <div className="space-y-2">
          {comments.map((c, i) => (
            <div
              key={i}
              className="
                bg-white
                border
                border-gray-200
                rounded-lg
                p-2
                text-sm
                shadow-sm
              "
            >
              <div className="text-black">
                {c.text}
              </div>

              <div className="text-xs text-gray-500 mt-1">
                {new Date(c.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          ))}
        </div>

      </div>

    </div>
  );
}