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
  const [ourTeam, setOurTeam] = useState("Our Team");
  const [otherTeam, setOtherTeam] = useState("Other Team");

  const [inning, setInning] = useState(1);
  const [half, setHalf] = useState("Top");

  const [ourScore, setOurScore] = useState(0);
  const [otherScore, setOtherScore] = useState(0);

  const [stats, setStats] = useState<Stats>({
    single: 0,
    double: 0,
    triple: 0,
    homerun: 0,

    strikeout_swinging: 0,
    strikeout_looking: 0,

    ground_out: 0,
    fly_out: 0,
    other_out: 0,
  });

  const [comments, setComments] = useState<Comment[]>([]);
  const [log, setLog] = useState<ActionLog[]>([]);
  const [comment, setComment] = useState("");

  // LIVE SYNC
  useEffect(() => {
    const unsub = onSnapshot(gameRef, (snap) => {
      const data = snap.data();
      if (!data) return;

      setKidName(data.kidName || "Player");

      setOurTeam(data.ourTeam || "Our Team");
      setOtherTeam(data.otherTeam || "Other Team");

      setInning(data.inning || 1);
      setHalf(data.half || "Top");

      setOurScore(data.ourScore || 0);
      setOtherScore(data.otherScore || 0);

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
      setLog(data.log || []);
    });

    return () => unsub();
  }, []);

  // AUTO COMMENT
  const addAutoComment = async (text: string) => {
    await updateDoc(gameRef, {
      comments: arrayUnion({
        text,
        timestamp: Date.now(),
      }),
    });
  };

  // ADD STAT
  const addStat = async (
    key: keyof Stats,
    autoText: string
  ) => {
    await updateDoc(gameRef, {
      [key]: increment(1),
      log: arrayUnion({
        type: key,
        timestamp: Date.now(),
      }),
    });

    await addAutoComment(autoText);
  };

  // SCORE
  const addRun = async (team: "our" | "other") => {
    if (team === "our") {
      await updateDoc(gameRef, {
        ourScore: increment(1),
      });

      await addAutoComment(
        `${ourTeam} scores!`
      );
    } else {
      await updateDoc(gameRef, {
        otherScore: increment(1),
      });

      await addAutoComment(
        `${otherTeam} scores!`
      );
    }
  };

  // INNING
  const nextInning = async () => {
    let newHalf = half;
    let newInning = inning;

    if (half === "Top") {
      newHalf = "Bottom";
    } else {
      newHalf = "Top";
      newInning += 1;
    }

    await updateDoc(gameRef, {
      inning: newInning,
      half: newHalf,
    });

    await addAutoComment(
      `${newHalf} of the ${newInning} inning`
    );
  };

  const prevInning = async () => {
    let newHalf = half;
    let newInning = inning;

    if (half === "Bottom") {
      newHalf = "Top";
    } else if (inning > 1) {
      newHalf = "Bottom";
      newInning -= 1;
    }

    await updateDoc(gameRef, {
      inning: newInning,
      half: newHalf,
    });
  };

  // MANUAL COMMENT
  const addComment = async () => {
    if (!comment.trim()) return;

    await addAutoComment(comment);
    setComment("");
  };

  // STATS
  const hits = useMemo(() => {
    return (
      stats.single +
      stats.double +
      stats.triple +
      stats.homerun
    );
  }, [stats]);

  const outs = useMemo(() => {
    return (
      stats.strikeout_swinging +
      stats.strikeout_looking +
      stats.ground_out +
      stats.fly_out +
      stats.other_out
    );
  }, [stats]);

  return (
    <div className="min-h-screen bg-gray-100 p-6 max-w-xl mx-auto">

      {/* SCOREBOARD */}
      <div className="bg-white rounded-2xl shadow p-4 mb-4">

        <div className="flex justify-between items-center">

          <div>
            <p className="font-bold">{ourTeam}</p>
            <p className="text-3xl">{ourScore}</p>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-500">
              {half} {inning}
            </p>

            <p className="font-bold">
              {kidName}
            </p>
          </div>

          <div className="text-right">
            <p className="font-bold">{otherTeam}</p>
            <p className="text-3xl">{otherScore}</p>
          </div>

        </div>

      </div>

      {/* INNING CONTROLS */}
      {!isViewer && (
        <div className="flex gap-2 mb-4">

          <button
            onClick={prevInning}
            className="bg-gray-600 text-white px-3 py-2 rounded"
          >
            Inning -
          </button>

          <button
            onClick={nextInning}
            className="bg-gray-800 text-white px-3 py-2 rounded"
          >
            Inning +
          </button>

        </div>
      )}

      {/* SCORE BUTTONS */}
      {!isViewer && (
        <div className="grid grid-cols-2 gap-2 mb-4">

          <button
            onClick={() => addRun("our")}
            className="bg-blue-600 text-white p-3 rounded"
          >
            {ourTeam} Run
          </button>

          <button
            onClick={() => addRun("other")}
            className="bg-red-600 text-white p-3 rounded"
          >
            {otherTeam} Run
          </button>

        </div>
      )}

      {/* HIT BUTTONS */}
      {!isViewer && (
        <div className="grid grid-cols-2 gap-2 mb-4">

          <button
            onClick={() =>
              addStat(
                "single",
                `${kidName} singles!`
              )
            }
            className="bg-green-600 text-white p-2 rounded"
          >
            Single
          </button>

          <button
            onClick={() =>
              addStat(
                "double",
                `${kidName} rips a double!`
              )
            }
            className="bg-green-700 text-white p-2 rounded"
          >
            Double
          </button>

          <button
            onClick={() =>
              addStat(
                "triple",
                `${kidName} legs out a triple!`
              )
            }
            className="bg-green-800 text-white p-2 rounded"
          >
            Triple
          </button>

          <button
            onClick={() =>
              addStat(
                "homerun",
                `💥 ${kidName} crushes a home run!`
              )
            }
            className="bg-yellow-600 text-white p-2 rounded"
          >
            HR
          </button>

        </div>
      )}

      {/* COMMENTARY */}
      <div className="bg-white rounded-2xl shadow p-4">

        <h2 className="font-bold mb-3">
          Live Commentary
        </h2>

        {!isViewer && (
          <div className="flex gap-2 mb-4">

            <input
              value={comment}
              onChange={(e) =>
                setComment(e.target.value)
              }
              placeholder="Add commentary..."
              className="border p-2 rounded flex-1"
            />

            <button
              onClick={addComment}
              className="bg-blue-600 text-white px-3 rounded"
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
                className="
                  bg-white
                  border
                  border-gray-200
                  rounded-xl
                  p-3
                  shadow-sm
                "
              >

                <p className="text-black">
                  {c.text}
                </p>

                <p className="text-xs text-gray-500 mt-1">
                  {new Date(
                    c.timestamp
                  ).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>

              </div>
            ))}

        </div>

      </div>

    </div>
  );
}