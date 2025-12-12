TP 2 : API REST Recettes de cuisine

L'objectif du TP est de créer une API REST avec le module http de Node.js.
Les données seront stockées dans un tableau JavaScript en mémoire, avec fichier JSON.

Chaque recette devra suivre le format :

```
{
  "id": 1,
  "name": "Crêpes maison",
  "difficulty": "facile",
  "ingredients": ["farine", "lait", "œufs"],
  "isVegetarian": true
}
```

Voici un tableau de départ initialisé dans un fichier json

```
let recipes = [
  { id: 1, name: "Pâtes bolo", difficulty: "moyenne", ingredients: ["pâtes", "tomate", "viande"], isVegetarian: false },
  { id: 2, name: "Salade César", difficulty: "facile", ingredients: ["salade", "poulet"], isVegetarian: false }
];
```

Vous implémenterez dans un premiers temps les routes classiques : 

- GET api/recipes Retourne toutes les recettes
- GET /api/recipes/:id Retourne une recette précise
- POST /api/recipes Ajoute une recette
- PUT /api/recipes/:id Modifie complètement une recette
- DELETE /api/recipes/:id Supprime une recette

Puis dans un second temps, des routes plus complexes : 

- GET /api/recipes/search?vegetarian=true Filtre uniquement les recettes végétariennes
- GET /api/recipes/search?ingredient=poulet Retourne les recettes contenant un ingrédient

Partie bonus : à commencer uniquement si vous avez terminé le TP.

Chaque utilisateur peut avoir exactement une recette favorite
Chaque utilisateur devra suivre le format :

```
{
  "id": 1,
  "firstName": "Romain",
  "lastName": "DINEL",
  "favoriteRecipeId": 1
}
```

Réaliser les routes suivantes : 

- GET /api/users/:id/favoriteRecipe Retourne la recette favorite d'un utilisateur
- PUT /api/users/:id/favoriteRecipe/:recipeId Modifie la recette favorite d'un utilisateur