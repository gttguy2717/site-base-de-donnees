# Serveur SOUTARAH GROUP

Le serveur utilise exclusivement PostgreSQL avec Sequelize. Les tables sont créées par migration, jamais avec `sequelize.sync()`.

1. Copiez `.env.example` en `.env` et renseignez les identifiants PostgreSQL.
2. Créez la base `soutarah_db` et son utilisateur dans PostgreSQL.
3. Exécutez `npm run db:migrate`.
4. Démarrez l'API avec `npm run server`.

L'endpoint de contrôle est `GET /api/health`. Les routes métier seront ajoutées dans les phases suivantes.
