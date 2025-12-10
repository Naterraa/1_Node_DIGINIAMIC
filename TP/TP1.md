TP 1 : Modules fondamentaux Node.js

L’objectif du TP est de s'entraîner avec les modules fondamentaux de Node.js.

1 - Serveur de fichiers statiques

Créer un serveur HTTP qui servira des fichiers statiques. 
<!-- Utiliser les modules path et fs pour gérer les chemins et la lecture des fichiers  -->
Implémenter une gestion d'erreurs basique (à minima erreur 404 et erreur 500)

2 - Monitoring système

Ajouter un endpoint "/status" qui affiche des informations système. 
Utiliser le module os pour afficher  :

- Utilisation CPU
- Mémoire disponible
- Temps de fonctionnement

Mettre à jour ces informations en temps réel avec les events (par exemple, toutes les
secondes, les données sont actualisées sans rafraichir la page)
On pourra se renseigner sur le fonctionnement des Server-Sent Events

3 - DNS et URL

Ajouter un endpoint /resolve qui permet de résoudre des noms de domaine
Utiliser le module dns pour la résolution
Parser et valider les URLs avec le module url avant la résolution, envoyer un message
associé en cas de non conformité
Si le protocole (http:// ou https://) n’est pas précisé, en ajouter un par défaut pour valider
correctement l’URL.

Voici un exemple d’url qui devrait être résolu : /resolve?domain=google.com (voir comment récupérer le paramètre)