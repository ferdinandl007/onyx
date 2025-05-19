import React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface DeepResearchButtonProps {
  deepResearchEnabled: boolean;
  setDeepResearchEnabled: (enabled: boolean) => void;
}

const DeepResearchIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M21 21L16.65 16.65M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M11 8V14M8 11H14"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export function DeepResearchButton({
  deepResearchEnabled,
  setDeepResearchEnabled,
}: DeepResearchButtonProps) {
  const handleClick = () => {
    setDeepResearchEnabled(!deepResearchEnabled);
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            className={`ml-auto py-1.5 px-3 inline-flex items-center justify-center
            rounded-full transition-all duration-200 ease-in-out group
            focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
            ${
              deepResearchEnabled
                ? "bg-agent hover:bg-agent-hovered text-white"
                : "bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-neutral-700 dark:text-neutral-300"
            }`}
            onClick={handleClick}
            aria-pressed={deepResearchEnabled}
            title={deepResearchEnabled ? "Disable Deep Research" : "Enable Deep Research"}
          >
            <DeepResearchIcon />
            <span className="ml-2 text-sm font-medium">
              Deep research
            </span>
          </button>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          width="w-72"
          className="p-4 bg-white rounded-lg shadow-lg border border-background-200 dark:border-neutral-900"
        >
          <div className="flex items-center space-x-2 mb-3">
            <h3 className="text-sm font-semibold text-neutral-900">
              Agent Search
            </h3>
          </div>
          <p className="text-xs text-neutral-600  dark:text-neutral-700 mb-2">
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
