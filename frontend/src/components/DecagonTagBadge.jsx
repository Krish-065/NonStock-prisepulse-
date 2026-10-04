import React from 'react';
import TradingBadgeIcon from './TradingBadgeIcon';

/**
 * DecagonTagBadge — Proper High-Profile Tier Tag Badge
 * Renders verified high-profile badges in their signature tag color:
 * - Contender: Slate Obsidian & Electric Emerald (#00D26A)
 * - Silver Prover: Polished Platinum Silver (#CBD5E1 / #94A3B8)
 * - Gold Sovereign: 24K Radiant Imperial Gold (#F59E0B / #FDE047)
 * - Master Titan: Fiery Ruby Crimson (#E11D48 / #BE123C)
 * - Apex Operator: Royal Cyber Amethyst Purple (#A855F7 / #7E22CE)
 */

export const TIER_CONFIG = {
  'Contender': {
    name: 'Contender',
    theme: 'decagon_contender',
    color: '#00D26A',
    textColor: '#006C2E',
    bgColor: '#F0FDF4',
    borderColor: '#86EFAC',
    boxShadow: '0 2px 10px rgba(0, 210, 106, 0.25)',
    targetText: '$1,000 Baseline'
  },
  'Silver Prover': {
    name: 'Silver Prover',
    theme: 'decagon_silver',
    color: '#64748B',
    textColor: '#334155',
    bgColor: '#F8FAFC',
    borderColor: '#CBD5E1',
    boxShadow: '0 2px 10px rgba(100, 116, 139, 0.2)',
    targetText: '$2,000+ Verified'
  },
  'Gold Sovereign': {
    name: 'Gold Sovereign',
    theme: 'decagon_gold',
    color: '#D97706',
    textColor: '#78350F',
    bgColor: '#FEFCE8',
    borderColor: '#FDE047',
    boxShadow: '0 3px 14px rgba(245, 158, 11, 0.3)',
    targetText: '$4,000+ Sovereign'
  },
  'Master Titan': {
    name: 'Master Titan',
    theme: 'decagon_titan',
    color: '#E11D48',
    textColor: '#881337',
    bgColor: '#FFF1F2',
    borderColor: '#FDA4AF',
    boxShadow: '0 3px 14px rgba(225, 29, 72, 0.3)',
    targetText: '$8,000+ Titan'
  },
  'Apex Operator': {
    name: 'Apex Operator',
    theme: 'decagon_apex',
    color: '#A855F7',
    textColor: '#581C87',
    bgColor: '#FAF5FF',
    borderColor: '#D8B4FE',
    boxShadow: '0 4px 18px rgba(168, 85, 247, 0.35)',
    targetText: '$15,000+ Apex'
  }
};

export default function DecagonTagBadge({
  tier = 'Contender',
  size = 'md', // 'sm' | 'md' | 'lg'
  showIcon = true,
  className = '',
  style = {}
}) {
  const normKey = Object.keys(TIER_CONFIG).find(
    k => k.toLowerCase() === (tier || '').toLowerCase()
  ) || 'Contender';

  const cfg = TIER_CONFIG[normKey];

  const sizeMap = {
    sm: { iconSize: 18, fontSize: '10px', padding: '3px 8px', gap: '5px' },
    md: { iconSize: 22, fontSize: '11px', padding: '4px 12px', gap: '7px' },
    lg: { iconSize: 28, fontSize: '13px', padding: '7px 16px', gap: '9px' }
  };

  const sz = sizeMap[size] || sizeMap.md;

  return (
    <div
      className={`decagon-tag-badge ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: sz.gap,
        padding: sz.padding,
        background: cfg.bgColor,
        border: `1.5px solid ${cfg.borderColor}`,
        borderRadius: '999px',
        color: cfg.textColor,
        fontSize: sz.fontSize,
        fontWeight: 900,
        letterSpacing: '0.6px',
        textTransform: 'uppercase',
        boxShadow: cfg.boxShadow,
        whiteSpace: 'nowrap',
        ...style
      }}
      title={`Decagon Tier: ${cfg.name} (${cfg.targetText})`}
    >
      {showIcon && (
        <TradingBadgeIcon
          theme={cfg.theme}
          size={sz.iconSize}
          unlocked={true}
        />
      )}
      <span>{cfg.name}</span>
    </div>
  );
}
