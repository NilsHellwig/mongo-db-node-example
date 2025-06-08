// Importiere die benötigten Pakete
import express from "express"; // Express ist ein Webframework für Node.js, das HTTP-Anfragen behandelt
import mongoose from "mongoose"; // Mongoose ist eine Bibliothek, um mit MongoDB-Datenbanken einfacher zu arbeiten
import bodyParser from "body-parser"; // Wandelt den Body von HTTP-Anfragen in ein nutzbares JSON-Objekt um
import cors from "cors"; // Erlaubt Anfragen von anderen Domains (Cross-Origin Resource Sharing)

const app = express(); // Erstelle eine neue Express-Anwendung
const port = 3000; // Lege den Port fest, auf dem der Server später laufen soll

// MongoDB-Verbindungs-URL (lokal laufender MongoDB-Server mit Datenbank "myDatabase")
const URL = "mongodb://localhost:27017/myDatabase";

// Stelle die Verbindung zur MongoDB-Datenbank her
/*
Was macht useNewUrlParser?
Diese Option sagt Mongoose, dass es den neuen URL-Parser von MongoDB verwenden soll.

Warum ist das wichtig?
Früher hat Mongoose den alten, internen URL-Parser verwendet, der mit einigen Sonderzeichen oder komplexen URLs Probleme hatte.
Der neue Parser ist robuster, sicherer und entspricht dem offiziellen MongoDB-Standard.

Beispielproblem:
Bei alten Parsern konnte z. B. mongodb://user:pass@localhost/dbname?authSource=admin zu Fehlern führen.

Was macht useUnifiedTopology?

Diese Option aktiviert den neuen Verbindungs- und Überwachungsmechanismus im MongoDB-Treiber.

Warum ist das wichtig?
Der alte Verbindungsmechanismus (legacy topology engine) wurde als instabil oder problematisch angesehen:

Schlechter Umgang mit Serverausfällen oder Replikaten

Viele Warnmeldungen bei neuen MongoDB-Versionen

Vorteile des neuen "Unified Topology"-Systems:

Bessere Unterstützung für Cluster und Replikationssets

Effizienteres Server-Monitoring

Vereinfachter Code im Hintergrund (intern für den Treiber)
*/
mongoose
  .connect(URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Verbunden mit der MongoDB-Datenbank!")) // Wenn erfolgreich, gib eine Erfolgsmeldung aus
  .catch((error) => console.error("Fehler bei der Verbindung:", error)); // Bei Fehlern: Fehlermeldung ausgeben

// Definiere das Schema für die Blogeinträge
const blogSchema = new mongoose.Schema({
  message: { type: String, required: true }, // Jeder Eintrag braucht eine Nachricht (Text), Pflichtfeld
});

// Erstelle ein Mongoose-Modell auf Basis des Schemas
// Das Modell "Blog" repräsentiert die Collection "blogs" in der Datenbank
const Blog = mongoose.model("Blog", blogSchema);

// Aktiviere Middleware:
// Damit kann Express JSON-Anfragen verstehen (z. B. { "message": "Hallo Welt" })
app.use(bodyParser.json());

// Aktiviere CORS, damit Frontend und Backend auf verschiedenen Domains/Ports kommunizieren dürfen
app.use(cors());

// GET: Alle Blogeinträge
app.get("/blogs", async (req, res) => {
  try {
    const blogs = await Blog.find();
    res.status(200).json(blogs);
  } catch (error) {
    res.status(500).json({ message: "Fehler beim Abrufen der Blogeinträge" });
  }
});

// POST: Blogeintrag erstellen
app.post("/blogs", async (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ message: "Message ist erforderlich" });
  }

  try {
    const newBlog = new Blog({ message });
    await newBlog.save();
    const blogs = await Blog.find();
    res.status(201).json({ message: "Blogeintrag erstellt!", blogs });
  } catch (error) {
    res.status(500).json({ message: "Fehler beim Erstellen des Blogeintrags" });
  }
});

// DELETE: Blogeintrag löschen
app.delete("/blogs/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await Blog.deleteOne({ _id: id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Blogeintrag nicht gefunden" });
    }
    const blogs = await Blog.find();
    res.status(200).json({ message: "Blogeintrag gelöscht!", blogs });
  } catch (error) {
    res.status(500).json({ message: "Fehler beim Löschen des Blogeintrags" });
  }
});

// PUT: Blogeintrag aktualisieren
app.put("/blogs/:id", async (req, res) => {
  const { id } = req.params;
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ message: "Message ist erforderlich" });
  }

  try {
    const result = await Blog.updateOne({ _id: id }, { $set: { message } });
    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Blogeintrag nicht gefunden" });
    }
    const blogs = await Blog.find();
    res.status(200).json({ message: "Blogeintrag aktualisiert!", blogs });
  } catch (error) {
    res.status(500).json({ message: "Fehler beim Aktualisieren des Blogeintrags" });
  }
});

app.listen(port, () => {
  console.log(`Server läuft auf http://localhost:${port}`);
});
