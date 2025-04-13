import { Link, useLocation } from "wouter";
import { forwardRef, useState, useEffect } from "react";
import { usePageTransition } from "@/contexts/page-transition-context";
import { cn } from "@/lib/utils";

interface AnimatedLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  transitionDelay?: number; // milliseconds to delay the transition
  [key: string]: any; // For any other props
}

export const AnimatedLink = forwardRef<HTMLAnchorElement, AnimatedLinkProps>(
  ({ href, children, className, transitionDelay = 100, ...props }, ref) => {
    const [location] = useLocation();
    const { startLoading } = usePageTransition();
    const [clicked, setClicked] = useState(false);
    const isActive = location === href;

    useEffect(() => {
      // Reset clicked state when location changes
      setClicked(false);
    }, [location]);

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
      // Don't trigger transition for external links or if we're already on this page
      if (
        !href ||
        href.startsWith("http") ||
        href.startsWith("#") ||
        location === href
      ) {
        return;
      }

      e.preventDefault();
      setClicked(true);
      
      // Start the loading animation
      startLoading();
      
      // Navigate after a small delay for better visual feedback
      setTimeout(() => {
        window.location.href = href;
      }, transitionDelay);
    };

    return (
      <Link
        ref={ref}
        href={href}
        onClick={handleClick}
        className={cn(
          "relative transition-all duration-300",
          clicked && "opacity-70",
          isActive && "font-medium",
          className
        )}
        {...props}
      >
        {children}
      </Link>
    );
  }
);