# Fiche de Monitoring Quotidien – CPI

Single-page app (SPA) for filling the daily staff monitoring form:

> **FICHE DE MONITORING QUOTIDIEN DU PERSONNEL** – COMPAGNIE PRESTIGE IMMOBILIER (CPI / DG / CRH)

## Contenu actuel

- **Header** : date (défautée au jour J), direction / service, nom et prénom
- **2. Évaluation de la journée** :
  - Principales réalisations du service
  - Tâches non achevées et motifs
  - Difficultés ayant affecté le travail
  - Besoins d'accompagnement ou de moyens
  - Actions prioritaires à poursuivre le lendemain
- **Envoi** : destinataire e-mail, objet, corps du message, bouton « Envoyer »

## Fonctionnalités

- Date pré-remplie avec la date du jour (`jj/mm/aaaa`)
- Nom et prénom séparés
- Saisie en français, responsive (mobile / desktop)
- Sauvegarde automatique dans `localStorage`
- Export / Import au format JSON
- Réinitialisation
- Impression / export PDF (bouton « Imprimer / PDF »)
- Envoi de la fiche par e-mail via le backend (`POST` vers `MAIL_ENDPOINT`, envoi SMTP Brevo / Hostinger)

## Configuration e-mail

`app.js` expose le point d'entrée :

```js
const MAIL_ENDPOINT = "https://api.cpi-chues.com/api/v1/fiches/monitoring/envoyer";
```

Le backend consomme la fiche et envoie l'e-mail via les identifiants SMTP fournis :

```
BREVO_MAILER=brevo
MAIL_SCHEME=null
MAIL_HOST=smtp.hostinger.com
MAIL_PORT=465
MAIL_USERNAME=contact@cpi-chues.com
MAIL_PASSWORD=cpi@07.10.2025@CPI
MAIL_FROM_ADDRESS="contact@cpi-chues.com"
MAIL_FROM_NAME="CPI × CHUES"
```

Modifiez `MAIL_ENDPOINT` si votre backend expose un autre point d'entrée.

## Utilisation

Aucune dépendance, aucun build.

```bash
cd /Users/komizi.inc/Desktop/Monitor/fiche-monitoring
python3 -m http.server 8765
# puis ouvrir http://localhost:8765
```

Ou simplement ouvrir `index.html` dans le navigateur.
