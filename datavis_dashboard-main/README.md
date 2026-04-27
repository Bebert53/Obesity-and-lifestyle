datavision-dashboard/
├── problematique.html                  # Page "Problème"
├── solution.html               # Page "Solution"
├── src/
│   ├── main.js                 # Script principal (routing, chargement)
│   ├── widgets/
│   │   ├── obesityChart.js     # Widget 1 - courbe obésité
│   │   ├── junkFoodBubble.js   # Widget 2 - bubble malbouffe
│   │   ├── activityBar.js      # Widget 3 - histogramme activités
│   │   ├── ageObesity.js       # Widget 4 - tranches d’âge
│   │   ├── kcalCompare.js      # Solution Widget 1
│   │   ├── sportVsFood.js      # Solution Widget 2
│   │   └── imcPrediction.js    # Solution Widget 3
├── data/
│   ├── obesity.csv
│   ├── junkfood.csv
│   ├── activities.csv
│   ├── age_obesity.csv
│   ├── kcal_comparison.csv
│   ├── sport_kcal.csv
│   └── imc_data.csv
├── assets/
│   ├── css/
│   │   └── style.css
│   └── img/
│       └── logo.png
├── README.md
└── .gitignore