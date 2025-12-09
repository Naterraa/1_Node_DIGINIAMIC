// Lisez le contenu du fichier example.txt situé dans le dossier assets et affichez-le dans la console.
// Créez un nouveau fichier appelé output.txt dans le même dossier et écrivez-y une chaîne de caractères : 
// Ceci est un nouveau fichier créé avec Node.js
// Supprimez le fichier output.txt que vous venez de créer.

const fs = require('fs');

// Lecture
fs.readFile('assets/example.txt', 'utf8', (err, data) => {
    if (err) throw err;
    console.log(data);
});

// Écriture / Création 
fs.writeFile('assets/output.txt', 'Ceci est un nouveau fichier créé avec Node.js', (err) => {
    if (err) throw err;
    console.log('Fichier créé avec succès!');
});

// Suppression
fs.unlink('assets/output.txt', (err) => {
    if (err) throw err;
    console.log('Fichier supprimé avec succès!');
});