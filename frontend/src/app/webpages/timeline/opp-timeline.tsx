import { Timeline, TimelineItem } from "@/components/collection/webpage-elements/timeline/timeline-index";
import { Check, VideoIcon, Hourglass } from "lucide-react";
import { TimelineLayout } from "@/components/collection/webpage-elements/timeline/timeline-index";
import { TimelineStatus, TimelineElement } from "@/lib/types/timeline";

export default function TimeLineComponent() {
  const items: TimelineElement[] = [
    {
      title: 'First Idea',
      description: 'Somewhere around that time, I started creating OPP',
      date: '2024-01-01',
      icon: <Check />,
      color: 'primary',
      status: 'completed' as TimelineStatus,
      id: 1,
      link: 'https://media.ccc.de/v/dg-111'
    },
    {
      title: 'First Idea',
      description: 'Somewhere around that time, I started creating OPP',
      date: '2024-01-01',
      icon: <Check />,
      color: 'primary',
      status: 'completed' as TimelineStatus,
      id: 1,
    },
    {
      title: 'Presentation at Chaos Computer Club Berlin',
      description: 'New timeline component is now available',
      date: '2025-02-06', 
      icon: <VideoIcon />,
      color: 'secondary',
      status: 'in-progress' as TimelineStatus,
      id: 2,
      videoEmbedLink: 'https://media.ccc.de/v/dg-111/oembed',
      videoTitle: 'Chaos Computer Club Berlin',
      videoDescription: <>
        Open Source Political Intelligence - What is it and why does it matter?
        <br />
        <br />
        Hear us talk about OPP at the Chaos Computer Club Berlin
      </>,
      link: 'https://media.ccc.de/v/dg-111'
    },
    {
      title: 'We became NGI Searchers! 🎉',
      description: 'The Next Generaton Internet Project (NGI) awarded us a grant to work on OPP',
      date: '2024-09-20',
      icon: <Check />,
      color: 'accent',
      status: 'completed' as TimelineStatus,
      id: 5,
    }
  ];

  // Sort items by date before rendering
  const sortedItems = [...items].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  return (
    <div className="flex flex-col gap-4">
      {/*  Subsitute logo for "time" like icon from lucide-react   */}
      <div className="flex items-center gap-2">
        <Hourglass className="w-8 h-8" />
        <h2 className="text-2xl font-bold">Our Timeline</h2>
      </div>
      <TimelineLayout
        animate={true}  
        connectorColor="muted"
        iconColor="primary"
        items={sortedItems}
        size="md"
      />
    </div>
  );
}
