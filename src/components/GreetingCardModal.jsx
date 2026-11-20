import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { X, ArrowLeft, Sparkles, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';
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

  const defaultPoem = `Kind of hard to focus when you’re floating through my mind,
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
Because loving you is deeper than the bottom of the sea.`;

  const rawMessage = settings?.giftMessage;
  const isOldDefault = !rawMessage || 
    rawMessage.includes('Every petal in this bouquet was gathered') ||
    rawMessage.includes('Every petal gathered in the dawn');
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
  const pageWidth = 330;
  const pageHeight = 490;
  const spreadWidth = pageWidth * 2; // 660px

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

  let targetWidth = spreadWidth;
  if (!isBookOpen) {
    targetWidth = pageWidth;
  } else if (isSmallMobile && mobileFocus !== 'spread') {
    targetWidth = pageWidth;
  }

  const scaleRatio = Math.min(1, availableWidth / targetWidth, availableHeight / totalModalHeight);

  // When focused on Page 1 or Page 2 on small screens, shift translation
  let containerTranslateX = 0;
  if (isBookOpen && isSmallMobile) {
    if (mobileFocus === 'page1') {
      containerTranslateX = pageWidth / 2; // bring left page to center
    } else if (mobileFocus === 'page2') {
      containerTranslateX = -pageWidth / 2; // bring right page to center
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
          transform: `scale(${scaleRatio})`,
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
            zIndex: 30,
            transition: 'background-color 0.2s ease, transform 0.15s ease'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.4)')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.22)')}
        >
          <X size={20} />
        </button>

        {/* 3D FLIP BOOK STAGE */}
        <div
          style={{
            position: 'relative',
            width: `${isBookOpen ? spreadWidth : pageWidth}px`,
            height: `${pageHeight}px`,
            perspective: '2500px',
            userSelect: 'none',
            transition: 'width 0.6s cubic-bezier(0.25, 1, 0.35, 1)'
          }}
        >
          {/* THE 2-PAGE SPREAD CONTAINER */}
          <div
            style={{
              position: 'relative',
              width: `${spreadWidth}px`,
              height: `${pageHeight}px`,
              transformStyle: 'preserve-3d',
              // When closed, offset by -pageWidth/2 so the closed front cover sits dead-center on screen!
              transform: isBookOpen
                ? `translateX(${containerTranslateX}px)`
                : `translateX(-${pageWidth / 2}px)`,
              transition: 'transform 0.75s cubic-bezier(0.25, 1, 0.35, 1), box-shadow 0.4s ease',
              borderRadius: '0',
              boxShadow: isHovered
                ? '0 30px 70px rgba(0, 0, 0, 0.65), 0 0 35px rgba(180, 150, 110, 0.25)'
                : '0 22px 55px rgba(0, 0, 0, 0.5)'
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* ========================================================
                1. FIXED BASE (PAGE 2 - INSIDE RIGHT PAGE)
                Sits on the right half of the spread (x: pageWidth -> spreadWidth).
                Visible when the front cover leaf is flipped open!
                ======================================================== */}
            <div
              className="card-scroll"
              style={{
                position: 'absolute',
                top: 0,
                left: `${pageWidth}px`,
                width: `${pageWidth}px`,
                height: `${pageHeight}px`,
                backgroundImage: "url('/paper-texture.jpg')",
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundColor: '#fbf4e6',
                borderRadius: '0',
                border: '1px solid rgba(205, 190, 168, 0.8)',
                boxShadow: 'inset 0 0 45px rgba(180, 160, 130, 0.18)',
                padding: '28px 24px 22px 24px',
                boxSizing: 'border-box',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                overflowY: 'auto',
                overflowX: 'hidden',
                WebkitOverflowScrolling: 'touch',
                zIndex: 1
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

              {/* Stanzas 4, 5, 6 (S, H, A) */}
              <div
                style={{
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: '12px',
                  lineHeight: '1.65',
                  color: '#2d251f',
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
                    <div key={sIdx} style={{ marginBottom: '13px', lineHeight: '1.65' }}>
                      {firstChar && (
                        <span
                          style={{
                            float: 'left',
                            fontSize: '40px',
                            lineHeight: '32px',
                            paddingTop: '2px',
                            paddingRight: firstChar === 'I' ? '4px' : '6px',
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

              {/* Sign-off & Page Number */}
              <div style={{ zIndex: 2, marginTop: 'auto', paddingTop: '8px' }}>
                <div style={{ textAlign: 'right' }}>
                  <p
                    style={{
                      fontFamily: "'Poppins', sans-serif",
                      fontSize: '11px',
                      letterSpacing: '0.5px',
                      color: '#6e6052',
                      margin: '0 0 1px 0'
                    }}
                  >
                    Sincerely yours,
                  </p>
                  <h2
                    style={{
                      fontFamily: "'Cormorant Garamond', Georgia, serif",
                      fontSize: '26px',
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
                      fontFamily: "'Cormorant Garamond', Georgia, serif",
                      fontSize: '12px',
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
                Hinged at the center spine (x = pageWidth).
                When closed: rotateY(0deg) covers Right Page (Page 2).
                When opened: rotateY(-180deg) flips over to Left Page (Page 1)!
                ======================================================== */}
            <div
              onClick={handleToggleOpen}
              style={{
                position: 'absolute',
                top: 0,
                left: `${pageWidth}px`,
                width: `${pageWidth}px`,
                height: `${pageHeight}px`,
                transformOrigin: 'left center', // Central spine hinge
                transformStyle: 'preserve-3d',
                transform: isBookOpen ? 'rotateY(-180deg)' : 'rotateY(0deg)',
                transition: 'transform 0.85s cubic-bezier(0.25, 1, 0.35, 1)',
                cursor: 'pointer',
                zIndex: isBookOpen ? 10 : 20
              }}
            >
              {/* ----------------------------------------------------
                  2A. FRONT OF LEAF: THE FRONT COVER
                  Visible when closed (rotateY: 0deg).
                  Requested Design:
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
                  border: '1px solid rgba(205, 190, 168, 0.8)',
                  boxShadow: 'inset 0 0 45px rgba(180, 160, 130, 0.18)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '24px',
                  boxSizing: 'border-box',
                  overflow: 'hidden'
                }}
              >
                {/* Vintage Border & Corner Accents SVG */}
                <svg
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
                  viewBox={`0 0 ${pageWidth} ${pageHeight}`}
                >
                  {/* Outer Frame */}
                  <rect
                    x="16"
                    y="16"
                    width={pageWidth - 32}
                    height={pageHeight - 32}
                    fill="none"
                    stroke="rgba(145, 120, 90, 0.65)"
                    strokeWidth="1.5"
                  />
                  {/* Inner Hairline Frame */}
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
                    FRONT COVER TYPOGRAPHY
                    Line 1: small "A", big "STORY"
                    Line 2: small "TO", big "T", small "ELL"
                    ALL CAPS, Editorial Vintage Elegance
                    ======================================================== */}
                <div style={{ textAlign: 'center', userSelect: 'none', padding: '0 16px', zIndex: 2 }}>
                  {/* Line 1: small A, big STORY */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'baseline',
                      justifyContent: 'center',
                      gap: '10px',
                      lineHeight: 1,
                      marginBottom: '8px'
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "'Poppins', sans-serif",
                        fontSize: '15px',
                        fontWeight: '600',
                        letterSpacing: '5px',
                        textTransform: 'uppercase',
                        color: '#6e5a46',
                        transform: 'translateY(-2px)'
                      }}
                    >
                      A
                    </span>
                    <span
                      style={{
                        fontFamily: "'Cormorant Garamond', Georgia, serif",
                        fontSize: '44px',
                        fontWeight: '700',
                        letterSpacing: '5px',
                        textTransform: 'uppercase',
                        color: '#2a221b',
                        textShadow: '0 1px 2px rgba(0, 0, 0, 0.08)'
                      }}
                    >
                      STORY
                    </span>
                  </div>

                  {/* Delicate ornamental divider */}
                  <div
                    style={{
                      margin: '10px auto 14px auto',
                      width: '74px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(145, 120, 90, 0.45)' }} />
                    <span style={{ fontSize: '10px', color: 'rgba(145, 120, 90, 0.7)' }}>✦</span>
                    <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(145, 120, 90, 0.45)' }} />
                  </div>

                  {/* Line 2: TO, big T, small TELL */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'baseline',
                      justifyContent: 'center',
                      gap: '8px',
                      lineHeight: 1
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "'Poppins', sans-serif",
                        fontSize: '15px',
                        fontWeight: '600',
                        letterSpacing: '4px',
                        textTransform: 'uppercase',
                        color: '#6e5a46',
                        transform: 'translateY(-2px)'
                      }}
                    >
                      TO
                    </span>
                    <div style={{ display: 'inline-flex', alignItems: 'baseline' }}>
                      <span
                        style={{
                          fontFamily: "'Cormorant Garamond', Georgia, serif",
                          fontSize: '44px',
                          fontWeight: '700',
                          letterSpacing: '2px',
                          textTransform: 'uppercase',
                          color: '#8b261e', // Crimson emphasis on the big T
                          textShadow: '0 1px 2px rgba(0, 0, 0, 0.08)'
                        }}
                      >
                        T
                      </span>
                      <span
                        style={{
                          fontFamily: "'Cormorant Garamond', Georgia, serif",
                          fontSize: '24px',
                          fontWeight: '700',
                          letterSpacing: '4px',
                          textTransform: 'uppercase',
                          color: '#2a221b',
                          textShadow: '0 1px 2px rgba(0, 0, 0, 0.08)'
                        }}
                      >
                        ELL
                      </span>
                    </div>
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
                      fontFamily: "'Poppins', sans-serif",
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
                className="card-scroll"
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
                  boxShadow: 'inset 0 0 45px rgba(180, 160, 130, 0.18)',
                  padding: '28px 24px 22px 24px',
                  boxSizing: 'border-box',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  overflowY: 'auto',
                  overflowX: 'hidden',
                  WebkitOverflowScrolling: 'touch'
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

                {/* Top Header: A letter 4 u */}
                <div style={{ textAlign: 'center', marginBottom: '10px', flexShrink: 0, zIndex: 2 }}>
                  <p
                    style={{
                      fontFamily: "'Poppins', sans-serif",
                      fontSize: '11px',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      letterSpacing: '4px',
                      color: '#5c4d3e',
                      margin: 0
                    }}
                  >
                    A letter 4 u
                  </p>
                </div>

                {/* Stanzas 1, 2, 3 (K, E, E) */}
                <div
                  style={{
                    fontFamily: "'Poppins', sans-serif",
                    fontSize: '12px',
                    lineHeight: '1.65',
                    color: '#2d251f',
                    zIndex: 2
                  }}
                >
                  {leftPageStanzas.map((stanza, sIdx) => {
                    const firstLine = stanza[0] || '';
                    const firstChar = firstLine.charAt(0);
                    const firstLineRest = firstLine.slice(1);
                    const remainingLines = stanza.slice(1);

                    return (
                      <div key={sIdx} style={{ marginBottom: '13px', lineHeight: '1.65' }}>
                        {firstChar && (
                          <span
                            style={{
                              float: 'left',
                              fontSize: '40px',
                              lineHeight: '32px',
                              paddingTop: '2px',
                              paddingRight: firstChar === 'I' ? '4px' : '6px',
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

                {/* Page Number */}
                <div style={{ textAlign: 'center', marginTop: 'auto', paddingTop: '6px', zIndex: 2 }}>
                  <span
                    style={{
                      fontFamily: "'Cormorant Garamond', Georgia, serif",
                      fontSize: '12px',
                      fontStyle: 'italic',
                      color: '#8c765e'
                    }}
                  >
                    ~ 1 ~
                  </span>
                </div>
              </div>
            </div>

            {/* ========================================================
                3. CENTRAL BOOK SPINE CREASE SHADOW
                Enhances 3D depth down the center fold when open.
                ======================================================== */}
            {isBookOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: `${pageWidth - 14}px`,
                  width: '28px',
                  height: '100%',
                  background: 'linear-gradient(to right, rgba(0,0,0,0.18), rgba(0,0,0,0.03) 30%, rgba(255,255,255,0.05) 50%, rgba(0,0,0,0.03) 70%, rgba(0,0,0,0.18))',
                  pointerEvents: 'none',
                  zIndex: 15
                }}
              />
            )}
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

          {/* Small Screen Page Selector (Spread / Page 1 / Page 2) */}
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
