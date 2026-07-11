'use client';

import { type Option } from '@/lib/types';

interface OptionButtonProps {
  option: Option;
  onClick: () => void;
  disabled?: boolean;
  index?: number;
}

// 马卡龙风格选项按钮 - 6种颜色轮换
const COLORS = [
  { from: '#FFD6A5', to: '#FFA94D', name: 'orange' },      // 橙色
  { from: '#FFF3B0', to: '#FFE066', name: 'yellow' },     // 黄色
  { from: '#D8F3DC', to: '#95D5B2', name: 'green' },      // 绿色
  { from: '#B5EAD7', to: '#7FDBDA', name: 'cyan' },       // 青色
  { from: '#C9E4FF', to: '#89C2D9', name: 'blue' },      // 蓝色
  { from: '#E2D1F9', to: '#C77DFF', name: 'purple' },    // 紫色
];

export function OptionButton({ option, onClick, disabled, index = 0 }: OptionButtonProps) {
  const colorIndex = index % COLORS.length;
  const color = COLORS[colorIndex];

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        w-full p-3.5 text-left rounded-2xl border-2 transition-all duration-200
        bg-gradient-to-r from-[${color.from}] to-[${color.to}]
        hover:shadow-lg hover:scale-[1.02]
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'shadow-sm active:scale-[0.98]'}
      `}
      style={{
        background: `linear-gradient(135deg, ${color.from} 0%, ${color.to} 100%)`,
        borderColor: color.to,
      }}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-[14px] leading-5 font-medium text-gray-700 flex-1">{option.text}</span>
      </div>
    </button>
  );
}

interface OptionsListProps {
  options: Option[];
  onSelect: (option: Option) => void;
  disabled?: boolean;
}

export function OptionsList({ options, onSelect, disabled }: OptionsListProps) {
  return (
    <div className="grid gap-2.5">
      {options.map((option, index) => (
        <div 
          key={option.id} 
          className="animate-slideUp"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <OptionButton
            option={option}
            onClick={() => onSelect(option)}
            disabled={disabled}
            index={index}
          />
        </div>
      ))}
    </div>
  );
}
