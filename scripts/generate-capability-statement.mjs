/**
 * Generates the Hanz Logistics Capability Statement PDF.
 * Formatted as a clean, professional, exactly 2-page document.
 * Run: node scripts/generate-capability-statement.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import PDFDocument from 'pdfkit'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const outPath = path.join(root, 'public', 'assets', 'hanz-logistics-capability-statement.pdf')
const logoPath = path.join(root, 'public', 'assets', 'hanz-logistics-logo.png')

fs.mkdirSync(path.dirname(outPath), { recursive: true })

const doc = new PDFDocument({
  size: 'LETTER',
  margins: { top: 40, bottom: 40, left: 52, right: 52 },
  autoFirstPage: true,
  info: {
    Title: 'Hanz Logistics Capability Statement',
    Author: 'Hanz Logistics',
    Subject: 'Capability Statement',
  },
})

const stream = fs.createWriteStream(outPath)
doc.pipe(stream)

const navy = '#203b5d'
const deep = '#10243b'
const orange = '#f2693c'
const muted = '#607080'
const paper = '#f7f5f0'
const lineBorder = '#dce3e8'
const pageWidth = doc.page.width
const pageHeight = doc.page.height
const contentWidth = pageWidth - doc.page.margins.left - doc.page.margins.right

function drawHeaderBanner() {
  doc.rect(0, 0, pageWidth, 126).fill(deep)
  doc.rect(0, 126, pageWidth, 5).fill(orange)
  if (fs.existsSync(logoPath)) {
    doc.image(logoPath, 52, 24, { height: 32 })
  }
  doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(8.5).text('HANZ LOGISTICS', 52, 72, { characterSpacing: 1.2 })
  doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(24).text('Capability Statement', 52, 88)
}

function drawPageFooter(pageNumber, totalPages = 2) {
  const footerY = pageHeight - 32
  doc.strokeColor(lineBorder).lineWidth(0.5).moveTo(doc.page.margins.left, footerY - 6).lineTo(doc.page.margins.left + contentWidth, footerY - 6).stroke()
  
  doc.fillColor(muted).font('Helvetica-Bold').fontSize(7.5).text('HANZ LOGISTICS', doc.page.margins.left, footerY, { characterSpacing: 0.8, lineBreak: false })
  doc.font('Helvetica').fontSize(7.5).text('Capability Statement', doc.page.margins.left + 160, footerY, { lineBreak: false })
  doc.font('Helvetica').fontSize(7.5).text(`Page ${pageNumber} of ${totalPages}`, doc.page.margins.left + contentWidth - 60, footerY, { lineBreak: false })
}

function sectionTitle(text, customSpacing = 0.7) {
  doc.moveDown(customSpacing)
  doc.fillColor(deep).font('Helvetica-Bold').fontSize(13).text(text)
  doc.moveDown(0.2)
  doc.strokeColor(orange).lineWidth(2.2).moveTo(doc.page.margins.left, doc.y).lineTo(doc.page.margins.left + 30, doc.y).stroke()
  doc.moveDown(0.4)
}

function subsection(title, desc) {
  doc.moveDown(0.35)
  doc.fillColor(navy).font('Helvetica-Bold').fontSize(10.2).text(title)
  doc.moveDown(0.12)
  doc.fillColor(deep).font('Helvetica').fontSize(9.4).text(desc, { width: contentWidth, lineGap: 2.2 })
}

function bullet(items) {
  for (const item of items) {
    const startX = doc.page.margins.left
    const y = doc.y + 4
    doc.circle(startX + 4, y, 2.2).fill(orange)
    doc.fillColor(deep).font('Helvetica').fontSize(9.4).text(item, startX + 14, doc.y, {
      width: contentWidth - 14,
      lineGap: 2.2,
    })
    doc.moveDown(0.25)
  }
}

// ==========================================
// PAGE 1: Overview, Core Capabilities, Visibility
// ==========================================
drawHeaderBanner()

doc.y = 154
doc.fillColor(orange).font('Helvetica-Bold').fontSize(8.5).text('MISSION-CRITICAL AIR FREIGHT FORWARDING', { characterSpacing: 1.1 })
doc.moveDown(0.3)
doc.fillColor(deep).font('Helvetica-Bold').fontSize(10.8).text('Connecting shippers to domestic and worldwide destinations.', { width: contentWidth })
doc.moveDown(0.35)
doc.fillColor(deep).font('Helvetica-Bold').fontSize(9.2).text('24 / 7 / 365', { continued: true })
doc.fillColor(muted).font('Helvetica').fontSize(9.2).text('  ·  ', { continued: true })
doc.fillColor(deep).font('Helvetica').fontSize(9.2).text('(412) 345-3837')
doc.moveDown(0.15)
doc.fillColor(deep).font('Helvetica').fontSize(9.2).text('operations@hanzlogistics.com', { continued: true })
doc.fillColor(muted).font('Helvetica').fontSize(9.2).text('  ·  ', { continued: true })
doc.fillColor(deep).font('Helvetica').fontSize(9.2).text('info@hanzlogistics.com')
doc.moveDown(0.35)
doc.strokeColor(lineBorder).lineWidth(0.6).moveTo(doc.page.margins.left, doc.y).lineTo(doc.page.margins.left + contentWidth, doc.y).stroke()

sectionTitle('Company Overview', 0.55)
doc.fillColor(deep).font('Helvetica').fontSize(9.5).text(
  'Hanz Logistics is an air freight forwarder coordinating mission-critical cargo with documented planning, active milestone oversight, and accountable delivery records. Shipments are handled to one operational standard: certainty through every handoff.',
  { width: contentWidth, lineGap: 2.4 },
)

sectionTitle('Core Logistics Capabilities', 0.6)
subsection('Expedited Air Freight', 'Next-flight-out and time-definite routing for cargo that must keep moving. Priority uplift evaluation and active milestone monitoring through final delivery.')
subsection('Air Charter Solutions', 'Dedicated aircraft matched to payload, airport access, handling requirements, and destination timing when commercial schedules cannot meet the mission.')
subsection('On-Board Courier / Hand-Carry (OBC)', 'Dedicated onboard courier personally accompanies critical cargo from collection through final handoff, maintaining direct chain-of-custody throughout the journey.')
subsection('Specialized Handling', 'Purpose-built handling plans for temperature-sensitive cargo, dangerous-goods support, oversized equipment, and high-value freight.')
subsection('Door-to-Door Coordination', 'Comprehensive management across pickup, airport transfer, flight uplift, customs coordination, and final-mile delivery.')

sectionTitle('Shipment Visibility & Milestone Tracking', 0.6)
doc.fillColor(deep).font('Helvetica').fontSize(9.5).text(
  'Customers track shipments using a Hanz reference number and, when linked, a carrier airway bill (AWB). Visibility combines dedicated operator oversight with verified milestone updates across every handoff—providing reliable, human-verified status rather than an unattended tracking number.',
  { width: contentWidth, lineGap: 2.4 },
)

drawPageFooter(1, 2)

// ==========================================
// PAGE 2: Operations Standard, Industries, Strengths, Contact
// ==========================================
doc.addPage()

// Top brand header bar on Page 2
doc.rect(0, 0, pageWidth, 18).fill(deep)
doc.rect(0, 18, pageWidth, 3).fill(orange)

doc.y = 38

sectionTitle('The Hanz Operations Standard', 0.25)
subsection('1. Plan', 'We map urgency, dimensions, weight, handling requirements, route, and contingencies before tender. A documented movement plan confirms responsibilities at every handoff.')
subsection('2. Track', 'Active milestones and human oversight keep the shipment visible in motion. Operators proactively monitor exceptions and coordinate directly across carriers and ground partners.')
subsection('3. Account', 'Delivery confirmation, proof-of-delivery verification, and chain-of-custody documentation consolidate the complete shipment record for review and compliance.')

sectionTitle('Industries Served', 0.45)
doc.fillColor(deep).font('Helvetica').fontSize(9.5).text(
  'Hanz provides specialized logistics solutions for high-stakes sectors with handling plans built around cargo risk, urgency, and compliance needs:',
  { width: contentWidth, lineGap: 2.2 },
)
doc.moveDown(0.25)
bullet([
  'Healthcare — Temperature-sensitive materials, critical devices, therapies, and cold-chain coordination.',
  'Aerospace + Defense — Controlled components, AOG parts, and high-value equipment with secure routing.',
  'Advanced Manufacturing — Line-down parts, specialized tooling, and plant-direct delivery to prevent downtime.',
  'Business Technology — High-value servers, infrastructure, and secure data-center delivery.',
  'Robotics + Energy — Prototype security, battery transport compliance, and field-critical shipment support.',
  'Research — Unique specimens, sensitive scientific instruments, and timeline-critical project logistics.',
])

sectionTitle('Operational Strengths', 0.45)
bullet([
  'Domestic and global operational reach with 24 / 7 / 365 operations dispatch.',
  'Plan → Track → Account end-to-end process ownership by a dedicated Hanz operator.',
  'Documented movement planning before tender and proof-of-delivery closure.',
  'TSA Indirect Air Carrier (IAC) compliant; TWIC cleared personnel.',
])

sectionTitle('Contact & Operations Dispatch', 0.45)
doc.fillColor(deep).font('Helvetica-Bold').fontSize(10.5).text('Hanz Logistics Operations')
doc.moveDown(0.18)
doc.fillColor(muted).font('Helvetica').fontSize(9.2)
doc.text('24 / 7 / 365 Operations Dispatch')
doc.text('Phone: (412) 345-3837')
doc.text('Email: operations@hanzlogistics.com  ·  info@hanzlogistics.com')

doc.moveDown(0.6)
const calloutY = doc.y
doc.rect(doc.page.margins.left, calloutY, contentWidth, 36).fill(paper)
doc.fillColor(navy).font('Helvetica-Bold').fontSize(8.5).text('HANZ LOGISTICS', doc.page.margins.left + 14, calloutY + 9, { characterSpacing: 0.8 })
doc.fillColor(muted).font('Helvetica').fontSize(8.5).text('Air freight for cargo that cannot afford to be delayed.', doc.page.margins.left + 14, calloutY + 20)

drawPageFooter(2, 2)

doc.end()

await new Promise((resolve, reject) => {
  stream.on('finish', resolve)
  stream.on('error', reject)
})

console.log(`Wrote ${outPath}`)
