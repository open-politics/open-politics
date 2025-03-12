import { Timeline, TimelineItem } from "@/components/collection/webpage-elements/timeline";
import { Check, VideoIcon } from "lucide-react";
import { TimelineLayout } from "@/components/collection/webpage-elements/timeline";
import { TimelineStatus } from "@/lib/types/timeline";

export default function TimeLineComponent() {
  const items = [
    {
      color: undefined,
      date: '2024-01-01',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      icon: <Check />,
      id: 1,
      status: 'completed' as TimelineStatus,
      title: 'First event'
    },
    {
      color: undefined,
      date: '2025-02-06',
      description: 'New timeline component is now available',
      icon: <VideoIcon />,
      id: 2,
      status: 'in-progress' as TimelineStatus,
      title: 'Presentation at Chaos Computer Club Berlin'
      
    },
    {
      color: undefined,
      date: '2025-02-07',
      description: 'Working on documentation',
      icon: <Check />,
      id: 3,
      status: 'in-progress' as TimelineStatus,
      title: 'In Progress'
    },
    {
      color: undefined,
      date: '2024-01-03',
      description: 'Planning future updates',
      icon: <Check />,
      id: 4,
      status: 'pending' as TimelineStatus,
      title: 'Upcoming'
    },
  ];

  return (
    <div className="flex flex-col gap-4">
    <TimelineLayout
    animate={true}  
    connectorColor="primary"
    iconColor="primary"
    items={items}
    size="md"
    />
    <iframe width="1024" height="576" src="https://media.ccc.de/v/dg-111/oembed" frameBorder="0" allowFullScreen></iframe>
    </div>
  );
}
