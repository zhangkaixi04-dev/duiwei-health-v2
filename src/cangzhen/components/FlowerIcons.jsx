// src/cangzhen/components/FlowerIcons.jsx
import React from 'react';

/** 伯利恒之星 — 六瓣放射星形花，感知馆 (恢复茎叶，保持精致) */
export function StarOfBethlehem({ size = 24, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
      <g transform="translate(16, 18) scale(1.1)">
        {/* 茎叶 */}
        <path d="M0 6 L0 14" stroke="#8F9E78" strokeWidth="1.5" />
        <path d="M0 14 Q-4 10 -6 6" stroke="#8F9E78" strokeWidth="1.5" fill="none" />
        <path d="M0 14 Q4 10 6 6" stroke="#8F9E78" strokeWidth="1.5" fill="none" />
        
        {/* 花朵 */}
        <g transform="translate(0, -2)">
          <ellipse cx="0" cy="0" rx="2.5" ry="6.5" fill="#D6CEAB" opacity="0.9" />
          <ellipse cx="0" cy="0" rx="2.5" ry="6.5" fill="#D6CEAB" opacity="0.9" transform="rotate(60)" />
          <ellipse cx="0" cy="0" rx="2.5" ry="6.5" fill="#D6CEAB" opacity="0.9" transform="rotate(120)" />
          <circle cx="0" cy="0" r="2.5" fill="#C2B87E" />
          <circle cx="0" cy="0" r="1.2" fill="#F0E8DD" />
        </g>
      </g>
    </svg>
  );
}

/** 铃兰 — 纯粹的铃铛花朵，情绪馆 (参照图片：绿叶+弯曲茎+垂落白花) */
export function LilyOfTheValley({ size = 24, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
      <g transform="translate(16, 16) scale(1.1)">
         {/* 大叶子 (左侧包裹) */}
         <path d="M-2 14 Q-12 8 -8 -4 Q-6 -8 -2 -2 L0 14 Z" fill="#7A8F5F" />
         <path d="M0 14 Q8 8 4 -4 Q2 -8 -2 -2" fill="#8FA570" opacity="0.8" />

         {/* 主茎 (弯曲) */}
         <path d="M0 14 Q0 0 6 -8" stroke="#7A8F5F" strokeWidth="1.5" fill="none" />
         
         {/* 花朵1 (顶部) */}
         <g transform="translate(6, -8) rotate(15)">
            <path d="M0 0 L1 2 Q0 3 -1 2 Z" fill="#FFFFFF" />
            <circle cx="0" cy="2.5" r="2.5" fill="#FFFFFF" />
         </g>
         
         {/* 花朵2 (中部) */}
         <g transform="translate(3, -4) rotate(-10)">
            <path d="M0 0 L0.5 3 Q0 4 -0.5 3 Z" stroke="#7A8F5F" strokeWidth="0.5" />
            <path d="M0 3 Q-2.5 3 -2.5 5.5 Q-2.5 6.5 -1.5 7 Q0 6 1.5 7 Q2.5 6.5 2.5 5.5 Q2.5 3 0 3 Z" fill="#FFFFFF" />
         </g>

         {/* 花朵3 (下部) */}
         <g transform="translate(1, 1) rotate(-20)">
            <path d="M0 0 L0.5 3 Q0 4 -0.5 3 Z" stroke="#7A8F5F" strokeWidth="0.5" />
            <path d="M0 3 Q-3 3 -3 6 Q-3 7 -2 7.5 Q0 6.5 2 7.5 Q3 7 3 6 Q3 3 0 3 Z" fill="#FFFFFF" />
         </g>
      </g>
    </svg>
  );
}

/** 鸢尾花 — 三瓣形态，灵感馆 (参照图片：紫色花瓣+绿叶) */
export function IrisFlower({ size = 24, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
      <g transform="translate(16, 18) scale(1.1)">
        {/* 绿叶 (基底) */}
        <path d="M-2 12 Q-6 6 -4 0 L0 10 Z" fill="#8F9E78" />
        <path d="M2 12 Q6 6 4 0 L0 10 Z" fill="#7A8F5F" />
        <path d="M0 12 L0 6" stroke="#6E8055" strokeWidth="2" />

        {/* 后层花瓣 (淡紫) */}
        <path d="M0 4 Q-5 0 -6 -5 Q-4 -9 0 -8 Q4 -9 6 -5 Q5 0 0 4 Z" fill="#BFA6D4" />
        
        {/* 前层主花瓣 (深紫，带纹理) */}
        <path d="M0 6 Q-4 0 -5 -6 Q0 -12 5 -6 Q4 0 0 6 Z" fill="#9D84B5" />
        <path d="M0 6 Q0 -2 0 -8" stroke="#7A5F90" strokeWidth="0.5" />
        
        {/* 侧边下垂花瓣 */}
        <path d="M-1 4 Q-6 6 -8 2 Q-7 0 -3 2 Z" fill="#9D84B5" />
        <path d="M1 4 Q6 6 8 2 Q7 0 3 2 Z" fill="#9D84B5" />

        {/* 花蕊 (黄色) */}
        <path d="M0 -2 L0 -5" stroke="#FFD700" strokeWidth="1.5" />
      </g>
    </svg>
  );
}

/** 万象 — 满天星花球，自定义馆 (恢复茎叶，保持花球感) */
export function BabysBreath({ size = 24, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
      <g transform="translate(16, 16) scale(1.1)">
        {/* 茎 */}
        <path d="M0 4 L0 12" stroke="#8F9E78" strokeWidth="1" />
        <path d="M0 8 L-4 4" stroke="#8F9E78" strokeWidth="0.8" />
        <path d="M0 8 L4 4" stroke="#8F9E78" strokeWidth="0.8" />

        {/* 花球主体 */}
        <g transform="translate(0, -2)">
            <circle cx="0" cy="0" r="2" fill="#E0D8C8" opacity="0.95" />
            <circle cx="-4" cy="-3" r="1.8" fill="#E0D8C8" opacity="0.9" />
            <circle cx="4" cy="-3" r="1.8" fill="#E0D8C8" opacity="0.9" />
            <circle cx="-3" cy="4" r="1.6" fill="#E0D8C8" opacity="0.85" />
            <circle cx="3" cy="4" r="1.6" fill="#E0D8C8" opacity="0.85" />
            <circle cx="0" cy="-6" r="1.4" fill="#E0D8C8" opacity="0.8" />
            
            {/* 花芯 */}
            <circle cx="0" cy="0" r="0.6" fill="white" />
            <circle cx="-4" cy="-3" r="0.5" fill="white" />
            <circle cx="4" cy="-3" r="0.5" fill="white" />
        </g>
      </g>
    </svg>
  );
}

/** 统一入口 */
export function FlowerIcon({ hallKey, size = 24, className }) {
  if (hallKey === "emotion") return <LilyOfTheValley size={size} className={className} />;
  if (hallKey === "inspiration") return <IrisFlower size={size} className={className} />;
  if (hallKey === "wanxiang" || hallKey === "custom") return <BabysBreath size={size} className={className} />;
  return <StarOfBethlehem size={size} className={className} />;
}
