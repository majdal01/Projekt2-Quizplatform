Dette projekt består af en Express-server (backend), en Vue.js-applikation (frontend) og kræver en Redis-database til håndtering af sessioner.

📋 Forudsætninger

Inden du starter, skal du have følgende installeret:

    Node.js (LTS anbefales)

    npm (følger med Node.js)

    Redis (se vejledning nedenfor)

🛠 1. Opsætning af Redis

Serveren kræver en kørende Redis-instans for at kunne gemme loginsessioner. Du kan vælge én af følgende metoder:
Mulighed A: Docker (Anbefales)

Hvis du har Docker installeret, er dette den hurtigste metode:
# Start en Redis-container
docker run --name quiz-redis -p 6379:6479 -d redis

Mulighed B: Homebrew (macOS)

Hvis du bruger macOS og foretrækker Homebrew:
brew install redis
brew services start redis

Mulighed C: Windows (WSL)

Hvis du er på Windows, anbefales det at køre Redis via WSL:
sudo apt update
sudo apt install redis-server
sudo service redis-server start

🖥 2. Backend (Server)

Naviger til server-mappen og installer afhængigheder:
cd server
npm install

Konfiguration af Miljøvariabler

Hvert teammedlem skal oprette en lokal .env-fil baseret på eksemplet:

    Kopier .env.example til en ny fil kaldet .env.

    Opdater SESSION_SECRET til en lang, tilfældig streng for at sikre dine sessioner.

Eksempel på .env:
Code snippet

REDIS_URL=redis://127.0.0.1:6379
SESSION_SECRET=din_hemmelige_kode_her
FRONTEND_ORIGIN=http://localhost:5173
NODE_ENV=development

Start serveren
node server.js

Serveren vil køre på http://localhost:3000 (medmindre andet er angivet i din .env).
🎨 3. Frontend (Static)

Naviger til static-mappen og installer afhængigheder:
Bash

cd static
npm install

Kør udviklingsserver
Bash

npm run dev

Applikationen vil typisk være tilgængelig på http://localhost:5173.
📁 Projektstruktur & Teknologier

    Backend: Express.js med express-session og connect-redis til sessionshåndtering.

    Sikkerhed: bcryptjs til hashing af adgangskoder og sanitize-html til rensning af brugerinput.

    Frontend: Vue 3 bygget med Vite.

Tips til udvikling

    Redis-fejl: Hvis serveren skriver "Kunne ikke forbinde til Redis", skal du tjekke, om din Redis-tjeneste faktisk kører på port 6379.

    Sessioner: Hvis du ikke kan logge ind, skal du sikre dig, at FRONTEND_ORIGIN i din server-.env matcher den URL, din Vue-app kører på.
