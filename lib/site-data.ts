/**
 * Single source of truth for every piece of content on the console.
 * Sections read from here so the copy never drifts between the page, the
 * command palette and the terminal's `ls` output.
 */

export const OPERATOR = {
  callsign: "PRAFUL CHIKHLE",
  handle: "praful",
  role: "Staff Software Engineer",
  rank: "Architect & Technical Lead",
  employer: "SailPoint Technologies",
  station: "Pune, IN",
  since: 2015,
  email: "prafulchikhle20@gmail.com",
  phone: "+91 8989118814",
  avatar: "/images/praful-profile-2026.jpg",
  /**
   * Résumé. The dossier links always render, so this must resolve to something
   * real before deploying — drop the file at public/praful-chikhle-resume.pdf,
   * or put a full https:// URL here to serve it from elsewhere (Drive, Dropbox,
   * a personal domain), in which case the links open in a new tab instead of
   * downloading. `npm run build` warns if a local file is missing.
   */
  resume: "/praful-chikhle-resume.pdf",
  brief:
    "I build the interfaces that sit between people and complicated machines — " +
    "enterprise visualisation platforms, real-time operations dashboards, and the " +
    "component systems a dozen other teams build on top of.",
  links: {
    linkedin: "https://www.linkedin.com/in/praful-chikhle-29010486/",
    instagram: "https://www.instagram.com/praful_pr17",
    medium: "https://medium.com/@prafulchikhle2050",
  },
} as const

/**
 * A local résumé path gets `download`; a hosted URL gets target=_blank instead,
 * since the download attribute is ignored cross-origin anyway.
 */
export const resumeLinkProps = () => {
  const local = OPERATOR.resume.startsWith("/")
  return local
    ? { href: OPERATOR.resume, download: "" as const }
    : { href: OPERATOR.resume, target: "_blank", rel: "noopener noreferrer" }
}

export const NAV = [
  { id: "home", label: "HOME", index: "00" },
  { id: "about", label: "PROFILE", index: "01" },
  { id: "projects", label: "MODULES", index: "02" },
  { id: "skills", label: "CAPABILITY", index: "03" },
  { id: "experience", label: "SERVICE LOG", index: "04" },
  { id: "blog", label: "TRANSMISSIONS", index: "05" },
  { id: "contact", label: "UPLINK", index: "06" },
] as const

export const VITALS = [
  { value: 50, suffix: "+", label: "Modules shipped", hex: true },
  { value: 15, suffix: "+", label: "Technologies", hex: true },
  { value: 10, suffix: "+", label: "Engineers led", hex: true },
  { value: 11, suffix: "+", label: "Years in service", hex: true },
] as const

/* -------------------------------------------------------------------------- */

export type Project = {
  id: string
  title: string
  summary: string
  details: string
  image: string
  tags: string[]
  year: string
}

export const PROJECTS: Project[] = [
  {
    id: "SSP-01",
    title: "Self Service Portal",
    summary:
      "Active Directory password management that users could drive themselves — cutting reset tickets by 70%.",
    details:
      "A robust self-service portal enabling seamless Active Directory password management. End users could reset or change AD credentials independently, reducing IT support overhead and improving productivity. Built on secure microservices with configurable event management.",
    image: "/images/SSP.jpg",
    tags: ["AngularJS", "JavaScript", "Grunt", "HTML5", "CSS3", "Java"],
    year: "2018",
  },
  {
    id: "GNG-02",
    title: "Graph NG Visualization Tool",
    summary:
      "A graph engine for dense network topologies — interactive nodes, custom layouts, WebGL-backed rendering.",
    details:
      "An advanced graph visualization library built on Angular with ECharts integration for complex data relationships and network analysis. Renders large graph structures with smooth animation, interactive nodes and customizable layout strategies for network exploration.",
    image: "/images/graph-network.jpg",
    tags: ["Angular 19", "ECharts", "Graph Theory", "WebGL"],
    year: "2023",
  },
  {
    id: "CHT-03",
    title: "Reusable Charts Library",
    summary:
      "A modular D3 charting layer built for reuse across product teams, tuned for render performance.",
    details:
      "Designed and developed a reusable charts library using D3.js, focused on delivering modular, customizable and performance-optimized data visualizations that multiple product teams could adopt without forking.",
    image: "/images/angular-dashboard.jpg",
    tags: ["Angular 13+", "D3.js", "TypeScript", "Data Viz"],
    year: "2022",
  },
  {
    id: "CMP-04",
    title: "Core Components & Boilerplate",
    summary:
      "The design system underneath everything — reusable widgets that made a dozen apps look like one product.",
    details:
      "Built a comprehensive UI component library featuring a wide range of reusable, customizable and consistent widgets to streamline frontend development and promote design uniformity across applications.",
    image: "/images/boilerplate.jpeg",
    tags: ["Angular 13+", "TypeScript", "UI Components", "Design System"],
    year: "2021",
  },
  {
    id: "CXP-05",
    title: "Content & Experience Portal",
    summary:
      "A centralized operational hub and digital experience centre for the sales organisation.",
    details:
      "Designed and delivered a centralized content management portal tailored for the sales team, serving as both an operational hub and a digital experience centre to showcase ignio's capabilities to clients.",
    image: "/images/experience.png",
    tags: ["MongoDB", "Angular", "Node.js", "Express.js", "REST API"],
    year: "2020",
  },
  {
    id: "BAT-06",
    title: "ignio Batch Analytics",
    summary:
      "Real-time job monitoring over WebSocket and MQTT — enterprise batch operations, live.",
    details:
      "Architected and developed a batch analytics dashboard within ignio, enabling real-time visibility into enterprise job processes and batch operations streamed over WebSocket and MQTT.",
    image: "/images/batch-processing.jpg",
    tags: ["Angular 2+", "WebSocket", "MQTT", "Java", "Spring Boot", "Microservices"],
    year: "2019",
  },
  {
    id: "NAV-07",
    title: "ignio Navigator",
    summary:
      "One interface over many products, composed at runtime through a microfrontend architecture.",
    details:
      "Contributed to the design and development of ignio Navigator, a centralized web application bringing together multiple ignio capabilities through a scalable microfrontend architecture built on web components.",
    image: "/images/microservices.jpg",
    tags: ["Angular 2+", "JasperSoft", "TypeScript", "Microfrontend", "Web Components"],
    year: "2019",
  },
  {
    id: "FLP-08",
    title: "2D Floorplan Editor & Viewer",
    summary:
      "A PIXI.js canvas editor for rooms, walls and floorplans with synchronized geospatial overlays.",
    details:
      "Built an interactive 2D editor using PIXI.js for room, wall and floorplan manipulation with high-performance graphics and responsive canvas interaction. Integrated OpenLayers for geospatial visualization, enabling map overlays, transformations and synchronized coordinate views.",
    image: "/images/graph-interactions.jpg",
    tags: ["Angular 11+", "TypeScript", "OpenLayers", "PixiJS", "WebGL"],
    year: "2022",
  },
  {
    id: "DSU-09",
    title: "Data Setup Application",
    summary:
      "Complex configuration made tractable — dynamic columns, batch operations, custom filtering at scale.",
    details:
      "A modular and dynamic data setup interface with advanced table features including custom filtering, batch operations and dynamic column configuration, designed to make deeply complex enterprise configuration manageable.",
    image: "/images/data-setup.jpg",
    tags: ["Angular 16+", "TypeScript", "Golang", "ECharts"],
    year: "2024",
  },
]

/* -------------------------------------------------------------------------- */

export const CAPABILITIES = [
  {
    bank: "FRONTEND",
    code: "FE",
    items: [
      { name: "Angular (all versions)", level: 85 },
      { name: "TypeScript", level: 90 },
      { name: "JavaScript", level: 80 },
      { name: "HTML / CSS", level: 80 },
      { name: "D3.js", level: 70 },
      { name: "PixiJS", level: 70 },
    ],
  },
  {
    bank: "BACKEND",
    code: "BE",
    items: [
      { name: "PostgreSQL", level: 85 },
      { name: "Node.js", level: 70 },
      { name: "Java", level: 60 },
      { name: "MongoDB", level: 60 },
      { name: "Go", level: 40 },
    ],
  },
  {
    bank: "PLATFORM",
    code: "PF",
    items: [
      { name: "Git", level: 95 },
      { name: "Docker", level: 85 },
      { name: "CI / CD", level: 85 },
      { name: "AWS", level: 80 },
    ],
  },
] as const

export const CORE_COMPETENCIES = [
  { name: "Frontend Engineering", level: 95, code: "FE-CORE" },
  { name: "Team Leadership", level: 90, code: "LEAD-OPS" },
  { name: "System Architecture", level: 85, code: "ARCH-SYS" },
  { name: "Problem Solving", level: 95, code: "SOLV-GEN" },
] as const

/* -------------------------------------------------------------------------- */

export type ServiceRecord = {
  hash: string
  company: string
  /** Omit when there is no logo asset — the log renders a monogram instead. */
  logo?: string
  position: string
  duration: string
  location: string
  type: string
  summary: string
  /** May be empty; the CHANGES block is hidden when it is. */
  achievements: string[]
  stack: string[]
  site: string
  current?: boolean
}

export const SERVICE_LOG: ServiceRecord[] = [
  {
    hash: "e5b91c4",
    company: "SailPoint Technologies",
    position: "Staff Software Engineer",
    duration: "Jul 2026 — Present",
    location: "Pune, India",
    type: "FULL-TIME",
    current: true,
    summary:
      "Staff Software Engineer at SailPoint Technologies, working in identity security and governance. Joined 20 July 2026.",
    achievements: [],
    stack: [],
    site: "https://www.sailpoint.com/",
  },
  {
    hash: "3fa70d8",
    company: "Siemens Technology and Services",
    logo: "/images/siemens.png",
    position: "Team Architect",
    duration: "Nov 2025 — Jul 2026",
    location: "Pune, India",
    type: "FULL-TIME",
    summary:
      "Promoted to Team Architect, owning architectural direction across the digital building management and visualisation platforms built by the team.",
    achievements: [],
    stack: ["Angular", "TypeScript", "OpenLayers", "PIXI.js", "ECharts"],
    site: "#",
  },
  {
    hash: "a7f3e21",
    company: "Siemens Technology and Services",
    logo: "/images/siemens.png",
    position: "Senior Software Engineer & Technical Lead",
    duration: "Sep 2021 — Nov 2025",
    location: "Pune, India",
    type: "FULL-TIME",
    summary:
      "Architected solutions for digital building management and user onboarding, combining advanced visualization with streamlined experience. Owned technical architecture decisions, code review and mentoring.",
    achievements: [
      "Led architecture and development of a comprehensive data onboarding platform, cutting onboarding time through intuitive workflows, automated validation and progress tracking.",
      "Engineered an interactive 2D floorplan editor in PIXI.js and Angular, enabling real-time editing, geospatial synchronization and transformation for digital building layouts.",
      "Built and maintained reusable visualization libraries including the Graph-ng network framework and a UI component suite, raising cross-project efficiency and consistency.",
      "Created a modular data setup interface with custom filtering, batch operations and dynamic column configuration to make complex configuration tractable.",
      "Established code review processes and architectural guidance, streamlining development and lifting code quality across teams.",
    ],
    stack: ["Angular", "TypeScript", "OpenLayers", "PIXI.js", "ECharts", "Webpack"],
    site: "#",
  },
  {
    hash: "4c19b8d",
    company: "Digitate (a TCS company)",
    logo: "/images/digitate.jpg",
    position: "Assistant Consultant",
    duration: "Apr 2021 — Aug 2021",
    location: "Pune, India",
    type: "FULL-TIME",
    summary:
      "Leading enterprise software initiatives at Digitate Product Experience, focused on digital transformation and platform modernization.",
    achievements: [
      "Led architecture and delivery of enterprise-grade Angular applications, mentoring 6–7 engineers and shipping high-quality releases on schedule.",
      "Developed and scaled a core UI component library, ensuring consistent UX, faster delivery and cross-browser compatibility across multiple applications.",
      "Delivered a secure AD-integrated self-service portal meeting enterprise security and compliance standards.",
      "Implemented test automation strategies, lifting unit coverage and enabling zero-defect deliveries within strict SLAs.",
      "Drove Agile practice and security protocol adoption including SAST/DAST, holding 100% compliance with client-mandated quality processes.",
    ],
    stack: ["Angular", "D3.js", "RxJS", "WebGL", "Chart.js", "SCSS"],
    site: "https://digitate.com",
  },
  {
    hash: "9e02a4f",
    company: "Digitate (a TCS company)",
    logo: "/images/digitate.jpg",
    position: "IT Analyst",
    duration: "Jul 2018 — Mar 2021",
    location: "Remote",
    type: "FULL-TIME",
    summary:
      "Full-stack development for enterprise applications, focused on UI platform work, self-service solutions and cross-browser compatibility.",
    achievements: [
      "Architected and delivered a self-service portal with Active Directory integration, reducing password reset tickets by 70% through secure microservices.",
      "Led full-stack delivery of enterprise applications, pairing robust backend services with modern UI frameworks.",
      "Enhanced the Core UI Platform with advanced reusable widgets — multi-step navigators, dynamic carousels — plus documentation for team adoption.",
      "Improved UI consistency across Chrome, Firefox, Safari and Edge via a browser-agnostic component architecture and unified test strategy.",
      "Promoted reusable UI patterns enabling faster, more maintainable frontend work across multiple teams.",
    ],
    stack: ["Angular", "Node.js", "MongoDB", "Socket.io", "Express.js", "JWT"],
    site: "https://digitate.com",
  },
  {
    hash: "1d7c605",
    company: "Digitate (a TCS company)",
    logo: "/images/digitate.jpg",
    position: "System Engineer",
    duration: "Jul 2017 — Jun 2018",
    location: "Pune, India",
    type: "FULL-TIME",
    summary:
      "Full-stack work spanning Angular frontend and Spring Cloud microservices, with a strong application-security focus.",
    achievements: [
      "Led the AngularJS to Angular 2 migration while architecting a reusable widget library of dynamic forms, multi-level wizards and domain components.",
      "Designed a microservices architecture on Spring Cloud with RESTful APIs, service discovery and centralized configuration management.",
      "Strengthened application security by remediating code vulnerabilities, enforcing secure coding practice and hardening input validation and error handling.",
    ],
    stack: ["Angular 2+", "TypeScript", "JavaScript", "Spring Cloud", "Bootstrap"],
    site: "https://digitate.com",
  },
  {
    hash: "0b38f12",
    company: "Tata Consultancy Services",
    logo: "/images/tcs.png",
    position: "Assistant System Engineer",
    duration: "Jun 2015 — Jun 2017",
    location: "Pune, India",
    type: "FULL-TIME",
    summary:
      "Key contributor on the ignio Navigator team working in AngularJS, including a bespoke rule engine, plus a legacy API migration from Savion to Pega.",
    achievements: [
      "Developed a custom rule engine automating complex business workflows, improving operational efficiency and reducing manual intervention.",
      "Resolved critical production issues, holding system stability and availability across core applications.",
      "Extended legacy AngularJS applications with new features and performance improvements.",
      "Migrated legacy Java APIs from the Savion workflow to the Pega platform by analysing existing logic and realigning it.",
      "Partnered with cross-functional teams on integration, testing and validation of migrated APIs.",
    ],
    stack: ["AngularJS", "Core Java", "JavaScript", "HTML", "CSS", "Bootstrap"],
    site: "https://www.tcs.com/",
  },
]

/* -------------------------------------------------------------------------- */

export const TRANSMISSIONS = [
  {
    id: "TX-004",
    title: "Design Patterns to Avoid in Angular",
    subtitle: "Modern Alternatives for Better Code",
    excerpt:
      "Angular's modern architecture makes many classic patterns unnecessary or counterproductive. Which ones to drop, and what to reach for instead.",
    date: "2025-05-12",
    readTime: "3 MIN",
    channel: "DESIGN PATTERNS",
    link: "https://medium.com/@prafulchikhle2050/design-patterns-to-avoid-in-angular-modern-alternatives-for-better-code-0b67a5f56e77",
  },
  {
    id: "TX-003",
    title: "Design Patterns: Java vs Angular/TypeScript",
    subtitle: "A Practical Comparison",
    excerpt:
      "The same pattern, two paradigms. How implementation diverges between Java and Angular/TypeScript, and why the difference matters.",
    date: "2025-05-10",
    readTime: "5 MIN",
    channel: "DESIGN PATTERNS",
    link: "https://medium.com/@prafulchikhle2050/design-patterns-java-vs-angular-typescript-a-practical-comparison-907e3c66ad45",
  },
  {
    id: "TX-002",
    title: "Why Complex Calculations Belong on the Backend",
    subtitle: "A Comprehensive Guide",
    excerpt:
      "Where computation lives is an architectural decision, not a convenience one. The case for moving heavy work off the UI thread and off the client entirely.",
    date: "2025-05-10",
    readTime: "2 MIN",
    channel: "ARCHITECTURE",
    link: "https://medium.com/@prafulchikhle2050/why-complex-calculations-belong-on-the-backend-a-comprehensive-guide-d255e65cc70a",
  },
  {
    id: "TX-001",
    title: "Web Workers Aren't Magic",
    subtitle: "Understanding the browser's concurrent request limits",
    excerpt:
      "Offloading to a worker does not buy you more sockets. What actually bounds concurrency in Angular applications, and how to work with it.",
    date: "2025-05-01",
    readTime: "2 MIN",
    channel: "PERFORMANCE",
    link: "https://medium.com/@prafulchikhle2050/web-workers-arent-magic-understanding-browser-s-concurrent-request-limits-in-angular-applications-463cbf8d8386",
  },
] as const
