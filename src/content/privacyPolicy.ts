export type LegalSection = {
  heading: string
  paragraphs: string[]
  bullets?: string[]
}

export const privacyPolicy = {
  title: 'Privacy Policy',
  eyebrow: 'Privacy & data',
  intro:
    'This Privacy Policy describes how Hanz Logistics (“Hanz,” “we,” “us,” or “our”) may collect, use, and protect information when you visit our website, request a quote, track a shipment, or communicate with our operations team.',
  sections: [
    {
      heading: '1. Who we are',
      paragraphs: [
        'Hanz Logistics is an air freight forwarder coordinating domestic and worldwide cargo movements. For privacy questions related to this website or shipment communications, contact:',
      ],
      bullets: [
        'operations@hanzlogistics.com',
        'info@hanzlogistics.com',
        '(412) 345-3837',
      ],
    },
    {
      heading: '2. Information we may collect',
      paragraphs: [
        'Depending on how you interact with Hanz, we may collect information you provide directly and information generated through ordinary website or operational use.',
      ],
      bullets: [
        'Contact and company details submitted through quote requests or inquiry forms (such as name, company, email, phone, and shipment particulars).',
        'Shipment identifiers and related logistics details used for tracking and operations (including Hanz reference numbers and carrier air waybills / AWBs when provided).',
        'Communications with Hanz by phone, email, or other channels you choose to use.',
        'Technical information commonly collected by websites, such as browser type, device information, approximate location derived from IP address, pages visited, and referral source, where analytics or similar tools are enabled.',
        'Cookie or similar technology data, if used to support website performance, preferences, or analytics.',
      ],
    },
    {
      heading: '3. How we use information',
      paragraphs: [
        'We use information to operate our logistics services and website in a manner consistent with the purpose for which it was provided.',
      ],
      bullets: [
        'Responding to quote requests and coordinating shipments.',
        'Providing shipment visibility and status updates through tracking tools and operator communications.',
        'Maintaining operational records needed for pickup, tender, transit, delivery, and customer support.',
        'Improving website reliability, security, and user experience.',
        'Complying with applicable legal, regulatory, customs, aviation-security, or contractual obligations where required.',
      ],
    },
    {
      heading: '4. Cookies and analytics',
      paragraphs: [
        'Our website may use cookies or similar technologies that are necessary for basic site function and, where enabled, to understand aggregate site usage. You may be able to control cookies through your browser settings; disabling certain cookies may affect site functionality.',
      ],
    },
    {
      heading: '5. Sharing of information',
      paragraphs: [
        'Hanz does not sell personal information. We may share information only as needed to move freight, support customers, operate the website, or meet legal obligations. Typical sharing may include:',
      ],
      bullets: [
        'Carriers, airlines, ground handlers, customs brokers, and other logistics partners involved in a shipment.',
        'Service providers that host, secure, or support our website, databases, communications, or tracking systems, under appropriate confidentiality and security expectations.',
        'Professional advisors or authorities when disclosure is required by law, regulation, safety, or to protect rights and operations.',
      ],
    },
    {
      heading: '6. International transfers',
      paragraphs: [
        'Because Hanz coordinates domestic and international air freight, information related to a shipment may be processed in more than one country as needed to arrange uplift, handling, customs clearance, and delivery.',
      ],
    },
    {
      heading: '7. Security',
      paragraphs: [
        'We take reasonable administrative, technical, and organizational measures designed to protect information against unauthorized access, loss, misuse, or alteration. No method of transmission or storage is completely secure, and absolute security cannot be guaranteed.',
      ],
    },
    {
      heading: '8. Retention',
      paragraphs: [
        'We retain information for as long as reasonably necessary to fulfill the purposes described in this policy, maintain shipment and business records, resolve inquiries, and meet legal or operational requirements.',
      ],
    },
    {
      heading: '9. Your choices and rights',
      paragraphs: [
        'Subject to applicable law, you may request access to, correction of, or deletion of certain personal information, or ask questions about how your information is handled. To make a request, contact operations@hanzlogistics.com or info@hanzlogistics.com. We may need to verify your identity and may retain certain records where legally or operationally required.',
      ],
    },
    {
      heading: '10. Children',
      paragraphs: [
        'Our website and services are intended for business and logistics use and are not directed to children. We do not knowingly collect personal information from children.',
      ],
    },
    {
      heading: '11. Changes to this policy',
      paragraphs: [
        'Hanz may update this Privacy Policy as services, systems, or legal requirements evolve. The version published on this website is the current policy. Material updates will be reflected on this page.',
      ],
    },
    {
      heading: '12. Contact',
      paragraphs: [
        'If you have questions about this Privacy Policy or Hanz Logistics’ handling of information, contact operations@hanzlogistics.com, info@hanzlogistics.com, or call (412) 345-3837.',
      ],
    },
  ] satisfies LegalSection[],
}
