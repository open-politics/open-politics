'use client';

import React from 'react';
import { Timeline, TimelineItem } from './timeline-base';
import { motion } from 'framer-motion';
import type { TimelineElement } from '@/lib/types/timeline';

interface TimelineLayoutProps {
  items: TimelineElement[];
  size?: 'sm' | 'md' | 'lg';
  iconColor?: 'primary' | 'secondary' | 'muted' | 'accent';
  customIcon?: React.ReactNode;
  animate?: boolean;
  connectorColor?: 'primary' | 'secondary' | 'muted' | 'accent';
  className?: string;
  video?: string;
  link?: string;
  videoTitle?: string;
  videoLink?: string;
  videoDescription?: string;
}

export const TimelineLayout = ({
  items,
  size = 'md',
  iconColor,
  customIcon,
  animate = true,
  connectorColor,
  className,
  video,
  link,
  videoTitle,
  videoLink,
  videoDescription,
}: TimelineLayoutProps) => {
  return (
    <Timeline size={size} className={className}>
      {[...items].reverse().map((item, index) => (
        <motion.div
          key={index}
          initial={animate ? { opacity: 0, y: 20 } : false}
          animate={animate ? { opacity: 1, y: 0 } : false}
          transition={{
            duration: 0.5,
            delay: index * 0.1,
            ease: 'easeOut',
          }}
        >
          <TimelineItem
            date={item.date}
            title={item.title}
            description={item.description}
            icon={typeof item.icon === 'function' ? item.icon() : item.icon || customIcon}
            iconColor={item.color || iconColor}
            connectorColor={item.color || connectorColor}
            showConnector={index !== items.length - 1}
            videoEmbedLink={item.videoEmbedLink}
            link={item.link}
            videoTitle={item.videoTitle}
            videoDescription={item.videoDescription}
          />
        </motion.div>
      ))}
    </Timeline>
  );
};