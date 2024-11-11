export interface DocLink {
    label: string;
    href: string;
    isPublished: boolean;
    description?: string;
    imageUrl?: string;
    topics?: DocTopic[];
    isHighlighted?: boolean;
    isTimeline?: boolean;
  }
  
  export interface DocTopic {
    label: string;
    href: string;
    isPublished: boolean;
    description?: string;
    imageUrl?: string;
    subtopics?: DocSubtopic[];
  }
  
  export interface DocSubtopic {
    label: string;
    href: string;
    isPublished: boolean;
    description?: string;
    imageUrl?: string;
  }
  
  export const docsLinks: DocLink[] = [
    {
      label: "About Open Politics",
      href: "/blog/about",
      isPublished: true,
      description: "Learn about the vision and mission of Open Politics.",
      isHighlighted: true,
      topics: [
        {
          label: "Vision & Mission",
          href: "/blog/posts/x",
          isPublished: true,
          description: "Explore our vision and mission in detail.",
        },
        {
          label: "Our Approach",
          href: "/blog/posts/approach",
          isPublished: true,
          description: "Learn about our approach to achieving our vision and mission.",
        },
      ],
    },
    {
      label: "Technology - Home",
      href: "/docs/tech-stack",
      isPublished: true,
      description: "Learn about the technology stack used by Open Politics.",
      imageUrl: "/images/sliver.jpeg",
      topics: [
        {
          label: "High Level Overview",
          href: "/blog/posts/tech/high-level",
          isPublished: true,
          description: "Get an overview of the technology stack.",
          imageUrl: "/images/high-level-overview.jpg",
        },
        {
          label: "Data Engine",
          href: "/docs/tech-stack/data-engineering",
          isPublished: true,
          description: "Learn about the data engine used by Open Politics.",
          imageUrl: "/images/data-engine.jpg",
        },
        {
          label: "Web Application",
          href: "/docs/tech-stack/web-app",
          isPublished: false,
          description: "Learn about the web application used by Open Politics.",
          imageUrl: "/images/web-app.jpg",
        },
      ],
    },
    {
      label: "Research & Challenges",
      href: "/docs/research-challenges",
      isPublished: true,
      description: "Learn about the research and challenges faced by Open Politics.",
      topics: [
        {
          label: "General AI & Journalism & Data Safety Note",
          href: "/docs/challenges/general-ai-journalism-data-safety-note",
          isPublished: false,
          description: "Learn about the general AI, journalism, and data safety note.",
          imageUrl: "/images/general-ai-journalism-data-safety-note.jpg",
        },
        {
          label: "Ongoing Research",
          href: "/docs/research-challenges/ongoing-research",
          isPublished: false,
          description: "Learn about the ongoing research projects.",
          imageUrl: "/images/ongoing-research.jpg",
        },
      ],
    },
    {
      label: "Get Involved",
      href: "/docs/get-involved",
      isPublished: false, // subject deactivated
      description: "Learn about how to get involved with Open Politics.",
      imageUrl: "/images/get-involved.jpg",
      topics: [
        {
          label: "Contributing",
          href: "/docs/get-involved/contributing",
          isPublished: true,
          description: "Learn about contributing to Open Politics.",
          imageUrl: "/images/contributing.jpg",
        },
        {
          label: "Developer Jour Fixe",
          href: "/docs/get-involved/developer-jour-fixe",
          isPublished: true,
          description: "Learn about the Developer Jour Fixe program.",
          imageUrl: "/images/developer-jour-fixe.jpg",
        },
      ],
    },
    {
      label: "Technical Documentation & API Reference",
      href: "https://docs.open-politics.org",
      isPublished: true,
      description: "Dive into our methods and stack",
    },
    {
      label: "We are part of the 5th cohort of NGI Search!",
      href: "#",
      isPublished: true,
      description: "NGI Search is a European Union-funded project that aims to support the development of innovative and open-source projects that address societal challenges.",
      isTimeline: true,
    },
  ];