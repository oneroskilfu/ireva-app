/**
 * Chart configuration for consistent chart appearance across the application
 */

// Common colors used in charts
export const chartColors = {
  // Primary colors
  primary: 'hsl(var(--primary))',
  primaryLight: 'hsl(var(--primary) / 0.2)',
  primaryMuted: 'hsl(var(--primary) / 0.5)',
  
  // Secondary colors
  secondary: 'hsl(var(--secondary))',
  secondaryLight: 'hsl(var(--secondary) / 0.2)',
  secondaryMuted: 'hsl(var(--secondary) / 0.5)',
  
  // Performance indicators
  positive: '#16a34a', // green-600
  positiveLight: 'rgba(22, 163, 74, 0.2)',
  positiveMuted: 'rgba(22, 163, 74, 0.5)',
  
  negative: '#dc2626', // red-600
  negativeLight: 'rgba(220, 38, 38, 0.2)',
  negativeMuted: 'rgba(220, 38, 38, 0.5)',
  
  neutral: '#f59e0b', // amber-500
  neutralLight: 'rgba(245, 158, 11, 0.2)',
  neutralMuted: 'rgba(245, 158, 11, 0.5)',
  
  // Gray scale for backgrounds and borders
  border: 'hsl(var(--border))',
  background: 'hsl(var(--background))',
  foreground: 'hsl(var(--foreground))',
  muted: 'hsl(var(--muted))',
  mutedForeground: 'hsl(var(--muted-foreground))',
  
  // Additional color palette for multiple data series
  palette: [
    '#2563eb', // blue-600
    '#9333ea', // purple-600
    '#16a34a', // green-600
    '#dc2626', // red-600
    '#f59e0b', // amber-500
    '#0891b2', // cyan-600
    '#4f46e5', // indigo-600
    '#db2777', // pink-600
    '#65a30d', // lime-600
    '#7c3aed'  // violet-600
  ],
  
  // Gradient for area charts
  gradientFrom: 'hsl(var(--primary) / 0.2)',
  gradientTo: 'hsl(var(--primary) / 0.0)'
};

// Common font configuration
export const chartFonts = {
  fontFamily: 'inherit',
  fontSize: 12,
  fontWeight: 400,
  titleFontSize: 14,
  titleFontWeight: 500,
  labelFontSize: 12,
  tooltipFontSize: 12
};

// Base chart configuration
export const baseChartConfig = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom' as const,
      labels: {
        font: {
          ...chartFonts,
          family: chartFonts.fontFamily,
          size: chartFonts.labelFontSize
        },
        padding: 20,
        usePointStyle: true,
        boxWidth: 8,
        boxHeight: 8
      }
    },
    tooltip: {
      enabled: true,
      backgroundColor: 'hsl(var(--background))',
      titleColor: 'hsl(var(--foreground))',
      bodyColor: 'hsl(var(--foreground))',
      borderColor: 'hsl(var(--border))',
      borderWidth: 1,
      padding: 12,
      cornerRadius: 4,
      titleFont: {
        ...chartFonts,
        family: chartFonts.fontFamily,
        size: chartFonts.titleFontSize,
        weight: chartFonts.titleFontWeight
      },
      bodyFont: {
        ...chartFonts,
        family: chartFonts.fontFamily,
        size: chartFonts.tooltipFontSize
      },
      displayColors: true,
      boxWidth: 8,
      boxHeight: 8,
      usePointStyle: true,
      callbacks: {
        // Currency formatter for Naira
        label: function(context: any) {
          let label = context.dataset.label || '';
          if (label) {
            label += ': ';
          }
          
          if (context.parsed.y !== null) {
            if (context.dataset.isCurrency) {
              label += new Intl.NumberFormat('en-NG', {
                style: 'currency',
                currency: 'NGN',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
              }).format(context.parsed.y);
            } else if (context.dataset.isPercentage) {
              label += context.parsed.y.toFixed(1) + '%';
            } else {
              label += context.parsed.y.toLocaleString();
            }
          }
          return label;
        }
      }
    },
    title: {
      display: false,
      font: {
        ...chartFonts,
        family: chartFonts.fontFamily,
        size: chartFonts.titleFontSize,
        weight: chartFonts.titleFontWeight
      }
    }
  },
  interaction: {
    mode: 'index' as const,
    intersect: false
  }
};

// Line chart configuration (for portfolio growth, ROI tracking)
export const lineChartConfig = {
  ...baseChartConfig,
  elements: {
    line: {
      tension: 0.2,
      borderWidth: 2,
      fill: 'start',
      borderColor: chartColors.primary
    },
    point: {
      radius: 0,
      hoverRadius: 6,
      hitRadius: 6,
      backgroundColor: chartColors.primary,
      borderColor: 'white',
      borderWidth: 2
    }
  },
  scales: {
    x: {
      grid: {
        display: false,
        drawBorder: false
      },
      ticks: {
        font: {
          ...chartFonts,
          family: chartFonts.fontFamily,
          size: chartFonts.fontSize
        },
        color: chartColors.mutedForeground
      }
    },
    y: {
      beginAtZero: true,
      grid: {
        borderDash: [5, 5],
        color: chartColors.border,
        drawBorder: false
      },
      ticks: {
        font: {
          ...chartFonts,
          family: chartFonts.fontFamily,
          size: chartFonts.fontSize
        },
        color: chartColors.mutedForeground,
        padding: 10
      }
    }
  }
};

// Bar chart configuration (for monthly returns, comparative analytics)
export const barChartConfig = {
  ...baseChartConfig,
  elements: {
    bar: {
      backgroundColor: chartColors.primary,
      hoverBackgroundColor: chartColors.primaryMuted,
      borderRadius: 6,
      borderWidth: 0
    }
  },
  scales: {
    x: {
      grid: {
        display: false,
        drawBorder: false
      },
      ticks: {
        font: {
          ...chartFonts,
          family: chartFonts.fontFamily,
          size: chartFonts.fontSize
        },
        color: chartColors.mutedForeground
      }
    },
    y: {
      beginAtZero: true,
      grid: {
        borderDash: [5, 5],
        color: chartColors.border,
        drawBorder: false
      },
      ticks: {
        font: {
          ...chartFonts,
          family: chartFonts.fontFamily,
          size: chartFonts.fontSize
        },
        color: chartColors.mutedForeground,
        padding: 10
      }
    }
  }
};

// Pie chart configuration (for asset allocation)
export const pieChartConfig = {
  ...baseChartConfig,
  elements: {
    arc: {
      borderWidth: 2,
      borderColor: 'white'
    }
  },
  cutout: '0%'
};

// Doughnut chart configuration (for portfolio distribution)
export const doughnutChartConfig = {
  ...pieChartConfig,
  cutout: '60%'
};

// Area chart configuration (for projected returns)
export const areaChartConfig = {
  ...lineChartConfig,
  elements: {
    ...lineChartConfig.elements,
    line: {
      ...lineChartConfig.elements.line,
      fill: true
    }
  },
  plugins: {
    ...lineChartConfig.plugins,
    gradient: {
      enabled: true,
      fromColor: chartColors.gradientFrom,
      toColor: chartColors.gradientTo
    }
  }
};

// Stacked bar chart configuration (for comparing multiple properties)
export const stackedBarChartConfig = {
  ...barChartConfig,
  scales: {
    ...barChartConfig.scales,
    x: {
      ...barChartConfig.scales.x,
      stacked: true
    },
    y: {
      ...barChartConfig.scales.y,
      stacked: true
    }
  }
};

// Radar chart configuration (for property comparison)
export const radarChartConfig = {
  ...baseChartConfig,
  elements: {
    line: {
      borderWidth: 2
    },
    point: {
      radius: 3,
      hoverRadius: 6,
      hitRadius: 6,
      backgroundColor: chartColors.primary,
      borderColor: 'white',
      borderWidth: 1
    }
  },
  scales: {
    r: {
      angleLines: {
        display: true,
        color: chartColors.border
      },
      grid: {
        color: chartColors.border
      },
      pointLabels: {
        font: {
          ...chartFonts,
          family: chartFonts.fontFamily,
          size: chartFonts.fontSize
        },
        color: chartColors.foreground
      },
      ticks: {
        backdropColor: 'transparent',
        font: {
          ...chartFonts,
          family: chartFonts.fontFamily,
          size: 10
        },
        color: chartColors.mutedForeground
      }
    }
  }
};

// Helper function for creating a gradient background
export const createGradientBackground = (
  ctx: CanvasRenderingContext2D,
  fromColor: string = chartColors.gradientFrom,
  toColor: string = chartColors.gradientTo
) => {
  const gradient = ctx.createLinearGradient(0, 0, 0, ctx.canvas.height);
  gradient.addColorStop(0, fromColor);
  gradient.addColorStop(1, toColor);
  return gradient;
};