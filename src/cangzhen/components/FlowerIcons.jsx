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

/** 万象 — 满天星花球，自定义馆 (多彩花球版) */
export function BabysBreath({ size = 24, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
      <g transform="translate(16, 16) scale(1.1)">
        {/* 茎 */}
        <path d="M0 4 L0 12" stroke="#8F9E78" strokeWidth="1" />
        <path d="M0 8 L-4 4" stroke="#8F9E78" strokeWidth="0.8" />
        <path d="M0 8 L4 4" stroke="#8F9E78" strokeWidth="0.8" />

        {/* 花球主体 - 五颜六色 */}
        <g transform="translate(0, -2)">
            {/* 白色基底 */}
            <circle cx="0" cy="0" r="2" fill="white" opacity="0.95" />
            
            {/* 粉色系 */}
            <circle cx="-4" cy="-3" r="1.8" fill="#F4D0D8" opacity="0.9" /> {/* 淡粉 */}
            <circle cx="3" cy="4" r="1.6" fill="#F4D0D8" opacity="0.85" />
            
            {/* 蓝色系 */}
            <circle cx="4" cy="-3" r="1.8" fill="#D4E0EF" opacity="0.9" /> {/* 淡蓝 */}
            <circle cx="-6" cy="0" r="1.4" fill="#D4E0EF" opacity="0.8" />
            
            {/* 紫色系 */}
            <circle cx="-3" cy="4" r="1.6" fill="#D8D0E3" opacity="0.85" /> {/* 淡紫 */}
            <circle cx="0" cy="-6" r="1.4" fill="#D8D0E3" opacity="0.8" />
            
            {/* 补点 */}
            <circle cx="6" cy="0" r="1.4" fill="white" opacity="0.8" />
            <circle cx="0" cy="6" r="1.4" fill="white" opacity="0.8" />
            
            {/* 花芯 (点缀) */}
            <circle cx="0" cy="0" r="0.6" fill="#E0D8C8" />
            <circle cx="-4" cy="-3" r="0.5" fill="white" />
            <circle cx="4" cy="-3" r="0.5" fill="white" />
        </g>
      </g>
    </svg>
  );
}

/** 雪滴花 — 下垂的白色钟形花 (希望/萌芽) */
export function Snowdrop({ size = 24, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
      <g transform="translate(16, 16) scale(1.1)">
         {/* 茎 (弯曲) */}
         <path d="M0 14 Q0 0 6 -8" stroke="#7A8F5F" strokeWidth="1.5" fill="none" />
         
         {/* 叶子 */}
         <path d="M0 14 Q-6 8 -4 0" stroke="#7A8F5F" strokeWidth="1.5" fill="none" />

         {/* 花朵 (下垂) */}
         <g transform="translate(6, -8) rotate(15)">
            <path d="M0 0 Q-3 2 -2 5 Q0 7 2 5 Q3 2 0 0 Z" fill="#FFFFFF" />
            <path d="M-1 5 L-0.5 6 L0 5 L0.5 6 L1 5" stroke="#A8D5BA" strokeWidth="0.5" fill="none" />
         </g>
      </g>
    </svg>
  );
}

/** 迷迭香 — 针状叶与小紫花 (回忆/坚持) */
export function Rosemary({ size = 24, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
      <g transform="translate(16, 16) scale(1.1)">
         {/* 主茎 */}
         <path d="M0 14 L0 -10" stroke="#5F7A5F" strokeWidth="1.5" />
         
         {/* 针状叶 */}
         <path d="M0 8 L-6 6" stroke="#5F7A5F" strokeWidth="1" />
         <path d="M0 6 L6 4" stroke="#5F7A5F" strokeWidth="1" />
         <path d="M0 2 L-5 0" stroke="#5F7A5F" strokeWidth="1" />
         <path d="M0 -2 L5 -4" stroke="#5F7A5F" strokeWidth="1" />

         {/* 小花 (淡紫/蓝) */}
         <circle cx="-6" cy="6" r="1.5" fill="#A6B1E1" />
         <circle cx="6" cy="4" r="1.5" fill="#A6B1E1" />
         <circle cx="-5" cy="0" r="1.5" fill="#A6B1E1" />
         <circle cx="5" cy="-4" r="1.5" fill="#A6B1E1" />
         <circle cx="0" cy="-10" r="2" fill="#A6B1E1" />
      </g>
    </svg>
  );
}

/** 睡莲 — 浮于水面的纯净 (绽放/悟性) */
export function WaterLily({ size = 24, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
      <g transform="translate(16, 18) scale(1.1)">
         {/* 荷叶 (底部) */}
         <path d="M-10 8 Q-12 0 -4 -4 Q0 -6 4 -4 Q12 0 10 8 Q8 12 0 12 Q-8 12 -10 8 Z" fill="#7A9F7A" opacity="0.8" />
         
         {/* 花瓣 (多层) */}
         <g transform="translate(0, -2)">
            <path d="M0 0 Q-4 -6 0 -10 Q4 -6 0 0 Z" fill="#F8F8FF" /> {/* 中间主瓣 */}
            <path d="M0 0 Q-6 -4 -4 -8" fill="#F0F0F5" opacity="0.9" /> {/* 左瓣 */}
            <path d="M0 0 Q6 -4 4 -8" fill="#F0F0F5" opacity="0.9" /> {/* 右瓣 */}
            <path d="M0 0 Q-8 -2 -6 -5" fill="#E6E6FA" opacity="0.8" /> {/* 侧左 */}
            <path d="M0 0 Q8 -2 6 -5" fill="#E6E6FA" opacity="0.8" /> {/* 侧右 */}
         </g>
         
         {/* 花蕊 */}
         <circle cx="0" cy="-1" r="1" fill="#FFD700" />
      </g>
    </svg>
  );
}

/** 统一入口 */
export function FlowerIcon({ hallKey, type, size = 24, className }) {
  // Type 优先级最高 (用于特定徽章)
  if (type === 'Snowdrop') return <Snowdrop size={size} className={className} />;
  if (type === 'Rosemary') return <Rosemary size={size} className={className} />;
  if (type === 'Lily') return <LilyOfTheValley size={size} className={className} />;
  if (type === 'Lotus' || type === 'WaterLily') return <WaterLily size={size} className={className} />;
  
  // Hall Key 映射
  if (hallKey === "emotion") return <LilyOfTheValley size={size} className={className} />;
  if (hallKey === "inspiration") return <IrisFlower size={size} className={className} />;
  if (hallKey === "wanxiang" || hallKey === "custom") return <BabysBreath size={size} className={className} />;
  return <StarOfBethlehem size={size} className={className} />;
}
