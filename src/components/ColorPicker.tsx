import React, { useState, useRef, useEffect } from 'react';
import { HexColorPicker } from 'react-colorful';
import { Pipette, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  title?: string;
  presets?: string[];
  isDarkBg?: boolean;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({ 
  color, 
  onChange, 
  title = "选择颜色", 
  presets = [
    '#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#6366F1', '#8B5CF6', '#EC4899', 
    '#000000', '#4B5563', '#FFFFFF'
  ],
  isDarkBg = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
    }
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen]);

  const [inputValue, setInputValue] = useState(color.toUpperCase());

  useEffect(() => {
    setInputValue(color.toUpperCase());
  }, [color]);

  const handleInputChange = (val: string) => {
    let newColor = val.toUpperCase();
    if (!newColor.startsWith('#')) {
      newColor = '#' + newColor;
    }
    setInputValue(newColor);
    
    // Validate hex format (3 or 6 chars)
    if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(newColor)) {
      onChange(newColor);
    }
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-7 h-7 rounded-full border transition-all flex items-center justify-center cursor-pointer shadow-sm ${
          isOpen ? 'ring-2 ring-rose-600 ring-offset-1 border-transparent' : 'border-black/10 hover:scale-125'
        }`}
        title={title}
      >
        <div 
          className="w-4 h-4 rounded-full" 
          style={{ 
            backgroundColor: color || '#FFFFFF',
            boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.1)"
          }} 
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <div 
            className="fixed inset-0 z-[998] flex items-center justify-center pointer-events-auto" 
            onClick={() => setIsOpen(false)}
          >
            {/* The Backdrop - Completely transparent as per user request */}
            <div 
              className={`fixed right-[60px] top-1/2 -translate-y-1/2 w-[290px] h-[90vh] max-h-[850px] z-[998] rounded-[2.5rem] bg-transparent transition-all duration-300`}
              onClick={(e) => e.stopPropagation()}
            />

            <motion.div
              ref={popoverRef}
              initial={{ opacity: 0, x: 20, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className={`fixed right-[60px] top-1/2 -translate-y-1/2 z-[999] p-5 rounded-[2rem] shadow-2xl border transition-all ${
                isDarkBg 
                  ? 'bg-zinc-900/95 backdrop-blur-xl border-white/10 text-white shadow-[0_20px_50px_rgba(0,0,0,0.5)]' 
                  : 'bg-white/95 backdrop-blur-xl border-black/5 text-black shadow-[0_20px_50px_rgba(0,0,0,0.1)]'
              } w-[240px] max-h-[80vh] overflow-y-auto no-scrollbar scroll-smooth`}
            >
              <div className="flex items-center justify-between mb-5 px-1 sticky top-0 bg-transparent py-1 z-10 font-bold">
                <div className="flex items-center gap-2.5">
                  <div className={`p-1.5 rounded-lg ${isDarkBg ? 'bg-rose-500/20' : 'bg-rose-500/10'}`}>
                    <Pipette className="w-3.5 h-3.5 text-rose-500" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] font-bold uppercase tracking-[0.2em] opacity-40 leading-none mb-1">自定义</span>
                    <span className="text-[11px] font-bold truncate leading-none">{title}</span>
                  </div>
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className={`p-1.5 rounded-full transition-all hover:rotate-90 ${isDarkBg ? 'hover:bg-white/10' : 'hover:bg-black/5'}`}
                >
                  <X className="w-3.5 h-3.5 opacity-40 hover:opacity-100" />
                </button>
              </div>

              <div className="custom-color-picker-container mb-5 overflow-hidden rounded-xl border border-white/5 shadow-inner bg-black/10 scale-95 origin-center">
                <HexColorPicker color={color} onChange={onChange} />
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <input 
                    className={`flex-1 px-3 py-2.5 rounded-xl text-[12px] font-mono font-bold border transition-all outline-none focus:ring-1 focus:ring-rose-500/50 ${
                      isDarkBg ? 'bg-black/40 border-white/10 text-zinc-300 shadow-inner' : 'bg-black/5 border-transparent text-zinc-600 shadow-sm'
                    }`}
                    value={inputValue}
                    onChange={(e) => handleInputChange(e.target.value)}
                    onBlur={() => setInputValue(color.toUpperCase())}
                  />
                  <div 
                    className={`w-10 h-10 rounded-xl border shadow-lg ring-2 transition-all duration-300 ${isDarkBg ? 'border-white/20 ring-white/5' : 'border-black/5 ring-black/5'}`} 
                    style={{ backgroundColor: color }} 
                  />
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
