'use client'

import React, { Component } from 'react'
import { LuExpand, LuMinimize2 } from 'react-icons/lu';

interface CompactAnalysisHeaderProps {
  isMinimized: boolean;
  isLoading: boolean;
  aiEnabled: boolean;
  handleMinimizeClick: () => void;
  apiRequestCount: number;
  apiRequestLimit: number;
}

export function CompactAnalysisHeader({
  isMinimized,
  isLoading,
  aiEnabled,
  handleMinimizeClick,
  apiRequestCount,
  apiRequestLimit
}: CompactAnalysisHeaderProps) {
  return (
     <div className="flex justify-between items-center p-3 border-b" style={{ borderColor: 'var(--border-color)' }}>
        <span className="font-bold text-sm">Analysis</span>
        <div className="flex items-center gap-2">
          {aiEnabled && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {apiRequestCount}/{apiRequestLimit} AI Requests
            </span>
          )}
          {isLoading && aiEnabled && (
            <span className="loader-small mr-1"></span>
          )}
      </div>
    </div>
  )
}
