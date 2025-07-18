import React, { Component } from 'react'
import { LuExpand, LuMinimize2 } from 'react-icons/lu';

interface CompactAnalysisHeaderProps {
  isMinimized: boolean;
  isLoading: boolean;
  aiEnabled: boolean;
  handleMinimizeClick: () => void;
}

export function CompactAnalysisHeader({ isMinimized, isLoading, aiEnabled, handleMinimizeClick }: CompactAnalysisHeaderProps) {
  return (
     <div className="flex justify-between items-center p-3 border-b" style={{ borderColor: 'var(--border-color)' }}>
        <span className="font-bold text-sm">Analysis</span>
        <div className="flex items-center gap-2">
          {isLoading && aiEnabled && (
            <span className="loader-small mr-1"></span>
          )}
          <button
            onClick={handleMinimizeClick}
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Minimize panel"
          >
            {isMinimized ? (
              <LuExpand className="w-4 h-4" />
            )
            : (
              <LuMinimize2 className="w-4 h-4" />
            )}


          </button>
      </div>
    </div>
)
}
