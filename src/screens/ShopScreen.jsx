import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { GEAR_DB } from '../lib/gear';

export default function ShopScreen() {
  const { gold, setGold, rewards, setRewards, inventory, equipped, setEquipped, showToast } = useGame();
  
  const [newTitle, setNewTitle] = useState('');
  const [newCost, setNewCost] = useState(100);
  const [showAdd, setShowAdd] = useState(false);

  const mono = { fontFamily: "'JetBrains Mono', monospace" };

  const handleAddReward = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setRewards([...rewards, { id: 'r_' + Date.now(), nm: newTitle.trim(), cost: newCost }]);
    setNewTitle('');
    setNewCost(100);
    setShowAdd(false);
  };

  const handleBuyCustom = (r) => {
    if (gold < r.cost) {
      showToast('Not enough gold!');
      return;
    }
    if (window.confirm(`Buy ${r.nm} for ${r.cost} Gold?`)) {
      setGold(g => g - r.cost);
      showToast(`Enjoy your reward: ${r.nm}!`);
    }
  };

  const handleDeleteCustom = (e, rId) => {
    e.stopPropagation();
    setRewards(rewards.filter(r => r.id !== rId));
  };

  const handleBuyGear = (g) => {
    if (gold < g.cost) return;
    if (window.confirm(`Buy ${g.name} for ${g.cost} Gold?`)) {
      setGold(prev => prev - g.cost);
      setInventory(prev => [...prev, g.id]);
      setEquipped(prev => ({ ...prev, [g.slot]: g.id }));
      showToast(`Equipped ${g.name}`);
    }
  };

  const handleEquip = (gId) => {
    const gear = GEAR_DB.find(x => x.id === gId);
    if (gear) {
      setEquipped(prev => ({ ...prev, [gear.slot]: gear.id }));
      showToast(`Equipped ${gear.name}`);
    }
  };

  return (
    <div style={{ padding: '0 2px' }}>
      {/* Wealth Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'rgba(234,179,8,0.1)', border: '1px solid #eab308',
        borderRadius: 10, padding: '16px 20px', marginBottom: 24,
      }}>
        <div style={{ fontSize: 13, color: '#eab308', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>
          Current Wealth
        </div>
        <div style={{ ...mono, fontSize: 24, fontWeight: 800, color: '#eab308' }}>
          {gold} G
        </div>
      </div>

      {/* Equipment Slots */}
      <div style={{
        fontSize: 11, fontWeight: 700, letterSpacing: 1.5,
        color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: 14,
      }}>
        Equipped Gear
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 24 }}>
        {['head', 'body', 'accessory'].map(slot => {
          const item = GEAR_DB.find(x => x.id === equipped[slot]);
          return (
            <div key={slot} style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 8, padding: 10, textAlign: 'center'
            }}>
              <div style={{ fontSize: 20 }}>{item ? item.icon : '⬛'}</div>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-dim)', marginTop: 4, textTransform: 'capitalize' }}>
                {slot}
              </div>
            </div>
          );
        })}
      </div>

      {/* Gear Shop */}
      <div style={{
        fontSize: 11, fontWeight: 700, letterSpacing: 1.5,
        color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: 14,
      }}>
        Gear Shop
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 30 }}>
        {GEAR_DB.map(g => {
          const isOwned = inventory.includes(g.id);
          const isEquipped = equipped[g.slot] === g.id;
          
          return (
            <div key={g.id} style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 8, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12
            }}>
              <div style={{ fontSize: 24 }}>{g.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700 }}>{g.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>{g.desc}</div>
              </div>
              <button
                onClick={() => isOwned ? handleEquip(g.id) : handleBuyGear(g)}
                disabled={isEquipped || (!isOwned && gold < g.cost)}
                style={{
                  padding: '6px 12px', borderRadius: 6, fontSize: 12, fontWeight: 700,
                  border: isEquipped ? '1px solid var(--border)' : 'none',
                  background: isEquipped ? 'transparent' : 'rgba(234,179,8,0.2)',
                  color: isEquipped ? 'var(--text-dim)' : '#eab308',
                  cursor: isEquipped || (!isOwned && gold < g.cost) ? 'default' : 'pointer',
                  opacity: (!isOwned && gold < g.cost) ? 0.5 : 1
                }}
              >
                {isEquipped ? 'Equipped' : isOwned ? 'Equip' : `${g.cost} G`}
              </button>
            </div>
          );
        })}
      </div>

      {/* Custom Rewards */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <span style={{
          fontSize: 11, fontWeight: 700, letterSpacing: 1.5,
          color: 'var(--text-dim)', textTransform: 'uppercase',
        }}>
          Custom Rewards
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

      {showAdd && (
        <form onSubmit={handleAddReward} style={{
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
            type="submit"
            style={{
              fontSize: 12, fontWeight: 600, padding: '6px 14px', borderRadius: 8,
              background: 'rgba(234,179,8,0.12)', border: '1px solid rgba(234,179,8,0.3)',
              color: '#eab308', cursor: 'pointer', alignSelf: 'flex-start',
            }}
          >
            Add Reward
          </button>
        </form>
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
              onClick={() => handleBuyCustom(r)}
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
              onClick={(e) => handleDeleteCustom(e, r.id)}
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
