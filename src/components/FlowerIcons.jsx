import React from 'react';

export const FlowerIcon = ({ type, hallKey, size = 24, className = "" }) => {
  // Map hallKey to flower types
  let flowerType = type;
  if (hallKey) {
    switch (hallKey) {
      case 'sensation': flowerType = 'sakura'; break;
      case 'emotion': flowerType = 'lotus'; break;
      case 'inspiration': flowerType = 'sunflower'; break;
      case 'wanxiang': flowerType = 'clover'; break;
      default: flowerType = 'sakura';
    }
  }

  // Common props
  const props = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "currentColor",
    className: className,
    xmlns: "http://www.w3.org/2000/svg"
  };

  if (flowerType === 'sakura') {
    return (
      <svg {...props}>
        <path d="M12 2C9 2 7 5 7 8C7 11 9 13 12 13C15 13 17 11 17 8C17 5 15 2 12 2ZM12 13C9 13 6 15 5 18C4 21 6 22 8 22C10 22 11 20 12 18C13 20 14 22 16 22C18 22 20 21 19 18C18 15 15 13 12 13Z" />
      </svg>
    );
  }

  if (flowerType === 'lotus') {
    return (
      <svg {...props}>
        <path d="M12 2L14 8L18 9L14 12L15 18L12 15L9 18L10 12L6 9L10 8L12 2Z" />
      </svg>
    );
  }

  if (flowerType === 'sunflower') {
    return (
      <svg {...props}>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2V6M12 18V22M2 12H6M18 12H22M4.93 4.93L7.76 7.76M16.24 16.24L19.07 19.07M4.93 19.07L7.76 16.24M16.24 7.76L19.07 4.93" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }

  if (flowerType === 'clover') {
    return (
      <svg {...props}>
        <path d="M12 12C12 12 8 12 8 8C8 4 12 2 12 2C12 2 16 4 16 8C16 12 12 12 12 12ZM12 12C12 12 12 16 8 16C4 16 2 12 2 12C2 12 4 8 8 8C12 8 12 12 12 12ZM12 12C12 12 16 12 16 16C16 20 12 22 12 22C12 22 8 20 8 16C8 12 12 12 12 12ZM12 12C12 12 12 8 16 8C20 8 22 12 22 12C22 12 20 16 16 16C12 16 12 12 12 12Z" />
      </svg>
    );
  }

  // Default fallback (generic flower)
  return (
    <svg {...props}>
      <path d="M12 2C10 5 10 7 12 9C14 7 14 5 12 2ZM12 22C10 19 10 17 12 15C14 17 14 19 12 22ZM2 12C5 14 7 14 9 12C7 10 5 10 2 12ZM22 12C19 14 17 14 15 12C17 10 19 10 22 12ZM12 12C11 11 11 13 12 12Z" />
    </svg>
  );
};
