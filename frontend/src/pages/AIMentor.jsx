import { useState, useRef, useEffect } from 'react';
import { apiClient } from '../services/api';
import toast from 'react-hot-toast';
import { 
  Send, Sparkles, MessageSquare, AlertTriangle, Play, HelpCircle, 
  TrendingUp, TrendingDown, RefreshCw, BarChart2, ShieldAlert,
  Plus, Trash2, BookOpen, ChevronDown, ChevronUp, Sliders, ToggleLeft, ToggleRight
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const SUGGESTED_PROMPTS = [
  "Analyze this setup",
  "Is this pattern a trap?",
  "Where is the logical stop loss?",
  "Explain this timeframe's volatility"
];

const GEMINI_SUGGESTED_PROMPTS = [
  "Should I buy Reliance?",
  "What is RSI indicator and how to use it?",
  "Is Bitcoin bullish right now?",
  "Explain Support and Resistance levels for beginners"
];

// Custom lightweight markdown/formatting parser
function formatAIMessage(text) {
  if (!text) return '';
  
  // Format lines
  const lines = text.split('\n');
  return lines.map((line, idx) => {
    let cleanLine = line.trim();
    
    // Check headers
    if (cleanLine.startsWith('###')) {
      return <h4 key={idx} style={{ fontSize: '13px', fontWeight: '800', color: '#00ff88', marginTop: '12px', marginBottom: '6px', textTransform: 'uppercase' }}>{cleanLine.replace('###', '')}</h4>;
    }
    if (cleanLine.startsWith('##')) {
      return <h3 key={idx} style={{ fontSize: '15px', fontWeight: '800', color: '#00bcd4', marginTop: '16px', marginBottom: '8px' }}>{cleanLine.replace('##', '')}</h3>;
    }
    if (cleanLine.startsWith('#')) {
      return <h2 key={idx} style={{ fontSize: '18px', fontWeight: '900', color: '#ffffff', marginTop: '20px', marginBottom: '10px' }}>{cleanLine.replace('#', '')}</h2>;
    }

    // Check bullet points
    if (cleanLine.startsWith('-') || cleanLine.startsWith('*')) {
      const content = cleanLine.substring(1).trim();
      return <li key={idx} style={{ marginLeft: '16px', marginBottom: '4px', fontSize: '13px', color: 'var(--text-secondary)' }}>{parseBoldText(content)}</li>;
    }

    // Check bold disclaimers
    if (cleanLine.includes('**Disclaimer:') || cleanLine.includes('**Not Financial Advice:')) {
      return (
        <div key={idx} style={{ background: 'rgba(255,179,0,0.06)', border: '1px solid rgba(255,179,0,0.2)', padding: '12px', borderRadius: '8px', color: '#ffb300', fontSize: '11px', marginTop: '16px', lineHeight: '1.4' }}>
          {cleanLine.replace(/\*\*/g, '')}
        </div>
      );
    }

    if (cleanLine === '') return <div key={idx} style={{ height: '8px' }} />;

    return <p key={idx} style={{ fontSize: '13px', margin: '0 0 8px 0', lineHeight: '1.5', color: '#e0e0e0' }}>{parseBoldText(cleanLine)}</p>;
  });
}

function parseBoldText(text) {
  const parts = text.split(/\*\*([^*]+)\*\*/g);
  return parts.map((part, i) => {
    if (i % 2 === 1) {
      return <strong key={i} style={{ color: '#ffffff', fontWeight: '800' }}>{part}</strong>;
    }
    return part;
  });
}

export default function AIMentor() {
  const { user } = useAuth();
  const [mentorType, setMentorType] = useState('jarvis'); // 'jarvis' or 'gemini'
  const [accountMode, setAccountMode] = useState('learner'); // 'learner' or 'pro'

  // Market Data States for Jarvis Ingestion
  const [symbol, setSymbol] = useState('AAPL');
  const [timeframe, setTimeframe] = useState('15m');
  const [currentPrice, setCurrentPrice] = useState(185.50);
  const [rsi, setRsi] = useState(68.4);
  const [macdSignal, setMacdSignal] = useState('bullish_cross');
  const [trend, setTrend] = useState('Upward Breakout');
  const [patternDetected, setPatternDetected] = useState('Potential Liquidity Trap / Fakeout near 186.00 resistance');

  // Gemini state (persisted in DB)
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: 'Hello! I am your NonStock AI Mentor. Ask me any investing questions, ask about specific indicators (e.g. RSI, SMA), or check setup trend details like **"Should I buy Reliance?"**'
    }
  ]);

  // Jarvis state (kept local for instant sandbox playground testing)
  const [jarvisMessages, setJarvisMessages] = useState([
    {
      sender: 'ai',
      text: '### 🌐 Jarvis Core Initialized\nHello! I am **Jarvis**, your temporary AI Trading Mentor. Powered by LLaMA 3.3 (70B) via Groq API.\n\nUse the **Ingestion Controls** on the left to customize simulated chart conditions. Toggle between **Learner Mode** and **Pro Mode** to change how I explain concepts. Ask me to identify retail traps, plan risk invalidation zones, or evaluate candlestick patterns!'
    }
  ]);

  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [activeTechnicals, setActiveTechnicals] = useState(null);
  const [activeMLEnsemble, setActiveMLEnsemble] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [syllabus, setSyllabus] = useState({});
  const [expandedCategory, setExpandedCategory] = useState(null);
  
  const chatEndRef = useRef(null);

  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [mobileTab, setMobileTab] = useState('chat');

  // Jarvis presets
  const presets = {
    trap: {
      symbol: 'RELIANCE',
      timeframe: '15m',
      currentPrice: 2450.50,
      rsi: 68.4,
      macdSignal: 'bearish_divergence',
      trend: 'Upward Breakout (Weakening)',
      patternDetected: 'Potential Liquidity Trap / Fakeout near 2460.00 resistance'
    },
    breakout: {
      symbol: 'TCS',
      timeframe: '1h',
      currentPrice: 3890.00,
      rsi: 58.2,
      macdSignal: 'bullish_cross',
      trend: 'Strong Uptrend',
      patternDetected: 'Cup & Handle Breakout above 3850.00 with high volume profile'
    },
    oversold: {
      symbol: 'INFY',
      timeframe: '1d',
      currentPrice: 1420.00,
      rsi: 26.8,
      macdSignal: 'oversold_convergence',
      trend: 'Downward Correction',
      patternDetected: 'Double Bottom pattern near long-term support floor at 1400.00'
    },
    bearTrap: {
      symbol: 'AAPL',
      timeframe: '15m',
      currentPrice: 185.50,
      rsi: 64.2,
      macdSignal: 'bearish_cross',
      trend: 'Slightly Bullish',
      patternDetected: 'Fake Breakdown / Bear Trap near 184.00 support level'
    }
  };

  const applyPreset = (key) => {
    const p = presets[key];
    if (p) {
      setSymbol(p.symbol);
      setTimeframe(p.timeframe);
      setCurrentPrice(p.currentPrice);
      setRsi(p.rsi);
      setMacdSignal(p.macdSignal);
      setTrend(p.trend);
      setPatternDetected(p.patternDetected);
      toast.success(`${key.toUpperCase()} setup preset loaded!`);
    }
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchConversations = async () => {
    try {
      const res = await apiClient.get('/ai/conversations');
      setConversations(res.data);
    } catch (err) {
      console.error('Failed to fetch conversations:', err);
    }
  };

  useEffect(() => {
    fetchConversations();
    
    const fetchSyllabus = async () => {
      try {
        const res = await apiClient.get('/ai/knowledge');
        setSyllabus(res.data);
      } catch (err) {
        console.error('Failed to fetch trading library syllabus:', err);
      }
    };
    fetchSyllabus();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, jarvisMessages, mentorType]);

  const handleNewChat = () => {
    setActiveConversationId(null);
    setMessages([
      {
        sender: 'ai',
        text: 'Hello! I am your NonStock AI Mentor. Ask me any investing questions, ask about specific indicators (e.g. RSI, SMA), or check setup trend details like **"Should I buy Reliance?"**'
      }
    ]);
    setActiveTechnicals(null);
    setActiveMLEnsemble(null);
  };

  const handleSelectConversation = async (convId) => {
    try {
      setSending(true);
      const res = await apiClient.get(`/ai/conversations/${convId}/messages`);
      const mapped = res.data.map(m => ({
        sender: m.sender === 'model' ? 'ai' : m.sender,
        text: m.text
      }));
      setMessages(mapped.length > 0 ? mapped : [
        { sender: 'ai', text: 'Conversation is empty. Ask me any investing questions!' }
      ]);
      setActiveConversationId(convId);
      setActiveTechnicals(null);
      setActiveMLEnsemble(null);
      setMentorType('gemini'); // Automatically switch to Gemini if selecting a saved Gemini chat
    } catch (err) {
      toast.error('Failed to load messages');
    } finally {
      setSending(false);
    }
  };

  const handleDeleteConversation = async (e, convId) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this conversation?')) return;

    try {
      await apiClient.delete(`/ai/conversations/${convId}`);
      toast.success('Conversation deleted');
      fetchConversations();
      if (activeConversationId === convId) {
        handleNewChat();
      }
    } catch (err) {
      toast.error('Failed to delete conversation');
    }
  };

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    if (!textToSend) setInputText('');
    setSending(true);

    if (mentorType === 'jarvis') {
      // Append user message local to Jarvis
      setJarvisMessages(prev => [...prev, { sender: 'user', text }]);

      try {
        const res = await apiClient.post('/ai/mentor', {
          message: text,
          marketData: {
            symbol,
            timeframe,
            currentPrice: parseFloat(currentPrice),
            rsi: parseFloat(rsi),
            macd: { signal: macdSignal },
            trend,
            patternDetected
          },
          accountMode
        });

        setJarvisMessages(prev => [...prev, { sender: 'ai', text: res.data.response }]);

        // Dynamically update the Right Sidebar technical widgets to match Jarvis's ingestion context!
        setActiveTechnicals({
          symbol,
          price: parseFloat(currentPrice),
          rsi: parseFloat(rsi),
          trend: trend.toUpperCase().includes('BULLISH') || trend.toUpperCase().includes('UP') ? 'BULLISH' : 'BEARISH',
          support: parseFloat((currentPrice * 0.97).toFixed(2)),
          resistance: parseFloat((currentPrice * 1.03).toFixed(2))
        });

        // Simulate an ML Ensemble forecast aligned with Jarvis's custom metrics
        setActiveMLEnsemble({
          overall: {
            buy: rsi < 35 ? 75 : rsi > 65 ? 15 : trend.toUpperCase().includes('UP') ? 60 : 35,
            hold: 25,
            sell: rsi > 65 ? 60 : rsi < 35 ? 10 : trend.toUpperCase().includes('DOWN') ? 50 : 40
          },
          confidence: Math.floor(70 + Math.random() * 20),
          components: [
            { name: 'LSTM Neural Network', signal: rsi < 35 ? 'Buy' : rsi > 65 ? 'Sell' : 'Hold', strength: 78 },
            { name: 'XGBoost Classifier', signal: trend.toUpperCase().includes('UP') ? 'Buy' : 'Sell', strength: 82 },
            { name: 'Random Forest Regressor', signal: 'Buy', strength: 70 },
            { name: 'Transformer Attention Model', signal: 'Buy', strength: 89 },
            { name: 'Sentiment Analyzer', signal: rsi > 65 ? 'Bearish' : 'Bullish', strength: 75 },
            { name: 'Technical Signal Correlator', signal: rsi > 65 ? 'Sell' : 'Buy', strength: 80 }
          ]
        });

      } catch (err) {
        toast.error(err.response?.data?.error || 'Jarvis API error');
        setJarvisMessages(prev => [...prev, { sender: 'ai', text: '### ⚠️ Connection Interrupted\nFailed to establish contact with Jarvis Core. Please verify if the backend server is running and the GROQ_API_KEY is configured.' }]);
      } finally {
        setSending(false);
      }

    } else {
      // Standard Gemini Flow
      // Check message quota for non-Pro users
      const userMsgCount = messages.filter(m => m.sender === 'user').length;
      if (userMsgCount >= 5 && !user?.is_pro) {
        toast.error('Free limit reached! Please upgrade to Pro for unlimited AI Mentor conversations.');
        setMessages(prev => [
          ...prev,
          { sender: 'user', text },
          {
            sender: 'ai',
            text: '### 🔒 Pro Membership Required\n\nYou have completed your limit of 5 free messages with the AI Investing Mentor. Upgrade to **NonStock Pro** to enjoy unlimited conversational guidance, options scanner metrics, and custom SMS/WhatsApp notifications.\n\n[Upgrade to Pro Membership](/upgrade-pro)'
          }
        ]);
        return;
      }

      setMessages(prev => [...prev, { sender: 'user', text }]);

      try {
        const res = await apiClient.post('/ai/ask', {
          message: text,
          conversationId: activeConversationId
        });
        
        setMessages(prev => [...prev, { sender: 'ai', text: res.data.response }]);
        
        if (!activeConversationId && res.data.conversationId) {
          setActiveConversationId(res.data.conversationId);
        }
        fetchConversations();

        if (res.data.technicals) {
          setActiveTechnicals(res.data.technicals);
        } else {
          setActiveTechnicals(null);
        }
        if (res.data.mlEnsemble) {
          setActiveMLEnsemble(res.data.mlEnsemble);
        } else {
          setActiveMLEnsemble(null);
        }
      } catch (err) {
        toast.error(err.response?.data?.error || 'AI request failed');
        setMessages(prev => [...prev, { sender: 'ai', text: 'Error: Could not retrieve educational feedback. Please check if your Google Gemini API key is configured correctly.' }]);
      } finally {
        setSending(false);
      }
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto', color: '#ffffff' }}>
      
      {/* CSS Animation Injector */}
      <style>{`
        @keyframes pulse-core {
          0% { transform: scale(0.95); filter: drop-shadow(0 0 8px rgba(0, 188, 212, 0.5)); }
          100% { transform: scale(1.08); filter: drop-shadow(0 0 20px rgba(0, 188, 212, 0.95)); }
        }
        @keyframes spin-core {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .jarvis-core-active {
          animation: pulse-core 1.5s infinite alternate ease-in-out;
        }
        .jarvis-core-inner {
          animation: spin-core 10s infinite linear;
        }
      `}</style>

      {/* Top Title Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(16, 20, 39, 0.6) 0%, rgba(22, 28, 59, 0.4) 100%)',
        border: mentorType === 'jarvis' ? '1px solid rgba(0, 188, 212, 0.25)' : '1px solid rgba(0, 255, 136, 0.15)',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        transition: 'all 0.3s'
      }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '900', margin: '0 0 6px 0', background: mentorType === 'jarvis' ? 'linear-gradient(135deg, #00bcd4 0%, #a855f7 100%)' : 'linear-gradient(135deg, #00ff88 0%, #00bcd4 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Sparkles size={28} style={{ color: mentorType === 'jarvis' ? '#00bcd4' : '#00ff88' }} />
            {mentorType === 'jarvis' ? 'Jarvis AI Trading Mentor' : 'The Oracle AI'}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: 0 }}>
            {mentorType === 'jarvis' 
              ? 'Inject custom indicator metrics, breakouts, or liquidity traps on the fly and study setups with Jarvis.'
              : 'Learn technical analysis, request stock details, and study financial concepts interactively with your RAG mentor.'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', color: '#c0c2cc', background: 'rgba(255,255,255,0.05)', padding: '6px 12px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.08)' }}>
            {mentorType === 'jarvis' ? 'Groq LLaMA 3.3 70B' : 'Gemini 2.5 Flash'}
          </span>
        </div>
      </div>

      {/* Selector Tabs: Jarvis vs Gemini RAG */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        <button
          onClick={() => setMentorType('jarvis')}
          style={{
            flex: 1,
            padding: '14px',
            borderRadius: '12px',
            border: mentorType === 'jarvis' ? '1px solid rgba(0, 188, 212, 0.4)' : '1px solid rgba(255, 255, 255, 0.06)',
            background: mentorType === 'jarvis' ? 'linear-gradient(135deg, rgba(0, 188, 212, 0.15) 0%, rgba(168, 85, 247, 0.05) 100%)' : 'rgba(255, 255, 255, 0.02)',
            color: mentorType === 'jarvis' ? '#00bcd4' : '#9b9eac',
            fontWeight: '800',
            fontSize: '13px',
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: mentorType === 'jarvis' ? '0 4px 15px rgba(0, 188, 212, 0.1)' : 'none'
          }}
        >
          <Sparkles size={16} />
          Jarvis AI Trading Specialist (Groq LLaMA 3.3)
        </button>
        <button
          onClick={() => setMentorType('gemini')}
          style={{
            flex: 1,
            padding: '14px',
            borderRadius: '12px',
            border: mentorType === 'gemini' ? '1px solid rgba(0, 255, 136, 0.4)' : '1px solid rgba(255, 255, 255, 0.06)',
            background: mentorType === 'gemini' ? 'linear-gradient(135deg, rgba(0, 255, 136, 0.12) 0%, rgba(0, 188, 212, 0.05) 100%)' : 'rgba(255, 255, 255, 0.02)',
            color: mentorType === 'gemini' ? '#00ff88' : '#9b9eac',
            fontWeight: '800',
            fontSize: '13px',
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: mentorType === 'gemini' ? '0 4px 15px rgba(0, 255, 136, 0.08)' : 'none'
          }}
        >
          <BookOpen size={16} />
          The Oracle Knowledge RAG (Gemini 2.5)
        </button>
      </div>

      {/* Mobile Tab Selectors */}
      {isMobile && (
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', background: 'rgba(255,255,255,0.02)', padding: '4px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <button type="button" onClick={() => setMobileTab('history')} style={{ padding: '10px', borderRadius: '8px', border: 'none', fontSize: '13px', fontWeight: '700', cursor: 'pointer', background: mobileTab === 'history' ? '#10142d' : 'transparent', color: mobileTab === 'history' ? '#00bcd4' : '#9b9eac', transition: 'all 0.2s' }}>
              {mentorType === 'jarvis' ? 'Ingest Controls' : 'History'}
            </button>
            <button type="button" onClick={() => setMobileTab('chat')} style={{ padding: '10px', borderRadius: '8px', border: 'none', fontSize: '13px', fontWeight: '700', cursor: 'pointer', background: mobileTab === 'chat' ? '#10142d' : 'transparent', color: mobileTab === 'chat' ? '#00bcd4' : '#9b9eac', transition: 'all 0.2s' }}>
              AI Chat
            </button>
            <button type="button" onClick={() => setMobileTab('technicals')} style={{ padding: '10px', borderRadius: '8px', border: 'none', fontSize: '13px', fontWeight: '700', cursor: 'pointer', background: mobileTab === 'technicals' ? '#10142d' : 'transparent', color: mobileTab === 'technicals' ? '#00bcd4' : '#9b9eac', transition: 'all 0.2s' }}>
              Technicals
            </button>
          </div>
        </div>
      )}

      <div className="responsive-grid-stack" style={{ display: 'grid', gridTemplateColumns: '290px 1fr 340px', gap: '24px', alignItems: 'stretch' }}>
        
        {/* Left Side Column: INGEST CONTROLS (Jarvis) or CHAT HISTORY (Gemini) */}
        {mentorType === 'jarvis' ? (
          /* Jarvis Ingestion Controls Panel */
          <div style={{
            background: 'var(--bg-card-glass)',
            border: '1px solid rgba(0, 188, 212, 0.18)',
            borderRadius: '16px',
            padding: '20px',
            display: isMobile && mobileTab !== 'history' ? 'none' : 'flex',
            flexDirection: 'column',
            gap: '16px',
            height: '660px',
            overflowY: 'auto',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
          }}>
            <h3 style={{ fontSize: '14px', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: '#00bcd4' }}>
              <Sliders size={16} />
              Ingestion Controls
            </h3>

            {/* Account Mode Toggle */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '700' }}>ACCOUNT MENTOR MODE</span>
              <div style={{ display: 'flex', background: 'rgba(255,255,255,0.03)', padding: '4px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <button
                  onClick={() => setAccountMode('learner')}
                  style={{
                    flex: 1,
                    padding: '6px',
                    borderRadius: '6px',
                    border: 'none',
                    fontSize: '11px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    background: accountMode === 'learner' ? '#00bcd4' : 'transparent',
                    color: accountMode === 'learner' ? '#0a0e27' : '#9b9eac',
                    transition: 'all 0.2s'
                  }}
                >
                  Learner Mode
                </button>
                <button
                  onClick={() => setAccountMode('pro')}
                  style={{
                    flex: 1,
                    padding: '6px',
                    borderRadius: '6px',
                    border: 'none',
                    fontSize: '11px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    background: accountMode === 'pro' ? '#a855f7' : 'transparent',
                    color: accountMode === 'pro' ? '#ffffff' : '#9b9eac',
                    transition: 'all 0.2s'
                  }}
                >
                  Pro Mode
                </button>
              </div>
            </div>

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', margin: '4px 0' }} />

            {/* Presets List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '700' }}>SCENARIO PRESETS</span>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <button
                  onClick={() => applyPreset('trap')}
                  style={{
                    background: 'rgba(255, 68, 68, 0.06)',
                    border: '1px solid rgba(255, 68, 68, 0.2)',
                    borderRadius: '6px',
                    padding: '8px',
                    color: '#ff4444',
                    fontSize: '11px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255, 68, 68, 0.12)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(255, 68, 68, 0.06)'}
                >
                  Liquidity Trap
                </button>
                <button
                  onClick={() => applyPreset('breakout')}
                  style={{
                    background: 'rgba(0, 255, 136, 0.06)',
                    border: '1px solid rgba(0, 255, 136, 0.2)',
                    borderRadius: '6px',
                    padding: '8px',
                    color: '#00ff88',
                    fontSize: '11px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(0, 255, 136, 0.12)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(0, 255, 136, 0.06)'}
                >
                  Breakout Play
                </button>
                <button
                  onClick={() => applyPreset('oversold')}
                  style={{
                    background: 'rgba(0, 188, 212, 0.06)',
                    border: '1px solid rgba(0, 188, 212, 0.2)',
                    borderRadius: '6px',
                    padding: '8px',
                    color: '#00bcd4',
                    fontSize: '11px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(0, 188, 212, 0.12)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(0, 188, 212, 0.06)'}
                >
                  Oversold Bounce
                </button>
                <button
                  onClick={() => applyPreset('bearTrap')}
                  style={{
                    background: 'rgba(255, 179, 0, 0.06)',
                    border: '1px solid rgba(255, 179, 0, 0.2)',
                    borderRadius: '6px',
                    padding: '8px',
                    color: '#ffb300',
                    fontSize: '11px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255, 179, 0, 0.12)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(255, 179, 0, 0.06)'}
                >
                  Bear Trap
                </button>
              </div>
            </div>

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', margin: '4px 0' }} />

            {/* Input fields */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: '700' }}>SYMBOL</span>
                <input
                  type="text"
                  value={symbol}
                  onChange={e => setSymbol(e.target.value.toUpperCase())}
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', padding: '6px 10px', color: '#ffffff', fontSize: '12px', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: '700' }}>TIMEFRAME</span>
                  <select
                    value={timeframe}
                    onChange={e => setTimeframe(e.target.value)}
                    style={{ background: 'rgba(25.5,25.5,25.5,0.03)' === '' ? 'rgba(0,0,0,0.8)' : '#0f1124', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', padding: '6px 8px', color: '#ffffff', fontSize: '12px', outline: 'none' }}
                  >
                    <option value="15m">15m</option>
                    <option value="1h">1h</option>
                    <option value="1d">1d</option>
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: '700' }}>PRICE</span>
                  <input
                    type="number"
                    value={currentPrice}
                    step="0.01"
                    onChange={e => setCurrentPrice(e.target.value)}
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', padding: '6px 10px', color: '#ffffff', fontSize: '12px', outline: 'none' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: '700' }}>RSI (14)</span>
                  <span style={{ fontSize: '11px', fontWeight: '800', color: rsi > 70 ? '#ff4444' : rsi < 30 ? '#00ff88' : '#00bcd4' }}>{rsi}</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="90"
                  value={rsi}
                  onChange={e => setRsi(e.target.value)}
                  style={{ width: '100%', accentColor: '#00bcd4', background: 'rgba(255,255,255,0.1)', height: '4px', borderRadius: '2px' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: '700' }}>MACD SIGNAL</span>
                <select
                  value={macdSignal}
                  onChange={e => setMacdSignal(e.target.value)}
                  style={{ background: '#0f1124', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', padding: '6px 8px', color: '#ffffff', fontSize: '12px', outline: 'none' }}
                >
                  <option value="bullish_cross">Bullish Crossover</option>
                  <option value="bearish_cross">Bearish Crossover</option>
                  <option value="bullish_divergence">Bullish Divergence</option>
                  <option value="bearish_divergence">Bearish Divergence</option>
                  <option value="neutral">Neutral Consolidation</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: '700' }}>TREND DESCRIPTION</span>
                <input
                  type="text"
                  value={trend}
                  onChange={e => setTrend(e.target.value)}
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', padding: '6px 10px', color: '#ffffff', fontSize: '12px', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: '700' }}>PATTERN / TRAP DETECTED</span>
                <textarea
                  value={patternDetected}
                  onChange={e => setPatternDetected(e.target.value)}
                  rows="2"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', padding: '8px 10px', color: '#ffffff', fontSize: '12px', outline: 'none', resize: 'none', fontFamily: 'inherit' }}
                />
              </div>
            </div>
          </div>
        ) : (
          /* Gemini Chat History Left Sidebar */
          <div style={{
            background: 'var(--bg-card-glass)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            padding: '20px',
            display: isMobile && mobileTab !== 'history' ? 'none' : 'flex',
            flexDirection: 'column',
            gap: '16px',
            height: '660px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
          }}>
            <button
              onClick={handleNewChat}
              style={{
                background: 'linear-gradient(135deg, rgba(0, 255, 136, 0.15) 0%, rgba(0, 255, 136, 0.05) 100%)',
                border: '1px solid rgba(0, 255, 136, 0.3)',
                borderRadius: '8px',
                color: '#00ff88',
                padding: '12px',
                fontWeight: '800',
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(0, 255, 136, 0.22)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(0, 255, 136, 0.15)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <Plus size={16} />
              New Conversation
            </button>

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', margin: '4px 0' }} />

            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Recent Chats
            </span>

            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', paddingRight: '4px' }}>
              {conversations.length === 0 ? (
                <div style={{ color: 'var(--text-secondary)', fontSize: '12px', textAlign: 'center', padding: '24px 0', fontStyle: 'italic' }}>
                  No past conversations.
                </div>
              ) : (
                conversations.map(conv => {
                  const isActive = activeConversationId === conv.id;
                  return (
                    <div
                      key={conv.id}
                      onClick={() => handleSelectConversation(conv.id)}
                      style={{
                        background: isActive ? 'rgba(0, 255, 136, 0.08)' : 'rgba(255,255,255,0.02)',
                        border: isActive ? '1px solid rgba(0, 255, 136, 0.3)' : '1px solid rgba(255,255,255,0.04)',
                        borderRadius: '8px',
                        padding: '10px 12px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '8px',
                        transition: 'all 0.2s ease',
                        position: 'relative'
                      }}
                      onMouseEnter={e => {
                        if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                      }}
                      onMouseLeave={e => {
                        if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden', flex: 1 }}>
                        <MessageSquare size={14} style={{ color: isActive ? '#00ff88' : 'var(--text-secondary)', flexShrink: 0 }} />
                        <span style={{
                          fontSize: '12px',
                          fontWeight: isActive ? '750' : '500',
                          color: isActive ? '#ffffff' : '#d0d2dd',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          flex: 1
                        }}>
                          {conv.title}
                        </span>
                      </div>
                      
                      <button
                        onClick={(e) => handleDeleteConversation(e, conv.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--text-secondary)',
                          cursor: 'pointer',
                          padding: '2px',
                          borderRadius: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'color 0.2s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.color = '#ff4444'}
                        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Chat Canvas Section */}
        <div style={{
          background: 'var(--bg-card-glass)',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
          padding: '24px',
          display: isMobile && mobileTab !== 'chat' ? 'none' : 'flex',
          flexDirection: 'column',
          height: '660px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
        }}>
          
          {/* Animated Jarvis Core Status Indicator */}
          {mentorType === 'jarvis' && (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px', 
              background: 'rgba(0, 188, 212, 0.05)', 
              border: '1px solid rgba(0, 188, 212, 0.2)', 
              borderRadius: '12px', 
              padding: '12px 16px', 
              marginBottom: '16px' 
            }}>
              <div className="jarvis-core-active" style={{ 
                width: '32px', 
                height: '32px', 
                borderRadius: '50%', 
                background: 'radial-gradient(circle, #00ffff 20%, rgba(0, 188, 212, 0.3) 60%, transparent 100%)', 
                border: '2px dashed #00ffff', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <div className="jarvis-core-inner" style={{ 
                  width: '14px', 
                  height: '14px', 
                  borderRadius: '50%', 
                  background: '#ffffff', 
                  boxShadow: '0 0 12px #ffffff' 
                }} />
              </div>
              <div>
                <div style={{ fontSize: '12px', fontWeight: '800', color: '#00bcd4', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Jarvis Core: Active</div>
                <div style={{ fontSize: '10px', color: '#c0c2cc' }}>Simulating analysis for **{symbol}** under {timeframe} timeframe ({accountMode.toUpperCase()} MODE)</div>
              </div>
            </div>
          )}

          {/* Scrollable messages container */}
          <div style={{ flex: 1, overflowY: 'auto', paddingRight: '10px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {(mentorType === 'jarvis' ? jarvisMessages : messages).map((msg, idx) => (
              <div 
                key={idx} 
                style={{
                  alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '75%',
                  background: msg.sender === 'user' 
                    ? (mentorType === 'jarvis' 
                        ? 'linear-gradient(135deg, #00bcd4 0%, #a855f7 100%)' 
                        : 'linear-gradient(135deg, #00ff88 0%, #00bcd4 100%)')
                    : 'rgba(255,255,255,0.03)',
                  border: msg.sender === 'user' 
                    ? 'none' 
                    : (mentorType === 'jarvis' 
                        ? '1px solid rgba(0, 188, 212, 0.15)' 
                        : '1px solid rgba(255,255,255,0.06)'),
                  borderRadius: msg.sender === 'user' ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                  padding: '16px',
                  color: msg.sender === 'user' ? '#0a0e27' : '#ffffff',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}
              >
                {msg.sender === 'ai' ? (
                  <div>
                    {formatAIMessage(msg.text)}
                  </div>
                ) : (
                  <p style={{ margin: 0, fontSize: '13px', fontWeight: '750', lineHeight: '1.4' }}>
                    {msg.text}
                  </p>
                )}
              </div>
            ))}
            {sending && (
              <div style={{ alignSelf: 'flex-start', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '16px 16px 16px 2px', padding: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: '#c0c2cc' }}>
                <RefreshCw className="animate-spin" size={14} />
                <span style={{ fontSize: '12px' }}>
                  {mentorType === 'jarvis' ? 'Jarvis is scanning indicator traps...' : 'AI Mentor is compiling stock insights...'}
                </span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Suggested Prompts Block */}
          {(mentorType === 'jarvis' ? jarvisMessages : messages).length === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '700' }}>SUGGESTED QUESTIONS</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {(mentorType === 'jarvis' ? SUGGESTED_PROMPTS : GEMINI_SUGGESTED_PROMPTS).map((p, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(p)}
                    style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                      borderRadius: '20px',
                      padding: '8px 14px',
                      color: 'var(--text-primary)',
                      fontSize: '11px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      transition: '0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = mentorType === 'jarvis' ? 'rgba(0, 188, 212, 0.1)' : 'rgba(0, 255, 136, 0.1)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'}
                  >
                    <HelpCircle size={12} style={{ color: mentorType === 'jarvis' ? '#00bcd4' : '#00ff88' }} />
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Chat Input Area */}
          <div style={{ display: 'flex', gap: '12px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px' }}>
            <input 
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder={mentorType === 'jarvis' 
                ? "Ask Jarvis (e.g. 'Is this pattern a breakout trap?' or 'Analyze my risk')..."
                : "Ask AI Mentor (e.g. 'Explain RSI' or 'Should I buy SBIN?')..."}
              style={{
                flex: 1,
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '8px',
                padding: '12px 16px',
                color: '#ffffff',
                fontSize: '13px',
                outline: 'none'
              }}
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={sending}
              style={{
                background: mentorType === 'jarvis' 
                  ? 'linear-gradient(135deg, #00bcd4 0%, #a855f7 100%)' 
                  : 'linear-gradient(135deg, #00ff88 0%, #00bcd4 100%)',
                border: 'none',
                borderRadius: '8px',
                color: mentorType === 'jarvis' ? '#ffffff' : '#0a0e27',
                padding: '12px 20px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: sending ? 0.6 : 1,
                fontWeight: '800',
                transition: 'all 0.2s'
              }}
            >
              <Send size={16} />
            </button>
          </div>

        </div>

        {/* Right Sidebar: Real-Time Technical Insights */}
        <div style={{ display: isMobile && mobileTab !== 'technicals' ? 'none' : 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Real-Time Tech Widget */}
          <div style={{
            background: 'var(--bg-card-glass)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <h3 style={{ fontSize: '15px', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BarChart2 size={18} style={{ color: mentorType === 'jarvis' ? '#00bcd4' : '#00ff88' }} />
              Live Technicals Widget
            </h3>

            {activeTechnicals ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '12px' }}>
                  <span style={{ fontSize: '16px', fontWeight: '900', color: '#ffffff' }}>{activeTechnicals.symbol}</span>
                  <span style={{ fontSize: '18px', fontWeight: '900', color: '#00ff88' }}>₹{activeTechnicals.price.toLocaleString('en-IN')}</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>RSI (14):</span>
                    <span style={{ fontWeight: '800', color: activeTechnicals.rsi > 70 ? '#ff4444' : activeTechnicals.rsi < 30 ? '#00ff88' : '#00bcd4' }}>
                      {activeTechnicals.rsi} ({activeTechnicals.rsi > 70 ? 'Overbought' : activeTechnicals.rsi < 30 ? 'Oversold' : 'Neutral'})
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>30-Day Trend:</span>
                    <span style={{ fontWeight: '800', color: activeTechnicals.trend === 'BULLISH' ? '#00ff88' : '#ff4444', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {activeTechnicals.trend === 'BULLISH' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                      {activeTechnicals.trend}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Support Floor:</span>
                    <span style={{ fontWeight: '800', color: '#00ff88' }}>₹{activeTechnicals.support.toLocaleString('en-IN')}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Resistance Ceiling:</span>
                    <span style={{ fontWeight: '800', color: '#ff4444' }}>₹{activeTechnicals.resistance.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)', fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                  <strong>AI Note:</strong> Ingested RSI is sitting at {activeTechnicals.rsi}. A level below 30 represents oversold conditions, while a level above 70 indicates overbought conditions.
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '12px', margin: '0 0 4px 0', textAlign: 'center', padding: '12px 0' }}>
                  {mentorType === 'jarvis' 
                    ? 'Submit a prompt above to render your simulated live metrics and ML forecasts!'
                    : 'Query a specific stock (e.g. "Analyze Reliance") to fetch live metrics and ML forecasts.'}
                </p>
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '12px' }}>
                  <span style={{ fontSize: '11px', color: mentorType === 'jarvis' ? '#00bcd4' : '#00ff88', fontWeight: '800', display: 'block', marginBottom: '8px', letterSpacing: '0.5px' }}>TRENDING SYMBOLS</span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {['RELIANCE', 'TCS', 'SBIN', 'NIFTY', 'BTC', 'ETH'].map((t) => (
                      <button
                        key={t}
                        onClick={() => {
                          if (mentorType === 'jarvis') {
                            setSymbol(t);
                            handleSendMessage(`Analyze simulated ${t} pattern`);
                          } else {
                            handleSendMessage(`Analyze ${t}`);
                          }
                        }}
                        style={{
                          background: 'rgba(255,255,255,0.03)',
                          border: '1px solid rgba(255,255,255,0.08)',
                          borderRadius: '6px',
                          color: '#ffffff',
                          padding: '6px 12px',
                          fontSize: '11px',
                          fontWeight: '700',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                        }}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {activeMLEnsemble && (
            <div style={{
              background: 'var(--bg-card-glass)',
              border: mentorType === 'jarvis' ? '1px solid rgba(0, 188, 212, 0.25)' : '1px solid rgba(0, 188, 212, 0.2)',
              borderRadius: '16px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              boxShadow: '0 8px 32px rgba(0, 188, 212, 0.05)'
            }}>
              <h3 style={{ fontSize: '15px', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: '#00bcd4' }}>
                <Sparkles size={18} />
                ML Ensemble Forecast
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: '700' }}>ENSEMBLE DIRECTION PROBABILITY</span>
                <div style={{ height: '24px', borderRadius: '12px', overflow: 'hidden', display: 'flex', fontSize: '10px', fontWeight: '800', color: '#0a0e27' }}>
                  {activeMLEnsemble.overall.buy > 0 && (
                    <div style={{ background: '#00ff88', width: `${activeMLEnsemble.overall.buy}%`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      Buy {activeMLEnsemble.overall.buy}%
                    </div>
                  )}
                  {activeMLEnsemble.overall.hold > 0 && (
                    <div style={{ background: '#ffb300', width: `${activeMLEnsemble.overall.hold}%`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      Hold {activeMLEnsemble.overall.hold}%
                    </div>
                  )}
                  {activeMLEnsemble.overall.sell > 0 && (
                    <div style={{ background: '#ff4444', width: `${activeMLEnsemble.overall.sell}%`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      Sell {activeMLEnsemble.overall.sell}%
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '12px' }}>
                <span style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: '700' }}>COMPONENT MODEL SIGNALS</span>
                {activeMLEnsemble.components.map((comp, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                    <span style={{ color: '#c0c2cc' }}>{comp.name}</span>
                    <span style={{ 
                      fontWeight: '800', 
                      color: comp.signal === 'Buy' || comp.signal === 'Bullish' ? '#00ff88' : comp.signal === 'Sell' || comp.signal === 'Bearish' ? '#ff4444' : '#ffb300' 
                    }}>
                      {comp.signal} ({comp.strength}%)
                    </span>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '12px', fontSize: '12px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Ensemble Confidence:</span>
                <span style={{ fontWeight: '900', color: '#00bcd4' }}>{activeMLEnsemble.confidence}%</span>
              </div>
            </div>
          )}

          {/* Trading Library syllabus sidebar card */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(16, 20, 39, 0.9) 0%, rgba(22, 28, 59, 0.9) 100%)',
            border: mentorType === 'jarvis' ? '1px solid rgba(0, 188, 212, 0.15)' : '1px solid rgba(0, 255, 136, 0.15)',
            borderRadius: '16px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
          }}>
            <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#ffffff', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BookOpen size={16} style={{ color: mentorType === 'jarvis' ? '#00bcd4' : '#00ff88' }} />
              Trading Library
            </h3>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '0 0 4px 0', lineHeight: '1.4' }}>
              {mentorType === 'jarvis' 
                ? 'Select any concept below to study it interactively with Jarvis under current indicator inputs.'
                : 'Click on any concept below to study it interactively with your AI Mentor.'}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '240px', overflowY: 'auto', paddingRight: '4px' }}>
              {Object.keys(syllabus).length === 0 ? (
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textAlign: 'center', padding: '12px' }}>
                  Loading library topics...
                </div>
              ) : (
                Object.keys(syllabus).map(category => {
                  const isExpanded = expandedCategory === category;
                  return (
                    <div key={category} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '4px' }}>
                      <button
                        type="button"
                        onClick={() => setExpandedCategory(isExpanded ? null : category)}
                        style={{
                          width: '100%',
                          background: 'none',
                          border: 'none',
                          color: isExpanded ? '#00bcd4' : '#e0e0e0',
                          padding: '8px 0',
                          fontSize: '12px',
                          fontWeight: '700',
                          textAlign: 'left',
                          cursor: 'pointer',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          transition: 'color 0.2s'
                        }}
                      >
                        <span>{category}</span>
                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>
                      
                      {isExpanded && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', paddingLeft: '8px', paddingBottom: '8px' }}>
                          {syllabus[category].map(topic => (
                            <button
                              key={topic.id}
                              type="button"
                              onClick={() => handleSendMessage(`Explain ${topic.title} and how it applies to our setup`)}
                              style={{
                                background: 'rgba(255, 255, 255, 0.02)',
                                border: '1px solid rgba(255, 255, 255, 0.04)',
                                borderRadius: '6px',
                                padding: '6px 10px',
                                fontSize: '11px',
                                color: '#c0c2cc',
                                textAlign: 'left',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                width: '100%'
                              }}
                              onMouseEnter={e => {
                                e.currentTarget.style.background = mentorType === 'jarvis' ? 'rgba(0, 188, 212, 0.1)' : 'rgba(0, 255, 136, 0.08)';
                                e.currentTarget.style.color = '#ffffff';
                                e.currentTarget.style.borderColor = mentorType === 'jarvis' ? 'rgba(0, 188, 212, 0.3)' : 'rgba(0, 255, 136, 0.2)';
                              }}
                              onMouseLeave={e => {
                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                                e.currentTarget.style.color = '#c0c2cc';
                                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.04)';
                              }}
                            >
                              <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: mentorType === 'jarvis' ? '#00bcd4' : '#00ff88', flexShrink: 0 }} />
                              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{topic.title}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
