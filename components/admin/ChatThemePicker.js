import { useState } from 'react';

export const CHAT_THEMES = {
  elegant: {
    name: 'Elegant',
    fontUrl: 'https://fonts.googleapis.com/css2?family=Cormorant:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Outfit:wght@300;400;500&display=swap',
    fontDisplay: "'Cormorant', serif",
    fontBody: "'Outfit', sans-serif",
    vars: {
      bg: '#f5f0e8', surface: '#fdfaf5',
      ink: '#1a1510', ink2: '#2e2820', ink3: '#5c5448',
      muted: '#9e978c', gold: '#a8864a', goldLt: '#c9a96e',
      line: 'rgba(26,21,16,0.09)', r: '10px',
    },
  },
  modern: {
    name: 'Modern',
    fontUrl: 'https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700&family=DM+Sans:wght@300;400;500&display=swap',
    fontDisplay: "'Syne', sans-serif",
    fontBody: "'DM Sans', sans-serif",
    vars: {
      bg: '#0d0d0d', surface: '#181818',
      ink: '#f0f0f0', ink2: '#e0e0e0', ink3: '#a0a0a0',
      muted: '#585858', gold: '#e8e8e8', goldLt: '#c0c0c0',
      line: 'rgba(255,255,255,0.07)', r: '3px',
    },
  },
  warm: {
    name: 'Warm',
    fontUrl: 'https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;1,400&family=Nunito:wght@300;400;500&display=swap',
    fontDisplay: "'Lora', serif",
    fontBody: "'Nunito', sans-serif",
    vars: {
      bg: '#fdf5ec', surface: '#fff9f4',
      ink: '#3a1a08', ink2: '#5c2e12', ink3: '#8b5a35',
      muted: '#b88f6a', gold: '#c05c1a', goldLt: '#d47840',
      line: 'rgba(58,26,8,0.08)', r: '18px',
    },
  },
  fresh: {
    name: 'Fresh',
    fontUrl: 'https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Outfit:wght@300;400;500&display=swap',
    fontDisplay: "'DM Serif Display', serif",
    fontBody: "'Outfit', sans-serif",
    vars: {
      bg: '#eef6f1', surface: '#f8fcf9',
      ink: '#0c2a1c', ink2: '#1a4a2e', ink3: '#3d7a55',
      muted: '#7aaa8a', gold: '#2a7a52', goldLt: '#4a9a72',
      line: 'rgba(12,42,28,0.07)', r: '14px',
    },
  },
};

function MiniCard({ themeKey, theme, isSelected, onSelect }) {
  const [hovered, setHovered] = useState(false);
  const v = theme.vars;

  return (
    <div
      onClick={() => onSelect(themeKey)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: 186,
        height: 256,
        borderRadius: 10,
        overflow: 'hidden',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        background: v.bg,
        outline: isSelected ? `2.5px solid ${v.gold}` : '2.5px solid transparent',
        outlineOffset: 3,
        transform: isSelected ? 'scale(1.025)' : hovered ? 'scale(1.01)' : 'scale(1)',
        transition: 'transform 0.18s ease, outline-color 0.18s ease, box-shadow 0.18s ease',
        boxShadow: isSelected
          ? `0 8px 28px ${v.gold}40, 0 2px 8px rgba(0,0,0,0.1)`
          : hovered ? '0 4px 18px rgba(0,0,0,0.13)' : '0 2px 8px rgba(0,0,0,0.07)',
        fontFamily: theme.fontBody,
        position: 'relative',
        userSelect: 'none',
      }}
    >
      {/* Header */}
      <div style={{
        background: v.bg,
        padding: '8px 10px 7px',
        display: 'flex',
        alignItems: 'center',
        gap: 7,
        borderBottom: `1px solid ${v.gold}22`,
        flexShrink: 0,
      }}>
        <div style={{
          width: 22, height: 22,
          border: `1px solid ${v.gold}55`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
          borderRadius: v.r === '3px' ? 2 : 4,
          background: `${v.gold}10`,
        }}>
          <span style={{ fontFamily: theme.fontDisplay, fontSize: 10, color: v.gold, fontStyle: 'italic', lineHeight: 1 }}>MR</span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 8.5, fontFamily: theme.fontDisplay, color: v.ink, letterSpacing: '0.04em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Mein Restaurant</div>
          <div style={{ fontSize: 7, color: v.muted, letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 1 }}>Ihr Chatbot</div>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 3,
          padding: '2px 5px',
          borderRadius: 999,
          border: `1px solid ${v.gold}30`,
        }}>
          <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#6db57e' }} />
          <span style={{ fontSize: 6.5, color: v.muted, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Online</span>
        </div>
      </div>

      {/* Chat */}
      <div style={{ flex: 1, padding: '8px 9px 5px', display: 'flex', flexDirection: 'column', gap: 5, overflow: 'hidden', background: v.bg }}>
        <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
          <div style={{
            background: v.surface,
            border: `1px solid ${v.line}`,
            borderRadius: `2px ${v.r} ${v.r} ${v.r}`,
            padding: '5px 8px',
            fontSize: 8,
            color: v.ink2,
            lineHeight: 1.5,
            maxWidth: '84%',
            fontFamily: theme.fontBody,
            fontWeight: 300,
          }}>
            Willkommen! Wann darf ich einen Tisch reservieren?
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{
            background: v.ink2,
            color: v.bg,
            borderRadius: `${v.r} 2px ${v.r} ${v.r}`,
            padding: '5px 8px',
            fontSize: 8,
            maxWidth: '68%',
            fontFamily: theme.fontBody,
            fontWeight: 400,
          }}>
            Samstag, 2 Personen
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
          <div style={{
            background: v.surface,
            border: `1px solid ${v.line}`,
            borderRadius: `2px ${v.r} ${v.r} ${v.r}`,
            padding: '5px 8px',
            fontSize: 8,
            color: v.ink2,
            lineHeight: 1.5,
            maxWidth: '72%',
            fontFamily: theme.fontBody,
            fontWeight: 300,
          }}>
            Perfekt! Um welche Uhrzeit?
          </div>
        </div>
      </div>

      {/* Input */}
      <div style={{
        padding: '6px 9px',
        background: v.bg,
        borderTop: `1px solid ${v.gold}22`,
        display: 'flex',
        gap: 5,
        alignItems: 'center',
        flexShrink: 0,
      }}>
        <div style={{
          flex: 1,
          background: v.surface,
          border: `1px solid ${v.gold}33`,
          borderRadius: v.r,
          padding: '4px 8px',
          fontSize: 8,
          color: v.muted,
          fontFamily: theme.fontBody,
          fontStyle: 'italic',
        }}>
          Ihre Frage…
        </div>
        <div style={{
          width: 20, height: 20,
          borderRadius: v.r === '3px' ? 3 : 6,
          border: `1px solid ${v.gold}44`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <svg width="8" height="8" viewBox="0 0 24 24" fill={v.muted}>
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
          </svg>
        </div>
      </div>

      {/* Selected badge */}
      {isSelected && (
        <div style={{
          position: 'absolute',
          top: 0, left: '50%',
          transform: 'translateX(-50%)',
          background: v.gold,
          color: themeKey === 'modern' ? '#0d0d0d' : v.bg,
          fontSize: 7.5,
          fontWeight: 600,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          padding: '2px 9px',
          borderRadius: '0 0 7px 7px',
          fontFamily: theme.fontBody,
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
        }}>
          ✓ {theme.name}
        </div>
      )}
    </div>
  );
}

export default function ChatThemePicker({ selectedTheme, onSelect }) {
  return (
    <div>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant:ital,wght@0,300;0,400;1,300&family=Syne:wght@400;600&family=Lora:ital,wght@0,400;0,600;1,400&family=DM+Serif+Display:ital@0;1&family=Outfit:wght@300;400;500&family=DM+Sans:wght@300;400;500&family=Nunito:wght@300;400;500&display=swap');`}</style>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 186px)', gap: 14 }}>
        {Object.entries(CHAT_THEMES).map(([key, theme]) => (
          <MiniCard
            key={key}
            themeKey={key}
            theme={theme}
            isSelected={(selectedTheme || 'elegant') === key}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  );
}
