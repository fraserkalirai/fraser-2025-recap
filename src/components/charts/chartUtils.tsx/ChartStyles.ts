import { FontSpec } from 'chart.js';

export const chartFontTitle = (windowSize: number): Partial<FontSpec> => {
  let fontSize: number;
  switch (true) {
    case windowSize >= 1024:
      fontSize = 32;
      break;
    case windowSize >= 768:
      fontSize = 26;
      break;
    default:
      fontSize = 16;
      break;
  }

  return {
    family: "'Inter', sans-serif",
    size: fontSize,
    weight: 'bold',
  };
};

export const chartFontAxisTitle = (windowSize: number): Partial<FontSpec> => {
  let fontSize: number;
  switch (true) {
    case windowSize >= 1024:
      fontSize = 26;
      break;
    case windowSize >= 768:
      fontSize = 20;
      break;
    default:
      fontSize = 14;
      break;
  }

  return {
    family: "'Inter', sans-serif",
    size: fontSize,
    weight: 'bold',
  };
};

export const chartFontAxisTicks = (windowSize: number): Partial<FontSpec> => {
  let fontSize: number;
  switch (true) {
    case windowSize >= 1024:
      fontSize = 22;
      break;
    case windowSize >= 768:
      fontSize = 16;
      break;
    default:
      fontSize = 12;
      break;
  }

  return {
    family: "'Inter', sans-serif",
    size: fontSize,
    weight: 'bold',
  };
};

export const chartFontTooltipBody = (windowSize: number): Partial<FontSpec> => {
  let fontSize: number;
  switch (true) {
    case windowSize >= 1024:
      fontSize = 16;
      break;
    case windowSize >= 768:
      fontSize = 14;
      break;
    default:
      fontSize = 12;
      break;
  }

  return {
    family: "'Inter', sans-serif",
    size: fontSize,
    weight: 'normal',
  };
};

export const chartFontLegend = (windowSize: number): Partial<FontSpec> => {
  let fontSize: number;
  switch (true) {
    case windowSize >= 1024:
      fontSize = 18;
      break;
    case windowSize >= 768:
      fontSize = 14;
      break;
    default:
      fontSize = 10;
      break;
  }

  return {
    family: "'Inter', sans-serif",
    size: fontSize,
    weight: 'bold',
  };
};

export const chartColor = (isDark: boolean): string => 
  isDark ? 'rgb(255, 255, 255)' : 'rgb(28, 57, 142)';

export const chartGridColor = (isDark: boolean): string => 
  isDark ? 'rgba(255, 255, 255, 0.25)' : 'rgba(28, 57, 142, 0.25)';

export const chartTooltipBackground = (isDark: boolean): string => 
  isDark ? 'rgb(28, 57, 142, 0.9)' : 'rgba(255, 255, 255, 0.9)';

export const chartTooltipColor = (isDark: boolean): string => 
  isDark ? 'rgba(255, 255, 255)' : 'rgb(28, 57, 142)';

export const darkModeColours = {
  overall: 'rgb(22, 163, 74)',
  deep: 'rgb(190, 219, 255)',
  core: 'rgb(81, 162, 255)',
  rem: 'rgb(20, 71, 230)',
  awake: 'rgb(142, 81, 255)',
}

export const lightModeColours = {
  overall: 'rgb(22, 163, 74)',
  deep: 'rgb(22, 36, 86)',
  core: 'rgb(20, 71, 230)',
  rem: 'rgb(81, 162, 255)',
  awake:'rgb(77, 23, 154)',
}

export const pointRadius = (windowSize: number): number =>
  windowSize > 640 ? 3 : 2;

export const pointHoverRadius = (windowSize: number): number =>
  windowSize > 640 ? 6 : 4;

export function formatDate(date: Date): string {
  const day = date.getDate()
  const lastDigit = day % 10
  const lastTwoDigits = day % 100
  let suffix = 'th'
  
  if (lastTwoDigits < 11 || lastTwoDigits > 13) {
    if (lastDigit === 1) suffix = 'st'
    else if (lastDigit === 2) suffix = 'nd'
    else if (lastDigit === 3) suffix = 'rd'
  }
  
  const month = date.toLocaleDateString('en-US', { month: 'short' })
  
  return `${day}${suffix} ${month}`
}

export function formatDateLong(date: Date): string {
  const day = date.getDate();
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const getOrdinal = (n: number) => {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };
  
  return `${getOrdinal(day)} ${monthNames[date.getMonth()]}`;
}