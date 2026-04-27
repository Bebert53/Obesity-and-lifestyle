// obesityChart.js - Widget pour afficher l'évolution de l'obésité par tranche d'âge

export async function initObesityChart(containerId) {
  const container = document.getElementById(containerId);
  
  if (!container) {
    console.error(`Container ${containerId} not found`);
    return;
  }

  try {
    // Charger les données CSV
    const response = await fetch('data/obesity_evolution.csv');
    const csvText = await response.text();
    
    // Parser le CSV (séparateur: point-virgule)
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(';').slice(1); // Années (sans la première colonne vide)
    const years = headers.map(year => parseInt(year));
    const timeLabels = years.map(year => new Date(year, 0, 1)); // 1er janvier de chaque année
    
    // Extraire les données pour chaque tranche d'âge
    const ageGroups = [];
    const datasets = [];
    
    // Couleurs pour chaque tranche d'âge
    const colors = [
      '#3b82f6', // bleu
      '#8b5cf6', // violet
      '#ec4899', // rose
      '#f59e0b', // orange
      '#10b981', // vert
      '#ef4444'  // rouge
    ];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(';');
      const ageGroup = values[0];
      const data = values.slice(1).map(v => parseFloat(v.replace(',', '.')));
      
      ageGroups.push(ageGroup);
      datasets.push({
        label: `${ageGroup} ans`,
        data: data,
        borderColor: colors[i - 1],
        backgroundColor: colors[i - 1] + '20', // transparence 20%
        borderWidth: 2,
        tension: 0.4, // courbe lisse
        pointRadius: 4,
        pointHoverRadius: 6
      });
    }
    
    // Créer le canvas pour Chart.js
    // Vider le conteneur pour éviter les doublons si on ré-ouvre le widget
    container.innerHTML = '';

    container.innerHTML = `
      <button class="close-btn" style="
        display: block;
        position: absolute;
        top: 15px;
        right: 15px;
        width: 40px;
        height: 40px;
        background: #667eea;
        color: white;
        border: none;
        border-radius: 50%;
        font-size: 22px;
        cursor: pointer;
        z-index: 999999;
        line-height: 40px;
        text-align: center;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);">✕</button>
      <div class="widget-header" style="margin-right: 50px;">
        <h3>Évolution de l'obésité par tranche d'âge (1997-2021)</h3>
        <p class="subtitle">Pourcentage de personnes obèses en France</p>
      </div>
      <div class="chart-container" style="z-index: 1;">
        <canvas id="obesityChartCanvas"></canvas>
      </div>
    `;

    // Attacher le gestionnaire de fermeture au bouton
    const closeBtn = container.querySelector('.close-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', function(event) {
            event.stopPropagation();
            
            const widget = document.getElementById(containerId);
            // Retirer la classe expanded
            widget.classList.remove('expanded');
            
            // Restaurer le contenu initial du widget
            widget.innerHTML = `
                <button class="close-btn">✕</button>
                <div class="widget-content">
                    <div class="widget-preview">
                        <i class="widget-icon fas fa-chart-line"></i>
                        <h3 class="widget-title">Évolution de l'obésité</h3>
                    </div>
                </div>
            `;
            
            // Désactiver l'overlay
            const overlay = document.getElementById('overlay');
            if (overlay) {
                overlay.classList.remove('active');
                overlay.style.display = 'none';
            }
        });
    }

    const canvas = document.getElementById('obesityChartCanvas');
    const ctx = canvas.getContext('2d');

    // Vérifier que Chart.js est disponible
    const ChartLib = window.Chart || Chart;
    if (!ChartLib) {
      console.error('Chart.js non chargé. Assurez-vous d\'inclure la librairie Chart.js');
      container.innerHTML = `<div class="error-message"><p>⚠️ Chart.js non chargé</p></div>`;
      return;
    }

    // Adapter le canvas pour remplir le conteneur
    canvas.style.width = '100%';
    canvas.style.height = '100%';

    // Créer le graphique avec Chart.js
     new ChartLib(ctx, {
       type: 'line',
       data: {
         labels: timeLabels,
         datasets: datasets
       },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'bottom',
            labels: {
              usePointStyle: true,
              padding: 15,
              font: {
                size: 12
              }
            }
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12,
            callbacks: {
              label: function(context) {
                return `${context.dataset.label}: ${context.parsed.y}%`;
              }
            }
          }
        },
        scales: {
          x: {
            type: 'time',
            time: {
              unit: 'year',
              displayFormats: {
                year: 'yyyy'
              }
            },
            title: {
              display: true,
              text: 'Année',
              font: {
                size: 14,
                weight: 'bold'
              }
            },
            grid: {
              display: false
            },
            ticks: {
              source: 'data'
            }
          },
          y: {
            title: {
              display: true,
              text: 'Taux d\'obésité (%)',
              font: {
                size: 14,
                weight: 'bold'
              }
            },
            beginAtZero: true,
            max: 25,
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            },
            ticks: {
              callback: function(value) {
                return value + '%';
              }
            }
          }
        },
        interaction: {
          mode: 'nearest',
          axis: 'x',
          intersect: false
        }
      }
    });
    
  } catch (error) {
    console.error('Erreur lors du chargement des données:', error);
    container.innerHTML = `
      <div class="error-message">
        <p>⚠️ Erreur lors du chargement des données d'obésité</p>
      </div>
    `;
  }
}
