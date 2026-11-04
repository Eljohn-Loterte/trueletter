import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { X, ArrowLeft, Sparkles } from 'lucide-react';
import { soundManager } from '../utils/audioSynth.js';

export default function GreetingCardModal({
  isOpen,
  onClose,
  settings,
  updateSettings
}) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [windowHeight, setWindowHeight] = useState(window.innerHeight);

  const recipient = settings?.recipient || 'chuchu';
  const sender = settings?.sender || 'chuchu';

  const defaultPoem = `Every petal gathered in the dawn,
Holds a whisper of your tender grace,
Dancing like the sunbeam on the lawn,
To light your world and warm your space.

In your eyes, a haven soft and deep,
Where the sweetest joys forever bloom,
Every tender promise that we keep,
Chases far away the winter gloom.

Take this fragrant bouquet, pure and true,
With all the love my heart can send,
My fondest thoughts belong to you,
Today, tomorrow, without end.`;

  const rawMessage = settings?.giftMessage;
  const isOldDefault = !rawMessage || rawMessage.includes('Every petal in this bouquet was gathered');
  const activePoem = isOldDefault ? defaultPoem : rawMessage;

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      setWindowHeight(window.innerHeight);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!isOpen) return null;

  const handleToggleFlip = () => {
    if (!isFlipped) {
      soundManager.playChime(784);
      confetti({
        particleCount: 75,
        spread: 70,
        origin: { y: 0.55 },
        colors: ['#e11d48', '#fda4af', '#f43f5e', '#dfb858', '#ffffff', '#ffd700']
      });
      setIsFlipped(true);
    } else {
      soundManager.playChime(587);
      setIsFlipped(false);
    }
  };

  const handleCloseModal = () => {
    setIsFlipped(false);
    onClose();
  };

  // Dimensions of single flip card
  const cardWidth = 380;
  const cardHeight = 540;

  // Split active poem into 3 distinct stanzas
  const stanzas = activePoem
    .split(/\n\s*\n/)
    .map(stanza => stanza.trim().split('\n').map(l => l.trim()).filter(Boolean))
    .filter(stanza => stanza.length > 0);

  // Responsive scale factor to fit any screen (mobile phones, tablets, landscape viewports)
  const totalModalHeight = cardHeight + 110;
  const availableWidth = Math.max(260, windowWidth - 24);
  const availableHeight = Math.max(260, windowHeight - 32);
  const scaleRatio = Math.min(1, availableWidth / cardWidth, availableHeight / totalModalHeight);

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) handleCloseModal();
      }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'max(12px, env(safe-area-inset-top, 12px)) max(12px, env(safe-area-inset-right, 12px)) max(12px, env(safe-area-inset-bottom, 12px)) max(12px, env(safe-area-inset-left, 12px))',
        backgroundColor: 'rgba(8, 10, 16, 0.88)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch',
        touchAction: 'manipulation',
        animation: 'fadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards'
      }}
    >
      <div
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          transform: `scale(${scaleRatio})`,
          transformOrigin: 'center center',
          transition: 'transform 0.3s ease'
        }}
      >
        {/* Close Modal Button (X) */}
        <button
          onClick={handleCloseModal}
          title="Close"
          style={{
            position: 'absolute',
            top: '-50px',
            right: 0,
            width: '42px',
            height: '42px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.22)',
            border: '1px solid rgba(255, 255, 255, 0.35)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 30,
            transition: 'background-color 0.2s ease, transform 0.15s ease'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.4)')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.22)')}
        >
          <X size={20} />
        </button>

        {/* 3D FLIP CARD VIEWPORT */}
        <div
          style={{
            position: 'relative',
            width: `${cardWidth}px`,
            height: `${cardHeight}px`,
            perspective: '2000px',
            userSelect: 'none'
          }}
        >
          {/* 3D ROTATING CARD (Flips 180deg around Y axis) */}
          <div
            onClick={handleToggleFlip}
            style={{
              position: 'relative',
              width: '100%',
              height: '100%',
              transformStyle: 'preserve-3d',
              transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
              transition: 'transform 0.75s cubic-bezier(0.25, 1, 0.35, 1)',
              cursor: 'pointer',
              borderRadius: '0',
              boxShadow: isHovered
                ? '0 30px 70px rgba(0, 0, 0, 0.6), 0 0 30px rgba(180, 150, 110, 0.25)'
                : '0 20px 50px rgba(0, 0, 0, 0.45)'
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* ========================================================
                1. FRONT FACE: THE CLOSED CARD COVER (Wave Arc + Borders)
                ======================================================== */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                backgroundImage: "url('/paper-texture.jpg')",
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundColor: '#fbf4e6',
                borderRadius: '0',
                border: '1px solid rgba(205, 190, 168, 0.75)',
                boxShadow: 'inset 0 0 45px rgba(180, 160, 130, 0.16)',
                overflow: 'hidden'
              }}
            >
              {/* Front Cover Border Design & "LETTER OF TRUTH" in Wave Arc */}
              <svg
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
                viewBox={`0 0 ${cardWidth} ${cardHeight}`}
              >
                <defs>
                  {/* Wave Arc Path across the center */}
                  <path
                    id="frontWaveArcPath"
                    d={`M 35,${cardHeight * 0.50} C 95,${cardHeight * 0.40} 165,${cardHeight * 0.58} 245,${cardHeight * 0.44} C 285,${cardHeight * 0.38} 315,${cardHeight * 0.44} 345,${cardHeight * 0.48}`}
                    fill="none"
                  />
                </defs>

                {/* Outer refined border frame */}
                <rect
                  x="18"
                  y="18"
                  width={cardWidth - 36}
                  height={cardHeight - 36}
                  fill="none"
                  stroke="rgba(145, 120, 90, 0.65)"
                  strokeWidth="1.6"
                />

                {/* Inner delicate hairline frame */}
                <rect
                  x="25"
                  y="25"
                  width={cardWidth - 50}
                  height={cardHeight - 50}
                  fill="none"
                  stroke="rgba(145, 120, 90, 0.35)"
                  strokeWidth="0.8"
                />

                {/* 4 Corner Vintage Accents */}
                {/* Top-Left */}
                <path d="M 25,38 L 38,38 L 38,25" fill="none" stroke="rgba(145, 120, 90, 0.7)" strokeWidth="1.2" />
                <circle cx="31" cy="31" r="1.5" fill="rgba(145, 120, 90, 0.75)" />

                {/* Top-Right */}
                <path d={`M ${cardWidth - 25},38 L ${cardWidth - 38},38 L ${cardWidth - 38},25`} fill="none" stroke="rgba(145, 120, 90, 0.7)" strokeWidth="1.2" />
                <circle cx={cardWidth - 31} cy="31" r="1.5" fill="rgba(145, 120, 90, 0.75)" />

                {/* Bottom-Left */}
                <path d={`M 25,${cardHeight - 38} L 38,${cardHeight - 38} L 38,${cardHeight - 25}`} fill="none" stroke="rgba(145, 120, 90, 0.7)" strokeWidth="1.2" />
                <circle cx="31" cy={cardHeight - 31} r="1.5" fill="rgba(145, 120, 90, 0.75)" />

                {/* Bottom-Right */}
                <path d={`M ${cardWidth - 25},${cardHeight - 38} L ${cardWidth - 38},${cardHeight - 38} L ${cardWidth - 38},${cardHeight - 25}`} fill="none" stroke="rgba(145, 120, 90, 0.7)" strokeWidth="1.2" />
                <circle cx={cardWidth - 31} cy={cardHeight - 31} r="1.5" fill="rgba(145, 120, 90, 0.75)" />

                {/* Top Header Vintage Fleuron Motif */}
                <path
                  d={`M ${cardWidth / 2 - 24},46 Q ${cardWidth / 2},39 ${cardWidth / 2 + 24},46`}
                  fill="none"
                  stroke="rgba(145, 120, 90, 0.5)"
                  strokeWidth="1"
                />
                <circle cx={cardWidth / 2} cy="42" r="2" fill="rgba(145, 120, 90, 0.65)" />

                {/* Bottom Vintage Fleuron Motif */}
                <path
                  d={`M ${cardWidth / 2 - 24},${cardHeight - 46} Q ${cardWidth / 2},${cardHeight - 39} ${cardWidth / 2 + 24},${cardHeight - 46}`}
                  fill="none"
                  stroke="rgba(145, 120, 90, 0.5)"
                  strokeWidth="1"
                />
                <circle cx={cardWidth / 2} cy={cardHeight - 42} r="2" fill="rgba(145, 120, 90, 0.65)" />

                {/* Wave Arc Text: LETTER OF TRUTH */}
                <text
                  fill="#3e3226"
                  style={{
                    fontFamily: "'Poppins', sans-serif",
                    fontSize: '18px',
                    fontWeight: '600',
                    letterSpacing: '5.5px',
                    filter: 'drop-shadow(0 1px 1px rgba(255, 255, 255, 0.9))'
                  }}
                >
                  <textPath
                    href="#frontWaveArcPath"
                    startOffset="50%"
                    textAnchor="middle"
                  >
                    LETTER OF TRUTH
                  </textPath>
                </text>

                {/* Delicate accent flourish under the wave arc */}
                <path
                  d={`M ${cardWidth * 0.32},${cardHeight * 0.58} C ${cardWidth * 0.42},${cardHeight * 0.55} ${cardWidth * 0.52},${cardHeight * 0.60} ${cardWidth * 0.62},${cardHeight * 0.56} C ${cardWidth * 0.66},${cardHeight * 0.54} ${cardWidth * 0.68},${cardHeight * 0.56} ${cardWidth * 0.70},${cardHeight * 0.57}`}
                  fill="none"
                  stroke="rgba(150, 125, 95, 0.45)"
                  strokeWidth="1.2"
                />
                <circle cx={cardWidth / 2} cy={cardHeight * 0.575} r="2" fill="rgba(150, 125, 95, 0.55)" />
              </svg>

              {/* Bottom tap prompt */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '36px',
                  left: 0,
                  right: 0,
                  textAlign: 'center',
                  pointerEvents: 'none'
                }}
              >
                <span
                  style={{
                    fontFamily: "'Poppins', sans-serif",
                    fontSize: '11px',
                    letterSpacing: '2.5px',
                    textTransform: 'uppercase',
                    color: 'rgba(120, 95, 70, 0.75)'
                  }}
                >
                  tap card to flip ↻
                </span>
              </div>
            </div>

            {/* ========================================================
                2. BACK FACE: ONE-PAGE LETTER (Flipped 180deg)
                ======================================================== */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                transform: 'rotateY(180deg)',
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                backgroundImage: "url('/paper-texture.jpg')",
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundColor: '#fbf4e6',
                borderRadius: '0',
                border: '1px solid rgba(205, 190, 168, 0.75)',
                boxShadow: 'inset 0 0 45px rgba(180, 160, 130, 0.18)',
                padding: '42px 34px 34px 34px',
                boxSizing: 'border-box',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                overflow: 'hidden'
              }}
            >
              {/* Top Header: A letter 4 u */}
              <div>
                <div style={{ textAlign: 'center', marginBottom: '26px' }}>
                  <p
                    style={{
                      fontFamily: "'Poppins', sans-serif",
                      fontSize: '13px',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      letterSpacing: '4.5px',
                      color: '#5c4d3e',
                      margin: 0
                    }}
                  >
                    A letter 4 u
                  </p>
                </div>

                {/* Poem Body in Poppins with Big Decorative Initial Letter for Each Stanza */}
                <div
                  style={{
                    fontFamily: "'Poppins', sans-serif",
                    fontSize: '13px',
                    lineHeight: '1.75',
                    fontWeight: '400',
                    color: '#2d251f'
                  }}
                >
                  {stanzas.map((stanza, sIdx) => {
                    const firstLine = stanza[0] || '';
                    const firstChar = firstLine.charAt(0);
                    const firstLineRest = firstLine.slice(1);
                    const remainingLines = stanza.slice(1);

                    return (
                      <div key={sIdx} style={{ marginBottom: '16px', lineHeight: '1.75' }}>
                        {firstChar && (
                          <span
                            style={{
                              float: 'left',
                              fontSize: '50px',
                              lineHeight: '38px',
                              paddingTop: '2px',
                              paddingRight: firstChar === 'I' ? '6px' : '8px',
                              paddingBottom: '0px',
                              fontFamily: "'Cormorant Garamond', Georgia, serif",
                              fontWeight: 'bold',
                              color: '#8b261e',
                              textShadow: '0 1px 1px rgba(0, 0, 0, 0.08)',
                              userSelect: 'none'
                            }}
                          >
                            {firstChar}
                          </span>
                        )}
                        <span style={{ fontStyle: 'italic' }}>{firstLineRest}</span>
                        {remainingLines.map((line, idx) => (
                          <React.Fragment key={idx}>
                            <br />
                            <span style={{ fontStyle: 'italic' }}>{line}</span>
                          </React.Fragment>
                        ))}
                        <div style={{ clear: 'both' }} />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Sign-off ending with "Sincerely yours, chuchu ❤️" */}
              <div style={{ textAlign: 'right', marginTop: 'auto', paddingTop: '10px' }}>
                <p
                  style={{
                    fontFamily: "'Poppins', sans-serif",
                    fontSize: '12.5px',
                    letterSpacing: '0.5px',
                    color: '#6e6052',
                    margin: '0 0 3px 0'
                  }}
                >
                  Sincerely yours,
                </p>
                <h2
                  style={{
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    fontSize: '32px',
                    fontWeight: 'bold',
                    fontStyle: 'italic',
                    color: '#8b261e',
                    textShadow: '0 1px 1px rgba(0, 0, 0, 0.08)',
                    margin: 0
                  }}
                >
                  {sender} ❤️
                </h2>
              </div>
            </div>
          </div>
        </div>

        {/* INTERACTION TOOLBAR BELOW FLIP CARD */}
        <div style={{ marginTop: '18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={handleToggleFlip}
            style={{
              padding: '11px 22px',
              borderRadius: '9999px',
              backgroundColor: 'rgba(15, 18, 24, 0.92)',
              border: '1.5px solid rgba(223, 184, 88, 0.65)',
              boxShadow: '0 8px 20px rgba(0, 0, 0, 0.45)',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: '600',
              letterSpacing: '0.5px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              userSelect: 'none',
              minHeight: '44px',
              transition: 'transform 0.2s ease, background-color 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(25, 30, 40, 0.95)';
              e.currentTarget.style.transform = 'scale(1.04)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(15, 18, 24, 0.92)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <Sparkles size={15} style={{ color: '#fcd34d' }} />
            <span>{isFlipped ? 'Flip to Front' : 'Flip to Poem'}</span>
          </button>

          <button
            onClick={handleCloseModal}
            style={{
              padding: '11px 22px',
              borderRadius: '9999px',
              backgroundColor: '#fbf7ee',
              border: '1.5px solid rgba(160, 138, 110, 0.7)',
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.35)',
              color: '#4a3d31',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              minHeight: '44px',
              transition: 'background-color 0.15s ease, transform 0.1s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f1e8d9';
              e.currentTarget.style.transform = 'scale(1.03)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#fbf7ee';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <ArrowLeft size={14} />
            <span>Close</span>
          </button>
        </div>
      </div>
    </div>
  );
}
