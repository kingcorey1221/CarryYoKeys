# Karaoke Lyric Timing App

A web application for syncing lyrics with instrumental audio tracks. Create karaoke-style timing data by pressing the spacebar to mark when words or lines should appear.

## Features

### 🎵 Audio Upload
- Support for common audio formats: MP3, WAV, OGG, M4A
- Drag-and-drop file selection
- File validation

### 🎤 Multi-Singer Support
- Configure 1-5 singers
- Assign custom names to each singer
- Color-coded singer indicators
- Assign different parts to different singers

### ⏱️ Flexible Timing Modes
- **Word-by-word**: Press spacebar for each word
- **Line-by-line**: Press spacebar at the start of each line

### 🎮 Audio Controls
- Play/pause functionality
- Progress bar showing current position
- Time display (current/total)
- Reset button to start over

### 📊 Real-time Feedback
- Current word/line display
- Progress tracking (completed/total)
- Live preview of timed items
- Visual progress indicators

### 💾 Export
- Download timing data as JSON
- Includes singer assignments
- Timestamp for each word/line
- Ready for use in karaoke applications

## Usage

1. **Navigate to** `/karaoke`
2. **Upload** an instrumental audio file
3. **Enter lyrics** in the text area (one line per line)
4. **Configure singers**:
   - Select number of singers (1-5)
   - Assign names to each singer
5. **Choose timing mode**:
   - Word-by-word: Press space for each word
   - Line-by-line: Press space at the beginning of each line
6. **Time your lyrics**:
   - Click play to start the audio
   - Press SPACE when you hear each word/line
   - Assign singers for each part using the dropdown
7. **Download** your timing data as JSON when complete

## Technical Implementation

### Architecture
- Built with Next.js 16 and React 19
- Client-side components with sessionStorage for state persistence
- No authentication required (bypassed in proxy.ts)

### Data Flow
```
Page 1 (Upload)
    ↓ Audio file → sessionStorage
Page 2 (Lyrics)
    ↓ Lyrics, singers, timing mode → sessionStorage
Page 3 (Timing)
    ↓ Timing data → JSON download
```

### Session Data Structure
```typescript
// sessionStorage keys
karaoke_audio: string (base64 encoded audio)
karaoke_audio_name: string
karaoke_lyrics: string (newline-separated)
karaoke_singers: string (JSON array of Singer objects)
karaoke_timing_mode: "word" | "line"

// Singer interface
interface Singer {
  id: string;
  name: string;
  color: string; // hex color code
}

// Timing output format
{
  audioName: string;
  singers: Singer[];
  timingMode: "word" | "line";
  timings: Array<{
    text: string;
    timestamp: number; // seconds
    singerId: string;
  }>;
}
```

## Browser Compatibility
- Modern browsers with Web Audio API support
- sessionStorage required
- FileReader API required

## Future Enhancements
- Visual waveform display
- Undo/redo functionality
- Edit timestamps after creation
- Import existing timing data
- Real-time karaoke playback preview
- Multiple audio track support
- Cloud storage integration
