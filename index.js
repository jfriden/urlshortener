const express = require("express")
const app = express()

// Config
const PORT = 1234
const DB_USERNAME = ""
const DB_PASSWORD = ""

// Database setup
const mongoose = require("mongoose")
const mongoDB = `mongodb+srv://${DB_USERNAME}:${DB_PASSWORD}@cluster0.fktnzeb.mongodb.net/?retryWrites=true&w=majority`
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true })
const db = mongoose.connection
db.on("error", console.error.bind(console, "MongoDB connection error:"))

const translationSchema = new mongoose.Schema({
  shortener: String,
  url: String
})

const Translation = mongoose.model("Translation", translationSchema)

// Functions
function randomString(length) {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  return characters.split("").sort((a, b) => Math.random() - 0.5).splice(0, length).join("")
}

async function shorten(url) {
  let shortener

  do {
    shortener = randomString(7)
  } while (await Translation.exists({ shortener: shortener }))

  await Translation.create({ shortener: shortener, url: url })

  return shortener
}

async function translate(shortener) {
  const doc = await Translation.findOne({ shortener: shortener })
  if (doc) return doc.url
  else return null
}

// Routing
app.use(express.json())

app.use(express.static("public"))

app.get("/:key", async (req, res) => {
  const url = await translate(req.params.key)
  if (url) res.redirect(url)
  else res.end()
})

app.post("/shorten", async (req, res) => {
  const shortener = await shorten(req.body.url)
  res.json({ [shortener]: req.body.url })
})

app.listen(PORT)
