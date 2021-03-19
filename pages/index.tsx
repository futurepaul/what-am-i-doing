import Head from "next/head";
import React, { useState, useRef, useEffect } from "react";
import { Check, Reset, Pause } from "../components/Icons";

// From https://davidwalsh.name/caret-end
function moveCursorToEnd(el) {
  if (typeof el.selectionStart == "number") {
    el.selectionStart = el.selectionEnd = el.value.length;
  } else if (typeof el.createTextRange != "undefined") {
    el.focus();
    var range = el.createTextRange();
    range.collapse(false);
    range.select();
  }
}

function calculateMinutes(time: number) {
  return Math.floor((time / 60000) % 60);
}

function prettyPrintTime(time: number): string {
  let minutes =
    calculateMinutes(time) > 0 ? `${calculateMinutes(time)} minutes and ` : "";
  let seconds = ` ${Math.floor((time / 1000) % 60)} seconds`;
  return minutes + seconds;
}

function Prompt({ promptText, setPromptText, inputRef }) {
  return (
    <input
      className="text-6xl font-bold text-white border-b-8 border-black m-4 bg-transparent text-center"
      spellCheck={false}
      ref={inputRef}
      onChange={(e) => setPromptText(e.target.value)}
      value={promptText}
    />
  );
}

// Timer effect from https://www.code-boost.com/video/how-to-build-a-react-stopwatch-timer/
function Time({ time, setTime, paused, setPaused }) {
  return (
    <div className="flex flex-row text-5xl text-white items-center">
      <span>{prettyPrintTime(time)}</span>
      <button
        className="hover:bg-white hover:text-blue rounded-lg my-2 ml-2"
        onClick={() => {
          setPaused(false);
          setTime(0);
        }}
      >
        <Reset width="4rem" height="4rem" />
      </button>
      <button
        className={`hover:bg-white hover:text-blue rounded-lg my-2 ${
          paused && "bg-white text-blue"
        }`}
        onClick={() => {
          setPaused(!paused);
        }}
      >
        <Pause width="4rem" height="4rem" />
      </button>
    </div>
  );
}

function Button({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      className="p-4 bg-black text-white text-2xl font-bold rounded-lg mx-2 shadow hover:shadow-glow"
    >
      <div className="flex flex-row">{children}</div>
    </button>
  );
}

interface Done {
  id: number;
  text: string;
  duration: number;
}

function Dones({ dones, hideDonesAndShowPrompt }: { dones: Array<Done> }) {
  return (
    <div className="fixed z-10 inset-0 overflow-y-auto w-full h-full flex items-center justify-center bg-white bg-opacity-50">
      <div className="rounded-2xl bg-white p-8 shadow m-10 w-2/3">
        <div className="flex justify-between">
          <h2 className="text-5xl font-bold pb-4">Done</h2>
          <h2 className="text-5xl font-bold pb-4">{`${dones.length} things`}</h2>
        </div>
        <ul>
          {dones.map((d) => (
            <li
              key={d.id}
              className="text-2xl flex flex-row p-2 even:bg-gray-100"
            >
              <Check width="2rem" height="2rem" />
              <div className="pl-4">{d.text}</div>
              <div className="flex-1" />
              <div className="pl-4">{prettyPrintTime(d.duration)}</div>
            </li>
          ))}
        </ul>
        <div className="flex flex-row justify-center pt-4">
          <Button onClick={hideDonesAndShowPrompt}>Do another thing</Button>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [paused, setPaused] = useState(false);
  const [time, setTime] = useState(0);
  const [showDones, setShowDones] = useState(false);
  const [promptText, setPromptText] = useState("thinking of what to do");
  const [dones, setDones] = useState([]);

  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current.focus();
    moveCursorToEnd(inputRef.current);
  }, [inputRef]);

  useEffect(() => {
    let interval = null;

    if (!paused) {
      interval = setInterval(() => {
        setTime((prevTime) => prevTime + 10);
      }, 10);
    } else if (paused) {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [paused]);

  const clickDone = () => {
    setTime(0);
    setPaused(true);
    const newDones = [
      {
        id: dones.length + 1,
        text: promptText,
        duration: time,
      },
    ].concat(dones);
    setDones(newDones);
    setShowDones(true);
  };

  const hideDonesAndShowPrompt = () => {
    setPromptText("");
    setPaused(false);
    setShowDones(false);
    inputRef.current.focus();
  };

  return (
    <div
      className={`flex flex-col min-h-screen ${
        paused ? "bg-gray-500" : "bg-red"
      }`}
    >
      <Head>
        <title>What am I doing?</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {showDones && (
        <Dones dones={dones} hideDonesAndShowPrompt={hideDonesAndShowPrompt} />
      )}
      <header className="flex flex-row justify-between items-center p-4 bg-white">
        <h1 className="text-3xl font-bold">What am I doing?</h1>
        <h1 className="text-3xl font-bold">*</h1>
      </header>

      <main className="flex flex-col items-center justify-center flex-1">
        <Prompt
          inputRef={inputRef}
          promptText={promptText}
          setPromptText={setPromptText}
        />
        <p className="text-4xl italic text-white p-4">for</p>
        <Time
          time={time}
          setTime={setTime}
          paused={paused}
          setPaused={setPaused}
        />
        <div className="flex flex-row m-4">
          <Button onClick={clickDone}>Done</Button>
        </div>
      </main>

      <footer className="flex items-center justify-center w-full h-8"></footer>
    </div>
  );
}
