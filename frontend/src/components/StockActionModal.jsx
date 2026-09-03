import React from 'react';
import styled, { keyframes } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { LineChart, Activity, X, Crown } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const fadeIn = keyframes`
  from { opacity: 0; transform: scale(0.95) translateY(10px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
`;

const Overlay = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(10, 14, 39, 0.7);
  backdrop-filter: blur(8px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justifyContent: center;
`;

const ModalContent = styled.div`
  background: ${props => props.isLight ? '#ffffff' : '#121629'};
  border: 1px solid ${props => props.isLight ? '#e5e7eb' : 'rgba(0,255,136,0.2)'};
  border-radius: 16px;
  padding: 32px;
  width: 90%;
  max-width: 450px;
  box-shadow: 0 24px 60px rgba(0,0,0,0.4);
  animation: ${fadeIn} 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
`;

const CloseBtn = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  background: transparent;
  border: none;
  color: ${props => props.isLight ? '#6b7280' : '#94a3b8'};
  cursor: pointer;
  padding: 4px;
  border-radius: 50%;
  &:hover {
    background: ${props => props.isLight ? '#f3f4f6' : 'rgba(255,255,255,0.1)'};
  }
`;

const Title = styled.h2`
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 800;
  color: ${props => props.isLight ? '#111827' : '#ffffff'};
  text-align: center;
`;

const Sub = styled.p`
  margin: 0 0 24px 0;
  color: ${props => props.isLight ? '#4b5563' : '#94a3b8'};
  text-align: center;
  font-size: 14px;
`;

const ActionGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const ActionBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  border-radius: 12px;
  border: 1px solid ${props => props.isLight ? '#e5e7eb' : 'rgba(255,255,255,0.1)'};
  background: ${props => props.isLight ? '#f8fafc' : 'rgba(255,255,255,0.02)'};
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;

  &:hover {
    border-color: ${props => props.color};
    background: ${props => props.isLight ? 'rgba(0,176,96,0.05)' : 'rgba(0,176,96,0.1)'};
    transform: translateY(-2px);
  }
`;

const IconWrap = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 10px;
  background: ${props => props.bg};
  color: ${props => props.color};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const TextWrap = styled.div`
  display: flex;
  flex-direction: column;
`;

const BtnTitle = styled.span`
  font-size: 16px;
  font-weight: 700;
  color: ${props => props.isLight ? '#111827' : '#ffffff'};
`;

const BtnDesc = styled.span`
  font-size: 12px;
  color: ${props => props.isLight ? '#6b7280' : '#94a3b8'};
`;

export default function StockActionModal({ symbol, onClose }) {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const isLight = theme === 'light';

  // Normalize symbol for routing
  const normalizedSym = symbol.replace(/ /g, '').replace(/\//g, '');
  let routeSym = normalizedSym;
  if (normalizedSym === 'NIFTY50') routeSym = '^NSEI';
  if (normalizedSym === 'BANKNIFTY') routeSym = '^NSEBANK';
  if (normalizedSym === 'SENSEX') routeSym = '^BSESN';
  if (symbol === 'XAU/USD') routeSym = 'GC=F';
  if (symbol === 'BTC/USD') routeSym = 'BTC-USD';
  if (symbol === 'GBP/USD') routeSym = 'GBPUSD=X';
  if (symbol === 'EUR/USD') routeSym = 'EURUSD=X';
  if (symbol === 'S&P 500') routeSym = '^GSPC';
  if (symbol === 'DOW JONES') routeSym = '^DJI';
  if (symbol === 'NASDAQ') routeSym = '^IXIC';
  if (symbol === 'CRUDE OIL') routeSym = 'CL=F';

  return (
    <Overlay onClick={onClose} style={{ justifyContent: 'center' }}>
      <ModalContent isLight={isLight} onClick={e => e.stopPropagation()}>
        <CloseBtn isLight={isLight} onClick={onClose}><X size={20} /></CloseBtn>
        <Title isLight={isLight}>{symbol}</Title>
        <Sub isLight={isLight}>Select destination for analysis</Sub>
        
        <ActionGrid>
          <ActionBtn 
            isLight={isLight} 
            color="#00b060"
            onClick={() => {
              navigate('/markets', { state: { selectSymbol: routeSym } });
              onClose();
            }}
          >
            <IconWrap bg="rgba(0,176,96,0.15)" color="#00b060">
              <LineChart size={24} />
            </IconWrap>
            <TextWrap>
              <BtnTitle isLight={isLight}>Live Market Chart</BtnTitle>
              <BtnDesc isLight={isLight}>View advanced technical analysis & options</BtnDesc>
            </TextWrap>
          </ActionBtn>

          <ActionBtn 
            isLight={isLight} 
            color="#3b82f6"
            onClick={() => {
              navigate('/paper-trading', { state: { selectSymbol: routeSym } });
              onClose();
            }}
          >
            <IconWrap bg="rgba(59,130,246,0.15)" color="#3b82f6">
              <Activity size={24} />
            </IconWrap>
            <TextWrap>
              <BtnTitle isLight={isLight}>Paper Trading Desk</BtnTitle>
              <BtnDesc isLight={isLight}>Execute risk-free simulated trades</BtnDesc>
            </TextWrap>
          </ActionBtn>

          <ActionBtn 
            isLight={isLight} 
            color="#ffb300"
            onClick={() => {
              navigate(`/pro-analytics/${routeSym}`);
              onClose();
            }}
          >
            <IconWrap bg="rgba(255,179,0,0.15)" color="#ffb300">
              <Crown size={24} />
            </IconWrap>
            <TextWrap>
              <BtnTitle isLight={isLight} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                Strategy Lab
                <span style={{ fontSize: '10px', background: '#ffb300', color: '#000', padding: '2px 6px', borderRadius: '4px', fontWeight: '800' }}>PRO</span>
              </BtnTitle>
              <BtnDesc isLight={isLight}>Algorithmic backtesting & trade automation</BtnDesc>
            </TextWrap>
          </ActionBtn>
        </ActionGrid>
      </ModalContent>
    </Overlay>
  );
}
