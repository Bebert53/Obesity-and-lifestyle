# Obesity-and-lifestyle
Datavision Dashboard : Obésité & Mode de Vie
Ce projet est un tableau de bord interactif divisé en deux sections principales : une analyse de la problématique de l'obésité chez les jeunes et une présentation de solutions concrètes basées sur les données.

Description
L'application permet d'explorer les facteurs contribuant à l'augmentation de l'obésité (habitudes alimentaires, sédentarité) et propose des visualisations pour comprendre comment un rééquilibrage alimentaire et l'activité physique impactent la santé.

Les données sont visualisées via des bibliothèques puissantes comme D3.js et Chart.js, offrant une expérience utilisateur immersive grâce à des widgets interactifs "expandables".

Structure du Projet
Bash
datavision-dashboard/
├── problematique.html   # Analyse des causes : Evolution, Junkfood, Activité
├── solution.html       # Analyse des solutions : Calories, Sport, IMC
├── src/
│   ├── main.js         # Point d'entrée principal et routage
│   └── widgets/        # Logique spécifique des graphiques
│       ├── obesityChart.js    # Graphique linéaire (Chart.js)
│       ├── junkFoodBubble.js  # Diagramme à bulles (D3.js)
│       ├── activityBar.js     # Histogramme des activités
│       ├── kcalCompare.js     # Comparaison de densité énergétique
│       ├── sportVsFood.js     # Relation rythme cardiaque / calories
│       └── imcPrediction.js   # Visualisation de l'équilibre IMC
├── data/               # Fichiers CSV sources
│   ├── obesity.csv
│   ├── junkfood.csv
│   └── ... (voir README complet pour la liste)
├── assets/
│   ├── css/            # Feuilles de style (style.css)
│   └── img/            # Ressources graphiques
└── .gitignore          # Fichiers exclus du versionnage

Installation et Utilisation
Cloner le dépôt

Bash
git clone https://github.com/votre-utilisateur/datavision-dashboard.git
cd datavision-dashboard
Lancer un serveur local
Le projet chargeant des fichiers CSV et des modules JS via des requêtes HTTP, un serveur local est nécessaire :

Avec VS Code : Utiliser l'extension Live Server.

Avec Python :

Bash
python -m http.server 8000
Avec Node.js :

Bash
npx serve .
Accéder à l'application
Ouvrez votre navigateur à l'adresse http://localhost:8000/problematique.html.

Technologies Utilisées
Frontend : HTML5, CSS3 (Flexbox/Grid), JavaScript (ES6 Modules).

Visualisation de données :

D3.js (v7) : Pour les graphiques complexes (bulles, barres personnalisées).

Chart.js : Pour les courbes d'évolution temporelle.

Parsing de données : PapaParse pour le traitement des fichiers CSV.

Icônes : Font Awesome 5.

Fonctionnalités Clés
Interactivité : Cliquez sur n'importe quel widget pour l'agrandir en plein écran et explorer les détails.

Dualité du Dashboard :

Vue Problème : Fond violet, focus sur les statistiques alarmantes.

Vue Solution : Fond bleu ciel, focus sur l'équilibre et la prévention.

Data-Driven : Toutes les visualisations sont alimentées par des fichiers CSV stockés dans le dossier /data, facilitant la mise à jour des statistiques.
