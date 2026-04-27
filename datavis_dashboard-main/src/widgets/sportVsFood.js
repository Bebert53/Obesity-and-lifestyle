// src/widgets/sportVsFood.js

const CSV_FILE_PATH = "data/Donnees.csv";
const TITLE_RATIO = 0.2; // 20% de la hauteur pour le titre
const MARGIN = { top: 10, right: 50, bottom: 60, left: 60, legendBottom: 40 };

const widget = d3.select("#widget-sportfood");
const container = widget.select(".chart-container");
container.style("position", "relative");

// Tooltip
const tooltip = d3.select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("background-color", "rgba(0,0,0,0.85)")
    .style("color", "white")
    .style("padding", "10px 15px")
    .style("border-radius", "5px")
    .style("pointer-events", "none")
    .style("opacity", 0)
    .style("z-index", 1000)
    .style("font-size", "14px");

// Chargement CSV
d3.text(CSV_FILE_PATH).then(text => {
    const rawData = d3.dsvFormat(",").parseRows(text, row => {
        if (row[0] === "User_ID") return null; // Ignore header
        return {
            User_ID: row[0],
            Gender: row[1],
            Age: +row[2],
            Height: +row[3],
            Weight: +row[4],
            Duration: +row[5],
            Heart_Rate: +row[6],
            Body_Temp: +row[7],
            Calories: +row[9]
        };
    }).filter(d => d !== null);

    drawChart(rawData);
}).catch(err => console.error("Erreur CSV:", err));

function drawChart(data) {
    container.selectAll("svg").remove();

    const containerWidth = container.node().clientWidth;
    const containerHeight = container.node().clientHeight || 500;

    const chartHeight = containerHeight * (1 - TITLE_RATIO);
    const titleHeight = containerHeight * TITLE_RATIO;

    const svg = container.append("svg")
        .attr("width", containerWidth)
        .attr("height", containerHeight);

    // Scales
    const xScale = d3.scaleLinear()
        .domain(d3.extent(data, d => d.Duration))
        .range([MARGIN.left, containerWidth - MARGIN.right]);

    const yScale = d3.scaleLinear()
        .domain(d3.extent(data, d => d.Heart_Rate))
        .range([titleHeight + chartHeight - MARGIN.bottom - MARGIN.legendBottom, titleHeight + MARGIN.top]);

    const caloriesExtent = d3.extent(data, d => d.Calories);
    const colorScale = d3.scaleSequential(d3.interpolateTurbo)
        .domain(caloriesExtent);

    // Axes
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);

    // Axe X
    svg.append("g")
        .attr("transform", `translate(0,${titleHeight + chartHeight - MARGIN.bottom - MARGIN.legendBottom})`)
        .call(xAxis);

    svg.append("text")
        .attr("x", containerWidth / 2)
        .attr("y", titleHeight + chartHeight - MARGIN.bottom - MARGIN.legendBottom + 40)
        .attr("text-anchor", "middle")
        .attr("fill", "#000")
        .text("Durée (minutes)");

    // Axe Y
    svg.append("g")
        .attr("transform", `translate(${MARGIN.left},0)`)
        .call(yAxis);

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", - (titleHeight + chartHeight)/2)
        .attr("y", MARGIN.left - 45)
        .attr("text-anchor", "middle")
        .attr("fill", "#000")
        .text("Rythme cardiaque (bpm)");

    // Points
    svg.selectAll("circle")
        .data(data)
        .join("circle")
        .attr("cx", d => xScale(d.Duration))
        .attr("cy", d => yScale(d.Heart_Rate))
        .attr("r", 6)
        .attr("fill", d => colorScale(d.Calories))
        .attr("stroke", "black")
        .attr("stroke-width", 0.5)
        .on("mousemove", (event, d) => {
            tooltip.style("opacity", 1)
                .html(
                    `Sexe: ${d.Gender}<br>` +
                    `Age: ${d.Age}<br>` +
                    `Taille: ${d.Height} cm<br>` +
                    `Poids: ${d.Weight} kg<br>` +
                    `Durée: ${d.Duration} min<br>` +
                    `Rythme cardiaque: ${d.Heart_Rate} bpm<br>` +
                    `Température du corps: ${d.Body_Temp} °C<br>` +
                    `Calories: ${d.Calories}`
                )
                .style("left", (event.pageX + 15) + "px")
                .style("top", (event.pageY - 30) + "px");
        })
        .on("mouseout", () => tooltip.style("opacity", 0));

    // Légende couleur en bas à droite avec titre
    const legendWidth = 150;
    const legendHeight = 15;
    const legendX = containerWidth - MARGIN.right - legendWidth;
    const legendY = titleHeight + chartHeight - MARGIN.legendBottom;

    // Dégradé
    const defs = svg.append("defs");
    const linearGradient = defs.append("linearGradient")
        .attr("id", "legend-gradient");

    linearGradient.selectAll("stop")
        .data(d3.range(0,1.01,0.25))
        .join("stop")
        .attr("offset", d => d*100 + "%")
        .attr("stop-color", d => colorScale(caloriesExtent[0] + d*(caloriesExtent[1]-caloriesExtent[0])));

    // Barre de légende
    svg.append("rect")
        .attr("x", legendX)
        .attr("y", legendY)
        .attr("width", legendWidth)
        .attr("height", legendHeight)
        .style("fill", "url(#legend-gradient)")
        .style("stroke", "#000")
        .style("stroke-width", 0.5);

    // Titre de la légende
    svg.append("text")
        .attr("x", legendX + legendWidth/2)
        .attr("y", legendY - 5)
        .attr("text-anchor", "middle")
        .attr("fill", "#000")
        .attr("font-weight", "bold")
        .text("Calories brûlées");

    // Min/Max labels
    svg.append("text")
        .attr("x", legendX)
        .attr("y", legendY + legendHeight + 12)
        .attr("fill", "#000")
        .attr("text-anchor", "start")
        .text(Math.round(caloriesExtent[0]));

    svg.append("text")
        .attr("x", legendX + legendWidth)
        .attr("y", legendY + legendHeight + 12)
        .attr("fill", "#000")
        .attr("text-anchor", "end")
        .text(Math.round(caloriesExtent[1]));

    // Redraw on resize
    window.addEventListener("resize", () => drawChart(data));
}