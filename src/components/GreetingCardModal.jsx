import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { X, ArrowLeft, BookOpen, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';
import { soundManager } from '../utils/audioSynth.js';

export default function GreetingCardModal({
  isOpen,
  onClose,
  settings,
  updateSettings
}) {
  const [isCardOpen, setIsCardOpen] = useState(false);
  const [mobileView, setMobileView] = useState('spread'); // 'page1' | 'page2' | 'spread'
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
    if (!isCardOpen) {
      soundManager.playChime(784);
      confetti({
        particleCount: 80,
        spread: 75,
        origin: { y: 0.55 },
        colors: ['#f43f5e', '#fb7185', '#dfb858', '#ffffff', '#38bdf8']
      });
      setIsCardOpen(true);
    } else {
      soundManager.playChime(587);
      setIsCardOpen(false);
    }
  };

  const handleCloseModal = () => {
    setIsCardOpen(false);
    onClose();
  };

  // Dimensions of single page and open 2-page spread
  const pageWidth = 370;
  const pageHeight = 550;
  const spreadWidth = pageWidth * 2; // 740px

  const isMobileScreen = windowWidth < 740;
  const currentCardWidth = isCardOpen 
    ? (isMobileScreen && mobileView !== 'spread' ? pageWidth : spreadWidth) 
    : pageWidth;

  // Split active poem into stanzas (6 stanzas spelling K-E-E-S-H-A)
  const stanzas = activePoem
    .split(/\n\s*\n/)
    .map(stanza => stanza.trim().split('\n').map(l => l.trim()).filter(Boolean))
    .filter(stanza => stanza.length > 0);

  // Left page gets first 3 stanzas (K, E, E), Right page gets next 3 stanzas (S, H, A)
  const leftPageStanzas = stanzas.slice(0, 3);
  const rightPageStanzas = stanzas.slice(3, 6);

  // Responsive scale factor to fit any screen
  const availableWidth = Math.max(260, windowWidth - 24);
  const availableHeight = Math.max(260, windowHeight - 40);
  const totalModalHeight = pageHeight + 90;
  const scaleRatio = Math.min(1, availableWidth / currentCardWidth, availableHeight / totalModalHeight);

  // Helper to render a group of stanzas with drop caps
  const renderStanzaGroup = (groupStanzas) => {
    return groupStanzas.map((stanza, sIdx) => {
      const firstLine = stanza[0] || '';
      const firstChar = firstLine.charAt(0);
      const firstLineRest = firstLine.slice(1);
      const remainingLines = stanza.slice(1);

      return (
        <div key={sIdx} style={{ marginBottom: '16px', lineHeight: '1.65' }}>
          {firstChar && (
            <span
              style={{
                float: 'left',
                fontSize: '44px',
                lineHeight: '34px',
                paddingTop: '2px',
                paddingRight: firstChar === 'I' ? '5px' : '7px',
                paddingBottom: '0px',
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontWeight: 'bold',
                color: '#f43f5e',
                textShadow: '0 0 12px rgba(244, 63, 94, 0.4)',
                userSelect: 'none'
              }}
            >
              {firstChar}
            </span>
          )}
          <span style={{ fontStyle: 'italic', color: '#f1f5f9' }}>{firstLineRest}</span>
          {remainingLines.map((line, idx) => (
            <React.Fragment key={idx}>
              <br />
              <span style={{ fontStyle: 'italic', color: '#e2e8f0' }}>{line}</span>
            </React.Fragment>
          ))}
          <div style={{ clear: 'both' }} />
        </div>
      );
    });
  };

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
        backgroundColor: 'rgba(5, 7, 12, 0.90)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
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
        {/* Floating Top Close Button (X) */}
        <button
          onClick={handleCloseModal}
          title="Close Modal"
          style={{
            position: 'absolute',
            top: '-48px',
            right: 0,
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.12)',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 30,
            transition: 'background-color 0.2s ease, transform 0.15s ease'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.28)')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.12)')}
        >
          <X size={18} />
        </button>

        {/* ========================================================
            MACBOOK RETINA SCREEN CHASSIS (Apple Window Design)
            ======================================================== */}
        <div
          style={{
            position: 'relative',
            width: `${currentCardWidth}px`,
            height: `${pageHeight}px`,
            borderRadius: '18px',
            backgroundColor: '#12151d',
            border: '1.5px solid rgba(255, 255, 255, 0.15)',
            boxShadow: isHovered
              ? '0 30px 80px rgba(0, 0, 0, 0.8), 0 0 40px rgba(244, 63, 94, 0.15)'
              : '0 25px 65px rgba(0, 0, 0, 0.75)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            transition: 'width 0.45s cubic-bezier(0.25, 1, 0.35, 1), box-shadow 0.3s ease',
            userSelect: 'none'
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* --- 1. macOS TITLE BAR (Traffic Lights + Camera Dot + Window Title) --- */}
          <div
            style={{
              height: '38px',
              backgroundColor: 'rgba(26, 30, 42, 0.95)',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 14px',
              flexShrink: 0,
              zIndex: 10
            }}
          >
            {/* Left: macOS Traffic Light Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
              <div
                onClick={handleCloseModal}
                title="Close"
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  backgroundColor: '#ff5f56',
                  border: '1px solid #e0443e',
                  cursor: 'pointer',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.3)'
                }}
              />
              <div
                onClick={handleToggleOpen}
                title={isCardOpen ? "Fold Card" : "Open 2-Page Spread"}
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  backgroundColor: '#ffbd2e',
                  border: '1px solid #dea123',
                  cursor: 'pointer',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.3)'
                }}
              />
              <div
                onClick={handleToggleOpen}
                title="Full View"
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  backgroundColor: '#27c93f',
                  border: '1px solid #1aab29',
                  cursor: 'pointer',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.3)'
                }}
              />
            </div>

            {/* Center: MacBook Camera Notch & Window Title */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  backgroundColor: '#0a0d14',
                  border: '1px solid rgba(255, 255, 255, 0.15)'
                }}
              />
              <span
                style={{
                  fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
                  fontSize: '12px',
                  fontWeight: '500',
                  color: 'rgba(255, 255, 255, 0.75)',
                  letterSpacing: '0.3px'
                }}
              >
                a story to tell
              </span>
            </div>

            {/* Right: Mode Badge or Mobile Page Switcher */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {isCardOpen && isMobileScreen ? (
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button
                    onClick={() => setMobileView('page1')}
                    style={{
                      padding: '2px 8px',
                      borderRadius: '6px',
                      fontSize: '10.5px',
                      fontWeight: '600',
                      backgroundColor: mobileView === 'page1' ? '#f43f5e' : 'rgba(255,255,255,0.08)',
                      color: '#ffffff'
                    }}
                  >
                    P1
                  </button>
                  <button
                    onClick={() => setMobileView('page2')}
                    style={{
                      padding: '2px 8px',
                      borderRadius: '6px',
                      fontSize: '10.5px',
                      fontWeight: '600',
                      backgroundColor: mobileView === 'page2' ? '#f43f5e' : 'rgba(255,255,255,0.08)',
                      color: '#ffffff'
                    }}
                  >
                    P2
                  </button>
                  <button
                    onClick={() => setMobileView('spread')}
                    style={{
                      padding: '2px 8px',
                      borderRadius: '6px',
                      fontSize: '10.5px',
                      fontWeight: '600',
                      backgroundColor: mobileView === 'spread' ? '#f43f5e' : 'rgba(255,255,255,0.08)',
                      color: '#ffffff'
                    }}
                  >
                    Both
                  </button>
                </div>
              ) : (
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: '500',
                    color: 'rgba(255, 255, 255, 0.4)',
                    letterSpacing: '0.5px'
                  }}
                >
                  {isCardOpen ? '2-Page Spread' : 'Cover'}
                </span>
              )}
            </div>
          </div>

          {/* --- 2. SCREEN BODY: SWITCHES BETWEEN FRONT COVER AND 2-PAGE SPREAD --- */}
          <div
            style={{
              flex: 1,
              position: 'relative',
              overflow: 'hidden',
              backgroundColor: '#151822',
              backgroundImage: 'radial-gradient(ellipse at 50% 0%, rgba(30, 36, 52, 0.6) 0%, rgba(15, 18, 26, 0.95) 100%)'
            }}
          >
            {!isCardOpen ? (
              /* ========================================================
                  FRONT COVER: A STORY TO TELL (MacBook Screen Simplicity)
                  ======================================================== */
              <div
                onClick={handleToggleOpen}
                style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '36px 28px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {/* Subtle Apple-style glow circle in background */}
                <div
                  style={{
                    position: 'absolute',
                    top: '25%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '260px',
                    height: '260px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(244, 63, 94, 0.12) 0%, transparent 70%)',
                    pointerEvents: 'none'
                  }}
                />

                {/* Minimalist pill badge */}
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '5px 14px',
                    borderRadius: '9999px',
                    backgroundColor: 'rgba(244, 63, 94, 0.10)',
                    border: '1px solid rgba(244, 63, 94, 0.28)',
                    marginBottom: '26px'
                  }}
                >
                  <Sparkles size={12} style={{ color: '#fb7185' }} />
                  <span
                    style={{
                      fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
                      fontSize: '11px',
                      fontWeight: '600',
                      letterSpacing: '2px',
                      textTransform: 'uppercase',
                      color: '#fb7185'
                    }}
                  >
                    Personal Message
                  </span>
                </div>

                {/* Main Clean Title: "a story to tell" */}
                <h1
                  style={{
                    fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
                    fontSize: '34px',
                    fontWeight: '700',
                    letterSpacing: '-0.5px',
                    color: '#ffffff',
                    lineHeight: '1.2',
                    margin: '0 0 16px 0',
                    textShadow: '0 2px 14px rgba(0, 0, 0, 0.6)'
                  }}
                >
                  a story to tell
                </h1>

                {/* Delicate Divider Line */}
                <div
                  style={{
                    width: '42px',
                    height: '2px',
                    backgroundColor: 'rgba(244, 63, 94, 0.6)',
                    borderRadius: '2px',
                    margin: '0 auto 18px auto'
                  }}
                />

                {/* Subtitle description */}
                <p
                  style={{
                    fontFamily: "'Poppins', sans-serif",
                    fontSize: '13px',
                    color: 'rgba(255, 255, 255, 0.65)',
                    lineHeight: '1.7',
                    maxWidth: '280px',
                    margin: '0 0 36px 0'
                  }}
                >
                  A romantic two-page flip card written in verses just for you.
                </p>

                {/* Interactive Click-to-Open Callout */}
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px 28px',
                    borderRadius: '9999px',
                    background: 'linear-gradient(135deg, #e11d48, #f43f5e)',
                    color: '#ffffff',
                    fontSize: '13px',
                    fontWeight: '600',
                    letterSpacing: '0.3px',
                    boxShadow: '0 8px 24px rgba(225, 29, 72, 0.45)',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.04)')}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1.0)')}
                >
                  <BookOpen size={16} />
                  <span>Click to Flip Open</span>
                </div>
              </div>
            ) : (
              /* ========================================================
                  TWO-PAGE FLIP BOOK SPREAD (MacBook Dual Screen Pages)
                  ======================================================== */
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  position: 'relative',
                  overflowY: 'auto',
                  overflowX: 'hidden',
                  scrollbarWidth: 'thin',
                  scrollbarColor: 'rgba(244, 63, 94, 0.3) transparent'
                }}
                className="card-scroll"
              >
                {/* ----------------- LEFT PAGE (PAGE 1: STANZAS K, E, E) ----------------- */}
                {(!isMobileScreen || mobileView === 'page1' || mobileView === 'spread') && (
                  <div
                    style={{
                      flex: 1,
                      minWidth: isMobileScreen && mobileView !== 'spread' ? '100%' : `${pageWidth}px`,
                      padding: '32px 28px 28px 30px',
                      boxSizing: 'border-box',
                      borderRight: (!isMobileScreen || mobileView === 'spread') ? '1px solid rgba(255, 255, 255, 0.08)' : 'none',
                      boxShadow: (!isMobileScreen || mobileView === 'spread') 
                        ? 'inset -12px 0 20px -8px rgba(0, 0, 0, 0.35)' 
                        : 'none',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      position: 'relative'
                    }}
                  >
                    <div>
                      {/* Left Page Top Header */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                        <span
                          style={{
                            fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
                            fontSize: '11px',
                            fontWeight: '600',
                            letterSpacing: '1.5px',
                            textTransform: 'uppercase',
                            color: 'rgba(255, 255, 255, 0.45)'
                          }}
                        >
                          Page 1 • Stanzas I - III
                        </span>
                        <span style={{ fontSize: '11px', color: 'rgba(244, 63, 94, 0.7)', fontWeight: '600' }}>
                          K • E • E
                        </span>
                      </div>

                      {/* Left Page Stanzas (Stanzas 1, 2, 3) */}
                      <div
                        style={{
                          fontFamily: "'Poppins', sans-serif",
                          fontSize: '12px',
                          lineHeight: '1.65',
                          fontWeight: '400',
                          color: '#e2e8f0'
                        }}
                      >
                        {renderStanzaGroup(leftPageStanzas)}
                      </div>
                    </div>

                    {/* Bottom Page Indicator */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px' }}>
                      <span style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.35)' }}>
                        a story to tell
                      </span>
                      <span style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.35)' }}>
                        1 / 2
                      </span>
                    </div>
                  </div>
                )}

                {/* ----------------- RIGHT PAGE (PAGE 2: STANZAS S, H, A + SIGNATURE) ----------------- */}
                {(!isMobileScreen || mobileView === 'page2' || mobileView === 'spread') && (
                  <div
                    style={{
                      flex: 1,
                      minWidth: isMobileScreen && mobileView !== 'spread' ? '100%' : `${pageWidth}px`,
                      padding: '32px 30px 28px 28px',
                      boxSizing: 'border-box',
                      boxShadow: (!isMobileScreen || mobileView === 'spread') 
                        ? 'inset 12px 0 20px -8px rgba(0, 0, 0, 0.35)' 
                        : 'none',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      position: 'relative'
                    }}
                  >
                    <div>
                      {/* Right Page Top Header */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                        <span
                          style={{
                            fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
                            fontSize: '11px',
                            fontWeight: '600',
                            letterSpacing: '1.5px',
                            textTransform: 'uppercase',
                            color: 'rgba(255, 255, 255, 0.45)'
                          }}
                        >
                          Page 2 • Stanzas IV - VI
                        </span>
                        <span style={{ fontSize: '11px', color: 'rgba(244, 63, 94, 0.7)', fontWeight: '600' }}>
                          S • H • A
                        </span>
                      </div>

                      {/* Right Page Stanzas (Stanzas 4, 5, 6) */}
                      <div
                        style={{
                          fontFamily: "'Poppins', sans-serif",
                          fontSize: '12px',
                          lineHeight: '1.65',
                          fontWeight: '400',
                          color: '#e2e8f0'
                        }}
                      >
                        {renderStanzaGroup(rightPageStanzas)}
                      </div>
                    </div>

                    {/* Bottom Sign-off: "Sincerely yours, chuchu ❤️" */}
                    <div style={{ textAlign: 'right', paddingTop: '10px' }}>
                      <p
                        style={{
                          fontFamily: "'Poppins', sans-serif",
                          fontSize: '11.5px',
                          letterSpacing: '0.5px',
                          color: 'rgba(255, 255, 255, 0.65)',
                          margin: '0 0 2px 0'
                        }}
                      >
                        Sincerely yours,
                      </p>
                      <h2
                        style={{
                          fontFamily: "'Cormorant Garamond', Georgia, serif",
                          fontSize: '28px',
                          fontWeight: 'bold',
                          fontStyle: 'italic',
                          color: '#fb7185',
                          textShadow: '0 0 10px rgba(251, 113, 133, 0.4)',
                          margin: 0
                        }}
                      >
                        {sender} ❤️
                      </h2>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ========================================================
            INTERACTION TOOLBAR BELOW MACBOOK CARD
            ======================================================== */}
        <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={handleToggleOpen}
            style={{
              padding: '10px 22px',
              borderRadius: '9999px',
              backgroundColor: 'rgba(20, 24, 34, 0.95)',
              border: '1.5px solid rgba(244, 63, 94, 0.6)',
              boxShadow: '0 8px 22px rgba(0, 0, 0, 0.5)',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: '600',
              letterSpacing: '0.4px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              userSelect: 'none',
              minHeight: '42px',
              transition: 'transform 0.2s ease, background-color 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(30, 36, 50, 0.98)';
              e.currentTarget.style.transform = 'scale(1.04)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(20, 24, 34, 0.95)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <BookOpen size={15} style={{ color: '#fb7185' }} />
            <span>{isCardOpen ? 'Fold Card' : 'Open 2-Page Book'}</span>
          </button>

          <button
            onClick={handleCloseModal}
            style={{
              padding: '10px 22px',
              borderRadius: '9999px',
              backgroundColor: 'rgba(255, 255, 255, 0.12)',
              border: '1.5px solid rgba(255, 255, 255, 0.25)',
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.35)',
              color: '#f8fafc',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              minHeight: '42px',
              transition: 'background-color 0.15s ease, transform 0.1s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.22)';
              e.currentTarget.style.transform = 'scale(1.03)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.12)';
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
