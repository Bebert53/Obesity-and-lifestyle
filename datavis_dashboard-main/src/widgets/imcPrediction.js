// weightLossHeatmap.js - Widget : Estimation perte de poids selon calories & sport (lié à Activité Physique)
// Auteur : [Ton nom] – Projet de Datavision

function initWeightLossHeatmap(containerId) {
    const container = d3.select(`#${containerId} .widget-expanded-content`);
    container.html('');
    loadCaloriesDataAndCreateHeatmap(container);
}

// --- Charger les données du graphique Activité Physique ---
function loadCaloriesDataAndCreateHeatmap(container) {
    Papa.parse('data/Donnees.csv', {
        download: true,
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: function(results) {
            const rawData = results.data.filter(row =>
                row.Duration != null &&
                row.Calories != null &&
                row.Heart_Rate != null
            );

            if (rawData.length === 0) {
                container.html('<p>Aucune donnée valide trouvée dans Donnees.csv</p>');
                return;
            }

            // Calcul du rythme cardiaque moyen
            const meanHeartRate = d3.mean(rawData, d => d.Heart_Rate);

            // Filtrer les valeurs proches du rythme cardiaque moyen (+/- 5 bpm)
            const filtered = rawData.filter(d => Math.abs(d.Heart_Rate - meanHeartRate) <= 5);

            // Calcul de la moyenne des calories brûlées par minute
            const avgCaloriesPerMin = d3.mean(filtered, d => d.Calories / d.Duration);

            createWeightLossHeatmap(container, avgCaloriesPerMin);
        },
        error: function(error) {
            console.error('Erreur lors du chargement du fichier CSV:', error);
            container.html('<p>Erreur lors du chargement des données de calories.</p>');
        }
    });
}

function createWeightLossHeatmap(container, avgCaloriesPerMin) {
    const margin = { top: 80, right: 60, bottom: 60, left: 100 };
    const width = container.node().offsetWidth - margin.left - margin.right;
    const height = 500;

    const svg = container.append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    // Titre
    svg.append('text')
        .attr('x', width / 2)
        .attr('y', -20)
        .attr('text-anchor', 'middle')
        .style('font-size', '20px')
        .style('font-weight', '700')
        .style('fill', '#1d3557')
        .text('Évolution du poids selon calories consommées et durée des séances de sport quotidiennes');

    svg.append('text')
        .attr('x', width / 2)
        .attr('y', 0)
        .attr('text-anchor', 'middle')
        .style('font-size', '13px')
        .style('fill', '#555')
        .text('Estimation sur 1 mois (kg)');

    // Plages
    const calorieRange = d3.range(1500, 4000, 250); // kcal/jour consommées
    const sportRange = d3.range(0, 180 + 1, 15);   // minutes/jour de sport

    // Échelles
    const xScale = d3.scaleBand().domain(calorieRange).range([0, width]).padding(0.05);
    const yScale = d3.scaleBand().domain(sportRange).range([height, 0]).padding(0.05);

    const colorScale = d3.scaleSequential(d3.interpolateRdYlGn).domain([-4, 4]); // kg/mois

    // Axes
    svg.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(xScale).tickValues(calorieRange).tickFormat(d => d + " kcal"));
    svg.append('g')
        .call(d3.axisLeft(yScale).tickValues(sportRange).tickFormat(d => d + " min"));

    svg.append('text')
        .attr('x', width / 2)
        .attr('y', height + 30)
        .attr('text-anchor', 'middle')
        .style('font-size', '14px')
        .text('Calories consommées par jour');

    svg.append('text')
        .attr('x', -height / 2)
        .attr('y', -60)
        .attr('text-anchor', 'middle')
        .attr('transform', 'rotate(-90)')
        .style('font-size', '14px')
        .text('Temps de sport par jour');

    // Tooltip
    const tooltip = container.append('div')
        .attr('class', 'tooltip-heatmap')
        .style('position', 'fixed')
        .style('background', 'rgba(0,0,0,0.8)')
        .style('color', '#fff')
        .style('padding', '6px 10px')
        .style('border-radius', '6px')
        .style('font-size', '13px')
        .style('opacity', 0)
        .style('max-width', '250px'); // Add max-width for tooltip

    const cells = svg.append('g');

    // Contrôles utilisateur
    const controls = container.append('div')
        .attr('class', 'controls')
        .style('text-align', 'center')
        .style('margin-top', '2px')
        .style('margin-bottom', '2px')
        .html(`
            <label>Poids (kg) :
                <input id="poids" type="number" value="80" min="40" max="150" step="1" style="width:70px;">
            </label>
            <label style="margin-left:15px;">Taille (m) :
                <input id="taille" type="number" value="1.75" min="1.4" max="2.1" step="0.01" style="width:70px;">
            </label>
        `);

    const info = container.append('div')
        .attr('class', 'summary')
        .style('text-align', 'center')
        .style('margin-top', '4px')
        .style('font-size', '14px')
        .style('font-weight', '500');

    // --- Fonction d’interprétation de l’IMC ---
    function interpretIMC(imc) {
        if (imc < 18.5) return "Insuffisance pondérale";
        if (imc < 25) return "Poids normal";
        if (imc < 30) return "Surpoids";
        if (imc < 35) return "Obésité modérée (Classe I)";
        if (imc < 40) return "Obésité sévère (Classe II)";
        return "Obésité morbide (Classe III)";
    }

    function updateHeatmap() {
        const poids = parseFloat(document.getElementById('poids').value);
        const taille = parseFloat(document.getElementById('taille').value);

        // IMC actuel
        const IMCactuel = poids / (taille * taille);
        const interpretationActuelle = interpretIMC(IMCactuel);

        // BMR simplifié
        const bmr = 24 * poids;

        // Calories brûlées par minute (données importées)
        const kcalPerMin = avgCaloriesPerMin;

        const gridData = [];
        calorieRange.forEach(cal => {
            sportRange.forEach(min => {
                const depenseSport = kcalPerMin * min;
                const totalDepense = bmr + depenseSport;
                const bilan = cal - totalDepense;
                const evolutionKgMois = bilan * 30 / 7700;
                const poidsFinal = poids + evolutionKgMois;
                const IMCfinal = poidsFinal / (taille * taille);
                const interpretationFinale = interpretIMC(IMCfinal);
                gridData.push({ cal, min, evolutionKgMois, IMCfinal, interpretationFinale });
            });
        });

        const rects = cells.selectAll('rect').data(gridData, d => d.cal + '-' + d.min);

        rects.join(
            enter => enter.append('rect')
                .attr('x', d => xScale(d.cal))
                .attr('y', d => yScale(d.min))
                .attr('width', xScale.bandwidth())
                .attr('height', yScale.bandwidth())
                .attr('rx', 4)
                .attr('ry', 4)
                .attr('fill', d => colorScale(-d.evolutionKgMois))
                .on('mouseover', (event, d) => {
                    tooltip.transition().duration(100).style('opacity', 1);
                    tooltip.html(`
                        <b>${d.cal} kcal</b> & | <b>${d.min} min</b> de sport<br>
                        Évolution du poids : <b>${d.evolutionKgMois.toFixed(2)} kg/mois</b><br>
                        IMC actuel : <b>${IMCactuel.toFixed(1)}</b> (${interpretationActuelle})<br>
                        IMC estimé : <b>${d.IMCfinal.toFixed(1)}</b> (${d.interpretationFinale})
                    `);
                    // Position tooltip dynamically
                    const tooltipWidth = 250; // Approximate width
                    const containerRect = container.node().getBoundingClientRect();
                    const mouseX = event.clientX - containerRect.left;
                    const mouseY = event.clientY - containerRect.top;
                    let left = event.clientX + 12;
                    let top = event.clientY - 20;
                    // If near right edge, position to the left
                    if (mouseX + tooltipWidth > containerRect.width) {
                        left = event.clientX - tooltipWidth - 12;
                    }
                    tooltip.style('left', `${left}px`)
                           .style('top', `${top}px`);
                })
                .on('mousemove', event => {
                    // Position tooltip dynamically
                    const tooltipWidth = 250; // Approximate width
                    const containerRect = container.node().getBoundingClientRect();
                    const mouseX = event.clientX - containerRect.left;
                    let left = event.clientX + 12;
                    // If near right edge, position to the left
                    if (mouseX + tooltipWidth > containerRect.width) {
                        left = event.clientX - tooltipWidth - 12;
                    }
                    tooltip.style('left', `${left}px`)
                           .style('top', `${event.clientY - 20}px`);
                })
                .on('mouseout', () => tooltip.transition().duration(150).style('opacity', 0)),
            update => update.transition().duration(600)
                .attr('fill', d => colorScale(-d.evolutionKgMois))
        );

        // Afficher la synthèse IMC
        info.html(`IMC actuel : <b>${IMCactuel.toFixed(1)}</b> – <span style="color:#1d3557;">${interpretationActuelle}</span>`);
    }

    updateHeatmap();
    d3.selectAll('#poids, #taille').on('input', updateHeatmap);
}

// --- Initialisation widget ---
let heatmapInitialized = false;

document.addEventListener('DOMContentLoaded', function () {
    const widget = document.getElementById('widget-imc');
    if (!widget) return;

    const observer = new MutationObserver(mutations => {
        mutations.forEach(m => {
            if (m.target.classList.contains('expanded') && !heatmapInitialized) {
                heatmapInitialized = true;
                setTimeout(() => initWeightLossHeatmap('widget-imc'), 150);
            } else if (!m.target.classList.contains('expanded')) {
                heatmapInitialized = false;
            }
        });
    });

    observer.observe(widget, { attributes: true, attributeFilter: ['class'] });
});

window.addEventListener('resize', debounce(() => {
    if (heatmapInitialized) initWeightLossHeatmap('widget-imc');
}, 250));

function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}
