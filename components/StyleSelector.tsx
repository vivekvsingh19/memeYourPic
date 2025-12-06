import React from 'react';
import { MEME_STYLES } from '../constants';
import { MemeStyle } from '../types';

interface StyleSelectorProps {
  selectedStyleId: string;
  onSelect: (styleId: string) => void;
  disabled?: boolean;
}

const StyleSelector: React.FC<StyleSelectorProps> = ({ selectedStyleId, onSelect, disabled }) => {
  return (
    <div className="w-full">
      <div className="flex space-x-3 overflow-x-auto pb-4 pt-1 hide-scrollbar touch-pan-x">
        {MEME_STYLES.map((style) => (
          <button
            key={style.id}
            disabled={disabled}
            onClick={() => onSelect(style.id)}
            className={`
              flex-shrink-0 px-4 py-2.5 rounded-full border-2 text-sm font-bold transition-all duration-200
              flex items-center gap-2 select-none
              ${
                selectedStyleId === style.id
                  ? 'bg-black border-black text-white shadow-md scale-105'
                  : 'bg-white border-gray-200 text-gray-600 hover:border-gray-400 hover:bg-gray-50'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            <span className="text-lg">{style.emoji}</span>
            <span>{style.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default StyleSelector;