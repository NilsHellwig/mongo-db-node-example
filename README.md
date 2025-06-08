# Beispiel: Integration von MongoDB in Node.js Anwendung

1. Datenbank : Starte den MongoDB Container

```bash
docker run -d \
  --name mongodb \
  -p 27017:27017 \
  -e MONGO_INITDB_DATABASE=myDatabase \
  mongo
```

2. Backend (`/backend`): Installiere alle Abhängigkeiten und starte Server

```bash
npm install & npm start
```

3. Frontend (`/frontend`):

```bash
http-server
```

Die Lösung befindet sich im Branch `solution`