// junkFoodBubble.js - Version finale professionnelle améliorée (correction légende)
// Visualisation : Répartition des habitudes alimentaires peu équilibrées
// Auteur : [Ton nom] – Projet de Datavisualisation

function initJunkFoodBubble(containerId) {
    const container = d3.select(`#${containerId} .widget-content`);
    container.html('');

    d3.csv('data/junkfood.csv').then(data => {
        data.forEach(d => {
            d.proportion_percent = +d.proportion_percent;
            d.avg_times_per_week = +d.avg_times_per_week;
        });
        createBubbleChart(container, data);
    }).catch(error => {
        console.error('Erreur de chargement CSV :', error);
        container.append('p')
            .style('color', '#e63946')
            .style('text-align', 'center')
            .text('Erreur lors du chargement des données.');
    });
}

function createBubbleChart(container, data) {
    const margin = { top: 80, right: 40, bottom: 160, left: 40 }; // Augmentation du bottom pour la légende
    const width = container.node().offsetWidth - margin.left - margin.right;
    const height = Math.max(600, container.node().offsetHeight) - margin.top - margin.bottom;

    const svg = container.append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    // --- Titre principal ---
    svg.append('text')
        .attr('x', width / 2)
        .attr('y', -40)
        .attr('text-anchor', 'middle')
        .style('font-size', '24px')
        .style('font-weight', '700')
        .style('fill', '#1d3557')
        .text('Répartition des habitudes alimentaires peu équilibrées');

    // --- Sous-titre ---
    svg.append('text')
        .attr('x', width / 2)
        .attr('y', -15)
        .attr('text-anchor', 'middle')
        .style('font-size', '14px')
        .style('fill', '#666')
        .text('Taille des bulles = proportion de jeunes concernés | Survol pour plus de détails');

    // --- Échelles améliorées ---
    const colorScale = d3.scaleOrdinal()
        .domain(['Aliment', 'Comportement'])
        .range(['#e63946', '#457b9d']);

    const sizeScale = d3.scaleSqrt()
        .domain([0, d3.max(data, d => d.proportion_percent)])
        .range([35, 100]);

    // --- Filtre pour les ombres portées ---
    const defs = svg.append('defs');
    const filter = defs.append('filter')
        .attr('id', 'bubble-shadow')
        .attr('height', '130%');
    
    filter.append('feGaussianBlur')
        .attr('in', 'SourceAlpha')
        .attr('stdDeviation', 3);
    
    filter.append('feOffset')
        .attr('dx', 2)
        .attr('dy', 3)
        .attr('result', 'offsetblur');
    
    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode');
    feMerge.append('feMergeNode')
        .attr('in', 'SourceGraphic');

    // --- Zone de simulation (réduite pour laisser place à la légende) ---
    const simHeight = height - 20; // Réduire légèrement la zone de simulation

    // --- Simulation physique optimisée ---
    const simulation = d3.forceSimulation(data)
        .force('center', d3.forceCenter(width / 2, simHeight / 2))
        .force('charge', d3.forceManyBody().strength(-180))
        .force('collide', d3.forceCollide().radius(d => sizeScale(d.proportion_percent) + 8))
        .force('x', d3.forceX(width / 2).strength(0.1))
        .force('y', d3.forceY(simHeight / 2).strength(0.1))
        .velocityDecay(0.4);

    // --- Tooltip amélioré ---
    const tooltip = d3.select('body').append('div')
        .attr('class', 'bubble-tooltip')
        .style('position', 'fixed')
        .style('background', 'linear-gradient(135deg, rgba(0, 0, 0, 0.95), rgba(30, 30, 30, 0.95))')
        .style('color', '#fff')
        .style('padding', '14px 18px')
        .style('border-radius', '10px')
        .style('font-size', '13px')
        .style('line-height', '1.6em')
        .style('box-shadow', '0 4px 15px rgba(0,0,0,0.4)')
        .style('max-width', '300px')
        .style('pointer-events', 'none')
        .style('opacity', 0)
        .style('border', '2px solid rgba(255,255,255,0.2)')
        .style('z-index', '99999');

    const bubbles = svg.selectAll('.bubble')
        .data(data)
        .join('g')
        .attr('class', 'bubble')
        .style('cursor', 'pointer')
        .on('mouseover', (event, d) => {
            d3.select(event.currentTarget).select('circle')
                .transition().duration(200)
                .attr('r', sizeScale(d.proportion_percent) * 1.15)
                .attr('opacity', 1)
                .style('stroke-width', 3);

            svg.selectAll('.bubble')
                .filter(b => b !== d)
                .transition().duration(200)
                .style('opacity', 0.3);

            tooltip.transition().duration(200).style('opacity', 1);
            
            const intensityColor = d.avg_times_per_week > 5 ? '#e63946' : 
                                   d.avg_times_per_week > 2 ? '#f77f00' : '#06d6a0';
            
            tooltip.html(`
                <div style="border-bottom: 2px solid ${colorScale(d.type)}; padding-bottom: 8px; margin-bottom: 10px;">
                    <strong style="font-size: 16px;">${d.categorie}</strong>
                    <div style="font-size: 11px; color: #aaa; margin-top: 3px;">${d.type}</div>
                </div>
                <div style="margin-bottom: 8px;">
                    <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: ${colorScale(d.type)}; margin-right: 6px;"></span>
                    <strong style="font-size: 18px;">${d.proportion_percent}%</strong> des jeunes concernés
                </div>
                <div style="margin-bottom: 10px;">
                    <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: ${intensityColor}; margin-right: 6px;"></span>
                    Fréquence : <strong>${d.avg_times_per_week}</strong> fois/semaine
                </div>
                <div style="font-size: 12px; color: #ddd; font-style: italic; padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.2);">
                    ${d.notes}
                </div>
            `);

            positionTooltip(event);
        })
        .on('mousemove', event => positionTooltip(event))
        .on('mouseout', (event, d) => {
            d3.select(event.currentTarget).select('circle')
                .transition().duration(200)
                .attr('r', sizeScale(d.proportion_percent))
                .attr('opacity', 0.85)
                .style('stroke-width', 2);
            
            svg.selectAll('.bubble')
                .transition().duration(200)
                .style('opacity', 1);
            
            tooltip.transition().duration(200).style('opacity', 0);
        });

    function positionTooltip(event) {
        const tooltipWidth = tooltip.node().offsetWidth;
        const tooltipHeight = tooltip.node().offsetHeight;
        const x = Math.min(window.innerWidth - tooltipWidth - 20, event.clientX + 20);
        const y = Math.min(window.innerHeight - tooltipHeight - 20, event.clientY - 20);
        tooltip.style('left', `${x}px`).style('top', `${y}px`);
    }

    // --- Cercles des bulles ---
    bubbles.append('circle')
        .attr('r', 0)
        .attr('fill', d => colorScale(d.type))
        .attr('opacity', 0.85)
        .attr('stroke', '#fff')
        .attr('stroke-width', 2)
        .style('filter', 'url(#bubble-shadow)')
        .transition()
        .duration(1500)
        .ease(d3.easeElasticOut.amplitude(1).period(0.5))
        .attr('r', d => sizeScale(d.proportion_percent));

    // --- Texte dans les bulles ---
    bubbles.each(function(d) {
        const group = d3.select(this);
        const r = sizeScale(d.proportion_percent);

        const pctFont = Math.min(24, Math.max(14, Math.round(r / 2.5)));
        group.append('text')
            .attr('class', 'bubble-percentage')
            .attr('text-anchor', 'middle')
            .attr('y', -Math.round(r * 0.15))
            .style('font-size', `${pctFont}px`)
            .style('font-weight', '800')
            .style('fill', '#fff')
            .style('text-shadow', '0 2px 4px rgba(0,0,0,0.5)')
            .style('pointer-events', 'none')
            .style('opacity', 0)
            .text(`${d.proportion_percent}%`)
            .transition()
            .delay(1200)
            .duration(400)
            .style('opacity', 1);

        if (r > 30) {
            const words = d.categorie.split(' ');
            const maxLines = r > 70 ? 3 : r > 50 ? 2 : 1;
            const chunkSize = Math.ceil(words.length / maxLines) || 1;
            const lines = [];
            
            for (let i = 0; i < words.length; i += chunkSize) {
                const line = words.slice(i, i + chunkSize).join(' ');
                if (line.length > 18 && r < 60) {
                    lines.push(line.substring(0, 15) + '...');
                } else {
                    lines.push(line);
                }
            }

            const catFont = Math.min(15, Math.max(9, Math.round(r / (lines.length * 3.5))));
            const lineHeight = Math.round(catFont * 1.2);

            const textEl = group.append('text')
                .attr('class', 'bubble-category')
                .attr('text-anchor', 'middle')
                .style('font-size', `${catFont}px`)
                .style('fill', '#f8f9fa')
                .style('pointer-events', 'none')
                .style('font-weight', '600')
                .style('text-shadow', '0 1px 3px rgba(0,0,0,0.4)')
                .style('opacity', 0);

            const startY = Math.round(r * 0.28) - Math.round((lines.length - 1) * lineHeight / 2);

            lines.forEach((line, i) => {
                textEl.append('tspan')
                    .attr('x', 0)
                    .attr('dy', i === 0 ? `${startY}px` : `${lineHeight}px`)
                    .text(line);
            });

            textEl.transition()
                .delay(1400)
                .duration(400)
                .style('opacity', 1);
        }
    });

    // --- Rectangle de fond pour la zone de légende (optionnel, pour clarté visuelle) ---
    svg.append('rect')
        .attr('x', 0)
        .attr('y', height + 10)
        .attr('width', width)
        .attr('height', 140)
        .attr('fill', '#f8f9fa')
        .attr('rx', 8)
        .attr('opacity', 0.5);

    // --- Légende principale (types) ---
    const legend = svg.append('g')
        .attr('transform', `translate(20, ${height + 30})`);

    legend.append('text')
        .attr('x', 0)
        .attr('y', -10)
        .style('font-size', '14px')
        .style('font-weight', '700')
        .style('fill', '#333')
        .text('Types de comportements :');

    const legendData = [
        { type: 'Aliment', desc: "Produits gras, sucrés ou transformés", icon: '🍔' },
        { type: 'Comportement', desc: "Habitudes de consommation", icon: '📱' }
    ];

    const legendGroups = legend.selectAll('.legend-item')
        .data(legendData)
        .join('g')
        .attr('class', 'legend-item')
        .attr('transform', (d, i) => `translate(0, ${i * 40 + 10})`);

    legendGroups.append('circle')
        .attr('r', 10)
        .attr('fill', d => colorScale(d.type))
        .attr('opacity', 0.9)
        .attr('stroke', '#fff')
        .attr('stroke-width', 2);

    legendGroups.append('text')
        .attr('x', 25)
        .attr('y', 0)
        .style('font-size', '15px')
        .style('font-weight', '700')
        .style('fill', '#333')
        .text(d => `${d.icon} ${d.type}`);

    legendGroups.append('text')
        .attr('x', 25)
        .attr('y', 18)
        .style('font-size', '12px')
        .style('fill', '#666')
        .text(d => d.desc);

    // --- Indicateur de fréquence (à droite) ---
    const frequencyLegend = svg.append('g')
        .attr('transform', `translate(${width - 250}, ${height + 30})`);

    frequencyLegend.append('text')
        .attr('x', 0)
        .attr('y', -10)
        .style('font-size', '14px')
        .style('font-weight', '700')
        .style('fill', '#333')
        .text('Intensité de consommation :');

    const freqData = [
        { label: 'Faible (< 2/sem)', color: '#06d6a0' },
        { label: 'Modérée (2-5/sem)', color: '#f77f00' },
        { label: 'Élevée (> 5/sem)', color: '#e63946' }
    ];

    const freqGroups = frequencyLegend.selectAll('.freq-item')
        .data(freqData)
        .join('g')
        .attr('transform', (d, i) => `translate(0, ${i * 25 + 10})`);

    freqGroups.append('circle')
        .attr('r', 6)
        .attr('fill', d => d.color);

    freqGroups.append('text')
        .attr('x', 15)
        .attr('y', 4)
        .style('font-size', '12px')
        .style('fill', '#666')
        .text(d => d.label);

    // --- Animation avec contraintes strictes ---
    simulation.on('tick', () => {
        bubbles.attr('transform', d => {
            const r = sizeScale(d.proportion_percent);
            // Contraindre STRICTEMENT les bulles dans la zone de simulation
            d.x = Math.max(r + 5, Math.min(width - r - 5, d.x));
            d.y = Math.max(r + 5, Math.min(simHeight - r - 5, d.y));
            return `translate(${d.x},${d.y})`;
        });
    });
}

// --- Gestion du widget ---
let junkFoodInitialized = false;

document.addEventListener('DOMContentLoaded', function() {
    const widget = document.getElementById('widget-junkfood');
    if (!widget) return;

    const observer = new MutationObserver(mutations => {
        mutations.forEach(m => {
            if (m.target.classList.contains('expanded') && !junkFoodInitialized) {
                junkFoodInitialized = true;
                setTimeout(() => initJunkFoodBubble('widget-junkfood'), 150);
            } else if (!m.target.classList.contains('expanded')) {
                junkFoodInitialized = false;
            }
        });
    });
    observer.observe(widget, { attributes: true, attributeFilter: ['class'] });
});

// --- Responsive ---
window.addEventListener('resize', debounce(() => {
    if (junkFoodInitialized) initJunkFoodBubble('widget-junkfood');
}, 250));

function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}