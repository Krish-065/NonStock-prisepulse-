import { useState, useEffect } from 'react';
import { apiClient } from '../services/api';

export default function News() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await apiClient.get('/market/news');
        setNews(res.data);
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetchNews();
  }, []);

  if (loading) return <div>Loading news...</div>;

  return (
    <div>
      <h1>Market News</h1>
      <div className="news-list" style={{ maxHeight: 'none' }}>
        {news.map((item, i) => (
          <a key={i} href={item.url} target="_blank" rel="noopener noreferrer" className="news-item">
            {item.image && <img src={item.image} alt="" style={{ width: '80px', height: '60px', objectFit: 'cover', borderRadius: '8px' }} />}
            <div><div className="news-time">{item.time} | {item.source}</div><div className="news-title">{item.title}</div></div>
            <span className="news-link">→</span>
          </a>
        ))}
      </div>
    </div>
  );
}