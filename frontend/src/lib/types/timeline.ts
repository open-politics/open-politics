import { ReactNode } from 'react';

export type TimelineSize = 'sm' | 'md' | 'lg';
export type TimelineStatus = 'completed' | 'in-progress' | 'pending';
export type TimelineColor = 'primary' | 'secondary' | 'muted' | 'accent' | 'destructive';

export interface TimelineElement {
  id: number;
  date: string;
  title: string;
  description: string;
  icon?: ReactNode | (() => ReactNode);
  status?: TimelineStatus;
  color?: TimelineColor;
  size?: TimelineSize;
  loading?: boolean;
  error?: string;
  link?: string;  // Regular URL to the content
  videoTitle?: string;  // Title specific to the video
  videoDescription?: string | ReactNode;  // Description specific to the video
  videoEmbedLink?: string;  // URL for the embedded video player
}

export interface TimelineProps {
  items: TimelineElement[];
  size?: TimelineSize;
  animate?: boolean;
  iconColor?: TimelineColor;
  connectorColor?: TimelineColor;
  className?: string;
}