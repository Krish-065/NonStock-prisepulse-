import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import styled from 'styled-components';
import { apiClient } from '../services/api';
import SearchWithSuggestions from '../components/SearchWithSuggestions';
import { 
  Briefcase, ShieldCheck, AlertTriangle, Info, CheckCircle2, 
  Trash2, RefreshCw, LogIn, ExternalLink, HelpCircle, PieChart, TrendingUp 
} from 'lucide-react';
import toast from 'react-hot-toast';

// ─── STYLED COMPONENTS ───
const Container = styled.div`
  padding-bottom: 50px;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
`;

const Title = styled.h1`
  margin: 0;
  font-size: 28px;
  font-weight: 800;
  background: linear-gradient(135deg, #00ff88, #00bcd4);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
`;

const Subtitle = styled.p`
  color: #9b9eac;
  margin: 4px 0 0 0;
  font-size: 14px;
`;

const InfoBox = styled.div`
  background: rgba(0, 188, 212, 0.03);
  border: 1px solid rgba(0, 188, 212, 0.15);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  gap: 12px;
  color: #d1d4dc;
  font-size: 13px;
  line-height: 1.5;
  
  .icon-wrapper {
    color: #00bcd4;
    display: flex;
    align-items: flex-start;
    padding-top: 2px;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.div`
  background: #0a0e27;
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
`;

const StatCard = styled.div`
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: 12px;
  padding: 16px;
  
  .label {
    font-size: 11px;
    color: #9b9eac;
    text-transform: uppercase;
    margin-bottom: 6px;
  }
  
  .value {
    font-size: 20px;
    font-weight: 700;
    color: #ffffff;
  }
`;

const RiskAlertBox = styled.div`
  background: ${props => props.$isHighRisk ? 'rgba(255, 51, 102, 0.04)' : 'rgba(0, 255, 136, 0.04)'};
  border: 1px solid ${props => props.$isHighRisk ? 'rgba(255, 51, 102, 0.2)' : 'rgba(0, 255, 136, 0.2)'};
  border-radius: 12px;
  padding: 16px;
  display: flex;
  gap: 12px;
  font-size: 13px;
  line-height: 1.5;
  
  .icon {
    color: ${props => props.$isHighRisk ? '#ff3366' : '#00ff88'};
    padding-top: 2px;
  }
`;

const ActionButton = styled.button`
  background: linear-gradient(135deg, #00ff88, #00bcd4);
  border: none;
  color: #0a0e27;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 700;
  font-size: 13px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s;
  
  &:hover {
    box-shadow: 0 0 15px rgba(0, 255, 136, 0.4);
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  z-index: 1000;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  backdrop-filter: blur(4px);
  overflow-y: auto;
  padding: 40px 16px;
`;

const ModalContent = styled.div`
  background: #0d1236;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  width: 100%;
  max-width: 480px;
  padding: 24px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin: auto;
  position: relative;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  
  label {
    font-size: 12px;
    color: #9b9eac;
    text-transform: uppercase;
  }
  
  input, select {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 8px;
    padding: 10px 12px;
    color: #ffffff;
    font-size: 14px;
    outline: none;
    
    &:focus {
      border-color: #00ff88;
    }
  }
`;

const HelperBox = styled.div`
  background: rgba(255, 255, 255, 0.015);
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: 8px;
  padding: 12px;
  font-size: 11px;
  color: #9b9eac;
  display: flex;
  gap: 8px;
`;

const TableContainer = styled.div`
  overflow-x: auto;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  background: #0a0e27;
  
  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;
  }
  
  th {
    background: rgba(255, 255, 255, 0.02);
    padding: 12px 14px;
    color: #9b9eac;
    text-align: left;
    text-transform: uppercase;
    font-size: 10px;
    letter-spacing: 0.5px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  }
  
  td {
    padding: 14px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.03);
    color: #e1e3e6;
  }
  
  tr:hover {
    background: rgba(255, 255, 255, 0.01);
  }
`;

const QuadrantBadge = styled.span`
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 700;
  text-transform: uppercase;
  background: ${props => {
    if (props.$quad === 'LEADING') return 'rgba(0, 255, 136, 0.1)';
    if (props.$quad === 'IMPROVING') return 'rgba(0, 188, 212, 0.1)';
    if (props.$quad === 'WEAKENING') return 'rgba(255, 193, 7, 0.1)';
    return 'rgba(255, 51, 102, 0.1)';
  }};
  color: ${props => {
    if (props.$quad === 'LEADING') return '#00ff88';
    if (props.$quad === 'IMPROVING') return '#00bcd4';
    if (props.$quad === 'WEAKENING') return '#ffc107';
    return '#ff3366';
  }};
`;

const SectorBar = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 12px;
  
  .label-row {
    display: flex;
    justify-content: space-between;
    color: #9b9eac;
  }
  
  .track {
    height: 6px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 3px;
    overflow: hidden;
  }
  
  .fill {
    height: 100%;
    width: ${props => props.$pct}%;
    background: ${props => {
      if (props.$quad === 'LEADING') return '#00ff88';
      if (props.$quad === 'IMPROVING') return '#00bcd4';
      if (props.$quad === 'WEAKENING') return '#ffc107';
      return '#ff3366';
    }};
    border-radius: 3px;
  }
`;

// Helper: map symbols to sectors and rotation zone
const getStockMetadata = (sym) => {
  const cleanSymbol = sym.replace('.NS', '').toUpperCase();
  switch (cleanSymbol) {
    case 'RELIANCE':
      return { sector: 'Energy & Utilities', zone: 'LAGGING' };
    case 'TCS':
    case 'INFY':
      return { sector: 'Information Tech', zone: 'LEADING' };
    case 'HDFCBANK':
    case 'SBIN':
      return { sector: 'Banking', zone: 'LAGGING' };
    case 'TATAMOTORS':
      return { sector: 'Auto', zone: 'WEAKENING' };
    default:
      return { sector: 'Other Equity', zone: 'IMPROVING' };
  }
};

export default function Portfolio() {
  const { fetchUser } = useAuth();
  const [portfolioMode, setPortfolioMode] = useState('real'); // 'real' or 'paper'
  const [holdings, setHoldings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalValue, setTotalValue] = useState(0);
  const [totalInvested, setTotalInvested] = useState(0);
  const [totalProfit, setTotalProfit] = useState(0);
  const [connectedBroker, setConnectedBroker] = useState(null);
  
  // Helpers
  const isIndianSymbol = (sym) => {
    if (!sym) return false;
    const s = sym.toUpperCase();
    const isCrypto = s.endsWith('-USD') || s.endsWith('-USDT') || ['BTC', 'ETH', 'SOL', 'XRP', 'DOGE', 'ADA'].includes(s);
    const isForex = s.endsWith('=X') || (s.includes('USD') && s.includes('INR')) || s.includes('EURUSD') || s.includes('GBPUSD');
    const isCommodity = s.endsWith('=F');
    if (isCrypto || isForex || isCommodity) return false;
    return s.endsWith('.NS') || s.endsWith('.BO') || ['RELIANCE', 'TCS', 'INFY', 'HDFCBANK', 'ICICIBANK', 'NIFTY', 'SENSEX', 'BANKNIFTY', 'NSEI', 'BSESN'].includes(s);
  };

  const formatVal = (val, isUsd) => {
    if (isUsd) {
      return `$${parseFloat(val).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    } else {
      return `₹${parseFloat(val).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
    }
  };

  // Paper Trading State
  const [paperData, setPaperData] = useState({ virtualBalance: 50000, totalHoldingsValue: 0, totalPortfolioValue: 50000, holdings: [] });
  const [paperLoading, setPaperLoading] = useState(false);

  // Broker Connect Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const location = useLocation();
  
  useEffect(() => {
    if (location.state?.openConnect) {
      setIsModalOpen(true);
    }
  }, [location]);
  
  const [broker, setBroker] = useState('Angel One');
  const [clientCode, setClientCode] = useState('');
  const [pin, setPin] = useState('');
  const [totp, setTotp] = useState('');
  const [syncing, setSyncing] = useState(false);

  const handleDisconnectBroker = async () => {
    if (!window.confirm('Are you sure you want to disconnect your broker demat? This will clear all synced assets.')) return;
    try {
      await apiClient.post('/portfolio/disconnect-broker');
      toast.success('Successfully disconnected broker demat');
      fetchPortfolio();
      fetchUser();
    } catch (err) {
      toast.error('Failed to disconnect broker');
    }
  };

  const fetchPortfolio = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const res = await apiClient.get('/portfolio');
      const items = res.data.portfolio || [];
      setConnectedBroker(res.data.connectedBroker || null);
      
      const enriched = await Promise.all(items.map(async (item) => {
        const qty = parseFloat(item.quantity) || 0;
        const buyPrice = parseFloat(item.buy_price) || 0;
        try {
          const quote = await apiClient.get(`/market/stock/${item.symbol}`);
          const currentPrice = parseFloat(quote.data.price) || buyPrice;
          const cost = qty * buyPrice;
          const currentVal = qty * currentPrice;
          const pnl = currentVal - cost;
          const meta = getStockMetadata(item.symbol);
          
          return {
            symbol: item.symbol,
            quantity: qty,
            buyPrice: buyPrice,
            currentPrice,
            invested: cost,
            currentValue: currentVal,
            pnl,
            pnlPercent: cost > 0 ? (pnl / cost) * 100 : 0,
            ...meta
          };
        } catch (err) {
          const cost = qty * buyPrice;
          const meta = getStockMetadata(item.symbol);
          return {
            symbol: item.symbol,
            quantity: qty,
            buyPrice: buyPrice,
            currentPrice: buyPrice,
            invested: cost,
            currentValue: cost,
            pnl: 0,
            pnlPercent: 0,
            ...meta
          };
        }
      }));
      
      let value = 0;
      let invested = 0;
      enriched.forEach(item => {
        value += item.currentValue;
        invested += item.invested;
      });
      
      setHoldings(enriched);
      setTotalValue(value);
      setTotalInvested(invested);
      setTotalProfit(value - invested);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPaperPortfolio = async (isSilent = false) => {
    if (!isSilent) setPaperLoading(true);
    try {
      const res = await apiClient.get('/paper/portfolio');
      setPaperData(res.data);
    } catch (err) {
      console.error('Fetch paper portfolio error:', err);
    } finally {
      setPaperLoading(false);
    }
  };

  const addHolding = async (symbol, quantity, buyPrice) => {
    try {
      const cleanSymbol = symbol.endsWith('.NS') ? symbol : `${symbol}.NS`;
      if (portfolioMode === 'real') {
        await apiClient.post('/portfolio', { symbol: cleanSymbol, quantity, buyPrice });
        toast.success(`${symbol} added to portfolio`);
        fetchPortfolio();
      } else {
        await apiClient.post('/paper/trade', { symbol: cleanSymbol, action: 'BUY', quantity, price: buyPrice });
        toast.success(`${symbol} bought virtually in sandbox`);
        fetchPaperPortfolio();
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add stock');
    }
  };

  const removeHolding = async (symbol, qty = null) => {
    if (portfolioMode === 'real') {
      const previousHoldings = [...holdings];
      const previousValue = totalValue;
      const previousInvested = totalInvested;
      const previousProfit = totalProfit;

      const filtered = holdings.filter(h => h.symbol !== symbol);
      setHoldings(filtered);
      
      let newValue = 0;
      let newInvested = 0;
      filtered.forEach(item => {
        newValue += item.currentValue;
        newInvested += item.invested;
      });
      setTotalValue(newValue);
      setTotalInvested(newInvested);
      setTotalProfit(newValue - newInvested);

      try {
        await apiClient.delete(`/portfolio/${symbol}`);
        toast.success('Holding removed');
        fetchPortfolio();
      } catch (err) {
        setHoldings(previousHoldings);
        setTotalValue(previousValue);
        setTotalInvested(previousInvested);
        setTotalProfit(previousProfit);
        toast.error('Failed to remove holding');
      }
    } else {
      try {
        const item = paperData.holdings.find(h => h.symbol === symbol);
        const sellQty = qty || (item ? item.quantity : 1);
        const sellPrice = item ? item.livePrice : 0;
        const cleanSymbol = symbol.endsWith('.NS') ? symbol : `${symbol}.NS`;

        await apiClient.post('/paper/trade', { 
          symbol: cleanSymbol, 
          action: 'SELL', 
          quantity: sellQty, 
          price: sellPrice 
        });
        toast.success(`Sold ${sellQty} shares of ${symbol} in sandbox`);
        fetchPaperPortfolio();
      } catch (err) {
        toast.error(err.response?.data?.error || 'Failed to sell stock virtually');
      }
    }
  };

  const handleResetPaper = async () => {
    if (!window.confirm('Are you sure you want to reset your paper account? This will wipe your virtual portfolio and restore your $50,000 balance.')) return;
    try {
      await apiClient.post('/paper/reset');
      toast.success('Paper account reset successfully');
      fetchPaperPortfolio();
    } catch (err) {
      toast.error('Failed to reset paper account');
    }
  };

  const handleBrokerSync = async (e) => {
    e.preventDefault();
    if (!clientCode || !pin) {
      toast.error('Please enter your Client Code and PIN');
      return;
    }
    setSyncing(true);
    try {
      const res = await apiClient.post('/portfolio/sync-broker', { broker, clientCode, pin, totp });
      toast.success(res.data.message || `Successfully synced portfolio from ${broker}`);
      setIsModalOpen(false);
      setClientCode('');
      setPin('');
      setTotp('');
      fetchPortfolio();
      fetchUser();
    } catch (err) {
      const errMsg = err.response?.data?.error || err.message || 'Broker authorization failed. Try again.';
      toast.error(errMsg);
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    if (portfolioMode === 'real') {
      fetchPortfolio();
    } else {
      fetchPaperPortfolio();
    }
  }, [portfolioMode]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (portfolioMode === 'real') {
        fetchPortfolio(true);
      } else {
        fetchPaperPortfolio(true);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [portfolioMode, holdings, paperData]);

  // Compute active variables based on portfolioMode
  const activeHoldings = (portfolioMode === 'real' ? holdings : paperData.holdings).map(h => {
    const meta = getStockMetadata(h.symbol);
    return {
      ...h,
      currentPrice: h.currentPrice || h.livePrice || h.buyPrice,
      invested: h.invested || (h.quantity * h.buyPrice),
      currentValue: h.currentValue || h.currentValuation || (h.quantity * (h.livePrice || h.buyPrice)),
      ...meta
    };
  });

  const displayInvested = portfolioMode === 'real' 
    ? totalInvested 
    : activeHoldings.reduce((sum, h) => sum + h.invested, 0);

  const displayValue = portfolioMode === 'real'
    ? totalValue
    : activeHoldings.reduce((sum, h) => sum + h.currentValue, 0);

  const displayProfit = portfolioMode === 'real'
    ? totalProfit
    : (displayValue - displayInvested);

  const displayHoldingsCount = portfolioMode === 'real'
    ? holdings.length
    : paperData.holdings.length;

  // Compute sector allocations & quadrant risk
  const getSectorBreakdown = () => {
    if (activeHoldings.length === 0) return { breakdown: [], laggingWeight: 0 };
    const sectors = {};
    let laggingAndWeakeningVal = 0;
    
    activeHoldings.forEach(h => {
      const val = h.currentValue;
      if (!sectors[h.sector]) {
        sectors[h.sector] = { name: h.sector, val: 0, quad: h.zone };
      }
      sectors[h.sector].val += val;
      if (h.zone === 'LAGGING' || h.zone === 'WEAKENING') {
        laggingAndWeakeningVal += val;
      }
    });

    const breakdown = Object.values(sectors).map(s => ({
      ...s,
      pct: parseFloat(((s.val / displayValue) * 100).toFixed(1))
    })).sort((a, b) => b.val - a.val);

    const laggingWeight = displayValue > 0 ? (laggingAndWeakeningVal / displayValue) * 100 : 0;

    return { breakdown, laggingWeight };
  };

  const sectorAnalysis = getSectorBreakdown();

  return (
    <Container>
      <Header>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <Title>Portfolio Analyst & Smart Sync</Title>
          <Subtitle>Connect your demat securely in read-only mode to visualize sector rotation risk in your holdings</Subtitle>
          
          {/* Dual-Mode Toggle Tab */}
          <div style={{ 
            display: 'flex', 
            gap: '8px', 
            background: 'rgba(255, 255, 255, 0.02)', 
            padding: '4px', 
            borderRadius: '10px', 
            border: '1px solid rgba(255, 255, 255, 0.05)', 
            marginTop: '12px',
            alignSelf: 'flex-start' 
          }}>
            <button 
              onClick={() => setPortfolioMode('real')}
              style={{ 
                padding: '8px 16px', 
                background: portfolioMode === 'real' ? 'linear-gradient(135deg, #00ff88 0%, #00bcd4 100%)' : 'transparent', 
                border: 'none', 
                color: portfolioMode === 'real' ? '#0a0e27' : '#ffffff', 
                borderRadius: '8px', 
                fontSize: '12px', 
                fontWeight: '800', 
                cursor: 'pointer', 
                transition: '0.2s' 
              }}
            >
              Broker Portfolio
            </button>
            <button 
              onClick={() => setPortfolioMode('paper')}
              style={{ 
                padding: '8px 16px', 
                background: portfolioMode === 'paper' ? 'linear-gradient(135deg, #00ff88 0%, #00bcd4 100%)' : 'transparent', 
                border: 'none', 
                color: portfolioMode === 'paper' ? '#0a0e27' : '#ffffff', 
                borderRadius: '8px', 
                fontSize: '12px', 
                fontWeight: '800', 
                cursor: 'pointer', 
                transition: '0.2s' 
              }}
            >
              $50k Paper Trading Sandbox
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {portfolioMode === 'real' ? (
            connectedBroker ? (
              <>
                <span style={{ 
                  background: 'rgba(0, 255, 136, 0.1)', 
                  color: '#00ff88', 
                  padding: '8px 12px', 
                  borderRadius: '8px', 
                  fontSize: '13px', 
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  border: '1px solid rgba(0, 255, 136, 0.2)'
                }}>
                  <CheckCircle2 size={14} /> Linked: {connectedBroker}
                </span>
                <button 
                  onClick={handleDisconnectBroker}
                  style={{ 
                    background: 'rgba(255, 51, 102, 0.1)', 
                    border: '1px solid rgba(255, 51, 102, 0.2)', 
                    color: '#ff3366', 
                    padding: '8px 14px', 
                    borderRadius: '8px', 
                    fontSize: '13px', 
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  Disconnect Demat
                </button>
              </>
            ) : (
              <ActionButton onClick={() => setIsModalOpen(true)}>
                <LogIn size={16} /> Sync Broker Demat
              </ActionButton>
            )
          ) : (
            <button
              onClick={handleResetPaper}
              style={{
                background: 'linear-gradient(135deg, #ff4444 0%, #ff1111 100%)',
                border: 'none',
                color: '#ffffff',
                padding: '10px 20px',
                borderRadius: '8px',
                fontWeight: '700',
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(255, 68, 68, 0.3)',
                transition: '0.2s',
              }}
            >
              Reset Sandbox Account
            </button>
          )}
        </div>
      </Header>

      {/* ─── EDUCATIONAL INTRODUCTION NOTE ─── */}
      <InfoBox>
        <div className="icon-wrapper">
          <Info size={18} />
        </div>
        <div>
          {portfolioMode === 'real' ? (
            <strong>How this works:</strong>
          ) : (
            <strong>Paper Trading Sandbox:</strong>
          )}{' '}
          {portfolioMode === 'real' 
            ? 'This is a secure, read-only analytics dashboard. By connecting your broker or manually adding stocks, NonStock scans your assets and maps them to our Institutional Flow Quadrants.'
            : 'Test strategies with $50,000 virtual balance. Safe, interactive paper trading sandbox integrated with real-time sector concentration rotation risk analytics.'}
        </div>
      </InfoBox>

      {/* ─── OVERALL METRICS CARDS ─── */}
      <StatsGrid>
        <StatCard>
          <div className="label">{portfolioMode === 'real' ? 'Invested Cost' : 'Virtual Invested'}</div>
          <div className="value">{formatVal(displayInvested, portfolioMode === 'paper')}</div>
        </StatCard>
        <StatCard>
          <div className="label">{portfolioMode === 'real' ? 'Current Wealth' : 'Account Equity Value'}</div>
          <div className="value" style={{ color: '#00bcd4' }}>{formatVal(displayValue, portfolioMode === 'paper')}</div>
        </StatCard>
        <StatCard>
          <div className="label">{portfolioMode === 'real' ? 'Net Returns (P&L)' : 'Total Simulated P&L'}</div>
          <div className="value" style={{ color: displayProfit >= 0 ? '#00ff88' : '#ff3366' }}>
            {displayProfit >= 0 ? '+' : ''}{formatVal(displayProfit, portfolioMode === 'paper')}
          </div>
        </StatCard>
        <StatCard>
          <div className="label">{portfolioMode === 'real' ? 'Holdings Count' : 'Available Cash Balance'}</div>
          <div className="value" style={{ color: portfolioMode === 'real' ? '#ffffff' : '#00ff88' }}>
            {portfolioMode === 'real' 
              ? `${displayHoldingsCount} Assets` 
              : formatVal(paperData.virtualBalance || 0, true)
            }
          </div>
        </StatCard>
      </StatsGrid>

      <Grid>
        {/* ─── LEFT COLUMN: ACTIVE HOLDINGS TABLE ─── */}
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <h2 style={{ margin: 0, fontSize: '18px', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Briefcase style={{ color: '#00ff88' }} /> {portfolioMode === 'real' ? 'Asset Allocation list' : 'Simulated Sandbox Holdings'}
            </h2>
            <div style={{ width: '280px' }}>
              <SearchWithSuggestions
                placeholder={portfolioMode === 'real' ? "Search & Add Stock Manually..." : "Search & Buy Virtually..."}
                onSelect={async (stock) => {
                  const qty = prompt(`Enter quantity for ${stock.symbol}:`);
                  const price = prompt(`Enter buy price for ${stock.symbol}:`, stock.price || '');
                  if (qty && price) {
                    addHolding(stock.symbol, parseFloat(qty), parseFloat(price));
                  }
                }}
              />
            </div>
          </div>

          {(portfolioMode === 'real' ? loading : paperLoading) ? (
            <div style={{ textAlign: 'center', padding: '30px 0', color: '#9b9eac' }}>
              <RefreshCw style={{ animation: 'spin 1s linear infinite', marginRight: '6px' }} size={16} /> Reading allocations...
            </div>
          ) : activeHoldings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#9b9eac', border: '1px dashed rgba(255,255,255,0.08)', borderRadius: '12px' }}>
              {portfolioMode === 'real' 
                ? 'No holdings found. Click "Sync Broker Demat" at the top to import automatically, or search and add manually.'
                : 'Your virtual portfolio is empty. Search and buy stocks using the box above to start paper trading.'
              }
            </div>
          ) : (
            <TableContainer>
              <table>
                <thead>
                  <tr>
                    <th>Symbol</th>
                    <th>Sector</th>
                    <th>Rotation Zone</th>
                    <th>Qty</th>
                    <th>Avg Price</th>
                    <th>Cost Value</th>
                    <th>Current Value</th>
                    <th>Returns (P&L)</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {activeHoldings.map((h, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: 700, color: '#ffffff' }}>{h.symbol.replace('.NS', '')}</td>
                      <td style={{ color: '#9b9eac', fontSize: '12px' }}>{h.sector}</td>
                      <td>
                        <QuadrantBadge $quad={h.zone}>{h.zone}</QuadrantBadge>
                      </td>
                      <td>{h.quantity}</td>
                      <td>{portfolioMode === 'real' ? `₹${h.buyPrice.toFixed(2)}` : `${isIndianSymbol(h.symbol) ? '₹' : '$'}${parseFloat(h.buyPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}</td>
                      <td>{formatVal(h.invested, portfolioMode === 'paper')}</td>
                      <td>{formatVal(h.currentValue, portfolioMode === 'paper')}</td>
                      <td style={{ color: h.pnl >= 0 ? '#00ff88' : '#ff3366', fontWeight: 600 }}>
                        {h.pnl >= 0 ? '+' : ''}{formatVal(h.pnl, portfolioMode === 'paper')} ({h.pnlPercent.toFixed(1)}%)
                      </td>
                      <td>
                        <button 
                          onClick={() => removeHolding(h.symbol)}
                          style={{ background: 'transparent', border: 'none', color: '#ff3366', cursor: 'pointer' }}
                          title={portfolioMode === 'real' ? 'Remove holding' : 'Sell holding virtually'}
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableContainer>
          )}
        </Card>

        {/* ─── RIGHT COLUMN: RISK & ROTATION REPORT ─── */}
        <Card>
          <h2 style={{ margin: 0, fontSize: '18px', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PieChart style={{ color: '#00bcd4' }} /> Smart Money Exposure
          </h2>

          {activeHoldings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 0', color: '#9b9eac', fontSize: '12px' }}>
              Add assets to check sector concentration.
            </div>
          ) : (
            <>
              {/* Risk Alert Alert */}
              <RiskAlertBox $isHighRisk={sectorAnalysis.laggingWeight > 50}>
                <div className="icon">
                  <AlertTriangle size={18} />
                </div>
                <div>
                  {sectorAnalysis.laggingWeight > 50 ? (
                    <span>
                      <strong>High Sector Risk:</strong> {sectorAnalysis.laggingWeight.toFixed(1)}% of your capital is concentrated in <strong>Lagging / Weakening</strong> sectors. Sector rotation trends indicate institutional volume is rotating away from these assets. Consider diversifying into Leading sectors.
                    </span>
                  ) : (
                    <span>
                      <strong>Healthy Portfolio Balance:</strong> Your allocation is well positioned. Less than 50% of your holdings are in lagging sectors, signaling a strong alignment with current institutional flows.
                    </span>
                  )}
                </div>
              </RiskAlertBox>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h3 style={{ margin: 0, fontSize: '13px', color: '#9b9eac', textTransform: 'uppercase' }}>Sector Concentration</h3>
                {sectorAnalysis.breakdown.map((sec, idx) => (
                  <SectorBar key={idx} $pct={sec.pct} $quad={sec.quad}>
                    <div className="label-row">
                      <span>{sec.name} ({sec.quad})</span>
                      <strong style={{ color: '#ffffff' }}>{sec.pct}%</strong>
                    </div>
                    <div className="track">
                      <div className="fill" />
                    </div>
                  </SectorBar>
                ))}
              </div>
            </>
          )}
        </Card>
      </Grid>

      {/* ─── SECURE BROKER CONNECT MODAL ─── */}
      {isModalOpen && (
        <ModalOverlay onClick={() => setIsModalOpen(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '14px' }}>
              <h2 style={{ margin: 0, fontSize: '18px', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck style={{ color: '#00ff88' }} /> Connect Broker Account
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#9b9eac', fontSize: '18px', cursor: 'pointer' }}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleBrokerSync} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <FormGroup>
                <label>Select Your Stock Broker</label>
                <select value={broker} onChange={(e) => setBroker(e.target.value)}>
                  <option value="Angel One">Angel One (SmartAPI)</option>
                  <option value="Zerodha">Zerodha (Kite Connect)</option>
                  <option value="Groww">Groww App</option>
                  <option value="Upstox">Upstox API</option>
                </select>
              </FormGroup>

              <FormGroup>
                <label>Client Code / ID</label>
                <input 
                  type="text" 
                  placeholder="e.g. ANG12883 (For sandbox, type anything)"
                  value={clientCode}
                  onChange={(e) => setClientCode(e.target.value)}
                  required
                />
              </FormGroup>

              <FormGroup>
                <label>MPIN / Password</label>
                <input 
                  type="password" 
                  placeholder="4 or 6-digit login PIN"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  required
                />
              </FormGroup>

              <FormGroup>
                <label>TOTP Token (Required for Live Accounts)</label>
                <input 
                  type="text" 
                  placeholder="6-digit Google Authenticator code"
                  value={totp}
                  onChange={(e) => setTotp(e.target.value)}
                />
              </FormGroup>

              {/* Padlock explainers */}
              <HelperBox>
                <ShieldCheck size={18} style={{ color: '#00ff88', flexShrink: 0 }} />
                <div>
                  <strong>Read-Only Access Enabled:</strong> NonStock only requests read-only holdings permission. Our servers are physically blocked from placing any trade or requesting funds. Your login credentials are encrypted locally on your browser.
                </div>
              </HelperBox>

              <HelperBox style={{ background: 'rgba(0, 188, 212, 0.05)', borderColor: 'rgba(0, 188, 212, 0.1)' }}>
                <HelpCircle size={18} style={{ color: '#00bcd4', flexShrink: 0 }} />
                <div>
                  <strong>What is TOTP?</strong> Time-Based One-Time Password is a security key generated dynamically by apps like Google Authenticator. It protects your demat from unauthorized logins.
                </div>
              </HelperBox>

              <div style={{ fontSize: '11px', color: '#ffc107', background: 'rgba(255, 193, 7, 0.05)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255, 193, 7, 0.15)' }}>
                ℹ️ <strong>Sandbox Demo Mode:</strong> Enter any Client Code and MPIN to simulate a high-fidelity sync of mock stock assets.
              </div>

              <ActionButton type="submit" disabled={syncing} style={{ width: '100%', justifyContent: 'center', marginTop: '10px' }}>
                {syncing ? 'Establishing Secure Connect...' : 'Verify & Sync Portfolio'}
              </ActionButton>
            </form>
          </ModalContent>
        </ModalOverlay>
      )}
    </Container>
  );
}