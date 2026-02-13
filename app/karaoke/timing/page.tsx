"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Play,
  Pause,
  RotateCcw,
  Download,
  Music,
  ChevronLeft,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Singer {
  id: string;
  name: string;
  color: string;
}

interface TimedWord {
  text: string;
  timestamp: number;
  singerId: string;
}

interface TimedLine {
  text: string;
  timestamp: number;
  singerId: string;
}

export default function TimingPage() {
  const router = useRouter();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [lyrics, setLyrics] = useState<string[]>([]);
  const [singers, setSingers] = useState<Singer[]>([]);
  const [timingMode, setTimingMode] = useState<"word" | "line">("word");
  const [audioUrl, setAudioUrl] = useState("");

  // Timing data
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timedWords, setTimedWords] = useState<TimedWord[]>([]);
  const [timedLines, setTimedLines] = useState<TimedLine[]>([]);
  const [currentLineSinger, setCurrentLineSinger] = useState("");

  // Words array for word-by-word timing
  const [words, setWords] = useState<string[]>([]);

  useEffect(() => {
    // Load data from sessionStorage
    const audio = sessionStorage.getItem("karaoke_audio");
    const lyricsText = sessionStorage.getItem("karaoke_lyrics");
    const singersData = sessionStorage.getItem("karaoke_singers");
    const mode = sessionStorage.getItem("karaoke_timing_mode");

    if (!audio || !lyricsText || !singersData) {
      router.push("/karaoke");
      return;
    }

    setAudioUrl(audio);
    const linesArray = lyricsText.split("\n").filter((line) => line.trim());
    setLyrics(linesArray);
    setSingers(JSON.parse(singersData));
    setTimingMode((mode as "word" | "line") || "word");

    if (mode === "word") {
      // Split all lyrics into words
      const allWords = linesArray.flatMap((line) =>
        line.split(/\s+/).filter((w) => w.trim())
      );
      setWords(allWords);
    }

    // Set default singer
    const parsedSingers = JSON.parse(singersData);
    if (parsedSingers.length > 0) {
      setCurrentLineSinger(parsedSingers[0].id);
    }
  }, [router]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [audioUrl]);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.pause();
    audio.currentTime = 0;
    setIsPlaying(false);
    setCurrentIndex(0);
    setTimedWords([]);
    setTimedLines([]);
  };

  const handleSpacebar = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const timestamp = audio.currentTime;

    if (timingMode === "word") {
      if (currentIndex < words.length) {
        setTimedWords((prev) => [
          ...prev,
          {
            text: words[currentIndex],
            timestamp,
            singerId: currentLineSinger,
          },
        ]);
        setCurrentIndex((prev) => prev + 1);
      }
    } else {
      // line mode
      if (currentIndex < lyrics.length) {
        setTimedLines((prev) => [
          ...prev,
          {
            text: lyrics[currentIndex],
            timestamp,
            singerId: currentLineSinger,
          },
        ]);
        setCurrentIndex((prev) => prev + 1);
      }
    }
  }, [
    currentIndex,
    words,
    lyrics,
    timingMode,
    currentLineSinger,
  ]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        handleSpacebar();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSpacebar]);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleDownload = () => {
    const data = {
      audioName: sessionStorage.getItem("karaoke_audio_name"),
      singers,
      timingMode,
      timings: timingMode === "word" ? timedWords : timedLines,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "karaoke-timings.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const isComplete =
    timingMode === "word"
      ? currentIndex >= words.length
      : currentIndex >= lyrics.length;

  const getSingerColor = (singerId: string) => {
    return singers.find((s) => s.id === singerId)?.color || "#888";
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Music className="h-8 w-8" />
            <div>
              <h1 className="text-3xl font-bold">Time Your Lyrics</h1>
              <p className="text-muted-foreground">
                Press spacebar to sync lyrics with music
              </p>
            </div>
          </div>
          <Button variant="ghost" onClick={() => router.push("/karaoke/lyrics")}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>

        <Card className="p-6 space-y-6">
          {/* Audio Controls */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  size="lg"
                  variant="outline"
                  onClick={togglePlayPause}
                  className="w-16"
                >
                  {isPlaying ? (
                    <Pause className="h-5 w-5" />
                  ) : (
                    <Play className="h-5 w-5" />
                  )}
                </Button>
                <Button size="lg" variant="outline" onClick={handleReset}>
                  <RotateCcw className="h-5 w-5" />
                </Button>
              </div>
              <div className="text-sm font-mono">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
            </div>

            <div className="w-full bg-secondary rounded-full h-2">
              <div
                className="bg-primary rounded-full h-2 transition-all"
                style={{
                  width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%`,
                }}
              />
            </div>
          </div>

          {/* Singer Selection for Current Line/Word */}
          {!isComplete && (
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Current {timingMode === "word" ? "Word" : "Line"} Singer
              </label>
              <Select
                value={currentLineSinger}
                onValueChange={setCurrentLineSinger}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {singers.map((singer) => (
                    <SelectItem key={singer.id} value={singer.id}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: singer.color }}
                        />
                        {singer.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Current Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Progress</span>
              <span className="text-muted-foreground">
                {currentIndex} /{" "}
                {timingMode === "word" ? words.length : lyrics.length}
              </span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2">
              <div
                className="bg-green-500 rounded-full h-2 transition-all"
                style={{
                  width: `${
                    timingMode === "word"
                      ? (currentIndex / words.length) * 100
                      : (currentIndex / lyrics.length) * 100
                  }%`,
                }}
              />
            </div>
          </div>

          {/* Current Item to Time */}
          {!isComplete && (
            <div className="bg-muted p-6 rounded-lg text-center">
              <p className="text-sm text-muted-foreground mb-2">
                {timingMode === "word" ? "Current Word" : "Current Line"}
              </p>
              <p className="text-3xl font-bold">
                {timingMode === "word" ? words[currentIndex] : lyrics[currentIndex]}
              </p>
              <p className="text-sm text-muted-foreground mt-4">
                Press <kbd className="px-2 py-1 bg-background rounded border">SPACE</kbd> when you hear this {timingMode === "word" ? "word" : "line"}
              </p>
            </div>
          )}

          {/* Complete Message */}
          {isComplete && (
            <div className="bg-green-500/10 border border-green-500/20 p-6 rounded-lg text-center space-y-4">
              <p className="text-xl font-bold text-green-600 dark:text-green-400">
                ✓ Timing Complete!
              </p>
              <p className="text-muted-foreground">
                All {timingMode === "word" ? "words" : "lines"} have been timed.
              </p>
              <Button onClick={handleDownload} size="lg" className="gap-2">
                <Download className="h-4 w-4" />
                Download Timing Data
              </Button>
            </div>
          )}

          {/* Timed Items Preview */}
          {(timedWords.length > 0 || timedLines.length > 0) && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Timed {timingMode === "word" ? "Words" : "Lines"}</p>
              <div className="max-h-40 overflow-y-auto border rounded p-3 space-y-1 text-sm font-mono">
                {timingMode === "word"
                  ? timedWords.map((word, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <div
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: getSingerColor(word.singerId) }}
                        />
                        <span className="text-muted-foreground">
                          {formatTime(word.timestamp)}
                        </span>
                        <span>{word.text}</span>
                      </div>
                    ))
                  : timedLines.map((line, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <div
                          className="w-2 h-2 rounded-full flex-shrink-0 mt-1"
                          style={{ backgroundColor: getSingerColor(line.singerId) }}
                        />
                        <span className="text-muted-foreground">
                          {formatTime(line.timestamp)}
                        </span>
                        <span className="flex-1">{line.text}</span>
                      </div>
                    ))}
              </div>
            </div>
          )}
        </Card>

        {audioUrl && <audio ref={audioRef} src={audioUrl} />}
      </div>
    </div>
  );
}
