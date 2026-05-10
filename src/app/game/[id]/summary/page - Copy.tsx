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
  }, []);

  if (!stats) return <div className="p-6">Loading summary...</div>;

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

  const shareSummary = async () => {
    const url = `${window.location.origin}/game/${gameId}/summary`;

    if (navigator.share) {
      await navigator.share({
        title: `${kidName} Game Summary`,
        url,
      });
    } else {
      await navigator.clipboard.writeText(url);
      alert("Summary link copied!");
    }
  };

  return (
    <div className="min-h-screen p-6 max-w-xl mx-auto">

      {/* HEADER CARD */}
      <div className="border rounded p-4 mb-4 bg-white shadow">
        <h1 className="text-2xl font-bold">
          {kidName} - Game Summary
        </h1>

        <p className="text-gray-500">
          Game ID: {gameId}
        </p>
      </div>

      {/* SHARE */}
      <button
        onClick={shareSummary}
        className="bg-purple-600 text-white px-4 py-2 rounded mb-4"
      >
        Share Summary
      </button>

      {/* SUMMARY CARD */}
      <div className="border rounded p-4 space-y-2">

        <h2 className="font-semibold text-lg">Hits</h2>
        <p>Singles: {stats.single}</p>
        <p>Doubles: {stats.double}</p>
        <p>Triples: {stats.triple}</p>
        <p>Home Runs: {stats.homerun}</p>

        <hr />

        <h2 className="font-semibold text-lg">Outs</h2>
        <p>K Swinging: {stats.strikeout_swinging}</p>
        <p>K Looking: {stats.strikeout_looking}</p>
        <p>Ground Outs: {stats.ground_out}</p>
        <p>Fly Outs: {stats.fly_out}</p>
        <p>Other Outs: {stats.other_out}</p>

        <hr />

        <h2 className="font-semibold text-lg">Totals</h2>
        <p>Hits: {hits}</p>
        <p>Outs: {outs}</p>
        <p>At Bats: {atBats}</p>
        <p>AVG: {avg}</p>
      </div>

    </div>
  );
}