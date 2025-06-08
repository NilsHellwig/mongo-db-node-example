import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import cors from 'cors';

// Importiere das CORS-Modul
const app = express();
const port = 3000;

// MongoDB-Verbindungsdetails
const URL = "mongodb://localhost:27017/myDatabase"; // myDatabase ist der Name der Datenbank, diese umfasst collections, z.B. blogs

// Verbindung zu MongoDB mit Mongoose
mongoose.connect(URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Verbunden mit der MongoDB-Datenbank!"))
  .catch((error) => console.error("Fehler bei der Verbindung:", error));

// Definiere das Schema und das Modell für Blogeinträge
const blogSchema = new mongoose.Schema({
  message: { type: String, required: true },
});

const Blog = mongoose.model('Blog', blogSchema);

// Middleware, um JSON-Daten zu verarbeiten
app.use(bodyParser.json());
app.use(cors());

// Endpunkt zum Abrufen aller Blogeinträge
app.get('/blogs', async (req, res) => {
  try {
    const blogs = await Blog.find();
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ message: "Fehler beim Abrufen der Blogeinträge" });
  }
});

// Endpunkt zum Erstellen eines Blogeintrags
app.post('/blogs', async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ message: "Message ist erforderlich" });
  }

  try {
    const newBlog = new Blog({ message });
    await newBlog.save();
    res.status(201).json({ message: "Blogeintrag erstellt!" });
  } catch (error) {
    res.status(400).json({ message: "Fehler beim Erstellen des Blogeintrags" });
  }
});

// Endpunkt zum Löschen eines Blogeintrags
app.delete('/blogs/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await Blog.deleteOne({ _id: id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Blogeintrag nicht gefunden" });
    }
    res.json({ message: "Blogeintrag gelöscht!" });
  } catch (error) {
    res.status(500).json({ message: "Fehler beim Löschen des Blogeintrags" });
  }
});

// Endpunkt zum Aktualisieren eines Blogeintrags
app.put('/blogs/:id', async (req, res) => {
  const { id } = req.params;
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ message: "Message ist erforderlich" });
  }

  try {
    const result = await Blog.updateOne(
      { _id: id },
      { $set: { message } }
    );
    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Blogeintrag nicht gefunden" });
    }
    res.json({ message: "Blogeintrag aktualisiert!" });
  } catch (error) {
    res.status(500).json({ message: "Fehler beim Aktualisieren des Blogeintrags" });
  }
});

// Express-Server starten
app.listen(port, () => {
  console.log(`Server läuft auf http://localhost:${port}`);
});
