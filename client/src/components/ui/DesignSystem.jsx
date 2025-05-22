/**
 * iREVA Design System Components
 * 
 * A comprehensive collection of reusable UI components following
 * consistent design principles for the iREVA platform.
 */

import React from 'react';
import { cva } from 'class-variance-authority';

// Button component with variants
export const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        primary: "bg-primary text-white hover:bg-primary/90 focus-visible:ring-primary",
        secondary: "bg-secondary text-white hover:bg-secondary/90 focus-visible:ring-secondary",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        danger: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        success: "bg-success text-success-foreground hover:bg-success/90"
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4 py-2",
        lg: "h-12 px-6 py-2 text-base",
        icon: "h-9 w-9"
      },
      width: {
        auto: "w-auto",
        full: "w-full"
      }
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      width: "auto"
    }
  }
);

export const Button = ({
  children,
  variant,
  size,
  width,
  className,
  ...props
}) => {
  return (
    <button
      className={buttonVariants({ variant, size, width, className })}
      {...props}
    >
      {children}
    </button>
  );
};

// Card component with header, body, and footer
export const Card = ({ children, className = "", ...props }) => {
  return (
    <div 
      className={`bg-card text-card-foreground rounded-lg border shadow-sm ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

Card.Header = ({ children, className = "", ...props }) => (
  <div 
    className={`flex flex-col space-y-1.5 p-6 ${className}`}
    {...props}
  >
    {children}
  </div>
);

Card.Title = ({ children, className = "", ...props }) => (
  <h3 
    className={`text-lg font-semibold leading-none tracking-tight ${className}`}
    {...props}
  >
    {children}
  </h3>
);

Card.Description = ({ children, className = "", ...props }) => (
  <p 
    className={`text-sm text-muted-foreground ${className}`}
    {...props}
  >
    {children}
  </p>
);

Card.Content = ({ children, className = "", ...props }) => (
  <div 
    className={`p-6 pt-0 ${className}`}
    {...props}
  >
    {children}
  </div>
);

Card.Footer = ({ children, className = "", ...props }) => (
  <div 
    className={`flex items-center p-6 pt-0 ${className}`}
    {...props}
  >
    {children}
  </div>
);

// Badge component with variants
export const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        destructive: "border-transparent bg-destructive text-destructive-foreground",
        outline: "text-foreground",
        success: "border-transparent bg-success text-success-foreground",
        warning: "border-transparent bg-warning text-warning-foreground",
        info: "border-transparent bg-info text-info-foreground"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);

export const Badge = ({
  children,
  variant,
  className,
  ...props
}) => {
  return (
    <span
      className={badgeVariants({ variant, className })}
      {...props}
    >
      {children}
    </span>
  );
};

// Alert component with variants
export const alertVariants = cva(
  "relative w-full rounded-lg border p-4",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground",
        destructive: "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive",
        success: "border-success/50 text-success dark:border-success [&>svg]:text-success",
        warning: "border-warning/50 text-warning dark:border-warning [&>svg]:text-warning",
        info: "border-info/50 text-info dark:border-info [&>svg]:text-info"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);

export const Alert = ({
  children,
  variant,
  className,
  ...props
}) => {
  return (
    <div
      role="alert"
      className={alertVariants({ variant, className })}
      {...props}
    >
      {children}
    </div>
  );
};

Alert.Title = ({ children, className = "", ...props }) => (
  <h5 
    className={`mb-1 font-medium leading-none tracking-tight ${className}`}
    {...props}
  >
    {children}
  </h5>
);

Alert.Description = ({ children, className = "", ...props }) => (
  <div 
    className={`text-sm [&_p]:leading-relaxed ${className}`}
    {...props}
  >
    {children}
  </div>
);

// Input component with label and error state
export const Input = React.forwardRef(({
  label,
  error,
  className = "",
  ...props
}, ref) => {
  const id = props.id || props.name || Math.random().toString(36).substring(2, 9);
  
  return (
    <div className="space-y-2">
      {label && (
        <label 
          htmlFor={id} 
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={id}
        className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${error ? 'border-destructive' : ''} ${className}`}
        {...props}
      />
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
});

Input.displayName = "Input";

// Dropdown/Select component
export const Select = React.forwardRef(({
  label,
  error,
  children,
  className = "",
  ...props
}, ref) => {
  const id = props.id || props.name || Math.random().toString(36).substring(2, 9);
  
  return (
    <div className="space-y-2">
      {label && (
        <label 
          htmlFor={id} 
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          {label}
        </label>
      )}
      <select
        ref={ref}
        id={id}
        className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${error ? 'border-destructive' : ''} ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
});

Select.displayName = "Select";

// Avatar component with fallback
export const Avatar = ({
  src,
  alt,
  fallback,
  size = "md",
  className = "",
  ...props
}) => {
  const [error, setError] = React.useState(false);
  
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-16 w-16",
    xl: "h-24 w-24"
  };
  
  const sizeClass = sizeClasses[size] || sizeClasses.md;
  
  return (
    <div 
      className={`relative flex shrink-0 overflow-hidden rounded-full ${sizeClass} ${className}`}
      {...props}
    >
      {!error && src ? (
        <img
          src={src}
          alt={alt || fallback || "Avatar"}
          className="aspect-square h-full w-full"
          onError={() => setError(true)}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-muted">
          <span className="text-muted-foreground font-medium">
            {fallback || alt?.charAt(0) || "A"}
          </span>
        </div>
      )}
    </div>
  );
};

// Stats card component
export const StatCard = ({
  title,
  value,
  icon,
  trend,
  trendValue,
  className = "",
  ...props
}) => {
  const trendColor = trend === 'up' ? 'text-success' : trend === 'down' ? 'text-destructive' : 'text-muted-foreground';
  
  return (
    <Card className={`overflow-hidden ${className}`} {...props}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
          {icon && <div className="text-primary">{icon}</div>}
        </div>
        <div className="text-2xl font-bold mb-2">{value}</div>
        {trend && trendValue && (
          <div className={`flex items-center text-sm ${trendColor}`}>
            {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '—'} {trendValue}
          </div>
        )}
      </div>
    </Card>
  );
};

// Progress bar component
export const Progress = ({
  value,
  max = 100,
  className = "",
  ...props
}) => {
  const percent = Math.round((value / max) * 100);
  
  return (
    <div
      className={`relative h-2 w-full overflow-hidden rounded-full bg-secondary/20 ${className}`}
      {...props}
    >
      <div
        className="h-full bg-primary transition-all"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
};

// Table components
export const Table = ({ className = "", ...props }) => (
  <div className="relative w-full overflow-auto">
    <table
      className={`w-full caption-bottom text-sm ${className}`}
      {...props}
    />
  </div>
);

Table.Header = ({ className = "", ...props }) => (
  <thead className={className} {...props} />
);

Table.Row = ({ className = "", ...props }) => (
  <tr
    className={`border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted ${className}`}
    {...props}
  />
);

Table.Head = ({ className = "", ...props }) => (
  <th
    className={`h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 ${className}`}
    {...props}
  />
);

Table.Body = ({ className = "", ...props }) => (
  <tbody
    className={`[&_tr:last-child]:border-0 ${className}`}
    {...props}
  />
);

Table.Cell = ({ className = "", ...props }) => (
  <td
    className={`p-4 align-middle [&:has([role=checkbox])]:pr-0 ${className}`}
    {...props}
  />
);

// Tab components
export const Tabs = ({ children, className = "", ...props }) => (
  <div className={className} {...props}>
    {children}
  </div>
);

Tabs.List = ({ className = "", ...props }) => (
  <div
    className={`inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground ${className}`}
    {...props}
  />
);

Tabs.Trigger = ({ active, className = "", ...props }) => (
  <button
    className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
      active
        ? "bg-background text-foreground shadow-sm"
        : "hover:bg-background/50 hover:text-foreground"
    } ${className}`}
    {...props}
  />
);

Tabs.Content = ({ className = "", ...props }) => (
  <div
    className={`mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${className}`}
    {...props}
  />
);

// Modal/Dialog components
export const Dialog = ({ isOpen, onClose, children, className = "", ...props }) => {
  React.useEffect(() => {
    // Lock body scroll when dialog is open
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    // Cleanup
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div
        className={`relative max-h-[90vh] max-w-md overflow-auto rounded-lg border bg-background p-6 shadow-lg ${className}`}
        {...props}
      >
        {children}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
        >
          <span className="sr-only">Close</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    </div>
  );
};

Dialog.Title = ({ className = "", ...props }) => (
  <h2
    className={`text-lg font-semibold leading-none tracking-tight ${className}`}
    {...props}
  />
);

Dialog.Description = ({ className = "", ...props }) => (
  <p
    className={`mb-5 mt-2 text-sm text-muted-foreground ${className}`}
    {...props}
  />
);

Dialog.Footer = ({ className = "", ...props }) => (
  <div
    className={`mt-5 flex justify-end gap-2 ${className}`}
    {...props}
  />
);

// Spinner/Loading component
export const Spinner = ({ size = "md", className = "", ...props }) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
    xl: "h-12 w-12"
  };
  
  const sizeClass = sizeClasses[size] || sizeClasses.md;
  
  return (
    <svg
      className={`animate-spin text-muted-foreground ${sizeClass} ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      {...props}
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
};

// Tooltip component
export const Tooltip = ({ children, content, className = "", ...props }) => {
  const [isVisible, setIsVisible] = React.useState(false);
  const [position, setPosition] = React.useState({ top: 0, left: 0 });
  const triggerRef = React.useRef(null);
  
  const handleMouseEnter = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX + rect.width / 2
      });
      setIsVisible(true);
    }
  };
  
  const handleMouseLeave = () => {
    setIsVisible(false);
  };
  
  return (
    <div className="relative inline-block">
      <div
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="inline-block"
      >
        {children}
      </div>
      {isVisible && (
        <div
          className={`absolute z-50 px-3 py-1.5 text-sm text-primary-foreground bg-primary rounded shadow-md whitespace-nowrap ${className}`}
          style={{
            top: `${position.top}px`,
            left: `${position.left}px`,
            transform: 'translateX(-50%)'
          }}
          {...props}
        >
          {content}
          <div
            className="absolute left-1/2 bottom-full w-0 h-0 -translate-x-1/2 border-solid border-x-transparent border-t-transparent border-b-primary"
            style={{
              borderWidth: '0 6px 6px 6px'
            }}
          />
        </div>
      )}
    </div>
  );
};

// Dashboard layout components
export const DashboardLayout = ({ children, className = "", ...props }) => (
  <div
    className={`min-h-screen bg-background ${className}`}
    {...props}
  >
    {children}
  </div>
);

DashboardLayout.Sidebar = ({ children, collapsed, className = "", ...props }) => (
  <aside
    className={`fixed top-0 left-0 z-40 h-full transition-all duration-300 ease-in-out ${
      collapsed ? "w-[70px]" : "w-64"
    } border-r bg-card ${className}`}
    {...props}
  >
    {children}
  </aside>
);

DashboardLayout.Content = ({ sidebar = true, collapsed, className = "", ...props }) => (
  <main
    className={`flex-1 transition-all duration-300 ease-in-out ${
      sidebar ? (collapsed ? "ml-[70px]" : "ml-64") : "ml-0"
    } ${className}`}
    {...props}
  />
);

DashboardLayout.Header = ({ className = "", ...props }) => (
  <header
    className={`sticky top-0 z-30 flex h-16 items-center border-b bg-card px-4 ${className}`}
    {...props}
  />
);

DashboardLayout.Footer = ({ className = "", ...props }) => (
  <footer
    className={`mt-auto border-t py-4 px-4 ${className}`}
    {...props}
  />
);

// Export all components
// All components are already exported individually above