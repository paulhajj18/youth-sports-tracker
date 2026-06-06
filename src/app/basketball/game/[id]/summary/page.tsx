"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

type Stats = {
  points: number;
  rebounds: number;
  assists: number;
  steals: number;
  blocks: number;
  turnovers: number;

  fgMade: number;
  fgAttempted: number;

  threeMade: number;
  threeAttempted: number;

  ftMade: number;
  ftAttempted: number;
};

export default function SummaryPage() {
  const params = useParams();

  const gameId = params.id as string;

  const gameRef = doc(
    db,
    "basketballGames",
    gameId
  );

  const [kidName, setKidName] =
    useState("");

  const [gameDate, setGameDate] =
    useState("");

  const [teamName, setTeamName] =
    useState("");

  const [opponentName, setOpponentName] =
    useState("");

  const [homeScore, setHomeScore] =
    useState(0);

  const [awayScore, setAwayScore] =
    useState(0);

  const [quarter, setQuarter] =
    useState(1);

  const [stats, setStats] =
    useState<Stats>({
      points: 0,

      rebounds: 0,
      assists: 0,
      steals: 0,
      blocks: 0,
      turnovers: 0,

      fgMade: 0,
      fgAttempted: 0,

      threeMade: 0,
      threeAttempted: 0,

      ftMade: 0,
      ftAttempted: 0,
    });

  useEffect(() => {
    const unsub = onSnapshot(
      gameRef,
      (snap) => {
        const data = snap.data();

        if (!data) return;

        setKidName(
          data.kidName || "Player"
        );

        setGameDate(
          data.gameDate || ""
        );

        setTeamName(
          data.teamName ?? ""
        );

        setOpponentName(
          data.opponentName ?? ""
        );

        setHomeScore(
          data.homeScore || 0
        );

        setAwayScore(
          data.awayScore || 0
        );

        setQuarter(
          data.quarter || 1
        );

        setStats({
          points:
            data.points || 0,

          rebounds:
            data.rebounds || 0,

          assists:
            data.assists || 0,

          steals:
            data.steals || 0,

          blocks:
            data.blocks || 0,

          turnovers:
            data.turnovers || 0,

          fgMade:
            data.fgMade || 0,

          fgAttempted:
            data.fgAttempted || 0,

          threeMade:
            data.threeMade || 0,

          threeAttempted:
            data.threeAttempted || 0,

          ftMade:
            data.ftMade || 0,

          ftAttempted:
            data.ftAttempted || 0,
        });
      }
    );

    return () => unsub();
  }, []);

  const fgPct =
    stats.fgAttempted > 0
      ? (
          (stats.fgMade /
            stats.fgAttempted) *
          100
        ).toFixed(0)
      : "0";

  const threePct =
    stats.threeAttempted > 0
      ? (
          (stats.threeMade /
            stats.threeAttempted) *
          100
        ).toFixed(0)
      : "0";

  const ftPct =
    stats.ftAttempted > 0
      ? (
          (stats.ftMade /
            stats.ftAttempted) *
          100
        ).toFixed(0)
      : "0";

  const shareSummary = () => {
    const url =
      `${window.location.origin}/basketball/game/${gameId}/summary`;

    if (navigator.share) {
      navigator.share({
        title: `${kidName} Game Summary`,
        text: `Check out ${kidName}'s basketball game summary! 🏀`,
        url,
      });
    } else {
      navigator.clipboard.writeText(
        url
      );

      alert(
        "Summary link copied!"
      );
    }
  };

const getPeriodLabel = (
  quarter: number
) => {
  if (quarter <= 4) {
    return `Q${quarter}`;
  }

  if (quarter === 5) {
    return "OT";
  }

  return `OT${quarter - 4}`;
};


return (
  <div
    className="min-h-screen"
    style={{
      backgroundImage:
        "linear-gradient(rgba(2,6,23,0.90), rgba(2,6,23,0.90)), url('/images/basketball-kids.png')",
      backgroundRepeat: "no-repeat",
      backgroundPosition: "center center",
      backgroundSize: "cover",
      backgroundAttachment: "fixed",
    }}
  >

    <div className="text-white px-2 sm:px-4 max-w-2xl mx-auto">
      {/* HEADER */}

      <div className="bg-gradient-to-r from-green-700 to-emerald-800 rounded-2xl p-5 shadow-lg mb-4">

        <div className="flex justify-between items-start">

          <div>

            <p className="text-sm opacity-80">
              🏀 Game Summary
            </p>

            <h1 className="text-3xl font-bold">
              {kidName || "Player"}'s stats
            </h1>

            <p className="text-sm text-slate-200 mt-2">
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
                : "No Game Date"}
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

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 mb-4">

        <div className="grid grid-cols-3 items-center text-center">

          <div>
            <p className="font-semibold text-sm truncate">
              {teamName || "Your Team"}
            </p>

            <p className="text-3xl font-bold mt-1">
              {homeScore}
            </p>
          </div>

          <div>
            <p className="text-xs text-slate-400">
              QUARTER
            </p>

  <p className="text-2xl font-bold">
    {getPeriodLabel(quarter)}
  </p>
          </div>

          <div>
            <p className="font-semibold text-sm truncate">
              {opponentName ||
                "Opponent"}
            </p>

            <p className="text-3xl font-bold mt-1">
              {awayScore}
            </p>
          </div>

        </div>

      </div>

      {/* STATS */}

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-1 mb-5">

<div className="space-y-2 text-center">

  <h3 className="text-center text-xs text-green-400 mt-2 tracking-widest opacity-80">
    {kidName}'s Final Game Stats
  </h3>

  <div className="grid grid-cols-3 gap-2">

    <StatBox
      label="PTS"
      value={stats.points}
      color="bg-green-700"
    />

    <StatBox
      label="REB"
      value={stats.rebounds}
      color="bg-orange-700"
    />

    <StatBox
      label="AST"
      value={stats.assists}
      color="bg-cyan-700"
    />

    <StatBox
      label="STL"
      value={stats.steals}
      color="bg-indigo-700"
    />

    <StatBox
      label="BLK"
      value={stats.blocks}
      color="bg-purple-700"
    />

    <StatBox
      label="TO"
      value={stats.turnovers}
      color="bg-red-700"
    />

    <StatBox
      label="FG"
      value={`${stats.fgMade}-${stats.fgAttempted}`}
      color="bg-blue-700"
    />

    <StatBox
      label="3PT"
      value={`${stats.threeMade}-${stats.threeAttempted}`}
      color="bg-yellow-600 text-black"
    />

    <StatBox
      label="FT"
      value={`${stats.ftMade}-${stats.ftAttempted}`}
      color="bg-emerald-700"
    />

  </div>

        </div>
  <h3 className="text-center text-xs text-gray-500 mt-1 tracking-widest opacity-80">
  www.youthsportstracker.com
</h3>
      </div>

      <div className="flex justify-center mt-6">

  <button
    onClick={() => {
      window.location.href = "/";
    }}
    className="
      bg-blue-700
      hover:bg-blue-600
      transition
      text-white
      text-sm
      font-semibold
      px-5
      py-3
      rounded-xl
      shadow-lg
    "
  >
    🏀 Youth Sports Tracker Home
  </button>

</div>
      </div>

      <footer className="text-center text-xs text-gray-500 py-4">
        © 2026 Youth Sports Tracker 🏀
      </footer>

    </div>
  );
}

function StatBox({
  label,
  value,
  color,
}: {
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <div
      className={`${color} rounded-xl p-2`}
    >
      <p className="text-[10px] opacity-80">
        {label}
      </p>

      <p className="text-sm font-bold">
        {value}
      </p>
    </div>
  );
}