import { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { createChart, AreaSeries } from 'lightweight-charts';
import { apiClient } from '../services/api';
import { 
  Search, Calculator, BarChart2, Plus, Trash2, 
  ArrowUpRight, Shield, Award, Layers, TrendingUp,
  Calendar, CheckCircle, Info, Landmark, HelpCircle, ArrowRight,
  TrendingDown, Check, X
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

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1.6fr 1.05fr;
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

const SearchContainer = styled.div`
  position: relative;
  width: 100%;
`;

const SearchInputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const StyledSearchIcon = styled(Search)`
  position: absolute;
  left: 16px;
  color: #9b9eac;
  width: 20px;
  height: 20px;
`;

const SearchInput = styled.input`
  width: 100%;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 14px 16px 14px 48px;
  color: #ffffff;
  font-size: 14px;
  outline: none;
  transition: all 0.3s;
  
  &:focus {
    border-color: #00ff88;
    background: rgba(0, 255, 136, 0.02);
    box-shadow: 0 0 15px rgba(0, 255, 136, 0.1);
  }
`;

const AutocompleteDropdown = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  background: #0d1236;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-top: none;
  border-radius: 0 0 12px 12px;
  z-index: 100;
  max-height: 280px;
  overflow-y: auto;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
`;

const AutocompleteItem = styled.div`
  padding: 12px 16px;
  color: #e1e3e6;
  font-size: 13px;
  cursor: pointer;
  border-bottom: 1px solid rgba(255, 255, 255, 0.03);
  transition: all 0.2s;
  
  &:hover {
    background: rgba(0, 255, 136, 0.1);
    color: #ffffff;
  }
`;

const Tag = styled.span`
  font-size: 11px;
  padding: 3px 8px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.05);
  color: #9b9eac;
  font-weight: 600;
`;

const TimeframeSelector = styled.div`
  display: flex;
  gap: 6px;
  margin-top: 10px;
`;

const TimeframeButton = styled.button`
  background: ${props => props.$active ? 'rgba(0, 255, 136, 0.15)' : 'transparent'};
  border: 1px solid ${props => props.$active ? '#00ff88' : 'rgba(255, 255, 255, 0.05)'};
  color: ${props => props.$active ? '#00ff88' : '#9b9eac'};
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  transition: all 0.2s;
  
  &:hover {
    border-color: #00ff88;
    color: #ffffff;
  }
`;

const ChartContainer = styled.div`
  width: 100%;
  height: 280px;
  background: #0a0e27;
  border-radius: 12px;
  overflow: hidden;
  margin-top: 16px;
`;

// Start SIP / One-time styled elements
const TabHeader = styled.div`
  display: flex;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  margin-bottom: 20px;
`;

const TabButton = styled.button`
  flex: 1;
  background: transparent;
  border: none;
  padding: 12px;
  color: ${props => props.$active ? '#00ff88' : '#9b9eac'};
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  border-bottom: 2px solid ${props => props.$active ? '#00ff88' : 'transparent'};
  transition: all 0.2s;
  text-align: center;
  
  &:hover {
    color: #ffffff;
  }
`;

const AmountInputContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  border: 1.5px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.02);
  margin-bottom: 16px;
  transition: all 0.2s;
  
  &:focus-within {
    border-color: #00ff88;
    background: rgba(0, 255, 136, 0.02);
    box-shadow: 0 0 15px rgba(0, 255, 136, 0.1);
  }
  
  .currency {
    font-size: 24px;
    font-weight: 800;
    color: #ffffff;
    margin-right: 4px;
  }
  
  input {
    background: transparent;
    border: none;
    outline: none;
    color: #ffffff;
    font-size: 24px;
    font-weight: 800;
    width: 100%;
  }
  
  .clear-btn {
    background: transparent;
    border: none;
    color: #9b9eac;
    cursor: pointer;
    display: flex;
    align-items: center;
    padding: 4px;
    border-radius: 50%;
    &:hover {
      background: rgba(255, 255, 255, 0.08);
      color: #ffffff;
    }
  }
`;

const QuickPillGroup = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  flex-wrap: wrap;
`;

const QuickPill = styled.button`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  padding: 6px 14px;
  color: #00ff88;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: rgba(0, 255, 136, 0.15);
    border-color: #00ff88;
  }
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  font-size: 13px;
  
  .label {
    color: #9b9eac;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  
  .value {
    color: #ffffff;
    font-weight: 700;
  }
`;

const ContinueButton = styled.button`
  background: linear-gradient(135deg, #00ff88 0%, #00bcd4 100%);
  border: none;
  color: #0a0e27;
  padding: 16px;
  border-radius: 12px;
  font-weight: 800;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.2s;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-top: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 255, 136, 0.35);
  }
`;

const SimilarFundsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px dashed rgba(255, 255, 255, 0.08);
  padding-top: 18px;
  margin-top: 12px;
`;

const SimilarFundLogo = styled.span`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: ${props => props.$bg || 'rgba(0, 255, 136, 0.1)'};
  color: ${props => props.$color || '#00ff88'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 800;
  border: 1.5px solid rgba(255, 255, 255, 0.1);
  margin-left: -8px;
  &:first-child {
    margin-left: 0;
  }
`;

const DurationGroup = styled.div`
  display: flex;
  background: rgba(255, 255, 255, 0.03);
  padding: 4px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  margin-bottom: 12px;
`;

const DurationButton = styled.button`
  flex: 1;
  background: ${props => props.$active ? 'rgba(0, 255, 136, 0.15)' : 'transparent'};
  border: 1px solid ${props => props.$active ? '#00ff88' : 'transparent'};
  color: ${props => props.$active ? '#00ff88' : '#9b9eac'};
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  font-size: 12px;
  transition: all 0.2s;
`;

const SliderContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 10px;
  
  .header {
    display: flex;
    justify-content: space-between;
    font-size: 13px;
    color: #9b9eac;
    
    span.value {
      color: #00ff88;
      font-weight: 700;
    }
  }
  
  input[type=range] {
    -webkit-appearance: none;
    width: 100%;
    background: rgba(255, 255, 255, 0.1);
    height: 6px;
    border-radius: 3px;
    outline: none;
    
    &::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: #00ff88;
      cursor: pointer;
      box-shadow: 0 0 10px rgba(0, 255, 136, 0.5);
    }
  }
`;

const CompareTableContainer = styled.div`
  overflow-x: auto;
  border-radius: 12px;
  background: #0a0e27;
  border: 1px solid rgba(255, 255, 255, 0.05);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;
    white-space: nowrap;
  }

  th {
    background: rgba(255, 255, 255, 0.03);
    padding: 16px 14px;
    text-align: left;
    color: #9b9eac;
    font-weight: 600;
    border-bottom: 2px solid rgba(0, 255, 136, 0.2);
    text-transform: uppercase;
    font-size: 11px;
    letter-spacing: 0.5px;
  }

  td {
    padding: 14px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.03);
    color: #e1e3e6;
  }

  tr:hover {
    background: rgba(255, 255, 255, 0.02);
  }
`;

const Badge = styled.span`
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 600;
  text-transform: uppercase;
  background: ${props => {
    if (props.$type === 'high') return 'rgba(255, 51, 102, 0.15)';
    if (props.$type === 'low') return 'rgba(0, 255, 136, 0.15)';
    return 'rgba(255, 193, 7, 0.15)';
  }};
  color: ${props => {
    if (props.$type === 'high') return '#ff3366';
    if (props.$type === 'low') return '#00ff88';
    return '#ffc107';
  }};
`;

// Donut Chart Component using inline SVG
const DonutChart = ({ invested, gains }) => {
  const total = invested + gains;
  const investedPct = total > 0 ? (invested / total) * 100 : 100;
  const gainsPct = 100 - investedPct;
  const strokeWidth = 12;
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (gainsPct / 100) * circumference;

  return (
    <div style={{ position: 'relative', width: '110px', height: '110px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width="110" height="110" style={{ transform: 'rotate(-90deg)' }}>
        {/* Invested - bottom layer ring */}
        <circle
          cx="55"
          cy="55"
          r={radius}
          fill="transparent"
          stroke="#00bcd4"
          strokeWidth={strokeWidth}
        />
        {/* Gains - top progress ring */}
        <circle
          cx="55"
          cy="55"
          r={radius}
          fill="transparent"
          stroke="#00ff88"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </svg>
      <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
        <span style={{ fontSize: '10px', color: '#9b9eac', textTransform: 'uppercase' }}>Gains</span>
        <span style={{ fontSize: '14px', color: '#00ff88', fontWeight: '800' }}>{Math.round(gainsPct)}%</span>
      </div>
    </div>
  );
};

export default function MutualFunds() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedFund, setSelectedFund] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Timeframe states
  const [chartTimeframe, setChartTimeframe] = useState('3Y'); // 1M, 3M, 6M, 1Y, 3Y, ALL
  
  // Compare bucket
  const [compareBucket, setCompareBucket] = useState([]);

  // Calculator states (integrated into the details card)
  const [calcMode, setCalcMode] = useState('SIP'); // SIP or Lumpsum
  const [monthlyAmount, setMonthlyAmount] = useState(5000);
  const [expectedReturn, setExpectedReturn] = useState(12);
  const [calcMonths, setCalcMonths] = useState(36); // default 3 years (36 months)
  
  // Right hand Start SIP card states
  const [sipTab, setSipTab] = useState('SIP');
  const [sipAmountInput, setSipAmountInput] = useState('5000');
  const [sipDate, setSipDate] = useState('5'); // 5th of every month
  const [placingOrder, setPlacingOrder] = useState(false);
  
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);

  // Load a default fund on mount
  useEffect(() => {
    // Nippon India Small Cap Fund Direct Growth code = 118778
    fetchFundDetails('118778');
  }, []);

  const handleSearchChange = async (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (val.length >= 3) {
      try {
        const res = await apiClient.get(`/market/mutual-funds/search?query=${val}`);
        setSearchResults(res.data || []);
        setIsDropdownOpen(true);
      } catch (err) {
        console.error('Search failed', err);
      }
    } else {
      setSearchResults([]);
      setIsDropdownOpen(false);
    }
  };

  const fetchFundDetails = async (schemeCode) => {
    setLoading(true);
    setIsDropdownOpen(false);
    try {
      const res = await apiClient.get(`/market/mutual-funds/${schemeCode}`);
      setSelectedFund(res.data);
      // Auto-set the expected return in calculator to match fund's 3Y return if available
      const ret3Y = parseFloat(res.data.returns['3Y']);
      if (!isNaN(ret3Y) && ret3Y > 0) {
        setExpectedReturn(Math.min(30, Math.max(5, Math.round(ret3Y))));
      }
    } catch (err) {
      toast.error('Failed to load fund details');
    } finally {
      setLoading(false);
    }
  };

  // Render TradingView Lightweight Chart
  useEffect(() => {
    if (!chartContainerRef.current || !selectedFund || !selectedFund.chartData || selectedFund.chartData.length === 0) return;
    
    // Clear container
    chartContainerRef.current.innerHTML = '';
    
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { color: '#0a0e27' },
        textColor: '#9b9eac',
        fontFamily: 'Inter, sans-serif',
      },
      grid: {
        vertLines: { color: 'rgba(255, 255, 255, 0.015)' },
        horzLines: { color: 'rgba(255, 255, 255, 0.015)' },
      },
      width: chartContainerRef.current.clientWidth || 500,
      height: 280,
      timeScale: {
        borderVisible: false,
        timeVisible: true,
      },
      rightPriceScale: {
        borderVisible: false,
      },
    });
    chartRef.current = chart;

    const areaSeries = chart.addSeries(AreaSeries, {
      lineColor: '#00ff88',
      topColor: 'rgba(0, 255, 136, 0.2)',
      bottomColor: 'rgba(0, 255, 136, 0.0)',
      lineWidth: 2.5,
    });
    
    // Sort chronological
    let sortedData = [...selectedFund.chartData].sort((a, b) => new Date(a.time) - new Date(b.time));
    
    // Filter based on selected timeframe
    if (chartTimeframe === '1M') {
      sortedData = sortedData.slice(-20);
    } else if (chartTimeframe === '3M') {
      sortedData = sortedData.slice(-60);
    } else if (chartTimeframe === '6M') {
      sortedData = sortedData.slice(-120);
    } else if (chartTimeframe === '1Y') {
      sortedData = sortedData.slice(-252);
    } else if (chartTimeframe === '3Y') {
      sortedData = sortedData.slice(-756);
    } // else ALL keeps all 1500 points
    
    areaSeries.setData(sortedData);
    chart.timeScale().fitContent();

    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [selectedFund, chartTimeframe]);

  // SIP / Lumpsum calculations
  const calculateReturns = () => {
    const P = monthlyAmount;
    const r = expectedReturn / 100;
    const months = calcMonths;
    const t = months / 12;
    
    let totalInvested = 0;
    let totalValue = 0;
    
    if (calcMode === 'SIP') {
      const monthlyRate = r / 12;
      totalInvested = P * months;
      if (monthlyRate === 0) {
        totalValue = totalInvested;
      } else {
        totalValue = P * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);
      }
    } else {
      totalInvested = P;
      totalValue = P * Math.pow(1 + r, t);
    }
    
    const estReturns = Math.max(0, totalValue - totalInvested);
    const investedPct = totalValue > 0 ? (totalInvested / totalValue) * 100 : 100;
    const gainsPct = 100 - investedPct;

    return {
      totalInvested: Math.round(totalInvested),
      estReturns: Math.round(estReturns),
      totalValue: Math.round(totalValue),
      investedPct,
      gainsPct
    };
  };

  const calc = calculateReturns();

  const handleAddToCompare = (fund) => {
    if (compareBucket.find(f => f.schemeCode === fund.schemeCode)) {
      toast.error('Fund already in comparison matrix');
      return;
    }
    if (compareBucket.length >= 3) {
      toast.error('You can compare a maximum of 3 funds');
      return;
    }
    setCompareBucket([...compareBucket, fund]);
    toast.success(`${fund.name.substring(0, 20)}... added to compare`);
  };

  const handleRemoveFromCompare = (code) => {
    setCompareBucket(compareBucket.filter(f => f.schemeCode !== code));
  };

  const handleQuickAddSipAmount = (amt) => {
    const current = parseInt(sipAmountInput) || 0;
    setSipAmountInput(String(current + amt));
  };

  const handlePlaceSipOrder = () => {
    const amt = parseFloat(sipAmountInput);
    if (isNaN(amt) || amt <= 0) {
      toast.error('Please enter a valid investment amount');
      return;
    }
    setPlacingOrder(true);
    setTimeout(() => {
      setPlacingOrder(false);
      toast.success(
        sipTab === 'SIP' 
          ? `SIP order of ₹${amt.toLocaleString('en-IN')} successfully scheduled for the ${sipDate}th of every month!`
          : `One-time purchase order of ₹${amt.toLocaleString('en-IN')} successfully executed!`
      );
    }, 1200);
  };

  return (
    <Container>
      <Header>
        <div>
          <Title>Mutual Funds Terminal</Title>
          <Subtitle>Institutional wealth research matrix offering live AMFI prices, multi-timeframe charts, and direct investing simulations</Subtitle>
        </div>
      </Header>

      {/* ─── LIVE AUTOCOMPLETE SEARCH ─── */}
      <SearchContainer>
        <SearchInputWrapper>
          <StyledSearchIcon />
          <SearchInput 
            type="text" 
            placeholder="Search 45,000+ Indian Mutual Fund Schemes (e.g. Parag Parikh, Quant Small, HDFC Balance)..."
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </SearchInputWrapper>
        {isDropdownOpen && searchResults.length > 0 && (
          <AutocompleteDropdown>
            {searchResults.map((result) => (
              <AutocompleteItem 
                key={result.schemeCode}
                onClick={() => fetchFundDetails(result.schemeCode)}
              >
                {result.schemeName}
              </AutocompleteItem>
            ))}
          </AutocompleteDropdown>
        )}
      </SearchContainer>

      <Grid>
        {/* ─── LEFT COLUMN: DETAILS, CHARTS & CALCULATOR ─── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Fund Details Card */}
          <Card>
            {loading ? (
              <div style={{ height: '350px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00ff88' }}>
                <TrendingUp style={{ animation: 'spin 1s linear infinite', marginRight: '8px' }} /> Loading AMFI Fund Parameters...
              </div>
            ) : selectedFund ? (
              <>
                {/* Header Information */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <div>
                      <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
                        <Tag>Direct</Tag>
                        <Tag>Growth</Tag>
                        <Tag>{selectedFund.type || 'Open Ended'}</Tag>
                      </div>
                      <h2 style={{ margin: 0, fontSize: '20px', color: '#ffffff', fontWeight: '800' }}>{selectedFund.name}</h2>
                      <span style={{ fontSize: '12px', color: '#00bcd4', background: 'rgba(0, 188, 212, 0.08)', padding: '3px 8px', border: '1px solid rgba(0, 188, 212, 0.15)', borderRadius: '4px', marginTop: '8px', display: 'inline-block' }}>
                        {selectedFund.category}
                      </span>
                    </div>
                    <button 
                      onClick={() => handleAddToCompare(selectedFund)}
                      style={{ background: 'rgba(0, 255, 136, 0.1)', border: '1px solid #00ff88', color: '#00ff88', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <Plus size={14} /> Compare Fund
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginTop: '20px' }}>
                    <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.04)' }}>
                      <div style={{ fontSize: '11px', color: '#9b9eac', textTransform: 'uppercase', marginBottom: '4px' }}>Current NAV</div>
                      <div style={{ fontSize: '16px', fontWeight: '800', color: '#00ff88' }}>₹{selectedFund.nav}</div>
                    </div>
                    <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.04)' }}>
                      <div style={{ fontSize: '11px', color: '#9b9eac', textTransform: 'uppercase', marginBottom: '4px' }}>Simulated AUM</div>
                      <div style={{ fontSize: '16px', fontWeight: '800', color: '#ffffff' }}>₹{selectedFund.aum} Cr</div>
                    </div>
                    <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.04)' }}>
                      <div style={{ fontSize: '11px', color: '#9b9eac', textTransform: 'uppercase', marginBottom: '4px' }}>Risk Rating</div>
                      <div style={{ marginTop: '2px' }}>
                        <Badge $type={selectedFund.risk}>{selectedFund.risk}</Badge>
                      </div>
                    </div>
                    <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.04)' }}>
                      <div style={{ fontSize: '11px', color: '#9b9eac', textTransform: 'uppercase', marginBottom: '4px' }}>AMFI Rank</div>
                      <div style={{ color: '#ffc107', letterSpacing: '1px', fontSize: '12px', fontWeight: '700' }}>
                        {'★'.repeat(selectedFund.rating)}{'☆'.repeat(5 - selectedFund.rating)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3-Year Annualized Return and Chart Section */}
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                        <span style={{ fontSize: '28px', fontWeight: '850', color: '#00ff88' }}>
                          {selectedFund.returns['3Y'] || '0.00%'}
                        </span>
                        <span style={{ fontSize: '12px', color: '#9b9eac', fontWeight: '500' }}>Annual Returns in last 3 years</span>
                      </div>
                      <span style={{ fontSize: '12px', color: '#00ff88', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px', fontWeight: '700' }}>
                        <ArrowUpRight size={14} /> ↑2.30% 1D Returns
                      </span>
                    </div>

                    <TimeframeSelector>
                      {['1M', '3M', '6M', '1Y', '3Y', 'ALL'].map((tf) => (
                        <TimeframeButton 
                          key={tf} 
                          $active={chartTimeframe === tf} 
                          onClick={() => setChartTimeframe(tf)}
                        >
                          {tf}
                        </TimeframeButton>
                      ))}
                    </TimeframeSelector>
                  </div>

                  <ChartContainer ref={chartContainerRef} />
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#9b9eac', marginTop: '12px', background: 'rgba(255,255,255,0.01)', padding: '8px 12px', borderRadius: '6px' }}>
                    <span>NAV on {selectedFund.lastUpdated || 'recent date'}: <strong style={{ color: '#ffffff' }}>₹{selectedFund.nav}</strong></span>
                    <span>Min SIP Amount: <strong style={{ color: '#00ff88' }}>₹100</strong></span>
                  </div>
                </div>

                {/* Similar Funds */}
                <SimilarFundsContainer>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ display: 'flex', marginRight: '6px' }}>
                      <SimilarFundLogo $bg="rgba(0, 188, 212, 0.12)" $color="#00bcd4">NP</SimilarFundLogo>
                      <SimilarFundLogo $bg="rgba(255, 170, 0, 0.12)" $color="#ffaa00">QT</SimilarFundLogo>
                      <SimilarFundLogo $bg="rgba(0, 255, 136, 0.12)" $color="#00ff88">HD</SimilarFundLogo>
                    </div>
                    <span style={{ fontSize: '13px', color: '#ffffff', fontWeight: '600' }}>Similar Funds available</span>
                  </div>
                  <span 
                    style={{ fontSize: '11px', color: '#00ff88', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                    onClick={() => {
                      toast.success('Loading matching sectoral/risk category matrices...');
                      fetchFundDetails('118558'); // Load similar fund (HDFC Small Cap Scheme)
                    }}
                  >
                    EXPLORE NOW <ArrowRight size={12} />
                  </span>
                </SimilarFundsContainer>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '50px 0', color: '#9b9eac' }}>
                Select a fund from the search bar to view interactive data.
              </div>
            )}
          </Card>

          {/* Interactive Returns Calculator Card */}
          {selectedFund && (
            <Card>
              <h2 style={{ margin: 0, fontSize: '18px', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calculator style={{ color: '#00bcd4' }} /> Calculate Your Returns
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px', alignItems: 'center', marginTop: '10px' }}>
                
                {/* Math Results */}
                <div>
                  <span style={{ fontSize: '12px', color: '#9b9eac' }}>Total Value</span>
                  <div style={{ fontSize: '32px', fontWeight: '900', color: '#00ff88', margin: '4px 0 8px 0' }}>
                    ₹{calc.totalValue.toLocaleString('en-IN')}
                  </div>
                  <span style={{ fontSize: '12px', color: '#9b9eac', lineHeight: '1.4', display: 'block' }}>
                    When you invest <strong style={{ color: '#00bcd4' }}>₹{monthlyAmount.toLocaleString('en-IN')}</strong> {calcMode === 'SIP' ? 'monthly' : 'one-time'} over <strong style={{ color: '#ffffff' }}>{calcMonths >= 12 ? `${calcMonths / 12} years` : `${calcMonths} months`}</strong>.
                  </span>

                  <div style={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#9b9eac', cursor: 'pointer' }}>
                      <input 
                        type="radio" 
                        name="calcType" 
                        checked={calcMode === 'SIP'} 
                        onChange={() => setCalcMode('SIP')}
                        style={{ accentColor: '#00ff88' }}
                      />
                      Invest Monthly (SIP)
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#9b9eac', cursor: 'pointer' }}>
                      <input 
                        type="radio" 
                        name="calcType" 
                        checked={calcMode === 'Lumpsum'} 
                        onChange={() => setCalcMode('Lumpsum')}
                        style={{ accentColor: '#00ff88' }}
                      />
                      Invest One-Time
                    </label>
                  </div>
                </div>

                {/* SVG Donut Display */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <DonutChart invested={calc.totalInvested} gains={calc.estReturns} />
                  <div style={{ display: 'flex', gap: '12px', fontSize: '11px', marginTop: '4px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#9b9eac' }}>
                      <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#00bcd4' }} /> Invested
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#9b9eac' }}>
                      <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#00ff88' }} /> Gains
                    </span>
                  </div>
                </div>

              </div>

              {/* Slider Input */}
              <SliderContainer>
                <div className="header">
                  <span>{calcMode === 'SIP' ? 'Monthly Investment' : 'Initial Lumpsum'}</span>
                  <span className="value">₹{monthlyAmount.toLocaleString('en-IN')}</span>
                </div>
                <input 
                  type="range" 
                  min={calcMode === 'SIP' ? 100 : 1000} 
                  max={calcMode === 'SIP' ? 50000 : 500000} 
                  step={calcMode === 'SIP' ? 100 : 1000} 
                  value={monthlyAmount} 
                  onChange={(e) => setMonthlyAmount(Number(e.target.value))} 
                />
              </SliderContainer>

              {/* Duration Buttons */}
              <div style={{ marginTop: '10px' }}>
                <span style={{ fontSize: '12px', color: '#9b9eac', display: 'block', marginBottom: '8px' }}>Select Duration</span>
                <DurationGroup>
                  <DurationButton $active={calcMonths === 3} onClick={() => setCalcMonths(3)}>3 Months</DurationButton>
                  <DurationButton $active={calcMonths === 6} onClick={() => setCalcMonths(6)}>6 Months</DurationButton>
                  <DurationButton $active={calcMonths === 12} onClick={() => setCalcMonths(12)}>1 Year</DurationButton>
                  <DurationButton $active={calcMonths === 36} onClick={() => setCalcMonths(36)}>3 Years</DurationButton>
                  <DurationButton $active={calcMonths === 60} onClick={() => setCalcMonths(60)}>5 Years</DurationButton>
                </DurationGroup>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '12px', color: '#9b9eac' }}>
                <span>Returns Percentage</span>
                <span style={{ color: '#00ff88', fontWeight: '700' }}>
                  {expectedReturn}% p.a (Fund's 3Y CAGR returns)
                </span>
              </div>
            </Card>
          )}

        </div>

        {/* ─── RIGHT COLUMN: START SIP / ONE-TIME ORDER CARD ─── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {selectedFund && (
            <Card>
              <h2 style={{ margin: 0, fontSize: '18px', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Shield style={{ color: '#00ff88' }} /> Start Investment
              </h2>
              
              <TabHeader>
                <TabButton $active={sipTab === 'SIP'} onClick={() => { setSipTab('SIP'); setSipAmountInput('5000'); }}>SIP</TabButton>
                <TabButton $active={sipTab === 'One-Time'} onClick={() => { setSipTab('One-Time'); setSipAmountInput('10000'); }}>One - Time</TabButton>
              </TabHeader>

              {/* Amount input box */}
              <div>
                <span style={{ fontSize: '12px', color: '#9b9eac', display: 'block', marginBottom: '8px' }}>
                  {sipTab === 'SIP' ? 'Monthly SIP Amount' : 'One-Time Investment Amount'}
                </span>
                <AmountInputContainer>
                  <span className="currency">₹</span>
                  <input 
                    type="text" 
                    value={sipAmountInput} 
                    onChange={(e) => {
                      const clean = e.target.value.replace(/[^0-9]/g, '');
                      setSipAmountInput(clean);
                    }}
                  />
                  {sipAmountInput && (
                    <button className="clear-btn" onClick={() => setSipAmountInput('')}>
                      <X size={16} />
                    </button>
                  )}
                </AmountInputContainer>

                {/* Pre-filled pills */}
                <QuickPillGroup>
                  <QuickPill onClick={() => handleQuickAddSipAmount(100)}>+ ₹100</QuickPill>
                  <QuickPill onClick={() => handleQuickAddSipAmount(500)}>+ ₹500</QuickPill>
                  <QuickPill onClick={() => handleQuickAddSipAmount(1000)}>+ ₹1,000</QuickPill>
                  <QuickPill onClick={() => handleQuickAddSipAmount(5000)}>+ ₹5,000</QuickPill>
                </QuickPillGroup>
              </div>

              {/* Calendar date picker (only for SIP) */}
              {sipTab === 'SIP' && (
                <div style={{ marginBottom: '16px' }}>
                  <span style={{ fontSize: '12px', color: '#9b9eac', display: 'block', marginBottom: '8px' }}>Select SIP Installment Date</span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <div style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      color: '#ffffff',
                      fontSize: '13px'
                    }}>
                      <Calendar size={16} style={{ color: '#00ff88' }} />
                      <select 
                        value={sipDate}
                        onChange={(e) => setSipDate(e.target.value)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#ffffff',
                          outline: 'none',
                          width: '100%',
                          fontSize: '13px',
                          cursor: 'pointer',
                          fontWeight: '700'
                        }}
                      >
                        <option value="1" style={{ background: '#0a0e27' }}>1st of every month</option>
                        <option value="5" style={{ background: '#0a0e27' }}>5th of every month</option>
                        <option value="10" style={{ background: '#0a0e27' }}>10th of every month</option>
                        <option value="15" style={{ background: '#0a0e27' }}>15th of every month</option>
                        <option value="20" style={{ background: '#0a0e27' }}>20th of every month</option>
                        <option value="25" style={{ background: '#0a0e27' }}>25th of every month</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Social Proof */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#9b9eac', background: 'rgba(255,255,255,0.01)', padding: '10px', borderRadius: '8px', marginBottom: '8px' }}>
                <CheckCircle size={14} style={{ color: '#00ff88' }} />
                <span>Over 26K+ users have invested in this fund recently.</span>
              </div>

              {/* Registered bank account */}
              <InfoRow style={{ borderBottom: 'none', background: 'rgba(0, 188, 212, 0.03)', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(0, 188, 212, 0.1)' }}>
                <span className="label" style={{ fontSize: '11px', color: '#00bcd4' }}>
                  <Landmark size={14} /> Pay via linked bank:
                </span>
                <span className="value" style={{ fontSize: '11px', color: '#ffffff' }}>
                  HDFC Bank **** 8974
                </span>
              </InfoRow>

              <ContinueButton onClick={handlePlaceSipOrder} disabled={placingOrder}>
                {placingOrder ? 'Validating Mandate...' : 'CONTINUE'}
              </ContinueButton>
            </Card>
          )}

        </div>
      </Grid>

      {/* ─── BOTTOM SECTION: COMPARISON MATRIX ─── */}
      <Card>
        <h2 style={{ margin: 0, fontSize: '18px', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Layers style={{ color: '#00bcd4' }} /> Comparison Matrix
        </h2>
        
        {compareBucket.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px 0', color: '#9b9eac', fontSize: '13px', background: 'rgba(255,255,255,0.01)', borderRadius: '8px', border: '1px dashed rgba(255,255,255,0.1)' }}>
            No funds added to comparison. Click the "Compare" button on any fund above.
          </div>
        ) : (
          <CompareTableContainer>
            <table>
              <thead>
                <tr>
                  <th>Fund Details</th>
                  <th>Risk Profile</th>
                  <th>AMFI Rating</th>
                  <th>NAV (₹)</th>
                  <th>AUM (Cr)</th>
                  <th>1Y Return</th>
                  <th>3Y Return</th>
                  <th>5Y Return</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {compareBucket.map((fund) => (
                  <tr key={fund.schemeCode}>
                    <td>
                      <span style={{ fontWeight: 700, color: '#ffffff', display: 'block' }}>{fund.name}</span>
                      <span style={{ fontSize: '11px', color: '#9b9eac' }}>{fund.category}</span>
                    </td>
                    <td>
                      <Badge $type={fund.risk}>{fund.risk}</Badge>
                    </td>
                    <td style={{ color: '#ffc107', letterSpacing: '2px' }}>
                      {'★'.repeat(fund.rating)}{'☆'.repeat(5 - fund.rating)}
                    </td>
                    <td style={{ fontWeight: 600 }}>₹{fund.nav}</td>
                    <td>₹{fund.aum}</td>
                    <td style={{ color: parseFloat(fund.returns['1Y']) >= 0 ? '#00ff88' : '#ff4444', fontWeight: 600 }}>
                      {fund.returns['1Y']}
                    </td>
                    <td style={{ color: parseFloat(fund.returns['3Y']) >= 0 ? '#00ff88' : '#ff4444', fontWeight: 600 }}>
                      {fund.returns['3Y']}
                    </td>
                    <td style={{ color: parseFloat(fund.returns['5Y']) >= 0 ? '#00ff88' : '#ff4444', fontWeight: 600 }}>
                      {fund.returns['5Y']}
                    </td>
                    <td>
                      <button 
                        onClick={() => handleRemoveFromCompare(fund.schemeCode)}
                        style={{ background: 'transparent', border: 'none', color: '#ff4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <Trash2 size={16} /> Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CompareTableContainer>
        )}
      </Card>
    </Container>
  );
}