export default function CandlestickBg() {
  // 20 candles with pseudo-random positions/colors baked in
  const candles = [
    { x: 4,  bodyY: 18, bodyH: 28, wickY1: 5,  wickY2: 55, green: true  },
    { x: 10, bodyY: 30, bodyH: 18, wickY1: 18, wickY2: 60, green: false },
    { x: 16, bodyY: 10, bodyH: 35, wickY1: 2,  wickY2: 52, green: true  },
    { x: 22, bodyY: 25, bodyH: 22, wickY1: 12, wickY2: 58, green: false },
    { x: 28, bodyY: 15, bodyH: 30, wickY1: 5,  wickY2: 55, green: true  },
    { x: 34, bodyY: 32, bodyH: 16, wickY1: 20, wickY2: 62, green: false },
    { x: 40, bodyY: 8,  bodyH: 38, wickY1: 0,  wickY2: 55, green: true  },
    { x: 46, bodyY: 28, bodyH: 20, wickY1: 15, wickY2: 60, green: false },
    { x: 52, bodyY: 12, bodyH: 32, wickY1: 4,  wickY2: 52, green: true  },
    { x: 58, bodyY: 35, bodyH: 14, wickY1: 22, wickY2: 60, green: false },
    { x: 64, bodyY: 10, bodyH: 36, wickY1: 2,  wickY2: 55, green: true  },
    { x: 70, bodyY: 30, bodyH: 18, wickY1: 18, wickY2: 58, green: false },
    { x: 76, bodyY: 14, bodyH: 28, wickY1: 5,  wickY2: 50, green: true  },
    { x: 82, bodyY: 26, bodyH: 24, wickY1: 14, wickY2: 60, green: false },
    { x: 88, bodyY: 8,  bodyH: 34, wickY1: 0,  wickY2: 52, green: true  },
    { x: 94, bodyY: 32, bodyH: 16, wickY1: 20, wickY2: 58, green: false },
  ];

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
      zIndex: 0, pointerEvents: 'none', overflow: 'hidden',
    }}>
      <svg
        width="100%" height="100%"
        xmlns="http://www.w3.org/2000/svg"
        style={{ opacity: 0.07 }}
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <pattern id="candlePattern" x="0" y="0" width="100" height="70" patternUnits="userSpaceOnUse">
            {candles.map((c, i) => {
              const color = c.green ? '#00ff88' : '#ff4466';
              const cx = c.x + 3;
              return (
                <g key={i}>
                  {/* Wick */}
                  <line x1={cx} y1={c.wickY1} x2={cx} y2={c.wickY2}
                    stroke={color} strokeWidth="1.5" />
                  {/* Body */}
                  <rect x={c.x} y={c.bodyY} width="6" height={c.bodyH}
                    fill={color} rx="1" />
                </g>
              );
            })}
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#candlePattern)" />
      </svg>
    </div>
  );
}
