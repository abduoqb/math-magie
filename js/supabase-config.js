/**
 * Configuration Supabase (synchronisation de la progression).
 * La clé « anon » est PUBLIQUE par conception : elle n'ouvre aucun droit à elle seule.
 * Les données sont protégées par la sécurité au niveau des lignes (RLS) : chaque famille
 * connectée ne peut lire et écrire que ses propres lignes. Ne JAMAIS mettre ici la clé
 * « service_role ».
 */
window.SUPABASE_CONFIG = {
  url: 'https://uuxghhuhfeoposespbsk.supabase.co',
  cle: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV1eGdoaHVoZmVvcG9zZXNwYnNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3MjM5MDUsImV4cCI6MjA3ODI5OTkwNX0.MSgnzE6S3a03WDBlcTvLtDbU9nxA5oTj5hCWEebCCvc'
};
