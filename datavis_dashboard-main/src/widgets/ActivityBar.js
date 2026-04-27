// ActivityBar - Widget 3 (Problème) : Comparaison quantité de personne obèse / respectant les recommandations de l'OMS
// Auteur :AUBERT Quentin – Projet de Datavision
// Objectif : Montrer que la population vieillissante respecte de moins en moins les recommandations de l'OMS
//            et sont de plus en plus en état d'obésité


// === CONFIGURATION ===
const CSV_FILE_PATH = "data/Sport.csv";
const margin = { top: 10, right: 60, bottom: 100, left: 80 }; // top réduit pour coller graphique
const width = 1200 - margin.left - margin.right;
const height = 500 - margin.top - margin.bottom;
const colors = { recommendations: "#ff8c00", obese: "#87ceeb" };

// === GESTION DU CLIC SUR LE WIDGET ===
document.addEventListener("click", () => {
  const widget = d3.select("#widget-activity");
  const container = widget.select(".chart-container");
  const preview = widget.select(".widget-preview"); // icône + texte original

  if (widget.classed("expanded")) {
    // Supprime complètement le preview pour ne plus garder l'espace
    preview.remove(); 

    // Nettoie le container et force alignement en haut
    container.selectAll("*").remove();
    container
      .style("display", "flex")
      .style("flex-direction", "column")
      .style("align-items", "center")
      .style("justify-content", "flex-start"); // important !

    // Insère le titre en haut
    container
      .insert("h2", ":first-child")
      .attr("class", "chart-title")
      .style("margin", "5px 0 10px 0")
      .style("padding", "0")
      .style("font-size", "22px")
      .style("font-weight", "600")
      .style("text-align", "center")
      .style("width", "100%")
      .text("Taux d'activité physique et d'obésité selon l’âge");

    // Crée le SVG juste sous le titre
    const svg = container
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom+ 20)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const tooltip = d3
      .select("body")
      .append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("background-color", "rgba(0, 0, 0, 0.85)")
      .style("color", "white")
      .style("padding", "10px 15px")
      .style("border-radius", "5px")
      .style("pointer-events", "none")
      .style("opacity", 0)
      .style("z-index", 1000)
      .style("font-size", "14px");

    // Charge les données
    d3.text(CSV_FILE_PATH)
      .then(text => {
        const data = d3.dsvFormat(";").parseRows(text, row => {
          if (row.length < 3) return null;
          return {
            ageGroup: row[0].trim(),
            recommendations: parseFloat(row[1].replace(",", ".")) || 0,
            obese: parseFloat(row[2].replace(",", ".")) || 0
          };
        }).filter(d => d !== null);

        drawChart(svg, data, tooltip);
      })
      .catch(error => {
        console.error("Erreur de lecture du CSV :", error);
        svg.append("text")
          .attr("x", width / 2)
          .attr("y", height / 2)
          .attr("text-anchor", "middle")
          .style("fill", "red")
          .text("Erreur de lecture du fichier CSV");
      });

  } else {
    // Si le widget est refermé, supprime le graphique et le titre
    container.selectAll("*").remove();

    // Recrée le preview original (icône + titre)
    container
      .append("div")
      .attr("class", "widget-preview")
      .style("display", "flex")
      .style("flex-direction", "column")
      .style("align-items", "center")
      .style("justify-content", "center")
      .html(`
        <i class="widget-icon fas fa-running"></i>
        <h3 class="widget-title">Activités physiques</h3>
      `);
  }
});

// === FONCTION D'AFFICHAGE DU GRAPHIQUE ===
function drawChart(svg, data, tooltip) {
  if (!data || data.length === 0) return;

  const xScale = d3.scaleBand()
    .domain(data.map(d => d.ageGroup))
    .range([0, width])
    .padding(0.3);

  const yScale = d3.scaleLinear()
    .domain([0, 100])
    .range([height, 0]);

  svg.append("g")
    .attr("class", "grid")
    .attr("opacity", 0.1)
    .call(d3.axisLeft(yScale).tickSize(-width).tickFormat(""));

  svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(xScale))
    .selectAll("text")
    .style("font-size", "12px")
    .style("text-anchor", "end")
    .attr("dx", "-.8em")
    .attr("dy", ".15em")
    .attr("transform", "rotate(-35)");

  svg.append("g")
    .call(d3.axisLeft(yScale).ticks(10).tickFormat(d => d + "%"))
    .style("font-size", "12px");

  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", -50)
    .attr("text-anchor", "middle")
    .style("font-size", "14px")
    .style("font-weight", "bold")
    .text("Pourcentage (%)");

  const barWidth = xScale.bandwidth() / 2.5;
  const groups = svg.selectAll(".age-group")
    .data(data)
    .enter()
    .append("g")
    .attr("class", "age-group")
    .attr("transform", d => `translate(${xScale(d.ageGroup)},0)`);

  // === BARRES ORANGE ===
  groups.append("rect")
    .attr("x", xScale.bandwidth() / 2 - barWidth - 5)
    .attr("y", height)
    .attr("width", barWidth)
    .attr("height", 0)
    .attr("fill", colors.recommendations)
    .attr("stroke", "#333")
    .on("mouseover", function(event, d) {
      d3.select(this).attr("opacity", 0.8);
      tooltip.transition().duration(200).style("opacity", 1);
      tooltip.html(`Taux de respect des recommandations<br><strong>${d.recommendations.toFixed(1)}%</strong>`)
        .style("left", (event.pageX + 15) + "px")
        .style("top", (event.pageY - 30) + "px");
    })
    .on("mouseout", function() {
      d3.select(this).attr("opacity", 1);
      tooltip.transition().duration(200).style("opacity", 0);
    })
    .transition()
    .duration(1000)
    .delay((d, i) => i * 100)
    .attr("y", d => yScale(d.recommendations))
    .attr("height", d => height - yScale(d.recommendations));

  // === BARRES BLEUES ===
  groups.append("rect")
    .attr("x", xScale.bandwidth() / 2 + 5)
    .attr("y", height)
    .attr("width", barWidth)
    .attr("height", 0)
    .attr("fill", colors.obese)
    .attr("stroke", "#333")
    .on("mouseover", function(event, d) {
      d3.select(this).attr("opacity", 0.8);
      tooltip.transition().duration(200).style("opacity", 1);
      tooltip.html(`Est obèse<br><strong>${d.obese.toFixed(1)}%</strong>`)
        .style("left", (event.pageX + 15) + "px")
        .style("top", (event.pageY - 30) + "px");
    })
    .on("mouseout", function() {
      d3.select(this).attr("opacity", 1);
      tooltip.transition().duration(200).style("opacity", 0);
    })
    .transition()
    .duration(1000)
    .delay((d, i) => i * 100)
    .attr("y", d => yScale(d.obese))
    .attr("height", d => height - yScale(d.obese));

  // === LABELS % ===
  groups.append("text")
    .attr("x", xScale.bandwidth() / 2 - barWidth / 2 - 5)
    .attr("y", d => yScale(d.recommendations) - 8)
    .attr("text-anchor", "middle")
    .style("font-size", "11px")
    .style("fill", colors.recommendations)
    .text(d => d.recommendations.toFixed(1) + "%")
    .style("opacity", 0)
    .transition()
    .delay((d, i) => i * 100 + 800)
    .duration(800)
    .style("opacity", 1);

  groups.append("text")
    .attr("x", xScale.bandwidth() / 2 + barWidth / 2 + 5)
    .attr("y", d => yScale(d.obese) - 8)
    .attr("text-anchor", "middle")
    .style("font-size", "11px")
    .style("fill", colors.obese)
    .text(d => d.obese.toFixed(1) + "%")
    .style("opacity", 0)
    .transition()
    .delay((d, i) => i * 100 + 800)
    .duration(800)
    .style("opacity", 1);

  // === LÉGENDE ===
  const legend = svg.append("g")
    .attr("transform", `translate(${width - 300}, 10)`);

  legend.append("rect")
    .attr("width", 30)
    .attr("height", 20)
    .attr("fill", colors.recommendations);

  legend.append("text")
    .attr("x", 40)
    .attr("y", 15)
    .style("font-size", "14px")
    .text("Respect des recommandations");

  legend.append("rect")
    .attr("x", 0)
    .attr("y", 30)
    .attr("width", 30)
    .attr("height", 20)
    .attr("fill", colors.obese);

  legend.append("text")
    .attr("x", 40)
    .attr("y", 45)
    .style("font-size", "14px")
    .text("Taux d'obésité");
}
