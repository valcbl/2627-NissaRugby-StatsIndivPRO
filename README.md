# Nissa Rugby · Stats individuelles Pro (PRO D2)

Site de suivi statistique individuel de l'équipe professionnelle, saison 2026-2027.
Il lit les exports XML officiels des matchs (format *Individual_v2*, « …_xml_sportscode.xml ») et produit :

- un **rapport par match** : défense, attaque, ruck offensif et défensif, contests et turnovers, conquête (touche et mêlée), discipline, jeu au pied et points, zones du terrain ;
- le **cumul de la saison** : évolution match par match, leaders, tableau de tous les joueurs ;
- la **comparaison de deux joueurs** *(protégée par mot de passe)* ;
- le **temps de jeu et les tâches**, avec les minutes calculées automatiquement à partir des remplacements et des cartons *(protégé)* ;
- la **fiche joueur** réservée au staff : stats par 80 minutes comparées au groupe de poste, points forts et axes de travail, évolution, carte des actions *(protégée)*.

Les postes sont regroupés en 7 groupes : piliers, talonneurs, 2e ligne, 3e ligne, charnière (9-10), centres, back 3 (11-14-15).

Données incluses : J1 à J7 (Biarritz, Béziers, Brive, Grenoble, Dax, Nevers, Provence Rugby), effectif de 41 joueurs, minutes jouées.

---

## Structure du dépôt

```
index.html              le site (une seule page, sans dépendance à installer)
js/local-db.js          stockage local : données du dépôt + modifications faites dans le navigateur
data/data.js            données lues par le site (générées, ne pas modifier à la main)
data/matchs/*.json      un fichier lisible par match (stats calculées)
data/effectif.json      joueurs et groupes de poste
data/minutes.json       minutes jouées par journée
data/logos.json         logos des adversaires
tools/build_data.py     data/*.json  →  data/data.js
tools/split_data.py     data.js exporté depuis le site  →  data/*.json
.nojekyll               indique à GitHub Pages de servir les fichiers tels quels
```

## Mettre le site en ligne avec GitHub Pages

1. Crée un dépôt sur GitHub (par exemple `nissa-stats-pro`), **privé de préférence** (voir « Confidentialité » plus bas).
2. Dépose tout le contenu de ce dossier à la racine du dépôt (bouton *Add file → Upload files*, ou `git push`).
3. Dans le dépôt : *Settings → Pages → Build and deployment*, choisis **Deploy from a branch**, branche `main`, dossier `/ (root)`, puis *Save*.
4. Après une minute, le site est disponible à l'adresse `https://<ton-compte>.github.io/nissa-stats-pro/`.

Le site fonctionne aussi sans connexion : il suffit d'ouvrir `index.html` dans un navigateur.

## Ajouter un nouveau match

**Sur ton navigateur (immédiat)**

1. Clique sur **Importer un match** et dépose l'export XML officiel.
2. La journée, l'adversaire et la date se remplissent tout seuls ; vérifie puis clique sur **Générer le rapport**.
3. Le match et les minutes jouées sont enregistrés dans ce navigateur uniquement.

**Pour tout le staff (publier dans le dépôt)**

1. Après l'import, clique sur **Exporter les données** : un fichier `data.js` est téléchargé.
2. Option simple : remplace `data/data.js` du dépôt par ce fichier, puis valide (*commit*).
3. Option propre, pour garder des fichiers lisibles et un historique clair :
   ```bash
   python3 tools/split_data.py ~/Téléchargements/data.js   # met à jour data/matchs/, effectif.json, minutes.json
   python3 tools/build_data.py                              # régénère data/data.js
   git add data && git commit -m "Ajout J8" && git push
   ```

Le bouton **Données du dépôt** efface les modifications locales du navigateur et recharge les données publiées.

## Corriger un poste

Ouvre la **Fiche joueur**, choisis le joueur, puis change son groupe dans le menu **Poste**.
Pour que la correction soit visible par tous : **Exporter les données** puis mettre à jour le dépôt (voir ci-dessus).
On peut aussi modifier directement le champ `grp` dans `data/effectif.json` (`PI`, `TA`, `2L`, `3L`, `CH`, `CE`, `B3`), puis lancer `python3 tools/build_data.py`.

## Mot de passe

La comparaison, le temps de jeu et la fiche joueur sont protégés par le mot de passe du staff
(communiqué en interne, il n'est pas écrit dans ce dépôt). Pour le changer, il faut remplacer
dans `index.html` la valeur de `CMP_HASH` par l'empreinte SHA-256 de `nissa-cmp:` suivi du nouveau mot de passe, par exemple :

```bash
python3 -c "import hashlib;print(hashlib.sha256('nissa-cmp:NOUVEAU_MOT_DE_PASSE'.encode()).hexdigest())"
```

## Confidentialité

- Le mot de passe est un **verrou d'affichage** : il ne chiffre pas les données. Toute personne qui peut ouvrir le site peut techniquement lire les fichiers de `data/`.
- Sur un **dépôt public**, le site et toutes les statistiques des joueurs sont visibles par n'importe qui sur Internet. Utilise un **dépôt privé**. GitHub Pages sur un dépôt privé demande un abonnement payant (GitHub Pro, Team ou Enterprise) ; sinon, garde le dépôt privé comme sauvegarde et ouvre `index.html` en local.
- La balise `noindex` évite le référencement par les moteurs de recherche, mais ne protège pas l'accès.

## Notes techniques

- Aucune installation : HTML, CSS et JavaScript dans une seule page. L'export PDF charge `html2canvas` et `jsPDF` depuis cdnjs à la demande.
- Les minutes jouées et le déroulé des actions utilisent le chrono officiel présent dans l'export.
- Les nouveaux imports sont gardés dans le `localStorage` du navigateur : ils ne sont pas partagés entre ordinateurs tant qu'ils ne sont pas publiés dans le dépôt.
