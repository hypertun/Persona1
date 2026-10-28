/**
 * Single source of truth for site content.
 *
 * IMPORTANT: All experience claims, metrics, project details and tech stacks
 * are extracted strictly from the resume:
 * "48451 – Senior Consultant Developer – Ivan Yeo.docx.pdf" (Thoughtworks).
 * Do not add claims that are not backed by that document.
 */

// Public contact address shown on the site (overridable via VITE_CONTACT_EMAIL env).
// TODO: replace the default with the real inbox that receives consultation inquiries.
export const CONTACT_EMAIL =
  import.meta.env.VITE_CONTACT_EMAIL || 'hello@ivanbuilds.dev'

export const profile = {
  name: 'Ivan Yeo',
  personaHandle: '@IvanBuilds',
  role: 'Senior Consultant Developer',
  location: 'Singapore',
  summary:
    'Over five years of professional experience building scalable, cloud-native systems while bridging complex technical architecture with core business objectives. I combine strategic leadership with hands-on expertise in Golang, React, and cloud infrastructure on AWS and GCP — pioneering AI-augmented workflows and intelligent automation to optimize engineering velocity and consistently deliver high-impact, measurable results.',
  education:
    'B.Eng. (Hons), Systems & Industrial Engineering, Minor in Computer Science — National University of Singapore (2016–2020); exchange semester at the Australian National University.',
  certifications: [
    'AWS Certified Developer – Associate',
    'AWS Security Clinic Certified',
    'Certified Vaadin 24 Developer',
    'Building HTTP APIs with Spring',
    'Introduction to NoSQL Databases',
    'Advanced React',
    'Introduction to Generative AI',
    'Google Cloud Architect Specialization & Infrastructure Series',
    'Supervised Machine Learning: Regression and Classification'
  ],
  inProgress:
    'Currently levelling up (targets on resume): AWS Certified Solutions Architect – Associate (Sep 2026), AI Engineer Core Track — LLM Engineering, RAG, QLoRA, Agents (Jul 2026), CompTIA Security+ (Jun 2026), Java Multithreading & Performance Optimization (Jun 2026), Software Architecture of Modern Large-Scale Systems (Jun 2026).'
}

export const metrics = [
  { value: '5+', label: 'years of professional experience' },
  { value: '80%', label: 'efficiency gain in manual SAP order posting' },
  { value: '60%', label: 'of manual test cycles eliminated' },
  { value: '100%', label: 'data integrity on automated migrations' }
]

export const services = [
  {
    icon: 'cloud',
    title: 'Cloud Architecture (AWS & GCP)',
    description:
      'End-to-end infrastructure design on the full AWS suite — S3, EC2, CloudFront, DynamoDB, RDS, API Gateway, CloudWatch — plus serverless GCP with Cloud Run and Cloud Scheduler. AWS Certified Developer – Associate.',
    tags: ['AWS', 'GCP', 'Terraform', 'Kubernetes', 'CI/CD']
  },
  {
    icon: 'bolt',
    title: 'High-Performance Golang Backends',
    description:
      'Concurrency-first Golang services engineered for high-throughput order and delivery systems — subscription and chain-of-responsibility patterns, race-condition resolution, and Python Locust load testing baked in.',
    tags: ['Golang', 'Concurrency', 'Microservices', 'Locust', 'REST APIs']
  },
  {
    icon: 'layout',
    title: 'Frontend Engineering (React + TypeScript)',
    description:
      'High-performance React/TypeScript interfaces — from enterprise portals built from scratch to modernized frontends that interface seamlessly with new-generation APIs.',
    tags: ['React', 'TypeScript', 'Node.js', 'Cocos Creator']
  },
  {
    icon: 'sparkles',
    title: 'AI-Augmented Engineering Velocity',
    description:
      'Pioneering AI-augmented workflows and intelligent automation that compress delivery cycles — backed by open-source LLM tooling like WC2OpenAPI and EasyAnalytics.',
    tags: ['LLM Engineering', 'RAG', 'Agents', 'Automation']
  },
  {
    icon: 'shield',
    title: 'QA Automation & Reliability',
    description:
      'Automation frameworks with the Builder pattern and mock servers that eliminated 60% of manual test cycles at Shopee — integration, smoke and data-pipeline testing (Kafka, HBase) across complex backend APIs.',
    tags: ['Kafka', 'HBase', 'Java', 'Python', 'Linux']
  }
]

export const projects = [
  {
    id: 'happy-hour-games',
    company: 'Happy Hour Games',
    role: 'FullStack Software Developer',
    period: 'May 2025 – Jun 2026',
    location: 'Singapore',
    category: 'Full-Stack Product',
    domain: 'Gaming',
    title: 'Enterprise Portal & “Hexaplus/TravelSort” Mobile Game',
    summary:
      'Architected an internal enterprise portal from scratch — a high-performance React/TypeScript frontend over a robust Golang backend — while also spearheading an end-to-end mobile game shipped to mobile platforms.',
    highlights: [
      'Designed the high-performance React/TypeScript frontend and robust Golang backend from zero',
      'Managed end-to-end AWS infrastructure: S3, EC2, CloudFront, DynamoDB, RDS, API Gateway',
      'Implemented server-side concurrency optimizations to reduce latency and enhance throughput',
      'Built robust CI/CD pipelines alongside the platform',
      'Spearheaded “Hexaplus/TravelSort” (TypeScript, Cocos Creator): physics, UI integration and mobile deployment — full lifecycle ownership'
    ],
    stack: [
      'Golang', 'React', 'TypeScript', 'AWS S3', 'EC2', 'CloudFront',
      'DynamoDB', 'RDS', 'API Gateway', 'CloudWatch', 'CI/CD', 'Cocos Creator'
    ]
  },
  {
    id: 'ntuc-ne-digital',
    company: 'NTUC NE Digital',
    role: 'Senior Software Developer · Acting Team Lead, Order Management',
    period: 'Oct 2021 – May 2025',
    location: 'Singapore',
    category: 'Cloud & Microservices',
    domain: 'Order Management & Logistics',
    title: 'Transport Management System & High-Concurrency Email Automation',
    summary:
      'Owned end-to-end infrastructure development for Order Management — steering Agile sprints and mentoring backend engineers — including a Transport Management System replacement and an email automation system that cut manual SAP order posting effort by 80%.',
    highlights: [
      'Spearheaded the Transport Management System replacement using XML diagrams, ERDs and state mappings to meet logistics requirements',
      'Provisioned PostgresDB via Terraform; built resilient Golang microservices using Subscription and Chain of Responsibility patterns for third-party integration',
      'Engineered a high-concurrency Email Automation System on GCP Cloud Run — an 80% efficiency gain in manual SAP order posting via Cloud Scheduler',
      'Ensured performance integrity with rigorous Python Locust load testing, resolving concurrency and race conditions',
      'Modernized the React frontend to interface seamlessly with the new APIs'
    ],
    stack: [
      'Golang', 'React', 'PostgresDB', 'Terraform', 'GCP Cloud Run',
      'Cloud Scheduler', 'Python (Locust)', 'REST APIs', 'Design Patterns', 'XML', 'SAP'
    ],
    result: '80% efficiency gain in manual SAP order posting'
  },
  {
    id: 'shopee',
    company: 'Shopee',
    role: 'QA Engineer',
    period: 'May 2020 – Oct 2021',
    location: 'Singapore',
    category: 'QA Automation',
    domain: 'E-commerce',
    title: 'QA Automation Framework',
    summary:
      'Led a QA automation initiative that eliminated 60% of manual test cycles — designing a framework with the Builder pattern and mock servers, and leading a team of three across complex backend APIs.',
    highlights: [
      'Designed the automation framework with the Builder pattern and mock servers — eliminating 60% of manual test cycles',
      'Conducted end-to-end API evaluations and built data-pipeline testing scripts for Kafka and HBase, ensuring high-quality, low-latency transmission',
      'Managed a team of three implementing comprehensive integration and smoke testing systems'
    ],
    stack: ['Kafka', 'HBase', 'Java', 'Python', 'REST APIs', 'Design Patterns', 'Linux'],
    result: '60% of manual test cycles eliminated'
  },
  {
    id: 'ep-one',
    company: 'EP One',
    role: 'Backend Developer (Contract)',
    period: '2021',
    location: 'Singapore',
    category: 'Platform Build',
    domain: 'HR / Marketplace',
    title: 'Domestic Helper–Employer Matching Platform',
    summary:
      'Developed a digital platform for domestic helper–employer matching — profile management, inquiry flows, and Golang-automated database migrations with 100% data integrity.',
    highlights: [
      'Built profile management and inquiry flows for helper–employer matching',
      'Delivered the corporate website on React/Firebase (DB, Storage, Analytics)',
      'Implemented Golang automation for database migrations — 100% data integrity'
    ],
    stack: ['Golang', 'React', 'Firebase', 'REST APIs', 'Java (Vaadin)'],
    result: '100% data integrity on migrations'
  },
  {
    id: 'infineon',
    company: 'Infineon',
    role: 'Line Engineer Intern',
    period: '2019 – 2020',
    location: 'Singapore',
    category: 'Data & Simulation',
    domain: 'Semiconductor / Manufacturing',
    title: 'Digital Twin for Wafer Testing Lines',
    summary:
      'Built a Python-based digital twin simulating wafer testing line efficiency without operational disruption — automating bottleneck analysis and significantly improving throughput analysis.',
    highlights: [
      'Python-based digital twin to simulate wafer testing line efficiency with zero operational disruption',
      'Automated bottleneck analysis using VBA, Tableau and NPL/Constraint programming'
    ],
    stack: ['Python', 'VBA', 'Tableau', 'NPL / Constraint Programming']
  }
]

export const openSource = [
  {
    name: 'WC2OpenAPI',
    url: 'https://github.com/hypertun/WC2OpenAPI',
    description: 'Go middleware converting AI webchat to OpenAI-compatible API endpoints.'
  },
  {
    name: 'EasyAnalytics',
    url: 'https://github.com/hypertun/EasyAnalytics',
    description: 'Java-based CLI SQL assistant for natural-language queries, with schema-aware prompting and caching.'
  },
  {
    name: 'AEO Optim',
    url: 'https://aeooptim.ivangemini930.workers.dev/',
    description: 'Tool for AEO/GEO analysis.'
  }
]

export const skillGroups = [
  {
    title: 'Programming',
    skills: ['Golang', 'Java', 'Python', 'C++', 'TypeScript', 'JavaScript (React, Node.js)', 'Scala', 'Haskell', 'PHP', 'VBA', 'NPL']
  },
  {
    title: 'Java Competencies',
    skills: ['Core Java Specialization', 'Spring Boot', 'Spring Cloud', 'Vaadin 24', 'Maven', 'Multithreading', 'Concurrency & Performance Optimization', 'Parallel Programming', 'TDD', 'XML']
  },
  {
    title: 'Cloud & DevOps',
    skills: ['AWS — Full Suite (S3, EC2, CloudFront, DynamoDB, RDS, API Gateway, CloudWatch)', 'GCP — Cloud Run, Cloud Scheduler', 'Kubernetes', 'Terraform', 'Jenkins', 'GitHub Actions', 'Docker', 'Podman', 'CI/CD']
  },
  {
    title: 'Distributed Systems & Data Streams',
    skills: ['Apache Kafka', 'HBase', 'Hive', 'REST APIs', 'Microservices Architecture', 'Design Patterns (Builder)', 'Mock Servers', 'SAP Integration', 'XML']
  },
  {
    title: 'Databases',
    skills: ['PostgresDB', 'MySQL', 'HBase', 'Hive', 'DynamoDB', 'RDS']
  },
  {
    title: 'Methodologies',
    skills: ['Agile', 'Scrum', 'TDD', 'Trunk-Based Development', 'Lean', 'Pair Programming']
  },
  {
    title: 'Tools & Analytics',
    skills: ['Python (Locust)', 'Linux', 'Tableau', 'Constraint Programming', 'Excel/VBA']
  },
  {
    title: 'Domains',
    skills: ['Gaming', 'E-commerce', 'Order Management & Delivery', 'Transport Management', 'Supply Chain / Logistics', 'Semiconductor / Manufacturing', 'Insurance', 'Customer Service', 'Finance / Stock Market Trading']
  }
]

export const inquiryTypes = [
  'Cloud Architecture (AWS / GCP)',
  'High-Performance Golang Backend',
  'Frontend Engineering (React + TypeScript)',
  'QA Automation & Reliability',
  'AI-Augmented Workflows',
  'Other / Not sure yet'
]
