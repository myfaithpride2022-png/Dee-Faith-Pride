export interface Service {
  slug: string;
  name: string;
  description: string;
  category: string;
  categorySlug: string;
  details: string[];
}

export const categories = [
  {
    slug: "printing-documents",
    name: "Printing & document services",
    description: "Printing, photocopying, scanning, typing, and assignments.",
  },
  {
    slug: "online-registration",
    name: "Online registration",
    description: "Guided online applications, registrations, and payments.",
  },
  {
    slug: "exams-scratch-cards",
    name: "Exams, results & scratch cards",
    description: "JAMB, WAEC, NECO, NABTEB and result-checking enquiries.",
  },
  {
    slug: "graphics-large-format",
    name: "Graphics & large-format printing",
    description: "Graphic design, flex banners, and stickers.",
  },
  {
    slug: "web-ai-research",
    name: "Web, AI & research services",
    description:
      "Coding, website design, AI-assisted content creation, and project research support.",
  },
  {
    slug: "airtime-data",
    name: "Airtime & mobile data",
    description: "Airtime and data requests across supported networks.",
  },
  {
    slug: "bills-subscriptions",
    name: "Bills & TV subscriptions",
    description: "Prepaid electricity and decoder subscription assistance.",
  },
  {
    slug: "other-digital-services",
    name: "Other digital services",
    description: "Ask us about another cybercafé or digital service.",
  },
] as const;

export const services: Service[] = [
  {
    slug: "document-printing",
    name: "Document printing",
    description:
      "Print documents and files for school, work, applications, and everyday use.",
    category: "Printing & document services",
    categorySlug: "printing-documents",
    details: [
      "Tell us the document size and number of copies.",
      "Ask about colour or black-and-white printing.",
      "Send the file in WhatsApp after opening your enquiry chat.",
    ],
  },
  {
    slug: "photocopying",
    name: "Photocopying",
    description: "Make clear copies of documents and other paper materials.",
    category: "Printing & document services",
    categorySlug: "printing-documents",
    details: [
      "Tell us the number of pages and copies.",
      "Ask about paper size.",
    ],
  },
  {
    slug: "document-scanning",
    name: "Document scanning",
    description:
      "Scan paper documents into digital files for submission or safekeeping.",
    category: "Printing & document services",
    categorySlug: "printing-documents",
    details: ["Ask for PDF or image output.", "Tell us the number of pages."],
  },
  {
    slug: "typing-document-preparation",
    name: "Typing & document preparation",
    description:
      "Get help typing, formatting, and preparing letters or other documents.",
    category: "Printing & document services",
    categorySlug: "printing-documents",
    details: [
      "Describe the document and deadline.",
      "Share source notes or files in WhatsApp if relevant.",
    ],
  },
  {
    slug: "assignment-support",
    name: "Assignment typing & formatting",
    description:
      "Typing, layout, and print preparation support for assignments and projects.",
    category: "Printing & document services",
    categorySlug: "printing-documents",
    details: [
      "Tell us the page count and required format.",
      "Send your own notes or draft; we do not complete academic work dishonestly.",
    ],
  },
  {
    slug: "online-registration",
    name: "Online registration & applications",
    description:
      "Get in-person guidance with online registrations, applications, and form submission.",
    category: "Online registration",
    categorySlug: "online-registration",
    details: [
      "Tell us the programme, institution, or application.",
      "Bring required documents and your own account access.",
      "Never send account passwords in chat.",
    ],
  },
  {
    slug: "online-payment-assistance",
    name: "Online payment assistance",
    description:
      "Get help with an eligible online payment or registration process.",
    category: "Online registration",
    categorySlug: "online-registration",
    details: [
      "Tell us which payment or registration you need help with.",
      "Confirm the official fee and our service charge before proceeding.",
      "Do not send PINs, passwords, or one-time codes.",
    ],
  },
  {
    slug: "jamb-services",
    name: "JAMB services",
    description:
      "Ask about available JAMB registration, application, and candidate-support services.",
    category: "Exams, results & scratch cards",
    categorySlug: "exams-scratch-cards",
    details: [
      "Tell us the JAMB service you need and any relevant deadline.",
      "Bring your own required details and documents.",
    ],
  },
  {
    slug: "waec-services",
    name: "WAEC services",
    description:
      "Ask about WAEC-related registration, result-checking, and candidate support.",
    category: "Exams, results & scratch cards",
    categorySlug: "exams-scratch-cards",
    details: [
      "Tell us the WAEC service and examination year.",
      "Result checking and registration are subject to official requirements.",
    ],
  },
  {
    slug: "neco-services",
    name: "NECO services",
    description:
      "Ask about NECO-related registration, result-checking, and candidate support.",
    category: "Exams, results & scratch cards",
    categorySlug: "exams-scratch-cards",
    details: [
      "Tell us the NECO service and examination year.",
      "Bring the required candidate details when confirmed.",
    ],
  },
  {
    slug: "nabteb-services",
    name: "NABTEB services",
    description: "Enquire about NABTEB registration and examination support.",
    category: "Exams, results & scratch cards",
    categorySlug: "exams-scratch-cards",
    details: ["Tell us the registration or examination service you need."],
  },
  {
    slug: "exam-scratch-cards-tokens",
    name: "Exam scratch cards & result tokens",
    description:
      "Enquire about available examination scratch cards, PINs, or result-checking tokens.",
    category: "Exams, results & scratch cards",
    categorySlug: "exams-scratch-cards",
    details: [
      "Specify the examination body and product you need.",
      "Availability and current price are confirmed before you pay.",
    ],
  },
  {
    slug: "graphic-design",
    name: "Graphic design",
    description:
      "Discuss artwork for flyers, invitations, business materials, and other design needs.",
    category: "Graphics & large-format printing",
    categorySlug: "graphics-large-format",
    details: [
      "Describe the design and where it will be used.",
      "Share text, preferred colours, and reference files in WhatsApp.",
    ],
  },
  {
    slug: "flex-banner-printing",
    name: "Flex banner design & printing",
    description:
      "Enquire about banner artwork, dimensions, material, and print turnaround.",
    category: "Graphics & large-format printing",
    categorySlug: "graphics-large-format",
    details: [
      "Provide the required banner dimensions.",
      "Share design text, logo files, or artwork in WhatsApp.",
    ],
  },
  {
    slug: "sticker-design-printing",
    name: "Sticker design & printing",
    description:
      "Discuss custom sticker artwork, sizes, quantities, and print options.",
    category: "Graphics & large-format printing",
    categorySlug: "graphics-large-format",
    details: [
      "Tell us the sticker size, shape, and quantity.",
      "Attach any design or logo files in WhatsApp.",
    ],
  },
  {
    slug: "airtime-data",
    name: "Airtime & mobile data",
    description:
      "Enquire about airtime and data for supported Nigerian mobile networks.",
    category: "Airtime & mobile data",
    categorySlug: "airtime-data",
    details: [
      "Specify the network, phone number, and amount or plan.",
      "Confirm current availability and price before payment.",
    ],
  },
  {
    slug: "prepaid-electricity",
    name: "Prepaid electricity bill assistance",
    description:
      "Enquire about supported prepaid electricity payments and meter services.",
    category: "Bills & TV subscriptions",
    categorySlug: "bills-subscriptions",
    details: [
      "Tell us your electricity distribution provider and request.",
      "Share meter details only after discussing the request with the business.",
      "A token is not issued until the payment and transaction are verified.",
    ],
  },
  {
    slug: "decoder-subscriptions",
    name: "Decoder subscriptions",
    description:
      "Get help enquiring about supported decoder packages and subscriptions.",
    category: "Bills & TV subscriptions",
    categorySlug: "bills-subscriptions",
    details: [
      "Specify the provider and package.",
      "Have your decoder or customer number ready when requested.",
    ],
  },
  {
    slug: "other-cybercafe-service",
    name: "Ask about another service",
    description:
      "Need a different cybercafé or digital service? Tell us what you need.",
    category: "Other digital services",
    categorySlug: "other-digital-services",
    details: ["Describe the service and any deadline or file requirements."],
  },
  {
    slug: "coding-website-design",
    name: "Coding & website design",
    description:
      "Enquire about website design, development, or coding support for your project or business.",
    category: "Web, AI & research services",
    categorySlug: "web-ai-research",
    details: [
      "Describe the website or coding task and its intended users.",
      "Share any design references or existing project files in WhatsApp.",
      "Scope, timeline, and price are agreed before work begins.",
    ],
  },
  {
    slug: "ai-content-creation",
    name: "AI-assisted content creation",
    description:
      "Get help planning and creating AI-assisted content drafts for your business or project.",
    category: "Web, AI & research services",
    categorySlug: "web-ai-research",
    details: [
      "Tell us the content type, audience, and intended platform.",
      "Drafts should be reviewed for accuracy and suitability before publication.",
      "Share your brief and any required brand guidance in WhatsApp.",
    ],
  },
  {
    slug: "project-research-support",
    name: "Project research support",
    description:
      "Enquire about research planning, source discovery, outlining, and document formatting support.",
    category: "Web, AI & research services",
    categorySlug: "web-ai-research",
    details: [
      "Describe your topic, course or field, and project requirements.",
      "Support focuses on research guidance, sources, planning, and formatting.",
      "Customers remain responsible for their own analysis and submitted academic work.",
    ],
  },
];

export const providerGroups = [
  {
    label: "Mobile networks",
    providers: ["MTN", "Airtel", "Glo", "9mobile"],
  },
  {
    label: "Examination services",
    providers: ["JAMB", "WAEC", "NECO", "NABTEB"],
  },
  {
    label: "Electricity",
    providers: ["BEDC"],
  },
  {
    label: "TV subscriptions",
    providers: ["DStv", "GOtv", "StarTimes"],
  },
] as const;
