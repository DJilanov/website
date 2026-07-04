import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Activity,
  ArrowLeft,
  ArrowDownRight,
  ArrowRight,
  BarChart3,
  BriefcaseBusiness,
  CheckCircle2,
  Clock3,
  Copy,
  Cpu,
  DatabaseZap,
  ExternalLink,
  Eye,
  Gauge,
  Layers3,
  LineChart,
  Lock,
  Mail,
  Menu,
  MousePointerClick,
  PanelLeftClose,
  Phone,
  Rocket,
  Send,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Target,
  Users,
  X
} from 'lucide-react';
import './styles.css';

const navItems = [
  ['00', 'Intro', '#hero'],
  ['01', 'Work', '#work'],
  ['02', 'Automation', '#ai'],
  ['03', 'Build', '#build'],
  ['04', 'Stack', '#stack'],
  ['05', 'Contact', '#contact']
];

const metrics = [
  ['16+', 'years experience', 'from MVPs to enterprise systems'],
  ['147+', 'projects delivered', 'web, mobile, automation and Web3'],
  ['180k+', 'engineering hours', 'architecture, delivery, support'],
  ['42+', 'shown cases', 'new and archived NDA-safe entries']
];

const projects = [
  {
    slug: 'credit-refresh',
    company: 'Credit Refresh',
    title: 'Credit dispute SaaS with monitoring, billing and admin operations',
    category: 'Credit repair SaaS / AI',
    logo: '/assets/logos/credit-refresh.png',
    summary:
      'A production credit-repair product with Array credit report import, dispute attacks and rounds, PDF letters, Authorize.Net subscriptions, encrypted PII and admin review.',
    impact: ['Array reports', 'Dispute rounds', 'PDF letters', 'Authorize.Net billing'],
    stack: [
      'TypeScript',
      'Next.js',
      'NestJS',
      'PostgreSQL / Prisma',
      'Redis / Bull',
      'Supabase Storage',
      'Claude AI',
      'DeepSeek AI'
    ],
    proofPoints: [
      'Imports negative tradelines from Array and turns them into dispute campaigns.',
      'Generates bureau, creditor, debt-validation and identity-theft letter PDFs with signed storage URLs.',
      'Includes subscription gating, admin plans, 2FA, audit logs, referrals and GDPR export flows.'
    ],
    architecture: {
      panels: ['Client panel', 'Admin panel'],
      edge: ['nginx'],
      server: 'NestJS server',
      services: ['Postgres / Prisma', 'Redis / Bull'],
      layers: [
        ['Storage', ['Supabase Storage', 'PDFKit']],
        ['Integrations', ['Array API', 'Authorize.Net', 'Brevo']],
        ['AI assist', ['Claude AI', 'DeepSeek AI']]
      ]
    },
    proof: 'https://creditrefresh.ai/'
  },
  {
    slug: 'gigsy',
    company: 'Gigsy',
    title: 'Musician marketplace with mobile, venue and backoffice workflows',
    category: 'Music / booking platform',
    logo: '/assets/logos/gigsy.webp',
    summary:
      'A marketplace where musicians discover gigs, venues manage events and applications, and operators handle the platform from a web backoffice.',
    impact: ['Musician app', 'Venue dashboard', 'Messaging', 'Applications'],
    stack: ['TypeScript', 'Expo / React Native', 'Next.js', 'NestJS', 'TypeORM', 'PostgreSQL', 'Socket.IO', 'nginx'],
    proofPoints: [
      'Role-based mobile flows for musicians and venue managers with different default homes.',
      'Gig creation, applications, invitations, connections, profiles, media samples and messages.',
      'Backoffice and public website share typed API services, auth state and contact/newsletter endpoints.'
    ],
    architecture: {
      panels: ['Mobile app', 'Admin panel', 'Backoffice panel'],
      edge: ['nginx'],
      server: 'NestJS server',
      services: ['Postgres DB', 'TypeORM'],
      layers: [
        ['Realtime', ['Socket.IO', '30s message polling']],
        ['Media', ['S3 file upload', 'Audio / video samples']],
        ['Channels', ['Contact API', 'Newsletter API']]
      ]
    },
    proof: 'https://gigsy.live/'
  },
  {
    slug: 'walltopia-ewalls',
    company: 'Walltopia',
    title: 'Interactive climbing wall software with BLE route activation',
    category: 'Climbing tech / mobile',
    logo: '/assets/logos/walltopia.webp',
    summary:
      'A React Native app and NestJS backend for climbers, route setters and gym operators using Quantum Boards and eWalls LED hardware.',
    impact: ['BLE hardware', 'Route activation', 'WebSocket sync', 'Gym operations'],
    stack: ['TypeScript', 'React Native', 'Expo', 'NestJS', 'TypeORM', 'PostgreSQL', 'Socket.IO', 'BLE / MODBUS'],
    proofPoints: [
      'Implements a custom BLE/MODBUS protocol for route lighting, swipe commands and active LED reads.',
      'Handles Quantum Board variants, board config caching, duplicate route cleanup and offline-friendly route previews.',
      'Keeps multi-board connections working while preventing duplicate GATT links to the same physical board.'
    ],
    architecture: {
      panels: ['Mobile app', 'Admin panel', 'Backoffice panel'],
      edge: ['nginx'],
      server: 'NestJS server',
      services: ['Postgres DB', 'TypeORM'],
      layers: [
        ['Realtime', ['Socket.IO active players']],
        ['Hardware', ['BLE / MODBUS', 'Quantum Board']],
        ['Mobile cache', ['AsyncStorage', 'Route delta cache']]
      ]
    },
    proof: 'https://walltopia.com/products/lambda-cdm-climbing-walls/'
  },
  {
    slug: 'ai-cv',
    company: 'AI-CV',
    title: 'AI-native career platform with CV variants and application tracking',
    category: 'AI / career tooling',
    logo: '/assets/logos/aicv.webp',
    summary:
      'A career platform that imports a master profile, tailors CVs per job description, writes cover letters, exports documents and tracks applications.',
    impact: ['CV variants', 'Cover letters', 'Applications', 'Revolut billing'],
    stack: ['TypeScript', 'Next.js 16', 'React 19', 'NestJS', 'PostgreSQL / Prisma', 'Claude AI', 'S3 storage', 'Revolut'],
    proofPoints: [
      'Profile, jobs, CV variants, cover letters, job matches, applications, shared links and organization flows.',
      'Document import/export pipeline using PDF parsing, DOCX generation and browser-rendered PDF output.',
      'Tracks AI usage and cost, plan entitlements, subscriptions, referrals and admin operations.'
    ],
    architecture: {
      panels: ['Client panel', 'Admin panel'],
      edge: ['nginx'],
      server: 'NestJS server',
      services: ['Postgres / Prisma', 'S3 storage'],
      layers: [
        ['Documents', ['PDF parser', 'DOCX export', 'Browser PDF']],
        ['AI and billing', ['Claude AI', 'AI event costs', 'Revolut']]
      ]
    },
    proof: 'https://www.aicvme.com/terms'
  },
  {
    slug: 'seo-improve',
    company: 'SEO Improve',
    title: 'SEO intelligence SaaS with scans, crawl, GSC and paid tier gates',
    category: 'SEO SaaS / AI',
    logo: '/assets/logos/seo-improve.webp',
    summary:
      'A SaaS product for technical scans, crawl analysis, keywords, backlinks, Google Search Console, reports, teams and AI-assisted SEO workflows.',
    impact: ['Technical scans', 'GSC OAuth', 'Keyword tiers', 'Adyen billing'],
    stack: ['TypeScript', 'Next.js 16', 'React 19', 'NestJS', 'PostgreSQL / Prisma', 'Redis / BullMQ', 'Gemini', 'DataForSEO', 'Adyen'],
    proofPoints: [
      'Free, Basic, Pro and Enterprise gates across scan details, crawl depth, keywords, reports and team seats.',
      'Integrates PageSpeed, DataForSEO backlinks, Google Search Console and AI SERP/content workflows.',
      'Includes Adyen checkout, webhook verification, monthly reports, alerts, uptime and admin app.'
    ],
    architecture: {
      panels: ['Client panel', 'Admin panel'],
      edge: ['nginx'],
      server: 'NestJS server',
      services: ['Postgres / Prisma', 'Redis / BullMQ'],
      layers: [
        ['SEO data', ['PageSpeed', 'GSC OAuth', 'DataForSEO']],
        ['AI and reports', ['Gemini AI', 'Monthly reports', 'Alerts']],
        ['Payments', ['Adyen checkout', 'Webhook HMAC']]
      ]
    },
    proof: 'https://seoimprove.net/'
  },
  {
    slug: 'thorwallet-defi',
    company: 'THORWallet',
    title: 'Mobile DeFi wallet experience',
    category: 'Web3 / wallet',
    logo: '/assets/logos/thorwallet.png',
    summary:
      'Mobile wallet engineering across onboarding, vaults, swaps, pooling, savers, staking, WalletConnect and multi-chain asset operations.',
    impact: ['Multi-chain wallet', 'WalletConnect', 'Savers / pooling', 'Client-side signing'],
    stack: ['TypeScript', 'React Native', 'xchainjs', 'WalletConnect', 'Ledger BLE', 'THORChain', 'MayaChain', 'Chainflip', 'Unizen'],
    proofPoints: [
      'Large mobile codebase with chain integrations for Bitcoin, EVMs, Cosmos, Sui, Solana, XRP, THORChain and Maya.',
      'Wallet flows cover vault creation, biometrics, swaps, deposits, withdrawals, pooling, savers, staking and cards.',
      'Blockchain interaction stays on the device through the user wallet; backend support is non-custodial assistance.'
    ],
    architecture: {
      panels: ['Mobile app'],
      userSide: ['Wallet signs blockchain actions'],
      edge: ['nginx'],
      server: 'NestJS support server',
      services: ['Postgres DB', 'Support data'],
      layers: [
        ['Client chains', ['THORChain', 'MayaChain', 'EVM / UTXO']],
        ['Wallet clients', ['WalletConnect', 'Ledger BLE', 'xchainjs']],
        ['DeFi services', ['Chainflip', 'Unizen', '1inch']]
      ],
      note: 'Blockchain actions stay client-side. Backend is for user assistance and support flows.'
    },
    proof: 'https://www.thorwallet.org/'
  },
  {
    slug: 'gamium-defi',
    company: 'Gamium',
    title: 'Mobile Web3 wallet and fintech support system',
    category: 'Web3 / AI trading',
    logo: '/assets/logos/gamium.webp',
    summary:
      'A React Native Web3 wallet with WalletConnect, QR flows, PIN/Face ID, signing services and a NestJS fintech support API around Modulr payment operations.',
    impact: ['WalletConnect', 'PIN / Face ID', 'QR payments', 'Modulr API'],
    stack: ['TypeScript', 'Expo / React Native', 'WalletConnect', 'ethers.js', 'Ledger BLE', 'NestJS', 'TypeORM', 'PostgreSQL'],
    proofPoints: [
      'Mobile wallet flows include wallet creation, signing, QR screens, network switching and WalletConnect request handling.',
      'Support API has Modulr modules for accounts, beneficiaries, cards, customers, documents, payments and transactions.',
      'As with other DeFi work, signing and chain execution stay on the client side.'
    ],
    architecture: {
      panels: ['Mobile app'],
      userSide: ['Wallet signs blockchain actions'],
      edge: ['nginx'],
      server: 'NestJS support server',
      services: ['Postgres DB', 'TypeORM'],
      layers: [
        ['Wallet client', ['WalletConnect v2', 'ethers.js', 'QR flows']],
        ['Device security', ['PIN', 'Face ID', 'Keychain']],
        ['Fintech API', ['Modulr accounts', 'Cards', 'Payments']]
      ],
      note: 'Blockchain actions stay client-side. Backend is for user assistance and support flows.'
    }
  },
  {
    slug: 'prosieben-mobile',
    company: 'ProSieben',
    title: 'YouTube-style media mobile app with GraphQL content delivery',
    category: 'Media / mobile',
    logo: '/assets/logos/prosieben.webp',
    summary:
      'Portfolio-safe media app case for a mobile video product with feeds, video detail screens, recommendations, search and backend content APIs.',
    impact: ['Video feeds', 'GraphQL API', 'Redis cache', 'Debian server'],
    stack: ['JavaScript', 'React Native', 'GraphQL', 'PostgreSQL', 'Redis', 'Apache2', 'Debian'],
    proofPoints: [
      'YouTube-style mobile UX with home feed, video detail, search, subscriptions and saved content patterns.',
      'GraphQL API composes video metadata, user state, recommendations and playback-related data.',
      'Redis supports hot feed/cache paths; PostgreSQL stores users, video records, history and engagement state.'
    ],
    architecture: {
      panels: ['Mobile app'],
      edge: ['Apache2 / Debian'],
      server: 'GraphQL server',
      services: ['Postgres DB', 'Redis cache'],
      layers: [
        ['Content', ['Video metadata', 'Search index']],
        ['Engagement', ['Watch history', 'Subscriptions', 'Saved videos']]
      ]
    }
  }
];

const caseStudies = {
  'credit-refresh': {
    label: 'Case study / Credit repair SaaS',
    title: 'Building a credit dispute SaaS with report import, dispute rounds, billing and admin operations',
    subtitle:
      'Credit Refresh turns credit repair from a manual service process into software: credit report import, negative tradeline detection, dispute campaigns, letter PDFs, subscriptions, encrypted personal data and admin review.',
    meta: ['Array credit reports', 'Dispute attacks and rounds', 'Authorize.Net subscriptions', 'Encrypted PII'],
    facts: [
      ['Product surface', 'Client panel and admin panel'],
      ['Core stack', 'Next.js, NestJS, Prisma, PostgreSQL'],
      ['Workflow', 'Reports, tradelines, rounds, letters, responses'],
      ['Operations', 'Plans, billing, admin, audit, export']
    ],
    sections: [
      {
        title: 'Why the product matters',
        paragraphs: [
          'Credit repair is not one screen. A useful product has to pull report data, preserve sensitive profile fields, identify negative items, organize dispute rounds, generate letters, track bureau responses and keep admins able to intervene.',
          'The hard part is the workflow around the documents. A letter generator is easy to demo; a product that survives subscription rules, user support, response ingestion, security and operational review is the real work.'
        ]
      },
      {
        title: 'What was built',
        bullets: [
          'Array integration that imports credit reports, persists negative tradelines and keeps server-bound Array identifiers out of client requests.',
          'Attack and round workflows with dispute reasons, status transitions, bureau response PDF ingestion and per-item verdicts.',
          'Letter generation for bureau disputes, creditor disputes, debt validation, method of verification, procedural compliance, identity theft and goodwill flows.',
          'PDF rendering, signed storage URLs, transactional email, notification queues, plan limits, referrals, admin tools and GDPR data export.'
        ]
      },
      {
        title: 'Hard engineering parts',
        paragraphs: [
          'The sensitive data boundary matters. Profile PII, credit report raw data, Array user tokens and 2FA secrets are treated as data that must be protected at rest, not casual application state.',
          'Billing is not just a button. Authorize.Net hosted checkout, ARB subscriptions, webhook verification, idempotency and subscription guards all affect whether a user can pull reports, create attacks or generate letters.'
        ]
      },
      {
        title: 'AI boundary',
        paragraphs: [
          'AI assists with dispute reasons, report analysis and optional letter enhancement. The product stays template-first and deterministic where it needs to be: the user and admin still see the dispute state, documents and final action.',
          'That distinction keeps the AI valuable without turning the product into a black box. The model can help write or analyze; the application remains the system of record.'
        ]
      },
      {
        title: 'What this proves',
        paragraphs: [
          'Credit Refresh shows the kind of product engineering that matters for a buyer: regulated-feeling data, billing, documents, support, admin operations, queues and AI all working inside one maintainable TypeScript system.'
        ]
      }
    ]
  },
  gigsy: {
    label: 'Case study / Music booking platform',
    title: 'Building a musician marketplace across mobile, venue dashboards and backoffice operations',
    subtitle:
      'Gigsy is a two-sided marketplace for musicians and venue managers. The mobile app changes behavior at runtime based on role, while the backend supports gigs, events, applications, connections, messages and media-rich profiles.',
    meta: ['Musician and venue roles', 'Expo mobile app', 'Next.js backoffice', 'NestJS API'],
    facts: [
      ['Product surface', 'Mobile app, admin panel, backoffice panel'],
      ['Core stack', 'Expo, Next.js, NestJS, TypeORM'],
      ['Main flows', 'Gigs, events, profiles, applications, messages'],
      ['Public proof', 'gigsy.live']
    ],
    sections: [
      {
        title: 'Why the product matters',
        paragraphs: [
          'Gig booking is fragmented by default. Musicians need discovery, applications, profiles and messages. Venues need gig creation, applicant review, events, invitations and operational visibility.',
          'A serious marketplace has to handle both sides of that relationship. The mobile app cannot be only a public feed; it has to become a working tool for different user types.'
        ]
      },
      {
        title: 'What was built',
        bullets: [
          'Musician mobile screens for top gigs, map discovery, gig detail, applications, messages, notifications and public musician profiles.',
          'Venue manager mobile screens for dashboard stats, gig creation/editing, applicant management, events, pending applications and live gigs.',
          'API services for auth, profiles, users, gigs, applications, connections, messages, notifications, events, invitations, locations, genres and instruments.',
          'Backoffice and website integrations with typed API services, auth context, React Query, contact forms and newsletter flows.'
        ]
      },
      {
        title: 'Hard engineering parts',
        paragraphs: [
          'The role model is important. Musicians and venue managers share an API, but they do not share the same home, navigation or product priorities. The app has to route users correctly based on role and organization context.',
          'The marketplace also needs reliable edges: social login, media upload, profile enrichment, applicant statuses, conversation polling, notification read states and backoffice-only access rules.'
        ]
      },
      {
        title: 'Product depth',
        paragraphs: [
          'The local code shows backend capabilities beyond the first mobile screens: matching users for gigs, pending connections, gig history, analytics, ratings, reports, devices and payment requests. That matters because it gives the product room to grow without replacing the backend.'
        ]
      },
      {
        title: 'What this proves',
        paragraphs: [
          'Gigsy is proof of full product delivery across mobile, web admin, marketing surface and API. It is the kind of marketplace build where UX, data model and operations have to be designed together.'
        ]
      }
    ]
  },
  'walltopia-ewalls': {
    label: 'Case study / Climbing technology',
    title: 'Engineering mobile software for interactive climbing walls and BLE-controlled routes',
    subtitle:
      'eWalls connects a React Native app, NestJS backend and physical LED climbing hardware. The product has to work in gyms, with real boards, real routes and real connection failures.',
    meta: ['BLE / MODBUS protocol', 'Quantum Board support', 'WebSocket sync', 'Gym operations'],
    facts: [
      ['Product surface', 'Mobile app, admin panel, backoffice panel'],
      ['Core stack', 'React Native, Expo, NestJS, TypeORM'],
      ['Hardware', 'Quantum Board and eWalls LED systems'],
      ['Reliability work', 'Caching, deduplication, connection recovery']
    ],
    sections: [
      {
        title: 'Why the product matters',
        paragraphs: [
          'Software attached to a climbing wall has a higher bar than a normal mobile screen. If route activation fails, LEDs stay lit, board state is wrong or the app loses the selected board, the physical experience breaks immediately.',
          'The app has to make climbers, route setters and gym operators faster without becoming another unreliable thing in the room.'
        ]
      },
      {
        title: 'What was built',
        bullets: [
          'Mobile home screen with activity chart, gym lists, board lists, current location, featured route and event surfaces.',
          'Route preview and activation flows that light board LEDs, stop routes and keep active route state synchronized.',
          'Board config caching and cache-first flows to avoid blocking the UI on repeated hardware/server lookups.',
          'Backend support for events, featured routes, default lists, custom list icons and location-scoped admin actions.'
        ]
      },
      {
        title: 'Hard engineering parts',
        paragraphs: [
          'The BLE work is the core proof. The protocol is derived from MODBUS RTU and includes route lighting, route clearing, active LED reads, firmware status, event-log reads, board config and error codes for route conflicts, color collisions, user limits and board-map mismatches.',
          'The app had to handle real mobile/hardware behavior: stale React closures, iOS peripheral ID rotation, duplicate route IDs from the server, race conditions between activation and WebSocket confirmation, and old-board command payload differences.'
        ]
      },
      {
        title: 'Reliability decisions',
        paragraphs: [
          'Caching was introduced around board config and route data to cut slow loading paths. A per-board connection lock prevents duplicate GATT links to the same physical board while preserving valid multi-device activation.',
          'Those are the kinds of fixes that only appear when software is operating against real hardware, not only a mocked API.'
        ]
      },
      {
        title: 'What this proves',
        paragraphs: [
          'Walltopia proves mobile delivery in a hardware-connected product: React Native UX, BLE protocols, server state, WebSocket sync, admin tooling and production debugging all in one system.'
        ]
      }
    ]
  },
  'ai-cv': {
    label: 'Case study / Career tooling',
    title: 'Turning a master profile into tailored CVs, cover letters and tracked applications',
    subtitle:
      'AI-CV is an AI-native career platform: users create or import a profile, paste job descriptions, generate CV variants and cover letters, export documents and track applications over time.',
    meta: ['Claude career workflow', 'CV variants', 'DOCX/PDF export', 'Revolut billing'],
    facts: [
      ['Product surface', 'Client panel and admin panel'],
      ['Core stack', 'Next.js 16, NestJS 11, Prisma'],
      ['Workflow', 'Profile, jobs, variants, letters, tracker'],
      ['Operations', 'AI events, subscriptions, referrals, runbooks']
    ],
    sections: [
      {
        title: 'Why the product matters',
        paragraphs: [
          'A one-off prompt can rewrite a resume once. A useful career product stores the candidate profile, understands the target job, generates variants, produces cover letters, exports files and remembers what happened after the application.',
          'The product goal is ongoing workflow value, not a single template unlock.'
        ]
      },
      {
        title: 'What was built',
        bullets: [
          'Profile, jobs, job matches, CV variants, cover letters, applications, shared links, organizations, referrals and settings surfaces.',
          'NestJS API modules for AI, analytics, billing, import, export, profiles, jobs, applications, storage, mail and lifecycle jobs.',
          'Document pipeline with PDF parsing, DOCX generation, browser-rendered PDF output and S3-compatible storage.',
          'Subscription and entitlement model around Revolut billing, renewal jobs, downgrade jobs and plan-aware usage limits.'
        ]
      },
      {
        title: 'Hard engineering parts',
        paragraphs: [
          'The AI output is treated as an editable product artifact. That means generated CVs and letters need IDs, previews, export paths, sharing, billing limits and application associations.',
          'The platform also tracks AI usage and estimated cost by type, which is important for pricing, abuse control and understanding whether the subscription model is healthy.'
        ]
      },
      {
        title: 'Operational model',
        paragraphs: [
          'The runbooks include subscription support, AI usage queries, account deletion, S3 cleanup, scheduled renewals and AI log retention. This is the difference between a demo and a product that can take paying users.'
        ]
      },
      {
        title: 'What this proves',
        paragraphs: [
          'AI-CV shows the correct shape for AI products: model calls are only one part. The real system is workflow, documents, billing, storage, user state and operational support.'
        ]
      }
    ]
  },
  'seo-improve': {
    label: 'Case study / SEO SaaS',
    title: 'Building an SEO SaaS with technical scans, crawl limits, GSC, backlinks, teams and billing',
    subtitle:
      'SEO Improve turns site analysis into a paid workflow: domains, scans, crawl, keywords, backlinks, uptime, Search Console, AI content workflows, reports, teams and subscription gates.',
    meta: ['Technical SEO scans', 'Google Search Console', 'DataForSEO backlinks', 'Adyen billing'],
    facts: [
      ['Product surface', 'Client panel and admin panel'],
      ['Core stack', 'Next.js 16, NestJS 11, Prisma'],
      ['AI and data', 'Gemini, SERP, backlinks, PageSpeed, GSC'],
      ['Business model', 'Free, Basic, Pro, Enterprise']
    ],
    sections: [
      {
        title: 'Why the product matters',
        paragraphs: [
          'SEO products become valuable when they connect technical findings with workflow and business limits. A scan result alone is not enough; users need history, comparisons, crawl scope, query data, backlink context and next actions.',
          'The product also needs a clear paid path. Free users can scan, but deeper descriptions, AI steps, keywords, crawl depth, reports and team seats are tier-controlled.'
        ]
      },
      {
        title: 'What was built',
        bullets: [
          'Domain management, scan history, scan result sharing, scan comparison and paywalled scan details.',
          'Keyword tracking, site crawl, backlinks, link opportunities, uptime/SSL status, monthly reports and team invitations.',
          'Google Search Console OAuth for domains, queries and pages.',
          'AI flows for SERP rankings, keyword intent, competitors, content briefs and meta generation.'
        ]
      },
      {
        title: 'Tier and billing architecture',
        paragraphs: [
          'The API and frontend enforce the same tier hierarchy: Free, Basic, Pro and Enterprise. Crawl page limits, keyword limits, team seats, reports and content briefs all map to paid capability boundaries.',
          'Payments are backed by Adyen checkout and webhook handling. The production verification plan covers checkout session creation, successful upgrades, cancellation and failed payment handling.'
        ]
      },
      {
        title: 'Operational depth',
        paragraphs: [
          'The backend is not a simple scanner. It includes queues, Redis, alerting, email, reports, teams, payments, scans and processors. That gives the SaaS room to run repeated jobs and background work without pushing everything into request/response paths.'
        ]
      },
      {
        title: 'What this proves',
        paragraphs: [
          'SEO Improve shows how to turn a technical data product into SaaS: scans and APIs become useful only when they are tied to accounts, tiers, reports, payment state and a clean client workflow.'
        ]
      }
    ]
  },
  'thorwallet-defi': {
    label: 'Case study / DeFi mobile wallet',
    title: 'Shipping mobile DeFi wallet flows while keeping blockchain execution client-side',
    subtitle:
      'THORWallet is a large React Native wallet surface with many chain integrations, WalletConnect, vault flows, swaps, pooling, savers, staking, lending and card-related product screens.',
    meta: ['Multi-chain mobile wallet', 'WalletConnect', 'xchainjs', 'Client-side signing'],
    facts: [
      ['Product surface', 'Mobile app'],
      ['Core stack', 'React Native, TypeScript, xchainjs'],
      ['Wallet scope', 'Vaults, swaps, savers, pooling, staking'],
      ['Blockchain boundary', 'User device signs and broadcasts']
    ],
    sections: [
      {
        title: 'Why the product matters',
        paragraphs: [
          'DeFi wallets are high-risk UX. Users are asked to create vaults, approve contracts, swap assets, deposit, withdraw, stake, pool and connect to external apps. The interface has to reduce mistakes without hiding what is happening.',
          'The engineering boundary matters: the backend can help the product, but the wallet and user remain the path for signing and blockchain execution.'
        ]
      },
      {
        title: 'What was built',
        bullets: [
          'Mobile wallet flows for creating/importing vaults, biometrics, send, deposit, swap, wrap, pooling, savers, staking, lending and node operations.',
          'Integrations across THORChain, MayaChain, Bitcoin, Doge, Litecoin, Dash, Bitcoin Cash, Cosmos, Kujira, Sui, Solana, XRP, EVM chains and Stellar-related staking surfaces.',
          'WalletConnect, Ledger BLE, Chainflip, Unizen, 1inch, Fiat24 and other service/client integrations around the mobile wallet experience.',
          'Multilingual app surfaces and a large query layer for balances, transactions, pools, savers, lending, NFTs, banners and trending assets.'
        ]
      },
      {
        title: 'Engineering boundary',
        paragraphs: [
          'The backend is not the signer and is not the chain operator. That distinction is not marketing language; it changes the architecture. Wallet screens prepare, explain and request actions, while the user wallet performs the irreversible parts.',
          'Support APIs can still matter for product operations, account help, status, missions or analytics, but they must not blur custody.'
        ]
      },
      {
        title: 'Product complexity',
        paragraphs: [
          'This is not a CRUD mobile app. It contains native crypto dependencies, chain SDKs, hardware support, QR flows, WebView/on-ramp surfaces, background services, secure storage, multiple navigation stacks and high-stakes transaction screens.'
        ]
      },
      {
        title: 'What this proves',
        paragraphs: [
          'THORWallet demonstrates mobile engineering in a category where mistakes are expensive: security prompts, transaction state, chain compatibility and user trust have to be treated as first-class product work.'
        ]
      }
    ]
  },
  'gamium-defi': {
    label: 'Case study / Web3 wallet and fintech',
    title: 'Building a mobile wallet with WalletConnect and a fintech support API around Modulr',
    subtitle:
      'Gamium combines a React Native wallet surface with WalletConnect request handling, QR flows, PIN/Face ID, signing services and a NestJS payment-support backend.',
    meta: ['React Native wallet', 'WalletConnect v2', 'Signing services', 'Modulr support API'],
    facts: [
      ['Product surface', 'Mobile app'],
      ['Core stack', 'Expo, React Native, ethers.js, NestJS'],
      ['Backend scope', 'Modulr accounts, cards, documents, payments'],
      ['Blockchain boundary', 'Client-side wallet execution']
    ],
    sections: [
      {
        title: 'Why the product matters',
        paragraphs: [
          'Wallet products need both a clean mobile experience and careful boundaries around signing. Users scan QR codes, approve dApp requests, switch networks, sign messages and manage account state from a small screen.',
          'Gamium also has fintech support requirements: accounts, beneficiaries, cards, documents, payments, transactions and customer flows around the mobile product.'
        ]
      },
      {
        title: 'What was built',
        bullets: [
          'React Native wallet app with PIN setup, Face ID activation, QR screens, wallet initialization and signing flows.',
          'WalletConnect v2 service handling session proposals, session requests, unsupported chains, sign requests, transaction requests and session deletion.',
          'Client-side signing utilities around ethers wallets, native signers and secure keychain storage.',
          'NestJS payment/support API with Modulr modules for accounts, beneficiaries, cards, customers, debits, documents, files, payees, payments, rules and transactions.'
        ]
      },
      {
        title: 'Engineering boundary',
        paragraphs: [
          'Like the THORWallet case, the backend is a support layer. It can manage payment/customer/product records, but wallet signing and blockchain execution stay client-side.',
          'That separation keeps the product honest and avoids mixing support data with custody responsibilities.'
        ]
      },
      {
        title: 'Product complexity',
        paragraphs: [
          'The mobile app has the shape of a real wallet: native storage, QR, WalletConnect, signing modals, supported-chain checks, network switching, account state and device authentication. The backend adds financial operations without pretending to be the wallet.'
        ]
      },
      {
        title: 'What this proves',
        paragraphs: [
          'Gamium shows the same pattern needed for serious fintech and Web3 mobile work: a polished app surface, explicit signing boundaries and backend modules for the operational parts around the wallet.'
        ]
      }
    ]
  },
  'prosieben-mobile': {
    label: 'Case study / Media mobile apps',
    title: 'Designing a YouTube-style mobile video app on GraphQL, Redis, PostgreSQL and Debian',
    subtitle:
      'This is an NDA-safe media-app case description based on the stack: a mobile video product with feeds, search, video detail, engagement state, GraphQL composition, Redis caching, PostgreSQL and Apache2 on Debian.',
    meta: ['Mobile video product', 'GraphQL API', 'Redis cache', 'Apache2 / Debian'],
    facts: [
      ['Product surface', 'Mobile app'],
      ['Core stack', 'JavaScript, React Native, GraphQL'],
      ['Data layer', 'PostgreSQL with Redis hot paths'],
      ['Server', 'Apache2 on Debian']
    ],
    sections: [
      {
        title: 'Why the product matters',
        paragraphs: [
          'A media mobile app has to feel immediate. Users expect a home feed, search, video detail, related content, playback state and saved/subscribed content patterns that behave like products they already use every day.',
          'The engineering challenge is keeping the app fast while content metadata, user state and recommendations change constantly.'
        ]
      },
      {
        title: 'What was built',
        bullets: [
          'Mobile video experience with YouTube-style home feed, video detail, search, channel/subscription patterns and saved history concepts.',
          'GraphQL API layer that composes video metadata, user engagement state, recommendations and playback-related fields for the mobile app.',
          'PostgreSQL data model for users, videos, categories, watch history, subscriptions, favorites and engagement events.',
          'Redis caching for hot feed, session, recommendation and frequently requested video metadata paths.'
        ]
      },
      {
        title: 'Infrastructure choices',
        paragraphs: [
          'Apache2 on Debian is a practical hosting choice for this kind of stack: terminate and route traffic predictably, keep deployment understandable and leave the application layer focused on GraphQL and product behavior.',
          'Redis sits between the mobile app pressure and PostgreSQL so common feed and metadata reads do not punish the database on every open.'
        ]
      },
      {
        title: 'Engineering focus',
        paragraphs: [
          'The product is less about inventing a new interaction model and more about making a familiar one reliable: fast lists, clear playback transitions, resilient loading states, search that feels responsive and API payloads shaped for mobile screens.'
        ]
      },
      {
        title: 'What this proves',
        paragraphs: [
          'The ProSieben case shows mobile product work in a consumer media context: when the app is content-heavy, performance, API shape, cache strategy and release discipline matter as much as UI implementation.'
        ]
      }
    ]
  }
};
const archiveProjects = [
  ['VMware', 'vSphere ecosystem work', '/assets/work/vmware.png'],
  ['HP', 'HP Smart app', '/assets/work/hp.png'],
  ['ProSieben', 'Mobile apps', '/assets/work/prosieben.png'],
  ['WynnBet', 'Casino platform', null],
  ['TwinSpires', 'Casino platform', null],
  ['PaySixt', 'Payment workflow solution', null],
  ['Ecollect', 'Fintech solution', null],
  ['Welltok', 'Health engagement platform', null],
  ['Precisca', 'Cancer expertise access platform', null]
];

const buildTypes = [
  ['SaaS and portals', 'subscriptions, profiles, roles, payments, reports and operations', Layers3],
  ['Internal systems', 'CRM, ERP, DMS, warehouse, requests, documents and approvals', DatabaseZap],
  ['AI workflow tools', 'document processing, internal copilots, reports and approval flows', Sparkles],
  ['Mobile apps', 'React Native, NativeScript, iOS, Android and offline user journeys', Smartphone],
  ['Web3 and fintech', 'wallet UX, DeFi flows, backtesting, payments and secure operations', ShieldCheck],
  ['Integrations', 'payments, couriers, accounting, API links, reporting and import/export', Cpu]
];

const stackGroups = [
  ['Frontend', ['React', 'Next.js', 'TypeScript', 'Angular', 'Tailwind', 'Design systems']],
  ['Mobile', ['React Native', 'NativeScript', 'iOS', 'Android', 'offline flows']],
  ['Backend', ['Node.js', '.NET', 'API design', 'PostgreSQL', 'MSSQL', 'queues']],
  ['AI architecture', ['OpenAI', 'Claude', 'document pipelines', 'internal tools', 'approval flows']],
  ['Web3 and fintech', ['wallet UX', 'DeFi flows', 'backtesting', 'payments', 'secure operations']],
  ['Delivery', ['architecture', 'CI/CD', 'monitoring', 'support', 'growth']]
];

const packageOptions = [
  {
    name: 'Discovery Sprint',
    text: 'For teams who need clarity before committing budget.',
    bullets: ['product scope', 'UX flows', 'risks and integrations', 'budget estimate'],
    best: 'Best for starting'
  },
  {
    name: 'MVP Build',
    text: 'For teams that need a first usable version with real users.',
    bullets: ['architecture', 'design system', 'development', 'launch and measurement'],
    best: 'Best for new products'
  },
  {
    name: 'Scale & Automate',
    text: 'For companies with manual admin work, repeated data entry or disconnected systems.',
    bullets: ['workflow audit', 'AI-assisted tools', 'API integrations', 'support after launch'],
    best: 'Best for operations'
  }
];

function getVisitorId() {
  const key = 'jilanov_visitor_id';
  const existing = localStorage.getItem(key);
  if (existing) return existing;
  const next = crypto.randomUUID();
  localStorage.setItem(key, next);
  return next;
}

function getSessionId() {
  const key = 'jilanov_session_id';
  const existing = sessionStorage.getItem(key);
  if (existing) return existing;
  const next = crypto.randomUUID();
  sessionStorage.setItem(key, next);
  return next;
}

function utmParams() {
  const params = new URLSearchParams(window.location.search);
  return Object.fromEntries(
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content']
      .map((key) => [key, params.get(key)])
      .filter(([, value]) => value)
  );
}

function analyticsPayload(type, metadata = {}) {
  return {
    type,
    visitorId: getVisitorId(),
    sessionId: getSessionId(),
    path: `${window.location.pathname}${window.location.search}`,
    title: document.title,
    referrer: document.referrer,
    utm: utmParams(),
    language: navigator.language,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    screen: `${window.innerWidth}x${window.innerHeight}`,
    metadata
  };
}

function track(type, metadata = {}) {
  const payload = analyticsPayload(type, metadata);
  const body = JSON.stringify(payload);
  if (navigator.sendBeacon && (type === 'engagement_time' || type === 'scroll_depth')) {
    navigator.sendBeacon('/api/track', new Blob([body], { type: 'application/json' }));
    return;
  }
  fetch('/api/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
    keepalive: true
  }).catch(() => {});
}

function useAnalytics() {
  useEffect(() => {
    if (window.location.pathname.startsWith('/admin')) return undefined;

    track('page_view');
    const start = Date.now();
    const sentDepths = new Set();

    const onScroll = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollable <= 0) return;
      const depth = Math.min(100, Math.round((window.scrollY / scrollable) * 100));
      for (const threshold of [25, 50, 75, 100]) {
        if (depth >= threshold && !sentDepths.has(threshold)) {
          sentDepths.add(threshold);
          track('scroll_depth', { depth: threshold });
        }
      }
    };

    const onClick = (event) => {
      const target = event.target.closest('[data-track]');
      if (!target) return;
      track('cta_click', {
        label: target.getAttribute('data-track'),
        href: target.getAttribute('href') || '',
        section: target.closest('section')?.id || ''
      });
    };

    const sendTime = () => {
      const seconds = Math.max(1, Math.round((Date.now() - start) / 1000));
      track('engagement_time', { seconds });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('click', onClick);
    window.addEventListener('pagehide', sendTime);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') sendTime();
    });

    return () => {
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('click', onClick);
      window.removeEventListener('pagehide', sendTime);
    };
  }, []);
}

function embeddedTargetOrigin() {
  try {
    return document.referrer ? new URL(document.referrer).origin : '*';
  } catch {
    return '*';
  }
}

function postEmbeddedHeight() {
  if (window.parent === window) return;

  const height = Math.ceil(
    Math.max(
      document.body.scrollHeight,
      document.body.offsetHeight,
      document.documentElement.scrollHeight,
      document.documentElement.offsetHeight,
    ),
  );

  if (!Number.isFinite(height) || height <= 0) return;

  window.parent.postMessage(
    {
      type: 'jilanov-engineering:frame-height',
      height,
    },
    embeddedTargetOrigin(),
  );
}

function useEmbeddedFrameHeight() {
  useEffect(() => {
    if (window.parent === window) return undefined;
    if (new URLSearchParams(window.location.search).get('embed') !== 'jilanov-store') {
      return undefined;
    }

    document.documentElement.dataset.embedded = 'jilanov-store';
    document.body.dataset.embedded = 'jilanov-store';

    let frame = 0;
    const schedulePost = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        postEmbeddedHeight();
      });
    };

    const observer = new ResizeObserver(schedulePost);
    observer.observe(document.documentElement);
    observer.observe(document.body);

    schedulePost();
    window.addEventListener('load', schedulePost);
    window.addEventListener('resize', schedulePost);
    document.fonts?.ready.then(schedulePost).catch(() => undefined);
    const interval = window.setInterval(schedulePost, 1000);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('load', schedulePost);
      window.removeEventListener('resize', schedulePost);
      window.clearInterval(interval);
      delete document.documentElement.dataset.embedded;
      delete document.body.dataset.embedded;
    };
  }, []);
}

function App() {
  const isAdmin = window.location.pathname.startsWith('/admin');
  const caseStudySlug = window.location.pathname.match(/^\/case-studies\/([^/]+)/)?.[1];
  useAnalytics();
  useEmbeddedFrameHeight();
  if (caseStudySlug) return <CaseStudyPage slug={decodeURIComponent(caseStudySlug)} />;
  return isAdmin ? <AdminApp /> : <PublicSite />;
}

function PublicSite() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState(navItems[0][2]);

  useActiveSection(setActiveSection);

  return (
    <div className="site-shell">
      <TopBar menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      <SideNav activeSection={activeSection} />
      <MobileNav activeSection={activeSection} menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      <main className="main-content">
        <Hero />
        <Metrics />
        <Work />
        <AISection />
        <BuildSection />
        <StackSection />
        <Contact />
      </main>
    </div>
  );
}

function TopBar({ menuOpen, setMenuOpen }) {
  return (
    <header className="topbar">
      <a href="#hero" className="brand-mark" data-track="brand-home">
        <span className="prompt">$</span>
        <img src="/assets/logo.webp" alt="" />
        <span>jilanov.engineering</span>
        <span className="cursor" />
      </a>
      <nav className="top-actions">
        <a href="#work" data-track="top-work">Proof</a>
        <a href="#contact" data-track="top-contact">Start a project →</a>
        <button className="icon-button mobile-only" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
          {menuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </nav>
    </header>
  );
}

function useActiveSection(setActiveSection) {
  useEffect(() => {
    const sections = navItems
      .map(([, , href]) => document.querySelector(href))
      .filter(Boolean);

    if (!sections.length) return undefined;

    let frame = 0;

    const updateActiveSection = () => {
      frame = 0;
      const readLine = window.scrollY + window.innerHeight * 0.36;
      let currentSection = sections[0];

      for (const section of sections) {
        if (section.offsetTop <= readLine) {
          currentSection = section;
        }
      }

      const nextSection = `#${currentSection.id}`;
      setActiveSection((current) => (current === nextSection ? current : nextSection));
    };

    const scheduleUpdate = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(updateActiveSection);
    };

    updateActiveSection();
    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);
    };
  }, [setActiveSection]);
}

function SideNav({ activeSection }) {
  return (
    <nav className="side-nav" aria-label="Section navigation">
      <ul>
        {navItems.map(([num, label, href]) => {
          const isActive = activeSection === href;

          return (
            <li key={href}>
              <a
                href={href}
                className={isActive ? 'active' : undefined}
                aria-current={isActive ? 'location' : undefined}
              >
                <span className="nav-line" />
                <span><b>{num}</b> {label}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function MobileNav({ activeSection, menuOpen, setMenuOpen }) {
  if (!menuOpen) return null;
  return (
    <div className="mobile-nav">
      {navItems.map(([num, label, href]) => {
        const isActive = activeSection === href;

        return (
          <a
            key={href}
            href={href}
            className={isActive ? 'active' : undefined}
            aria-current={isActive ? 'location' : undefined}
            onClick={() => setMenuOpen(false)}
          >
            <span>{num}</span> {label}
          </a>
        );
      })}
    </div>
  );
}

function CaseStudyPage({ slug }) {
  const project = projects.find((item) => item.slug === slug);
  const study = project ? caseStudies[project.slug] : null;

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = study
      ? `${study.title} · Jilanov Engineering`
      : 'Case study not found · Jilanov Engineering';
  }, [slug, study]);

  if (!project || !study) {
    return (
      <div className="case-study-page">
        <header className="case-topbar">
          <a href="/#work" className="case-back">
            <ArrowLeft size={16} /> Back to selected work
          </a>
          <a href="/#contact" className="secondary-button">
            Start a project <ArrowRight size={15} />
          </a>
        </header>
        <main className="case-main">
          <section className="case-empty">
            <p className="case-eyebrow">Case study</p>
            <h1>Case study not found.</h1>
            <p>The selected project page does not exist. Go back to the work section and choose a project.</p>
            <a className="primary-button" href="/#work">
              View selected work <ArrowRight size={16} />
            </a>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="case-study-page">
      <header className="case-topbar">
        <a href="/#work" className="case-back" data-track="case-back-work">
          <ArrowLeft size={16} /> Back to selected work
        </a>
        <div>
          {project.proof && (
            <a href={project.proof} target="_blank" rel="noreferrer" data-track={`case-proof-${project.company}`}>
              Proof <ExternalLink size={14} />
            </a>
          )}
          <a href="/#contact" className="secondary-button" data-track={`case-contact-${project.company}`}>
            Start a project <ArrowRight size={15} />
          </a>
        </div>
      </header>

      <main className="case-main">
        <section className="case-hero-section">
          <div className="case-hero-copy">
            <div className="case-logo-row">
              {project.logo ? (
                <img src={project.logo} alt={`${project.company} logo`} />
              ) : (
                <div className="brand-fallback">{project.company}</div>
              )}
              <span>{project.category}</span>
            </div>
            <p className="case-eyebrow">{study.label}</p>
            <h1>{study.title}</h1>
            <p className="case-lead">{study.subtitle}</p>
            <div className="case-meta">
              {study.meta.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
            <div className="case-fact-grid">
              {study.facts.map(([label, value]) => (
                <div key={label}>
                  <span>{label}</span>
                  <b>{value}</b>
                </div>
              ))}
            </div>
          </div>
          <div className="case-architecture-panel">
            <ArchitectureDiagram project={project} />
          </div>
        </section>

        <div className="case-layout">
          <article className="case-article">
            {study.sections.map((section, index) => (
              <section className="case-block" key={section.title}>
                <div className="case-section-kicker">
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <i />
                </div>
                <h2>{section.title}</h2>
                {section.paragraphs?.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
                {section.bullets && (
                  <ul>
                    {section.bullets.map((item) => (
                      <li key={item}>
                        <CheckCircle2 size={17} /> {item}
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </article>

          <aside className="case-aside" aria-label={`${project.company} project snapshot`}>
            <div className="case-aside-card">
              <h2>Project snapshot</h2>
              <dl>
                <div>
                  <dt>Company</dt>
                  <dd>{project.company}</dd>
                </div>
                <div>
                  <dt>Category</dt>
                  <dd>{project.category}</dd>
                </div>
                <div>
                  <dt>Surface</dt>
                  <dd>{project.architecture.panels.join(', ')}</dd>
                </div>
              </dl>
            </div>
            <div className="case-aside-card">
              <h2>Product responsibilities</h2>
              <div className="case-chip-list">
                {project.impact.map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </div>
            </div>
            <div className="case-aside-card">
              <h2>Tech stack</h2>
              <div className="case-stack-list">
                {project.stack.map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </div>
            </div>
          </aside>
        </div>

        <section className="case-cta">
          <div>
            <p className="case-eyebrow">Hiring this kind of work</p>
            <h2>Need a product system with the same shape?</h2>
            <p>
              Jilanov Engineering can help with the architecture, panels, backend, mobile surface,
              AI workflow and launch path around a focused product build.
            </p>
          </div>
          <a className="primary-button" href="/#contact" data-track={`case-final-cta-${project.company}`}>
            Discuss your project <ArrowRight size={16} />
          </a>
        </section>
      </main>
    </div>
  );
}

function SectionHeader({ number, title, children }) {
  return (
    <div className="section-header">
      <div className="section-kicker">
        <span>{number}</span>
        <i />
      </div>
      <h2>{title}</h2>
      {children && <p>{children}</p>}
    </div>
  );
}

function Hero() {
  return (
    <section id="hero" className="hero section">
      <div className="hero-grid" />
      <div className="hero-copy">
        <div className="status-pill">
          <span />
          available for selected software projects
        </div>
        <p className="eyebrow">Dimitar Jilanov / Jilanov Engineering</p>
        <h1>
          AI architect for products that need to ship<span>.</span>
        </h1>
        <p className="hero-lead">
          I help companies design, build and launch AI-enabled software: product architecture,
          backend systems, admin panels, mobile apps and the workflows around them.
        </p>
        <p className="hero-proof">
          16+ years, 147+ delivered projects and production work across Walltopia, AI-CV,
          SEO Improve, THORWallet, Gamium, ProSieben, VMware, HP and NDA-safe client systems.
        </p>
        <div className="hero-actions">
          <a className="primary-button" href="#contact" data-track="hero-discuss">
            Discuss a project <ArrowDownRight size={17} />
          </a>
          <a className="secondary-button" href="#work" data-track="hero-work">
            See selected work <Eye size={17} />
          </a>
          <a className="ghost-button" href="#build" data-track="hero-build">
            Review capabilities <Layers3 size={17} />
          </a>
        </div>
        <div className="market-row">
          <span>Sofia / remote</span>
          <span>EU projects</span>
          <span>AI architecture and product delivery</span>
        </div>
      </div>
      <div className="hero-visual profile-visual" aria-label="Profile summary">
        <div className="portrait-card">
          <div className="portrait-frame">
            <img src="/assets/dimitar-jilanov.png" alt="Dimitar Jilanov" />
          </div>
          <div>
            <p>Dimitar Jilanov</p>
            <span>AI architecture / software delivery / mobile and web products</span>
          </div>
        </div>
        <div className="cv-card">
          <div><b>16+ years</b><span>building production software</span></div>
          <div><b>147+ projects</b><span>MVPs, enterprise systems, mobile apps and integrations</span></div>
          <div><b>Sofia / remote</b><span>available for EU and international work</span></div>
        </div>
      </div>
    </section>
  );
}

function Metrics() {
  return (
    <section className="metrics-strip" aria-label="Experience metrics">
      {metrics.map(([value, label, text]) => (
        <div className="metric-card" key={label}>
          <strong>{value}</strong>
          <b>{label}</b>
          <span>{text}</span>
        </div>
      ))}
    </section>
  );
}

function Work() {
  return (
    <section id="work" className="section">
      <SectionHeader number="01" title="Selected Work">
        Publicly verifiable products first, then NDA-safe production work. The goal is simple:
        show enough evidence for a serious buyer to judge fit quickly.
      </SectionHeader>
      <div className="project-grid">
        {projects.map((project, index) => (
          <article className="project-card" key={project.title}>
            <div className="project-content">
              <div className="project-topline">
                <span>{String(index + 1).padStart(2, '0')}</span>
                <i />
                <small>{project.category}</small>
              </div>
              <div className="project-logo-row">
                {project.logo ? (
                  <img src={project.logo} alt={`${project.company} logo`} />
                ) : (
                  <div className="brand-fallback" aria-label={project.company}>
                    {project.company}
                  </div>
                )}
                {project.proof && (
                  <a href={project.proof} target="_blank" rel="noreferrer" data-track={`proof-${project.company}`}>
                    proof <ExternalLink size={13} />
                  </a>
                )}
              </div>
              <h3>{project.title}</h3>
              <p>{project.summary}</p>
              <div className="tag-row">
                {project.impact.map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </div>
              <ul className="project-proof-list">
                {project.proofPoints.map((item) => (
                  <li key={item}>
                    <CheckCircle2 size={15} /> {item}
                  </li>
                ))}
              </ul>
              <div className="tech-stack-row">
                <b>Tech stack</b>
                <div>
                  {project.stack.map((item) => (
                    <span key={item}>{item}</span>
                  ))}
                </div>
              </div>
              <div className="project-actions">
                <a
                  className="secondary-button"
                  href={`/case-studies/${project.slug}`}
                  data-track={`case-study-${project.company}`}
                >
                  Read the case study <ArrowRight size={15} />
                </a>
              </div>
            </div>
            <div className="project-media">
              <ArchitectureDiagram project={project} />
            </div>
          </article>
        ))}
      </div>
      <div className="archive-band">
        <div>
          <h3>NDA-safe production archive</h3>
          <p>
            Real production engagements across user flows, integrations, stability, support and
            delivery inside teams with serious operational expectations.
          </p>
        </div>
        <div className="archive-list">
          {archiveProjects.map(([company, title, image]) => (
            <div className="archive-item" key={`${company}-${title}`}>
              {image ? <img src={image} alt="" /> : <BriefcaseBusiness size={18} />}
              <span>{company}</span>
              <small>{title}</small>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ArchitectureDiagram({ project }) {
  const architecture = project.architecture || {
    panels: ['Client panel'],
    edge: ['nginx'],
    server: 'NestJS server',
    services: ['Postgres DB']
  };
  const layers = architecture.layers || [];

  return (
    <div className="architecture-diagram" aria-label={`${project.company} architecture`}>
      <div className="arch-title">
        <span>{project.company}</span>
        <b>Architecture</b>
      </div>
      <div className="arch-row arch-panels">
        {architecture.panels.map((item) => (
          <div className="arch-node panel-node" key={item}>
            <Layers3 size={15} />
            <span>{item}</span>
          </div>
        ))}
      </div>
      {architecture.userSide && (
        <div className="arch-row arch-user-side">
          {architecture.userSide.map((item) => (
            <div className="arch-node user-side-node" key={item}>
              <ShieldCheck size={15} />
              <span>{item}</span>
            </div>
          ))}
        </div>
      )}
      <div className="arch-connector" />
      <div className="arch-row arch-edge">
        {architecture.edge.map((item) => (
          <div className="arch-node edge-node" key={item}>
            <ShieldCheck size={15} />
            <span>{item}</span>
          </div>
        ))}
      </div>
      <div className="arch-connector" />
      <div className="arch-node server-node">
        <Cpu size={17} />
        <span>{architecture.server}</span>
      </div>
      <div className="arch-connector split" />
      <div className="arch-row arch-services">
        {architecture.services.map((item) => (
          <div className="arch-node service-node" key={item}>
            {archIcon(item)}
            <span>{item}</span>
          </div>
        ))}
      </div>
      {layers.map(([label, items]) => (
        <div className="arch-layer" key={label}>
          <div className="arch-layer-label">{label}</div>
          <div className="arch-row arch-services">
            {items.map((item) => (
              <div className="arch-node service-node integration-node" key={item}>
                {archIcon(item)}
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
      {architecture.note && <p className="arch-note">{architecture.note}</p>}
    </div>
  );
}

function archIcon(item) {
  const text = item.toLowerCase();
  if (text.includes('ai') || text.includes('claude') || text.includes('gemini') || text.includes('deepseek')) {
    return <Sparkles size={15} />;
  }
  if (
    text.includes('wallet') ||
    text.includes('ble') ||
    text.includes('hmac') ||
    text.includes('pin') ||
    text.includes('face') ||
    text.includes('keychain')
  ) {
    return <ShieldCheck size={15} />;
  }
  if (
    text.includes('socket') ||
    text.includes('graphql') ||
    text.includes('api') ||
    text.includes('search') ||
    text.includes('video') ||
    text.includes('report')
  ) {
    return <Cpu size={15} />;
  }
  return <DatabaseZap size={15} />;
}

function AISection() {
  return (
    <section id="ai" className="section split-section">
      <div>
        <SectionHeader number="02" title="AI architecture that reaches production">
          Hire us when an AI feature needs to become a reliable product flow, connected to your
          data, permissions, admin tools and support process.
        </SectionHeader>
        <div className="ai-list">
          {[
            [
              'AI product architecture',
              'Define the user flow, data boundaries, model responsibilities, fallbacks and release path.'
            ],
            [
              'Internal copilots',
              'Connect company knowledge, case history and approval rules without losing human control.'
            ],
            [
              'Document and data workflows',
              'Classify files, extract fields, prepare drafts and push structured data into your systems.'
            ],
            [
              'AI features inside your product',
              'Add paid AI capabilities to a SaaS, portal or mobile app with roles, logging and admin review.'
            ]
          ].map(([title, text]) => (
            <div className="ai-row" key={title}>
              <Sparkles size={18} />
              <div>
                <b>{title}</b>
                <span>{text}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="signal-panel">
        <div className="panel-label">Service offer</div>
        <h3>Start with one workflow, prove value, then expand.</h3>
        <p>
          A typical first project maps the product flow, ships a working pilot, connects the
          required systems and expands only where the result creates measurable value.
        </p>
        <div className="mini-dashboard">
          <div><Target size={18} /> workflow audit</div>
          <div><Layers3 size={18} /> working pilot</div>
          <div><Cpu size={18} /> system integrations</div>
          <div><Rocket size={18} /> launch and support</div>
        </div>
        <a className="secondary-button panel-cta" href="#contact" data-track="ai-automation-review">
          Discuss AI architecture <ArrowRight size={16} />
        </a>
      </div>
    </section>
  );
}

function BuildSection() {
  return (
    <section id="build" className="section">
      <SectionHeader number="03" title="What Jilanov builds">
        Strongest when the product has a real operating process behind it: customers, staff, data,
        payments, documents, integrations or repeated manual work.
      </SectionHeader>
      <div className="build-grid">
        {buildTypes.map(([title, text, Icon]) => (
          <div className="build-card" key={title}>
            <Icon size={22} />
            <h3>{title}</h3>
            <p>{text}</p>
          </div>
        ))}
      </div>
      <div className="package-grid">
        {packageOptions.map((item) => (
          <article className="package-card" key={item.name}>
            <h3>{item.name}</h3>
            <p>{item.text}</p>
            <ul>
              {item.bullets.map((bullet) => (
                <li key={bullet}><CheckCircle2 size={16} /> {bullet}</li>
              ))}
            </ul>
            <a href="#contact" data-track={`package-${item.name}`}>{item.best} <ArrowRight size={15} /></a>
          </article>
        ))}
      </div>
    </section>
  );
}

function StackSection() {
  return (
    <section id="stack" className="section stack-section">
      <SectionHeader number="04" title="Stack and delivery model">
        Technology is chosen according to the product, team and support horizon. The goal is a
        working result with a maintainable path after launch.
      </SectionHeader>
      <div className="stack-grid">
        {stackGroups.map(([group, items]) => (
          <div className="stack-card" key={group}>
            <h3>{group}</h3>
            <div>
              {items.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Contact() {
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  async function submit(event) {
    event.preventDefault();
    setStatus('sending');
    setError('');
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    const payload = { ...analyticsPayload('lead_submit'), ...data };
    const response = await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).catch(() => null);

    if (!response?.ok) {
      setError('The message was not saved. Check the required fields and try again.');
      setStatus('idle');
      return;
    }

    setStatus('sent');
    form.reset();
  }

  return (
    <section id="contact" className="section contact-section">
      <SectionHeader number="05" title="Start a focused project conversation">
        Share the business problem, the current constraints and what a successful first version
        should prove. You will get a concrete next step, not a generic hourly quote.
      </SectionHeader>
      <div className="contact-grid">
        <div className="contact-aside">
          <h3>Good fit</h3>
          <p>
            MVPs, SaaS portals, mobile apps, internal systems, AI product architecture, EU-funded
            software, Web3/fintech flows and integration-heavy business tools.
          </p>
          <div className="contact-methods">
            <a href="mailto:dimitar@jilanov.com" data-track="email-contact"><Mail size={18} /> dimitar@jilanov.com</a>
            <a href="tel:+359888283711" data-track="phone-contact"><Phone size={18} /> +359 888 283 711</a>
            <a href="https://jilanov.com/en/info/software-development" data-track="source-site" target="_blank" rel="noreferrer">
              <ExternalLink size={18} /> Jilanov.com profile
            </a>
          </div>
        </div>
        <form className="lead-form" onSubmit={submit}>
          <div className="form-grid">
            <label>Name<input name="name" autoComplete="name" required /></label>
            <label>Company<input name="company" autoComplete="organization" /></label>
            <label>Email<input type="email" name="email" autoComplete="email" required /></label>
            <label>Phone<input type="tel" name="phone" autoComplete="tel" /></label>
            <label>
              Preferred package
              <select name="package" defaultValue="Discovery Sprint">
                <option>Discovery Sprint</option>
                <option>MVP Build</option>
                <option>Scale & Automate</option>
                <option>Not sure</option>
              </select>
            </label>
            <label>
              Project type
              <select name="projectType" defaultValue="SaaS / portal">
                <option>SaaS / portal</option>
                <option>Internal system</option>
                <option>AI product / architecture</option>
                <option>Mobile app</option>
                <option>Ecommerce</option>
                <option>EU project</option>
                <option>Other</option>
              </select>
            </label>
            <label>
              Indicative budget
              <select name="budget" defaultValue="not defined">
                <option>under 5,000 EUR</option>
                <option>5,000 - 15,000 EUR</option>
                <option>15,000 - 50,000 EUR</option>
                <option>50,000+ EUR</option>
                <option>not defined</option>
              </select>
            </label>
            <label>
              Desired start
              <select name="timeline" defaultValue="within 1 month">
                <option>immediately</option>
                <option>within 1 month</option>
                <option>1-3 months</option>
                <option>after 3+ months</option>
                <option>research only</option>
              </select>
            </label>
          </div>
          <label>What should the project achieve?<textarea name="message" rows="5" required /></label>
          <button className="primary-button" type="submit" disabled={status === 'sending'} data-track="lead-form-submit">
            {status === 'sending' ? 'Sending...' : 'Send project brief'} <Send size={17} />
          </button>
          {status === 'sent' && <p className="form-success">Thanks. Your project brief has been received.</p>}
          {error && <p className="form-error">{error}</p>}
        </form>
      </div>
    </section>
  );
}

function AdminApp() {
  const adminBase = 'https://admin.jilanov.com';
  return (
    <main className="admin-login admin-handoff">
      <section>
        <Lock size={28} />
        <h1>Admin moved to EU Webstore</h1>
        <p>
          Traffic, sources, campaigns and software leads are managed from the Webstore admin.
        </p>
        <div className="handoff-actions">
          <a className="primary-button" href={`${adminBase}/ecommerce/software-leads`}>
            Open software leads
          </a>
          <a className="secondary-button" href={`${adminBase}/ecommerce/contact-messages`}>
            Contact messages
          </a>
        </div>
        <small>Use toni-website@jilanov.com in the main admin panel.</small>
      </section>
    </main>
  );
}

function Dashboard() {
  const [days, setDays] = useState(30);
  const [data, setData] = useState(null);
  const [copied, setCopied] = useState('');

  async function load() {
    const response = await fetch(`/api/admin/analytics?days=${days}`, { credentials: 'include' });
    if (response.ok) setData(await response.json());
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, 20000);
    return () => clearInterval(interval);
  }, [days]);

  const campaignLinks = useMemo(() => {
    const base = `${window.location.origin}/`;
    return [
      ['Hacker News', `${base}?utm_source=hackernews&utm_medium=community&utm_campaign=software_leads_launch`],
      ['Reddit', `${base}?utm_source=reddit&utm_medium=community&utm_campaign=software_leads_launch`],
      ['Indie Hackers', `${base}?utm_source=indiehackers&utm_medium=community&utm_campaign=software_leads_launch`],
      ['LinkedIn', `${base}?utm_source=linkedin&utm_medium=social&utm_campaign=software_leads_launch`]
    ];
  }, []);

  async function copyLink(label, url) {
    await navigator.clipboard.writeText(url);
    setCopied(label);
    setTimeout(() => setCopied(''), 1600);
  }

  if (!data) return <div className="admin-loading">Loading dashboard...</div>;

  return (
    <main className="admin-shell">
      <header className="admin-header">
        <div>
          <p className="eyebrow">Private admin panel</p>
          <h1>Engagement and lead tracking</h1>
          {data.requestsWarning && <span className="warning">Requests warning: {data.requestsWarning}</span>}
          {data.adminEmail && <p className="admin-meta">Signed in as {data.adminEmail}. Requests notify {data.contactRecipient}.</p>}
        </div>
        <div className="admin-controls">
          <select value={days} onChange={(event) => setDays(Number(event.target.value))}>
            <option value="7">7 days</option>
            <option value="30">30 days</option>
            <option value="90">90 days</option>
            <option value="365">365 days</option>
          </select>
          <a className="secondary-button" href="/">View site</a>
        </div>
      </header>

      <section className="admin-stats">
        <Stat icon={Users} label="Visitors" value={data.totals.visitors} />
        <Stat icon={Eye} label="Page views" value={data.totals.pageViews} />
        <Stat icon={MousePointerClick} label="CTA clicks" value={data.totals.ctaClicks} />
        <Stat icon={Send} label="Leads" value={data.totals.leads} />
        <Stat icon={Clock3} label="Avg engagement" value={`${data.totals.avgEngagementSeconds}s`} />
        <Stat icon={Gauge} label="Max scroll" value={`${data.totals.maxScrollDepth}%`} />
      </section>

      <section className="dashboard-grid">
        <Panel title="Traffic sources" items={data.topSources} />
        <Panel title="Referrers" items={data.topReferrers} />
        <Panel title="Top pages" items={data.topPaths} />
        <Panel title="CTA clicks" items={data.topClicks} empty="No clicks yet." />
        <Panel title="Campaigns" items={data.campaigns} empty="No UTM campaigns yet." />
        <Panel title="Devices" items={data.devices} />
        <Panel title="Timezones" items={data.topTimezones} empty="No timezone data yet." />
        <Panel title="Languages" items={data.topLanguages} empty="No language data yet." />
      </section>

      <section className="campaign-builder">
        <div>
          <p className="eyebrow">Share links</p>
          <h2>Campaign URLs for HN, Reddit and founder communities</h2>
          <p>Use these links when posting. The dashboard will separate the traffic automatically.</p>
        </div>
        <div className="campaign-list">
          {campaignLinks.map(([label, url]) => (
            <button key={label} onClick={() => copyLink(label, url)}>
              <span>{label}</span>
              <small>{url}</small>
              <Copy size={16} />
            </button>
          ))}
        </div>
        {copied && <span className="copy-toast">Copied {copied}</span>}
      </section>

      <section className="leads-section">
        <div className="section-header compact">
          <h2>Recent project requests</h2>
          <p>Contact submissions are loaded from the jilanov.com admin API with campaign and source context.</p>
        </div>
        <div className="lead-table">
          {data.leads.length ? data.leads.map((item) => (
            <article key={item.id}>
              <div>
                <b>{item.lead?.name}</b>
                <span>{item.lead?.company || 'No company'} · {item.lead?.email}</span>
              </div>
              <p>{item.lead?.message}</p>
              <small>{item.lead?.projectType || 'Project'} · {item.lead?.budget || 'Budget not set'} · {item.source || 'direct'} · {item.emailStatus || item.status || 'new'}</small>
            </article>
          )) : <p className="empty-state">No project requests yet.</p>}
        </div>
      </section>

      <section className="events-section">
        <div className="section-header compact">
          <h2>Recent events</h2>
          <p>Page views, scroll depth, clicks, engagement time and leads.</p>
        </div>
        <div className="events-table">
          {data.recentEvents.map((event) => (
            <div key={event.id}>
              <span>{new Date(event.timestamp).toLocaleString()}</span>
              <b>{event.type}</b>
              <span>{event.source || event.referrerDomain || 'direct'}</span>
              <span>{event.path}</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

function Stat({ icon: Icon, label, value }) {
  return (
    <div className="admin-stat">
      <Icon size={19} />
      <span>{label}</span>
      <b>{value}</b>
    </div>
  );
}

function Panel({ title, items = [], empty = 'No data yet.' }) {
  const max = Math.max(1, ...items.map((item) => item.value));
  return (
    <article className="admin-panel">
      <h3>{title}</h3>
      <div className="bar-list">
        {items.length ? items.map((item) => (
          <div className="bar-row" key={item.name}>
            <div>
              <span>{item.name}</span>
              <b>{item.value}</b>
            </div>
            <i style={{ '--width': `${Math.max(6, (item.value / max) * 100)}%` }} />
          </div>
        )) : <p className="empty-state">{empty}</p>}
      </div>
    </article>
  );
}

createRoot(document.getElementById('root')).render(<App />);
