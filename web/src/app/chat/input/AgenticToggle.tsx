import React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AgenticToggleProps {
  proSearchEnabled: boolean;
  setProSearchEnabled: (enabled: boolean) => void;
}

// Enhanced search icon with plus symbol
const ResearchIcon = ({ active }: { active: boolean }) => (
  <div className="relative">
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={active ? "research-enhance" : ""}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.5" y2="16.5" />
      {active && (
        <>
          <line x1="11" y1="8" x2="11" y2="14" />
          <line x1="8" y1="11" x2="14" y2="11" />
        </>
      )}
    </svg>
  </div>
);

export function AgenticToggle({
  proSearchEnabled,
  setProSearchEnabled,
}: AgenticToggleProps) {
  const handleToggle = () => {
    setProSearchEnabled(!proSearchEnabled);
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            className={`mx-2 py-1.5 px-3 inline-flex items-center justify-center gap-2
            rounded-full border text-xs font-medium transition-all duration-300 ease-out
            focus:outline-none hover:shadow-sm
            ${
              proSearchEnabled
                ? "bg-agent text-white border-transparent deep-button-active"
                : "bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100 dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-700 dark:hover:bg-neutral-700"
            }`}
            onClick={handleToggle}
            aria-pressed={proSearchEnabled}
          >
            <ResearchIcon active={proSearchEnabled} />
            <span className="whitespace-nowrap font-medium">Deep research</span>
          </button>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          width="w-72"
          className="p-4 bg-white rounded-lg shadow-lg border border-background-200 dark:border-neutral-900"
        >
          <div className="flex items-center space-x-2 mb-3">
            <h3 className="text-sm font-semibold text-neutral-900">
              Deep Research
            </h3>
          </div>
          <p className="text-xs text-neutral-600 dark:text-neutral-700 mb-2">
            Use AI agents to break down questions and run deep iterative
            research through promising pathways. Gives more thorough and
            accurate responses but takes slightly longer.
          </p>
          <ul className="text-xs text-text-600 dark:text-neutral-700 list-disc list-inside">
            <li>Improved accuracy of search results</li>
            <li>Less hallucinations</li>
            <li>More comprehensive answers</li>
          </ul>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
