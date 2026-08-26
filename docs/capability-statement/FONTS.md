# Fonts for the Hanz Logistics capability statement

Preferred brand typography (matches the Hanz website CSS template):

| Role | Family | Local files |
|------|--------|-------------|
| Body | Inter | `Inter-Regular.ttf`, `Inter-Medium.ttf`, `Inter-SemiBold.ttf`, `Inter-Bold.ttf` |
| Headings | Funnel Sans | `FunnelSans-Medium.ttf`, `FunnelSans-SemiBold.ttf`, `FunnelSans-Bold.ttf` |
| Labels / metadata | Geist Mono | `GeistMono-Medium.ttf`, `GeistMono-SemiBold.ttf` |

## Sources

These files were obtained from the [Fontsource](https://fontsource.org/) CDN packages (OFL-licensed distributions of the same families used on the website):

- `https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/...`
- `https://cdn.jsdelivr.net/fontsource/fonts/funnel-sans@latest/...`
- `https://cdn.jsdelivr.net/fontsource/fonts/geist-mono@latest/...`

Upstream projects:

- Inter — https://rsms.me/inter/ (SIL Open Font License)
- Funnel Sans — Google Fonts / Dylan Reid (OFL)
- Geist Mono — Vercel (OFL)

## Fallbacks

If a local file is missing, `capability-statement.tex` falls back to system fonts:

- Body / headings → Segoe UI
- Labels → Consolas

## License note

Keep these font files with the document source. Do not redistribute under a different license than OFL.
