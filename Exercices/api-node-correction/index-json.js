const http = require('http');
const fs = require('fs');
const path = require('path');
const { parse } = require('url');

// --------------------   Création des variables utiles --------------------

// Chemin de la "base de données"
const DB_PATH = path.join(__dirname, 'data', 'Todos.json');
const PORT = 3000;

// -------------------- Fonctions utiles --------------------

// Charge les données de la base de données dans un tableau
const loadTodos = () => {
  try {
    const raw = fs.readFileSync(DB_PATH, 'utf-8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error(`Impossible de lire ${DB_PATH}, tableau vide`, err);
    return [];
  }
};

// Enregistre les données dans la base de données
const saveTodos = (data) => {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
};

// A chaque fois que l'on veut envoyer une réponse JSON, on utilise cette fonction
const sendJson = (res, status, payload) => {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(payload));
};

// La 404 en fin de chaine de requête
const notFound = (res) => sendJson(res, 404, { error: 'Not found' });

// Permet de lire le corps de la requête et de le parser en JSON
const parseBody = (req) =>
  new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk.toString();
      // Protection simple contre les payloads trop gros
      if (data.length > 1e6) {
        reject(new Error('Payload trop grand'));
        req.destroy();
      }
    });
    req.on('end', () => {
      if (!data) return resolve({});
      try {
        resolve(JSON.parse(data));
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });

// -------------------- Données chargées en mémoire --------------------

let todos = loadTodos();
let nextId = todos.reduce((max, { id }) => Math.max(max, id || 0), 0) + 1;

// -------------------- Fonction particulière : le serveur --------------------

// Création de serveur HTTP
const server = http.createServer(async (req, res) => {
  const { pathname } = parse(req.url);
  const method = req.method.toUpperCase();

  // GET /api/todos
  if (pathname === '/api/todos' && method === 'GET') {
    return sendJson(res, 200, todos);
  }

  // Gestion des routes avec ID
  if (pathname?.startsWith('/api/todos/')) {
    const id = Number(pathname.split('/')[3]);
    if (!Number.isInteger(id) || id <= 0) {
      return sendJson(res, 400, { error: 'id invalide' });
    }
    const index = todos.findIndex((t) => t.id === id);
    if (index === -1) return notFound(res);

    // GET /api/todos/:id
    if (method === 'GET') {
      return sendJson(res, 200, todos[index]);
    }

    // DELETE /api/todos/:id
    if (method === 'DELETE') {
      todos.splice(index, 1)[0];
      saveTodos(todos);
      return sendJson(res, 204);
    }

    // PUT /api/todos/:id
    if (method === 'PUT') {
      let body;
      try {
        body = await parseBody(req);
      } catch (err) {
        return sendJson(res, 400, { error: 'Corps JSON invalide' });
      }

      if (body.title !== undefined) {
        if (typeof body.title !== 'string' || !body.title.trim()) {
          return sendJson(res, 400, { error: 'title requis (string non vide)' });
        }
      }
      if (body.completed !== undefined && typeof body.completed !== 'boolean') {
        return sendJson(res, 400, { error: 'completed doit être un boolean' });
      }

      const updated = {
        ...todos[index],
        ...body,
        id,
        title: body.title !== undefined ? body.title.trim() : todos[index].title,
      };
      todos[index] = updated;
      saveTodos(todos);
      return sendJson(res, 200, updated);
    }

    return sendJson(res, 405, { error: 'Méthode non autorisée' });
  }

  // POST /api/todos
  if (pathname === '/api/todos' && method === 'POST') {
    let body;
    try {
      body = await parseBody(req);
    } catch (err) {
      return sendJson(res, 400, { error: 'Corps JSON invalide' });
    }

    if (!body.title || typeof body.title !== 'string' || !body.title.trim()) {
      return sendJson(res, 400, { error: 'title requis (string non vide)' });
    }
    if (body.completed !== undefined && typeof body.completed !== 'boolean') {
      return sendJson(res, 400, { error: 'completed doit être un boolean' });
    }

    const created = {
      id: nextId++,
      title: body.title.trim(),
      completed: body.completed === undefined ? false : body.completed,
    };
    todos.push(created);
    saveTodos(todos);
    return sendJson(res, 201, created);
  }

  // Route fallback
  notFound(res);
});

// -------------------- Lancement de l'API --------------------

server.listen(PORT, () => {
  console.log(`API TODOS JSON démarrée sur http://localhost:${PORT}`);
});


