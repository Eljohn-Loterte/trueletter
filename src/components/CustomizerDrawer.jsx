import React, { useState } from 'react';
import { 
  X, 
  Palette, 
  Layers, 
  Sparkles, 
  Bird, 
  Gift, 
  Heart, 
  Check, 
  RotateCcw
} from 'lucide-react';

export const ROSE_PALETTES = [
  { id: 'white', name: 'Bridal White', color: '#fdfcf7', desc: 'Image 2 white rose match' },
  { id: 'crimson', name: 'Velvet Crimson', color: '#d31027', desc: 'Classic red rose' },
  { id: 'wine', name: 'Deep Burgundy', color: '#820b1e', desc: 'Vintage romantic wine' },
  { id: 'blush', name: 'Pastel Blush', color: '#ea7088', desc: 'Soft tender pink' },
  { id: 'coral', name: 'Sunset Coral', color: '#ee5d43', desc: 'Warm vibrant romance' },
  { id: 'canary', name: 'Golden Sun', color: '#f5b027', desc: 'Warm golden friendship' },
  { id: 'lilac', name: 'Enchanted Lilac', color: '#8e54e9', desc: 'Royalty & wonder' },
  { id: 'noir', name: 'Midnight Noir', color: '#2b232a', desc: 'Modern dark rose' }
];

export const WRAP_PALETTES = [
  { id: 'onyx', name: 'Onyx Silk & Gold', color: '#181a1f', accent: '#dfb858', desc: 'Image 1 layered squares' },
  { id: 'ice', name: 'Icy Sky Blue', color: '#d8ebf8', accent: '#dfb858', desc: 'Pale sky blue origami' },
  { id: 'cream', name: 'Bridal Cream Silk', color: '#f5f5f2', accent: '#dfb858', desc: 'Soft warm luxury' },
  { id: 'kraft', name: 'Linen Kraft', color: '#dfcbaf', accent: '#d4af37', desc: 'Rustic organic craft' },
  { id: 'rose', name: 'Rose Dust Silk', color: '#f7d6de', accent: '#dfb858', desc: 'Gentle blush harmony' },
  { id: 'sage', name: 'Botanical Sage', color: '#c7d6c5', accent: '#dfb858', desc: 'Garden eucalyptus tone' }
];

export const RIBBON_PALETTES = [
  { id: 'white', name: 'Whitish Silk', color: '#fcfbf8', desc: 'User request whitish ribbon' },
  { id: 'blue', name: 'Cute Royal Blue', color: '#1d4294', desc: 'Deep royal blue satin' },
  { id: 'crimson', name: 'Crimson Satin', color: '#b51225', desc: 'Passionate red silk' },
  { id: 'gold', name: 'Champagne Gold', color: '#d4af37', desc: 'Metallic luxury gold' },
  { id: 'emerald', name: 'Emerald Silk', color: '#185a38', desc: 'Rich botanical green' },
  { id: 'blush', name: 'Sweet Blush', color: '#f497a9', desc: 'Soft pastel tone' }
];

export default function CustomizerDrawer({
  isOpen,
  onClose,
  settings,
  updateSettings,
  onResetToImage
}) {
  const [activeTab, setActiveTab] = useState('roses');

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop overlay for mobile & tablet (tap outside to close) */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity animate-fade-in"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-l border-white/20 shadow-2xl z-50 flex flex-col transition-all duration-300">
        {/* Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-slate-200/50 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center font-serif text-lg">
            ❦
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">Bouquet Atelier</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Custom 3D floral arrangement studio</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onResetToImage}
            title="Reset to latest design style"
            className="p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <RotateCcw size={16} />
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200/50 dark:border-slate-800 px-4 pt-2 gap-1 bg-slate-50/50 dark:bg-slate-900/40">
        <button
          onClick={() => setActiveTab('roses')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium rounded-t-lg transition-all ${
            activeTab === 'roses'
              ? 'bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 shadow-sm border-t-2 border-amber-500 font-semibold'
              : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
          }`}
        >
          <Palette size={14} /> Roses
        </button>
        <button
          onClick={() => setActiveTab('wrap')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium rounded-t-lg transition-all ${
            activeTab === 'wrap'
              ? 'bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 shadow-sm border-t-2 border-amber-500 font-semibold'
              : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
          }`}
        >
          <Layers size={14} /> Wrap & Bow
        </button>
        <button
          onClick={() => setActiveTab('magic')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium rounded-t-lg transition-all ${
            activeTab === 'magic'
              ? 'bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 shadow-sm border-t-2 border-amber-500 font-semibold'
              : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
          }`}
        >
          <Sparkles size={14} /> Atmosphere
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {activeTab === 'roses' && (
          <div className="space-y-6">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-3">
                Rose Velvet Color
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {ROSE_PALETTES.map((palette) => {
                  const isSelected = settings.roseColor.toLowerCase() === palette.color.toLowerCase();
                  return (
                    <button
                      key={palette.id}
                      onClick={() => updateSettings({ roseColor: palette.color })}
                      className={`flex items-center gap-3 p-2.5 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/20 ring-1 ring-amber-500'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white/50 dark:bg-slate-800/50'
                      }`}
                    >
                      <span
                        className="w-7 h-7 rounded-full shadow-inner flex-shrink-0 flex items-center justify-center border border-black/10"
                        style={{ backgroundColor: palette.color }}
                      >
                        {isSelected && <Check size={14} className={palette.id === 'white' ? 'text-slate-800' : 'text-white'} />}
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-slate-800 dark:text-slate-100 truncate">{palette.name}</p>
                        <p className="text-[10px] text-slate-400 truncate">{palette.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-3">
                Side-by-Side Arrangement
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { count: 13, name: 'Staircase Dome', label: '13 Roses', badge: 'Staircase Match' },
                  { count: 11, name: 'Boutique Tier', label: '11 Roses', badge: 'Side-by-Side' },
                  { count: 9,  name: 'Petite', label: '9 Roses', badge: 'Minimal' }
                ].map((size) => {
                  const isSelected = settings.roseCount === size.count;
                  return (
                    <button
                      key={size.count}
                      onClick={() => updateSettings({ roseCount: size.count })}
                      className={`p-3 rounded-xl border text-center transition-all relative ${
                        isSelected
                          ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/20 ring-1 ring-amber-500'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white/50 dark:bg-slate-800/50'
                      }`}
                    >
                      <span className="text-[9px] uppercase font-bold tracking-wider text-amber-600 block mb-0.5">
                        {size.badge}
                      </span>
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-100">{size.name}</p>
                      <p className="text-[10px] text-slate-400">{size.label}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'wrap' && (
          <div className="space-y-6">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-3">
                Layered Origami Paper Style
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {WRAP_PALETTES.map((wrap) => {
                  const isSelected = settings.wrapColor.toLowerCase() === wrap.color.toLowerCase();
                  return (
                    <button
                      key={wrap.id}
                      onClick={() => updateSettings({ wrapColor: wrap.color, accentColor: wrap.accent })}
                      className={`flex items-center gap-3 p-2.5 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/20 ring-1 ring-amber-500'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white/50 dark:bg-slate-800/50'
                      }`}
                    >
                      <span
                        className="w-7 h-7 rounded-full shadow-inner flex-shrink-0 flex items-center justify-center border border-black/10"
                        style={{ backgroundColor: wrap.color }}
                      >
                        {isSelected && <Check size={14} className={wrap.id === 'onyx' ? 'text-amber-400' : 'text-slate-800'} />}
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-slate-800 dark:text-slate-100 truncate">{wrap.name}</p>
                        <p className="text-[10px] text-slate-400 truncate">{wrap.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-3">
                Cute Satin Ribbon Bow
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {RIBBON_PALETTES.map((ribbon) => {
                  const isSelected = settings.ribbonColor.toLowerCase() === ribbon.color.toLowerCase();
                  return (
                    <button
                      key={ribbon.id}
                      onClick={() => updateSettings({ ribbonColor: ribbon.color })}
                      className={`flex items-center gap-3 p-2.5 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/20 ring-1 ring-amber-500'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white/50 dark:bg-slate-800/50'
                      }`}
                    >
                      <span
                        className="w-7 h-7 rounded-full shadow-inner flex-shrink-0 flex items-center justify-center border border-black/10"
                        style={{ backgroundColor: ribbon.color }}
                      >
                        {isSelected && <Check size={14} className={ribbon.id === 'white' ? 'text-slate-800' : 'text-white'} />}
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-slate-800 dark:text-slate-100 truncate">{ribbon.name}</p>
                        <p className="text-[10px] text-slate-400 truncate">{ribbon.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'magic' && (
          <div className="space-y-5">
            <div className="p-4 rounded-2xl bg-white/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                  <Bird size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-100">Hummingbirds & Butterflies</h4>
                  <p className="text-[11px] text-slate-400">Animated flying companions</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.showFauna}
                onChange={(e) => updateSettings({ showFauna: e.target.checked })}
                className="w-4 h-4 accent-amber-500 cursor-pointer"
              />
            </div>

            <div className="p-4 rounded-2xl bg-white/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                  <Sparkles size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-100">Ambient Fairy Dust</h4>
                  <p className="text-[11px] text-slate-400">Subtle magical golden sparkles</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.showParticles}
                onChange={(e) => updateSettings({ showParticles: e.target.checked })}
                className="w-4 h-4 accent-amber-500 cursor-pointer"
              />
            </div>

            <div className="p-4 rounded-2xl bg-white/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
                  <Gift size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-100">3D Hanging Gift Card</h4>
                  <p className="text-[11px] text-slate-400">Gold embossed card on the ribbon</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.showGiftTag}
                onChange={(e) => updateSettings({ showGiftTag: e.target.checked })}
                className="w-4 h-4 accent-amber-500 cursor-pointer"
              />
            </div>

            <div className="p-4 rounded-2xl bg-white/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                  <RotateCcw size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-100">Auto-Rotate Showcase</h4>
                  <p className="text-[11px] text-slate-400">Continuous 360° turntable</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.autoRotate}
                onChange={(e) => updateSettings({ autoRotate: e.target.checked })}
                className="w-4 h-4 accent-amber-500 cursor-pointer"
              />
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-200/50 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50">
        <button
          onClick={onResetToImage}
          className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition active:scale-[0.98]"
        >
          <RotateCcw size={14} /> Restore Image 1 & 2 Style
        </button>
      </div>
    </div>
  </>
  );
}
