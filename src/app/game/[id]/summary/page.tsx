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
strikeout: number;

fielders_choice: number;


  ground_out: number;
  fly_out: number;

};

export default function SummaryPage() {
  const params = useParams();
  const router = useRouter();

  const gameId = params.id as string;

  const gameRef = doc(db, "games", gameId);

  const [kidName, setKidName] = useState("");
  const [gameDate, setGameDate] =  useState("");
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
      setGameDate(data.gameDate || "");
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

strikeout:
  data.strikeout || 0,

fielders_choice:
  data.fielders_choice || 0,

        ground_out: data.ground_out || 0,
        fly_out: data.fly_out || 0,

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
stats.strikeout +
stats.ground_out +
stats.fly_out +
stats.sac_fly

const atBats =
  hits +
stats.strikeout +
stats.ground_out +
stats.fly_out +
stats.fielders_choice +
stats.reached_on_error

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

<p className="text-sm text-slate-300 mt-1">
  Game Date:{" "}
{gameDate
  ? new Date(
      gameDate + "T12:00:00"
    ).toLocaleDateString(
      "en-US",
      {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      }
    )
  : "No game date"}
</p>
          </div>

          <button
            onClick={shareSummary}
            className="bg-white text-black px-3 py-2 rounded-xl text-sm font-semibold"
          >
            Share/Save
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

            <p className="text-3xl font-bold text-white">
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

            <p className="text-3xl font-bold text-white">
              {theirScore}
            </p>
          </div>

        </div>

      </div>

{/* QUICK STATS */}
<div className="space-y-2 mb-4 text-center">

  {/* TOP ROW */}
  <div className="grid grid-cols-4 gap-2">

    {/* AB */}
    <div className="bg-slate-800 rounded-xl p-2">
      <p className="text-[11px] opacity-80">
        AB
      </p>

      <p className="text-sm font-bold">
        {atBats}
      </p>
    </div>

    {/* RUNS */}
    <div className="bg-pink-700 rounded-xl p-2">
      <p className="text-[11px] opacity-80">
        RUN
      </p>

      <p className="text-sm font-bold">
        {stats.run_scored}
      </p>
    </div>

    {/* HITS */}
    <div className="bg-green-700 rounded-xl p-2">
      <p className="text-[11px] opacity-80">
        HIT
      </p>

      <p className="text-sm font-bold">
        {hits}
      </p>
    </div>

    {/* RBI */}
    <div className="bg-blue-700 rounded-xl p-2">
      <p className="text-[11px] opacity-80">
        RBI
      </p>

      <p className="text-sm font-bold">
        {stats.rbi}
      </p>
    </div>

  </div>

  {/* SECOND ROW */}
  <div className="grid grid-cols-5 gap-2">

    {/* HR */}
    <div className="bg-yellow-500 text-black rounded-xl p-2">
      <p className="text-[10px] opacity-80">
        HR
      </p>

      <p className="text-sm font-bold">
        {stats.homerun}
      </p>
    </div>

    {/* WALKS */}
    <div className="bg-cyan-700 rounded-xl p-2">
      <p className="text-[10px] opacity-80">
        BB
      </p>

      <p className="text-sm font-bold">
        {stats.walk}
      </p>
    </div>

    {/* STRIKEOUTS */}
    <div className="bg-red-700 rounded-xl p-2">
      <p className="text-[10px] opacity-80">
        SO
      </p>

      <p className="text-sm font-bold">
        {
          stats.strikeout
        }
      </p>
    </div>

    {/* AVG */}
    <div className="bg-orange-500 text-black rounded-xl p-2">
      <p className="text-[10px] opacity-80">
        AVG
      </p>

      <p className="text-sm font-bold">
        {avg}
      </p>
    </div>

    {/* OBP */}
    <div className="bg-cyan-600 rounded-xl p-2">
      <p className="text-[10px] opacity-80">
        OBP
      </p>

      <p className="text-sm font-bold">
        {obp}
      </p>
    </div>

  </div>
  <h3 className="text-center text-xs text-gray-500 mt-1 tracking-widest opacity-80">
  www.youthsportstracker.com
</h3>
</div>


      {/* STAT BREAKDOWN */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-5">

        <h2 className="text-sm font-bold text-slate-300 mb-3">
          Stat Breakdown for {kidName}
        </h2>

        <div className="flex flex-wrap gap-2 mb-3">

          <div className="bg-green-700 px-3 py-1 rounded-full text-xs">
            1B: {stats.single}
          </div>

          <div className="bg-green-700 px-3 py-1 rounded-full text-xs">
            2B: {stats.double}
          </div>

          <div className="bg-green-700 px-3 py-1 rounded-full text-xs">
            3B: {stats.triple}
          </div>

          <div className="bg-yellow-500 text-black px-3 py-1 rounded-full text-xs font-bold">
            HR: {stats.homerun}
          </div>

          <div className="bg-cyan-700 px-3 py-1 rounded-full text-xs">
            BB: {stats.walk}
          </div>

          <div className="bg-blue-700 px-3 py-1 rounded-full text-xs">
            RBI: {stats.rbi}
          </div>

          <div className="bg-indigo-700 px-3 py-1 rounded-full text-xs">
            SB: {stats.stolen_base}
          </div>

          <div className="bg-pink-700 px-3 py-1 rounded-full text-xs">
            RUN: {stats.run_scored}
          </div>
<div className="bg-cyan-800 px-3 py-1 rounded-full text-xs">
  Hit By Pitch: {stats.hit_by_pitch}
</div>

<div className="bg-orange-700 px-3 py-1 rounded-full text-xs">
  Reach On Err: {stats.reached_on_error}
</div>


        </div>

        <div className="flex flex-wrap gap-2">

<div className="bg-red-600 px-3 py-1 rounded-full text-xs">
  SO: {stats.strikeout}
</div>

          <div className="bg-red-700 px-3 py-1 rounded-full text-xs">
            Ground Out:
            {" "}
            {stats.ground_out}
          </div>

          <div className="bg-rose-800 px-3 py-1 rounded-full text-xs">
            Fly/Line Out:
            {" "}
            {stats.fly_out}
          </div>

<div className="bg-red-800 px-3 py-1 rounded-full text-xs">
  Sac Fly: {stats.sac_fly}
</div>

<div className="bg-orange-800 px-3 py-1 rounded-full text-xs">
  FieldCh: {stats.fielders_choice}
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
  <footer className="text-center text-xs text-gray-500 py-3">
    © 2026 Youth Sports Tracker
  </footer>
    </div>
  );
}