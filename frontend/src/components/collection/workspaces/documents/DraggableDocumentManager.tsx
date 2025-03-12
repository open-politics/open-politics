'use client';

import React from 'react';
import DocumentManager from './DocumentManager';
import DraggableWrapper from '../../wrapper/draggable-wrapper';
import { X, Maximize2, Square, Layout } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import DocumentDetailProvider from './DocumentDetailProvider';

interface DraggableDocumentManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadIntoRunner?: (runId: number, runName: string) => void;
}

const DraggableDocumentManager: React.FC<DraggableDocumentManagerProps> = ({
  isOpen,
  onClose,
  onLoadIntoRunner
}) => {
  if (!isOpen) return null;

  // Responsive sizes based on viewport
  const getResponsiveSize = () => {
    if (typeof window === 'undefined') return { width: 1200, height: 800 }; // Default for SSR
    
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    if (vw < 640) { // sm
      return {
        width: Math.min(vw - 32, 400),
        height: Math.min(vh - 32, 600)
      };
    } else if (vw < 1024) { // md
      return {
        width: Math.min(vw - 64, 800),
        height: Math.min(vh - 64, 700)
      };
    } else { // lg and above
      return {
        width: Math.min(vw - 96, 1200),
        height: Math.min(vh - 96, 800)
      };
    }
  };

  const handleLayoutChange = (layout: 'default' | 'wide' | 'tall') => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    switch (layout) {
      case 'wide':
        return { width: Math.min(vw - 96, 1600), height: Math.min(vh - 96, 600) };
      case 'tall':
        return { width: Math.min(vw - 96, 800), height: Math.min(vh - 96, 900) };
      default:
        return getResponsiveSize();
    }
  };

  const responsiveSize = getResponsiveSize();

  return (
    <DocumentDetailProvider>
      <div className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm">
        <DraggableWrapper
          title="Document Manager"
          width="w-[1200px]"
          height="h-[800px]"
          defaultPosition={{ x: 50, y: 50 }}
          className="z-[101] bg-background"
          onMinimizeChange={(isMinimized) => {
            if (isMinimized) onClose();
          }}
          customSize={responsiveSize}
          headerContent={
            <div className="flex items-center justify-between w-full px-6 py-2 border-b">
              <span className="text-base font-semibold">Document Manager</span>
              <div className="flex items-center space-x-2">
                <div className="flex items-center mr-4 space-x-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:bg-muted"
                    onClick={() => handleLayoutChange('default')}
                  >
                    <Square className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:bg-muted"
                    onClick={() => handleLayoutChange('wide')}
                  >
                    <Maximize2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:bg-muted"
                    onClick={() => handleLayoutChange('tall')}
                  >
                    <Layout className="h-4 w-4" />
                  </Button>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="h-8 w-8 hover:bg-muted"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          }
        >
          <div className="h-[calc(100%-3rem)] overflow-hidden">
            <DocumentManager onLoadIntoRunner={onLoadIntoRunner} />
          </div>
        </DraggableWrapper>
      </div>
    </DocumentDetailProvider>
  );
};

export default DraggableDocumentManager;