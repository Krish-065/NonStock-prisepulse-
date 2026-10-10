import React from 'react';
import TradingBadgeIcon from './TradingBadgeIcon';

/**
 * DecagonTagBadge — Proper High-Profile Tier Tag Badge
 * Renders verified high-profile badges in their signature tag color:
 * - Contender: Slate Obsidian & Electric Emerald (#EA580C)
 * - Silver Prover: Polished Platinum Silver (#CBD5E1 / #94A3B8)
 * - Gold Sovereign: 24K Radiant Imperial Gold (#F59E0B / #FDE047)
 * - Master Titan: Fiery Ruby Crimson (#E11D48 / #BE123C)
 * - Apex Operator: Royal Cyber Amethyst Purple (#A855F7 / #7E22CE)
 */

export const TIER_CONFIG = {
  'Contender': {
    name: 'Contender',
    theme: 'decagon_contender',
    color: '#EA580C',
    textColor: '#EA580C',
    bgColor: '#FFFFFF',
    borderColor: '#EA580C',
    boxShadow: '0 4px 14px rgba(234, 88, 12, 0.35)',
    targetText: '$1,000 Baseline'
  },
  'Silver Prover': {
    name: 'Silver Prover',
    theme: 'decagon_silver',
    color: '#64748B',
    textColor: '#334155',
    bgColor: '#F8FAFC',
    borderColor: '#94A3B8',
    boxShadow: '0 4px 16px rgba(148, 163, 184, 0.4), 0 0 10px rgba(255, 255, 255, 0.8)',
    targetText: '$2,000+ Verified'
  },
  'Gold Sovereign': {
    name: 'Gold Sovereign',
    theme: 'decagon_gold',
    color: '#EAB308',
    textColor: '#854D0E',
    bgColor: '#FEFCE8',
    borderColor: '#EAB308',
    boxShadow: '0 4px 18px rgba(234, 179, 8, 0.45), 0 0 14px rgba(250, 204, 21, 0.4)',
    targetText: '$4,000+ Sovereign'
  },
  'Master Titan': {
    name: 'Master Titan',
    theme: 'decagon_titan',
    color: '#EF4444',
    textColor: '#DC2626',
    bgColor: '#FEF2F2',
    borderColor: '#EF4444',
    boxShadow: '0 4px 20px rgba(239, 68, 68, 0.5), 0 0 14px rgba(220, 38, 38, 0.4)',
    targetText: '$8,000+ Titan'
  },
  'Apex Operator': {
    name: 'Apex Operator',
    theme: 'decagon_apex',
    color: '#A855F7',
    textColor: '#7E22CE',
    bgColor: '#FAF5FF',
    borderColor: '#A855F7',
    boxShadow: '0 4px 24px rgba(168, 85, 247, 0.55), 0 0 18px rgba(147, 51, 234, 0.45)',
    targetText: '$15,000+ Apex Predator'
  }
};

export default function DecagonTagBadge({
  tier = 'Contender',
  size = 'md', // 'sm' | 'md' | 'lg' | 'hero'
  showIcon = true,
  className = '',
  style = {}
}) {
  const normKey = Object.keys(TIER_CONFIG).find(
    k => k.toLowerCase() === (tier || '').toLowerCase()
  ) || 'Contender';

  const cfg = TIER_CONFIG[normKey];

  const sizeMap = {
    sm: { iconSize: 24, fontSize: '12px', padding: '4px 10px', gap: '6px' },
    md: { iconSize: 32, fontSize: '13px', padding: '6px 14px', gap: '8px' },
    lg: { iconSize: 44, fontSize: '15px', padding: '8px 20px', gap: '10px' },
    hero: { iconSize: 64, fontSize: '17px', padding: '12px 26px', gap: '14px' }
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
