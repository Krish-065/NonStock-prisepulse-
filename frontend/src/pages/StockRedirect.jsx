import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function StockRedirect() {
  const { symbol } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    // Gracefully redirect legacy /stock/:symbol routes to the Market page
    if (symbol) {
      navigate('/markets', { state: { selectSymbol: symbol }, replace: true });
    }
  }, [symbol, navigate]);

  return null;
}
