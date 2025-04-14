import React, { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

export type TooltipPosition = "top" | "right" | "bottom" | "left";

interface TooltipProps {
  targetId: string;
  position?: TooltipPosition;
  title?: string;
  content: string;
  isOpen: boolean;
  onClose: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  showPrevious?: boolean;
  showNext?: boolean;
  showClose?: boolean;
  highlightTarget?: boolean;
}

export default function Tooltip({
  targetId,
  position = "bottom",
  title,
  content,
  isOpen,
  onClose,
  onNext,
  onPrevious,
  showPrevious = false,
  showNext = true,
  showClose = true,
  highlightTarget = true,
}: TooltipProps) {
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const positionTooltip = () => {
      const targetElement = document.getElementById(targetId);
      const tooltipElement = tooltipRef.current;

      if (!targetElement || !tooltipElement) return;

      // Add highlight class to target if requested
      if (highlightTarget) {
        targetElement.classList.add("relative", "z-40");
        
        // Create a subtle pulse effect around the target element
        const existingPulse = document.getElementById(`pulse-${targetId}`);
        if (!existingPulse) {
          const pulseElement = document.createElement("div");
          pulseElement.id = `pulse-${targetId}`;
          pulseElement.className = 
            "absolute inset-0 rounded-md bg-primary/10 animate-pulse pointer-events-none ring-2 ring-primary";
          pulseElement.style.zIndex = "-1";
          targetElement.style.position = "relative";
          targetElement.appendChild(pulseElement);
        }
      }

      const targetRect = targetElement.getBoundingClientRect();
      const tooltipRect = tooltipElement.getBoundingClientRect();

      // Calculate position based on specified position prop
      let top = 0;
      let left = 0;

      const gap = 12; // Gap between target and tooltip

      switch (position) {
        case "top":
          top = targetRect.top - tooltipRect.height - gap + window.scrollY;
          left = targetRect.left + targetRect.width / 2 - tooltipRect.width / 2 + window.scrollX;
          break;
        case "right":
          top = targetRect.top + targetRect.height / 2 - tooltipRect.height / 2 + window.scrollY;
          left = targetRect.right + gap + window.scrollX;
          break;
        case "bottom":
          top = targetRect.bottom + gap + window.scrollY;
          left = targetRect.left + targetRect.width / 2 - tooltipRect.width / 2 + window.scrollX;
          break;
        case "left":
          top = targetRect.top + targetRect.height / 2 - tooltipRect.height / 2 + window.scrollY;
          left = targetRect.left - tooltipRect.width - gap + window.scrollX;
          break;
      }

      // Ensure tooltip stays within viewport
      const padding = 16;
      const viewportWidth = window.innerWidth - padding;
      const viewportHeight = window.innerHeight - padding;

      // Adjust horizontal position if needed
      if (left < padding) {
        left = padding;
      } else if (left + tooltipRect.width > viewportWidth) {
        left = viewportWidth - tooltipRect.width;
      }

      // Adjust vertical position if needed
      if (top < padding) {
        top = padding;
      } else if (top + tooltipRect.height > viewportHeight + window.scrollY) {
        top = targetRect.top - tooltipRect.height - gap + window.scrollY;
        if (top < padding) {
          top = targetRect.bottom + gap + window.scrollY;
          if (top + tooltipRect.height > viewportHeight + window.scrollY) {
            top = window.scrollY + viewportHeight - tooltipRect.height - padding;
          }
        }
      }

      setTooltipPosition({ top, left });
    };

    if (isOpen) {
      // Position on mount
      setTimeout(positionTooltip, 50); // Slight delay to ensure DOM is ready

      // Reposition on window resize
      window.addEventListener("resize", positionTooltip);
      window.addEventListener("scroll", positionTooltip);

      // Cleanup
      return () => {
        window.removeEventListener("resize", positionTooltip);
        window.removeEventListener("scroll", positionTooltip);
        
        // Remove highlight class from target
        const targetElement = document.getElementById(targetId);
        if (targetElement && highlightTarget) {
          const pulseElement = document.getElementById(`pulse-${targetId}`);
          if (pulseElement) {
            targetElement.removeChild(pulseElement);
          }
        }
      };
    }
  }, [isOpen, targetId, position, highlightTarget]);

  // Arrow positioning
  const getArrowClass = () => {
    switch (position) {
      case "top": return "bottom-0 left-1/2 -translate-x-1/2 translate-y-full border-r-transparent border-b-transparent border-l-transparent";
      case "right": return "left-0 top-1/2 -translate-y-1/2 -translate-x-full border-t-transparent border-b-transparent border-r-transparent";
      case "bottom": return "top-0 left-1/2 -translate-x-1/2 -translate-y-full border-r-transparent border-t-transparent border-l-transparent";
      case "left": return "right-0 top-1/2 -translate-y-1/2 translate-x-full border-t-transparent border-b-transparent border-l-transparent";
      default: return "";
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={tooltipRef}
          className="fixed z-50 max-w-xs pointer-events-auto"
          style={{
            top: tooltipPosition.top,
            left: tooltipPosition.left,
          }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.2 }}
        >
          <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4">
            {/* Arrow */}
            <div 
              className={`absolute w-0 h-0 border-solid border-8 border-white dark:border-gray-800 ${getArrowClass()}`}
            />

            {/* Close button */}
            {showClose && (
              <button
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                onClick={onClose}
              >
                <X size={16} />
              </button>
            )}

            {/* Content */}
            <div className="mb-4">
              {title && <h3 className="text-base font-semibold mb-1 pr-6">{title}</h3>}
              <p className="text-sm text-gray-600 dark:text-gray-300">{content}</p>
            </div>

            {/* Buttons */}
            <div className="flex justify-between items-center">
              {showPrevious ? (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={onPrevious}
                  className="text-xs px-3"
                >
                  Previous
                </Button>
              ) : <div />}
              
              {showNext && (
                <Button 
                  size="sm" 
                  onClick={onNext}
                  className="text-xs px-3 ml-auto"
                >
                  {onNext ? "Next" : "Got it"}
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}