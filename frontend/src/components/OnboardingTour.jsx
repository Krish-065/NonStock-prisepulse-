import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { 
  Sparkles, 
  TrendingUp, 
  LineChart, 
  Users, 
  Calculator, 
  LayoutDashboard, 
  MessageSquare,
  Bot,
  Award,
  Check,
  ChevronRight,
  ChevronLeft,
  X
} from 'lucide-react';

export default function OnboardingTour() {
  const { user, completeTutorial } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();

  const isDark = theme === 'dark';
  
  // Pro tour has priority when both are pending. Standard tour is skipped for Pro users.
  const showProTour = user && user.is_pro && !user.has_completed_pro_tutorial;
  const showStandardTour = user && !user.has_completed_tutorial && !showProTour;

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState(null);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 1024;

  // Standard Tour Steps
  const standardSteps = [
    {
      title: "Welcome to NonStock!",
      path: "/dashboard",
      selector: null,
      icon: <LayoutDashboard size={40} className="text-emerald-400" />,
      content: "Let's take a quick 1-minute interactive tour of the platform. We will show you how to navigate your tabs, monitor real-time markets, and execute risk-free paper trades.",
      illustration: (
        <div style={{
          height: '100px',
          background: 'linear-gradient(135deg, rgba(0, 255, 136, 0.1), rgba(0, 188, 212, 0.05))',
          border: '1px dashed rgba(0, 255, 136, 0.25)',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '16px 0',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <span style={{ fontSize: '32px', filter: 'drop-shadow(0 0 10px rgba(0,255,136,0.5))' }}>📈</span>
          <div style={{ position: 'absolute', bottom: '8px', fontSize: '11px', color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>Interactive Tour Active</div>
        </div>
      )
    },
    {
      title: "Your Dashboard Hub",
      path: "/dashboard",
      selector: "tour-nav-dashboard",
      icon: <LayoutDashboard size={24} />,
      content: "Monitor your overall virtual investment summary, check top stock gainers and losers, track index benchmarks, and manage your custom watchlists from one central dashboard.",
    },
    {
      title: "Real-time Markets",
      path: "/markets",
      selector: "tour-nav-markets",
      icon: <TrendingUp size={24} />,
      content: "Search and view professional charts, trace technical indicators (RSI, EMA), and track live Indian indices (Nifty, Sensex) in real time.",
      illustration: (
        <div style={{ display: 'flex', gap: '4px', alignItems: 'flex-end', height: '60px', padding: '10px 0', justifyContent: 'center' }}>
          <div style={{ width: '8px', height: '20px', background: '#ff4444', borderRadius: '2px' }}></div>
          <div style={{ width: '8px', height: '35px', background: '#00ff88', borderRadius: '2px' }}></div>
          <div style={{ width: '8px', height: '25px', background: '#ff4444', borderRadius: '2px' }}></div>
          <div style={{ width: '8px', height: '48px', background: '#00ff88', borderRadius: '2px' }}></div>
          <div style={{ width: '8px', height: '60px', background: '#00ff88', borderRadius: '2px' }}></div>
        </div>
      )
    },
    {
      title: "Risk-free Paper Trading",
      path: "/paper-trading",
      selector: "tour-nav-paper-trading",
      icon: <LineChart size={24} />,
      content: "Test your trading strategies risk-free! We allocate ₹50,000 in virtual funds to every account. Learn to buy/sell, place stop-losses, and track your virtual portfolio PnL.",
      illustration: (
        <div style={{ textAlign: 'center', margin: '12px 0' }}>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#00ff88' }}>₹50,000.00</div>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>Virtual Sandbox Balance Allocated</div>
        </div>
      )
    },
    {
      title: "Community & Shared Signals",
      path: "/community",
      selector: "tour-nav-community",
      icon: <Users size={24} />,
      content: "Join public discussion channels (Nifty, Options, Basics), follow verified market experts/coaches, check their shared signals, and discuss trading ideas with the community.",
    },
    {
      title: "Screener & Tools",
      path: "/tools",
      selector: "tour-nav-tools",
      icon: <Calculator size={24} />,
      content: "Build custom stock filters using the Screener, or compute financial projections with compounding, SIP, and Lumpsum calculators.",
    },
    {
      title: "Go Pro for AI Tools",
      path: "/upgrade-pro",
      selector: "tour-nav-upgrade-pro",
      icon: <Sparkles size={24} style={{ color: '#ffb300' }} />,
      content: "Ready for advanced trading? Go Pro to unlock our proprietary GATv2/Transformer AI Mentor, automated bot allocation, premium coach channels, and real-time SMS alerts.",
      illustration: (
        <div style={{
          padding: '10px',
          background: 'linear-gradient(135deg, rgba(255,179,0,0.15), rgba(255,224,130,0.05))',
          border: '1px solid rgba(255,179,0,0.3)',
          borderRadius: '10px',
          color: '#ffb300',
          fontSize: '12px',
          fontWeight: 700,
          textAlign: 'center',
          margin: '12px 0'
        }}>
          💎 Unlock GATv2 AI Mentor & Smart Bots
        </div>
      )
    }
  ];

  // Pro Tour Steps
  const proSteps = [
    {
      title: "Welcome to NonStock Pro!",
      path: "/dashboard",
      selector: null,
      icon: <Sparkles size={40} style={{ color: '#ffb300' }} />,
      content: "Congratulations! Your account has been upgraded. The interface has transitioned to a luxury gold-accented layout. Let's tour your new institutional-grade features.",
      illustration: (
        <div style={{
          height: '100px',
          background: 'linear-gradient(135deg, rgba(255, 179, 0, 0.1), rgba(255, 224, 130, 0.05))',
          border: '1px dashed rgba(255, 179, 0, 0.35)',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '16px 0',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <span style={{ fontSize: '32px', filter: 'drop-shadow(0 0 10px rgba(255, 179, 0, 0.5))' }}>👑</span>
          <div style={{ position: 'absolute', bottom: '8px', fontSize: '11px', color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)', fontWeight: 700 }}>Pro Features Walkthrough</div>
        </div>
      )
    },
    {
      title: "GATv2 Quant AI Mentor",
      path: "/ai-mentor",
      selector: "tour-nav-ai-mentor",
      icon: <MessageSquare size={24} style={{ color: '#ffb300' }} />,
      content: "Consult our proprietary GATv2/Transformer model. Get instant AI insights on buyer vs. seller perspectives, volume flow dynamics, and neural setup conviction ratings.",
    },
    {
      title: "Automated Trading Advisors",
      path: "/paper-trading",
      selector: "tour-nav-paper-trading",
      icon: <Bot size={24} style={{ color: '#ffb300' }} />,
      content: "Deploy automated trading bots beside your paper trading charts. These bots analyze real-time indicators and advise you on when to enter, exit, or hold stock positions.",
      illustration: (
        <div style={{
          padding: '12px',
          background: 'var(--bg-card)',
          border: '1px solid rgba(255, 179, 0, 0.2)',
          borderRadius: '8px',
          fontSize: '11px',
          lineHeight: '1.4',
          margin: '12px 0',
          textAlign: 'left'
        }}>
          <div style={{ fontWeight: 800, color: '#ffb300', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <Bot size={12} /> Trend Follower Bot
          </div>
          <div style={{ color: 'var(--text-secondary)' }}>"Signals strong buy setup on Reliance. Stop-loss recommended at ₹2450."</div>
        </div>
      )
    },
    {
      title: "Premium Coach Channels",
      path: "/community",
      selector: "tour-nav-community",
      icon: <Award size={24} style={{ color: '#ffb300' }} />,
      content: "Gain full access to exclusive Pro discussion channels and direct signaling services run by SEBI-registered advisors and professional coaches.",
    }
  ];

  const steps = showProTour ? proSteps : showStandardTour ? standardSteps : [];
  const currentStep = steps[currentStepIndex];
  const isLastStep = currentStepIndex === steps.length - 1;

  // Navigate to the correct route when step changes
  useEffect(() => {
    if (currentStep && currentStep.path) {
      navigate(currentStep.path);
    }
  }, [currentStepIndex, navigate, showStandardTour, showProTour]);

  // Query DOM to find highlighted element coordinates
  useEffect(() => {
    if (!currentStep) return;
    
    let active = true;
    const findElement = () => {
      if (!active) return;
      if (!currentStep.selector) {
        setTargetRect(null);
        return;
      }
      
      const el = document.getElementById(currentStep.selector);
      if (el) {
        const rect = el.getBoundingClientRect();
        setTargetRect({
          top: rect.top + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width,
          height: rect.height,
        });
      } else {
        // Retry shortly if the page route is loading
        setTimeout(findElement, 150);
      }
    };

    // Delay slightly to allow DOM layout transition to settle
    const timer = setTimeout(findElement, 200);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [currentStepIndex, currentStep, navigate]);

  if (!showStandardTour && !showProTour) {
    return null;
  }

  const handleNext = () => {
    if (isLastStep) {
      handleComplete();
    } else {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const handleComplete = async () => {
    const type = showProTour ? 'pro' : 'standard';
    await completeTutorial(type);
    setCurrentStepIndex(0);
    setTargetRect(null);
  };

  // Determine tooltip style positioning
  const useCentered = !targetRect || isMobile;

  const spotlightStyle = targetRect ? {
    position: 'absolute',
    top: targetRect.top - 6,
    left: targetRect.left - 6,
    width: targetRect.width + 12,
    height: targetRect.height + 12,
    border: `2px dashed ${showProTour ? '#ffb300' : '#00ff88'}`,
    boxShadow: `0 0 20px ${showProTour ? 'rgba(255, 179, 0, 0.4)' : 'rgba(0, 255, 136, 0.4)'}`,
    borderRadius: '10px',
    pointerEvents: 'none',
    zIndex: 9998,
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  } : null;

  const overlayBg = isDark
    ? (showProTour ? 'rgba(10, 8, 4, 0.75)' : 'rgba(5, 7, 18, 0.75)')
    : (showProTour ? 'rgba(255, 255, 255, 0.4)' : 'rgba(255, 255, 255, 0.5)');

  const cardStyle = useCentered
    ? {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '450px',
        maxWidth: '90vw',
        zIndex: 9999,
      }
    : {
        position: 'absolute',
        top: Math.max(15, targetRect.top + (targetRect.height / 2) - 130),
        left: targetRect.left + targetRect.width + 24,
        width: '340px',
        zIndex: 9999,
      };

  const themeBorder = showProTour
    ? '1px solid rgba(255, 179, 0, 0.4)'
    : (isDark ? '1px solid rgba(0, 255, 136, 0.25)' : '1px solid rgba(0, 121, 107, 0.2)');

  const themeShadow = showProTour
    ? '0 12px 40px rgba(255, 179, 0, 0.25)'
    : (isDark ? '0 12px 40px rgba(0, 255, 136, 0.15)' : '0 8px 30px rgba(0, 121, 107, 0.1)');

  const themeBg = isDark
    ? (showProTour ? 'rgba(20, 16, 8, 0.96)' : 'rgba(10, 14, 35, 0.96)')
    : (showProTour ? 'rgba(255, 253, 247, 0.98)' : 'rgba(255, 255, 255, 0.98)');

  const themeText = isDark ? '#ffffff' : '#1a1a1a';
  const themeSubtext = isDark ? '#a0aec0' : '#4a5568';
  
  return (
    <>
      {/* Backdrop overlay */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: overlayBg,
        backdropFilter: 'blur(3px)',
        zIndex: 9997,
        pointerEvents: useCentered ? 'auto' : 'none',
        transition: 'all 0.3s'
      }} />

      {/* Target spotlight element wrapper */}
      {spotlightStyle && <div style={spotlightStyle} />}

      {/* Floating Tour Modal/Card */}
      <div 
        className="onboarding-tour-card"
        style={{
          ...cardStyle,
          background: themeBg,
          backdropFilter: 'blur(20px)',
          border: themeBorder,
          borderRadius: '16px',
          boxShadow: themeShadow,
          padding: '24px',
          color: themeText,
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          animation: 'tourCardFadeIn 0.3s ease-out'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              width: '36px', 
              height: '36px', 
              borderRadius: '50%', 
              background: showProTour ? 'rgba(255, 179, 0, 0.15)' : 'rgba(0, 255, 136, 0.12)',
              color: showProTour ? '#ffb300' : (isDark ? '#00ff88' : '#00796b')
            }}>
              {currentStep.icon}
            </span>
            <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 800, letterSpacing: '-0.3px' }}>
              {currentStep.title}
            </h4>
          </div>
          <button 
            onClick={handleComplete}
            style={{
              background: 'transparent',
              border: 'none',
              color: themeSubtext,
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div style={{ fontSize: '13.5px', lineHeight: '1.5', color: themeSubtext }}>
          {currentStep.content}
        </div>

        {/* Optional Custom Illustration */}
        {currentStep.illustration}

        {/* Footer controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px', borderTop: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)', paddingTop: '16px' }}>
          {/* Progress dots / fractions */}
          <div style={{ fontSize: '11px', fontWeight: 700, color: themeSubtext }}>
            Step {currentStepIndex + 1} of {steps.length}
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            {currentStepIndex > 0 && (
              <button
                onClick={handlePrev}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)',
                  background: 'transparent',
                  color: themeText,
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)'}
                onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <ChevronLeft size={14} /> Back
              </button>
            )}

            <button
              onClick={handleNext}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                background: showProTour ? 'linear-gradient(135deg, #ffe082, #ffb300)' : 'linear-gradient(135deg, #00ff88, #00b058)',
                color: showProTour ? '#0b0803' : '#0b0803',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: showProTour ? '0 4px 12px rgba(255, 179, 0, 0.25)' : '0 4px 12px rgba(0, 255, 136, 0.2)',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'none'}
            >
              {isLastStep ? (
                <>Got It! <Check size={14} /></>
              ) : (
                <>Next <ChevronRight size={14} /></>
              )}
            </button>
          </div>
        </div>

        {/* Global Keyframes injected for Tour Card */}
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes tourCardFadeIn {
            from { opacity: 0; transform: ${useCentered ? 'translate(-50%, -48%) scale(0.96)' : 'translateY(10px) scale(0.98)'}; }
            to { opacity: 1; transform: ${useCentered ? 'translate(-50%, -50%) scale(1)' : 'translateY(0) scale(1)'}; }
          }
        `}} />
      </div>
    </>
  );
}
