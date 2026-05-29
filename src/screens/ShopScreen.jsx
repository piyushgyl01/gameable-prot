import React, { useState } from 'react';
import { useGame } from '../context/GameContext';

export default function ShopScreen() {
  const { gold, setGold, rewards, setRewards, showToast } = useGame();
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCost, setNewCost] = useState(100);

  const mono = { fontFamily: "'JetBrains Mono', monospace" };

  const handleAdd = () => {
    if (!newTitle.trim() || newCost <= 0) return;
    setRewards(prev => [...prev, {
      id: 'r_' + Date.now(),
      nm: newTitle.trim(),
      cost: newCost,
    }]);
    setNewTitle('');
    setNewCost(100);
    setShowAdd(false);
  };

  const handlePurchase = (reward) => {
    if (gold < reward.cost) {
      showToast('Not enough gold!');
      return;
    }
    if (window.confirm(`Buy ${reward.nm} for ${reward.cost}G?`)) {
      setGold(g => g - reward.cost);
      showToast(`Purchased: ${reward.nm}`);
    }
  };

  const handleDelete = (id) => {
    setRewards(prev => prev.filter(r => r.id !== id));
  };

  return (
    <div style={{ padding: '0 2px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <span style={{
          fontSize: 11, fontWeight: 700, letterSpacing: 1.5,
          color: 'var(--text-dim)', textTransform: 'uppercase',
        }}>
          Shop
        </span>
        <span style={{
          fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 6,
          background: 'rgba(234,179,8,0.1)', color: '#eab308',
        }}>
          Rewards
        </span>
        <div style={{ flex: 1 }} />
        <button
          onClick={() => setShowAdd(!showAdd)}
          style={{
            fontSize: 12, fontWeight: 600, padding: '5px 12px', borderRadius: 8,
            border: '1px solid var(--border)', background: 'transparent',
            color: 'var(--text-dim)', cursor: 'pointer',
          }}
        >
          {showAdd ? 'Cancel' : '+ New Reward'}
        </button>
      </div>

      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 12, padding: '14px 16px', marginBottom: 20,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <div style={{ fontSize: 13, color: 'var(--text-dim)', fontWeight: 600 }}>Your Balance</div>
        <div style={{ ...mono, fontSize: 24, fontWeight: 800, color: '#eab308' }}>
          💰 {gold}
        </div>
      </div>

      {showAdd && (
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 10, padding: 14, marginBottom: 12,
          display: 'flex', flexDirection: 'column', gap: 8,
        }}>
          <input
            value={newTitle} onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Reward name (e.g. Watch an episode)" autoFocus
            style={{
              fontSize: 13, padding: '6px 10px', borderRadius: 6,
              border: '1px solid var(--border)', background: 'var(--bg)',
              color: 'var(--text-main)', outline: 'none', fontFamily: 'var(--font)',
            }}
          />
          <input
            type="number"
            value={newCost} onChange={(e) => setNewCost(parseInt(e.target.value) || 0)}
            placeholder="Gold Cost"
            style={{
              fontSize: 13, padding: '6px 10px', borderRadius: 6,
              border: '1px solid var(--border)', background: 'var(--bg)',
              color: 'var(--text-main)', outline: 'none', fontFamily: 'var(--font)',
            }}
          />
          <button
            onClick={handleAdd}
            style={{
              fontSize: 12, fontWeight: 600, padding: '6px 14px', borderRadius: 8,
              background: 'rgba(234,179,8,0.12)', border: '1px solid rgba(234,179,8,0.3)',
              color: '#eab308', cursor: 'pointer', alignSelf: 'flex-start',
            }}
          >
            Add Reward
          </button>
        </div>
      )}

      {/* Rewards Grid */}
      <div style={{ display: 'grid', gap: 10 }}>
        {rewards.map(r => (
          <div key={r.id} style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 10, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10
          }}>
            <div style={{ fontSize: 20 }}>🎁</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-main)' }}>{r.nm}</div>
              <div style={{ ...mono, fontSize: 12, color: '#eab308', marginTop: 2 }}>{r.cost} G</div>
            </div>
            <button
              onClick={() => handlePurchase(r)}
              style={{
                fontSize: 12, fontWeight: 600, padding: '6px 16px', borderRadius: 8,
                background: gold >= r.cost ? '#eab308' : 'var(--surface-hover)',
                border: 'none', color: gold >= r.cost ? '#fff' : 'var(--text-dim)',
                cursor: gold >= r.cost ? 'pointer' : 'not-allowed',
              }}
            >
              Buy
            </button>
            <button
              onClick={() => handleDelete(r.id)}
              style={{
                fontSize: 14, padding: '4px', background: 'transparent', border: 'none',
                color: 'var(--text-dim)', cursor: 'pointer'
              }}
              title="Delete"
            >
              ×
            </button>
          </div>
        ))}

        {rewards.length === 0 && !showAdd && (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-dim)', fontSize: 14 }}>
            Your shop is empty. Add some rewards to motivate yourself!
          </div>
        )}
      </div>
    </div>
  );
}
