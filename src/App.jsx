import React, { useState, useRef, useEffect } from 'react';
import BouquetCanvas from './components/BouquetCanvas.jsx';
import UIOverlay from './components/UIOverlay.jsx';
import CustomizerDrawer from './components/CustomizerDrawer.jsx';
import GreetingCardModal from './components/GreetingCardModal.jsx';
import { soundManager } from './utils/audioSynth.js';

// Default settings matching user's newest spec:
// Mixed luxury floral bouquet: Sunflowers, Tulips, Lilies, Red Roses, Lavender, and Daisies
const DEFAULT_PERFECT_SETTINGS = {
  roseColor: '#c8102e',    // Velvet romantic red roses
  wrapColor: '#181a1f',    // Onyx silk with random gold stripes (Image 1 match)
  accentColor: '#dfb858',  // Metallic gold borders and accent stripes
  ribbonColor: '#fcfbf8',  // Whitish silk ribbon bow
  roseCount: 13,           // 13 mixed luxury blooms in 5-tier arrangement
  showFauna: true,         // Hummingbirds & butterflies
  showParticles: true,     // Subtle fairy dust sparkles
  showGiftTag: true,       // 3D Love letter envelope pops out in front
  autoRotate: false,       // Free orbit controls
  recipient: 'chuchu',     // Dear chuchu letter
  giftMessage: `Kind of funny at the start,
Just a pretty face I knew.
Kept a steady pace around my heart,
Never thought I'd be liking you.

Even when you flashed that smile,
You were cute, yet I stayed cool.
Thought I’d only stay a while,
Keeping all my feelings mute.

Even so crazy how the tides have turned,
Pulling me beneath my tide.
Slowly, little by little finally I learned,
There's no more place to hide.

Suddenly I hit so deep,
Drowning in the way you shine.
Every glance was mine to keep,
And I got hooked on every line.

How'd I go from "nothing really",
To swimming straight into the deep.
Caught inside your current freely,
Falling harder than I'll keep.

All my guards have washed away,
No more trying to stay dry.
Started out with not much say
Now you are my favorite why.`,
  sender: 'Eljohn'         // Sincerely yours, Eljohn
};

export default function App() {
  const [settings, setSettings] = useState(DEFAULT_PERFECT_SETTINGS);
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [activeCameraPreset, setActiveCameraPreset] = useState('front');

  const sceneRef = useRef(null);

  // Initialize auto-starting romantic ambient music on first user interaction
  useEffect(() => {
    soundManager.initAutoStart();
  }, []);

  const updateSettings = (newProps) => {
    setSettings((prev) => ({ ...prev, ...newProps }));
  };

  const handleResetToImage = () => {
    setSettings(DEFAULT_PERFECT_SETTINGS);
    if (sceneRef.current) {
      sceneRef.current.setCameraPreset('front');
    }
    setActiveCameraPreset('front');
  };

  const handleCameraPreset = (preset) => {
    setActiveCameraPreset(preset);
    if (sceneRef.current) {
      sceneRef.current.setCameraPreset(preset);
    }
  };

  return (
    <div className="relative w-screen h-screen h-[100dvh] overflow-hidden bg-slate-100 font-sans select-none" style={{ height: '100dvh', width: '100vw' }}>
      {/* 3D WebGL Canvas */}
      <BouquetCanvas
        sceneRef={sceneRef}
        settings={settings}
        onOpenLetter={() => setIsCardModalOpen(true)}
      />

      {/* Floating UI Overlay (Top banner removed per user request) */}
      <UIOverlay
        onToggleCustomizer={() => setIsCustomizerOpen(!isCustomizerOpen)}
        onOpenCardModal={() => setIsCardModalOpen(true)}
        onResetToImage={handleResetToImage}
        onCameraPreset={handleCameraPreset}
        activeCameraPreset={activeCameraPreset}
        sceneRef={sceneRef}
      />

      {/* Slide-out Customizer Drawer */}
      <CustomizerDrawer
        isOpen={isCustomizerOpen}
        onClose={() => setIsCustomizerOpen(false)}
        settings={settings}
        updateSettings={updateSettings}
        onResetToImage={handleResetToImage}
      />

      {/* Greeting Card Modal */}
      <GreetingCardModal
        isOpen={isCardModalOpen}
        onClose={() => setIsCardModalOpen(false)}
        settings={settings}
        updateSettings={updateSettings}
      />
    </div>
  );
}
