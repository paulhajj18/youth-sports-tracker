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

      {/* HEADER */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-5 shadow-lg mb-5">
        <p className="text-sm opacity-80 mb-1">
          Game Summary for :
        </p>

        <h1 className="text-3xl font-bold">
          {kidName}
        </h1>

        <p className="text-sm opacity-75 mt-1">
          {new Date().toLocaleDateString()}
        </p>
      </div>

      {/* TOP STATS */}
      <div className="grid grid-cols-2 gap-3 mb-5">

        <div className="bg-green-600 rounded-xl p-4 shadow">
          <p className="text-sm opacity-80">
            Hits
          </p>

          <p className="text-3xl font-bold">
            {hits}
          </p>
        </div>

        <div className="bg-red-600 rounded-xl p-4 shadow">
          <p className="text-sm opacity-80">
            Outs
          </p>

          <p className="text-3xl font-bold">
            {outs}
          </p>
        </div>

        <div className="bg-slate-800 rounded-xl p-4 shadow border border-slate-700">
          <p className="text-sm opacity-80">
            At Bats
          </p>

          <p className="text-3xl font-bold">
            {atBats}
          </p>
        </div>

        <div className="bg-yellow-500 text-black rounded-xl p-4 shadow">
          <p className="text-sm opacity-70">
            AVG
          </p>

          <p className="text-3xl font-bold">
            {avg}
          </p>
        </div>

      </div>

      {/* BREAKDOWN */}
      <div className="bg-slate-800 rounded-2xl p-5 shadow-lg">

        <h2 className="text-xl font-bold mb-4">
          Stat Breakdown
        </h2>

        {/* HITS */}
        <div className="mb-6">
          <p className="text-green-400 font-semibold mb-3">
            Hits
          </p>

          <div className="flex flex-wrap gap-2">

            <div className="bg-green-700 px-3 py-2 rounded-full text-sm">
              Singles: {stats.single}
            </div>

            <div className="bg-green-700 px-3 py-2 rounded-full text-sm">
              Doubles: {stats.double}
            </div>

            <div className="bg-green-700 px-3 py-2 rounded-full text-sm">
              Triples: {stats.triple}
            </div>

            <div className="bg-yellow-500 text-black px-3 py-2 rounded-full text-sm font-semibold">
              HR: {stats.homerun}
            </div>

          </div>
        </div>

        {/* OUTS */}
        <div>
          <p className="text-red-400 font-semibold mb-3">
            Outs
          </p>

          <div className="flex flex-wrap gap-2">

            <div className="bg-red-700 px-3 py-2 rounded-full text-sm">
              K Swing: {stats.strikeout_swinging}
            </div>

            <div className="bg-red-700 px-3 py-2 rounded-full text-sm">
              K Looking: {stats.strikeout_looking}
            </div>

            <div className="bg-slate-700 px-3 py-2 rounded-full text-sm">
              Ground Out: {stats.ground_out}
            </div>

            <div className="bg-slate-700 px-3 py-2 rounded-full text-sm">
              Fly Out: {stats.fly_out}
            </div>

            <div className="bg-slate-700 px-3 py-2 rounded-full text-sm">
              Other Out: {stats.other_out}
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}