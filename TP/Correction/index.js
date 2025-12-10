// Import des modules nécessaires
const http = require('http');
const os = require('os');
const dns = require('dns');

// Port sur lequel le serveur sera lancé
const PORT = 3000;

// Fonction pour envoyer la réponse (réponse, code (par exemple 200), type(par exemple text/plain), body(par exemple "Hello World"))
const send = (res, code, type, body) => {
    res.writeHead(code, { 'Content-Type': type });
    res.end(body);
};

// Fonction qui renvoie les informations système en temps réel avec Server-Sent Events
// Il faut utiliser keep-alive et text/event-stream pour que le client puisse recevoir les informations en continu
const sendStatus = (req, res) => {
    
    res.writeHead(200, {'Content-Type': 'text/event-stream','Cache-Control': 'no-cache', Connection: 'keep-alive',});

    const push = () => {
        const payload = {
            cpuUsage: Number(os.loadavg()[0].toFixed(2)), // 1 minute average
            freeMemory: os.freemem(),
            uptime: Math.floor(os.uptime())
        };
        res.write(`data: ${JSON.stringify(payload)}\n\n`);
    };

    push();
    // On push toutes les secondes
    const interval = setInterval(push, 1000);
    // On clear l'interval lorsque la connexion est fermée
    req.on('close', () => clearInterval(interval));
};

const resolveDomain = (req, res, reqUrl) => {

    // On récupère le paramètre domain de l'URL
    const domain = reqUrl.searchParams.get('domain');
    // Si le paramètre domain est absent, on envoie une erreur 400
    if (!domain) return send(res, 400, 'application/json', JSON.stringify({ error: 'Paramètre "domain" requis' }));

    // On vérifie si le domaine est valide
    // On ajoute juste http:// ou https:// devant le domaine si ce n'est pas le cas
    // Se renseigner sur la méthode match() et les expressions régulières (Chat GPT le fais très bien...)
    // https://blog.stephane-robert.info/docs/developper/expressions-regulieres/ 
    const target = domain.match(/^https?:\/\//i) ? domain : 'http://' + domain;
    let hostname;

    try {
        // On crée un nouvel objet URL
        const parsed = new URL(target);
        // On vérifie si le protocole est valide (http: ou https:)
        if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('Bad protocol');
        // On récupère le nom d'hôte
        hostname = parsed.hostname;
    } catch {
        return send(res, 400, 'application/json', JSON.stringify({ error: 'URL invalide' }));
    }

    dns.resolve(hostname, (err, addresses) => {
        if (err) return send(res, 500, 'application/json', JSON.stringify({ error: `Résolution échouée: ${err.code || err.message}` }));
        // On envoie la réponse
        send(res, 200, 'application/json', JSON.stringify({ domain: hostname, addresses }));
    });
};

// Fonction qui envoie la page d'accueil (optionnel)
const sendHome = (res) => {
    send(
        res,
        200,
        'text/plain; charset=utf-8',
        'Endpoints : /status (SSE) | /resolve?domain=google.com'
    );
};

http.createServer((req, res) => {
    const reqUrl = new URL(req.url, `http://${req.headers.host}`);
    if (req.method === 'GET' && reqUrl.pathname === '/status') return sendStatus(req, res);
    if (req.method === 'GET' && reqUrl.pathname === '/resolve') return resolveDomain(req, res, reqUrl);
    if (req.method === 'GET' && reqUrl.pathname === '/') return sendHome(res);
    send(res, 404, 'text/plain; charset=utf-8', '404 - Not found');

})
.listen(PORT, () => {
    console.log(`Serveur prêt sur http://localhost:${PORT}`);
});
