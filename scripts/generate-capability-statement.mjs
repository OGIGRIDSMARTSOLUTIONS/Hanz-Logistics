/**
 * Generates the Hanz Logistics Capability Statement PDF.
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
  margins: { top: 54, bottom: 54, left: 54, right: 54 },
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
const pageWidth = doc.page.width
const contentWidth = pageWidth - doc.page.margins.left - doc.page.margins.right

function sectionTitle(text) {
  doc.moveDown(0.85)
  doc.fillColor(deep).font('Helvetica-Bold').fontSize(12.5).text(text)
  doc.moveDown(0.2)
  doc.strokeColor(orange).lineWidth(2).moveTo(doc.page.margins.left, doc.y).lineTo(doc.page.margins.left + 36, doc.y).stroke()
  doc.moveDown(0.4)
  doc.fillColor(muted).font('Helvetica').fontSize(10.5)
}

function bullet(lines) {
  for (const line of lines) {
    doc.fillColor(muted).font('Helvetica').fontSize(10.5).text(`•  ${line}`, {
      width: contentWidth,
      paragraphGap: 3,
    })
  }
}

// Cover header
doc.rect(0, 0, pageWidth, 132).fill(deep)
doc.rect(0, 132, pageWidth, 6).fill(orange)
if (fs.existsSync(logoPath)) {
  doc.image(logoPath, 54, 28, { height: 34 })
}
doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(11).text('HANZ LOGISTICS', 54, 78, { characterSpacing: 1.2 })
doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(22).text('Capability Statement', 54, 96)

doc.y = 160
doc.fillColor(navy).font('Helvetica-Bold').fontSize(11).text('Mission-critical air freight forwarding')
doc.moveDown(0.25)
doc.fillColor(muted).font('Helvetica').fontSize(10.5)
doc.text('From the Pittsburgh International Airport corridor to domestic and worldwide destinations.', { width: contentWidth })
doc.moveDown(0.45)
doc.fillColor(deep).font('Helvetica').fontSize(9.5)
doc.text('24 / 7 / 365  ·  Pittsburgh, PA  ·  (412) 345-3837', { width: contentWidth })
doc.text('operations@hanzlogistics.com  ·  info@hanzlogistics.com', { width: contentWidth })

sectionTitle('Company Overview')
doc.text(
  'Hanz Logistics is an air freight forwarder coordinating mission-critical cargo with documented planning, active milestone oversight, and accountable delivery records. Shipments are handled to one operational standard: certainty through every handoff.',
  { width: contentWidth },
)

sectionTitle('Core Logistics Capabilities')
bullet([
  'Expedited air freight — next-flight-out and time-definite routing with active milestone monitoring.',
  'Air charter solutions — dedicated aircraft matched to payload, airport access, handling needs, and timing.',
  'On-board courier / hand-carry (OBC) — dedicated human custody from collection through final handoff.',
  'Specialized handling — cold-chain coordination, dangerous-goods support, oversized and high-value freight.',
  'Door-to-door coordination and documented chain-of-custody practices.',
])

sectionTitle('Shipment Visibility')
doc.text(
  'Customers may track shipments using a Hanz reference number and, when linked, a carrier airway bill (AWB). Visibility combines operator oversight with carrier tracking data when an AWB is available. Tracking displays depend on received carrier data and may be incomplete until updates are available.',
  { width: contentWidth },
)

sectionTitle('Industries Served')
doc.text(
  'Hanz supports high-stakes sectors including Healthcare; Aerospace + Defense; Advanced Manufacturing; Business Technology; Robotics + Energy; and Research — with handling plans built around cargo risk, urgency, and compliance needs.',
  { width: contentWidth },
)

sectionTitle('Operational Strengths')
bullet([
  'Pittsburgh-based operations with domestic and global reach.',
  'Plan → Track → Account process ownership by a Hanz operator.',
  'Documented movement planning before tender and proof-of-delivery closure.',
  'TSA Indirect Air Carrier (IAC) compliant; TWIC cleared; IATA DGR & GDP handling standards.',
])

sectionTitle('Contact')
doc.fillColor(deep).font('Helvetica-Bold').fontSize(10.5).text('Hanz Logistics')
doc.fillColor(muted).font('Helvetica').fontSize(10.5)
doc.text('Pittsburgh, PA · PIT Airport Corridor')
doc.text('Phone: (412) 345-3837')
doc.text('Email: operations@hanzlogistics.com · info@hanzlogistics.com')

doc.moveDown(1.2)
doc.rect(doc.page.margins.left, doc.y, contentWidth, 42).fill(paper)
doc.fillColor(navy).font('Helvetica-Bold').fontSize(9).text('HANZ LOGISTICS', doc.page.margins.left + 14, doc.y + 12)
doc.fillColor(muted).font('Helvetica').fontSize(8.5).text('Air freight for cargo that cannot afford to be delayed.', doc.page.margins.left + 14, doc.y + 26)

doc.end()

await new Promise((resolve, reject) => {
  stream.on('finish', resolve)
  stream.on('error', reject)
})

console.log(`Wrote ${outPath}`)
