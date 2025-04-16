/**
 * Shared chart configuration and utilities
 * Used for consistent styling and behavior across all charts in the application
 */

// Color palette for charts
export const CHART_COLORS = {
  primary: '#16b5a0',
  secondary: '#0c1b46',
  accent: '#6148cb',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  neutral: '#64748b',
  // Lighter variants for backgrounds
  primaryLight: 'rgba(22, 181, 160, 0.2)',
  secondaryLight: 'rgba(12, 27, 70, 0.1)',
  accentLight: 'rgba(97, 72, 203, 0.15)',
  successLight: 'rgba(16, 185, 129, 0.2)',
  warningLight: 'rgba(245, 158, 11, 0.2)',
  errorLight: 'rgba(239, 68, 68, 0.2)',
  // Chart series colors
  series: [
    '#16b5a0', // primary teal
    '#0c1b46', // dark blue
    '#6148cb', // purple
    '#10b981', // green
    '#f59e0b', // amber
    '#64748b', // slate
    '#ef4444', // red
    '#3b82f6', // blue
    '#ec4899', // pink
    '#8b5cf6', // violet
  ],
};

// Common axis styling
export const axisStyle = {
  axisLine: {
    stroke: '#e2e8f0', // Subtle gray for axis lines
    strokeWidth: 1,
  },
  tickLine: {
    stroke: '#e2e8f0',
    strokeWidth: 1,
  },
  tick: {
    fill: '#64748b', // Neutral text color for ticks
    fontSize: 12,
  },
  label: {
    fill: '#334155', // Darker text for axis labels
    fontSize: 14,
    fontWeight: 500,
  },
};

// Common grid styling
export const gridStyle = {
  vertical: {
    stroke: '#e2e8f0',
    strokeDasharray: '3 3',
    strokeOpacity: 0.7,
  },
  horizontal: {
    stroke: '#e2e8f0',
    strokeDasharray: '3 3', 
    strokeOpacity: 0.7,
  },
};

// Legend styling
export const legendStyle = {
  fontSize: 12,
  fontWeight: 500,
  padding: 10,
  fill: '#334155', // Darker text for legend
};

// Tooltip styling
export const tooltipStyle = {
  contentStyle: {
    backgroundColor: 'white',
    border: 'none',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    borderRadius: '6px',
    padding: '10px 14px',
  },
  labelStyle: {
    fontWeight: 600,
    color: '#0f172a',
    marginBottom: '4px',
  },
  itemStyle: {
    color: '#334155',
    padding: '4px 0',
  },
};

// Chart responsiveness configurations
export const chartResponsiveConfig = {
  small: {
    margin: { top: 10, right: 10, bottom: 30, left: 30 },
    fontSize: {
      axis: 10,
      label: 12,
      legend: 11,
    },
    padding: {
      top: 5,
      right: 5,
      bottom: 5,
      left: 5,
    },
  },
  medium: {
    margin: { top: 20, right: 20, bottom: 40, left: 40 },
    fontSize: {
      axis: 12,
      label: 14,
      legend: 12,
    },
    padding: {
      top: 10,
      right: 10,
      bottom: 10,
      left: 10,
    },
  },
  large: {
    margin: { top: 30, right: 30, bottom: 50, left: 50 },
    fontSize: {
      axis: 14,
      label: 16,
      legend: 14,
    },
    padding: {
      top: 15,
      right: 15,
      bottom: 15,
      left: 15,
    },
  },
};

// Calculate opacity for stacked charts based on index
export function getStackedOpacity(index: number, total: number): number {
  const baseOpacity = 0.8;
  const opacityStep = 0.6 / (total - 1);
  return baseOpacity - (index * opacityStep);
}

// Format number values with nigerian naira (₦) or percentage (%)
export function formatChartValue(value: number, format: 'currency' | 'percentage' | 'number' = 'number'): string {
  switch (format) {
    case 'currency':
      return `₦${value.toLocaleString('en-NG')}`;
    case 'percentage':
      return `${value}%`;
    default:
      return value.toLocaleString('en-NG');
  }
}

// Get a gradient definition for chart fills
// Note: In a real React component, we would return JSX,
// but since this is a TypeScript utility file, we'll return a config object instead
export function getGradientDef(id: string, color: string): {
  id: string;
  color: string;
  opacity1: number;
  opacity2: number;
} {
  return {
    id,
    color,
    opacity1: 0.8,
    opacity2: 0.1
  };
}

// Responsive chart dimensions based on container width
export function getChartDimensions(containerWidth: number): { height: number; fontSize: number } {
  if (containerWidth < 400) {
    return { height: 200, fontSize: 10 };
  } else if (containerWidth < 700) {
    return { height: 300, fontSize: 12 };
  } else {
    return { height: 400, fontSize: 14 };
  }
}