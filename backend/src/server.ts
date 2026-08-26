import app from './app.js'

const port = Number(process.env.PORT || 3001)

app.listen(port, () => {
  console.log(`HLO tracking backend listening on http://localhost:${port}`)
})
