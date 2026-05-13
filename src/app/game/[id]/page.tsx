"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";

import { db } from "@/lib/firebase";

import {
  doc,
  onSnapshot,
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

type ActionLog = {
  type: keyof Stats;
  timestamp: number;
};

export default function GamePage() {
  const params = useParams();
  const searchParams = useSearchParams();

  const gameId = params.id as string;
  const isViewer = searchParams.get("view") === "true";

  const gameRef = doc(db, "games", gameId);

  const [kidName, setKidName] = useState("");


  const [teamName, setTeamName] =
    useState("");

  const [opponentName, setOpponentName] =
    useState("");


  const [ourScore, setOurScore] = useState(0);
  const [theirScore, setTheirScore] =
    useState(0);

  const [inning, setInning] = useState(1);

  const [stats, setStats] = useState<Stats>({
    single: 0,
    double: 0,
    triple: 0,
    homerun: 0,

hit_by_pitch: 0,
reached_on_error: 0,
sac_fly: 0,

    walk: 0,
    rbi: 0,
    stolen_base: 0,
    run_scored: 0,

    strikeout_swinging: 0,
    strikeout_looking: 0,

    ground_out: 0,
    fly_out: 0,
    other_out: 0,
  });

  const [comments, setComments] = useState<
    string[]
  >([]);

  const [log, setLog] = useState<ActionLog[]>(
    []
  );

  const [comment, setComment] = useState("");

  const [activeButton, setActiveButton] =
    useState("");

  // LIVE SYNC
  useEffect(() => {
    const unsub = onSnapshot(gameRef, (snap) => {
      const data = snap.data();

      if (!data) return;

      setKidName(data.kidName || "Player");


  setTeamName(
    data.teamName ?? ""
  );

  setOpponentName(
    data.opponentName ?? ""
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

hit_by_pitch:
  data.hit_by_pitch || 0,

reached_on_error:
  data.reached_on_error || 0,

sac_fly:
  data.sac_fly || 0,

        stolen_base:
          data.stolen_base || 0,

        run_scored:
          data.run_scored || 0,

        strikeout_swinging:
          data.strikeout_swinging || 0,

        strikeout_looking:
          data.strikeout_looking || 0,

        ground_out:
          data.ground_out || 0,

        fly_out: data.fly_out || 0,

        other_out:
          data.other_out || 0,
      });

      setComments(data.comments || []);

      setLog(data.log || []);
    });

    return () => unsub();
  }, []);

  // COMMENTARY
  const commentaryMap: Record<
    keyof Stats,
    string
  > = {
    single: `${kidName} rips a single!`,
    double: `${kidName} smashes a double!`,
    triple: `${kidName} blasts a triple!`,
    homerun: `${kidName} launches a HOME RUN!`,

    walk: `${kidName} draws a walk.`,

    rbi: `${kidName} picks up an RBI!`,

    hit_by_pitch:
        `Ooof! ${kidName} is hit by the pitch.`,

    reached_on_error:
       `${kidName} reaches on an error!`,

    sac_fly:
       `${kidName} lifts a sacrifice fly!`,

    stolen_base: `${kidName} steals a base!`,

    run_scored: `${kidName} scores a run!`,

    strikeout_swinging:
      `${kidName} strikes out swinging.`,

    strikeout_looking:
      `${kidName} strikes out looking.`,

    ground_out: `${kidName} grounds out.`,

    fly_out: `${kidName} flies out.`,

    other_out: `${kidName} is retired.`,
  };

  // BUTTON FLASH
  const triggerFlash = (name: string) => {
    setActiveButton(name);

    setTimeout(() => {
      setActiveButton("");
    }, 200);
  };

  // ADD STAT
  const addStat = async (key: keyof Stats) => {
    triggerFlash(key);

    await updateDoc(gameRef, {
      [key]: increment(1),

      comments: arrayUnion(
        commentaryMap[key]
      ),

      log: arrayUnion({
        type: key,
        timestamp: Date.now(),
      }),
    });
  };

  // SCORE CHANGES
  const changeOurScore = async (
    amount: number
  ) => {
    const newScore = Math.max(
      0,
      ourScore + amount
    );

    setOurScore(newScore);

    await updateDoc(gameRef, {
      ourScore: newScore,

      comments: arrayUnion(
        `${teamName} score updated: ${newScore}`
      ),
    });
  };

  const changeTheirScore = async (
    amount: number
  ) => {
    const newScore = Math.max(
      0,
      theirScore + amount
    );

    setTheirScore(newScore);

    await updateDoc(gameRef, {
      theirScore: newScore,

      comments: arrayUnion(
        `${opponentName} score updated: ${newScore}`
      ),
    });
  };

  const changeInning = async (
    amount: number
  ) => {
    const newInning = Math.max(
      1,
      inning + amount
    );

    setInning(newInning);

    await updateDoc(gameRef, {
      inning: newInning,

      comments: arrayUnion(
        `Now entering inning ${newInning}.`
      ),
    });
  };

  // UNDO
  const undoLast = async () => {
    const last = log[log.length - 1];

    if (!last) return;

    await updateDoc(gameRef, {
      [last.type]: increment(-1),

      log: log.slice(0, -1),
    });
  };

  // COMMENT
  const addComment = async () => {
    if (!comment.trim()) return;

    await updateDoc(gameRef, {
      comments: arrayUnion(comment),
    });

    setComment("");
  };

  // CALCULATIONS
  const hits = useMemo(
    () =>
      stats.single +
      stats.double +
      stats.triple +
      stats.homerun,
    [stats]
  );

  const outs = useMemo(
    () =>
 stats.strikeout_swinging +
  stats.strikeout_looking +
  stats.ground_out +
  stats.fly_out +
  stats.other_out +
  stats.sac_fly,
    [stats]
  );

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

  // SHARE
  const shareGame = () => {
    const url =
      `${window.location.origin}/game/${gameId}?view=true`;

    if (navigator.share) {
      navigator.share({
        title: `Live Game for ${kidName}`,
        text: "Follow this live game!",
        url,
      });
    } else {
      navigator.clipboard.writeText(url);

      alert("Read-only link copied!");
    }
  };

  const goToSummary = () => {
    window.location.href =
      `/game/${gameId}/summary`;
  };

  const buttonClass = (
    key: string,
    base: string
  ) =>
    `${base} transition-all duration-150 ${
      activeButton === key
        ? "scale-95 brightness-125"
        : ""
    }`;

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 max-w-xl mx-auto">

      {/* HEADER */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-2xl p-5 shadow-lg mb-4">

        <p className="text-sm opacity-80">
          Now Tracking Live Stats for
        </p>

        <h1 className="text-3xl font-bold">
          {kidName || "Player"}
        </h1>

      </div>

      {/* SCOREBOARD */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-4">

        <div className="grid grid-cols-3 gap-4 text-center">

          {/* OUR TEAM */}
          <div>

            {!isViewer ? (
              

<input
  value={teamName}
  placeholder="Our Team Name"
  onChange={(e) => {
    setTeamName(e.target.value);
  }}
  onBlur={async () => {
    await updateDoc(gameRef, {
      teamName,
    });
  }}
  className="
    bg-transparent
    text-center
    text-base
    font-bold
    text-green-300
    border-b
    border-slate-600
    outline-none
    w-full
    mb-1
    placeholder:text-slate-500
  "
/>


            ) : (
              <p className="text-base font-bold text-green-300 mb-1">
                {teamName}
              </p>
            )}

            <div className="text-3xl font-bold">
              {ourScore}
            </div>

            {!isViewer && (
              <div className="flex justify-center gap-2 mt-2">

                <button
                  onClick={() =>
                    changeOurScore(-1)
                  }
                  className="bg-slate-700 px-2 rounded"
                >
                  -
                </button>

                <button
                  onClick={() =>
                    changeOurScore(1)
                  }
                  className="bg-green-600 px-2 rounded"
                >
                  +
                </button>

              </div>
            )}

          </div>

          {/* INNING */}
          <div>

            <p className="text-sm text-slate-400 mb-1">
              Inning
            </p>

            <div className="text-3xl font-bold">
              {inning}
            </div>

            {!isViewer && (
              <div className="flex justify-center gap-2 mt-2">

                <button
                  onClick={() =>
                    changeInning(-1)
                  }
                  className="bg-slate-700 px-2 rounded"
                >
                  -
                </button>

                <button
                  onClick={() =>
                    changeInning(1)
                  }
                  className="bg-blue-600 px-2 rounded"
                >
                  +
                </button>

              </div>
            )}

          </div>

          {/* OTHER TEAM */}
          <div>

            {!isViewer ? (
             

 <input
  value={opponentName}
  placeholder="Other Team Name"
  onChange={(e) => {
    setOpponentName(e.target.value);
  }}
  onBlur={async () => {
    await updateDoc(gameRef, {
      opponentName,
    });
  }}
  className="
    bg-transparent
    text-center
    text-base
    font-bold
    text-red-300
    border-b
    border-slate-600
    outline-none
    w-full
    mb-1
    placeholder:text-slate-500
  "
/>


            ) : (
              <p className="text-base font-bold text-red-300 mb-1">
                {opponentName}
              </p>
            )}

            <div className="text-3xl font-bold">
              {theirScore}
            </div>

            {!isViewer && (
              <div className="flex justify-center gap-2 mt-2">

                <button
                  onClick={() =>
                    changeTheirScore(-1)
                  }
                  className="bg-slate-700 px-2 rounded"
                >
                  -
                </button>

                <button
                  onClick={() =>
                    changeTheirScore(1)
                  }
                  className="bg-red-600 px-2 rounded"
                >
                  +
                </button>

              </div>
            )}

          </div>

        </div>

      </div>

      {/* ACTIONS */}
      {!isViewer && (
        <div className="flex flex-wrap justify-center gap-2 mb-4">

          <button
            onClick={shareGame}
            className="bg-purple-600 text-white px-3 py-2 rounded-xl"
          >
            Share Live!
          </button>

          <button
            onClick={undoLast}
            className="bg-pink-600 text-white px-3 py-2 rounded-xl"
          >
            Undo ↶
          </button>

          <button
            onClick={goToSummary}
            className="bg-blue-600 text-white px-3 py-2 rounded-xl"
          >
            View Summary
          </button>

        </div>
      )}

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
        RUNS
      </p>

      <p className="text-sm font-bold">
        {stats.run_scored}
      </p>
    </div>

    {/* HITS */}
    <div className="bg-green-700 rounded-xl p-2">
      <p className="text-[11px] opacity-80">
        HITS
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
          stats.strikeout_swinging +
          stats.strikeout_looking
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

</div>

      {/* LIVE STAT BREAKDOWN */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-5">

        <h2 className="text-sm font-bold text-slate-300 mb-3">
          Live Stat Breakdown for {kidName}
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
            Stole Base: {stats.stolen_base}
          </div>

          <div className="bg-pink-700 px-3 py-1 rounded-full text-xs">
            RUN: {stats.run_scored}
          </div>
<div className="bg-cyan-800 px-3 py-1 rounded-full text-xs">
  Hit By Pitch: {stats.hit_by_pitch}
</div>

<div className="bg-orange-700 px-3 py-1 rounded-full text-xs">
  Reached On Err: {stats.reached_on_error}
</div>

<div className="bg-red-800 px-3 py-1 rounded-full text-xs">
  Sac Fly: {stats.sac_fly}
</div>
        </div>

        <div className="flex flex-wrap gap-2">

          <div className="bg-red-500 px-3 py-1 rounded-full text-xs">
            K Swing:
            {" "}
            {stats.strikeout_swinging}
          </div>

          <div className="bg-red-600 px-3 py-1 rounded-full text-xs">
            K Looking:
            {" "}
            {stats.strikeout_looking}
          </div>

          <div className="bg-red-700 px-3 py-1 rounded-full text-xs">
            Ground Out:
            {" "}
            {stats.ground_out}
          </div>

          <div className="bg-rose-800 px-3 py-1 rounded-full text-xs">
            Fly Out:
            {" "}
            {stats.fly_out}
          </div>

          <div className="bg-red-950 px-3 py-1 rounded-full text-xs">
            Other:
            {" "}
            {stats.other_out}
          </div>

        </div>

      </div>

 {/* HIT BUTTONS */}
{!isViewer && (
  <>
    <h2 className="font-semibold text-sm mb-2 text-green-400">
      Hits
    </h2>

    <div className="grid grid-cols-3 gap-2 mb-5">

      <button
        onClick={() =>
          addStat("single")
        }
        className={buttonClass(
          "single",
          "bg-green-600 text-white p-2 text-sm rounded-xl"
        )}
      >
        Single
      </button>

      <button
        onClick={() =>
          addStat("double")
        }
        className={buttonClass(
          "double",
          "bg-green-700 text-white p-2 text-sm rounded-xl"
        )}
      >
        Double
      </button>

      <button
        onClick={() =>
          addStat("triple")
        }
        className={buttonClass(
          "triple",
          "bg-green-800 text-white p-2 text-sm rounded-xl"
        )}
      >
        Triple
      </button>

      <button
        onClick={() =>
          addStat("homerun")
        }
        className={buttonClass(
          "homerun",
          "bg-yellow-500 text-black font-bold p-2 text-sm rounded-xl"
        )}
      >
        HR
      </button>

      <button
        onClick={() =>
          addStat("hit_by_pitch")
        }
        className={buttonClass(
          "hit_by_pitch",
          "bg-cyan-800 text-white p-2 text-sm rounded-xl"
        )}
      >
        Hit By Pitch
      </button>

      <button
        onClick={() =>
          addStat(
            "reached_on_error"
          )
        }
        className={buttonClass(
          "reached_on_error",
          "bg-orange-700 text-white p-2 text-sm rounded-xl"
        )}
      >
        Reached On Err
      </button>

    </div>

    {/* EXTRA */}
    <h2 className="font-semibold text-sm mb-2 text-cyan-400">
      Extra Stats
    </h2>

    <div className="grid grid-cols-3 gap-2 mb-5">

      <button
        onClick={() =>
          addStat("walk")
        }
        className={buttonClass(
          "walk",
          "bg-cyan-700 text-white p-2 text-sm rounded-xl"
        )}
      >
        Walked
      </button>

      <button
        onClick={() =>
          addStat("rbi")
        }
        className={buttonClass(
          "rbi",
          "bg-blue-700 text-white p-2 text-sm rounded-xl"
        )}
      >
        RBI
      </button>

      <button
        onClick={() =>
          addStat("stolen_base")
        }
        className={buttonClass(
          "stolen_base",
          "bg-indigo-700 text-white p-2 text-sm rounded-xl"
        )}
      >
        Stole Base
      </button>

      <button
        onClick={() =>
          addStat("run_scored")
        }
        className={buttonClass(
          "run_scored",
          "bg-pink-700 text-white p-2 text-sm rounded-xl"
        )}
      >
        Run
      </button>

    </div>

    {/* OUTS */}
    <h2 className="font-semibold text-sm mb-2 text-red-400">
      Outs
    </h2>

    <div className="grid grid-cols-3 gap-2 mb-5">

      <button
        onClick={() =>
          addStat(
            "strikeout_swinging"
          )
        }
        className={buttonClass(
          "strikeout_swinging",
          "bg-red-500 text-white p-2 text-sm rounded-xl"
        )}
      >
        K Swinging
      </button>

      <button
        onClick={() =>
          addStat(
            "strikeout_looking"
          )
        }
        className={buttonClass(
          "strikeout_looking",
          "bg-red-600 text-white p-2 text-sm rounded-xl"
        )}
      >
        K Looking
      </button>

      <button
        onClick={() =>
          addStat("ground_out")
        }
        className={buttonClass(
          "ground_out",
          "bg-red-700 text-white p-2 text-sm rounded-xl"
        )}
      >
        Ground Out
      </button>

      <button
        onClick={() =>
          addStat("fly_out")
        }
        className={buttonClass(
          "fly_out",
          "bg-rose-800 text-white p-2 text-sm rounded-xl"
        )}
      >
        Fly Out
      </button>

      <button
        onClick={() =>
          addStat("sac_fly")
        }
        className={buttonClass(
          "sac_fly",
          "bg-red-800 text-white p-2 text-sm rounded-xl"
        )}
      >
        Sac Fly
      </button>

      <button
        onClick={() =>
          addStat("other_out")
        }
        className={buttonClass(
          "other_out",
          "bg-red-950 text-white p-2 text-sm rounded-xl"
        )}
      >
        Other Out
      </button>

    </div>
  </>
)}

      {/* COMMENTARY */}
      <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800">

        <h2 className="font-bold text-xl mb-3">
          Live Commentary 🎙️
        </h2>

        {!isViewer && (
          <div className="flex gap-2 mb-4">

            <input
              value={comment}
              onChange={(e) =>
                setComment(e.target.value)
              }
              className="bg-slate-800 border border-slate-700 p-3 flex-1 rounded-xl text-white"
              placeholder="Add commentary..."
            />

            <button
              onClick={addComment}
              className="bg-blue-600 px-4 rounded-xl"
            >
              Send
            </button>

          </div>
        )}

        <div className="space-y-2">

          {comments
            .slice()
            .reverse()
            .map((c, i) => (
              <div
                key={i}
                className="bg-slate-800 rounded-xl p-3 text-sm"
              >
                {c}
              </div>
            ))}

        </div>

      </div>

    </div>
  );
}