const http = require('http');
const { parse } = require('url');

// Données en mémoire
// Imaginer qu'il s'agit d'une base de données 
// Chaque ligne de mon tableau est une entrée dans une table de ma base de données par exemple 

let computers = [
  { id: 1, name: 'Workstation', tailleRam: '16GB' },
  { id: 2, name: 'Laptop', tailleRam: '8GB' },
  { id: 3, name: 'Server', tailleRam: '32GB' },
];
// id random pour chaque nouvelle machine
let nextId = Math.floor(Math.random() * 1000000);

// A chaque fois que l'on veut envoyer une réponse JSON, on utilise cette fonction
const sendJson = (res, status, payload) => {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(payload));
};

// La 404 en fin de chaine de requête
const notFound = (res) => sendJson(res, 404, { error: 'Not found' });

// Permet de lire le corps de la requête et de le parser en JSON
const parseBody = (req) =>
  // On crée une promesse car la lecture des données est asynchrone.
  new Promise((resolve) => {
    let data = '';
    // À chaque fois qu’un morceau du body arrive, on l’ajoute à data. HTTP arrive en paquets (streams), jamais tout d’un coup.
    req.on('data', (chunk) => {
      // Tout en format texte
      data += chunk.toString();
    });
    // Quand tout le body est arrivé, on parse le texte en JSON et on résout la promesse.
    req.on('end', () => {
      resolve(JSON.parse(data));
    });
  });

// Création de serveur HTTP
const server = http.createServer(async (req, res) => {

  // Récupérer l'url
  const { pathname } = parse(req.url);
  // Récupérer la méthode (sois GET, POST, PUT, DELETE, etc.)
  const method = req.method.toUpperCase();

  // Toutes les routes alternatives
  // GET /computers
  if (pathname === '/computers' && method === 'GET') {
    return sendJson(res, 200, computers);
  }
  // Gestion de l'index après la route /computers/
  if (pathname?.startsWith('/computers/')) {
    // On récupère la partie après la route /computers/
    const id = Number(pathname.split('/')[2]);
    // On cherche l'index de la machine dans le tableau
    const index = computers.findIndex((c) => c.id === id);
    
    if (index === -1) return notFound(res);

    // GET /computers/id
    if (method === 'GET') {
      return sendJson(res, 200, computers[index]);
    }

    // DELETE /computers/id
    if (method === 'DELETE') {
      computers.splice(index, 1)[0];
      return sendJson(res, 204);
    }

    // PUT /computers/id
    if (method === 'PUT') {
      try {
        const body = await parseBody(req);
        const updated = { ...computers[index], ...body, id };
        computers[index] = updated;
        // On envoie la machine mise à jour
        return sendJson(res, 200, updated);
      } catch (err) {
        return sendJson(res, 400, { error: err.message });
      }
    }
  }

  // POST /computers
  if (pathname === '/computers' && method === 'POST') {

    try {
      const body = await parseBody(req);
      // gestion simple des erreurs pour vérifier qu'il y a au moins un nom et une taille de RAM
      if (!body.name || !body.tailleRam) {
        return sendJson(res, 400, { error: 'name et tailleRam requis' });
      }
      // On crée la machine avec l'id suivant et les données du body
      const created = { id: nextId++, ...body };
      // On ajoute la machine au tableau
      computers.push(created);
      // On envoie la machine créée
      return sendJson(res, 201, created);
    } catch (err) {
      return sendJson(res, 400, { error: err.message });
    }
  }
  // Route fallback
  notFound(res);
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`API démarrée sur http://localhost:${PORT}`);
});
