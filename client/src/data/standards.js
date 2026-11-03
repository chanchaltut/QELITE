// ═══════════════════════════════════════════════════════════
//  Certification programmes — defaults for admin → "Standards".
// ═══════════════════════════════════════════════════════════

import { fromContent } from '../lib/content.js';

export const STANDARDS_DEFAULT = [
  {
    code: 'ISO 9001:2015',
    title: 'Quality Management System',
    slug: 'iso-9001',
    family: 'Quality',
    icon: 'ri-medal-line',
    visible: true,
    featured: true,
    shortDesc: 'The world’s most widely used management standard. It shows customers that you deliver consistently and keep improving.',
    overview:
      'ISO 9001 sets out the requirements for a quality management system: how you understand customer needs, plan and control your work, manage risk, and measure and improve results. Certification shows tender committees, customers and partners that your processes are defined, followed and reviewed. It does not mean you never make mistakes; it means you find them, fix them and learn from them.',
    whoFor: [
      'Manufacturers and engineering firms',
      'Service providers and consultancies',
      'Suppliers bidding for government and PSU tenders',
      'Exporters whose buyers ask for certified suppliers',
    ],
    benefits: [
      'Meets a common requirement in tenders and vendor registration',
      'Fewer errors, rework and customer complaints',
      'Clear responsibilities and documented ways of working',
      'A framework for continual improvement that management can see',
    ],
    focus: [
      'Context of the organisation and interested parties',
      'Leadership commitment and the quality policy',
      'Risk-based planning and quality objectives',
      'Control of operations, suppliers and outsourced processes',
      'Monitoring, internal audit and management review',
      'Nonconformity, corrective action and continual improvement',
    ],
    faqs: [
      { q: 'How long does ISO 9001 certification take?', a: 'Most organisations that already have their system in place complete the Stage 1 and Stage 2 audits within four to eight weeks. The exact time depends on size, the number of sites and how ready your documentation is.' },
      { q: 'Do we need to be a large company?', a: 'No. ISO 9001 works for organisations of any size, from a five-person service firm to a multi-site manufacturer. The audit duration is scaled to your headcount and complexity.' },
    ],
  },
  {
    code: 'ISO 14001:2015',
    title: 'Environmental Management System',
    slug: 'iso-14001',
    family: 'Environment',
    icon: 'ri-leaf-line',
    visible: true,
    featured: true,
    shortDesc: 'Shows that you manage your environmental impact, meet your legal obligations and work to reduce waste and emissions.',
    overview:
      'ISO 14001 helps an organisation identify the environmental aspects of what it does, such as energy, emissions, effluents, waste and resource use, and control them systematically. It is built around compliance with environmental law and measurable improvement. Certification gives regulators, investors and customers independent evidence that environmental risk is being managed.',
    whoFor: [
      'Manufacturing and process industries',
      'Construction and infrastructure contractors',
      'Companies reporting on ESG and sustainability',
      'Suppliers to multinational buyers with green procurement rules',
    ],
    benefits: [
      'Better control of legal and permit compliance',
      'Lower consumption of energy, water and materials',
      'Stronger ESG and sustainability reporting',
      'Preferred-supplier status with environmentally conscious buyers',
    ],
    focus: [
      'Environmental aspects, impacts and lifecycle perspective',
      'Compliance obligations and how they are evaluated',
      'Environmental objectives and action plans',
      'Operational control and emergency preparedness',
      'Monitoring, measurement and evaluation of compliance',
    ],
    faqs: [
      { q: 'Do we need all our environmental permits before certification?', a: 'You need to know which legal requirements apply to you and show how you are meeting them. Where something is pending, the audit looks at whether you have identified it and are managing it.' },
    ],
  },
  {
    code: 'ISO 45001:2018',
    title: 'Occupational Health & Safety Management System',
    slug: 'iso-45001',
    family: 'Health & Safety',
    icon: 'ri-shield-user-line',
    visible: true,
    featured: true,
    shortDesc: 'The international standard for keeping workers safe. It replaced OHSAS 18001 and focuses on preventing injury and ill health.',
    overview:
      'ISO 45001 provides a framework to identify hazards, assess and control occupational health and safety risks, involve workers, and comply with safety law. It replaced OHSAS 18001 and puts more emphasis on leadership and worker participation. Certification is increasingly required by principal employers, EPC contractors and public-sector buyers.',
    whoFor: [
      'Factories, plants and warehouses',
      'Construction, installation and maintenance contractors',
      'Hospitals, laboratories and facility operators',
      'Any employer with significant on-site risk',
    ],
    benefits: [
      'Fewer incidents, lost-time injuries and disruptions',
      'Evidence of due diligence for regulators and insurers',
      'Meets contractor pre-qualification requirements',
      'A safety culture that involves the workforce',
    ],
    focus: [
      'Hazard identification and risk assessment',
      'Legal requirements and how compliance is evaluated',
      'Consultation and participation of workers',
      'Operational controls, contractors and management of change',
      'Incident investigation, emergency preparedness and improvement',
    ],
    faqs: [
      { q: 'We hold OHSAS 18001. What changes?', a: 'OHSAS 18001 has been withdrawn. ISO 45001 adds a stronger focus on leadership, worker participation and the context of the organisation. We can review your existing system and plan a migration audit.' },
    ],
  },
  {
    code: 'ISO 13485:2016',
    title: 'Medical Devices — Quality Management System',
    slug: 'iso-13485',
    family: 'Medical Devices',
    icon: 'ri-heart-pulse-line',
    visible: true,
    featured: true,
    shortDesc: 'The quality standard for organisations that design, make, install, service or supply medical devices.',
    overview:
      'ISO 13485 is a quality management standard written specifically for the medical device sector. It stresses regulatory compliance, risk management, traceability, validation and control of suppliers across the device lifecycle. Certification is widely expected by hospitals, distributors and regulators, and supports regulatory filings in many markets.',
    whoFor: [
      'Medical device manufacturers and contract manufacturers',
      'Medical gas pipeline, OT and ICU installation firms',
      'Distributors, importers and service providers for devices',
      'Component and sterilisation suppliers',
    ],
    benefits: [
      'Supports regulatory and hospital tender requirements',
      'Risk-based control across design, production and service',
      'Full traceability and controlled records',
      'Confidence for distributors and healthcare buyers',
    ],
    focus: [
      'Regulatory requirements and the quality manual',
      'Risk management across product realisation',
      'Design and development controls (where applicable)',
      'Purchasing, supplier control and traceability',
      'Installation, servicing, complaints and feedback',
      'Corrective and preventive action (CAPA)',
    ],
    faqs: [
      { q: 'Can installation and servicing companies be certified?', a: 'Yes. ISO 13485 applies to any organisation involved in the device lifecycle, including installation, commissioning and servicing. The scope on the certificate states exactly which activities are covered.' },
    ],
  },
  {
    code: 'ISO 22000:2018',
    title: 'Food Safety Management System',
    slug: 'iso-22000',
    family: 'Food Safety',
    icon: 'ri-restaurant-line',
    visible: true,
    featured: true,
    shortDesc: 'Combines HACCP principles with a full management system, for any organisation in the food chain.',
    overview:
      'ISO 22000 brings together prerequisite programmes, HACCP principles and a management-system structure to control food safety hazards from farm to fork. It applies to producers, processors, packers, caterers, storage and transport providers and suppliers of food-contact materials. Certification demonstrates a systematic, preventive approach to food safety.',
    whoFor: [
      'Food and beverage manufacturers and processors',
      'Restaurants, caterers and cloud kitchens',
      'Cold-chain, storage and logistics providers',
      'Packaging and food-contact material suppliers',
    ],
    benefits: [
      'Prevents contamination and costly recalls',
      'Supports FSSAI compliance and buyer audits',
      'Builds trust with retailers and export markets',
      'Clear hazard control throughout the supply chain',
    ],
    focus: [
      'Prerequisite programmes (PRPs) and hygiene',
      'Hazard analysis and the HACCP / OPRP plan',
      'Traceability, withdrawal and recall',
      'Verification, validation and monitoring of controls',
      'Supplier and external provider control',
    ],
    faqs: [
      { q: 'What is the difference between ISO 22000 and HACCP?', a: 'HACCP is a method for analysing and controlling food safety hazards. ISO 22000 includes HACCP and adds a complete management system around it, covering leadership, planning, documentation, internal audit and improvement.' },
    ],
  },
  {
    code: 'ISO/IEC 27001:2022',
    title: 'Information Security Management System',
    slug: 'iso-27001',
    family: 'Information & IT',
    icon: 'ri-lock-2-line',
    visible: true,
    featured: true,
    shortDesc: 'Protects the confidentiality, integrity and availability of information, and is often required by enterprise clients.',
    overview:
      'ISO/IEC 27001 sets out how to establish, run and improve an information security management system. Information risks are assessed and treated using controls from Annex A, which cover organisational, people, physical and technological measures. Certification is increasingly a condition of doing business with banks, enterprises and overseas clients.',
    whoFor: [
      'IT, SaaS and software development companies',
      'BPOs, KPOs and data-processing service providers',
      'Fintech, healthcare and other data-heavy businesses',
      'Vendors answering enterprise security questionnaires',
    ],
    benefits: [
      'Answers client security due diligence in one step',
      'Reduces the likelihood and impact of data breaches',
      'Supports data-protection compliance',
      'Gives management a clear view of information risk',
    ],
    focus: [
      'Scope, information assets and interested parties',
      'Risk assessment, risk treatment and the Statement of Applicability',
      'Annex A controls: organisational, people, physical and technological',
      'Access control, supplier security and incident management',
      'Monitoring, internal audit and management review',
    ],
    faqs: [
      { q: 'We are certified to the 2013 version. Do we need to transition?', a: 'Yes. Certificates to ISO/IEC 27001:2013 have reached the end of their transition period. Certification to the 2022 edition is assessed against the updated Annex A controls.' },
    ],
  },
  {
    code: 'HACCP',
    title: 'Hazard Analysis & Critical Control Points',
    slug: 'haccp',
    family: 'Food Safety',
    icon: 'ri-temp-cold-line',
    visible: true,
    featured: false,
    shortDesc: 'A focused food safety certification based on the Codex HACCP principles, ideal as a first step for smaller food businesses.',
    overview:
      'HACCP certification confirms that a food business has identified the biological, chemical and physical hazards in its process, set critical control points and critical limits, and monitors and records them. It follows the Codex Alimentarius principles and suits businesses that need a recognised food safety credential without a full management system.',
    whoFor: ['Small and mid-sized food manufacturers', 'Hotels, restaurants and caterers', 'Dairy, bakery, spice and snack units', 'Food exporters starting their certification journey'],
    benefits: ['A recognised food safety credential', 'Systematic control of critical hazards', 'Easier buyer and FSSAI inspections', 'A foundation for ISO 22000 later'],
    focus: ['Process flow and hazard analysis', 'Critical control points and critical limits', 'Monitoring, corrective action and verification', 'Record-keeping and prerequisite programmes'],
    faqs: [],
  },
  {
    code: 'ISO 50001:2018',
    title: 'Energy Management System',
    slug: 'iso-50001',
    family: 'Energy',
    icon: 'ri-flashlight-line',
    visible: true,
    featured: false,
    shortDesc: 'A systematic way to measure, manage and reduce energy use, with results you can show in numbers.',
    overview:
      'ISO 50001 helps organisations establish an energy baseline, identify significant energy uses, set energy performance indicators and improve them over time. It turns energy efficiency from a one-off project into a managed process, and supports reporting obligations for large energy consumers.',
    whoFor: ['Energy-intensive manufacturers', 'Commercial buildings and campuses', 'Designated consumers under energy-efficiency rules', 'Companies with net-zero targets'],
    benefits: ['Measurable reduction in energy cost', 'Data-driven energy decisions', 'Supports emissions and ESG reporting', 'Integrates with ISO 14001'],
    focus: ['Energy review and significant energy uses', 'Energy baseline and performance indicators', 'Objectives, targets and action plans', 'Measurement, monitoring and improvement of energy performance'],
    faqs: [],
  },
  {
    code: 'ISO 22301:2019',
    title: 'Business Continuity Management System',
    slug: 'iso-22301',
    family: 'Business Continuity',
    icon: 'ri-refresh-line',
    visible: true,
    featured: false,
    shortDesc: 'Proves that you can keep critical services running through disruption, and recover quickly when something goes wrong.',
    overview:
      'ISO 22301 sets out how to identify the activities that matter most, assess the impact of disruption, and put in place tested strategies and plans to continue and recover. It is valued by clients in banking, IT services and critical supply chains, who need assurance that their suppliers will not fail when they are needed most.',
    whoFor: ['IT and outsourcing service providers', 'Banks, NBFCs and payment companies', 'Logistics and critical suppliers', 'Data centres and telecom operators'],
    benefits: ['Shorter, controlled recovery from incidents', 'Assurance for clients and regulators', 'Tested plans instead of untested documents', 'Better understanding of operational risk'],
    focus: ['Business impact analysis and risk assessment', 'Continuity strategies and solutions', 'Business continuity plans and procedures', 'Exercise programme and evaluation'],
    faqs: [],
  },
  {
    code: 'ISO 37001:2016',
    title: 'Anti-bribery Management System',
    slug: 'iso-37001',
    family: 'Social & Governance',
    icon: 'ri-scales-3-line',
    visible: true,
    featured: false,
    shortDesc: 'Shows that reasonable and proportionate measures are in place to prevent, detect and respond to bribery.',
    overview:
      'ISO 37001 specifies the controls an organisation needs to prevent bribery: an anti-bribery policy, a compliance function, risk assessment, due diligence on business associates, financial and non-financial controls, training and reporting channels. Certification supports good governance and is increasingly asked for by public-sector and international clients.',
    whoFor: ['Companies working with government bodies', 'Infrastructure and EPC contractors', 'Organisations with agents and intermediaries', 'Exporters and multinational suppliers'],
    benefits: ['Demonstrates integrity to clients and regulators', 'Reduces legal and reputational risk', 'Structured due diligence on partners', 'Clear whistle-blowing and investigation process'],
    focus: ['Bribery risk assessment', 'Due diligence on transactions, projects and associates', 'Financial and non-financial controls', 'Raising concerns, investigation and corrective action'],
    faqs: [],
  },
  {
    code: 'ISO 21001:2018',
    title: 'Educational Organisations Management System',
    slug: 'iso-21001',
    family: 'Quality',
    icon: 'ri-graduation-cap-line',
    visible: true,
    featured: false,
    shortDesc: 'A quality standard built for schools, colleges, training institutes and e-learning providers.',
    overview:
      'ISO 21001 adapts the principles of ISO 9001 to education. It focuses on the needs of learners and other beneficiaries, the design and delivery of educational programmes, assessment, and the competence of educators. It helps institutions show parents, students and accreditation bodies that teaching and administration are managed to a recognised standard.',
    whoFor: ['Schools and colleges', 'Vocational and corporate training providers', 'Coaching institutes', 'E-learning platforms'],
    benefits: ['Learner-focused processes', 'Consistent programme design and assessment', 'Greater confidence for parents and partners', 'Supports institutional accreditation'],
    focus: ['Learner and beneficiary requirements', 'Design and delivery of educational programmes', 'Assessment of learning', 'Competence of educators and support staff'],
    faqs: [],
  },
  {
    code: 'ISO/IEC 20000-1:2018',
    title: 'IT Service Management System',
    slug: 'iso-20000-1',
    family: 'Information & IT',
    icon: 'ri-server-line',
    visible: true,
    featured: false,
    shortDesc: 'The international standard for planning, delivering and improving IT services, aligned with ITIL practice.',
    overview:
      'ISO/IEC 20000-1 sets requirements for a service management system covering service planning, design, transition, delivery and improvement. It gives clients confidence that IT services are run through defined processes for incidents, changes, service levels and suppliers, rather than depending on individuals.',
    whoFor: ['Managed service providers', 'In-house IT departments', 'Data centre and cloud operators', 'IT support and AMC providers'],
    benefits: ['Reliable, measurable service levels', 'Fewer outages through change control', 'A strong credential for IT tenders', 'Works alongside ISO/IEC 27001'],
    focus: ['Service portfolio and service level management', 'Incident, request and problem management', 'Change, release and deployment management', 'Supplier and relationship management'],
    faqs: [],
  },
  {
    code: 'GMP',
    title: 'Good Manufacturing Practice',
    slug: 'gmp',
    family: 'Product Compliance',
    icon: 'ri-flask-line',
    visible: true,
    featured: false,
    shortDesc: 'Independent assessment of manufacturing practices for cosmetics, nutraceuticals, food supplements and similar products.',
    overview:
      'GMP certification assesses whether products are consistently produced and controlled to quality standards appropriate to their intended use. It covers premises, equipment, hygiene, raw-material control, documentation, batch records, quality control and complaint handling. Where a regulator licenses GMP for your product category, that licence remains a separate, mandatory requirement.',
    whoFor: ['Cosmetics and personal-care manufacturers', 'Nutraceutical and food supplement units', 'Ayurvedic and herbal product makers', 'Contract and private-label manufacturers'],
    benefits: ['Consistent product quality, batch after batch', 'Readiness for buyer and regulator inspections', 'Controlled documentation and batch records', 'A credible quality signal for distributors'],
    focus: ['Premises, equipment and hygiene', 'Raw material and packaging control', 'Batch manufacturing and documentation', 'Quality control, release and complaint handling'],
    faqs: [],
  },
];

export const STANDARDS_ALL = fromContent('standards', 'items', STANDARDS_DEFAULT);
export const STANDARDS = STANDARDS_ALL.filter((s) => s.visible !== false && s.slug);
export const FEATURED_STANDARDS = STANDARDS.filter((s) => s.featured);

export const standardBySlug = (slug) => STANDARDS.find((s) => s.slug === slug);

/** Families in use, in the order they first appear. */
export const STANDARD_FAMILIES_IN_USE = [...new Set(STANDARDS.map((s) => s.family))];
