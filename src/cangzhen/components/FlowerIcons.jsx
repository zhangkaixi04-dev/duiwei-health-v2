// src/cangzhen/components/FlowerIcons.jsx
import React from 'react';

/** 伯利克之星 — 六瓣放射星形花，感知馆 */
export function StarOfBethlehem({ size = 24, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
      <path d="M16 28L16 19" stroke="#8A9470" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M16 24Q12 21 13 18" stroke="#8A9470" strokeWidth="1" fill="none" strokeLinecap="round" />
      <ellipse cx="16" cy="12" rx="2.5" ry="5.5" fill="var(--accent-sensation)" opacity="0.7" />
      <ellipse cx="16" cy="12" rx="2.5" ry="5.5" fill="var(--accent-sensation)" opacity="0.7" transform="rotate(60 16 12)" />
      <ellipse cx="16" cy="12" rx="2.5" ry="5.5" fill="var(--accent-sensation)" opacity="0.7" transform="rotate(120 16 12)" />
      <circle cx="16" cy="12" r="2.2" fill="#C2B87E" />
      <circle cx="16" cy="12" r="1" fill="#D6CEAB" />
    </svg>
  );
}

/** 铃兰 — 弧形茎上三朵垂铃小花，情绪馆 */
export function LilyOfTheValley({ size = 24, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
      <path d="M14 28Q14 20 16 14Q18 8 20 5" stroke="#6A8C5E" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <path d="M14 28Q8 22 10 17Q12 22 14 24" fill="#7A9C6A" opacity="0.55" />
      <path d="M18 8Q16 8 15 10Q15.5 11.5 17 11.5Q18.5 11.5 19 10Z" fill="white" opacity="0.85" />
      <ellipse cx="17" cy="11.8" rx="1.2" ry="0.4" fill="white" opacity="0.45" />
      <path d="M19.5 11Q17.5 11 16.5 13Q17 14.5 18.5 14.5Q20 14.5 20.5 13Z" fill="white" opacity="0.75" />
      <ellipse cx="18.5" cy="14.8" rx="1.1" ry="0.35" fill="white" opacity="0.4" />
      <path d="M18 14.5Q16 14.5 15.2 16.5Q15.7 18 17.2 18Q18.7 18 19.2 16.5Z" fill="white" opacity="0.65" />
      <path d="M17.5 7L17 9" stroke="#6A8C5E" strokeWidth="0.6" strokeLinecap="round" />
      <path d="M19 10L18.5 12" stroke="#6A8C5E" strokeWidth="0.6" strokeLinecap="round" />
      <path d="M17.5 13.5L17 15.5" stroke="#6A8C5E" strokeWidth="0.6" strokeLinecap="round" />
    </svg>
  );
}

/** 鸢尾花 — 三瓣向上伸展，灵感馆 */
export function IrisFlower({ size = 24, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
      <path d="M16 28L16 16" stroke="#6B7A60" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M16 26Q20 22 19 18" stroke="#6B7A60" strokeWidth="0.8" fill="none" strokeLinecap="round" />
      <path d="M16 25Q11 22 12 19" stroke="#6B7A60" strokeWidth="0.8" fill="none" strokeLinecap="round" />
      <path d="M16 5Q12 8 13 13Q16 11 16 11Q16 11 19 13Q20 8 16 5Z" fill="var(--accent-inspiration)" opacity="0.7" />
      <path d="M13 13Q10 12 9 14Q10 17 13 16Q14 14 13 13Z" fill="var(--accent-inspiration)" opacity="0.5" />
      <path d="M19 13Q22 12 23 14Q22 17 19 16Q18 14 19 13Z" fill="var(--accent-inspiration)" opacity="0.5" />
      <path d="M15 13L16 10L17 13" stroke="#9B92B5" strokeWidth="0.8" fill="none" strokeLinecap="round" />
      <circle cx="16" cy="10" r="0.8" fill="#B8B5CB" />
    </svg>
  );
}

/** 万象 — 满天星 (Everything/Custom)，自定义馆 */
export function BabysBreath({ size = 24, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
      {/* 枝干 */}
      <path d="M16 28L16 18" stroke="#8A9470" strokeWidth="1" strokeLinecap="round" />
      <path d="M16 22L12 16" stroke="#8A9470" strokeWidth="0.8" strokeLinecap="round" />
      <path d="M16 20L20 14" stroke="#8A9470" strokeWidth="0.8" strokeLinecap="round" />
      <path d="M16 18L14 12" stroke="#8A9470" strokeWidth="0.8" strokeLinecap="round" />
      
      {/* 小花朵 - 白色散点 */}
      <circle cx="12" cy="16" r="1.5" fill="white" opacity="0.9" />
      <circle cx="20" cy="14" r="1.5" fill="white" opacity="0.9" />
      <circle cx="14" cy="12" r="1.5" fill="white" opacity="0.9" />
      <circle cx="16" cy="10" r="1.8" fill="white" opacity="0.95" />
      <circle cx="18" cy="17" r="1.2" fill="white" opacity="0.8" />
      
      {/* 花芯 */}
      <circle cx="12" cy="16" r="0.5" fill="#E0D8C8" />
      <circle cx="20" cy="14" r="0.5" fill="#E0D8C8" />
      <circle cx="16" cy="10" r="0.6" fill="#E0D8C8" />
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
