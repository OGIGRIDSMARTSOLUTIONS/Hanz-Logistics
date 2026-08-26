import { useState, type ReactNode } from 'react'
import { ArrowLeft, Menu, X } from 'lucide-react'
import { privacyPolicy, type LegalSection } from '../content/privacyPolicy'
import { termsOfCarriage } from '../content/termsOfCarriage'

function Label({ children }: { children: React.ReactNode }) {
  return <p className="label"><span />{children}</p>
}

function LegalSections({ sections }: { sections: LegalSection[] }) {
  return (
    <div className="legal-sections">
      {sections.map((section) => (
        <article key={section.heading} className="legal-section">
          <h2>{section.heading}</h2>
          {section.paragraphs.map((paragraph) => (
            <p key={paragraph.slice(0, 64)}>{paragraph}</p>
          ))}
          {section.bullets && section.bullets.length > 0 && (
            <ul>
              {section.bullets.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          )}
        </article>
      ))}
    </div>
  )
}

function LegalDocumentPage({
  doc,
  footer,
}: {
  doc: typeof privacyPolicy | typeof termsOfCarriage
  footer: ReactNode
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const closeMenu = () => setMenuOpen(false)

  return (
    <>
      <header className="service-top">
        <nav className="nav shell" aria-label="Main navigation">
          <a href="/" aria-label="Hanz Logistics home">
            <img src="/assets/hanz-logistics-logo.png" alt="Hanz Logistics" />
          </a>
          <button
            className="menu-button"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-expanded={menuOpen}
            aria-controls="legal-nav-links"
            aria-label="Toggle navigation"
          >
            {menuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </button>
          <div className={`nav-links ${menuOpen ? 'open' : ''}`} id="legal-nav-links">
            <a onClick={closeMenu} href="/#capabilities">Capabilities</a>
            <a onClick={closeMenu} href="/#industries">Industries</a>
            <a onClick={closeMenu} href="/#standard">Why Hanz</a>
            <a onClick={closeMenu} href="/#about">About</a>
            <a onClick={closeMenu} href="/track">Track Shipment</a>
            <a onClick={closeMenu} className="button small" href="/#contact">Request a quote</a>
          </div>
        </nav>
      </header>

      <main className="legal-page">
        <section className="legal-hero">
          <div className="shell legal-hero-content">
            <a className="service-back" href="/">
              <ArrowLeft aria-hidden="true" />
              <span>Back to home</span>
            </a>
            <Label>{doc.eyebrow}</Label>
            <h1>{doc.title}</h1>
            <p className="legal-lede">{doc.intro}</p>
          </div>
        </section>

        <section className="legal-body section-pad">
          <div className="shell legal-layout">
            <aside className="legal-rail" aria-label="Document summary">
              <small>Hanz Logistics</small>
              <p>{doc.title}</p>
              <div className="legal-rail-contacts">
                <a href="tel:+14123453837">(412) 345-3837</a>
                <a href="mailto:operations@hanzlogistics.com">operations@hanzlogistics.com</a>
                <a href="mailto:info@hanzlogistics.com">info@hanzlogistics.com</a>
              </div>
            </aside>
            <div className="legal-document">
              <LegalSections sections={doc.sections} />
              <div className="legal-contact">
                <small>Questions</small>
                <p>
                  <a href="mailto:operations@hanzlogistics.com">operations@hanzlogistics.com</a>
                  {' · '}
                  <a href="tel:+14123453837">(412) 345-3837</a>
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {footer}
    </>
  )
}

export function PrivacyPage({ footer }: { footer: ReactNode }) {
  return <LegalDocumentPage doc={privacyPolicy} footer={footer} />
}

export function TermsPage({ footer }: { footer: ReactNode }) {
  return <LegalDocumentPage doc={termsOfCarriage} footer={footer} />
}
