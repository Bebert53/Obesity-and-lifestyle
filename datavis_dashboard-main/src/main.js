import { initObesityChart } from './widgets/obesityChart.js';

// Exposer la fonction d'initialisation globalement pour l'utiliser depuis le HTML inline
window.initObesityChart = initObesityChart;

// Optionnel: initialiser silencieusement si on veut un rendu au chargement (désactivé)
// window.initObesityChart('widget-obesity');