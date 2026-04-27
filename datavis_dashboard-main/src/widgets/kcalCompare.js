// kcalCompare.js - Widget 1 (Solution) : Comparaison quantité / énergie (kcal)
// Auteur : [Ton nom] – Projet de Datavision
// Objectif : Montrer qu'un petit aliment transformé (ex: burger) apporte
// plus de calories qu'une grande quantité d'aliments sains (ex: légumes).

function initKcalCompare(containerId) {
    const container = d3.select(`#${containerId} .widget-expanded-content`);
    container.html(''); // nettoyer le conteneur

    d3.csv('data/calories.csv').then(data => {
        data.forEach(d => {
            d.masse_g = parseFloat(d.masse_g?.replace(',', '.')) || 0;
            d.kcal = parseFloat(d.kcal?.replace(',', '.')) || 0;
            d.aliment = d.aliment?.trim();
            d.categorie = d.categorie?.trim();
            // Calculer la densité calorique (kcal pour 100g)
            d.densite = d.masse_g > 0 ? (d.kcal / d.masse_g) * 100 : 0;
        });

        // Filtrer les lignes vides ou invalides
        data = data.filter(d => d.aliment && !isNaN(d.kcal) && d.kcal > 0);

        // Trier par densité calorique (du plus faible au plus élevé)
        data.sort((a, b) => a.densite - b.densite);

        createKcalChart(container, data);
    });
}

function createKcalChart(container, data) {
    // Dimensions
    const margin = { top: 60, right: 50, bottom: 80, left: 180 };
    const width = container.node().offsetWidth - margin.left - margin.right;
    const height = Math.max(400, data.length * 50);

    // SVG
    const svg = container.append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    // Titre
    svg.append('text')
        .attr('x', width / 2)
        .attr('y', -30)
        .attr('text-anchor', 'middle')
        .style('font-size', '22px')
        .style('font-weight', '700')
        .style('fill', '#1d3557')
        .text('Quantité vs énergie (kcal) — Comparaison des aliments');

    // Sous-titre
    svg.append('text')
        .attr('x', width / 2)
        .attr('y', -10)
        .attr('text-anchor', 'middle')
        .style('font-size', '14px')
        .style('font-weight', '400')
        .style('fill', '#666')
        .text('Triés par densité calorique (kcal/100g) — Du moins au plus dense');

    // Échelles
    const xScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.kcal) * 1.1])
        .range([0, width]);

    const yScale = d3.scaleBand()
        .domain(data.map(d => d.aliment))
        .range([0, height])
        .padding(0.25);

    // Échelle de couleur basée sur la densité calorique
    const maxDensite = d3.max(data, d => d.densite);
    const minDensite = d3.min(data, d => d.densite);

    const colorScale = d3.scaleLinear()
        .domain([minDensite, (minDensite + maxDensite) / 2, maxDensite])
        .range(['#2ecc71', '#f39c12', '#e74c3c']) // Vert → Orange → Rouge
        .interpolate(d3.interpolateRgb);

    // Axes
    svg.append('g')
        .call(d3.axisLeft(yScale).tickSize(0))
        .selectAll('text')
        .style('font-size', '14px')
        .style('fill', '#333');

    svg.append('g')
        .attr('transform', `translate(0, ${height})`)
        .call(d3.axisBottom(xScale).ticks(6))
        .selectAll('text')
        .style('font-size', '13px')
        .style('fill', '#333');

    // Label de l'axe X
    svg.append('text')
        .attr('x', width / 2)
        .attr('y', height + 40)
        .attr('text-anchor', 'middle')
        .style('font-size', '14px')
        .style('fill', '#333')
        .style('font-weight', '500')
        .text('Kilocalories (kcal)');

    // Tooltip
    const tooltip = d3.select('body').append('div')
        .attr('class', 'bar-tooltip')
        .style('position', 'fixed')
        .style('background', 'rgba(0,0,0,0.85)')
        .style('color', '#fff')
        .style('padding', '8px 12px')
        .style('border-radius', '6px')
        .style('font-size', '13px')
        .style('line-height', '1.4em')
        .style('box-shadow', '0 3px 8px rgba(0,0,0,0.25)')
        .style('opacity', 0)
        .style('z-index', '9999');

    // Barres
    svg.selectAll('.bar')
        .data(data)
        .join('rect')
        .attr('class', 'bar')
        .attr('y', d => yScale(d.aliment))
        .attr('height', yScale.bandwidth())
        .attr('x', 0)
        .attr('width', 0)
        .attr('fill', d => colorScale(d.densite))
        .attr('rx', 6)
        .on('mouseover', (event, d) => {
            d3.select(event.currentTarget)
                .transition().duration(150)
                .attr('fill', d3.color(colorScale(d.densite)).darker(0.5));

            tooltip.transition().duration(150).style('opacity', 1);
            tooltip.html(`
                <strong>${d.aliment}</strong><br>
                Catégorie : ${d.categorie}<br>
                Masse : ${d.masse_g} g<br>
                Énergie : <b>${d.kcal} kcal/portion</b><br>
                Densité : <b>${d.densite.toFixed(1)} kcal/100g</b>
            `);

            positionTooltip(event);
        })
        .on('mousemove', event => positionTooltip(event))
        .on('mouseout', (event, d) => {
            d3.select(event.currentTarget)
                .transition().duration(150)
                .attr('fill', colorScale(d.densite));
            tooltip.transition().duration(150).style('opacity', 0);
        })
        .transition()
        .duration(1200)
        .ease(d3.easeCubicOut)
        .attr('width', d => xScale(d.kcal));

    // Étiquettes de kcal au bout des barres
    svg.selectAll('.label')
        .data(data)
        .join('text')
        .attr('class', 'label')
        .attr('x', d => xScale(d.kcal) + 8)
        .attr('y', d => yScale(d.aliment) + yScale.bandwidth() / 1.6)
        .text(d => `${d.kcal} kcal/portion`)
        .style('font-size', '13px')
        .style('fill', '#333')
        .style('font-weight', '500')
        .style('opacity', 0)
        .transition()
        .delay(1000)
        .duration(600)
        .style('opacity', 1);

    // Fonction de placement du tooltip
    function positionTooltip(event) {
        const tooltipWidth = tooltip.node().offsetWidth;
        const tooltipHeight = tooltip.node().offsetHeight;
        const x = Math.min(window.innerWidth - tooltipWidth - 15, event.clientX + 15);
        const y = Math.min(window.innerHeight - tooltipHeight - 10, event.clientY - 15);
        tooltip.style('left', `${x}px`).style('top', `${y}px`);
    }

    // Légende dégradé
    const legendWidth = 200;
    const legendHeight = 15;
    
    const legend = svg.append('g')
        .attr('transform', `translate(${width - legendWidth - 20}, ${height + 50})`);

    // Dégradé
    const defs = svg.append('defs');
    const gradient = defs.append('linearGradient')
        .attr('id', 'density-gradient')
        .attr('x1', '0%')
        .attr('x2', '100%');

    gradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', '#2ecc71');

    gradient.append('stop')
        .attr('offset', '50%')
        .attr('stop-color', '#f39c12');

    gradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', '#e74c3c');

    // Rectangle de légende
    legend.append('rect')
        .attr('width', legendWidth)
        .attr('height', legendHeight)
        .style('fill', 'url(#density-gradient)')
        .attr('rx', 3);

    // Labels de légende
    legend.append('text')
        .attr('x', 0)
        .attr('y', legendHeight + 15)
        .style('font-size', '11px')
        .style('fill', '#333')
        .text(`${minDensite.toFixed(0)} kcal/100g`);

    legend.append('text')
        .attr('x', legendWidth)
        .attr('y', legendHeight + 15)
        .attr('text-anchor', 'end')
        .style('font-size', '11px')
        .style('fill', '#333')
        .text(`${maxDensite.toFixed(0)} kcal/100g`);

    legend.append('text')
        .attr('x', legendWidth / 2)
        .attr('y', -5)
        .attr('text-anchor', 'middle')
        .style('font-size', '12px')
        .style('fill', '#333')
        .style('font-weight', '600')
        .text('Densité calorique');
}

// --- Initialisation widget ---
let kcalInitialized = false;

document.addEventListener('DOMContentLoaded', function() {
    const widget = document.getElementById('widget-kcal');
    if (!widget) return;

    const observer = new MutationObserver(mutations => {
        mutations.forEach(m => {
            if (m.target.classList.contains('expanded') && !kcalInitialized) {
                kcalInitialized = true;
                setTimeout(() => initKcalCompare('widget-kcal'), 150);
            } else if (!m.target.classList.contains('expanded')) {
                kcalInitialized = false;
            }
        });
    });

    observer.observe(widget, { attributes: true, attributeFilter: ['class'] });
});

// --- Redimensionnement fluide ---
window.addEventListener('resize', debounce(() => {
    if (kcalInitialized) initKcalCompare('widget-kcal');
}, 250));

// --- Fonction debounce ---
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}