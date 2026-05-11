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

export default function SummaryPage() {
  const params = useParams();
  const gameId = params.id as string;

  const gameRef = doc(db, "games", gameId);

  const [kidName, setKidName] = useState("");
  const [stats, setStats] = useState<Stats | null>(null);

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

        strikeout_swinging: data.strikeout_swinging || 0,
        strikeout_looking: data.strikeout_looking || 0,

        ground_out: data.ground_out || 0,
        fly_out: data.fly_out || 0,
        other_out: data.other_out || 0,
      });
    });

    return () => unsub();
  }, [gameId]);

  if (!stats) {
    return (
      <div className="min-h-screen bg-slate-900 text-white p-6">
        Loading...
      </div>
    );
  }

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
    atBats > 0
      ? (hits / atBats).toFixed(3)
      : "0.000";

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 max-w-xl mx-auto">

      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-5 shadow-lg mb-5">

        <p className="text-sm opacity-80 mb-1">
          Game Summary
        </p>

        <h1 className="text-3xl font-bold">
          {kidName}
        </h1>

        <p className="text-sm opacity-75 mt-1">
          {new Date().toLocaleDateString()}
        </p>

      </div>

      <div className="grid grid-cols-2 gap-3 mb-5">

        <div className="bg-green-600 rounded-xl p-4">
          <p className="text-sm">Hits</p>
          <p className="text-3xl font-bold">{hits}</p>
        </div>

        <div className="bg-red-600 rounded-xl p-4">
          <p className="text-sm">Outs</p>
          <p className="text-3xl font-bold">{outs}</p>
        </div>

        <div className="bg-slate-800 rounded-xl p-4">
          <p className="text-sm">At Bats</p>
          <p className="text-3xl font-bold">{atBats}</p>
        </div>

        <div className="bg-yellow-500 text-black rounded-xl p-4">
          <p className="text-sm">AVG</p>
          <p className="text-3xl font-bold">{avg}</p>
        </div>

      </div>

      <div className="bg-slate-800 rounded-2xl p-5">

        <h2 className="text-xl font-bold mb-4">
          Full Stat Breakdown
        </h2>

        <div className="flex flex-wrap gap-2">

          <div className="bg-green-700 px-3 py-2 rounded-full">
            Singles: {stats.single}
          </div>

          <div className="bg-green-700 px-3 py-2 rounded-full">
            Doubles: {stats.double}
          </div>

          <div className="bg-green-700 px-3 py-2 rounded-full">
            Triples: {stats.triple}
          </div>

          <div className="bg-yellow-500 text-black px-3 py-2 rounded-full font-semibold">
            HR: {stats.homerun}
          </div>

          <div className="bg-cyan-600 px-3 py-2 rounded-full">
            Walks: {stats.walk}
          </div>

          <div className="bg-indigo-600 px-3 py-2 rounded-full">
            RBI: {stats.rbi}
          </div>

          <div className="bg-orange-600 px-3 py-2 rounded-full">
            SB: {stats.stolen_base}
          </div>

          <div className="bg-pink-600 px-3 py-2 rounded-full">
            Runs: {stats.run_scored}
          </div>

          <div className="bg-red-700 px-3 py-2 rounded-full">
            K Swing: {stats.strikeout_swinging}
          </div>

          <div className="bg-red-700 px-3 py-2 rounded-full">
            K Looking: {stats.strikeout_looking}
          </div>

          <div className="bg-slate-700 px-3 py-2 rounded-full">
            Ground Out: {stats.ground_out}
          </div>

          <div className="bg-slate-700 px-3 py-2 rounded-full">
            Fly Out: {stats.fly_out}
          </div>

          <div className="bg-slate-700 px-3 py-2 rounded-full">
            Other Out: {stats.other_out}
          </div>

        </div>

      </div>

    </div>
  );
}