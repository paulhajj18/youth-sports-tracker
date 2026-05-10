"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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

  const [kidName, setKidName] = useState("Loading...");
  const [stats, setStats] = useState<Stats | null>(null);

  const [comments, setComments] = useState<Comment[]>([]);
  const [log, setLog] = useState<ActionLog[]>([]);
  const [comment, setComment] = useState("");

  const feedRef = useRef<HTMLDivElement>(null);

  // 🔥 LIVE SYNC
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
      setLog(data.log || []);
    });

    return () => unsub();
  }, []);

  // 🔥 AUTO SCROLL (GameChanger feel)
  useEffect(() => {
    feedRef.current?.scrollTo({
      top: feedRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [comments]);

  // ADD STAT
  const addStat = async (key: keyof Stats) => {
    await updateDoc(gameRef, {
      [key]: increment(1),
      log: arrayUnion({ type: key, timestamp: Date.now() }),
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

  // COMMENT (now structured like GameChanger)
  const addComment = async () => {
    if (!comment.trim()) return;

    const newComment: Comment = {
      text: comment,
      timestamp: Date.now(),
    };

    await updateDoc(gameRef, {
      comments: arrayUnion(newComment),
    });

    setComment("");
  };

  const formatTime = (ts: number) => {
    const date = new Date(ts);
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const hits = useMemo(() => {
    if (!stats) return 0;
    return (
      stats.single +
      stats.double +
      stats.triple +
      stats.homerun
    );
  }, [stats]);

  const outs = useMemo(() => {
    if (!stats) return 0;
    return (
      stats.strikeout_swinging +
      stats.strikeout_looking +
      stats.ground_out +
      stats.fly_out +
      stats.other_out
    );
  }, [stats]);

  if (!stats) return <div className="p-6">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6 max-w-xl mx-auto text-black">

      {/* HEADER */}
      <h1 className="text-2xl font-bold mb-1">
        Live Game for {kidName}
      </h1>

      <p className="text-gray-500 mb-4">
        Game ID: {gameId}
      </p>

      {/* ACTIONS */}
      {!isViewer && (
        <div className="flex gap-2 mb-4">
          <button
            onClick={undoLast}
            className="bg-black text-white px-3 py-2 rounded"
          >
            Undo
          </button>
        </div>
      )}

      {/* HITS / OUTS QUICK STATS */}
      <div className="grid grid-cols-2 gap-3 mb-6">

        <div className="bg-white border rounded-xl p-4 text-center">
          <p className="text-gray-500 text-sm">Hits</p>
          <p className="text-2xl font-bold">{hits}</p>
        </div>

        <div className="bg-white border rounded-xl p-4 text-center">
          <p className="text-gray-500 text-sm">Outs</p>
          <p className="text-2xl font-bold">{outs}</p>
        </div>

      </div>

      {/* COMMENT FEED (GAMECHANGER STYLE) */}
      <div
        ref={feedRef}
        className="bg-white border rounded-xl p-3 h-80 overflow-y-auto space-y-2"
      >

        {comments.length === 0 && (
          <p className="text-gray-400 text-sm text-center mt-10">
            No comments yet
          </p>
        )}

        {comments.map((c, i) => (
          <div
            key={i}
            className="border rounded-lg p-2 bg-gray-50"
          >
            <div className="text-sm text-black">
              {c.text}
            </div>

            <div className="text-xs text-gray-500 mt-1">
              {formatTime(c.timestamp)}
            </div>
          </div>
        ))}

      </div>

      {/* INPUT */}
      {!isViewer && (
        <div className="flex gap-2 mt-3">
          <input
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="border p-2 flex-1 rounded"
            placeholder="Add live update..."
          />

          <button
            onClick={addComment}
            className="bg-blue-600 text-white px-3 rounded"
          >
            Send
          </button>
        </div>
      )}

      {/* ACTION BUTTONS */}
      {!isViewer && (
        <div className="grid grid-cols-2 gap-2 mt-4">

          <button onClick={() => addStat("single")} className="bg-green-600 text-white p-2 rounded">
            Single
          </button>

          <button onClick={() => addStat("double")} className="bg-green-700 text-white p-2 rounded">
            Double
          </button>

          <button onClick={() => addStat("strikeout_swinging")} className="bg-red-600 text-white p-2 rounded">
            K Swing
          </button>

          <button onClick={() => addStat("strikeout_looking")} className="bg-red-700 text-white p-2 rounded">
            K Looking
          </button>

        </div>
      )}

    </div>
  );
}