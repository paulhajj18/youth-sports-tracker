"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";

type Stats = {
  single: number;
  double: number;
  triple: number;
  homerun: number;

  walk: number;
  hit_by_pitch: number;
  reached_on_error: number;

  rbi: number;
  stolen_base: number;
  run_scored: number;

  sac_fly: number;

  strikeout_swinging: number;
  strikeout_looking: number;

  ground_out: number;
  fly_out: number;
  other_out: number;
};

export default function SummaryPage() {
  const params = useParams();
  const router = useRouter();

  const gameId = params.id as string;

  const gameRef = doc(db, "games", gameId);

  const [kidName, setKidName] = useState("");
  const [teamName, setTeamName] = useState("Our Team");
  const [opponentName, setOpponentName] = useState("Other Team");

  const [ourScore, setOurScore] = useState(0);
  const [theirScore, setTheirScore] = useState(0);
  const [inning, setInning] = useState(1);

  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    const unsub = onSnapshot(gameRef, (snap) => {
      const data = snap.data();

      if (!data) return;

      setKidName(data.kidName || "Player");

      setTeamName(data.teamName || "Our Team");

      setOpponentName(
        data.opponentName || "Other Team"
      );

      setOurScore(data.ourScore || 0);
      setTheirScore(data.theirScore || 0);
      setInning(data.inning || 1);

      setStats({
        single: data.single || 0,
        double: data.double || 0,
        triple: data.triple || 0,
        homerun: data.homerun || 0,

        walk: data.walk || 0,
        rbi: data.rbi || 0,
        stolen_base: data.stolen_base || 0,
        run_scored: data.run_scored || 0,

hit_by_pitch:
  data.hit_by_pitch || 0,

reached_on_error:
  data.reached_on_error || 0,

sac_fly:
  data.sac_fly || 0,
        strikeout_swinging:
          data.strikeout_swinging || 0,

        strikeout_looking:
          data.strikeout_looking || 0,

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
  stats.other_out +
  stats.sac_fly;

const atBats =
  hits +
  stats.reached_on_error +
  stats.strikeout_swinging +
  stats.strikeout_looking +
  stats.ground_out +
  stats.fly_out +
  stats.other_out;

  const avg =
    atBats > 0
      ? (hits / atBats).toFixed(3)
      : "0.000";

const obp =
  atBats +
    stats.walk +
    stats.hit_by_pitch +
    stats.sac_fly >
  0
    ? (
        (
          hits +
          stats.walk +
          stats.hit_by_pitch
        ) /
        (
          atBats +
          stats.walk +
          stats.hit_by_pitch +
          stats.sac_fly
        )
      ).toFixed(3)
    : "0.000";

  const shareSummary = () => {
    const url = window.location.href;

    if (navigator.share) {
      navigator.share({
        title: `${kidName} Game Summary`,
        text: "Check out this game summary!",
        url,
      });
    } else {
      navigator.clipboard.writeText(url);
      alert("Summary link copied!");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 max-w-xl mx-auto">

      {/* HEADER */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-5 shadow-lg mb-5">

        <div className="flex justify-between items-start">

          <div>
            <p className="text-sm opacity-80 mb-1">
              Game Summary
            </p>

            <h1 className="text-3xl font-bold">
              {kidName}'s stats
            </h1>

            <p className="text-sm opacity-75 mt-1">
              Game Date : {new Date().toLocaleDateString()}
            </p>
          </div>

          <button
            onClick={shareSummary}
            className="bg-white text-black px-3 py-2 rounded-xl text-sm font-semibold"
          >
            Share
          </button>

        </div>

      </div>

      {/* SCOREBOARD */}
      <div className="bg-slate-900 rounded-2xl p-4 mb-5 border border-slate-800">

        <div className="grid grid-cols-3 text-center gap-4">

          <div>
            <p className="text-xs text-slate-400">
              {teamName}
            </p>

            <p className="text-3xl font-bold text-green-400">
              {ourScore}
            </p>
          </div>

          <div>
            <p className="text-xs text-slate-400">
              FINAL
            </p>

            <p className="text-2xl font-bold">
              IN {inning}
            </p>
          </div>

          <div>
            <p className="text-xs text-slate-400">
              {opponentName}
            </p>

            <p className="text-3xl font-bold text-red-400">
              {theirScore}
            </p>
          </div>

        </div>

      </div>

      {/* TOP STATS */}
      <div className="grid grid-cols-3 gap-3 mb-5">

        <div className="bg-green-600 rounded-xl p-4">
          <p className="text-xs opacity-80">Hits</p>
          <p className="text-2xl font-bold">{hits}</p>
        </div>

        <div className="bg-red-600 rounded-xl p-4">
          <p className="text-xs opacity-80">Outs</p>
          <p className="text-2xl font-bold">{outs}</p>
        </div>

        <div className="bg-yellow-500 text-black rounded-xl p-4">
          <p className="text-xs opacity-70">AVG</p>
          <p className="text-2xl font-bold">{avg}</p>
        </div>

      </div>

      {/* ADVANCED */}
      <div className="grid grid-cols-4 gap-2 mb-5">

        <div className="bg-slate-800 rounded-xl p-3 text-center">
          <p className="text-xs text-slate-400">AB</p>
          <p className="font-bold">{atBats}</p>
        </div>

        <div className="bg-cyan-700 rounded-xl p-3 text-center">
          <p className="text-xs text-cyan-100">OBP</p>
          <p className="font-bold">{obp}</p>
        </div>

        <div className="bg-blue-700 rounded-xl p-3 text-center">
          <p className="text-xs text-blue-100">RBI</p>
          <p className="font-bold">{stats.rbi}</p>
        </div>

        <div className="bg-pink-700 rounded-xl p-3 text-center">
          <p className="text-xs text-pink-100">RUNS</p>
          <p className="font-bold">
            {stats.run_scored}
          </p>
        </div>

      </div>

      {/* BREAKDOWN */}
      <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 mb-6">

        <h2 className="text-xl font-bold mb-4">
          Stat Breakdown
        </h2>

        <div className="flex flex-wrap gap-2 mb-5">

          <div className="bg-green-700 px-3 py-1 rounded-full text-sm">
            1B: {stats.single}
          </div>

          <div className="bg-green-700 px-3 py-1 rounded-full text-sm">
            2B: {stats.double}
          </div>

          <div className="bg-green-700 px-3 py-1 rounded-full text-sm">
            3B: {stats.triple}
          </div>

          <div className="bg-yellow-500 text-black px-3 py-1 rounded-full text-sm font-bold">
            HR: {stats.homerun}
          </div>

          <div className="bg-cyan-700 px-3 py-1 rounded-full text-sm">
            BB: {stats.walk}
          </div>

          <div className="bg-indigo-700 px-3 py-1 rounded-full text-sm">
            SB: {stats.stolen_base}
          </div>

        </div>

        <div className="flex flex-wrap gap-2">

        <div className="bg-red-700 px-3 py-1 rounded-full text-sm">
            Ks: {
               stats.strikeout_swinging +
               stats.strikeout_looking
         }
       </div>


          <div className="bg-slate-700 px-3 py-1 rounded-full text-sm">
            Ground Out: {stats.ground_out}
          </div>

          <div className="bg-slate-700 px-3 py-1 rounded-full text-sm">
            Fly Out: {stats.fly_out}
          </div>

          <div className="bg-slate-700 px-3 py-1 rounded-full text-sm">
            Other Out: {stats.other_out}
          </div>

<div className="bg-cyan-800 px-3 py-1 rounded-full text-sm">
  HBP: {stats.hit_by_pitch}
</div>

<div className="bg-orange-700 px-3 py-1 rounded-full text-sm">
  ROE: {stats.reached_on_error}
</div>

<div className="bg-red-800 px-3 py-1 rounded-full text-sm">
  SF: {stats.sac_fly}
</div>

        </div>

      </div>

      {/* START NEW GAME BUTTON */}
      <button
        onClick={() => router.push("/")}
        className="
          w-full
          bg-green-500
          hover:bg-green-600
          transition
          text-white
          font-bold
          text-lg
          p-4
          rounded-2xl
          shadow-lg
        "
      >
        ⚾ Start Tracking A New Game
      </button>

    </div>
  );
}