export interface DocLink {
    label: string;
    href: string;
    isPublished: boolean;
    topics?: DocTopic[];
  }
  
  export interface DocTopic {
    label: string;
    href: string;
    isPublished: boolean;
    subtopics?: DocSubtopic[];
  }
  
  export interface DocSubtopic {
    label: string;
    href: string;
    isPublished: boolean;
  }
  
  export const docsLinks: DocLink[] = [
    {
      label: "Getting Started",
      href: "/blog/posts/1",
      isPublished: true,
      topics: [
        {
          label: "Technical",
          href: "/blog/posts/1",
          isPublished: true,
          subtopics: [
            {
              label: "SSARE",
              href: "/blog/posts/ssare",
              isPublished: true,
            },
          ],
        },
        {
          label: "Configuration",
          href: "https://github.com/jimvincentw/ssare",
          isPublished: true,
        },
      ],
    },
  ];