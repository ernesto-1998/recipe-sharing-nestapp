db = db.getSiblingDB('recipeDB');

db.createUser({
  user: 'recipeUser',
  pwd: 'recipePass',
  roles: [
    {
      role: 'readWrite',
      db: 'recipeDB',
    },
  ],
});
