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

  const shareCard = async () => {
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
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">

      {/* CARD */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6">

        {/* HEADER */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold">
            {kidName}
          </h1>
          <p className="text-gray-500 text-sm">
            Game Summary
          </p>
        </div>

        {/* BIG STATS */}
        <div className="grid grid-cols-2 gap-4 text-center mb-6">

          <div className="bg-green-100 rounded-xl p-4">
            <p className="text-sm text-gray-600">HITS</p>
            <p className="text-2xl font-bold">{hits}</p>
          </div>

          <div className="bg-red-100 rounded-xl p-4">
            <p className="text-sm text-gray-600">OUTS</p>
            <p className="text-2xl font-bold">{outs}</p>
          </div>

          <div className="bg-blue-100 rounded-xl p-4 col-span-2">
            <p className="text-sm text-gray-600">AVG</p>
            <p className="text-2xl font-bold">{avg}</p>
          </div>

        </div>

        {/* BREAKDOWN */}
        <div className="text-sm space-y-1 mb-6">

          <p className="font-semibold">Hits</p>
          <p>Single: {stats.single}</p>
          <p>Double: {stats.double}</p>
          <p>Triple: {stats.triple}</p>
          <p>Home Run: {stats.homerun}</p>

          <hr className="my-2" />

          <p className="font-semibold">Outs</p>
          <p>K Swing: {stats.strikeout_swinging}</p>
          <p>K Looking: {stats.strikeout_looking}</p>
          <p>Ground Out: {stats.ground_out}</p>
          <p>Fly Out: {stats.fly_out}</p>
          <p>Other Out: {stats.other_out}</p>

        </div>

        {/* SHARE BUTTON */}
        <button
          onClick={shareCard}
          className="w-full bg-purple-600 text-white py-3 rounded-xl font-semibold"
        >
          Share Game Card
        </button>

      </div>
    </div>
  );
}