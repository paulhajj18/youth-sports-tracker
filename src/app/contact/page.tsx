"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ContactPage() {

  const router = useRouter();

  const [activeButton, setActiveButton] =
    useState("");

const [submitted, setSubmitted] =
  useState(false);

  const triggerFlash = (name: string) => {
    setActiveButton(name);

    setTimeout(() => {
      setActiveButton("");
    }, 180);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-6 overflow-hidden">

      {/* BACKGROUND */}
      <div
        className="absolute inset-0 bg-cover bg-center scale-105"
        style={{
          backgroundImage:
            "url('/images/baseball-kids.png')",
        }}
      />

      {/* DARK OVERLAY */}
      <div className="absolute inset-0 bg-black/70" />

      {/* CONTENT */}
      <div className="relative z-10 w-full max-w-md text-white">

        {/* BACK BUTTON */}
        <button
          onClick={() => {
            triggerFlash("back");

            router.push("/");
          }}
          className={`
            mb-4
            text-sm
            text-gray-300
            hover:text-white
            transition

            ${
              activeButton === "back"
                ? "scale-95 brightness-125"
                : ""
            }
          `}
        >
          ← Back
        </button>

        {/* CARD */}
        <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl shadow-2xl border border-white/10">

          {/* TITLE */}
          <h1 className="text-3xl font-extrabold mb-2 text-center">
            Contact Us
          </h1>

          {/* SUBTITLE */}
          <p className="text-gray-200 text-center text-sm leading-relaxed mb-6">
            Questions, bugs, feature ideas, or feedback?
            <br />
            We'd love to hear from coaches and parents using the app.
          </p>

<form
  onSubmit={async (e) => {

    e.preventDefault();

    triggerFlash("send");

    const formData = new FormData(
      e.currentTarget
    );

    const response = await fetch(
      "https://formspree.io/f/xqejqkrb",
      {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
        },
      }
    );

    if (response.ok) {

      setSubmitted(true);

      (
        e.target as HTMLFormElement
      ).reset();
    }
  }}

  className="space-y-4"
>

  {/* NAME */}
  <input
    type="text"
    name="name"
    placeholder="Your Name (optional)"
    className="
      w-full
      rounded-2xl
      bg-black/30
      border
      border-white/10
      p-3
      text-white
      placeholder:text-gray-400
      outline-none
      focus:border-green-400
    "
  />

  {/* EMAIL */}
  <input
    type="email"
    name="email"
    placeholder="Your Email"
    required
    className="
      w-full
      rounded-2xl
      bg-black/30
      border
      border-white/10
      p-3
      text-white
      placeholder:text-gray-400
      outline-none
      focus:border-green-400
    "
  />

  {/* MESSAGE */}
  <textarea
    name="message"
    placeholder="Your Message"
    required
    rows={6}
    className="
      w-full
      rounded-2xl
      bg-black/30
      border
      border-white/10
      p-3
      text-white
      placeholder:text-gray-400
      outline-none
      resize-none
      focus:border-green-400
    "
  />

  {/* SEND BUTTON */}
  <button
    type="submit"
    className={`
      w-full
      bg-green-500
      hover:bg-green-600
      transition-all
      duration-150
      text-white
      font-bold
      text-lg
      p-3
      rounded-2xl
      shadow-lg

      ${
        activeButton === "send"
          ? "scale-95 brightness-125"
          : ""
      }
    `}
  >
    📩 Send Message
  </button>

  {/* SUCCESS MESSAGE */}
  {submitted && (
    <p className="text-center text-sm text-green-300 pt-2">
      Message sent successfully!
    </p>
  )}

</form>

        </div>

        {/* FOOTER */}
        <footer className="text-center text-xs text-gray-500 py-4">
          © 2026 Youth Sports Tracker ⚾
        </footer>

      </div>

    </div>
  );
}