import React from 'react';
import { formatEnergyTime, xpMultiplier } from '../lib/systems';
import { DIFFICULTY_COLORS, DIFFICULTY_LABELS } from '../lib/quests';

export default function QuestCard({ quest, stateObj, onStart, onSkip, onComplete, currentLevel }) {
  const status = stateObj?.s || "idle";
  const isDone = status === "done";
  const isActive = status === "active";
  
  const earnedXp = Math.round(quest.xp * xpMultiplier(currentLevel));
  const diffColor = DIFFICULTY_COLORS[quest.df];
  
  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: '12px',
      padding: '12px 14px',
      borderTop: '1px solid var(--border)',
      background: isActive ? 'rgba(234, 179, 8, 0.04)' : 'transparent',
      borderLeft: isActive ? '2px solid #eab308' : '2px solid transparent',
      opacity: isDone ? 0.3 : 1,
      transition: 'all 0.2s ease',
      position: 'relative'
    }}>
      {/* Difficulty indicator line */}
      <div style={{
        position: 'absolute',
        left: 0, top: 0, bottom: 0, width: '2px',
        background: isActive ? 'transparent' : diffColor,
        opacity: isDone ? 0.1 : 0.6
      }} />

      <div style={{ fontSize: '20px', width: '24px', textAlign: 'center', flexShrink: 0 }}>
        {quest.ic}
      </div>

      <div style={{ flex: 1 }}>
        <div style={{ 
          fontSize: '14px', 
          fontWeight: '700', 
          marginBottom: '2px',
          textDecoration: isDone ? 'line-through' : 'none'
        }}>
          {quest.nm}
        </div>
        <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px' }}>
          {quest.ds}
        </div>
        
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          <span style={{
            fontSize: '10px',
            fontWeight: '600',
            padding: '2px 6px',
            borderRadius: '4px',
            color: diffColor,
            background: `${diffColor}15`
          }}>
            {DIFFICULTY_LABELS[quest.df]}
          </span>
          
          {isActive && (
            <span style={{
              fontSize: '10px',
              fontWeight: '600',
              padding: '2px 6px',
              borderRadius: '4px',
              color: '#eab308',
              background: 'rgba(234, 179, 8, 0.1)'
            }}>
              ⚡ {stateObj.en} • {formatEnergyTime(stateObj.en)}
            </span>
          )}
          
          {isDone && (
            <span style={{
              fontSize: '10px',
              fontWeight: '700',
              padding: '2px 6px',
              borderRadius: '4px',
              color: '#10b981',
              background: 'rgba(16, 185, 129, 0.1)'
            }}>
              ✓ Completed
            </span>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px', flexShrink: 0 }}>
        <span className="mono font-semibold text-xs text-muted">+{earnedXp} XP</span>
        
        {status === "idle" && (
          <div style={{ display: 'flex', gap: '6px' }}>
            <button className="btn-ghost" onClick={() => onSkip(quest)}>Skip</button>
            <button 
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border-focus)',
                padding: '6px 10px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '600',
                color: 'var(--text-main)',
                cursor: 'pointer'
              }}
              onClick={() => onStart(quest)}
            >
              {formatEnergyTime(quest.en)}
            </button>
          </div>
        )}
        
        {isActive && (
          <button 
            style={{
              background: '#16a34a',
              border: 'none',
              padding: '6px 14px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: '700',
              color: '#fff',
              cursor: 'pointer'
            }}
            onClick={() => onComplete(quest)}
          >
            Done
          </button>
        )}
      </div>
    </div>
  );
}
