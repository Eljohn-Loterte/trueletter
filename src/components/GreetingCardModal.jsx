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
  const [isBookOpen, setIsBookOpen] = useState(false);
  const [mobileFocus, setMobileFocus] = useState('spread'); // 'spread' | 'page1' | 'page2'
  const [isHovered, setIsHovered] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [windowHeight, setWindowHeight] = useState(window.innerHeight);

  const recipient = settings?.recipient || 'chuchu';
  const sender = settings?.sender || 'chuchu';

  const defaultPoem = `Kind of funny at the start,
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
Now you're my whole ocean sky.`;

  const rawMessage = settings?.giftMessage;
  const isOldDefault = !rawMessage || 
    rawMessage.includes('Every petal in this bouquet was gathered') ||
    rawMessage.includes('Every petal gathered in the dawn') ||
    rawMessage.includes('Kind of hard to focus when you’re floating through my mind');
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

  const handleToggleOpen = () => {
    if (!isBookOpen) {
      soundManager.playChime(784);
      confetti({
        particleCount: 80,
        spread: 75,
        origin: { y: 0.55 },
        colors: ['#8b261e', '#e11d48', '#fda4af', '#dfb858', '#ffffff', '#ffd700']
      });
      setIsBookOpen(true);
    } else {
      soundManager.playChime(587);
      setIsBookOpen(false);
      setMobileFocus('spread');
    }
  };

  const handleCloseModal = () => {
    setIsBookOpen(false);
    setMobileFocus('spread');
    onClose();
  };

  // Dimensions of single page and 2-page spread
  const pageWidth = 340;
  const pageHeight = 500;
  const spreadWidth = pageWidth * 2; // 680px

  // Split active poem into distinct stanzas (spelling K-E-E-S-H-A)
  const stanzas = activePoem
    .split(/\n\s*\n/)
    .map(stanza => stanza.trim().split('\n').map(l => l.trim()).filter(Boolean))
    .filter(stanza => stanza.length > 0);

  // Divide into 2 pages: Left page gets first 3 stanzas (K, E, E), Right page gets next 3 stanzas (S, H, A)
  const leftPageStanzas = stanzas.slice(0, 3);
  const rightPageStanzas = stanzas.slice(3);

  // Responsive scaling
  const isSmallMobile = windowWidth < 680;
  const totalModalHeight = pageHeight + 110;
  const availableWidth = Math.max(260, windowWidth - 24);
  const availableHeight = Math.max(260, windowHeight - 32);

  const activeTargetWidth = isBookOpen
    ? (isSmallMobile && mobileFocus !== 'spread' ? pageWidth : spreadWidth)
    : pageWidth;

  const scaleRatio = Math.min(1, availableWidth / activeTargetWidth, availableHeight / totalModalHeight);

  // Shift offset for mobile single-page focus
  let mobileShiftX = 0;
  if (isBookOpen && isSmallMobile) {
    if (mobileFocus === 'page1') {
      mobileShiftX = pageWidth / 2;
    } else if (mobileFocus === 'page2') {
      mobileShiftX = -pageWidth / 2;
    }
  }

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
          transform: `scale(${scaleRatio}) translateZ(0)`,
          transformOrigin: 'center center',
          transition: 'transform 0.35s ease'
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
            zIndex: 40,
            transition: 'background-color 0.2s ease, transform 0.15s ease'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.4)')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.22)')}
        >
          <X size={20} />
        </button>

        {/* 3D FLIP BOOK STAGE
            When closed: exactly pageWidth (340px) wide, dead center, NO black void on the left!
            When open: expands smoothly to spreadWidth (680px). */}
        <div
          style={{
            position: 'relative',
            width: isBookOpen ? `${spreadWidth}px` : `${pageWidth}px`,
            height: `${pageHeight}px`,
            perspective: '2500px',
            userSelect: 'none',
            transform: `translateX(${mobileShiftX}px)`,
            transition: 'width 0.7s cubic-bezier(0.25, 1, 0.35, 1), transform 0.4s ease'
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* ========================================================
              1. PAGE 2 (INSIDE RIGHT PAGE)
              When closed: sits at left: 0 underneath the cover leaf.
              When open: moves to left: pageWidth (340px) on the right half.
              ======================================================== */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: isBookOpen ? `${pageWidth}px` : 0,
              width: `${pageWidth}px`,
              height: `${pageHeight}px`,
              backgroundImage: "url('/paper-texture.jpg')",
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundColor: '#fbf4e6',
              borderRadius: '0',
              border: '1px solid rgba(205, 190, 168, 0.8)',
              boxShadow: isBookOpen
                ? 'inset 0 0 45px rgba(180, 160, 130, 0.18), 0 20px 45px rgba(0, 0, 0, 0.4)'
                : 'none',
              padding: '24px 20px 18px 20px',
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              overflow: 'hidden',
              opacity: isBookOpen ? 1 : 0,
              pointerEvents: isBookOpen ? 'auto' : 'none',
              zIndex: 1,
              transition: 'left 0.7s cubic-bezier(0.25, 1, 0.35, 1), opacity 0.3s ease 0.1s'
            }}
          >
            {/* Right Page Background SVG Borders */}
            <svg
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
              viewBox={`0 0 ${pageWidth} ${pageHeight}`}
            >
              <rect
                x="14"
                y="14"
                width={pageWidth - 28}
                height={pageHeight - 28}
                fill="none"
                stroke="rgba(145, 120, 90, 0.55)"
                strokeWidth="1.2"
              />
              <rect
                x="19"
                y="19"
                width={pageWidth - 38}
                height={pageHeight - 38}
                fill="none"
                stroke="rgba(145, 120, 90, 0.25)"
                strokeWidth="0.8"
              />
              {/* Corner Accents */}
              <path d={`M ${pageWidth - 19},29 L ${pageWidth - 29},29 L ${pageWidth - 29},19`} fill="none" stroke="rgba(145, 120, 90, 0.6)" strokeWidth="1" />
              <path d={`M ${pageWidth - 19},${pageHeight - 29} L ${pageWidth - 29},${pageHeight - 29} L ${pageWidth - 29},${pageHeight - 19}`} fill="none" stroke="rgba(145, 120, 90, 0.6)" strokeWidth="1" />
            </svg>

            {/* Stanzas 4, 5, 6 (S, H, A) - Centered in Orchid font */}
            <div
              style={{
                fontFamily: "'Orchid', 'Joules et Jacques', 'Cormorant Garamond', 'Italiana', Georgia, serif",
                fontSize: '12.5px',
                lineHeight: '1.65',
                color: '#2a221b',
                textAlign: 'center',
                zIndex: 2,
                marginTop: '6px'
              }}
            >
              {rightPageStanzas.map((stanza, sIdx) => {
                const firstLine = stanza[0] || '';
                const firstChar = firstLine.charAt(0);
                const firstLineRest = firstLine.slice(1);
                const remainingLines = stanza.slice(1);

                return (
                  <div key={sIdx} style={{ marginBottom: '14px', lineHeight: '1.65', textAlign: 'center' }}>
                    <div>
                      {firstChar && (
                        <span
                          style={{
                            fontFamily: "'Orchid', 'Joules et Jacques', 'Cormorant Garamond', Georgia, serif",
                            fontWeight: 'bold',
                            fontSize: '16px',
                            color: '#8b261e',
                            textShadow: '0 1px 1px rgba(0, 0, 0, 0.08)'
                          }}
                        >
                          {firstChar}
                        </span>
                      )}
                      <span style={{ fontStyle: 'italic' }}>{firstLineRest}</span>
                    </div>
                    {remainingLines.map((line, idx) => (
                      <div key={idx} style={{ fontStyle: 'italic' }}>
                        {line}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>

            {/* Centered Sign-off & Page Number */}
            <div style={{ zIndex: 2, marginTop: 'auto', paddingTop: '4px', textAlign: 'center' }}>
              <div style={{ textAlign: 'center' }}>
                <p
                  style={{
                    fontFamily: "'Orchid', 'Joules et Jacques', 'Cormorant Garamond', Georgia, serif",
                    fontSize: '11px',
                    fontStyle: 'italic',
                    letterSpacing: '0.5px',
                    color: '#6e6052',
                    margin: '0 0 1px 0'
                  }}
                >
                  Sincerely yours,
                </p>
                <h2
                  style={{
                    fontFamily: "'Orchid', 'Joules et Jacques', 'Cormorant Garamond', Georgia, serif",
                    fontSize: '24px',
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

              <div style={{ textAlign: 'center', marginTop: '6px' }}>
                <span
                  style={{
                    fontFamily: "'Orchid', 'Joules et Jacques', 'Cormorant Garamond', Georgia, serif",
                    fontSize: '11px',
                    fontStyle: 'italic',
                    color: '#8c765e'
                  }}
                >
                  ~ 2 ~
                </span>
              </div>
            </div>
          </div>

          {/* ========================================================
              2. 3D FLIPPING LEAF (FRONT COVER + PAGE 1)
              Hinged on the spine.
              When closed: at left: 0, rotateY(0deg), showing Front Cover!
              When opened: spine moves to left: pageWidth, and rotates -180deg!
              Back of leaf lands on left half as Page 1!
              ======================================================== */}
          <div
            onClick={handleToggleOpen}
            style={{
              position: 'absolute',
              top: 0,
              left: isBookOpen ? `${pageWidth}px` : 0,
              width: `${pageWidth}px`,
              height: `${pageHeight}px`,
              transformOrigin: 'left center', // Spine hinge
              transformStyle: 'preserve-3d',
              transform: isBookOpen ? 'rotateY(-180deg)' : 'rotateY(0deg)',
              transition: 'transform 0.8s cubic-bezier(0.25, 1, 0.35, 1), left 0.7s cubic-bezier(0.25, 1, 0.35, 1)',
              cursor: 'pointer',
              zIndex: 10
            }}
          >
            {/* ----------------------------------------------------
                2A. FRONT OF LEAF: THE COVER PAGE
                Visible when closed.
                Squared-Up Typography Lockup:
                "Astory
                 to Tell
                 all caps
                 small A big Story
                 big T small tell to show design"
                ---------------------------------------------------- */}
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
                border: '1px solid rgba(205, 190, 168, 0.85)',
                boxShadow: isHovered
                  ? 'inset 0 0 45px rgba(180, 160, 130, 0.2), 0 25px 60px rgba(0, 0, 0, 0.6)'
                  : 'inset 0 0 45px rgba(180, 160, 130, 0.18), 0 20px 48px rgba(0, 0, 0, 0.48)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '24px',
                boxSizing: 'border-box',
                overflow: 'hidden'
              }}
            >
              {/* Vintage Outer Borders & Corner Accents SVG */}
              <svg
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
                viewBox={`0 0 ${pageWidth} ${pageHeight}`}
              >
                <rect
                  x="16"
                  y="16"
                  width={pageWidth - 32}
                  height={pageHeight - 32}
                  fill="none"
                  stroke="rgba(145, 120, 90, 0.65)"
                  strokeWidth="1.5"
                />
                <rect
                  x="22"
                  y="22"
                  width={pageWidth - 44}
                  height={pageHeight - 44}
                  fill="none"
                  stroke="rgba(145, 120, 90, 0.35)"
                  strokeWidth="0.8"
                />
                {/* 4 Corner Ornaments */}
                <path d="M 22,34 L 34,34 L 34,22" fill="none" stroke="rgba(145, 120, 90, 0.7)" strokeWidth="1.2" />
                <circle cx="28" cy="28" r="1.5" fill="rgba(145, 120, 90, 0.75)" />

                <path d={`M ${pageWidth - 22},34 L ${pageWidth - 34},34 L ${pageWidth - 34},22`} fill="none" stroke="rgba(145, 120, 90, 0.7)" strokeWidth="1.2" />
                <circle cx={pageWidth - 28} cy="28" r="1.5" fill="rgba(145, 120, 90, 0.75)" />

                <path d={`M 22,${pageHeight - 34} L 34,${pageHeight - 34} L 34,${pageHeight - 22}`} fill="none" stroke="rgba(145, 120, 90, 0.7)" strokeWidth="1.2" />
                <circle cx="28" cy={pageHeight - 28} r="1.5" fill="rgba(145, 120, 90, 0.75)" />

                <path d={`M ${pageWidth - 22},${pageHeight - 34} L ${pageWidth - 34},${pageHeight - 34} L ${pageWidth - 34},${pageHeight - 22}`} fill="none" stroke="rgba(145, 120, 90, 0.7)" strokeWidth="1.2" />
                <circle cx={pageWidth - 28} cy={pageHeight - 28} r="1.5" fill="rgba(145, 120, 90, 0.75)" />

                {/* Header Fleuron */}
                <path
                  d={`M ${pageWidth / 2 - 20},42 Q ${pageWidth / 2},35 ${pageWidth / 2 + 20},42`}
                  fill="none"
                  stroke="rgba(145, 120, 90, 0.5)"
                  strokeWidth="1"
                />
                <circle cx={pageWidth / 2} cy="38" r="2" fill="rgba(145, 120, 90, 0.65)" />

                {/* Footer Fleuron */}
                <path
                  d={`M ${pageWidth / 2 - 20},${pageHeight - 42} Q ${pageWidth / 2},${pageHeight - 35} ${pageWidth / 2 + 20},${pageHeight - 42}`}
                  fill="none"
                  stroke="rgba(145, 120, 90, 0.5)"
                  strokeWidth="1"
                />
                <circle cx={pageWidth / 2} cy={pageHeight - 38} r="2" fill="rgba(145, 120, 90, 0.65)" />
              </svg>

              {/* ========================================================
                  COVER TITLE: "A STORY TO TELL"
                  - Thin font (Tenor Sans / Plus Jakarta Sans 300)
                  - No border box
                  - Sticks close together
                  - Line 1: A (half height) stepping on the floor + STORY (tall)
                  - Line 2: TO (tall, same as STORY) + TELL (half height) sticking on the ceiling
                  ======================================================== */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0px',
                  userSelect: 'none',
                  zIndex: 2,
                  marginTop: '-4px'
                }}
              >
                {/* LINE 1: A (half height, on floor) + STORY (tall) */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'center',
                    gap: '10px',
                    lineHeight: 0.95
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'Orchid', 'Joules et Jacques', 'Cormorant Garamond', 'Italiana', Georgia, serif",
                      fontSize: '28px',
                      fontWeight: '400',
                      letterSpacing: '3px',
                      textTransform: 'uppercase',
                      color: '#2b231c',
                      lineHeight: 0.95,
                      transform: 'translateY(-2px)'
                    }}
                  >
                    A
                  </span>
                  <span
                    style={{
                      fontFamily: "'Orchid', 'Joules et Jacques', 'Cormorant Garamond', 'Italiana', Georgia, serif",
                      fontSize: '56px',
                      fontWeight: '400',
                      letterSpacing: '5px',
                      textTransform: 'uppercase',
                      color: '#1a1410',
                      lineHeight: 0.95
                    }}
                  >
                    STORY
                  </span>
                </div>

                {/* LINE 2: TO (tall, same as STORY) + TELL (half height, on ceiling) */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'center',
                    gap: '10px',
                    lineHeight: 0.95,
                    marginTop: '2px'
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'Orchid', 'Joules et Jacques', 'Cormorant Garamond', 'Italiana', Georgia, serif",
                      fontSize: '56px',
                      fontWeight: '400',
                      letterSpacing: '5px',
                      textTransform: 'uppercase',
                      color: '#1a1410',
                      lineHeight: 0.95
                    }}
                  >
                    TO
                  </span>
                  <span
                    style={{
                      fontFamily: "'Orchid', 'Joules et Jacques', 'Cormorant Garamond', 'Italiana', Georgia, serif",
                      fontSize: '28px',
                      fontWeight: '400',
                      letterSpacing: '4px',
                      textTransform: 'uppercase',
                      color: '#2b231c',
                      lineHeight: 0.95,
                      transform: 'translateY(2px)'
                    }}
                  >
                    TELL
                  </span>
                </div>
              </div>

              {/* Bottom Tap to Open Prompt */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '34px',
                  left: 0,
                  right: 0,
                  textAlign: 'center',
                  pointerEvents: 'none'
                }}
              >
                <span
                  style={{
                    fontFamily: "'Orchid', 'Joules et Jacques', 'Cormorant Garamond', Georgia, serif",
                    fontSize: '11px',
                    letterSpacing: '2.5px',
                    textTransform: 'uppercase',
                    color: 'rgba(120, 95, 70, 0.75)'
                  }}
                >
                  tap book to open ↻
                </span>
              </div>
            </div>

            {/* ----------------------------------------------------
                2B. BACK OF LEAF: PAGE 1 (INSIDE LEFT PAGE)
                Visible when flipped open (rotateY: -180deg).
                Flipped 180deg relative to leaf so it faces user when open!
                ---------------------------------------------------- */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)',
                backgroundImage: "url('/paper-texture.jpg')",
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundColor: '#fbf4e6',
                borderRadius: '0',
                border: '1px solid rgba(205, 190, 168, 0.8)',
                boxShadow: 'inset 0 0 45px rgba(180, 160, 130, 0.18), 0 20px 45px rgba(0, 0, 0, 0.4)',
                padding: '24px 20px 18px 20px',
                boxSizing: 'border-box',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                overflow: 'hidden'
              }}
            >
              {/* Left Page Background SVG Borders */}
              <svg
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
                viewBox={`0 0 ${pageWidth} ${pageHeight}`}
              >
                <rect
                  x="14"
                  y="14"
                  width={pageWidth - 28}
                  height={pageHeight - 28}
                  fill="none"
                  stroke="rgba(145, 120, 90, 0.55)"
                  strokeWidth="1.2"
                />
                <rect
                  x="19"
                  y="19"
                  width={pageWidth - 38}
                  height={pageHeight - 38}
                  fill="none"
                  stroke="rgba(145, 120, 90, 0.25)"
                  strokeWidth="0.8"
                />
                {/* Corner Accents on Left */}
                <path d="M 19,29 L 29,29 L 29,19" fill="none" stroke="rgba(145, 120, 90, 0.6)" strokeWidth="1" />
                <path d={`M 19,${pageHeight - 29} L 29,${pageHeight - 29} L 29,${pageHeight - 19}`} fill="none" stroke="rgba(145, 120, 90, 0.6)" strokeWidth="1" />
              </svg>

              {/* Top Header: A story to tell */}
              <div style={{ textAlign: 'center', marginBottom: '8px', flexShrink: 0, zIndex: 2 }}>
                <p
                  style={{
                    fontFamily: "'Orchid', 'Joules et Jacques', 'Cormorant Garamond', 'Italiana', Georgia, serif",
                    fontSize: '12px',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: '4.5px',
                    color: '#5c4d3e',
                    margin: 0
                  }}
                >
                  A story to tell
                </p>
              </div>

              {/* Stanzas 1, 2, 3 (K, E, E) - Centered in Orchid font */}
              <div
                style={{
                  fontFamily: "'Orchid', 'Joules et Jacques', 'Cormorant Garamond', 'Italiana', Georgia, serif",
                  fontSize: '12.5px',
                  lineHeight: '1.65',
                  color: '#2a221b',
                  textAlign: 'center',
                  zIndex: 2,
                  marginTop: '6px'
                }}
              >
                {leftPageStanzas.map((stanza, sIdx) => {
                  const firstLine = stanza[0] || '';
                  const firstChar = firstLine.charAt(0);
                  const firstLineRest = firstLine.slice(1);
                  const remainingLines = stanza.slice(1);

                  return (
                    <div key={sIdx} style={{ marginBottom: '14px', lineHeight: '1.65', textAlign: 'center' }}>
                      <div>
                        {firstChar && (
                          <span
                            style={{
                              fontFamily: "'Orchid', 'Joules et Jacques', 'Cormorant Garamond', Georgia, serif",
                              fontWeight: 'bold',
                              fontSize: '16px',
                              color: '#8b261e',
                              textShadow: '0 1px 1px rgba(0, 0, 0, 0.08)'
                            }}
                          >
                            {firstChar}
                          </span>
                        )}
                        <span style={{ fontStyle: 'italic' }}>{firstLineRest}</span>
                      </div>
                      {remainingLines.map((line, idx) => (
                        <div key={idx} style={{ fontStyle: 'italic' }}>
                          {line}
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>

              {/* Page Number */}
              <div style={{ textAlign: 'center', marginTop: 'auto', paddingTop: '4px', zIndex: 2 }}>
                <span
                  style={{
                    fontFamily: "'Orchid', 'Joules et Jacques', 'Cormorant Garamond', Georgia, serif",
                    fontSize: '11px',
                    fontStyle: 'italic',
                    color: '#8c765e'
                  }}
                >
                  ~ 1 ~
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* INTERACTION TOOLBAR BELOW FLIP BOOK */}
        <div style={{ marginTop: '18px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
          {/* Main Open / Close Flip Button */}
          <button
            onClick={handleToggleOpen}
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
            <span>{isBookOpen ? 'Close Book' : 'Open Book'}</span>
          </button>

          {/* Small Screen Page Focus (Page 1 / Both / Page 2) */}
          {isBookOpen && isSmallMobile && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: 'rgba(15, 18, 24, 0.85)',
                border: '1px solid rgba(205, 190, 168, 0.4)',
                borderRadius: '9999px',
                padding: '3px',
                gap: '2px'
              }}
            >
              <button
                onClick={() => setMobileFocus('page1')}
                style={{
                  padding: '7px 12px',
                  borderRadius: '9999px',
                  fontSize: '11px',
                  fontWeight: '600',
                  color: mobileFocus === 'page1' ? '#1c1917' : '#e7e5e4',
                  backgroundColor: mobileFocus === 'page1' ? '#fbf7ee' : 'transparent',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Page 1
              </button>
              <button
                onClick={() => setMobileFocus('spread')}
                style={{
                  padding: '7px 12px',
                  borderRadius: '9999px',
                  fontSize: '11px',
                  fontWeight: '600',
                  color: mobileFocus === 'spread' ? '#1c1917' : '#e7e5e4',
                  backgroundColor: mobileFocus === 'spread' ? '#fbf7ee' : 'transparent',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Both
              </button>
              <button
                onClick={() => setMobileFocus('page2')}
                style={{
                  padding: '7px 12px',
                  borderRadius: '9999px',
                  fontSize: '11px',
                  fontWeight: '600',
                  color: mobileFocus === 'page2' ? '#1c1917' : '#e7e5e4',
                  backgroundColor: mobileFocus === 'page2' ? '#fbf7ee' : 'transparent',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Page 2
              </button>
            </div>
          )}

          {/* Close Modal Button */}
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
