"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

export default function KaraokeUploadPage() {
  const router = useRouter();
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const supportedTypes = ["audio/mpeg", "audio/wav", "audio/ogg", "audio/mp4", "audio/x-m4a"];
    if (file && supportedTypes.includes(file.type)) {
      setAudioFile(file);
    }
  };

  const handleContinue = () => {
    if (!audioFile) return;
    
    setIsLoading(true);
    
    // Store audio file in sessionStorage as base64
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Audio = reader.result as string;
      sessionStorage.setItem("karaoke_audio", base64Audio);
      sessionStorage.setItem("karaoke_audio_name", audioFile.name);
      router.push("/karaoke/lyrics");
    };
    reader.readAsDataURL(audioFile);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight">Karaoke Creator</h1>
          <p className="mt-2 text-muted-foreground">
            Upload an instrumental audio file to get started
          </p>
        </div>

        <div className="border-2 border-dashed rounded-lg p-12 text-center space-y-4">
          <div className="flex justify-center">
            <Upload className="h-16 w-16 text-muted-foreground" />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="audio-upload" className="cursor-pointer">
              <div className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
                Choose Audio File
              </div>
              <input
                id="audio-upload"
                type="file"
                accept="audio/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
            
            {audioFile && (
              <div className="text-sm text-muted-foreground">
                Selected: {audioFile.name}
              </div>
            )}
          </div>

          <p className="text-sm text-muted-foreground">
            Supported formats: MP3, WAV, OGG, M4A
          </p>
        </div>

        {audioFile && (
          <div className="flex justify-center">
            <Button
              onClick={handleContinue}
              disabled={isLoading}
              size="lg"
              className="px-8"
            >
              {isLoading ? "Loading..." : "Continue to Lyrics"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
