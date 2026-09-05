import { useEffect, useRef, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Check,
  ClipboardList,
  Factory,
  Globe,
  HeartHandshake,
  Luggage,
  Mail,
  Menu,
  Microscope,
  Monitor,
  Package,
  Phone,
  Plane,
  PlaneTakeoff,
  Radar,
  Shield,
  Thermometer,
  X,
  Zap,
  type LucideIcon,
} from 'lucide-react'
import { PrivacyPage, TermsPage } from './pages/LegalPages'

const LineIcon = ({ icon: Icon, className = '' }: { icon: LucideIcon; className?: string }) => (
  <Icon className={`line-icon ${className}`.trim()} aria-hidden="true" strokeWidth={1.75} />
)

const images = {
  hero: 'https://images.unsplash.com/photo-1572017235244-8f2c23b76559?auto=format&fit=crop&w=1800&q=85',
  cargo: 'https://images.unsplash.com/photo-1663689764765-c665bee4f75d?auto=format&fit=crop&w=1400&q=85',
  plan: 'https://images.unsplash.com/photo-1533233521468-7f200e486fbd?auto=format&fit=crop&w=800&q=80',
  track: 'https://images.unsplash.com/photo-1577497382372-e1d0cc39051a?auto=format&fit=crop&w=800&q=80',
  account: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80',
  cta: 'https://images.unsplash.com/photo-1706525452290-50a06e80b50c?auto=format&fit=crop&w=1800&q=85',
}

const capabilities = [
  {
    title: 'Expedited Air Freight',
    Icon: Plane,
    summary: 'Next-flight-out and time-definite routing for cargo that must keep moving.',
    image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1400&q=85',
    eyebrow: 'Time-critical air freight',
    description: 'Priority routing and active oversight for urgent domestic and international freight. We evaluate the available schedules, secure the right uplift, and monitor each milestone through delivery.',
    specs: ['Next-flight-out routing', 'Domestic and international', 'Door-to-door coordination', 'Active milestone monitoring'],
    pricing: 'Custom quote based on route, dimensions, weight, and required delivery time.',
    cta: 'Get expedited quote',
  },
  {
    title: 'Air Charter Solutions',
    Icon: PlaneTakeoff,
    summary: 'Aircraft matched to shipment size, urgency, handling needs and destination.',
    image: 'https://images.unsplash.com/photo-1540962351504-03099e0a754b?auto=format&fit=crop&w=1400&q=85',
    eyebrow: 'Dedicated aircraft capacity',
    description: 'When scheduled service cannot meet the mission, we source dedicated aircraft around the cargo. Every charter is planned for payload, airport access, handling requirements, and final-mile timing.',
    specs: ['Aircraft matching', 'Full and partial charter', 'Remote airport access', 'Permit and ground coordination'],
    pricing: 'Market-based charter pricing confirmed after aircraft and route validation.',
    cta: 'Price a charter',
  },
  {
    title: 'On-Board Courier / Hand-Carry',
    Icon: Luggage,
    summary: 'Dedicated onboard courier service with direct human custody end to end.',
    image: 'https://images.unsplash.com/photo-1529074963764-98f45c47344b?auto=format&fit=crop&w=1400&q=85',
    eyebrow: 'Uninterrupted human custody',
    description: 'A vetted onboard courier personally accompanies critical cargo from collection through final handoff, minimizing transfers and maintaining direct chain of custody throughout the journey.',
    specs: ['Dedicated courier', 'Cabin or checked handling', 'Secure hand-to-hand delivery', 'Live journey communication'],
    pricing: 'Custom quote based on courier routing, travel requirements, and cargo profile.',
    cta: 'Arrange a courier',
  },
  {
    title: 'Specialized Handling',
    Icon: Package,
    summary: 'Cold chain, dangerous goods, oversized and high-value freight coordination.',
    image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1400&q=85',
    eyebrow: 'Complex cargo expertise',
    description: 'Purpose-built handling plans for freight with strict temperature, compliance, security, size, or value requirements. Qualified partners and documented controls protect the cargo at every stage.',
    specs: ['Cold-chain coordination', 'Dangerous-goods support', 'Oversized and high-value cargo', 'Documented chain of custody'],
    pricing: 'Custom quote after commodity, handling, compliance, and route review.',
    cta: 'Request handling plan',
  },
  {
    title: 'Air Freight Coordination',
    Icon: Globe,
    summary: 'Full-service forwarding from pickup planning through carrier booking, documentation, and delivery oversight.',
    image: 'https://images.unsplash.com/photo-1774698078446-59299e016718?auto=format&fit=crop&w=1400&q=85',
    eyebrow: 'End-to-end air forwarding',
    description: 'Hanz coordinates the complete air freight movement: pickup and ground transfer, carrier selection and booking, export/import documentation, customs handoffs, and active milestone oversight through final delivery.',
    specs: ['Door-to-door and airport routing', 'Carrier booking and air waybill (AWB) coordination', 'Export/import documentation', 'Customs and ground-transfer coordination', 'Active milestone monitoring'],
    pricing: 'Custom quote after route, commodity, documentation, and delivery scope review.',
    cta: 'Request coordination quote',
  },
]

const SERVICE_PATHS = [
  '/services/expedited-air',
  '/services/air-charter',
  '/services/on-board-courier',
  '/services/specialized-handling',
  '/services/air-freight-coordination',
] as const

const LEGACY_SERVICE_PATHS: Record<string, number> = {
  '/services/cold-chain-logistics': 3,
}

const normalizePath = (pathname: string) => (pathname.length > 1 && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname)

const serviceIndexFromPath = (pathname: string) => {
  const path = normalizePath(pathname)
  const index = (SERVICE_PATHS as readonly string[]).indexOf(path)
  if (index >= 0) return index
  return LEGACY_SERVICE_PATHS[path] ?? null
}

const quoteForms = [
  { color: '#60A5FA', title: 'Expedited Air Freight Quote', button: 'Request expedited quote', fields: [
    ['company','Company Name','text'], ['email','Contact Email','email'], ['phone','Phone Number','tel'], ['origin','Shipment Origin City','text'], ['destination','Destination City','text'], ['weight','Weight (kg)','number'], ['dimensions','Dimensions (L×W×H cm)','text'], ['shipmentType','Shipment Type','select','Medical|Pharma|Electronics|Documents|Other'], ['urgency','Urgency Level','select','Next Flight|48hrs|72hrs'], ['handlingNotes','Special Handling Notes (optional)','textarea'],
  ]},
  { color: '#10B981', title: 'Air Charter Solutions Quote', button: 'Request aircraft', fields: [
    ['company','Company Name','text'], ['email','Contact Email','email'], ['phone','Phone Number','tel'], ['origin','Departure Airport','text'], ['destination','Destination Airport','text'], ['weight','Total Weight (metric tons)','number'], ['volume','Volume (m³)','number'], ['cargoType','Cargo Type','select','Machinery|Project Cargo|Consolidation|Equipment|Other'], ['aircraft','Aircraft Preference (if known)','select','Turboprop|Regional Jet|Narrow-body|Wide-body|Not Sure'], ['requirements','Special Requirements (optional)','textarea'],
  ]},
  { color: '#F59E0B', title: 'On-Board Courier / Hand-Carry Quote', button: 'Arrange courier', fields: [
    ['name','Your Name','text'], ['company','Company','text'], ['email','Email','email'], ['phone','Phone','tel'], ['route','Origin / Destination Cities','text'], ['description','Cargo Description','textarea'], ['value','Estimated Value (USD)','number'], ['cargoType','Cargo Type','select','Documents|Jewelry|Prototypes|Samples|Confidential|Other'], ['insurance','Insurance Required','select','Yes|No'], ['customs','Customs Clearance','select','Yes|No|Unsure'], ['instructions','Special Instructions (optional)','textarea'],
  ]},
  { color: '#EF4444', title: 'Specialized Handling Quote', button: 'Submit inquiry', fields: [
    ['company','Company Name','text'], ['contact','Contact Person','text'], ['email','Email','email'], ['phone','Phone','tel'], ['route','Origin / Destination','text'], ['cargoType','Cargo Type','select','Pharmaceutical|Hazmat|Oversized|Fine Art|Perishables|Other'], ['weight','Total Weight (kg)','number'], ['dimensions','Dimensions (L×W×H cm)','text'], ['temperature','Temperature Range (optional)','text'], ['value','Declared Value (USD)','number'], ['certifications','Certifications Needed (optional)','text'], ['handlingNotes','Special Handling Notes (optional)','textarea'], ['notes','Additional Notes (optional)','textarea'],
  ]},
  { color: '#6366F1', title: 'Air Freight Coordination Quote', button: 'Submit coordination request', fields: [
    ['company','Company Name','text'], ['contact','Contact Person','text'], ['email','Contact Email','email'], ['phone','Phone Number','tel'], ['pickup','Pickup Location (address / city) (optional)','text'], ['originAirport','Origin Airport (optional)','text'], ['delivery','Delivery Location (address / city) (optional)','text'], ['destinationAirport','Destination Airport (optional)','text'], ['pickupReady','Cargo Ready Date & Time (local to pickup)','datetime-local'], ['deliveryRequired','Required Delivery Date & Time (local to delivery)','datetime-local'], ['commodity','Commodity Description','textarea'], ['pieceCount','Piece Count','number'], ['weight','Total Weight (kg)','number'], ['dimensions','Dimensions (L × W × H cm, per piece or total)','text'], ['scope','Shipment Scope','select','Door-to-Door|Door-to-Airport|Airport-to-Airport|Airport-to-Door'], ['customs','Customs Coordination','select','Origin only|Destination only|Both|Not required|Unsure'], ['documentation','Primary Documentation Needed','select','Air Waybill (AWB)|Commercial Invoice|Packing List|Certificate of Origin|Full export/import set|Unsure'], ['carrierPreference','Preferred Airline / Carrier (optional)','text'], ['handling','Special Handling Requirements (optional)','textarea'], ['notes','Additional Coordination Notes (optional)','textarea'],
  ]},
  { color: '#F2693C', title: 'General Freight Quote', button: 'Request quote', fields: [
    ['name','Your Name','text'], ['company','Company Name','text'], ['email','Contact Email','email'], ['phone','Phone Number','tel'], ['serviceNeeded','Service Needed','select','Expedited Air Freight|Air Charter Solutions|On-Board Courier / Hand-Carry|Specialized Handling|Air Freight Coordination|Not Sure Yet'], ['origin','Origin City / Airport','text'], ['destination','Destination City / Airport','text'], ['pickupReady','Cargo Ready / Pickup Date & Time (local to origin) (optional)','datetime-local'], ['delivery','Required Delivery Date & Time (local to destination) (optional)','datetime-local'], ['cargo','Cargo Description','textarea'], ['handling','Handling Requirements (optional)','textarea'], ['weight','Approx. Weight (kg)','number'], ['pieceCount','Piece Count','number'], ['dimensions','Dimensions (L × W × H cm)','text'], ['urgency','Urgency','select','Next Flight|24hrs|48hrs|72hrs|Flexible'], ['notes','Additional Notes (optional)','textarea'],
  ]},
] as const

const GENERAL_QUOTE = quoteForms.length - 1

const industries = [
  { Icon: Thermometer, title: 'Healthcare', summary: 'Temperature-sensitive and life-critical materials.', heading: 'Healthcare logistics without gaps in control.', description: 'Critical devices, therapies, and temperature-sensitive materials move under a documented handling plan from pickup through delivery.', services: ['Cold-chain coordination', 'Priority air routing', 'Documented custody'], image: 'https://images.unsplash.com/photo-1576671081837-49000212a370?auto=format&fit=crop&w=1200&q=85' },
  { Icon: Shield, title: 'Aerospace + Defense', summary: 'Controlled handling for high-value, regulated freight.', heading: 'Precision movement for mission-critical programs.', description: 'Aircraft parts, controlled components, and high-value equipment receive secure routing with visibility at every transfer.', services: ['Secure handling', 'Time-definite delivery', 'Compliance support'], image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1200&q=85' },
  { Icon: Factory, title: 'Advanced Manufacturing', summary: 'Parts and equipment timed to keep production online.', heading: 'Keep the line moving when every hour matters.', description: 'Production parts, tooling, and specialized equipment are routed against operational deadlines to minimize costly downtime.', services: ['Line-down response', 'Oversized equipment', 'Plant-direct delivery'], image: 'https://images.unsplash.com/photo-1565514020179-026b92b84bb6?auto=format&fit=crop&w=1200&q=85' },
  { Icon: Monitor, title: 'Business Technology', summary: 'Secure movement for systems, servers and infrastructure.', heading: 'Secure logistics for connected infrastructure.', description: 'Sensitive servers, systems, and high-value technology move with controlled handling and carefully coordinated site delivery.', services: ['High-value security', 'Data-center delivery', 'Chain of custody'], image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=85' },
  { Icon: Zap, title: 'Robotics + Energy', summary: 'Prototype, battery and field-critical shipment support.', heading: 'Specialized support for technology in motion.', description: 'Prototypes, battery systems, and field-critical components receive handling plans built around risk, urgency, and compliance.', services: ['Battery compliance', 'Prototype security', 'Remote-site support'], image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=1200&q=85' },
  { Icon: Microscope, title: 'Research', summary: 'Careful coordination for unique specimens and instruments.', heading: 'Protecting the work behind every breakthrough.', description: 'Unique specimens, instruments, and research materials move with careful documentation and handling tailored to the project.', services: ['Specimen handling', 'Instrument transport', 'Research timelines'], image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1200&q=85' },
]

const credentials = [
  { title: 'TSA Indirect Air Carrier (IAC) compliant', Icon: Shield },
  { title: 'TWIC-cleared personnel', Icon: BadgeCheck },
  { title: 'Customer-centric', Icon: HeartHandshake },
] as const

const stepIcons = [ClipboardList, Radar, Check] as const

const HOME_SECTIONS = [
  { id: 'about', label: 'About' },
  { id: 'capabilities', label: 'Capabilities' },
  { id: 'industries', label: 'Industries' },
  { id: 'standard', label: 'Our Standard' },
  { id: 'contact', label: 'Contact' },
] as const

const steps = [
  {
    title: 'Plan',
    summary: 'We map the urgency, dimensions, handling requirements and route before tender.',
    image: images.plan,
    intro: 'Before cargo moves, a dedicated operator builds a shipment plan around its deadline, handling requirements, and destination.',
    details: ['Shipment dimensions, weight, value, and commodity review', 'Route and contingency planning before tender', 'Carrier, aircraft, and service-level coordination', 'Cold-chain, dangerous-goods, and special handling checks'],
    outcome: 'A documented movement plan with clear responsibilities at every handoff.',
  },
  {
    title: 'Track',
    summary: 'Active milestones and human oversight keep the shipment visible in motion.',
    image: images.track,
    intro: 'Once freight is in motion, an operator monitors each planned milestone and remains ready to intervene when conditions change.',
    details: ['Pickup, tender, departure, arrival, and recovery milestones', 'Proactive exception monitoring and route adjustment', 'Direct coordination across carriers and handling partners', 'Status communication throughout the shipment lifecycle'],
    outcome: 'Current, human-verified shipment visibility—not an unattended tracking number.',
  },
  {
    title: 'Close Out',
    summary: 'Delivery documentation closes the loop with a complete shipment record.',
    image: images.account,
    intro: 'At destination, Hanz confirms the final handoff and consolidates the records required to close the shipment with confidence.',
    details: ['Consignee and delivery confirmation', 'Proof-of-delivery collection and verification', 'Chain of custody and exception documentation', 'Final shipment record prepared for review'],
    outcome: 'A complete, accountable record from initial pickup through confirmed delivery.',
  },
]

function Label({ children }: { children: React.ReactNode }) {
  return <p className="label"><span />{children}</p>
}

function SectionNav({
  visible,
  activeSection,
  onNavigate,
}: {
  visible: boolean
  activeSection: string | null
  onNavigate: () => void
}) {
  return (
    <nav
      className={`section-nav ${visible ? 'visible' : ''}`}
      aria-label="Page sections"
      aria-hidden={!visible}
      {...(!visible ? ({ inert: true } as React.HTMLAttributes<HTMLElement>) : {})}
    >
      <div className="shell section-nav-inner">
        {HOME_SECTIONS.map(({ id, label }) => (
          <a
            key={id}
            href={`#${id}`}
            className={activeSection === id ? 'active' : ''}
            onClick={onNavigate}
            tabIndex={visible ? 0 : -1}
          >
            {label}
          </a>
        ))}
      </div>
    </nav>
  )
}

function QuoteModal({ serviceIndex, onClose }: { serviceIndex: number, onClose: () => void }) {
  const form = quoteForms[serviceIndex]
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const submitQuote = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    const data = Object.fromEntries(new FormData(event.currentTarget).entries())
    const endpoint = import.meta.env.VITE_QUOTE_ENDPOINT
    if (endpoint) {
      try {
        const response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
        if (!response.ok) throw new Error('Quote request failed')
        onClose()
        return
      } catch {
        setError('We could not submit your request. Please email or call operations.')
        setSubmitting(false)
        return
      }
    }
    const details = Object.entries(data).map(([key,value]) => `${key}: ${value}`).join('\n')
    window.location.href = `mailto:operations@hanzlogistics.com?subject=${encodeURIComponent(form.title)}&body=${encodeURIComponent(details)}`
    setSubmitting(false)
  }

  return <div className="quote-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
    <section className="quote-modal" role="dialog" aria-modal="true" aria-labelledby="quote-title" style={{'--service-color': form.color} as React.CSSProperties}>
      <header><div><small>{serviceIndex === GENERAL_QUOTE ? 'General request' : 'Service-specific request'}</small><h2 id="quote-title">{form.title}</h2><p>Tell us what is moving. Required fields are marked with an asterisk.</p></div><button type="button" onClick={onClose} aria-label="Close quote form"><X aria-hidden="true" /></button></header>
      <form onSubmit={submitQuote}><input type="hidden" name="service" value={capabilities[serviceIndex]?.title ?? 'General Inquiry'} /><div className="quote-fields">{form.fields.map(([name,label,type,options]) => { const optional = label.includes('(optional)') || label.includes('(if known)'); return <label className={type === 'textarea' ? 'wide' : ''} key={name}><span>{optional ? label : `${label} *`}</span>{type === 'select' ? <select name={name} required={!optional} defaultValue="">{optional ? <option value="">Select an option</option> : <option value="" disabled>Select an option</option>}{options?.split('|').map(option => <option key={option}>{option}</option>)}</select> : type === 'textarea' ? <textarea name={name} rows={3} required={!optional} /> : <input name={name} type={type} required={!optional} min={type === 'number' ? (name === 'pieceCount' ? '1' : '0.01') : undefined} step={type === 'number' ? 'any' : undefined} />}</label> })}</div>{error && <p className="form-error" role="alert">{error}</p>}<p className="quote-privacy">By submitting, you agree we may contact you about this request. See our <a href="/privacy" target="_blank" rel="noreferrer">Privacy Policy</a> and <a href="/terms" target="_blank" rel="noreferrer">Terms</a>.</p><footer><p>{serviceIndex === GENERAL_QUOTE ? '24/7 Dispatch: Initial flight options and handling plans provided within 15–30 minutes.' : 'Requests are reviewed by Hanz operations. Final pricing is confirmed after route and cargo validation.'}</p><button className="button" type="submit" disabled={submitting}>{submitting ? 'Submitting…' : form.button}<ArrowRight /></button></footer></form>
    </section>
  </div>
}

function SiteFooter({ fromServicePage = false }: { fromServicePage?: boolean }) {
  const company = (hash: string) => (fromServicePage ? `/${hash}` : hash)
  return (
    <footer className="footer section-pad">
      <div className="shell footer-grid">
        <div className="footer-brand">
          <img src="/assets/hanz-logistics-logo.png" alt="Hanz Logistics" />
          <p>Mission-critical air freight forwarding for domestic and international destinations.</p>
        </div>
        <div>
          <h3>Services</h3>
          {capabilities.map(({ title }, i) => (
            <a href={SERVICE_PATHS[i]} key={title}>{title}</a>
          ))}
        </div>
        <div>
          <h3>Company</h3>
          <a href={company('#about')}>About Hanz</a>
          <a href={company('#industries')}>Industries</a>
          <a href={company('#standard')}>Our Standard</a>
          <a href={company('#contact')}>Contact</a>
          <a href="/track">Track a Shipment</a>
          <a href="/assets/hanz-logistics-capability-statement.pdf" download="Hanz-Logistics-Capability-Statement.pdf">Capability Statement</a>
        </div>
        <div>
          <h3>Contact</h3>
          <span>24 / 7 / 365 Operations</span>
          <a href="tel:+14123453837" aria-label="Call Hanz Logistics at (412) 345-3837">(412) 345-3837</a>
          <a href="mailto:operations@hanzlogistics.com">operations@hanzlogistics.com</a>
          <a href="mailto:info@hanzlogistics.com">info@hanzlogistics.com</a>
        </div>
      </div>
      <div className="shell legal">
        <span>© 2026 Hanz Logistics. All rights reserved.</span>
        <span className="site-credit">Built by <a href="https://ogigrid.com" target="_blank" rel="noreferrer"><strong>OgiGrid</strong> Smart Solutions</a></span>
        <span className="legal-links">
          <a href="/privacy">Privacy Policy</a>
          <span aria-hidden="true"> · </span>
          <a href="/terms">Terms</a>
          <span aria-hidden="true"> · </span>
          <a href="/track">Track a Shipment</a>
        </span>
      </div>
    </footer>
  )
}

type TrackingEvent = {
  status: string
  location: string
  description: string
  time: string
}

type TrackingResult = {
  trackingNumber: string
  hanzReference?: string | null
  awb?: string | null
  carrier: string | null
  status: string | null
  origin: string | null
  destination: string | null
  lastLocation: string | null
  lastUpdated: string | null
  events: TrackingEvent[]
  unavailable?: boolean
  message?: string
}

type TrackUiState =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'success'; data: TrackingResult }
  | { kind: 'unavailable'; trackingNumber: string; message: string }
  | { kind: 'not_found'; trackingNumber: string }
  | { kind: 'error'; message: string }

function TrackPage() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [referenceId, setReferenceId] = useState('')
  const [fieldError, setFieldError] = useState('')
  const [trackState, setTrackState] = useState<TrackUiState>({ kind: 'idle' })
  const closeMenu = () => setMenuOpen(false)

  const submitTrack = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const value = referenceId.trim()
    if (!value) {
      setFieldError('Enter a Hanz reference or AWB to continue.')
      setTrackState({ kind: 'idle' })
      return
    }

    setFieldError('')
    setTrackState({ kind: 'loading' })

    const baseUrl = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '') || ''
    const endpoint = `${baseUrl}/api/track`

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackingNumber: value }),
      })

      let payload: (TrackingResult & { error?: string; message?: string }) | null = null
      try {
        payload = await response.json()
      } catch {
        payload = null
      }

      if (response.status === 400) {
        setFieldError(payload?.message || 'Enter a valid Hanz reference or AWB.')
        setTrackState({ kind: 'idle' })
        return
      }

      if (response.status === 404) {
        setTrackState({ kind: 'not_found', trackingNumber: value })
        return
      }

      if (!response.ok || !payload) {
        setTrackState({
          kind: 'error',
          message: payload?.message || 'Unable to retrieve tracking information right now.',
        })
        return
      }

      if (payload.unavailable || (!payload.status && !(payload.events?.length))) {
        setTrackState({
          kind: 'unavailable',
          trackingNumber: payload.hanzReference || payload.trackingNumber || value,
          message: payload.message || 'Tracking information unavailable.',
        })
        return
      }

      setTrackState({
        kind: 'success',
        data: {
          trackingNumber: payload.trackingNumber || value,
          hanzReference: payload.hanzReference ?? null,
          awb: payload.awb ?? null,
          carrier: payload.carrier ?? null,
          status: payload.status ?? null,
          origin: payload.origin ?? null,
          destination: payload.destination ?? null,
          lastLocation: payload.lastLocation ?? null,
          lastUpdated: payload.lastUpdated ?? null,
          events: Array.isArray(payload.events) ? payload.events : [],
        },
      })
    } catch {
      setTrackState({
        kind: 'error',
        message: 'Network error. Check your connection and try again.',
      })
    }
  }

  return <>
    <header className="service-top">
      <nav className="nav shell" aria-label="Main navigation">
        <a href="/" aria-label="Hanz Logistics home"><img src="/assets/hanz-logistics-logo.png" alt="Hanz Logistics" /></a>
        <button className="menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen} aria-controls="track-nav-links" aria-label="Toggle navigation">{menuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}</button>
        <div className={`nav-links ${menuOpen ? 'open' : ''}`} id="track-nav-links">
          <a onClick={closeMenu} href="/#about">About</a>
          <a onClick={closeMenu} href="/#capabilities">Capabilities</a>
          <a onClick={closeMenu} href="/#industries">Industries</a>
          <a onClick={closeMenu} href="/#standard">Our Standard</a>
          <a onClick={closeMenu} href="/track" aria-current="page">Track a Shipment</a>
          <a onClick={closeMenu} className="button small" href="/#contact">Request a quote</a>
        </div>
      </nav>
    </header>

    <main>
      <section className="track-hero" style={{ backgroundImage: `linear-gradient(115deg, rgba(16,36,59,.96) 0%, rgba(16,36,59,.88) 42%, rgba(16,36,59,.72) 100%), url(${images.track})` }}>
        <div className="shell track-hero-content">
          <a className="service-back" href="/">
            <ArrowLeft aria-hidden="true" />
            <span>Back to home</span>
          </a>
          <Label>Shipment visibility</Label>
          <h1>Track a Shipment</h1>
          <p className="lede">Enter your Hanz reference number or carrier air waybill (AWB) to retrieve the latest available shipment status.</p>

          <div className="track-panel">
            <form className="track-card" onSubmit={submitTrack} noValidate>
              <label className="track-field" htmlFor="track-reference">
                <span>Hanz Reference / AWB</span>
                <input
                  id="track-reference"
                  name="referenceId"
                  type="text"
                  inputMode="text"
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="characters"
                  spellCheck={false}
                  placeholder="e.g. HANZ-260825-0001 or 123-45678901"
                  value={referenceId}
                  onChange={(event) => {
                    setReferenceId(event.target.value)
                    if (fieldError) setFieldError('')
                    if (trackState.kind !== 'idle' && trackState.kind !== 'loading') setTrackState({ kind: 'idle' })
                  }}
                  aria-invalid={fieldError ? true : undefined}
                  aria-describedby={fieldError ? 'track-reference-error' : 'track-reference-hint'}
                  disabled={trackState.kind === 'loading'}
                  required
                />
              </label>
              <p className="track-hint" id="track-reference-hint">Use the Hanz reference from your confirmation, or the AWB printed on your air waybill.</p>
              {fieldError && <p className="form-error" id="track-reference-error" role="alert">{fieldError}</p>}
              <button className="button" type="submit" disabled={trackState.kind === 'loading'}>
                {trackState.kind === 'loading' ? 'Tracking…' : <>Track a Shipment <ArrowRight /></>}
              </button>
            </form>

            <aside className="track-aside">
              <small>Need help locating a reference?</small>
              <p><strong>Hanz Reference</strong> is Hanz’s own shipment ID (format HANZ-YYMMDD-####). <strong>AWB</strong> is the carrier/airline tracking number. When an AWB is linked, the latest available carrier status can be retrieved.</p>
              <a href="tel:+14123453837" aria-label="Call Hanz Logistics operations at (412) 345-3837">(412) 345-3837</a>
              <a href="mailto:operations@hanzlogistics.com">operations@hanzlogistics.com</a>
            </aside>
          </div>

          {trackState.kind === 'loading' && (
            <div className="track-notice" role="status" aria-live="polite">
              <h2>Looking up shipment</h2>
              <p>Retrieving the latest available tracking information…</p>
            </div>
          )}

          {trackState.kind === 'not_found' && (
            <div className="track-notice" role="status">
              <h2>Tracking number not found</h2>
              <p>No shipment was found for <strong>{trackState.trackingNumber}</strong>.</p>
              <p>Confirm the Hanz reference or AWB, or contact Hanz operations for assistance.</p>
              <div className="track-contacts">
                <a className="button" href="tel:+14123453837" aria-label="Call Hanz Logistics operations at (412) 345-3837">Call (412) 345-3837</a>
                <a className="button ghost" href={`mailto:operations@hanzlogistics.com?subject=${encodeURIComponent(`Shipment status request: ${trackState.trackingNumber}`)}`}>Email operations</a>
              </div>
            </div>
          )}

          {trackState.kind === 'unavailable' && (
            <div className="track-notice" role="status">
              <h2>Tracking information unavailable</h2>
              <p>{trackState.message} Reference <strong>{trackState.trackingNumber}</strong> did not return usable status details yet.</p>
              <div className="track-contacts">
                <a className="button" href="tel:+14123453837" aria-label="Call Hanz Logistics operations at (412) 345-3837">Call (412) 345-3837</a>
                <a className="button ghost" href={`mailto:operations@hanzlogistics.com?subject=${encodeURIComponent(`Shipment status request: ${trackState.trackingNumber}`)}`}>Email operations</a>
              </div>
            </div>
          )}

          {trackState.kind === 'error' && (
            <div className="track-notice" role="alert">
              <h2>Unable to track shipment</h2>
              <p>{trackState.message}</p>
              <div className="track-contacts">
                <a className="button" href="tel:+14123453837" aria-label="Call Hanz Logistics operations at (412) 345-3837">Call (412) 345-3837</a>
                <a className="button ghost" href="mailto:operations@hanzlogistics.com?subject=Shipment%20tracking%20help">Email operations</a>
              </div>
            </div>
          )}

          {trackState.kind === 'success' && (
            <div className="track-result" role="region" aria-label="Shipment tracking result">
              <div className="track-result-header">
                <Label>Live tracking</Label>
                <h2>{trackState.data.status || 'In progress'}</h2>
                <p>
                  {trackState.data.hanzReference
                    ? <>Hanz reference <strong>{trackState.data.hanzReference}</strong></>
                    : <>Tracking number <strong>{trackState.data.trackingNumber}</strong></>}
                </p>
              </div>
              <dl className="track-result-grid">
                <div><dt>Hanz reference</dt><dd>{trackState.data.hanzReference || '—'}</dd></div>
                <div><dt>AWB</dt><dd>{trackState.data.awb || '—'}</dd></div>
                <div><dt>Carrier</dt><dd>{trackState.data.carrier || '—'}</dd></div>
                <div><dt>Current status</dt><dd>{trackState.data.status || '—'}</dd></div>
                <div><dt>Origin</dt><dd>{trackState.data.origin || '—'}</dd></div>
                <div><dt>Destination</dt><dd>{trackState.data.destination || '—'}</dd></div>
                <div><dt>Last location</dt><dd>{trackState.data.lastLocation || '—'}</dd></div>
                <div><dt>Last updated</dt><dd>{trackState.data.lastUpdated ? new Date(trackState.data.lastUpdated).toLocaleString() : '—'}</dd></div>
              </dl>
              <div className="track-history">
                <h3>Shipment history</h3>
                {trackState.data.events.length === 0 ? (
                  <p>No detailed history events were returned for this shipment.</p>
                ) : (
                  <ol>
                    {trackState.data.events.map((event, index) => (
                      <li key={`${event.time}-${index}`}>
                        <strong>{event.status || 'Update'}</strong>
                        <span>{event.time ? new Date(event.time).toLocaleString() : 'Time unavailable'}</span>
                        <span>{event.location || 'Location unavailable'}</span>
                        <p>{event.description || 'No description provided.'}</p>
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            </div>
          )}
        </div>
      </section>
    </main>

    <SiteFooter fromServicePage />
  </>
}

function QuickActions() {
  return <nav className="quick-actions" aria-label="Quick contact actions">
    <a href="tel:+14123453837" aria-label="Call Hanz Logistics at (412) 345-3837"><Phone aria-hidden="true" />Call Hanz</a>
    <a href="mailto:operations@hanzlogistics.com?subject=Urgent%20Freight%20Request" aria-label="Email Hanz operations about an urgent freight request"><Mail aria-hidden="true" />Email Ops</a>
  </nav>
}

function ServiceLanding({ serviceIndex, onRequestQuote }: { serviceIndex: number, onRequestQuote: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const closeMenu = () => setMenuOpen(false)
  const service = capabilities[serviceIndex]

  return <>
    <header className="service-top">
      <nav className="nav shell" aria-label="Main navigation">
        <a href="/" aria-label="Hanz Logistics home"><img src="/assets/hanz-logistics-logo.png" alt="Hanz Logistics" /></a>
        <button className="menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen} aria-controls="service-nav-links" aria-label="Toggle navigation">{menuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}</button>
        <div className={`nav-links ${menuOpen ? 'open' : ''}`} id="service-nav-links">
          <a onClick={closeMenu} href="/#about">About</a>
          <a onClick={closeMenu} href="/#capabilities">Capabilities</a>
          <a onClick={closeMenu} href="/#industries">Industries</a>
          <a onClick={closeMenu} href="/#standard">Our Standard</a>
          <a onClick={closeMenu} href="/track">Track a Shipment</a>
          <button className="button small" type="button" onClick={() => { closeMenu(); onRequestQuote() }}>Request a Quote</button>
        </div>
      </nav>
    </header>

    <main>
      <section className="service-hero" style={{ backgroundImage: `linear-gradient(105deg, rgba(16,36,59,.94) 0%, rgba(16,36,59,.72) 48%, rgba(16,36,59,.42) 100%), url(${service.image})` }}>
        <div className="shell service-hero-content">
          <a className="service-back" href="/#capabilities">
            <ArrowLeft aria-hidden="true" />
            <span>Back to services</span>
          </a>
          <Label>{service.eyebrow}</Label>
          <h1>{service.title}</h1>
          <p className="lede">{service.summary}</p>
          <div className="actions">
            <button className="button" type="button" onClick={onRequestQuote}>Request a Quote <ArrowRight /></button>
            <a className="button ghost" href="tel:+14123453837" aria-label="Call Hanz Logistics operations at (412) 345-3837">Talk to operations</a>
          </div>
        </div>
      </section>

      <section className="service-body section-pad">
        <div className="shell service-stack">
          <div className="service-block service-overview">
            <div className="service-overview-copy">
              <Label>Service overview</Label>
              <h2>{service.title}</h2>
              <p>{service.description}</p>
            </div>
            <div className="service-overview-media" style={{ backgroundImage: `linear-gradient(180deg,transparent 35%,rgba(16,36,59,.7)),url(${service.image})` }} role="img" aria-label={`${service.title} operations`}><span>{String(serviceIndex + 1).padStart(2, '0')} / {String(capabilities.length).padStart(2, '0')}</span></div>
          </div>

          <div className="service-block">
            <div className="service-block-intro">
              <Label>Key capabilities</Label>
              <h2>Service specifications</h2>
            </div>
            <ul className="service-spec-grid">
              {service.specs.map(spec => <li key={spec}><LineIcon icon={Check} className="check-icon" /><span>{spec}</span></li>)}
            </ul>
          </div>

          <div className="service-block service-ops-grid">
            <article className="service-sla-card">
              <Label>Operations</Label>
              <h2>24 / 7 Dispatch</h2>
              <p>24/7 Dispatch: Initial flight options and handling plans provided within 15–30 minutes.</p>
            </article>
            <article className="service-price-card">
              <Label>Pricing</Label>
              <h2>Planning & cargo review</h2>
              <div className="cap-price"><small>Pricing</small><span>{service.pricing}</span></div>
              <button className="button" type="button" onClick={onRequestQuote}>{service.cta}<ArrowRight /></button>
            </article>
          </div>
        </div>
      </section>

      <section className="cta section-pad" id="contact" style={{ backgroundImage: `linear-gradient(90deg, rgba(16,36,59,.8), rgba(16,36,59,.25)), url(${images.cta})` }}>
        <div className="shell cta-grid">
          <div>
            <Label>Ready when the clock starts</Label>
            <h2>Need this service for an urgent shipment?</h2>
            <p>Tell us what is moving, where it needs to go and when it must arrive. An operator will take it from there.</p>
            <p className="service-sla light">24/7 Dispatch: Initial flight options and handling plans provided within 15–30 minutes.</p>
          </div>
          <aside>
            <small>Start here</small>
            <a href="tel:+14123453837" aria-label="Call Hanz Logistics at (412) 345-3837">(412) 345-3837</a>
            <a href="mailto:operations@hanzlogistics.com">operations@hanzlogistics.com</a>
            <button className="button" type="button" onClick={onRequestQuote}>Request a Quote <ArrowRight /></button>
          </aside>
        </div>
      </section>
    </main>

    <SiteFooter fromServicePage />
  </>
}

function App() {
  const [path, setPath] = useState(() => normalizePath(window.location.pathname))
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeStep, setActiveStep] = useState<number | null>(null)
  const [activeCapability, setActiveCapability] = useState<number | null>(null)
  const [activeIndustry, setActiveIndustry] = useState(0)
  const [activeQuote, setActiveQuote] = useState<number | null>(null)
  const [sectionNavVisible, setSectionNavVisible] = useState(false)
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const closeMenu = () => setMenuOpen(false)
  const selectedStep = activeStep === null ? null : steps[activeStep]
  const selectedCapability = activeCapability === null ? null : capabilities[activeCapability]
  const selectedIndustry = industries[activeIndustry]
  const serviceIndex = serviceIndexFromPath(path)

  useEffect(() => {
    const syncPath = () => setPath(normalizePath(window.location.pathname))
    window.addEventListener('popstate', syncPath)
    return () => window.removeEventListener('popstate', syncPath)
  }, [])

  useEffect(() => {
    if (activeStep === null) return
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setActiveStep(null)
    }
    document.body.classList.add('modal-open')
    document.addEventListener('keydown', handleKeyDown)
    closeButtonRef.current?.focus()
    return () => {
      document.body.classList.remove('modal-open')
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [activeStep])

  useEffect(() => {
    if (activeQuote === null) return
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setActiveQuote(null)
    }
    document.body.classList.add('modal-open')
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.classList.remove('modal-open')
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [activeQuote])

  const isHomePage = path === '/' || path === ''

  useEffect(() => {
    if (!isHomePage) {
      setSectionNavVisible(false)
      setActiveSection(null)
      return
    }

    const hero = document.getElementById('top')
    const sectionElements = HOME_SECTIONS
      .map(({ id }) => document.getElementById(id))
      .filter((element): element is HTMLElement => element !== null)

    const updateNavVisibility = () => {
      const heroBottom = hero?.getBoundingClientRect().bottom ?? 0
      setSectionNavVisible(heroBottom <= 0)
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)
        if (visible[0]?.target.id) {
          setActiveSection(visible[0].target.id)
        }
      },
      { rootMargin: '-35% 0px -50% 0px', threshold: [0, 0.15, 0.35] },
    )

    sectionElements.forEach((element) => observer.observe(element))
    updateNavVisibility()
    window.addEventListener('scroll', updateNavVisibility, { passive: true })
    window.addEventListener('resize', updateNavVisibility)

    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', updateNavVisibility)
      window.removeEventListener('resize', updateNavVisibility)
    }
  }, [isHomePage])

  if (path === '/privacy') {
    return <>
      <PrivacyPage footer={<SiteFooter fromServicePage />} />
      <QuickActions />
    </>
  }

  if (path === '/terms') {
    return <>
      <TermsPage footer={<SiteFooter fromServicePage />} />
      <QuickActions />
    </>
  }

  if (path === '/track') {
    return <>
      <TrackPage />
      <QuickActions />
    </>
  }

  if (serviceIndex !== null) {
    return <>
      <ServiceLanding serviceIndex={serviceIndex} onRequestQuote={() => setActiveQuote(serviceIndex)} />
      {activeQuote !== null && <QuoteModal serviceIndex={activeQuote} onClose={() => setActiveQuote(null)} />}
      <QuickActions />
    </>
  }

  return <>
    <SectionNav
      visible={sectionNavVisible}
      activeSection={activeSection}
      onNavigate={closeMenu}
    />
    <header className="hero" id="top">
      <div className="hero-flight" style={{ backgroundImage: `url(${images.hero})` }} aria-hidden="true" />
      <div className="hero-overlay" aria-hidden="true" />
      <nav className="nav shell" aria-label="Main navigation">
        <a href="#top" aria-label="Hanz Logistics home"><img src="/assets/hanz-logistics-logo.png" alt="Hanz Logistics" /></a>
        <button className="menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen} aria-controls="nav-links" aria-label="Toggle navigation">{menuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}</button>
        <div className={`nav-links ${menuOpen ? 'open' : ''}`} id="nav-links">
          <a onClick={closeMenu} href="#about">About</a>
          <a onClick={closeMenu} href="#capabilities">Capabilities</a>
          <a onClick={closeMenu} href="#industries">Industries</a>
          <a onClick={closeMenu} href="#standard">Our Standard</a>
          <a onClick={closeMenu} href="/track">Track a Shipment</a>
          <a onClick={(event) => { event.preventDefault(); closeMenu(); setActiveQuote(GENERAL_QUOTE) }} className="button small" href="#contact">Request a quote</a>
        </div>
      </nav>
      <div className="hero-content shell">
        <Label>Time-critical • Domestic and international</Label>
        <h1>Air freight for cargo that cannot afford to be delayed.</h1>
        <p className="lede">Documented before it moves. Tracked while it does. Closed out after confirmed delivery.</p>
        <div className="actions"><a className="button" href="#capabilities" onClick={(event) => { event.preventDefault(); setActiveQuote(GENERAL_QUOTE) }}>Start a shipment <ArrowRight /></a><a className="button ghost" href="tel:+14123453837" aria-label="Call Hanz Logistics operations at (412) 345-3837">Talk to operations</a></div>
      </div>
      <div className="facts shell">
        {[['Available','24 / 7 / 365'],['Service','Domestic + International'],['Standard','Chain of custody'],['Support','Live operators']].map(([k,v]) => <div key={k}><small>{k}</small><strong>{v}</strong></div>)}
      </div>
    </header>

    <main>
      <section className="intro" id="about">
        <div className="intro-copy section-pad"><Label>Mission-critical forwarding</Label><h2>Every shipment moves to one standard: certainty.</h2><p>Hanz Logistics is an air freight forwarder moving cargo domestically and internationally. From healthcare and aerospace to robotics and energy, we coordinate shipments of any size with precise documentation and continuous oversight.</p><a className="text-link" href="#standard">How we protect your cargo <ArrowRight /></a></div>
        <div className="intro-image" style={{ backgroundImage: `url(${images.cargo})` }}><div className="image-note"><small>Operations standard 01</small><span>A documented chain of custody from pickup to proof of delivery.</span></div></div>
      </section>

      <section className="capabilities section-pad" id="capabilities">
        <div className="shell"><Label>Our services</Label><div className="section-heading"><h2>A faster path through complex freight.</h2><p>One operations team coordinates the route, documentation, handling and handoffs—so there are fewer places for critical cargo to stall.</p></div>
          <div className={`capability-explorer ${selectedCapability ? 'detail-open' : ''}`}>
            <div className="cap-list">{capabilities.map((capability, i) => <button type="button" className={activeCapability === i ? 'active' : ''} key={capability.title} onClick={() => setActiveCapability(activeCapability === i ? null : i)} aria-expanded={activeCapability === i} aria-controls="capability-detail"><b>{String(i+1).padStart(2,'0')}</b><span className="icon" aria-hidden="true"><LineIcon icon={capability.Icon} /></span><h3>{capability.title}</h3><p>{capability.summary}</p><ArrowRight aria-hidden="true" /></button>)}</div>
            <aside className="cap-detail" id="capability-detail" aria-live="polite" aria-hidden={!selectedCapability}>
              {selectedCapability && <>
                <button type="button" className="cap-close" onClick={() => setActiveCapability(null)} aria-label="Close capability details"><X aria-hidden="true" /></button>
                <div className="cap-detail-image" style={{backgroundImage:`linear-gradient(180deg,transparent,rgba(16,36,59,.75)),url(${selectedCapability.image})`}}><span>{String(activeCapability!+1).padStart(2,'0')} / {String(capabilities.length).padStart(2,'0')}</span></div>
                <div className="cap-detail-body"><small>{selectedCapability.eyebrow}</small><h3>{selectedCapability.title}</h3><p>{selectedCapability.description}</p><h4>Service specifications</h4><ul>{selectedCapability.specs.map(spec => <li key={spec}><LineIcon icon={Check} className="check-icon" />{spec}</li>)}</ul><div className="cap-price"><small>Pricing</small><span>{selectedCapability.pricing}</span></div><button className="button" type="button" onClick={() => setActiveQuote(activeCapability!)}>{selectedCapability.cta}<ArrowRight /></button><a className="text-link service-page-link" href={SERVICE_PATHS[activeCapability!]}>Open dedicated service page <ArrowRight /></a></div>
              </>}
            </aside>
          </div>
        </div>
      </section>

      <section className="industries" id="industries">
        <div className="industry-intro section-pad" style={{backgroundImage:`linear-gradient(180deg,rgba(242,105,60,.9),rgba(191,65,30,.96)),url(${selectedIndustry.image})`}}>
          <div className="mobile-industry-intro"><Label>Built around the cargo</Label><h2>Specialized teams for high-stakes industries.</h2><p>Choose a sector below to see how we protect specialized cargo from pickup through delivery.</p></div>
                    <div className="industry-panel-content" key={selectedIndustry.title}><Label>Built around the cargo</Label><span className="industry-kicker">{String(activeIndustry+1).padStart(2,'0')} / 06 • {selectedIndustry.title}</span><h2>{selectedIndustry.heading}</h2><p>{selectedIndustry.description}</p><ul>{selectedIndustry.services.map(service => <li key={service}><LineIcon icon={Check} className="check-icon" />{service}</li>)}</ul><a className="industry-cta" href={`mailto:operations@hanzlogistics.com?subject=${encodeURIComponent(selectedIndustry.title + ' shipment')}`}>Discuss your shipment</a></div>
          <div className="sector-count"><strong>06</strong><span>Specialized sectors</span></div><small>⌖ Domestic • International</small>
        </div>
        <div className="industry-list section-pad" role="list">{industries.map((industry, index) => { const isActive = activeIndustry === index; return <article className={`industry-item ${isActive ? 'active' : ''}`} role="listitem" key={industry.title}><button type="button" className={isActive ? 'active' : ''} onClick={() => setActiveIndustry(index)} onMouseEnter={() => setActiveIndustry(index)} aria-expanded={isActive} aria-controls={isActive ? `industry-detail-${index}` : undefined}><b>{String(index+1).padStart(2,'0')}</b><span className="industry-icon" aria-hidden="true"><LineIcon icon={industry.Icon} /></span><h3>{industry.title}</h3><p>{industry.summary}</p><ArrowRight aria-hidden="true" /></button>{isActive && <div className="mobile-industry-detail" id={`industry-detail-${index}`}><div className="mobile-industry-image" style={{backgroundImage:`linear-gradient(180deg,transparent,rgba(16,36,59,.75)),url(${industry.image})`}}><span>{industry.title}</span></div><p>{industry.description}</p><ul>{industry.services.map(service => <li key={service}><LineIcon icon={Check} className="check-icon" />{service}</li>)}</ul><a className="industry-cta" href={`mailto:operations@hanzlogistics.com?subject=${encodeURIComponent(industry.title + ' shipment')}`}>Discuss your shipment</a></div>}</article> })}</div>
      </section>

      <section className="process section-pad" id="standard"><div className="shell"><Label>One team • Full visibility</Label><div className="section-heading"><h2>Control at every handoff.</h2><p>From the first call to final delivery, a Hanz operator owns the details and keeps the record current.</p></div><div className="steps">{steps.map((step,i) => { const StepIcon = stepIcons[i]; return <button className="step-card" type="button" key={step.title} onClick={() => setActiveStep(i)} aria-haspopup="dialog" aria-label={`View ${step.title} process details`}><div className="step-top"><b>{String(i+1).padStart(2,'0')}</b><LineIcon icon={StepIcon} /></div><img src={step.image} alt="" loading="lazy" /><h3>{step.title}</h3><p>{step.summary}</p><span className="step-more">View full process</span></button>})}</div><div className="credentials"><Label>Credentials &amp; strengths</Label><div className="steps" role="list">{credentials.map(({ title, Icon }, i) => <article className="step-card" role="listitem" key={title}><div className="step-top"><b>{String(i+1).padStart(2,'0')}</b><LineIcon icon={Icon} className="cred-icon" /></div><h3>{title}</h3></article>)}</div><div className="capability-download"><p>Need a shareable overview of Hanz capabilities for procurement or vendor onboarding?</p><a className="button" href="/assets/hanz-logistics-capability-statement.pdf" download="Hanz-Logistics-Capability-Statement.pdf">Download Capability Statement <ArrowRight aria-hidden="true" /></a></div></div></div></section>

      <section className="cta section-pad" id="contact" style={{ backgroundImage: `linear-gradient(90deg, rgba(16,36,59,.8), rgba(16,36,59,.25)), url(${images.cta})` }}><div className="shell cta-grid"><div><Label>Ready when the clock starts</Label><h2>The shipment is urgent. The next move should be clear.</h2><p>Tell us what is moving, where it needs to go and when it must arrive. An operator will take it from there.</p></div><aside><small>Start here</small><a href="tel:+14123453837" aria-label="Call Hanz Logistics at (412) 345-3837">(412) 345-3837</a><a href="mailto:operations@hanzlogistics.com">operations@hanzlogistics.com</a><a href="mailto:info@hanzlogistics.com">info@hanzlogistics.com</a><a className="button" href="#capabilities" onClick={(event) => { event.preventDefault(); setActiveQuote(GENERAL_QUOTE) }}>Get a quote <ArrowRight /></a></aside></div></section>
    </main>

    {activeQuote !== null && <QuoteModal serviceIndex={activeQuote} onClose={() => setActiveQuote(null)} />}

    {selectedStep && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setActiveStep(null) }}>
      <section className="process-modal" role="dialog" aria-modal="true" aria-labelledby="process-modal-title">
        <button ref={closeButtonRef} className="modal-close" type="button" onClick={() => setActiveStep(null)} aria-label="Close process details"><X aria-hidden="true" /></button>
        <div className="modal-image" style={{ backgroundImage: `linear-gradient(180deg, transparent, rgba(16,36,59,.62)), url(${selectedStep.image})` }}><span>{String(activeStep! + 1).padStart(2, '0')} / 03</span></div>
        <div className="modal-content">
          <Label>Hanz operations standard</Label>
          <h2 id="process-modal-title">{selectedStep.title}</h2>
          <p className="modal-intro">{selectedStep.intro}</p>
          <h3>What happens at this stage</h3>
          <ul>{selectedStep.details.map((detail) => <li key={detail}><LineIcon icon={Check} className="check-icon" /> <span>{detail}</span></li>)}</ul>
          <div className="modal-outcome"><small>Operational outcome</small><p>{selectedStep.outcome}</p></div>
          <a className="button" href="#contact" onClick={(event) => { event.preventDefault(); setActiveStep(null); setActiveQuote(GENERAL_QUOTE) }}>Start a shipment <ArrowRight aria-hidden="true" /></a>
        </div>
      </section>
    </div>}

    <SiteFooter />
    <QuickActions />
  </>
}

export default App
