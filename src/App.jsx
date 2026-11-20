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
  giftMessage: `Kind of hard to focus when you’re floating through my mind,
A pretty little siren leaving every thought behind.
I’m caught inside your current, swept completely off my feet,
With a cute and clever magic that is shorely hard to beat.

Every time you flash that smile, it hits just like a wave,
I’m drowning in your dimples—and I don't want to be saved.
You’re FIN-tastic and radiant, a literal work of art,
Who effortlessly dove into the deep end of my heart.

Even when I try to tread the line and play it cool,
One look from you reduces me to just a lovesick fool.
No floaties and no lifeboats could ever keep me dry,
When swimming in your love is how I want to live and die.

So forget the shallow waters where the timid people stay,
I’d rather sink into your charm and wash my doubts away.
You’ve got me hooked, no kelp about it, tangled in your grace,
The brightest, sweetest treasure in this vast and ocean space.

Head over heels, I’m buoyant just from standing next to you,
My favorite kind of tide that pulls my whole horizon blue.
You’re sea-riously breathtaking from your laughter to your eyes,
A cute and pretty miracle beneath these summer skies.

All my days are better now that you have made a splash,
Turning ordinary moments into gold from simple ash.
So let’s keep swimming forward, hand in hand, just you and me,
Because loving you is deeper than the bottom of the sea.`,
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
