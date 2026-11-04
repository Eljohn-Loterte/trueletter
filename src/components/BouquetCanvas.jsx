import React, { useEffect, useRef } from 'react';
import { BouquetScene } from '../three/BouquetScene.js';
import { Sparkles, MousePointerClick, RotateCw } from 'lucide-react';

export default function BouquetCanvas({
  sceneRef,
  settings,
  onSceneReady,
  onOpenLetter
}) {
  const mountRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const bouquetScene = new BouquetScene(mountRef.current, {
      roseColor: settings.roseColor,
      wrapColor: settings.wrapColor,
      accentColor: settings.accentColor,
      ribbonColor: settings.ribbonColor,
      roseCount: settings.roseCount,
      showFauna: settings.showFauna,
      showParticles: settings.showParticles,
      showGiftTag: settings.showGiftTag,
      autoRotate: settings.autoRotate,
      recipient: settings.recipient,
      giftMessage: settings.giftMessage,
      sender: settings.sender,
      onOpenLetter: () => {
        if (onOpenLetter) onOpenLetter();
      }
    });

    sceneRef.current = bouquetScene;
    if (onSceneReady) onSceneReady(bouquetScene);

    return () => {
      bouquetScene.dispose();
      sceneRef.current = null;
    };
  }, []);

  // Update properties when settings change
  useEffect(() => {
    if (!sceneRef.current) return;
    sceneRef.current.setRoseColor(settings.roseColor);
  }, [settings.roseColor]);

  useEffect(() => {
    if (!sceneRef.current) return;
    sceneRef.current.setWrapColor(settings.wrapColor, settings.accentColor);
  }, [settings.wrapColor, settings.accentColor]);

  useEffect(() => {
    if (!sceneRef.current) return;
    sceneRef.current.setRibbonColor(settings.ribbonColor);
  }, [settings.ribbonColor]);

  useEffect(() => {
    if (!sceneRef.current) return;
    sceneRef.current.setRoseCount(settings.roseCount);
  }, [settings.roseCount]);

  useEffect(() => {
    if (!sceneRef.current) return;
    sceneRef.current.toggleFauna(settings.showFauna);
  }, [settings.showFauna]);

  useEffect(() => {
    if (!sceneRef.current) return;
    sceneRef.current.toggleParticles(settings.showParticles);
  }, [settings.showParticles]);

  useEffect(() => {
    if (!sceneRef.current) return;
    sceneRef.current.toggleGiftTag(settings.showGiftTag);
  }, [settings.showGiftTag]);

  useEffect(() => {
    if (!sceneRef.current) return;
    sceneRef.current.toggleAutoRotate(settings.autoRotate);
  }, [settings.autoRotate]);

  useEffect(() => {
    if (!sceneRef.current) return;
    sceneRef.current.updateGiftTagText(settings.recipient, settings.giftMessage, settings.sender);
  }, [settings.recipient, settings.giftMessage, settings.sender]);

  return (
    <div className="relative w-full h-full select-none overflow-hidden" style={{ touchAction: 'none' }}>
      {/* 3D Canvas Mount */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" style={{ touchAction: 'none' }} />

      {/* Floating interactive hint requested by user: "still show the drag to rotate tap letter chuhcu" */}
      <div
        style={{
          position: 'absolute',
          bottom: 'max(18px, env(safe-area-inset-bottom, 18px))',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 30,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          maxWidth: 'calc(100vw - 20px)',
          padding: '8px 16px',
          borderRadius: '9999px',
          backgroundColor: 'rgba(15, 23, 42, 0.78)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(223, 184, 88, 0.45)',
          boxShadow: '0 12px 30px rgba(0, 0, 0, 0.4)',
          color: '#ffffff',
          fontSize: '12.5px',
          fontWeight: '500',
          letterSpacing: '0.2px',
          userSelect: 'none',
          whiteSpace: 'nowrap'
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#f1f5f9' }}>
          <RotateCw size={13} style={{ color: '#fb7185' }} />
          <span>Drag 360° to rotate</span>
        </span>
        <span style={{ color: 'rgba(255, 255, 255, 0.3)' }}>•</span>
        <span
          onClick={() => onOpenLetter && onOpenLetter()}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            color: '#fef08a',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'transform 0.15s ease'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1.0)')}
        >
          <MousePointerClick size={13} style={{ color: '#facc15' }} />
          <span>Tap letter 📖</span>
        </span>
      </div>
    </div>
  );
}

