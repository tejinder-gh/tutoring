import {
  EnrollmentStatus,
  LeadSource,
  LeadStatus,
  Level,
  NotificationType,
  PrismaClient
} from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

// ===========================================================================
// DATA SOURCE
// ===========================================================================
const COURSES_DATA: Record<string, any> = {
  "introductory": {
    "popular": "Popular",
    "title": "Introductory Module",
    "role": "The Executor Track",
    "description": "Enable students to efficiently execute well-defined programming tasks under guidance, while establishing foundational Computer Science knowledge, structured collaboration habits, and reliable persistence skills.",
    "courseLength": "3 months",
    "modules": [
      {
        "code": "M1",
        "title": "Web Foundations & Git",
        "tech": "Semantic HTML5, CSS3 (Flexbox/Grid), Responsive Design, ARIA, Git Workflow",
        "outcome": "Personal Portfolio Website (fully responsive, accessible)",
        "details": "Master foundational web technologies and version control. Build a professional portfolio demonstrating semantic structure and responsive design."
      },
      {
        "code": "M2",
        "title": "Core JavaScript & Frontend",
        "tech": "JavaScript ES6+ (scope, closures), DOM Manipulation, Promises, Async/Await, Big-O Notation",
        "outcome": "API Integration Project (external read-only API)",
        "details": "Deep dive into JavaScript fundamentals and asynchronous programming. Successfully integrate external APIs into dynamic web applications."
      },
      {
        "code": "M2.5",
        "title": "Interview Fundamentals (DSA)",
        "tech": "Data Structures (Array, LinkedList, Stack, Queue, HashMap, Tree, Graph), Algorithms (Two Pointers, Sliding Window, BFS/DFS, Binary Search)",
        "outcome": "Weekly: 2 LeetCode Easy + 1 Medium. Biweekly: 45-min Mock Technical Screen",
        "details": "Master foundational algorithms and data structures essential for technical interviews. Regular timed assessments build problem-solving speed."
      },
      {
        "code": "M3",
        "title": "React Library Immersion",
        "tech": "React JSX, Functional Components, Hooks (useState, useEffect), Client-side Routing, UI Libraries, Linting, Component Testing",
        "outcome": "Component Library with Clean Git History",
        "details": "Build production-quality React applications following modern best practices. Implement robust component architecture with proper testing."
      },
      {
        "code": "M4",
        "title": "Backend, Persistence & Production Basics",
        "tech": "Node.js/Express, CRUD APIs, SQLite, Production Debugging (Logs, Monitoring), DataDog/Sentry Basics",
        "outcome": "Deployed API with Logs & Cross-Browser Testing",
        "details": "Create backend services with proper persistence and production-ready monitoring. Deploy to real hosting environments."
      }
    ],
    "softSkills": {
      "focus": "Curiosity & Adaptability, Team Communication, Learning from Guidance",
      "assessment": "Weekly PR Review Exercises (Scored Rubric), Daily Standups, Constructive Feedback Receptiveness",
      "details": "Develop essential collaboration skills through structured peer reviews and daily communication rituals."
    },
    "capstone": "Personal Portfolio Website + API Integration Project with Production Deployment"
  },
  "problemSolver": {
    "title": "Problem-Solver",
    "role": "The Independent Problem-Solver Track",
    "description": "Produce autonomous full-stack specialists capable of independent execution, mastering system integration, robust quality assurance, and incident management.",
    "courseLength": "8 months",
    "modules": [
      {
        "code": "M5",
        "title": "Advanced Frontend Engineering",
        "tech": "Advanced React Hooks (useReducer, Custom Hooks), State Management (Redux/Zustand), TypeScript (Mandatory), Performance Optimization (Memoization, Throttling, Core Web Vitals)",
        "outcome": "Performance-Optimized TypeScript Application",
        "details": "Master complex state management and performance optimization. Mandatory TypeScript adoption across all client-side code."
      },
      {
        "code": "M6",
        "title": "Robust API Architecture & Management",
        "tech": "Node.js/Express with TypeScript, RESTful API Design, Authentication (JWT), Authorization, API Versioning, Backwards Compatibility, Migration Strategies",
        "outcome": "Secure, Versioned REST API",
        "details": "Design production-grade APIs with proper authentication, versioning, and migration paths for long-term maintainability."
      },
      {
        "code": "M7",
        "title": "Data Persistence, Modeling, and Integration",
        "tech": "Database Architecture (Logical & Physical Modeling), SQL (ORMs, Transactions), NoSQL (MongoDB), Database Scalability (Connection Pooling)",
        "outcome": "Complex, Well-Modeled Database Schema + External API Integration",
        "details": "Architect robust data models for both relational and non-relational databases. Integrate multiple complex external services."
      },
      {
        "code": "M8",
        "title": "Production Reliability & Incident Response",
        "tech": "Test-Driven Development (TDD), Critical Path Testing (Auth, Payment, Data Loss), 10+ E2E Integration Tests, Structured Logging, Monitoring/Alerting (SLOs), Error Handling, Graceful Degradation",
        "outcome": "Chaos Engineering Simulation (survive 3 random failures) + Incident Response Simulation (RCA/Post-Mortem)",
        "details": "Build resilient systems with comprehensive testing. Practice debugging under pressure through simulated production incidents."
      }
    ],
    "softSkills": {
      "focus": "Prioritization & Time Management, Advanced Creative Problem-Solving, Emotional Intelligence (EQ)",
      "assessment": "Leading PR Review Sections (Scored Rubric), Managing Extended Scope, Technical Blog Post (Complex Concept)",
      "details": "Navigate complex trade-offs and manage long-term projects. Lead code reviews focusing on architecture and maintainability."
    },
    "capstone": "Robust Full-Stack Service with Critical Path Test Coverage + Complex External Service Integration"
  },
  "ai": {
    "popular": "Popular",
    "title": "AI Engineer Career Preparation",
    "role": "The AI-First Systems Builder Track",
    "description": "Transition engineers from traditional full-stack development into production-grade AI system builders capable of designing, evaluating, and scaling LLM-powered systems with clear cost, reliability, and safety guarantees.",
    "courseLength": "6 months",
    "modules": [
      {
        "code": "AI-M1",
        "title": "Applied AI Fundamentals for Engineers",
        "tech": "ML vs DL vs LLMs, Tokens, Context Windows, Embeddings, Inference vs Training, Latency & Cost Models",
        "outcome": "AI Decision Matrix: When to Use (and Not Use) AI",
        "details": "Develop first-principles understanding of AI capabilities, limits, and trade-offs. Engineers learn to justify AI adoption using cost, latency, and accuracy constraints."
      },
      {
        "code": "AI-M2",
        "title": "LLM APIs & Prompt Engineering (Production Grade)",
        "tech": "OpenAI APIs, Prompt Patterns, Few-shot Learning, JSON Mode, Function Calling, Prompt Guardrails",
        "outcome": "Versioned Prompt Library with Automated Evaluations",
        "details": "Design deterministic, testable prompts treated as production artifacts with regression testing."
      },
      {
        "code": "AI-M3",
        "title": "Embeddings, Vector Databases & Semantic Retrieval",
        "tech": "Embeddings, Chunking Strategies, Cosine Similarity, Vector Databases (FAISS/Pinecone), Hybrid Search",
        "outcome": "Semantic Search Engine over Real-World Dataset",
        "details": "Build retrieval systems that outperform keyword search and minimize hallucinations."
      },
      {
        "code": "AI-M4",
        "title": "Retrieval-Augmented Generation (RAG) Systems",
        "tech": "Advanced Chunking, Re-ranking, Context Assembly, Citation Injection, Failure Modes",
        "outcome": "Enterprise-Grade RAG System with Accuracy Benchmarks",
        "details": "Design hallucination-resistant RAG pipelines with measurable quality guarantees."
      },
      {
        "code": "AI-M5",
        "title": "Agentic Workflows & Tool-Using Systems",
        "tech": "Tool Calling, Planning vs Reactive Agents, Memory, Agent Graphs, Multi-Agent Coordination",
        "outcome": "Autonomous Agent Solving a Real Business Workflow",
        "details": "Build agents that reason, act, recover from failure, and respect execution boundaries."
      },
      {
        "code": "AI-M6",
        "title": "AI Evaluation, Safety & Reliability",
        "tech": "Golden Datasets, Offline/Online Evals, Prompt Regression, Bias & Toxicity Checks, Guardrails",
        "outcome": "Automated AI Evaluation & Monitoring Pipeline",
        "details": "Treat AI like production software: measured, tested, and continuously monitored."
      },
      {
        "code": "AI-M7",
        "title": "AI System Design & Cost Optimization",
        "tech": "Latency Budgets, Streaming Inference, Caching, Rate Limits, Cost Control, Failure Scenarios",
        "outcome": "AI System Design Document (LLM at Scale)",
        "details": "Architect AI systems that survive real traffic, real budgets, and real failure conditions."
      }
    ],
    "softSkills": {
      "focus": "AI Trade-off Reasoning, Risk Communication, Explaining Uncertainty to Stakeholders",
      "assessment": "AI Design Reviews, Failure Post-Mortems, Cost Justification Documents",
      "details": "Engineers must clearly articulate why an AI system is safe, reliable, and economically viable."
    },
    "capstone": "Production AI System: RAG or Agent-Based Platform with Evaluations, Cost Controls, and Reliability Guarantees"
  },
  "systemDesign": {
    "title": "System Design and Architecture Decision Making",
    "role": "The Architect Track",
    "description": "Develop strategic architects and leaders capable of translating ambiguous business requirements into actionable system architectures and driving organizational impact through influence.",
    "courseLength": "8 months",
    "modules": [
      {
        "code": "M9",
        "title": "System Design Fundamentals",
        "tech": "Distributed Systems (Horizontal Scaling, Load Balancing), CAP Theorem, Messaging Systems (Kafka), Advanced Caching (Consistent Hashing), Case Studies (Netflix, Uber Architecture)",
        "outcome": "Comprehensive System Design Document (SDD)",
        "details": "Master distributed systems architecture. Analyze real-world system designs and create comprehensive architectural documentation."
      },
      {
        "code": "M10",
        "title": "Cloud, DevOps, and Observability",
        "tech": "Cloud Fundamentals (AWS: IAM, Compute, Storage), Serverless Computing, Advanced CI/CD Pipelines, Infrastructure as Code (IaC), Container Orchestration (Kubernetes)",
        "outcome": "Full DevOps Implementation Diagram (CI/CD Pipeline + IaC Structure)",
        "details": "Implement production-grade cloud infrastructure. Design and document complete DevOps workflows."
      },
      {
        "code": "M11",
        "title": "Advanced Security and Performance",
        "tech": "Multi-Factor Authentication (MFA), Content Security Policy (CSP), Security Risk Management, Performance Auditing, Core Web Vitals, Optimization Techniques",
        "outcome": "Security Risk Mitigation Plan + Performance Audit",
        "details": "Deep dive into security hardening and performance optimization. Make autonomous decisions weighing complex trade-offs."
      },
      {
        "code": "M12",
        "title": "Executive Leadership and Architectural Defense",
        "tech": "Technical Debt Management, Quality Standards, Mentorship & Constructive Feedback, Custom API Design, Backend Framework Architecture",
        "outcome": "Architectural Defense before CTO Panel (2/3 Approval Required)",
        "details": "Present architecture to 3 real CTOs/Staff Engineers. Document feedback, iterate, and defend until approval—demonstrating organizational influence."
      }
    ],
    "softSkills": {
      "focus": "Analytical Thinking, Stakeholder Communication, Decision-Making & Risk Mitigation, Mentorship & Conflict Resolution",
      "assessment": "Technical RFC Writing, Stakeholder Influence Simulations, CTO Panel Defense, Leading Team Code Reviews",
      "details": "Translate technical decisions for non-technical executives. Guide junior engineers and resolve team conflicts effectively."
    },
    "capstone": "Architectural Review and Defense: Present to CTO Panel, Iterate Based on Feedback, Achieve 2/3 Approval"
  },
  "internetArchitect": {
    "title": "App interaction with internet's Architect",
    "role": "The Systems Architect & Technical Lead Track",
    "description": "Transform senior engineers into organizational force multipliers who architect cross-team systems, establish engineering standards, and solve ambiguous problems spanning organizational boundaries while maintaining hands-on technical excellence.",
    "courseLength": "4 months",
    "modules": [
      {
        "code": "M13",
        "title": "Advanced System Architecture & Database Mastery",
        "tech": "PostgreSQL (Advanced Indexing, Query Optimization, Partitioning, Replication), MongoDB (Sharding, Aggregation Pipelines, Change Streams), Redis (Pub/Sub, Distributed Locks), Database Migration Strategies, Read/Write Splitting, CQRS Pattern",
        "outcome": "Multi-Database Architecture Design (SQL + NoSQL + Cache Layer) with Migration Plan",
        "details": "Master production-grade database architecture. Design polyglot persistence strategies choosing optimal storage for each use case. Implement zero-downtime migrations at scale."
      },
      {
        "code": "M14",
        "title": "Platform Engineering & Developer Productivity",
        "tech": "Internal Developer Platforms (Backstage.io), Service Mesh Architecture, API Gateway (Kong/NGINX), GraphQL Federation, Monorepo Management (Nx/Turborepo), Component Libraries (Storybook), Design Systems",
        "outcome": "Internal Developer Platform Proposal + Component Library with 20+ Components",
        "details": "Build infrastructure that scales team productivity. Design self-service platforms reducing deployment friction by 50%+. Establish golden paths for common workflows."
      },
      {
        "code": "M15",
        "title": "Computer Science Fundamentals Deep Dive",
        "tech": "OSI Model & Network Protocols (TCP/IP, HTTP/2, WebSockets), Operating Systems (Process Management, Memory Management, I/O), Object-Oriented Design Patterns (SOLID, GoF Patterns), Functional Programming Principles, Concurrency Models (Event Loop, Worker Threads)",
        "outcome": "Technical Deep-Dive Series: 5 Blog Posts Explaining Complex CS Concepts",
        "details": "Master theoretical foundations underlying modern web development. Understand why technologies work, not just how to use them. Debug production issues at protocol and OS level."
      },
      {
        "code": "M15.5",
        "title": "Advanced DSA & Interview Mastery",
        "tech": "Advanced Algorithms (Dynamic Programming, Greedy, Backtracking, Advanced Graph Algorithms), System Design Patterns, Behavioral Interview Frameworks (STAR Method), Salary Negotiation",
        "outcome": "Weekly: 3 LeetCode Medium + 1 Hard. Biweekly: 90-min System Design Mock + Behavioral Mock",
        "details": "Grind to FAANG-level interview competency. 100+ problems across all patterns. Mock interviews with actual Staff+ engineers from top companies."
      },
      {
        "code": "M16",
        "title": "Technical Leadership & Cross-Team Collaboration",
        "tech": "Architectural Decision Records (ADRs), RFC Process, Technical Roadmapping, Dependency Mapping, Conway's Law Application, Engineering Metrics (DORA, SPACE), FinOps & Cost Optimization",
        "outcome": "Multi-Team RFC (3+ teams) + Technical Roadmap (6-month) + Cost Optimization Report",
        "details": "Drive technical strategy across organizational boundaries. Build consensus through written proposals. Measure and communicate engineering impact to executives."
      }
    ],
    "softSkills": {
      "focus": "Strategic Thinking, Cross-Team Collaboration, Technical Writing, Influencing Without Authority, Teaching & Mentorship at Scale",
      "assessment": "Leading Multi-Team Design Reviews, Publishing Technical RFCs, Mentoring 3+ Junior Engineers Simultaneously, Technical Blog Post Series (5+ posts)",
      "details": "Operate beyond single team scope. Influence technical direction through persuasion and data. Multiply impact through mentorship and documentation."
    },
    "capstone": "Cross-Team Platform Initiative: Design, Build, and Deploy Internal Tool Used by 3+ Engineering Teams + Published Technical Documentation"
  },
  "deepDive": {
    "title": "Explore the unexplored territories of Computer Science",
    "role": "The Technical Visionary & Standards Bearer Track",
    "description": "Cultivate principal-level engineers who define organizational technical direction, establish engineering culture and standards, own critical infrastructure, and solve the hardest technical problems while maintaining deep hands-on expertise.",
    "courseLength": "6 months",
    "modules": [
      {
        "code": "M17",
        "title": "Advanced Distributed Systems & Real-Time Architecture",
        "tech": "Event-Driven Architecture (Kafka, RabbitMQ), Event Sourcing & CQRS, Saga Pattern, Distributed Transactions, WebSockets at Scale, Server-Sent Events (SSE), Real-Time Collaboration (Operational Transforms, CRDTs)",
        "outcome": "Real-Time Collaborative Application with Event Sourcing (Think: Google Docs-like)",
        "details": "Build systems handling millions of concurrent connections. Master eventual consistency and conflict resolution. Design event-driven architectures for complex business workflows."
      },
      {
        "code": "M18",
        "title": "SDLC Mastery & Engineering Excellence",
        "tech": "Software Development Lifecycle Models (Agile, Scrum, Kanban), Trunk-Based Development, Feature Flags, Blue-Green Deployments, Canary Releases, Chaos Engineering (Chaos Monkey), Site Reliability Engineering (SRE), Incident Management, Blameless Post-Mortems",
        "outcome": "Complete SDLC Documentation + Chaos Engineering Test Suite + Incident Response Playbook",
        "details": "Design end-to-end development processes optimizing for velocity and quality. Implement advanced deployment strategies. Build organizational resilience through chaos testing."
      },
      {
        "code": "M19",
        "title": "Advanced Performance Engineering & Optimization",
        "tech": "React Performance (Concurrent Mode, Suspense, React Server Components), Node.js Performance (Profiling, Memory Leaks, Event Loop Optimization), Database Query Optimization, CDN Strategies, Edge Computing (Cloudflare Workers, Lambda@Edge), Advanced Caching Strategies",
        "outcome": "Performance Optimization Case Study: Improve Application Performance by 5x (Documented)",
        "details": "Master performance at every layer of the stack. Profile and optimize React rendering, Node.js execution, database queries, and network delivery. Achieve sub-second page loads globally."
      },
      {
        "code": "M19.5",
        "title": "Expert-Level DSA & System Design",
        "tech": "Competitive Programming Techniques, Advanced System Design (Design Instagram, Design Uber, Design Netflix), Scalability Patterns, Trade-off Analysis, Back-of-Envelope Calculations, Component Design",
        "outcome": "Weekly: 2 LeetCode Hard + 1 System Design. Monthly: Full-Day Interview Simulation (4 rounds)",
        "details": "Achieve top 5% problem-solving ability. Design systems handling billions of requests. Practice until system design becomes second nature."
      },
      {
        "code": "M20",
        "title": "Technical Vision & Organizational Impact",
        "tech": "Multi-Year Technical Strategy, Build vs Buy vs Partner Analysis, Technology Evaluation Frameworks, Engineering Hiring & Interviewing, Technical Due Diligence, Open Source Strategy, Developer Relations",
        "outcome": "3-Year Technical Vision Document + Technology Evaluation Framework + Hiring Plan",
        "details": "Define multi-year technical direction balancing innovation with pragmatism. Build and scale engineering organizations. Establish engineering culture and standards."
      }
    ],
    "softSkills": {
      "focus": "Visionary Thinking, Executive Communication, Building Engineering Culture, Conflict Resolution at Scale, Technical Evangelism, Industry Thought Leadership",
      "assessment": "Quarterly Technical Strategy Presentations, Conference Speaking, Open Source Contributions, Hiring Committee Leadership, Engineering Culture Initiatives",
      "details": "Operate at executive level influencing company-wide technical decisions. Build external reputation attracting top talent. Shape industry direction through thought leadership."
    },
    "capstone": "Technical Vision Defense: Present 3-Year Technical Roadmap to Executive Team (CEO/CTO/CPO) + Implement First Major Initiative with Measurable Business Impact"
  },
  "management": {
    "popular": "Popular",
    "title": "Engineering Management Career Preparation",
    "role": "The Technical Leader & People Manager Track",
    "description": "Transition exceptional engineers into high-impact engineering managers who build and scale high-performing teams, balance technical excellence with business outcomes, and multiply organizational impact through effective people leadership.",
    "courseLength": "4 months",
    "modules": [
      {
        "code": "M21",
        "title": "Foundations of Engineering Management",
        "tech": "1-on-1 Frameworks, Performance Management, Goal Setting (OKRs), Career Development Planning, Feedback Models (SBI, Radical Candor), Coaching Techniques, Team Health Metrics",
        "outcome": "Personalized Management Philosophy Document + 90-Day Management Plan",
        "details": "Master the fundamentals of people management. Transition from individual contributor to team multiplier. Develop authentic leadership style grounded in technical credibility."
      },
      {
        "code": "M22",
        "title": "Building High-Performing Engineering Teams",
        "tech": "Technical Recruiting & Interviewing, Onboarding Programs, Team Dynamics (Tuckman Model), Psychological Safety, Engineering Team Metrics, Sprint Planning, Agile Facilitation, Retrospectives",
        "outcome": "Complete Hiring Process Design + Team Charter + Onboarding Program (30-60-90 Day)",
        "details": "Build teams that consistently ship. Design hiring processes attracting top talent. Create team culture optimizing for autonomy, mastery, and purpose."
      },
      {
        "code": "M23",
        "title": "Technical Project Management & Delivery",
        "tech": "Agile/Scrum Mastery, Risk Management, Resource Allocation, Technical Debt Management, Stakeholder Management, Project Estimation Techniques, Roadmap Planning, Cross-Functional Collaboration",
        "outcome": "Major Project Delivery Simulation (3-month timeline, ambiguous requirements, changing priorities)",
        "details": "Deliver complex technical projects predictably. Navigate ambiguity and changing requirements. Balance engineering excellence with business deadlines."
      },
      {
        "code": "M24",
        "title": "Engineering Strategy & Business Alignment",
        "tech": "Business Model Understanding (SaaS Metrics, Unit Economics), Technical ROI Calculation, Build vs Buy Decisions, Vendor Management, Budget Planning, Engineering OKRs, Data-Driven Decision Making",
        "outcome": "Engineering Strategy Document Aligned with Business Goals + Budget Proposal",
        "details": "Translate business objectives into engineering execution. Speak both technical and business languages fluently. Make strategic technical investments with measurable business impact."
      },
      {
        "code": "M25",
        "title": "Advanced Leadership & Organizational Design",
        "tech": "Difficult Conversations, Performance Improvement Plans, Team Scaling Strategies, Organizational Design Principles, Change Management, Engineering Culture Design, Diversity & Inclusion",
        "outcome": "Leadership Crisis Simulation (handle: underperformance, team conflict, organizational change) + Organizational Design Proposal",
        "details": "Navigate the hardest parts of management: performance issues, team conflicts, organizational change. Design team structures that scale. Build inclusive, high-trust cultures."
      }
    ],
    "softSkills": {
      "focus": "Empathy & Emotional Intelligence, Difficult Conversations, Strategic Thinking, Executive Presence, Change Leadership, Authentic Communication",
      "assessment": "Monthly Simulated 1-on-1s (Scored by Actual EMs), Performance Review Practice, Conflict Resolution Scenarios, Budget Defense to Mock Executives, Team Health Surveys",
      "details": "Master the art of leadership through people. Build trust and psychological safety. Navigate organizational politics with integrity. Balance advocacy for team with business needs."
    },
    "capstone": "Full Management Simulation: Manage Virtual Team for 3 Months (hire, onboard, deliver project, handle performance issue, present results to executives) + 360 Feedback from Simulated Reports"
  },
  "ielts": {
    "title": "IELTS Preparation",
    "role": "IELTS Masterclass: Strategic Communication",
    "description": "Improve your communication skills for international career opportunities. Master the linguistic nuances required for global academic and professional success.",
    "courseLength": "Beginner to Advanced",
    "parteneredWith": "IELTS",
    "modules": [
      {
        "code": "M1",
        "title": "Linguistic Foundations",
        "tech": "Grammar, Lexical Resource, Cohesion & Coherence",
        "outcome": "Solidified grammatical accuracy and expanded vocabulary",
        "details": "Focus on the core pillars of the English language required for high band scores."
      },
      {
        "code": "M2",
        "title": "Strategic Listening & Reading",
        "tech": "Skimming, Scanning, Keyword Identification, Audio Processing",
        "outcome": "Proficiency in rapid information retrieval",
        "details": "Techniques to handle complex academic texts and diverse accents."
      },
      {
        "code": "M3",
        "title": "Advanced Writing & Speaking",
        "tech": "Task Response, Fluency, Pronunciation, Argument Structuring",
        "outcome": "High-impact essay writing and confident speaking",
        "details": "Master the art of expressing complex thoughts clearly under exam conditions."
      }
    ],
    "softSkills": {
      "focus": "Confident Communication, Cross-Cultural Awareness",
      "assessment": "Weekly Mock Tests, Speaking Interviews",
      "details": "Simulate real exam environments to build stamina and confidence."
    },
    "capstone": "Full-Length Mock Examination with Detailed Evaluative Feedback"
  },
  "digitalMarketing": {
    "popular": "Popular",
    "title": "Digital Marketing Mastery",
    "role": "Marketing Strategist",
    "description": "Master the art of online growth. Learn SEO, SEM, Social Media Marketing, and Content Strategy to drive real business results.",
    "courseLength": "3 months",
    "modules": [
      {
        "code": "DM1",
        "title": "SEO & Content Strategy",
        "tech": "Keyword Research, On-page SEO, Off-page SEO, Content Planning, Analytics",
        "outcome": "Optimized Website with Content Plan",
        "details": "Learn to rank websites on search engines and create content that converts."
      },
      {
        "code": "DM2",
        "title": "Social Media & Branding",
        "tech": "Instagram Marketing, LinkedIn Growth, Personal Branding, Copywriting, Community Management",
        "outcome": "Social Media Growth Strategy",
        "details": "Build a strong brand presence and engage with audiences effectively."
      },
      {
        "code": "DM3",
        "title": "Performance Marketing",
        "tech": "Google Ads, Facebook/Meta Ads, ROI Analysis, Campaign Optimization",
        "outcome": "Live Ad Campaign with ROI Report",
        "details": "Run paid campaigns that generate leads and sales with positive ROI."
      }
    ],
    "softSkills": {
      "focus": "Creativity, Data-Driven Decision Making, Communication",
      "assessment": "Campaign Pitch, Ad Creative Review, Analytics Interpretation",
      "details": "Combine creative storytelling with analytical rigor to drive marketing success."
    },
    "capstone": "Live Marketing Campaign: Execute a real campaign with a budget and report on performance metrics."
  },
  "dataAnalytics": {
    "popular": "Popular",
    "title": "Data Analytics & Visualization",
    "role": "Data Analyst",
    "description": "Turn raw data into actionable insights. Master Excel, SQL, Python, and PowerBI to solve complex business problems.",
    "courseLength": "4 months",
    "modules": [
      {
        "code": "DA1",
        "title": "Excel & SQL Fundamentals",
        "tech": "Advanced Excel (Pivot Tables, VLOOKUP), SQL Queries, Joins, Aggregations, Data Cleaning",
        "outcome": "Cleaned Dataset & SQL Reports",
        "details": "Master the foundational tools of data analysis for querying and cleaning data."
      },
      {
        "code": "DA2",
        "title": "Python for Data Analysis",
        "tech": "Python, Pandas, NumPy, Data Manipulation, Statistical Analysis",
        "outcome": "Exploratory Data Analysis (EDA) Notebook",
        "details": "Use Python to manipulate large datasets and perform statistical analysis."
      },
      {
        "code": "DA3",
        "title": "Data Visualization & Storytelling",
        "tech": "PowerBI, Tableau, Dashboard Design, Data Storytelling",
        "outcome": "Interactive Business Intelligence Dashboard",
        "details": "Create compelling dashboards that communicate insights effectively to stakeholders."
      }
    ],
    "softSkills": {
      "focus": "Critical Thinking, Attention to Detail, Stakeholder Communication",
      "assessment": "Insight Presentation, Dashboard Review, Data Integrity Check",
      "details": "Translate complex data findings into clear business recommendations."
    },
    "capstone": "Business Intelligence Dashboard: End-to-end analysis of a real-world dataset with actionable business insights."
  },
  "productManagement": {
    "title": "Product Management Launchpad",
    "role": "Associate Product Manager",
    "description": "Learn to build products customers love. Master the product lifecycle from ideation to launch, user research, and agile execution.",
    "courseLength": "4 months",
    "modules": [
      {
        "code": "PM1",
        "title": "User Research & Ideation",
        "tech": "User Interviews, Persona Creation, Empathy Mapping, Problem Statement Definition, Ideation Techniques",
        "outcome": "User Research Report & High-Level Concept",
        "details": "Understand user needs and define valuable product opportunities."
      },
      {
        "code": "PM2",
        "title": "Product Strategy & Roadmapping",
        "tech": "Market Analysis, MVP Definition, Feature Prioritization (RICE/MoSCoW), Product Roadmapping",
        "outcome": "Product Strategy Deck & Roadmap",
        "details": "Define the vision, strategy, and roadmap for a product."
      },
      {
        "code": "PM3",
        "title": "Agile Execution & Metrics",
        "tech": "Scrum/Kanban, JIRA/Linear, User Stories, Acceptance Criteria, Product Metrics (KPIs, OKRs)",
        "outcome": "Backlog & Launch Plan",
        "details": "Manage the development process and measure product success."
      }
    ],
    "softSkills": {
      "focus": "Leadership, Empathy, Strategic Vision, Cross-Functional Collaboration",
      "assessment": "PRD Review, Stakeholder Alignment Simulation, Roadmapping Exercise",
      "details": "Lead without authority and align cross-functional teams towards a common goal."
    },
    "capstone": "End-to-End Product PRD & Launch Plan: Create a comprehensive Product Requirements Document and launch strategy."
  }
};


async function main() {
  console.log('🌱 Starting seed...');

  // ===========================================================================
  // 1. Create Roles & Permissions
  // ===========================================================================

  const PASSWORD = "password123";
  // Hashed password for "password123"
  // const HASHED_PASSWORD = "$2b$10$ZpMeeu9BpOIiKFVAHt7kEuQXKZP8Nl3TChHgxaDfqXF8o7DyKHxNm";
  const HASHED_PASSWORD = await hash(PASSWORD, 12);

  const ROLES = [
      'DIRECTOR', 'GENERAL_MANAGER', 'ADMIN', 'HR_MANAGER', 'PAYROLL_MANAGER',
      'BUSINESS_ANALYST', 'DIGITAL_MARKETING', 'TEACHER', 'BACKOFFICE', 'STUDENT'
  ];

  for (const roleName of ROLES) {
      await prisma.role.upsert({
          where: { name: roleName },
          update: {},
          create: { name: roleName, description: `Default ${roleName} role` }
      });
  }
  console.log('✅ Roles seeded');

  // permissions
    const permissionsToCreate = [
    { action: 'read', subject: 'user' },
    { action: 'create', subject: 'user' },
    { action: 'update', subject: 'user' },
    { action: 'delete', subject: 'user' },
    { action: 'manage', subject: 'user' },
    { action: 'read', subject: 'course' },
    { action: 'create', subject: 'course' },
    { action: 'update', subject: 'course' },
    { action: 'delete', subject: 'course' },
    { action: 'manage', subject: 'course' },
    { action: 'read', subject: 'finance' },
    { action: 'manage', subject: 'finance' },
    { action: 'read', subject: 'report' },
    { action: 'manage', subject: 'marketing' },
    { action: 'manage', subject: 'settings' },
    { action: 'manage', subject: 'batch' },
    { action: 'manage', subject: 'enrollment' },
  ];

  for (const perm of permissionsToCreate) {
      await prisma.permission.upsert({
          where: {
              action_subject: {
                  action: perm.action,
                  subject: perm.subject
              }
          },
          update: {},
          create: perm
      });
  }
  console.log('✅ Permissions seeded');

  // ===========================================================================
  // 1.5. Create Branch
  // ===========================================================================
  const mainBranch = await prisma.branch.create({
      data: {
          name: 'Main Branch',
          location: 'Headquarters',
          isMain: true
      }
  });
  console.log('✅ Branch created');

  // ===========================================================================
  // 2. Create Users & Profiles
  // ===========================================================================

  // DIRECTOR
  const director = await prisma.user.upsert({
      where: { email: 'director@future-ready.com' },
      update: {
          password: HASHED_PASSWORD,
          role: { connect: { name: 'DIRECTOR' } },
          branch: { connect: { id: mainBranch.id } }
      },
      create: {
          email: 'director@future-ready.com',
          name: 'Director Admin',
          password: HASHED_PASSWORD,
          branch: { connect: { id: mainBranch.id } },
          role: { connect: { name: 'DIRECTOR' } },
          staffProfile: {
              create: {
                  department: 'Management',
                  designation: 'Director'
              }
          }
      }
  });

  // ADMIN
  const admin = await prisma.user.upsert({
      where: { email: 'admin@future-ready.com' },
      update: {
          password: HASHED_PASSWORD,
          role: { connect: { name: 'ADMIN' } },
          branch: { connect: { id: mainBranch.id } }
      },
      create: {
          email: 'admin@future-ready.com',
          name: 'Admin User',
          password: HASHED_PASSWORD,
          role: { connect: { name: 'ADMIN' } },
          branch: { connect: { id: mainBranch.id } }
      }
  });

  // TEACHER
  const teacher = await prisma.user.upsert({
      where: { email: 'teacher@future-ready.com' },
      update: {
          password: HASHED_PASSWORD,
          role: { connect: { name: 'TEACHER' } },
          branch: { connect: { id: mainBranch.id } }
      },
      create: {
          email: 'teacher@future-ready.com',
          name: 'Sarah Teacher',
          password: HASHED_PASSWORD,
          role: { connect: { name: 'TEACHER' } },
          branch: { connect: { id: mainBranch.id } },
          teacherProfile: {
              create: {
                  domain: 'Web Development',
                  bio: 'Senior Full Stack Developer with 10 years of experience.',
                  qualification: 'M.S. Computer Science'
              }
          }
      },
      include: { teacherProfile: true }
  });

  if (!teacher.teacherProfile) throw new Error("Teacher profile not created");

  // STUDENT
  const student = await prisma.user.upsert({
      where: { email: 'student@future-ready.com' },
      update: {
          password: HASHED_PASSWORD,
          role: { connect: { name: 'STUDENT' } },
          branch: { connect: { id: mainBranch.id } }
      },
      create: {
          email: 'student@future-ready.com',
          name: 'Alex Student',
          password: HASHED_PASSWORD,
          role: { connect: { name: 'STUDENT' } },
          branch: { connect: { id: mainBranch.id } },
          studentProfile: {
              create: {
                  enrollmentDate: new Date()
              }
          }
      },
      include: { studentProfile: true }
  });

  if (!student.studentProfile) throw new Error("Student profile not created");

  console.log('✅ Users created');


  // ===========================================================================
  // 3. Seed Salaries
  // ===========================================================================
  // Check if salary exists
  const existingSalary = await prisma.salary.findFirst({
      where: { teacherProfileId: teacher.teacherProfile.id }
  });

  if (!existingSalary) {
      await prisma.salary.create({
          data: {
              teacherProfileId: teacher.teacherProfile.id,
              baseSalary: 50000,
              allowances: 5000,
              effectiveFrom: new Date(),
          }
      });
      console.log('✅ Salary created');
  }


  // ===========================================================================
  // 4. Generate Courses from STATIC DATA
  // ===========================================================================

  const guessLevel = (slug: string): Level => {
      const s = slug.toLowerCase();
      if (s.includes('intro') || s.includes('ielts') || s.includes('digital') || s.includes('data')) return Level.BEGINNER;
      if (s.includes('problem') || s.includes('intermed')) return Level.INTERMEDIATE;
      return Level.ADVANCED;
  };

  const guessPrice = (level: Level): number => {
      switch (level) {
          case Level.BEGINNER: return 15000;
          case Level.INTERMEDIATE: return 35000;
          case Level.ADVANCED: return 55000;
          default: return 15000;
      }
  };

  const parseDuration = (durationStr: string | undefined): number => {
    if (!durationStr) return 0;
    const match = durationStr.match(/(\d+)/);
    if (match) {
        const num = parseInt(match[1], 10);
        if (durationStr.toLowerCase().includes('month')) return num * 4 * 10;
        if (durationStr.toLowerCase().includes('week')) return num * 10;
        return num;
    }
    return 0;
  };

  const courseKeys = Object.keys(COURSES_DATA);
  const createdCourses = [];

  for (const slug of courseKeys) {
      const tierData = COURSES_DATA[slug];

      const title = tierData.title || slug;
      const description = tierData.description || tierData.role || "No description provided.";
      const level = guessLevel(slug);
      const price = guessPrice(level);
      const duration = parseDuration(tierData.courseLength);

      const whatYouWillLearn: string[] = [];
      const features: string[] = [];

      if (tierData.modules && Array.isArray(tierData.modules)) {
         tierData.modules.forEach((m: any) => {
             if (m.outcome) whatYouWillLearn.push(m.outcome);
             if (m.tech) features.push(m.title);
         });
      }

      if (whatYouWillLearn.length === 0) whatYouWillLearn.push("Comprehensive curriculum");
      if (features.length === 0 && tierData.role) features.push(tierData.role);

      const course = await prisma.course.upsert({
          where: { slug: slug },
          update: {
              title,
              description,
              level,
              price,
              duration,
              features,
              whatYouWillLearn,
              isActive: true,
              teachers: { connect: { id: teacher.teacherProfile!.id } }
          },
          create: {
              slug,
              title,
              description,
              level,
              price,
              duration,
              isActive: true,
              thumbnailUrl: `/images/courses/${slug}.png`,
              features,
              whatYouWillLearn,
              teachers: { connect: { id: teacher.teacherProfile!.id } }
          }
      });
      console.log(`✅ Course synced: ${title} (${slug})`);


      // Ensure Curriculum exists
      let curriculum = await prisma.curriculum.findFirst({
          where: { courseId: course.id }
      });


      if (!curriculum) {
          curriculum = await prisma.curriculum.create({
              data: {
                  courseId: course.id,
                  description: `Curriculum for ${title}`
              }
          });
      }

      if (tierData.modules && Array.isArray(tierData.modules)) {
          let modOrder = 1;
          for (const modData of tierData.modules) {
              const modTitle = modData.title || `Module ${modOrder}`;

              let module = await prisma.module.findFirst({
                  where: { curriculumId: curriculum.id, title: modTitle }
              });

              if (!module) {
                  module = await prisma.module.create({
                      data: {
                          title: modTitle,
                          curriculumId: curriculum.id,
                          order: modOrder
                      }
                  });
              } else {
                 await prisma.module.update({
                     where: { id: module.id },
                     data: { order: modOrder }
                 });
              }

              const techStr = modData.tech || "";
              const lessonTopics = techStr.split(',').map((t: string) => t.trim()).filter((t: string) => t.length > 0);
              const lessonsToCreate = lessonTopics.length > 0 ? lessonTopics : [ modData.outcome || "Overview" ];

              let lessonOrder = 1;
              for (const topic of lessonsToCreate) {
                  const lessonTitle = topic;

                  const existingLesson = await prisma.lesson.findFirst({
                      where: { moduleId: module.id, title: lessonTitle }
                  });

                  if (!existingLesson) {
                      await prisma.lesson.create({
                        data: {
                            title: lessonTitle,
                            moduleId: module.id,
                            order: lessonOrder,
                            content: `<h1>${lessonTitle}</h1><p>${modData.details || "Content coming soon."}</p>`,
                        }
                      });
                  }
                  lessonOrder++;
              }

              modOrder++;
          }
           console.log(`   + Synced ${tierData.modules.length} modules for ${slug}`);
      }

      createdCourses.push(course);
  }

  // ===========================================================================
  // 5. Create Roadmaps
  // ===========================================================================
  const allCourses = await prisma.course.findMany();
  const roadmapName = "Full Engineering Proficiency";
  const existingRoadmap = await prisma.roadmap.findFirst({ where: { name: roadmapName }});
  if (!existingRoadmap) {
      await prisma.roadmap.create({
          data: {
              name: roadmapName,
              description: "The complete path to becoming a Senior Software Engineer.",
              courses: {
                  connect: allCourses.map(c => ({ id: c.id }))
              }
          }
      });
      console.log('✅ Roadmap created');
  }

  // ===========================================================================
  // 6. Create Leads (Marketing Test)
  // ===========================================================================
  await prisma.lead.create({
    data: {
      name: 'Interested Prospect',
      phone: '1234567890',
      email: 'prospect@gmail.com',
      status: LeadStatus.NEW,
      source: LeadSource.WEBSITE,
      courseInterest: 'introductory'
    }
  });
  console.log('✅ Demo lead created');


  // ===========================================================================
  // 7. Enroll Student (Test Enrollment)
  // ===========================================================================
  // Using 'introductory' as a default course test for student
  const introCourse = await prisma.course.findUnique({ where: { slug: 'introductory' } });

  if (introCourse && student.studentProfile) {
    // Check if batch exists
    let batch = await prisma.batch.findFirst({
        where: { name: 'Intro-Jan-2025' }
    });

    if (!batch) {
        batch = await prisma.batch.create({
            data: {
              name: 'Intro-Jan-2025',
              startDate: new Date(),
              courseId: introCourse.id,
              students: {
                  connect: { id: student.studentProfile.id }
              }
            }
          });
          console.log('✅ Batch created');
    }

    // Enroll student
    await prisma.enrollment.upsert({
      where: {
        studentProfileId_courseId: {
          studentProfileId: student.studentProfile.id,
          courseId: introCourse.id
        }
      },
      update: {
        status: EnrollmentStatus.ACTIVE
      },
      create: {
        studentProfileId: student.studentProfile.id,
        courseId: introCourse.id,
        batchId: batch.id,
        status: EnrollmentStatus.ACTIVE
      }
    });

    console.log('✅ Student enrolled in Introductory batch');
  }

  // ===========================================================================
  // 8. Seed Notifications
  // ===========================================================================
  await prisma.notification.create({
      data: {
          userId: student.id,
          title: "Welcome to big O ",
          message: "We are glad to have you here. Check out your dashboard.",
          type: NotificationType.INFO,
          isRead: false
      }
  });
  console.log('✅ Notification created');

  console.log('🏁 Seeding completed successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
