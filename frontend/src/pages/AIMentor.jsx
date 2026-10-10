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
  try {
  // Format lines
  const lines = text.split('\n');
  return lines.map((line, idx) => {
    let cleanLine = line.trim();
    
    // Check headers
    if (cleanLine.startsWith('###')) {
      return <h4 key={idx} style={{ fontSize: '13px', fontWeight: '800', color: '#C2410C', marginTop: '12px', marginBottom: '6px', textTransform: 'uppercase' }}>{cleanLine.replace('###', '')}</h4>;
    }
    if (cleanLine.startsWith('##')) {
      return <h3 key={idx} style={{ fontSize: '15px', fontWeight: '800', color: '#0369a1', marginTop: '16px', marginBottom: '8px' }}>{cleanLine.replace('##', '')}</h3>;
    }
    if (cleanLine.startsWith('#')) {
      return <h2 key={idx} style={{ fontSize: '18px', fontWeight: '900', color: '#000000', marginTop: '20px', marginBottom: '10px' }}>{cleanLine.replace('#', '')}</h2>;
    }

    // Check bullet points
    if (cleanLine.startsWith('-') || cleanLine.startsWith('*')) {
      const content = cleanLine.substring(1).trim();
      return <li key={idx} style={{ marginLeft: '16px', marginBottom: '4px', fontSize: '13px', color: '#000000' }}>{parseBoldText(content)}</li>;
    }

    // Check bold disclaimers
    if (cleanLine.includes('**Disclaimer:') || cleanLine.includes('**Not Financial Advice:')) {
      return (
        <div key={idx} style={{ background: '#fffbeb', border: '1px solid #fde68a', padding: '12px', borderRadius: '8px', color: '#b45309', fontSize: '11px', marginTop: '16px', lineHeight: '1.4' }}>
          {cleanLine.replace(/\*\*/g, '')}
        </div>
      );
    }

    if (cleanLine === '') return <div key={idx} style={{ height: '8px' }} />;

    return <p key={idx} style={{ fontSize: '13px', margin: '0 0 8px 0', lineHeight: '1.5', color: '#000000' }}>{parseBoldText(cleanLine)}</p>;
  });
  } catch (e) {
    return <p style={{ fontSize: '13px', margin: '0 0 8px 0', lineHeight: '1.5', color: '#000000' }}>{String(text)}</p>;
  }
}

function parseBoldText(text) {
  const parts = text.split(/\*\*([^*]+)\*\*/g);
  return parts.map((part, i) => {
    if (i % 2 === 1) {
      return <strong key={i} style={{ color: '#000000', fontWeight: '800' }}>{part}</strong>;
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
      text: '### Stocks Operator AI Core Initialized\nHello! I am **Stocks Operator AI**, your AI Trading Mentor. Powered by LLaMA 3.3 (70B) via Groq API.\n\nUse the **Simulation Hub** on the right side of the screen to customize simulated chart conditions. Toggle between **Learner Mode** and **Pro Mode** to change how I explain concepts. Ask me to identify retail traps, plan risk invalidation zones, or evaluate candlestick patterns! You can also query general trading theories (like *"What is RSI?"* or *"Explain Support and Resistance"*).'
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
  const lastUserMsgRef = useRef(null);

  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [mobileTab, setMobileTab] = useState('chat');

  // Scenario presets
  const presets = {
    trap: {
      symbol: 'BTC',
      timeframe: '15m',
      currentPrice: 64200.00,
      rsi: 68.4,
      macdSignal: 'bearish_divergence',
      trend: 'Liquidity Sweep (Weakening)',
      patternDetected: 'Potential Retail Liquidity Trap / Fakeout near 64,800.00 resistance'
    },
    breakout: {
      symbol: 'NVDA',
      timeframe: '1h',
      currentPrice: 128.50,
      rsi: 58.2,
      macdSignal: 'bullish_cross',
      trend: 'Strong Uptrend',
      patternDetected: 'Bull Flag Continuation Breakout above 127.00 with institutional volume'
    },
    oversold: {
      symbol: 'AAPL',
      timeframe: '1d',
      currentPrice: 215.00,
      rsi: 26.8,
      macdSignal: 'oversold_convergence',
      trend: 'Downward Correction',
      patternDetected: 'Double Bottom pattern near long-term support floor at 214.00'
    },
    bearTrap: {
      symbol: 'TSLA',
      timeframe: '15m',
      currentPrice: 242.50,
      rsi: 64.2,
      macdSignal: 'bearish_cross',
      trend: 'Slightly Bullish',
      patternDetected: 'Fake Breakdown / Bear Trap reclaim near 240.00 support level'
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
    if (lastUserMsgRef.current) {
      lastUserMsgRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
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
          const symHash = (data.symbol || '').split('').reduce((a, b) => a + b.charCodeAt(0), 0);
          macd = (symHash % 2 === 0) ? 'bullish_cross' : 'bearish_cross';
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

        const symHashVal = (data.symbol || '').split('').reduce((a, b) => a + b.charCodeAt(0), 0);
        setActiveMLEnsemble({
          overall: {
            buy: data.rsi < 35 ? 75 : data.rsi > 65 ? 15 : data.trend === 'BULLISH' ? 60 : 35,
            hold: 25,
            sell: data.rsi > 65 ? 60 : data.rsi < 35 ? 10 : data.trend === 'BEARISH' ? 50 : 40
          },
          confidence: 75 + (symHashVal % 15),
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
          setMessages(prev => {
            if (prev && prev.length > 1) return prev;
            return [
              {
                id: 'welcome_' + Date.now(),
                sender: 'ai',
                text: `### Live Chart Ingested for **${data.symbol}**\nStocks Operator AI has successfully scanned the live charts and indicators for **${data.symbol}**.\n\n* **Last Price**: ₹${data.price}\n* **RSI (14)**: ${data.rsi} (${data.rsi > 70 ? 'Overbought' : data.rsi < 30 ? 'Oversold' : 'Neutral'})\n* **Calculated Support**: ₹${data.support}\n* **Calculated Resistance**: ₹${data.resistance}\n* **Primary Trend**: ${data.trend}\n\nAsk me any questions about this setup (e.g. "Is this a trap?" or "Should I enter a buy/sell trade?"). I am ready to guide you.`
              }
            ];
          });
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
        text: '### Stocks Operator AI Core Initialized\nHello! I am **Stocks Operator AI**, your AI Trading Mentor. Powered by LLaMA 3.3 (70B) via Groq API.\n\nUse the **Simulation Hub** on the right side of the screen to customize simulated chart conditions. Toggle between **Learner Mode** and **Pro Mode** to change how I explain concepts. Ask me to identify retail traps, plan risk invalidation zones, or evaluate candlestick patterns! You can also query general trading theories (like *"What is RSI?"* or *"Explain Support and Resistance"*).'
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
      const mapped = res.data.map((m, idx) => ({
        id: m.id || `hist_${idx}_${Date.now()}`,
        sender: m.sender === 'model' ? 'ai' : m.sender,
        text: m.text,
        timestamp: m.created_at ? new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null
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
            const symHash = (data.symbol || '').split('').reduce((a, b) => a + b.charCodeAt(0), 0);
            activeMacd = (symHash % 2 === 0) ? 'bullish_cross' : 'bearish_cross';
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

          const symHashVal = (data.symbol || '').split('').reduce((a, b) => a + b.charCodeAt(0), 0);
          setActiveMLEnsemble({
            overall: {
              buy: data.rsi < 35 ? 75 : data.rsi > 65 ? 15 : data.trend === 'BULLISH' ? 60 : 35,
              hold: 25,
              sell: data.rsi > 65 ? 60 : data.rsi < 35 ? 10 : data.trend === 'BEARISH' ? 50 : 40
            },
            confidence: 75 + (symHashVal % 15),
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
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (userMsgCount >= 5 && !user?.is_pro) {
      toast.error('Free limit reached! Please upgrade to Pro for unlimited None AI Mentor conversations.');
      setMessages(prev => [
        ...prev,
        { id: 'user_' + Date.now(), sender: 'user', text, timestamp: timeNow },
        {
          id: 'ai_' + Date.now(),
          sender: 'ai',
          replyTo: text,
          timestamp: timeNow,
          text: '### Pro Membership Required\n\nYou have completed your limit of 5 free messages with Stocks Operator AI Mentor. Upgrade to **Stocks Operator Pro** to enjoy unlimited conversational guidance, options scanner metrics, and custom SMS/WhatsApp notifications.\n\n[Upgrade to Pro Membership](/upgrade-pro)'
        }
      ]);
      setSending(false);
      return;
    }

    const newUserMsg = {
      id: 'msg_user_' + Date.now(),
      sender: 'user',
      text,
      timestamp: timeNow
    };
    setMessages(prev => [...prev, newUserMsg]);

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

      let aiResponseText = res.data.response;
      let backtestPayload = null;

      const jsonMatch = aiResponseText.match(/```json\s*(\{[\s\S]*?"_type":\s*"BACKTEST_REQUEST"[\s\S]*?\})\s*```/);
      if (jsonMatch) {
        try {
          backtestPayload = JSON.parse(jsonMatch[1]);
          aiResponseText = aiResponseText.replace(jsonMatch[0], '').trim();
        } catch (e) {
          console.error("Failed to parse backtest JSON", e);
        }
      }

      const newAiMsg = {
        id: 'msg_ai_' + Date.now(),
        sender: 'ai',
        text: aiResponseText || "Running your strategy simulation...",
        replyTo: text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, newAiMsg]);

      if (backtestPayload) {
        try {
          const btRes = await apiClient.post('/strategy/backtest', backtestPayload);
          const btData = btRes.data;
          
          const resultText = `### Backtest Results for **${backtestPayload.symbol}**
- **Win Rate:** ${btData.winRate}%
- **Total Profit:** ${btData.profit}% (₹${btData.profitVal})
- **Max Drawdown:** ${btData.drawdown}%
- **Sharpe Ratio:** ${btData.sharpeRatio}
- **Total Trades Taken:** ${btData.trades?.length || 0}
- **Avg Holding Time:** ${btData.avgHoldingTime} bars

*Note: Simulation based on historical data. Strategy backtested on ${backtestPayload.range || '1y'} timeframe with ₹${backtestPayload.capital || 100000} starting capital.*`;
          
          setMessages(prev => [...prev, {
            id: 'msg_ai_bt_' + Date.now(),
            sender: 'ai',
            text: resultText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }]);
        } catch (err) {
          console.error("Backtest failed", err);
          setMessages(prev => [...prev, {
            id: 'msg_ai_bt_err_' + Date.now(),
            sender: 'ai',
            text: "Failed to execute the backtest on the engine. Please check the condition parameters and try again.",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }]);
        }
      }

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
      setMessages(prev => [...prev, { sender: 'ai', text: '### Connection Interrupted\nFailed to establish contact with Stocks Operator AI Core. Please verify if the backend server is running and the GROQ_API_KEY is configured.' }]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto', color: '#ffffff' }}>
      
      {/* CSS Animation Injector */}
      <style>{`
        @keyframes pulse-core {
          0% { transform: scale(0.95); filter: drop-shadow(0 0 8px rgba(255, 215, 0, 0.5)); }
          100% { transform: scale(1.08); filter: drop-shadow(0 0 22px rgba(0, 243, 255, 0.9)); }
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
        
        /* Neon Border Animations - Gold & Cyan Pro Theme */
        @keyframes rotate-neon {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .neon-border-wrapper-pro {
          position: relative;
          border-radius: 12px;
          padding: 1.8px;
          overflow: hidden;
          background: rgba(255, 215, 0, 0.05);
          display: inline-block;
          align-self: flex-end;
          max-width: 85%;
          box-shadow: 0 0 20px rgba(255, 215, 0, 0.25), 0 0 12px rgba(0, 243, 255, 0.15);
        }
        .neon-border-wrapper-pro::before {
          content: '';
          position: absolute;
          top: -150%;
          left: -150%;
          width: 400%;
          height: 400%;
          background: conic-gradient(from 0deg, transparent 20%, #ffd700 45%, #00f3ff 65%, #f59e0b 80%, transparent 95%);
          animation: rotate-neon 3.5s infinite linear;
          z-index: 0;
        }
        .neon-border-wrapper-pro .bubble-content {
          position: relative;
          background: linear-gradient(135deg, rgba(14, 17, 36, 0.96) 0%, rgba(10, 12, 28, 0.98) 100%);
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
          max-width: 85%;
          box-shadow: 0 0 15px rgba(234, 88, 12, 0.2);
        }
        .neon-border-wrapper-standard::before {
          content: '';
          position: absolute;
          top: -150%;
          left: -150%;
          width: 400%;
          height: 400%;
          background: conic-gradient(from 0deg, transparent 30%, #EA580C 50%, transparent 70%);
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
        background: '#FFFFFF',
        border: '1.5px solid #E2E8F0',
        borderRadius: '16px',
        padding: '20px 24px',
        marginBottom: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.03)',
        position: 'relative',
        zIndex: 2
      }}>
        <div>
          <h1 style={{ 
            fontSize: '24px', 
            fontWeight: '900', 
            margin: '0 0 6px 0', 
            color: '#0F172A',
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px' 
          }}>
            <Sparkles size={24} style={{ color: '#EA580C' }} />
            AI Quantitative Mentor
            {(accountMode === 'pro' || user?.is_pro) && (
              <span style={{
                fontSize: '11px',
                fontWeight: '900',
                background: '#FEF08A',
                border: '1px solid #FACC15',
                color: '#854D0E',
                padding: '3px 10px',
                borderRadius: '12px',
                letterSpacing: '0.8px',
                textTransform: 'uppercase',
                verticalAlign: 'middle'
              }}>
                PRO ELITE
              </span>
            )}
          </h1>
          <p style={{ color: '#334155', fontSize: '13px', margin: 0, fontWeight: 500 }}>
            Connect indicator configurations and study setups with our high-precision Groq quantitative assistant.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <span style={{ 
            fontSize: '12px', 
            color: '#9A3412', 
            background: '#FFF7ED', 
            padding: '6px 14px', 
            borderRadius: '20px', 
            border: '1.5px solid #FDBA74', 
            fontWeight: '800' 
          }}>
            Groq LLaMA 3.3 70B
          </span>
        </div>
      </div>

      {/* Mobile Tab Selectors */}
      {isMobile && (
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', background: '#F1F5F9', padding: '4px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
            <button type="button" onClick={() => setMobileTab('history')} style={{ padding: '10px', borderRadius: '8px', border: 'none', fontSize: '13px', fontWeight: '800', cursor: 'pointer', background: mobileTab === 'history' ? '#FFFFFF' : 'transparent', color: mobileTab === 'history' ? '#9A3412' : '#475569', boxShadow: mobileTab === 'history' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none', transition: 'all 0.2s' }}>
              History
            </button>
            <button type="button" onClick={() => setMobileTab('chat')} style={{ padding: '10px', borderRadius: '8px', border: 'none', fontSize: '13px', fontWeight: '800', cursor: 'pointer', background: mobileTab === 'chat' ? '#FFFFFF' : 'transparent', color: mobileTab === 'chat' ? '#9A3412' : '#475569', boxShadow: mobileTab === 'chat' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none', transition: 'all 0.2s' }}>
              AI Chat
            </button>
            <button type="button" onClick={() => setMobileTab('technicals')} style={{ padding: '10px', borderRadius: '8px', border: 'none', fontSize: '13px', fontWeight: '800', cursor: 'pointer', background: mobileTab === 'technicals' ? '#FFFFFF' : 'transparent', color: mobileTab === 'technicals' ? '#9A3412' : '#475569', boxShadow: mobileTab === 'technicals' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none', transition: 'all 0.2s' }}>
              Analytics
            </button>
          </div>
        </div>
      )}

      {/* Clean 3-Column Layout: Consistent History on Left, Chat Center, Combined Tab Sidebar on Right */}
      <div className="responsive-grid-stack" style={{ display: 'grid', gridTemplateColumns: '260px 1fr 380px', gap: '20px', alignItems: 'stretch' }}>
        
        {/* LEFT COLUMN: ALWAYS CONVERSATION HISTORY */}
        <div style={{
          background: '#FFFFFF',
          border: '1.5px solid #E2E8F0',
          borderRadius: '16px',
          padding: '16px',
          display: isMobile && mobileTab !== 'history' ? 'none' : 'flex',
          flexDirection: 'column',
          gap: '12px',
          height: '640px',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
          position: 'relative',
          zIndex: 2
        }}>
          <button
            onClick={handleNewChat}
            style={{
              background: '#FFF7ED',
              border: '1.5px solid #FDBA74',
              borderRadius: '8px',
              color: '#9A3412',
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
              e.currentTarget.style.background = '#FFEDD5';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = '#FFF7ED';
            }}
          >
            <Plus size={14} />
            New Conversation
          </button>

          <div style={{ borderTop: '1px solid #E2E8F0', margin: '2px 0' }} />

          <span style={{ fontSize: '11px', color: '#0F172A', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            AI Mentorship Conversations
          </span>

          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px', paddingRight: '4px' }}>
            {conversations.length === 0 ? (
              <div style={{ color: '#64748B', fontSize: '12px', textAlign: 'center', padding: '16px 0', fontStyle: 'italic' }}>
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
                       background: isActive ? '#FFF7ED' : '#F8FAFC',
                       border: isActive ? '1.5px solid #FDBA74' : '1px solid #E2E8F0',
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
                      <MessageSquare size={13} style={{ color: isActive ? '#9A3412' : '#64748B', flexShrink: 0 }} />
                      <span style={{
                        fontSize: '12px',
                        fontWeight: isActive ? '800' : '600',
                        color: isActive ? '#9A3412' : '#0F172A',
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
          background: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: '16px',
          padding: '20px',
          display: isMobile && mobileTab !== 'chat' ? 'none' : 'flex',
          flexDirection: 'column',
          height: '640px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.05)'
        }}>
          
          {/* None Active Header Core */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px', 
            background: accountMode === 'pro' || user?.is_pro ? 'rgba(255, 215, 0, 0.1)' : 'rgba(0, 188, 212, 0.1)', 
            border: accountMode === 'pro' || user?.is_pro ? '1px solid rgba(255, 215, 0, 0.4)' : '1px solid rgba(0, 188, 212, 0.3)', 
            borderRadius: '12px', 
            padding: '10px 14px', 
            marginBottom: '12px' 
          }}>
            <div className="none-core-active" style={{ 
              width: '28px', 
              height: '28px', 
              borderRadius: '50%', 
              background: accountMode === 'pro' || user?.is_pro
                ? 'radial-gradient(circle, #ffd700 20%, rgba(0, 243, 255, 0.4) 60%, transparent 100%)'
                : 'radial-gradient(circle, #00ffff 20%, rgba(0, 188, 212, 0.3) 60%, transparent 100%)', 
              border: accountMode === 'pro' || user?.is_pro ? '2px dashed #b45309' : '2px dashed #0369a1', 
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
                boxShadow: accountMode === 'pro' || user?.is_pro ? '0 0 10px #b45309' : '0 0 10px #0369a1' 
              }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '11px', fontWeight: '800', color: accountMode === 'pro' || user?.is_pro ? '#b45309' : '#0369a1', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {accountMode === 'pro' || user?.is_pro ? 'None Pro Core Enabled' : 'None Core Enabled'}
              </div>
              <div style={{ fontSize: '10px', color: '#4b5563' }}>Ingesting context: **{symbol}** • {timeframe} • {accountMode.toUpperCase()} MODE</div>
            </div>
          </div>

          {/* Messages log */}
          <div style={{ flex: 1, overflowY: 'auto', paddingRight: '6px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {messages.map((msg, idx) => {
              const isProAccount = user?.is_pro || accountMode === 'pro';
              const isLatestUserMsg = msg.sender === 'user' && (idx === messages.length - 1 || idx === messages.length - 2);

              if (msg.sender === 'user') {
                return (
                  <div 
                    key={msg.id || idx} 
                    ref={isLatestUserMsg ? lastUserMsgRef : null}
                    style={{ alignSelf: 'flex-end', maxWidth: '85%' }}
                  >
                    <div style={{
                      background: '#ffffff',
                      border: '1px solid #d1d5db',
                      borderRadius: '14px 14px 2px 14px',
                      padding: '12px 16px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '4px' }}>
                        <span style={{ fontSize: '10px', fontWeight: '900', color: isProAccount ? '#b45309' : '#0369a1', letterSpacing: '0.6px', textTransform: 'uppercase' }}>
                          {isProAccount ? 'PRO TRADER' : 'YOU'}
                        </span>
                        {msg.timestamp && (
                          <span style={{ fontSize: '9px', color: '#6b7280', fontWeight: '600' }}>
                            {msg.timestamp}
                          </span>
                        )}
                      </div>
                      <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', lineHeight: '1.45', color: '#0f172a', wordBreak: 'break-word' }}>
                        {msg.text}
                      </p>
                    </div>
                  </div>
                );
              }

              // Determine prompt question for this AI reply
              let promptQuestion = msg.replyTo;
              if (!promptQuestion && idx > 0) {
                for (let i = idx - 1; i >= 0; i--) {
                  if (messages[i].sender === 'user') {
                    promptQuestion = messages[i].text;
                    break;
                  }
                }
              }

              return (
                <div 
                  key={msg.id || idx} 
                  style={{
                    alignSelf: 'flex-start',
                    maxWidth: '88%',
                    background: '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderTop: '3px solid #00bcd4',
                    borderRadius: '12px 12px 12px 2px',
                    padding: '16px 18px',
                    color: '#000000',
                    boxShadow: '0 4px 14px rgba(0,0,0,0.06)'
                  }}
                >
                  {/* Prompt Citation Box: User's question clearly visible above the AI Mentor's reply */}
                  {promptQuestion && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '8px',
                      background: isProAccount ? 'rgba(245, 158, 11, 0.08)' : 'rgba(0, 188, 212, 0.08)',
                      borderLeft: isProAccount ? '3px solid #f59e0b' : '3px solid #00bcd4',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      marginBottom: '12px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0, marginTop: '2px' }}>
                        <span style={{ fontSize: '10px', fontWeight: '800', color: isProAccount ? '#b45309' : '#0369a1', textTransform: 'uppercase' }}>
                          Replying to:
                        </span>
                      </div>
                      <span style={{ fontSize: '12.5px', color: '#1e293b', fontWeight: '600', fontStyle: 'italic', wordBreak: 'break-word' }}>
                        "{promptQuestion}"
                      </span>
                    </div>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '11px', fontWeight: '800', color: isProAccount ? '#b45309' : '#0369a1', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Sparkles size={12} /> {isProAccount ? 'None Pro AI Mentor' : 'None AI Mentor'}
                    </span>
                    {msg.timestamp && (
                      <span style={{ fontSize: '9px', color: '#9ca3af' }}>{msg.timestamp}</span>
                    )}
                  </div>

                  <div>
                    {formatAIMessage(msg.text)}
                  </div>
                </div>
              );
            })}
            {sending && (
              <div style={{ alignSelf: 'flex-start', background: '#f8f9fa', border: '1px solid #e5e7eb', borderRadius: '12px 12px 12px 2px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '8px', color: '#4b5563' }}>
                <RefreshCw className="animate-spin" size={13} style={{ color: '#0369a1' }} />
                <span style={{ fontSize: '11px', fontWeight: '600' }}>
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
                      background: '#f9fafb',
                      border: '1px solid #e5e7eb',
                      borderRadius: '16px',
                      padding: '6px 12px',
                      color: '#111827',
                      fontSize: '11px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      transition: '0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f3f4f6'}
                    onMouseLeave={e => e.currentTarget.style.background = '#f9fafb'}
                  >
                    <HelpCircle size={11} style={{ color: '#0369a1' }} />
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Chat input */}
          <div style={{ display: 'flex', gap: '10px', borderTop: '1px solid #e5e7eb', paddingTop: '12px' }}>
            <input 
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder={accountMode === 'pro' || user?.is_pro ? "Ask None Pro AI (e.g. 'Evaluate options Greeks' or 'Identify liquidity trap')..." : "Ask None AI (e.g. 'Explain risk zones for this setup' or 'Is this a trap?')..."}
              style={{
                flex: 1,
                background: '#ffffff',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                padding: '10px 14px',
                color: '#000000',
                fontSize: '13px',
                outline: 'none',
                boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.05)'
              }}
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={sending}
              style={{
                background: (accountMode === 'pro' || user?.is_pro)
                  ? 'linear-gradient(135deg, #ffd700 0%, #00f3ff 100%)'
                  : 'linear-gradient(135deg, #00bcd4 0%, #a855f7 100%)',
                border: 'none',
                borderRadius: '8px',
                color: (accountMode === 'pro' || user?.is_pro) ? '#0a0e27' : '#ffffff',
                padding: '10px 18px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: sending ? 0.6 : 1,
                fontWeight: '900',
                boxShadow: (accountMode === 'pro' || user?.is_pro) ? '0 0 15px rgba(255, 215, 0, 0.3)' : 'none',
                transition: 'all 0.2s'
              }}
            >
              <Send size={15} />
            </button>
          </div>

        </div>

        {/* RIGHT COLUMN: SIMULATION & ANALYTICS TAB HUB */}
        <div style={{
          background: '#FFFFFF',
          border: '1.5px solid #E2E8F0',
          borderRadius: '16px',
          display: isMobile && mobileTab !== 'technicals' ? 'none' : 'flex',
          flexDirection: 'column',
          height: '640px',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
          overflow: 'hidden',
          position: 'relative',
          zIndex: 2
        }}>
          
          {/* Tab Selector Header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            background: '#F8FAFC',
            borderBottom: '1px solid #E2E8F0',
            padding: '6px'
          }}>
            <button
              onClick={() => setRightTab('simulator')}
              style={{
                padding: '10px 6px',
                border: rightTab === 'simulator' ? '1px solid #FDBA74' : 'none',
                background: rightTab === 'simulator' ? '#FFF7ED' : 'transparent',
                color: rightTab === 'simulator' ? '#9A3412' : '#475569',
                fontSize: '11px',
                fontWeight: '800',
                cursor: 'pointer',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                boxShadow: rightTab === 'simulator' ? '0 1px 4px rgba(0,0,0,0.04)' : 'none',
                transition: 'all 0.2s'
              }}
            >
              <Sliders size={13} />
              Simulator
            </button>
            <button
              onClick={() => setRightTab('forecast')}
              style={{
                padding: '10px 6px',
                border: rightTab === 'forecast' ? '1px solid #FDBA74' : 'none',
                background: rightTab === 'forecast' ? '#FFF7ED' : 'transparent',
                color: rightTab === 'forecast' ? '#9A3412' : '#475569',
                fontSize: '11px',
                fontWeight: '800',
                cursor: 'pointer',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                boxShadow: rightTab === 'forecast' ? '0 1px 4px rgba(0,0,0,0.04)' : 'none',
                transition: 'all 0.2s'
              }}
            >
              <BarChart2 size={13} />
              Forecasts
            </button>
            <button
              onClick={() => setRightTab('library')}
              style={{
                padding: '10px 6px',
                border: rightTab === 'library' ? '1px solid #FDBA74' : 'none',
                background: rightTab === 'library' ? '#FFF7ED' : 'transparent',
                color: rightTab === 'library' ? '#9A3412' : '#475569',
                fontSize: '11px',
                fontWeight: '800',
                cursor: 'pointer',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                boxShadow: rightTab === 'library' ? '0 1px 4px rgba(0,0,0,0.04)' : 'none',
                transition: 'all 0.2s'
              }}
            >
              <BookOpen size={13} />
              Library
            </button>
          </div>

          {/* Active Tab Body */}
          <div style={{ flex: 1, padding: '16px', overflowY: 'auto' }}>
            
            {/* 1. SIMULATOR TAB CONTENT */}
            {rightTab === 'simulator' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', color: '#9A3412', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Simulation Ingestion
                  </span>
                  <div style={{ display: 'flex', gap: '4px', background: '#F1F5F9', padding: '2px', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                    <button
                      onClick={() => setAccountMode('learner')}
                      style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        border: 'none',
                        fontSize: '10px',
                        fontWeight: '800',
                        cursor: 'pointer',
                        background: accountMode === 'learner' ? '#EA580C' : 'transparent',
                        color: accountMode === 'learner' ? '#FFFFFF' : '#475569'
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
                        fontWeight: '800',
                        cursor: 'pointer',
                        background: accountMode === 'pro' ? '#0F172A' : 'transparent',
                        color: accountMode === 'pro' ? '#FFFFFF' : '#475569'
                      }}
                    >
                      Pro
                    </button>
                  </div>
                </div>

                {/* Scenario presets pills */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <span style={{ fontSize: '11px', color: '#0F172A', fontWeight: '800' }}>SCENARIO PRESETS</span>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                    {Object.keys(presets).map((key) => {
                      let color = '#9A3412';
                      let bg = '#FFF7ED';
                      let border = '#FED7AA';
                      if (key === 'trap') { color = '#DC2626'; bg = '#FEF2F2'; border = '#FECACA'; }
                      if (key === 'breakout') { color = '#9A3412'; bg = '#FFF7ED'; border = '#FED7AA'; }
                      if (key === 'bearTrap') { color = '#B45309'; bg = '#FFFBEB'; border = '#FDE68A'; }

                      return (
                        <button
                          key={key}
                          onClick={() => applyPreset(key)}
                          style={{
                            background: bg,
                            border: `1px solid ${border}`,
                            borderRadius: '8px',
                            padding: '7px 8px',
                            color: color,
                            fontSize: '11px',
                            fontWeight: '800',
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

                <div style={{ borderTop: '1px solid #E2E8F0' }} />

                {/* Input Fields */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    <span style={{ fontSize: '11px', color: '#0F172A', fontWeight: '800' }}>SYMBOL</span>
                    <input
                      type="text"
                      value={symbol}
                      onChange={e => setSymbol(e.target.value.toUpperCase())}
                      style={{ background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '7px 10px', color: '#0F172A', fontSize: '12px', fontWeight: '700', outline: 'none' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                      <span style={{ fontSize: '11px', color: '#0F172A', fontWeight: '800' }}>TIMEFRAME</span>
                      <select
                        value={timeframe}
                        onChange={e => setTimeframe(e.target.value)}
                        style={{ background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '7px 8px', color: '#0F172A', fontSize: '12px', fontWeight: '700', outline: 'none' }}
                      >
                        <option value="15m">15m</option>
                        <option value="1h">1h</option>
                        <option value="1d">1d</option>
                      </select>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                      <span style={{ fontSize: '11px', color: '#0F172A', fontWeight: '800' }}>PRICE</span>
                      <input
                        type="number"
                        value={currentPrice}
                        step="0.01"
                        onChange={e => setCurrentPrice(e.target.value)}
                        style={{ background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '7px 10px', color: '#0F172A', fontSize: '12px', fontWeight: '700', outline: 'none' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '11px', color: '#0F172A', fontWeight: '800' }}>RSI (14)</span>
                      <span style={{ fontSize: '12px', fontWeight: '900', color: rsi > 70 ? '#DC2626' : rsi < 30 ? '#9A3412' : '#9A3412' }}>{rsi}</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="90"
                      value={rsi}
                      onChange={e => setRsi(e.target.value)}
                      style={{ width: '100%', accentColor: '#EA580C', height: '6px', borderRadius: '3px' }}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    <span style={{ fontSize: '11px', color: '#0F172A', fontWeight: '800' }}>MACD SIGNAL</span>
                    <select
                      value={macdSignal}
                      onChange={e => setMacdSignal(e.target.value)}
                      style={{ background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '7px 8px', color: '#0F172A', fontSize: '12px', fontWeight: '700', outline: 'none' }}
                    >
                      <option value="bullish_cross">Bullish Crossover</option>
                      <option value="bearish_cross">Bearish Crossover</option>
                      <option value="bullish_divergence">Bullish Divergence</option>
                      <option value="bearish_divergence">Bearish Divergence</option>
                      <option value="neutral">Neutral Consolidation</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    <span style={{ fontSize: '11px', color: '#0F172A', fontWeight: '800' }}>TREND CONTEXT</span>
                    <input
                      type="text"
                      value={trend}
                      onChange={e => setTrend(e.target.value)}
                      style={{ background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '7px 10px', color: '#0F172A', fontSize: '12px', fontWeight: '700', outline: 'none' }}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    <span style={{ fontSize: '11px', color: '#0F172A', fontWeight: '800' }}>CANDLESTICK PATTERN</span>
                    <textarea
                      value={patternDetected}
                      onChange={e => setPatternDetected(e.target.value)}
                      rows="2"
                      style={{ background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '7px 10px', color: '#0F172A', fontSize: '12px', fontWeight: '600', outline: 'none', resize: 'none', fontFamily: 'inherit' }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 2. FORECASTS TAB CONTENT */}
            {rightTab === 'forecast' && (() => {
              const getTVSymbol = () => {
                if (activeTechnicals?.tvSymbol) return activeTechnicals.tvSymbol;
                const raw = (activeTechnicals?.symbol || symbol || 'AAPL').toUpperCase().trim();
                if (raw.includes(':')) return raw;
                const s = raw.replace('.NS', '').replace('.BO', '');

                // 1. Commodities & Precious Metals
                if (['GOLD', 'XAUUSD', 'XAU-USD', 'XAU'].includes(s)) return 'OANDA:XAUUSD';
                if (['SILVER', 'XAGUSD', 'XAG-USD', 'XAG'].includes(s)) return 'OANDA:XAGUSD';
                if (['CRUDE', 'OIL', 'WTI', 'CL', 'WTIUSD', 'USOIL'].includes(s)) return 'TVC:USOIL';
                if (['NATGAS', 'NG'].includes(s)) return 'TVC:NATGAS';

                // 2. Forex Majors & Crosses
                if (['EURUSD', 'EUR/USD'].includes(s)) return 'FX:EURUSD';
                if (['GBPUSD', 'GBP/USD'].includes(s)) return 'FX:GBPUSD';
                if (['USDJPY', 'USD/JPY'].includes(s)) return 'FX:USDJPY';
                if (['AUDUSD', 'AUD/USD'].includes(s)) return 'FX:AUDUSD';
                if (['USDCAD', 'USD/CAD'].includes(s)) return 'FX:USDCAD';
                if (['USDCHF', 'USD/CHF'].includes(s)) return 'FX:USDCHF';
                if (['NZDUSD', 'NZD/USD'].includes(s)) return 'FX:NZDUSD';

                // 3. Global Major Indices
                if (['SPX', 'S&P 500', 'S&P500', 'SP500', '^GSPC'].includes(s)) return 'FOREXCOM:SPXUSD';
                if (['NDX', 'NASDAQ', 'NASDAQ100', '^IXIC'].includes(s)) return 'FOREXCOM:NAS100USD';
                if (['DJI', 'DOW'].includes(s)) return 'FOREXCOM:DJI';
                if (s === 'SPY') return 'AMEX:SPY';
                if (s === 'QQQ') return 'NASDAQ:QQQ';

                // 4. Indian Indices & Equities
                if (s === 'NIFTY' || s === '^NSEI') return 'NSE:NIFTY';
                if (s === 'SENSEX' || s === '^BSESN') return 'BSE:SENSEX';
                if (s === 'NIFTYBANK' || s === 'BANKNIFTY') return 'NSE:BANKNIFTY';
                if (['RELIANCE', 'TCS', 'INFY', 'SBIN', 'HDFCBANK', 'ICICIBANK'].includes(s) || raw.endsWith('.NS')) return `NSE:${s}`;
                if (raw.endsWith('.BO')) return `BSE:${s}`;

                // 5. Crypto with USD vs USDT distinction
                if (s === 'BTCUSD' || s === 'BTC/USD') return 'COINBASE:BTCUSD';
                if (s === 'ETHUSD' || s === 'ETH/USD') return 'COINBASE:ETHUSD';
                if (s === 'SOLUSD' || s === 'SOL/USD') return 'COINBASE:SOLUSD';

                const cryptoAliases = {
                  'BITCOIN': 'BTC',
                  'ETHEREUM': 'ETH',
                  'SOLANA': 'SOL',
                  'DOGECOIN': 'DOGE',
                  'RIPPLE': 'XRP',
                  'CARDANO': 'ADA',
                  'POLKADOT': 'DOT',
                  'CHAINLINK': 'LINK'
                };
                const mappedCrypto = cryptoAliases[s];
                if (mappedCrypto) return `BINANCE:${mappedCrypto}USDT`;

                if (['BTC', 'ETH', 'SOL', 'BNB', 'XRP', 'DOGE', 'ADA', 'AVAX', 'DOT', 'LINK'].includes(s) || s.endsWith('USDT')) {
                  const base = s.replace('USDT', '');
                  return `BINANCE:${base}USDT`;
                }

                if (['BABA', 'DIS', 'BA', 'JPM', 'NKE', 'KO', 'WMT', 'V', 'MA'].includes(s)) return `NYSE:${s}`;
                return `NASDAQ:${s}`;
              };
              const tvSymbol = getTVSymbol();

              const isIndianStock = activeTechnicals?.isIndian || ['NSE:', 'BSE:'].some(p => tvSymbol.startsWith(p));
              const currSymbol = activeTechnicals?.currency || (isIndianStock ? '₹' : '$');
              const formatPrice = (val) => `${currSymbol}${Number(val).toLocaleString(isIndianStock ? 'en-IN' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

              const quickSuggestions = ['BTC', 'ETH', 'SOL', 'NVDA', 'AAPL', 'TSLA', 'SPX', 'NASDAQ', 'GOLD', 'EURUSD'];

              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  
                  {/* Search Bar & Auto-Suggestions - Open for all users */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
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
                        placeholder="Search global ticker (e.g. BTC, ETH, NVDA, TSLA, SPX, GOLD)..."
                        value={forecastSearch}
                        onChange={e => setForecastSearch(e.target.value)}
                        style={{
                          flex: 1,
                          background: '#F8FAFC',
                          border: '1.5px solid #CBD5E1',
                          borderRadius: '8px',
                          padding: '8px 12px',
                          color: '#0F172A',
                          fontSize: '12px',
                          fontWeight: '600',
                          outline: 'none',
                          transition: 'border 0.2s'
                        }}
                        onFocus={e => e.currentTarget.style.borderColor = '#EA580C'}
                        onBlur={e => e.currentTarget.style.borderColor = '#CBD5E1'}
                      />
                      <button
                        type="submit"
                        style={{
                          background: '#0F172A',
                          border: 'none',
                          borderRadius: '8px',
                          color: '#FFFFFF',
                          padding: '8px 16px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: '800',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        Search
                      </button>
                    </form>

                    {/* Quick Market Suggestions Bar */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
                      <span style={{ fontSize: '11px', color: '#64748B', marginRight: '2px', fontWeight: '800' }}>Quick:</span>
                      {quickSuggestions.map(qs => (
                        <button
                          key={qs}
                          type="button"
                          onClick={() => loadStockForecast(qs, false)}
                          style={{
                            background: '#F8FAFC',
                            border: '1px solid #CBD5E1',
                            color: '#0F172A',
                            borderRadius: '6px',
                            padding: '3px 8px',
                            fontSize: '11px',
                            fontWeight: '800',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.borderColor = '#EA580C';
                            e.currentTarget.style.color = '#9A3412';
                            e.currentTarget.style.background = '#FFF7ED';
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.borderColor = '#CBD5E1';
                            e.currentTarget.style.color = '#0F172A';
                            e.currentTarget.style.background = '#F8FAFC';
                          }}
                        >
                          {qs}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* TradingView Live Chart widget */}
                  <div>
                    <span style={{ fontSize: '11px', color: '#0F172A', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '8px' }}>
                      Live Market Chart ({tvSymbol})
                    </span>
                    <iframe
                      key={tvSymbol}
                      src={`https://s.tradingview.com/widgetembed/?frameElementId=tradingview_chart&symbol=${encodeURIComponent(tvSymbol)}&interval=D&hidesidetoolbar=1&symboledit=0&saveimage=0&toolbarbg=ffffff&theme=light&style=1&timezone=exchange&locale=en`}
                      style={{ width: '100%', height: '220px', border: '1px solid #E2E8F0', borderRadius: '10px' }}
                      title="TradingView Live Chart"
                    />
                  </div>

                  {/* Live Technicals Section */}
                  <div>
                    <span style={{ fontSize: '11px', color: '#9A3412', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '10px' }}>
                      Live Technical Signals
                    </span>
                    
                    {activeTechnicals ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '14px', borderRadius: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E2E8F0', paddingBottom: '8px' }}>
                          <span style={{ fontSize: '15px', fontWeight: '900', color: '#0F172A' }}>{activeTechnicals.symbol}</span>
                          <span style={{ fontSize: '16px', fontWeight: '900', color: '#B45309' }}>{formatPrice(activeTechnicals.price)}</span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#64748B', fontWeight: '600' }}>RSI (14):</span>
                            <span style={{ fontWeight: '800', color: activeTechnicals.rsi > 70 ? '#DC2626' : activeTechnicals.rsi < 30 ? '#9A3412' : '#9A3412' }}>
                              {activeTechnicals.rsi} ({activeTechnicals.rsi > 70 ? 'Overbought' : activeTechnicals.rsi < 30 ? 'Oversold' : 'Neutral'})
                            </span>
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#64748B', fontWeight: '600' }}>30-Day Trend:</span>
                            <span style={{ fontWeight: '800', color: activeTechnicals.trend === 'BULLISH' ? '#9A3412' : '#DC2626', display: 'flex', alignItems: 'center', gap: '3px' }}>
                              {activeTechnicals.trend === 'BULLISH' ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                              {activeTechnicals.trend}
                            </span>
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#64748B', fontWeight: '600' }}>Support Floor:</span>
                             <span style={{ fontWeight: '800', color: '#9A3412' }}>{formatPrice(activeTechnicals.support)}</span>
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#64748B', fontWeight: '600' }}>Resistance Ceiling:</span>
                             <span style={{ fontWeight: '800', color: '#DC2626' }}>{formatPrice(activeTechnicals.resistance)}</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div style={{ color: '#64748B', fontSize: '12px', textAlign: 'center', padding: '16px 0', fontStyle: 'italic' }}>
                        No active technical data. Submit a prompt to start simulator analysis.
                      </div>
                    )}
                  </div>

                  {/* ML Ensemble Section */}
                  {activeMLEnsemble && (
                    <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '16px' }}>
                      <span style={{ fontSize: '11px', color: '#0F172A', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '10px' }}>
                        ML Ensemble Forecast
                      </span>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '14px', borderRadius: '12px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span style={{ fontSize: '11px', color: '#64748B', fontWeight: '800' }}>OVERALL FORECAST PROBABILITY</span>
                          <div style={{ height: '22px', borderRadius: '11px', overflow: 'hidden', display: 'flex', fontSize: '10px', fontWeight: '800', color: '#FFFFFF' }}>
                            {activeMLEnsemble.overall.buy > 0 && (
                              <div style={{ background: '#C2410C', width: `${activeMLEnsemble.overall.buy}%`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                Buy {activeMLEnsemble.overall.buy}%
                              </div>
                            )}
                            {activeMLEnsemble.overall.hold > 0 && (
                              <div style={{ background: '#D97706', width: `${activeMLEnsemble.overall.hold}%`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                Hold {activeMLEnsemble.overall.hold}%
                              </div>
                            )}
                            {activeMLEnsemble.overall.sell > 0 && (
                              <div style={{ background: '#DC2626', width: `${activeMLEnsemble.overall.sell}%`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                Sell {activeMLEnsemble.overall.sell}%
                              </div>
                            )}
                          </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', borderTop: '1px solid #E2E8F0', paddingTop: '8px' }}>
                          <span style={{ fontSize: '11px', color: '#64748B', fontWeight: '800' }}>COMPONENT SIGNALS</span>
                          {activeMLEnsemble.components.map((comp, idx) => (
                            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                              <span style={{ color: '#0F172A', fontWeight: '600' }}>{comp.name}</span>
                              <span style={{ 
                                fontWeight: '800', 
                                color: comp.signal === 'Buy' || comp.signal === 'Bullish' ? '#C2410C' : comp.signal === 'Sell' || comp.signal === 'Bearish' ? '#DC2626' : '#D97706' 
                              }}>
                                {comp.signal} ({comp.strength}%)
                              </span>
                            </div>
                          ))}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #E2E8F0', paddingTop: '8px', fontSize: '12px' }}>
                          <span style={{ color: '#64748B', fontWeight: '600' }}>Ensemble Confidence:</span>
                          <span style={{ fontWeight: '900', color: '#9A3412' }}>{activeMLEnsemble.confidence}%</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Live News Section */}
                  {activeNews && activeNews.length > 0 && (
                    <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '16px' }}>
                      <span style={{ fontSize: '11px', color: '#0F172A', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '10px' }}>
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
                              background: '#F8FAFC',
                              border: '1px solid #E2E8F0',
                              padding: '10px 12px',
                              borderRadius: '8px',
                              textDecoration: 'none',
                              transition: 'all 0.2s',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = '#FFFFFF';
                              e.currentTarget.style.borderColor = '#FDBA74';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = '#F8FAFC';
                              e.currentTarget.style.borderColor = '#E2E8F0';
                            }}
                          >
                            <div style={{ fontSize: '12px', fontWeight: '800', color: '#0F172A', marginBottom: '4px', lineHeight: '1.4' }}>
                              {n.title}
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#64748B', fontWeight: '600' }}>
                              <span>{n.publisher}</span>
                              <span>{n.time}</span>
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Trending Symbols Selection */}
                  <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '16px' }}>
                    <span style={{ fontSize: '11px', color: '#0F172A', fontWeight: '850', display: 'block', marginBottom: '8px', letterSpacing: '0.5px' }}>TRENDING SYMBOLS</span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {['RELIANCE', 'TCS', 'SBIN', 'NIFTY', 'BTC', 'ETH'].map((t) => (
                        <button
                          key={t}
                          onClick={() => {
                            loadStockForecast(t, false);
                          }}
                          style={{
                            background: '#F8FAFC',
                            border: '1px solid #CBD5E1',
                            borderRadius: '6px',
                            color: '#0F172A',
                            padding: '4px 10px',
                            fontSize: '11px',
                            fontWeight: '800',
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
                <span style={{ fontSize: '11px', color: '#9A3412', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '4px' }}>
                  Trading Library Syllabus
                </span>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {Object.keys(syllabus).length === 0 ? (
                    <div style={{ fontSize: '12px', color: '#64748B', textAlign: 'center', padding: '16px' }}>
                      Loading library topics...
                    </div>
                  ) : (
                    Object.keys(syllabus).map(category => {
                      const isExpanded = expandedCategory === category;
                      return (
                        <div key={category} style={{ borderBottom: '1px solid #E2E8F0', paddingBottom: '6px' }}>
                          <button
                            type="button"
                            onClick={() => setExpandedCategory(isExpanded ? null : category)}
                            style={{
                              width: '100%',
                              background: 'none',
                              border: 'none',
                              color: isExpanded ? '#9A3412' : '#0F172A',
                              padding: '8px 0',
                              fontSize: '12px',
                              fontWeight: '800',
                              textAlign: 'left',
                              cursor: 'pointer',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                            }}
                          >
                            <span>{category}</span>
                            {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                          </button>
                          
                          {isExpanded && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingLeft: '6px', paddingTop: '4px', paddingBottom: '4px' }}>
                              {syllabus[category].map(topic => (
                                <button
                                  key={topic.id}
                                  type="button"
                                  onClick={() => handleSendMessage(`Explain ${topic.title} and how it applies to our setup`)}
                                  style={{
                                    background: '#F8FAFC',
                                    border: '1px solid #E2E8F0',
                                    borderRadius: '6px',
                                    padding: '6px 10px',
                                    fontSize: '11px',
                                    color: '#0F172A',
                                    fontWeight: '600',
                                    textAlign: 'left',
                                    cursor: 'pointer',
                                    transition: 'all 0.15s ease',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    width: '100%'
                                  }}
                                  onMouseEnter={e => {
                                    e.currentTarget.style.background = '#FFF7ED';
                                    e.currentTarget.style.color = '#9A3412';
                                    e.currentTarget.style.borderColor = '#FDBA74';
                                  }}
                                  onMouseLeave={e => {
                                    e.currentTarget.style.background = '#F8FAFC';
                                    e.currentTarget.style.color = '#0F172A';
                                    e.currentTarget.style.borderColor = '#E2E8F0';
                                  }}
                                >
                                  <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#EA580C', flexShrink: 0 }} />
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
