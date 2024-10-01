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
      label: "About Open Politics",
      href: "/blog/about",
      isPublished: true,
      topics: [
        {
          label: "Vision & Mission",
          href: "/blog/posts/x",
          isPublished: true,
        },
        {
          label: "Our Approach",
          href: "/blog/posts/approach",
          isPublished: false,
        },
      ],
    },
    {
      label: "Technology - Home",
      href: "/docs/tech-stack",
      isPublished: true,
      topics: [
        {
          label: "High Level Overview",
          href: "/blog/posts/tech/high-level",
          isPublished: true,
        },
        {
          label: "Data Engine",
          href: "/docs/tech-stack/data-engineering",
          isPublished: true,
        },
        {
          label: "Web Application",
          href: "/docs/tech-stack/web-app",
          isPublished: false,
        },
      ],
    },
    {
      label: "Research & Challenges",
      href: "/docs/research-challenges",
      isPublished: true,
      topics: [
        {
          label: "General AI & Journalism & Data Safety Note",
          href: "/docs/challenges/general-ai-journalism-data-safety-note",
          isPublished: true,
        },
        {
          label: "Ongoing Research",
          href: "/docs/research-challenges/ongoing-research",
          isPublished: true,
        },
      ],
    },
    {
      label: "Get Involved",
      href: "/docs/get-involved",
      isPublished: true,
      topics: [
        {
          label: "Contributing",
          href: "/docs/get-involved/contributing",
          isPublished: true,
        },
        {
          label: "Developer Jour Fixe",
          href: "/docs/get-involved/developer-jour-fixe",
          isPublished: true,
        },
      ],
    },
    {
      label: "API Reference",
      href: "/docs/",
      isPublished: true,
    },
  ];