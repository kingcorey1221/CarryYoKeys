"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { User, Music } from "lucide-react";

interface Singer {
  id: string;
  name: string;
  color: string;
}

const COLORS = [
  "#ef4444", // red
  "#3b82f6", // blue
  "#10b981", // green
  "#f59e0b", // amber
  "#8b5cf6", // violet
];

export default function LyricsPage() {
  const router = useRouter();
  const [numSingers, setNumSingers] = useState(1);
  const [singers, setSingers] = useState<Singer[]>([
    { id: "1", name: "Singer 1", color: COLORS[0] },
  ]);
  const [lyrics, setLyrics] = useState("");
  const [timingMode, setTimingMode] = useState<"word" | "line">("word");
  const [audioLoaded, setAudioLoaded] = useState(false);

  useEffect(() => {
    // Check if audio file exists
    const audio = sessionStorage.getItem("karaoke_audio");
    if (!audio) {
      router.push("/karaoke");
    } else {
      setAudioLoaded(true);
    }
  }, [router]);

  const handleNumSingersChange = (value: string) => {
    const num = Number.parseInt(value);
    setNumSingers(num);

    // Update singers array
    const newSingers: Singer[] = [];
    for (let i = 0; i < num; i++) {
      if (singers[i]) {
        newSingers.push(singers[i]);
      } else {
        newSingers.push({
          id: `${i + 1}`,
          name: `Singer ${i + 1}`,
          color: COLORS[i % COLORS.length],
        });
      }
    }
    setSingers(newSingers);
  };

  const updateSingerName = (id: string, name: string) => {
    setSingers(singers.map((s) => (s.id === id ? { ...s, name } : s)));
  };

  const handleContinue = () => {
    if (!lyrics.trim()) return;

    // Store lyrics data
    sessionStorage.setItem("karaoke_lyrics", lyrics);
    sessionStorage.setItem("karaoke_singers", JSON.stringify(singers));
    sessionStorage.setItem("karaoke_timing_mode", timingMode);

    router.push("/karaoke/timing");
  };

  if (!audioLoaded) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Music className="h-8 w-8" />
          <div>
            <h1 className="text-3xl font-bold">Input Lyrics</h1>
            <p className="text-muted-foreground">
              Add your lyrics and assign singers
            </p>
          </div>
        </div>

        <Card className="p-6 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="num-singers">Number of Singers</Label>
              <Select
                value={numSingers.toString()}
                onValueChange={handleNumSingersChange}
              >
                <SelectTrigger id="num-singers" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Solo</SelectItem>
                  <SelectItem value="2">2 People</SelectItem>
                  <SelectItem value="3">3 People</SelectItem>
                  <SelectItem value="4">4 People</SelectItem>
                  <SelectItem value="5">5 People</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label>Singer Names</Label>
              <div className="grid gap-3 md:grid-cols-2">
                {singers.map((singer, index) => (
                  <div key={singer.id} className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-full flex-shrink-0"
                      style={{ backgroundColor: singer.color }}
                    />
                    <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <Input
                      value={singer.name}
                      onChange={(e) =>
                        updateSingerName(singer.id, e.target.value)
                      }
                      placeholder={`Singer ${index + 1}`}
                      className="flex-1"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timing-mode">Timing Mode</Label>
              <Select value={timingMode} onValueChange={(v) => setTimingMode(v as "word" | "line")}>
                <SelectTrigger id="timing-mode" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="word">Press spacebar at every word</SelectItem>
                  <SelectItem value="line">Press spacebar at the beginning of every line</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="lyrics">Lyrics</Label>
            <Textarea
              id="lyrics"
              value={lyrics}
              onChange={(e) => setLyrics(e.target.value)}
              placeholder="Enter your lyrics here...&#10;&#10;Use line breaks to separate lines.&#10;You'll be able to assign each line to a singer on the next page."
              className="min-h-[300px] font-mono"
            />
            <p className="text-sm text-muted-foreground">
              Enter one line of lyrics per line. You can assign singers to each
              part during the timing phase.
            </p>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => router.push("/karaoke")}>
              Back
            </Button>
            <Button
              onClick={handleContinue}
              disabled={!lyrics.trim()}
              size="lg"
            >
              Continue to Timing
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
