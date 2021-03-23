import Head from "next/head";
import React, { useState, useRef, useEffect } from "react";
import { Check, Reset, Pause } from "../components/Icons";

// From https://davidwalsh.name/caret-end
function moveCursorToEnd(el: any) {
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

function Prompt({ promptText, setPromptText, inputRef }: any) {
  return (
    <input
      className="w-11/12 text-3xl md:text-6xl font-bold text-white border-b-4 md:border-b-8 border-black bg-transparent text-center"
      spellCheck={false}
      ref={inputRef}
      contentEditable={true}
      value={promptText}
      onInput={(e) => setPromptText((e.target as HTMLInputElement).value)}
    />
  );
}

function Time({ time, resetTimer, paused, setPaused }: any) {
  return (
    <div className="flex flex-col md:flex-row text-5xl text-white items-center justify-center">
      <div className="flex flex-row justify-center items-center text-center">
        {prettyPrintTime(time)}
      </div>
      <div className="flex flex-row">
        <button
          className="hover:bg-white hover:text-blue rounded-lg my-2 ml-2"
          onClick={() => {
            setPaused(false);
            resetTimer();
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
    </div>
  );
}

function Button({ children, onClick }: any) {
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

function Dones({
  dones,
  hideDonesAndShowPrompt,
}: {
  dones: Array<Done>;
  hideDonesAndShowPrompt: any;
}) {
  return (
    <div className="fixed z-10 inset-0 overflow-y-auto w-full h-full flex items-center justify-center bg-white bg-opacity-50">
      <div className="rounded-2xl bg-white px-8 pt-8 md:p-8 shadow w-11/12 h-4/6 md:h-auto">
        <div className="flex justify-between">
          <h2 className="text-3xl md:text-5xl font-bold pb-4">Done</h2>
          <h2 className="text-3xl md:text-5xl font-bold pb-4">{`${dones.length} things`}</h2>
        </div>
        <ul className="flex flex-col overflow-y-scroll md:h-auto h-4/6">
          {dones.map((d) => (
            <li
              key={d.id}
              className="text-xl md:text-2xl flex flex-row p-2 even:bg-gray-100 items-center"
            >
              <Check width="32px" height="32px" />
              <div className="pl-8" />
              <div className="flex flex-col md:flex-1 md:flex-row">
                <div className="md:flex-1">{d.text}</div>
                <div className="md:pl-4 text-gray-500">
                  {prettyPrintTime(d.duration)}
                </div>
              </div>
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

function useTimer() {
  const [time, setTime] = useState<number>(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [paused, setPaused] = useState<boolean>(false);
  const [prePauseTime, setPrePauseTime] = useState<number>(0);

  const resetTimer = () => {
    setStartTime(null);
    setPrePauseTime(0);
    setTime(0);
  };

  useEffect(() => {
    let interval: any = null;

    if (!paused) {
      interval = setInterval(() => {
        if (startTime == null) {
          setStartTime(Date.now());
          setTime(prePauseTime);
        } else {
          setTime(Date.now() - startTime + prePauseTime);
        }
      }, 100);
    } else if (paused) {
      setPrePauseTime(time);
      setStartTime(null);
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [paused, startTime]);

  return { time, resetTimer, paused, setPaused };
}

export default function Home() {
  const [showDones, setShowDones] = useState<boolean>(false);
  const [promptText, setPromptText] = useState<string>(
    "thinking of what to do"
  );
  const [dones, setDones] = useState<Array<Done>>([]);

  const { time, resetTimer, paused, setPaused } = useTimer();

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef?.current?.focus();
    moveCursorToEnd(inputRef.current);
  }, [inputRef]);

  const clickDone = () => {
    resetTimer();
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
    inputRef?.current?.focus();
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
          resetTimer={resetTimer}
          paused={paused}
          setPaused={setPaused}
        />
        <div className="flex flex-row m-4">
          <Button onClick={clickDone}>Done</Button>
        </div>
      </main>
    </div>
  );
}
