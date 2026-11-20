import React, { useState, useRef, useEffect } from 'react';
import BouquetCanvas from './components/BouquetCanvas.jsx';
import UIOverlay from './components/UIOverlay.jsx';
import CustomizerDrawer from './components/CustomizerDrawer.jsx';
import GreetingCardModal from './components/GreetingCardModal.jsx';
import { soundManager } from './utils/audioSynth.js';

// Default settings matching user's newest spec:
// White tea roses (Image 2), Onyx silk with gold stripes (Image 1), Whitish silk ribbon, No overlap
const DEFAULT_PERFECT_SETTINGS = {
  roseColor: '#fdfcf7',    // Pristine bridal white roses (Image 2 match)
  wrapColor: '#181a1f',    // Onyx silk with random gold stripes (Image 1 match)
  accentColor: '#dfb858',  // Metallic gold borders and accent stripes
  ribbonColor: '#fcfbf8',  // Whitish silk ribbon bow
  roseCount: 13,           // 13 roses in 5-tier staircase arrangement
  showFauna: true,         // Hummingbirds & butterflies
  showParticles: true,     // Subtle fairy dust sparkles
  showGiftTag: true,       // 3D Love letter envelope pops out in front
  autoRotate: false,       // Free orbit controls
  recipient: 'chuchu',     // Dear chuchu letter
  giftMessage: `Kind of funny at the start,
Just a pretty passerby.
Kept my guard up on the shore,
Didn't even wonder why.

Even with that cute half-smile,
I was floating, calm and cool.
Barely felt a single wave
In my quiet little pool.

Easy though, the current pulled,
Drifting closer day by day.
Lost my footing, lost my tread,
Letting all my doubts wash away.

Suddenly I hit the deep—
FIN-ally it clicked so fast:
I was drowning in your charm,
Hooked and sinking hard at last.

How'd "not really" turn to this?
Now I'm swimming straight to you.
Sea-riously swept away
By a love I never knew.

All my guards are underwater,
No more trying to stay dry.
Started out not caring much
Now you're my whole ocean sky.`,
  sender: 'chuchu'         // Sincerely yours, chuchu
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
    <div className="relative w-screen h-screen overflow-hidden bg-slate-100 font-sans select-none">
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
