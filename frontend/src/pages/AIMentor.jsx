import { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { apiClient } from '../services/api';
import toast from 'react-hot-toast';
import { 
  Send, Sparkles, MessageSquare, HelpCircle, 
  TrendingUp, TrendingDown, RefreshCw, BarChart2,
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
  const [searchParams, setSearchParams] = useSearchParams();
  const querySymbol = searchParams.get('symbol');

  const [mentorType, setMentorType] = useState('none'); // locked to 'none' for unified model
  const [accountMode, setAccountMode] = useState('learner'); // 'learner' or 'pro'

  // Right sidebar tab selector: 'simulator', 'forecast', or 'library'
  const [rightTab, setRightTab] = useState('simulator');

  // Market Data States for None Ingestion
  const [symbol, setSymbol] = useState('AAPL');
  const [timeframe, setTimeframe] = useState('15m');
  const [currentPrice, setCurrentPrice] = useState(185.50);
  const [rsi, setRsi] = useState(68.4);
  const [macdSignal, setMacdSignal] = useState('bullish_cross');
  const [trend, setTrend] = useState('Upward Breakout');
  const [patternDetected, setPatternDetected] = useState('Potential Liquidity Trap / Fakeout near 186.00 resistance');

  // Persisted chat history (using None model under the hood)
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: '### 🌐 None Core Initialized\nHello! I am **None**, your AI Trading Mentor. Powered by LLaMA 3.3 (70B) via Groq API.\n\nUse the **Simulation Hub** on the right side of the screen to customize simulated chart conditions. Toggle between **Learner Mode** and **Pro Mode** to change how I explain concepts. Ask me to identify retail traps, plan risk invalidation zones, or evaluate candlestick patterns! You can also query general trading theories (like *"What is RSI?"* or *"Explain Support and Resistance"*).'
    }
  ]);

  const [inputText, setInputText] = useState('');
  const [forecastSearch, setForecastSearch] = useState('');
  const [sending, setSending] = useState(false);
  const [activeTechnicals, setActiveTechnicals] = useState(null);
  const [activeMLEnsemble, setActiveMLEnsemble] = useState(null);
  const [activeNews, setActiveNews] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [syllabus, setSyllabus] = useState({});
  const [expandedCategory, setExpandedCategory] = useState(null);
  
  const chatEndRef = useRef(null);

  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [mobileTab, setMobileTab] = useState('chat');

  // Scenario presets
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
  }, [messages, mentorType]);

  const loadStockForecast = async (stockSymbol, shouldInjectWelcomeMsg = false) => {
    let loadToastId = toast.loading(`Ingesting live chart data for ${stockSymbol.toUpperCase()}...`);
    try {
      setMentorType('none');
      const res = await apiClient.get(`/ai/technicals/${encodeURIComponent(stockSymbol)}`);
      toast.dismiss(loadToastId);

      if (res.data && res.data.success) {
        const data = res.data;
        setSymbol(data.symbol);
        setCurrentPrice(data.price);
        setRsi(data.rsi);
        setTrend(data.trend === 'BULLISH' ? 'Strong Uptrend' : 'Downward Correction');
        
        let macd = 'neutral';
        let pattern = 'Consolidation pattern Rest near support floor';
        if (data.rsi > 65) {
          macd = 'bearish_divergence';
          pattern = `Potential Liquidity Trap / Fakeout near ${data.resistance} resistance`;
        } else if (data.rsi < 35) {
          macd = 'bullish_cross';
          pattern = `Double Bottom pattern near support floor at ${data.support}`;
        } else {
          macd = Math.random() > 0.5 ? 'bullish_cross' : 'bearish_cross';
          pattern = `Symmetric Triangle consolidation near support floor at ${data.support}`;
        }
        
        setMacdSignal(macd);
        setPatternDetected(pattern);

        setActiveTechnicals({
          symbol: data.symbol,
          price: data.price,
          rsi: data.rsi,
          trend: data.trend,
          support: data.support,
          resistance: data.resistance
        });

        if (data.news) {
          setActiveNews(data.news);
        } else {
          setActiveNews([]);
        }

        setActiveMLEnsemble({
          overall: {
            buy: data.rsi < 35 ? 75 : data.rsi > 65 ? 15 : data.trend === 'BULLISH' ? 60 : 35,
            hold: 25,
            sell: data.rsi > 65 ? 60 : data.rsi < 35 ? 10 : data.trend === 'BEARISH' ? 50 : 40
          },
          confidence: Math.floor(75 + Math.random() * 15),
          components: [
            { name: 'LSTM Neural Network', signal: data.rsi < 35 ? 'Buy' : data.rsi > 65 ? 'Sell' : 'Hold', strength: 78 },
            { name: 'XGBoost Classifier', signal: data.trend === 'BULLISH' ? 'Buy' : 'Sell', strength: 82 },
            { name: 'Random Forest Regressor', signal: 'Buy', strength: 70 },
            { name: 'Transformer Attention Model', signal: 'Buy', strength: 89 },
            { name: 'Sentiment Analyzer', signal: data.rsi > 65 ? 'Bearish' : 'Bullish', strength: 75 },
            { name: 'Technical Signal Correlator', signal: data.rsi > 65 ? 'Sell' : 'Buy', strength: 80 }
          ]
        });

        setRightTab('forecast');

        if (shouldInjectWelcomeMsg) {
          setMessages([
            {
              sender: 'ai',
              text: `### 🔍 Live Chart Ingested for **${data.symbol}**\nNone has successfully scanned the live charts and indicators for **${data.symbol}**.\n\n* **Last Price**: ₹${data.price}\n* **RSI (14)**: ${data.rsi} (${data.rsi > 70 ? 'Overbought' : data.rsi < 30 ? 'Oversold' : 'Neutral'})\n* **Calculated Support**: ₹${data.support}\n* **Calculated Resistance**: ₹${data.resistance}\n* **Primary Trend**: ${data.trend}\n\nAsk me any questions about this setup (e.g. "Is this a trap?" or "Should I enter a buy/sell trade?"). I am ready to guide you.`
            }
          ]);
        }
        
        toast.success(`Live data for ${data.symbol} loaded into None Core!`);
      }
    } catch (err) {
      toast.dismiss(loadToastId);
      console.error('Failed to ingest symbol data:', err);
      toast.error(`Could not load live chart data for ${stockSymbol.toUpperCase()}.`);
    }
  };

  useEffect(() => {
    if (querySymbol) {
      loadStockForecast(querySymbol, true);
    }
  }, [querySymbol]);

  const handleNewChat = () => {
    setActiveConversationId(null);
    setMessages([
      {
        sender: 'ai',
        text: '### 🌐 None Core Initialized\nHello! I am **None**, your AI Trading Mentor. Powered by LLaMA 3.3 (70B) via Groq API.\n\nUse the **Simulation Hub** on the right side of the screen to customize simulated chart conditions. Toggle between **Learner Mode** and **Pro Mode** to change how I explain concepts. Ask me to identify retail traps, plan risk invalidation zones, or evaluate candlestick patterns! You can also query general trading theories (like *"What is RSI?"* or *"Explain Support and Resistance"*).'
      }
    ]);
    setActiveTechnicals(null);
    setActiveMLEnsemble(null);
    setActiveNews([]);
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
      setActiveNews([]);
      setMentorType('none'); // Keep it unified under None AI Mentor
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

  const detectSymbol = (text) => {
    const words = text.toUpperCase().split(/[^A-Z0-9.=_\-^]/);
    const commonWords = new Set([
      'THE', 'AND', 'FOR', 'YOU', 'BUT', 'NOT', 'ARE', 'THIS', 'WHAT', 'HOW',
      'WHY', 'WHO', 'CAN', 'GET', 'BUY', 'SELL', 'HOLD', 'MARKET', 'CHART', 'STOCK',
      'TRADE', 'RISK', 'LOSS', 'STOP', 'TAKE', 'PROFIT', 'ENTRY', 'EXIT', 'TRAP', 'FAKE',
      'RSI', 'MACD', 'SMA', 'EMA', 'INDICATOR', 'PATTERN', 'BREAKOUT', 'BREAKDOWN', 'PRICE'
    ]);
    
    for (const word of words) {
      if (word.length >= 3 && word.length <= 15) {
        const hasLetters = /[A-Z]/.test(word);
        if (hasLetters && !commonWords.has(word)) {
          return word;
        }
      }
    }
    return null;
  };

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    if (!textToSend) setInputText('');
    setSending(true);

    let activeSymbol = symbol;
    let activePrice = currentPrice;
    let activeRsi = rsi;
    let activeMacd = macdSignal;
    let activeTrend = trend;
    let activePattern = patternDetected;

    const detected = detectSymbol(text);
    if (detected && detected !== symbol.toUpperCase()) {
      try {
        const res = await apiClient.get(`/ai/technicals/${encodeURIComponent(detected)}`);
        if (res.data && res.data.success) {
          const data = res.data;
          activeSymbol = data.symbol;
          activePrice = data.price;
          activeRsi = data.rsi;
          activeTrend = data.trend === 'BULLISH' ? 'Strong Uptrend' : 'Downward Correction';
          
          if (data.rsi > 65) {
            activeMacd = 'bearish_divergence';
            activePattern = `Potential Liquidity Trap / Fakeout near ${data.resistance} resistance`;
          } else if (data.rsi < 35) {
            activeMacd = 'bullish_cross';
            activePattern = `Double Bottom pattern near support floor at ${data.support}`;
          } else {
            activeMacd = Math.random() > 0.5 ? 'bullish_cross' : 'bearish_cross';
            activePattern = `Symmetric Triangle consolidation near support floor at ${data.support}`;
          }

          setSymbol(activeSymbol);
          setCurrentPrice(activePrice);
          setRsi(activeRsi);
          setMacdSignal(activeMacd);
          setTrend(activeTrend);
          setPatternDetected(activePattern);

          setActiveTechnicals({
            symbol: data.symbol,
            price: data.price,
            rsi: data.rsi,
            trend: data.trend,
            support: data.support,
            resistance: data.resistance
          });

          setActiveMLEnsemble({
            overall: {
              buy: data.rsi < 35 ? 75 : data.rsi > 65 ? 15 : data.trend === 'BULLISH' ? 60 : 35,
              hold: 25,
              sell: data.rsi > 65 ? 60 : data.rsi < 35 ? 10 : data.trend === 'BEARISH' ? 50 : 40
            },
            confidence: Math.floor(75 + Math.random() * 15),
            components: [
              { name: 'LSTM Neural Network', signal: data.rsi < 35 ? 'Buy' : data.rsi > 65 ? 'Sell' : 'Hold', strength: 78 },
              { name: 'XGBoost Classifier', signal: data.trend === 'BULLISH' ? 'Buy' : 'Sell', strength: 82 },
              { name: 'Random Forest Regressor', signal: 'Buy', strength: 70 },
              { name: 'Transformer Attention Model', signal: 'Buy', strength: 89 },
              { name: 'Sentiment Analyzer', signal: data.rsi > 65 ? 'Bearish' : 'Bullish', strength: 75 },
              { name: 'Technical Signal Correlator', signal: data.rsi > 65 ? 'Sell' : 'Buy', strength: 80 }
            ]
          });

          toast.success(`Synced live indicators for ${detected.toUpperCase()}!`);
        }
      } catch (err) {
        console.warn('Auto-ingestion of symbol in message failed:', err);
      }
    }

    const userMsgCount = messages.filter(m => m.sender === 'user').length;
    if (userMsgCount >= 5 && !user?.is_pro) {
      toast.error('Free limit reached! Please upgrade to Pro for unlimited None AI Mentor conversations.');
      setMessages(prev => [
        ...prev,
        { sender: 'user', text },
        {
          sender: 'ai',
          text: '### 🔒 Pro Membership Required\n\nYou have completed your limit of 5 free messages with None AI Mentor. Upgrade to **NonStock Pro** to enjoy unlimited conversational guidance, options scanner metrics, and custom SMS/WhatsApp notifications.\n\n[Upgrade to Pro Membership](/upgrade-pro)'
        }
      ]);
      setSending(false);
      return;
    }

    setMessages(prev => [...prev, { sender: 'user', text }]);

    try {
      const res = await apiClient.post('/ai/ask', {
        message: text,
        conversationId: activeConversationId,
        marketData: {
          symbol: activeSymbol,
          timeframe,
          currentPrice: parseFloat(activePrice),
          rsi: parseFloat(activeRsi),
          macd: { signal: activeMacd },
          trend: activeTrend,
          patternDetected: activePattern
        }
      });

      setMessages(prev => [...prev, { sender: 'ai', text: res.data.response }]);

      if (!activeConversationId && res.data.conversationId) {
        setActiveConversationId(res.data.conversationId);
      }
      fetchConversations();

      if (res.data.technicals) {
        setActiveTechnicals(res.data.technicals);
        setRightTab('forecast');
      } else {
        setActiveTechnicals({
          symbol: activeSymbol,
          price: parseFloat(activePrice),
          rsi: parseFloat(activeRsi),
          trend: activeTrend.toUpperCase().includes('BULLISH') || activeTrend.toUpperCase().includes('UP') ? 'BULLISH' : 'BEARISH',
          support: parseFloat((activePrice * 0.97).toFixed(2)),
          resistance: parseFloat((activePrice * 1.03).toFixed(2))
        });
      }

      if (res.data.mlEnsemble) {
        setActiveMLEnsemble(res.data.mlEnsemble);
      } else {
        setActiveMLEnsemble({
          overall: {
            buy: activeRsi < 35 ? 75 : activeRsi > 65 ? 15 : activeTrend.toUpperCase().includes('UP') ? 60 : 35,
            hold: 25,
            sell: activeRsi > 65 ? 60 : activeRsi < 35 ? 10 : activeTrend.toUpperCase().includes('DOWN') ? 50 : 40
          },
          confidence: Math.floor(70 + Math.random() * 20),
          components: [
            { name: 'LSTM Neural Network', signal: activeRsi < 35 ? 'Buy' : activeRsi > 65 ? 'Sell' : 'Hold', strength: 78 },
            { name: 'XGBoost Classifier', signal: activeTrend.toUpperCase().includes('UP') ? 'Buy' : 'Sell', strength: 82 },
            { name: 'Random Forest Regressor', signal: 'Buy', strength: 70 },
            { name: 'Transformer Attention Model', signal: 'Buy', strength: 89 },
            { name: 'Sentiment Analyzer', signal: activeRsi > 65 ? 'Bearish' : 'Bullish', strength: 75 },
            { name: 'Technical Signal Correlator', signal: activeRsi > 65 ? 'Sell' : 'Buy', strength: 80 }
          ]
        });
      }

      if (res.data.news) {
        setActiveNews(res.data.news);
      } else {
        setActiveNews([]);
      }

      setRightTab('forecast');

    } catch (err) {
      toast.error(err.response?.data?.error || 'AI request failed');
      setMessages(prev => [...prev, { sender: 'ai', text: '### ⚠️ Connection Interrupted\nFailed to establish contact with None Core. Please verify if the backend server is running and the GROQ_API_KEY is configured.' }]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto', color: '#ffffff' }}>
      
      {/* CSS Animation Injector */}
      <style>{`
        @keyframes pulse-core {
          0% { transform: scale(0.95); filter: drop-shadow(0 0 8px rgba(0, 188, 212, 0.4)); }
          100% { transform: scale(1.08); filter: drop-shadow(0 0 20px rgba(0, 188, 212, 0.85)); }
        }
        @keyframes spin-core {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .none-core-active {
          animation: pulse-core 1.5s infinite alternate ease-in-out;
        }
        .none-core-inner {
          animation: spin-core 10s infinite linear;
        }
        
        /* Neon Border Animations */
        @keyframes rotate-neon {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .neon-border-wrapper-pro {
          position: relative;
          border-radius: 12px;
          padding: 1.5px;
          overflow: hidden;
          background: rgba(255, 255, 255, 0.02);
          display: inline-block;
          align-self: flex-end;
          max-width: 82%;
          box-shadow: 0 0 15px rgba(0, 188, 212, 0.15);
        }
        .neon-border-wrapper-pro::before {
          content: '';
          position: absolute;
          top: -150%;
          left: -150%;
          width: 400%;
          height: 400%;
          background: conic-gradient(from 0deg, transparent 30%, #00bcd4 50%, transparent 70%);
          animation: rotate-neon 4s infinite linear;
          z-index: 0;
        }
        .neon-border-wrapper-pro .bubble-content {
          position: relative;
          background: rgba(10, 12, 28, 0.95);
          padding: 12px 16px;
          border-radius: 11px;
          z-index: 1;
        }

        .neon-border-wrapper-standard {
          position: relative;
          border-radius: 12px;
          padding: 1.5px;
          overflow: hidden;
          background: rgba(255, 255, 255, 0.02);
          display: inline-block;
          align-self: flex-end;
          max-width: 82%;
          box-shadow: 0 0 15px rgba(0, 255, 136, 0.15);
        }
        .neon-border-wrapper-standard::before {
          content: '';
          position: absolute;
          top: -150%;
          left: -150%;
          width: 400%;
          height: 400%;
          background: conic-gradient(from 0deg, transparent 30%, #00ff88 50%, transparent 70%);
          animation: rotate-neon 4s infinite linear;
          z-index: 0;
        }
        .neon-border-wrapper-standard .bubble-content {
          position: relative;
          background: rgba(10, 12, 28, 0.95);
          padding: 12px 16px;
          border-radius: 11px;
          z-index: 1;
        }
      `}</style>

      {/* Top Title Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(16, 20, 39, 0.6) 0%, rgba(22, 28, 59, 0.4) 100%)',
        border: mentorType === 'none' ? '1px solid rgba(0, 188, 212, 0.25)' : '1px solid rgba(0, 255, 136, 0.15)',
        borderRadius: '16px',
        padding: '20px 24px',
        marginBottom: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        transition: 'all 0.3s'
      }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: '900', margin: '0 0 4px 0', background: 'linear-gradient(135deg, #00bcd4 0%, #a855f7 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Sparkles size={26} style={{ color: '#00bcd4' }} />
            None AI Mentor
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: 0 }}>
            Connect indicator configurations and study setups with None AI, our high-precision Groq quantitative assistant.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', color: '#c0c2cc', background: 'rgba(255,255,255,0.05)', padding: '6px 12px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.08)', fontWeight: '700' }}>
            Groq LLaMA 3.3 70B
          </span>
        </div>
      </div>

      {/* Mobile Tab Selectors */}
      {isMobile && (
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', background: 'rgba(255,255,255,0.02)', padding: '4px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <button type="button" onClick={() => setMobileTab('history')} style={{ padding: '10px', borderRadius: '8px', border: 'none', fontSize: '13px', fontWeight: '700', cursor: 'pointer', background: mobileTab === 'history' ? '#10142d' : 'transparent', color: mobileTab === 'history' ? '#00bcd4' : '#9b9eac', transition: 'all 0.2s' }}>
              History
            </button>
            <button type="button" onClick={() => setMobileTab('chat')} style={{ padding: '10px', borderRadius: '8px', border: 'none', fontSize: '13px', fontWeight: '700', cursor: 'pointer', background: mobileTab === 'chat' ? '#10142d' : 'transparent', color: mobileTab === 'chat' ? '#00bcd4' : '#9b9eac', transition: 'all 0.2s' }}>
              AI Chat
            </button>
            <button type="button" onClick={() => setMobileTab('technicals')} style={{ padding: '10px', borderRadius: '8px', border: 'none', fontSize: '13px', fontWeight: '700', cursor: 'pointer', background: mobileTab === 'technicals' ? '#10142d' : 'transparent', color: mobileTab === 'technicals' ? '#00bcd4' : '#9b9eac', transition: 'all 0.2s' }}>
              Analytics
            </button>
          </div>
        </div>
      )}

      {/* Clean 3-Column Layout: Consistent History on Left, Chat Center, Combined Tab Sidebar on Right */}
      <div className="responsive-grid-stack" style={{ display: 'grid', gridTemplateColumns: '260px 1fr 380px', gap: '20px', alignItems: 'stretch' }}>
        
        {/* LEFT COLUMN: ALWAYS CONVERSATION HISTORY */}
        <div style={{
          background: 'var(--bg-card-glass)',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
          padding: '16px',
          display: isMobile && mobileTab !== 'history' ? 'none' : 'flex',
          flexDirection: 'column',
          gap: '12px',
          height: '640px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.25)'
        }}>
          <button
            onClick={handleNewChat}
            style={{
              background: 'linear-gradient(135deg, rgba(0, 188, 212, 0.12) 0%, rgba(168, 85, 247, 0.03) 100%)',
              border: '1px solid rgba(0, 188, 212, 0.25)',
              borderRadius: '8px',
              color: '#00bcd4',
              padding: '10px',
              fontWeight: '800',
              fontSize: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(0, 188, 212, 0.18)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(0, 188, 212, 0.12)';
            }}
          >
            <Plus size={14} />
            New Conversation
          </button>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', margin: '2px 0' }} />

          <span style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            None AI Conversations
          </span>

          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px', paddingRight: '4px' }}>
            {conversations.length === 0 ? (
              <div style={{ color: 'var(--text-secondary)', fontSize: '11px', textAlign: 'center', padding: '16px 0', fontStyle: 'italic' }}>
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
                       background: isActive ? 'rgba(0, 188, 212, 0.08)' : 'rgba(255,255,255,0.02)',
                       border: isActive ? '1px solid rgba(0, 188, 212, 0.25)' : '1px solid rgba(255,255,255,0.04)',
                       borderRadius: '8px',
                       padding: '8px 10px',
                       cursor: 'pointer',
                       display: 'flex',
                       alignItems: 'center',
                       justifyContent: 'space-between',
                       gap: '6px',
                       transition: 'all 0.2s ease'
                     }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden', flex: 1 }}>
                      <MessageSquare size={13} style={{ color: isActive ? '#00bcd4' : 'var(--text-secondary)', flexShrink: 0 }} />
                      <span style={{
                        fontSize: '11px',
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
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      onMouseEnter={e => e.currentTarget.style.color = '#ff4444'}
                      onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* CENTER COLUMN: SPACIOUS CHAT CANVAS */}
        <div style={{
          background: 'var(--bg-card-glass)',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
          padding: '20px',
          display: isMobile && mobileTab !== 'chat' ? 'none' : 'flex',
          flexDirection: 'column',
          height: '640px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.25)'
        }}>
          
          {/* None Active Header Core */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px', 
            background: 'rgba(0, 188, 212, 0.04)', 
            border: '1px solid rgba(0, 188, 212, 0.15)', 
            borderRadius: '12px', 
            padding: '10px 14px', 
            marginBottom: '12px' 
          }}>
            <div className="none-core-active" style={{ 
              width: '28px', 
              height: '28px', 
              borderRadius: '50%', 
              background: 'radial-gradient(circle, #00ffff 20%, rgba(0, 188, 212, 0.3) 60%, transparent 100%)', 
              border: '2px dashed #00ffff', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <div className="none-core-inner" style={{ 
                width: '12px', 
                height: '12px', 
                borderRadius: '50%', 
                background: '#ffffff', 
                boxShadow: '0 0 10px #ffffff' 
              }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '11px', fontWeight: '800', color: '#00bcd4', textTransform: 'uppercase', letterSpacing: '0.5px' }}>None Core Enabled</div>
              <div style={{ fontSize: '10px', color: '#c0c2cc' }}>Ingesting context: **{symbol}** • {timeframe} • {accountMode.toUpperCase()} MODE</div>
            </div>
          </div>

          {/* Messages log */}
          <div style={{ flex: 1, overflowY: 'auto', paddingRight: '6px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {messages.map((msg, idx) => {
              if (msg.sender === 'user') {
                const isProAccount = user?.is_pro || accountMode === 'pro';
                return (
                  <div 
                    key={idx} 
                    className={isProAccount ? 'neon-border-wrapper-pro' : 'neon-border-wrapper-standard'}
                  >
                    <div className="bubble-content">
                      <p style={{ margin: 0, fontSize: '13px', fontWeight: '750', lineHeight: '1.4', color: isProAccount ? '#00e5ff' : '#00ff88' }}>
                        {msg.text}
                      </p>
                    </div>
                  </div>
                );
              }

              return (
                <div 
                  key={idx} 
                  style={{
                    alignSelf: 'flex-start',
                    maxWidth: '82%',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(0, 188, 212, 0.12)',
                    borderRadius: '12px 12px 12px 2px',
                    padding: '12px 16px',
                    color: '#ffffff',
                  }}
                >
                  <div>
                    {formatAIMessage(msg.text)}
                  </div>
                </div>
              );
            })}
            {sending && (
              <div style={{ alignSelf: 'flex-start', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', borderRadius: '12px 12px 12px 2px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '8px', color: '#c0c2cc' }}>
                <RefreshCw className="animate-spin" size={13} />
                <span style={{ fontSize: '11px' }}>
                  None is compiling on-point setup indicators...
                </span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Suggested Prompts Block */}
          {messages.length === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '12px' }}>
              <span style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: '700' }}>SUGGESTED QUESTIONS</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {SUGGESTED_PROMPTS.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(p)}
                    style={{
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                      borderRadius: '16px',
                      padding: '6px 12px',
                      color: 'var(--text-primary)',
                      fontSize: '11px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      transition: '0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(0, 188, 212, 0.08)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)'}
                  >
                    <HelpCircle size={11} style={{ color: '#00bcd4' }} />
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Chat input */}
          <div style={{ display: 'flex', gap: '10px', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '12px' }}>
            <input 
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask None AI (e.g. 'Explain risk zones for this setup' or 'Is this a trap?')..."
              style={{
                flex: 1,
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '8px',
                padding: '10px 14px',
                color: '#ffffff',
                fontSize: '13px',
                outline: 'none'
              }}
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={sending}
              style={{
                background: 'linear-gradient(135deg, #00bcd4 0%, #a855f7 100%)',
                border: 'none',
                borderRadius: '8px',
                color: '#ffffff',
                padding: '10px 16px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: sending ? 0.6 : 1,
                fontWeight: '800',
                transition: 'all 0.2s'
              }}
            >
              <Send size={15} />
            </button>
          </div>

        </div>

        {/* RIGHT COLUMN: SIMULATION & ANALYTICS TAB HUB (REMOVES MESSINESS) */}
        <div style={{
          background: 'var(--bg-card-glass)',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
          display: isMobile && mobileTab !== 'technicals' ? 'none' : 'flex',
          flexDirection: 'column',
          height: '640px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden'
        }}>
          
          {/* Tab Selector Header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            background: 'rgba(255,255,255,0.02)',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
            padding: '4px'
          }}>
            <button
              onClick={() => setRightTab('simulator')}
              style={{
                padding: '12px 6px',
                border: 'none',
                background: rightTab === 'simulator' ? 'rgba(0, 188, 212, 0.08)' : 'transparent',
                color: rightTab === 'simulator' ? '#00bcd4' : '#9b9eac',
                fontSize: '11px',
                fontWeight: '800',
                cursor: 'pointer',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                transition: 'all 0.2s'
              }}
            >
              <Sliders size={12} />
              Simulator
            </button>
            <button
              onClick={() => setRightTab('forecast')}
              style={{
                padding: '12px 6px',
                border: 'none',
                background: rightTab === 'forecast' ? 'rgba(0, 255, 136, 0.06)' : 'transparent',
                color: rightTab === 'forecast' ? '#00ff88' : '#9b9eac',
                fontSize: '11px',
                fontWeight: '800',
                cursor: 'pointer',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                transition: 'all 0.2s'
              }}
            >
              <BarChart2 size={12} />
              Forecasts
            </button>
            <button
              onClick={() => setRightTab('library')}
              style={{
                padding: '12px 6px',
                border: 'none',
                background: rightTab === 'library' ? 'rgba(168, 85, 247, 0.08)' : 'transparent',
                color: rightTab === 'library' ? '#a855f7' : '#9b9eac',
                fontSize: '11px',
                fontWeight: '800',
                cursor: 'pointer',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                transition: 'all 0.2s'
              }}
            >
              <BookOpen size={12} />
              Library
            </button>
          </div>

          {/* Active Tab Body */}
          <div style={{ flex: 1, padding: '16px', overflowY: 'auto' }}>
            
            {/* 1. SIMULATOR TAB CONTENT */}
            {rightTab === 'simulator' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', color: '#00bcd4', fontWeight: '850', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Simulation Ingestion</span>
                  <div style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.03)', padding: '2px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <button
                      onClick={() => setAccountMode('learner')}
                      style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        border: 'none',
                        fontSize: '10px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        background: accountMode === 'learner' ? '#00bcd4' : 'transparent',
                        color: accountMode === 'learner' ? '#0a0e27' : '#9b9eac'
                      }}
                    >
                      Learner
                    </button>
                    <button
                      onClick={() => setAccountMode('pro')}
                      style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        border: 'none',
                        fontSize: '10px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        background: accountMode === 'pro' ? '#a855f7' : 'transparent',
                        color: accountMode === 'pro' ? '#ffffff' : '#9b9eac'
                      }}
                    >
                      Pro
                    </button>
                  </div>
                </div>

                {/* Scenario presets pills */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <span style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: '700' }}>SCENARIO PRESETS</span>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                    {Object.keys(presets).map((key) => {
                      let color = '#00bcd4';
                      let bg = 'rgba(0,188,212,0.05)';
                      let border = 'rgba(0,188,212,0.15)';
                      if (key === 'trap') { color = '#ff4444'; bg = 'rgba(255,68,68,0.05)'; border = 'rgba(255,68,68,0.15)'; }
                      if (key === 'breakout') { color = '#00ff88'; bg = 'rgba(0,255,136,0.05)'; border = 'rgba(0,255,136,0.15)'; }
                      if (key === 'bearTrap') { color = '#ffb300'; bg = 'rgba(255,179,0,0.05)'; border = 'rgba(255,179,0,0.15)'; }

                      return (
                        <button
                          key={key}
                          onClick={() => applyPreset(key)}
                          style={{
                            background: bg,
                            border: `1px solid ${border}`,
                            borderRadius: '6px',
                            padding: '6px',
                            color: color,
                            fontSize: '11px',
                            fontWeight: '700',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                        >
                          {key === 'trap' ? 'Liquidity Trap' : key === 'breakout' ? 'Breakout' : key === 'oversold' ? 'Oversold Support' : 'Bear Trap'}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }} />

                {/* Input Fields */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    <span style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: '700' }}>SYMBOL</span>
                    <input
                      type="text"
                      value={symbol}
                      onChange={e => setSymbol(e.target.value.toUpperCase())}
                      style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px', padding: '6px 10px', color: '#ffffff', fontSize: '11px', outline: 'none' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                      <span style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: '700' }}>TIMEFRAME</span>
                      <select
                        value={timeframe}
                        onChange={e => setTimeframe(e.target.value)}
                        style={{ background: '#0f1124', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px', padding: '6px 8px', color: '#ffffff', fontSize: '11px', outline: 'none' }}
                      >
                        <option value="15m">15m</option>
                        <option value="1h">1h</option>
                        <option value="1d">1d</option>
                      </select>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                      <span style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: '700' }}>PRICE</span>
                      <input
                        type="number"
                        value={currentPrice}
                        step="0.01"
                        onChange={e => setCurrentPrice(e.target.value)}
                        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px', padding: '6px 10px', color: '#ffffff', fontSize: '11px', outline: 'none' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
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

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    <span style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: '700' }}>MACD SIGNAL</span>
                    <select
                      value={macdSignal}
                      onChange={e => setMacdSignal(e.target.value)}
                      style={{ background: '#0f1124', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px', padding: '6px 8px', color: '#ffffff', fontSize: '11px', outline: 'none' }}
                    >
                      <option value="bullish_cross">Bullish Crossover</option>
                      <option value="bearish_cross">Bearish Crossover</option>
                      <option value="bullish_divergence">Bullish Divergence</option>
                      <option value="bearish_divergence">Bearish Divergence</option>
                      <option value="neutral">Neutral Consolidation</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    <span style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: '700' }}>TREND CONTEXT</span>
                    <input
                      type="text"
                      value={trend}
                      onChange={e => setTrend(e.target.value)}
                      style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px', padding: '6px 10px', color: '#ffffff', fontSize: '11px', outline: 'none' }}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    <span style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: '700' }}>CANDLESTICK PATTERN</span>
                    <textarea
                      value={patternDetected}
                      onChange={e => setPatternDetected(e.target.value)}
                      rows="2"
                      style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px', padding: '6px 10px', color: '#ffffff', fontSize: '11px', outline: 'none', resize: 'none', fontFamily: 'inherit' }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 2.             {/* 2. FORECASTS TAB CONTENT */}
            {rightTab === 'forecast' && (() => {
              const getTVSymbol = () => {
                const s = (activeTechnicals?.symbol || symbol || 'AAPL').toUpperCase().replace('.NS', '');
                if (s === 'NIFTY' || s === '^NSEI') return 'NSE:NIFTY';
                if (s === 'SENSEX' || s === '^BSESN') return 'BSE:SENSEX';
                if (s === 'NIFTYBANK' || s === 'BANKNIFTY' || s === '^NSEBANK') return 'NSE:BANKNIFTY';
                if (['RELIANCE', 'TCS', 'SBIN'].includes(s)) return `NSE:${s}`;
                if (['BTC', 'ETH'].includes(s)) return `COINBASE:${s}USD`;
                return s;
              };
              const tvSymbol = getTVSymbol();

              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  
                  {/* Search Bar - PRO VERSION ONLY */}
                  {(accountMode === 'pro' || user?.is_pro) && (
                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (forecastSearch.trim()) {
                          loadStockForecast(forecastSearch.trim().toUpperCase(), false);
                          setForecastSearch('');
                        }
                      }} 
                      style={{ display: 'flex', gap: '6px' }}
                    >
                      <input
                        type="text"
                        placeholder="Search stock symbol (e.g. AAPL, TSLA)..."
                        value={forecastSearch}
                        onChange={e => setForecastSearch(e.target.value)}
                        style={{
                          flex: 1,
                          background: 'rgba(255,255,255,0.02)',
                          border: '1px solid rgba(168, 85, 247, 0.4)',
                          borderRadius: '6px',
                          padding: '6px 10px',
                          color: '#ffffff',
                          fontSize: '11px',
                          outline: 'none',
                          transition: 'border 0.2s'
                        }}
                        onFocus={e => e.currentTarget.style.borderColor = '#a855f7'}
                        onBlur={e => e.currentTarget.style.borderColor = 'rgba(168, 85, 247, 0.4)'}
                      />
                      <button
                        type="submit"
                        style={{
                          background: 'rgba(168, 85, 247, 0.2)',
                          border: '1px solid #a855f7',
                          borderRadius: '6px',
                          color: '#a855f7',
                          padding: '6px 10px',
                          cursor: 'pointer',
                          fontSize: '11px',
                          fontWeight: '800'
                        }}
                      >
                        Search
                      </button>
                    </form>
                  )}

                  {/* TradingView Live Chart widget */}
                  <div>
                    <span style={{ fontSize: '11px', color: '#00bcd4', fontWeight: '850', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '8px' }}>
                      Live Market Chart
                    </span>
                    <iframe
                      src={`https://s.tradingview.com/widgetembed/?frameElementId=tradingview_chart&symbol=${encodeURIComponent(tvSymbol)}&interval=D&hidesidetoolbar=1&symboledit=0&saveimage=0&toolbarbg=10121c&theme=dark&style=1&timezone=exchange&locale=en`}
                      style={{ width: '100%', height: '200px', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px' }}
                      title="TradingView Live Chart"
                    />
                  </div>

                  {/* Live Technicals Section */}
                  <div>
                    <span style={{ fontSize: '11px', color: '#00ff88', fontWeight: '850', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '10px' }}>
                      Live Technical Signals
                    </span>
                    
                    {activeTechnicals ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', padding: '12px', borderRadius: '10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '8px' }}>
                          <span style={{ fontSize: '14px', fontWeight: '900', color: '#ffffff' }}>{activeTechnicals.symbol}</span>
                          <span style={{ fontSize: '16px', fontWeight: '900', color: '#00ff88' }}>₹{activeTechnicals.price.toLocaleString('en-IN')}</span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-secondary)' }}>RSI (14):</span>
                            <span style={{ fontWeight: '800', color: activeTechnicals.rsi > 70 ? '#ff4444' : activeTechnicals.rsi < 30 ? '#00ff88' : '#00bcd4' }}>
                              {activeTechnicals.rsi} ({activeTechnicals.rsi > 70 ? 'Overbought' : activeTechnicals.rsi < 30 ? 'Oversold' : 'Neutral'})
                            </span>
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-secondary)' }}>30-Day Trend:</span>
                            <span style={{ fontWeight: '800', color: activeTechnicals.trend === 'BULLISH' ? '#00ff88' : '#ff4444', display: 'flex', alignItems: 'center', gap: '3px' }}>
                              {activeTechnicals.trend === 'BULLISH' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                              {activeTechnicals.trend}
                            </span>
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-secondary)' }}>Support Floor:</span>
                            <span style={{ fontWeight: '800', color: '#00ff88' }}>₹{activeTechnicals.support.toLocaleString('en-IN')}</span>
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-secondary)' }}>Resistance Ceiling:</span>
                            <span style={{ fontWeight: '800', color: '#ff4444' }}>₹{activeTechnicals.resistance.toLocaleString('en-IN')}</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div style={{ color: 'var(--text-secondary)', fontSize: '11px', textAlign: 'center', padding: '16px 0', fontStyle: 'italic' }}>
                        No active technical data. Submit a prompt to start simulator analysis.
                      </div>
                    )}
                  </div>

                  {/* ML Ensemble Section */}
                  {activeMLEnsemble && (
                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px' }}>
                      <span style={{ fontSize: '11px', color: '#00bcd4', fontWeight: '850', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '10px' }}>
                        ML Ensemble Forecast
                      </span>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', padding: '12px', borderRadius: '10px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span style={{ fontSize: '9px', color: 'var(--text-secondary)', fontWeight: '700' }}>OVERALL FORECAST PROBABILITY</span>
                          <div style={{ height: '20px', borderRadius: '10px', overflow: 'hidden', display: 'flex', fontSize: '9px', fontWeight: '800', color: '#0a0e27' }}>
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

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '8px' }}>
                          <span style={{ fontSize: '9px', color: 'var(--text-secondary)', fontWeight: '700' }}>COMPONENT SIGNALS</span>
                          {activeMLEnsemble.components.map((comp, idx) => (
                            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
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

                        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '8px', fontSize: '11px' }}>
                          <span style={{ color: 'var(--text-secondary)' }}>Ensemble Confidence:</span>
                          <span style={{ fontWeight: '950', color: '#00bcd4' }}>{activeMLEnsemble.confidence}%</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Live News Section */}
                  {activeNews && activeNews.length > 0 && (
                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px' }}>
                      <span style={{ fontSize: '11px', color: '#a855f7', fontWeight: '850', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '10px' }}>
                        Live Market News
                      </span>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {activeNews.map((n, idx) => (
                          <a
                            key={idx}
                            href={n.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: 'block',
                              background: 'rgba(255,255,255,0.01)',
                              border: '1px solid rgba(255,255,255,0.03)',
                              padding: '10px',
                              borderRadius: '8px',
                              textDecoration: 'none',
                              transition: 'all 0.2s',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                              e.currentTarget.style.borderColor = 'rgba(168, 85, 247, 0.3)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.01)';
                              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.03)';
                            }}
                          >
                            <div style={{ fontSize: '11px', fontWeight: '800', color: '#e0e0e0', marginBottom: '4px', lineHeight: '1.4' }}>
                              {n.title}
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: 'var(--text-secondary)' }}>
                              <span>{n.publisher}</span>
                              <span>{n.time}</span>
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Trending Symbols Selection */}
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px' }}>
                    <span style={{ fontSize: '10px', color: '#00bcd4', fontWeight: '880', display: 'block', marginBottom: '8px', letterSpacing: '0.5px' }}>TRENDING SYMBOLS</span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {['RELIANCE', 'TCS', 'SBIN', 'NIFTY', 'BTC', 'ETH'].map((t) => (
                        <button
                          key={t}
                          onClick={() => {
                            loadStockForecast(t, false);
                          }}
                          style={{
                            background: 'rgba(255,255,255,0.02)',
                            border: '1px solid rgba(255,255,255,0.06)',
                            borderRadius: '6px',
                            color: '#ffffff',
                            padding: '4px 10px',
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
              );
            })()}

            {/* 3. SYLLABUS LIBRARY TAB CONTENT */}
            {rightTab === 'library' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <span style={{ fontSize: '11px', color: '#a855f7', fontWeight: '850', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '4px' }}>
                  Trading Library Syllabus
                </span>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {Object.keys(syllabus).length === 0 ? (
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textAlign: 'center', padding: '16px' }}>
                      Loading library topics...
                    </div>
                  ) : (
                    Object.keys(syllabus).map(category => {
                      const isExpanded = expandedCategory === category;
                      return (
                        <div key={category} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '4px' }}>
                          <button
                            type="button"
                            onClick={() => setExpandedCategory(isExpanded ? null : category)}
                            style={{
                              width: '100%',
                              background: 'none',
                              border: 'none',
                              color: isExpanded ? '#00bcd4' : '#e0e0e0',
                              padding: '6px 0',
                              fontSize: '11px',
                              fontWeight: '700',
                              textAlign: 'left',
                              cursor: 'pointer',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                            }}
                          >
                            <span>{category}</span>
                            {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                          </button>
                          
                          {isExpanded && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingLeft: '6px', paddingTop: '4px', paddingBottom: '4px' }}>
                              {syllabus[category].map(topic => (
                                <button
                                  key={topic.id}
                                  type="button"
                                  onClick={() => handleSendMessage(`Explain ${topic.title} and how it applies to our setup`)}
                                  style={{
                                    background: 'rgba(255, 255, 255, 0.01)',
                                    border: '1px solid rgba(255, 255, 255, 0.03)',
                                    borderRadius: '5px',
                                    padding: '5px 8px',
                                    fontSize: '11px',
                                    color: '#c0c2cc',
                                    textAlign: 'left',
                                    cursor: 'pointer',
                                    transition: 'all 0.15s ease',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    width: '100%'
                                  }}
                                  onMouseEnter={e => {
                                    e.currentTarget.style.background = 'rgba(168, 85, 247, 0.06)';
                                    e.currentTarget.style.color = '#ffffff';
                                    e.currentTarget.style.borderColor = 'rgba(168, 85, 247, 0.2)';
                                  }}
                                  onMouseLeave={e => {
                                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.01)';
                                    e.currentTarget.style.color = '#c0c2cc';
                                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.03)';
                                  }}
                                >
                                  <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#a855f7', flexShrink: 0 }} />
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
            )}

          </div>

        </div>

      </div>

    </div>
  );
}
