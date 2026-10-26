// Exercise 6 (+ extensions): histogram with filters, tooltip and re-scaled axis; scatterplot with filter and tooltip.
// Wrapped in an IIFE so globals don't clash with Ex 4/5.
(() => {
  const width = 800, height = 400;
  const margin = { top: 20, right: 20, bottom: 50, left: 60 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;
  const BLUE = "#0071E3";

  const xScale = d3.scaleLinear(), yScale = d3.scaleLinear();
  const scatterX = d3.scaleLinear(), scatterY = d3.scaleLinear();
  const binGenerator = d3.bin().value(d => d.energyConsumption).thresholds(14);

  // Same size groups as the donut chart in Exercise 5
  const sizeGroup = s => (s < 40 ? "small" : s <= 65 ? "medium" : "large");
  const state = { tech: "All", size: "All" };

  // ---------- Tooltip (Ex 6.4 + extensions) ----------
  const tooltip = d3.select("body").append("div")
    .attr("class", "ex6-tooltip").style("position", "absolute").style("visibility", "hidden");
  const showTooltip = (event, html) => tooltip.html(html)
    .style("left", (event.pageX + 12) + "px").style("top", (event.pageY + 12) + "px")
    .style("visibility", "visible");
  const hideTooltip = () => tooltip.style("visibility", "hidden");

  // ---------- Filter buttons (one group per container) ----------
  function makeButtons(selector, options, onPick) {
    const box = d3.select(selector);
    box.selectAll("button").data(options).join("button")
      .attr("class", (d, i) => "ex6-btn" + (i === 0 ? " active" : ""))
      .text(d => d)
      .on("click", (event, value) => {
        box.selectAll("button").classed("active", d => d === value);
        onPick(value);
      });
  }

  // ---------- Histogram (6.1, 6.2 + size filter, tooltip, axis re-scale) ----------
  let histInner, yAxisG, allData;

  function drawHistogram(data) {
    const svg = d3.select("#histogram").append("svg")
      .attr("viewBox", `0 0 ${width} ${height}`);
    histInner = svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);

    // x-axis is fixed from the FULL data so filtered histograms stay comparable
    const bins = binGenerator(data);
    xScale.domain([bins[0].x0, bins[bins.length - 1].x1]).range([0, innerWidth]);
    binGenerator.domain(xScale.domain());
    yScale.range([innerHeight, 0]);

    histInner.append("g").attr("transform", `translate(0, ${innerHeight})`).call(d3.axisBottom(xScale));
    yAxisG = histInner.append("g");
    histInner.append("text").attr("x", innerWidth / 2).attr("y", innerHeight + 40)
      .attr("text-anchor", "middle").text("Energy consumption (kWh/year)");
    histInner.append("text").attr("transform", "rotate(-90)")
      .attr("x", -innerHeight / 2).attr("y", -42).attr("text-anchor", "middle").text("Number of TVs");

    updateHistogram();
  }

  function updateHistogram() {
    const filtered = allData.filter(d =>
      (state.tech === "All" || d.screenTech === state.tech) &&
      (state.size === "All" || sizeGroup(d.screenSize) === state.size));
    const bins = binGenerator(filtered);

    // Re-scale the y axis to the filtered data
    yScale.domain([0, Math.max(1, d3.max(bins, d => d.length))]).nice();
    yAxisG.transition().duration(500).call(d3.axisLeft(yScale));

    histInner.selectAll("rect").data(bins).join("rect")
      .attr("x", d => xScale(d.x0))
      .attr("width", d => Math.max(0, xScale(d.x1) - xScale(d.x0)))
      .attr("fill", BLUE).attr("stroke", "#fff")
      .on("mouseover", (event, d) =>
        showTooltip(event, `${d.x0}–${d.x1} kWh/year<br><b>${d.length}</b> TVs`))
      .on("mousemove", (event) => tooltip
        .style("left", (event.pageX + 12) + "px").style("top", (event.pageY + 12) + "px"))
      .on("mouseout", hideTooltip)
      .transition().duration(500)
        .attr("y", d => yScale(d.length))
        .attr("height", d => innerHeight - yScale(d.length));
  }

  // ---------- Scatterplot (6.3, 6.4 + tech filter) ----------
  let scatterInner;

  function drawScatterplot(data) {
    const svg = d3.select("#scatterplot").append("svg").attr("viewBox", `0 0 ${width} ${height}`);
    scatterInner = svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);

    scatterX.domain(d3.extent(data, d => d.screenSize)).range([0, innerWidth]);
    scatterY.domain([0, d3.max(data, d => d.energyConsumption)]).range([innerHeight, 0]);

    scatterInner.append("g").attr("transform", `translate(0, ${innerHeight})`).call(d3.axisBottom(scatterX));
    scatterInner.append("g").call(d3.axisLeft(scatterY));
    scatterInner.append("text").attr("x", innerWidth / 2).attr("y", innerHeight + 40)
      .attr("text-anchor", "middle").text("Screen size (inches)");
    scatterInner.append("text").attr("transform", "rotate(-90)")
      .attr("x", -innerHeight / 2).attr("y", -42).attr("text-anchor", "middle")
      .text("Energy consumption (kWh/year)");

    updateScatterplot("All");
  }

  function updateScatterplot(tech) {
    const filtered = tech === "All" ? allData : allData.filter(d => d.screenTech === tech);
    scatterInner.selectAll("circle").data(filtered, d => d.id).join(
      enter => enter.append("circle")
        .attr("cx", d => scatterX(d.screenSize)).attr("cy", d => scatterY(d.energyConsumption))
        .attr("fill", BLUE).attr("opacity", 0).attr("r", 3)
        .call(e => e.transition().duration(400).attr("opacity", 0.5)),
      update => update,
      exit => exit.transition().duration(250).attr("opacity", 0).remove()
    )
      .on("mouseover", (event, d) => showTooltip(event,
        `<b>${d.brand} ${d.model}</b><br>${d.screenSize} inch · ${d.screenTech}<br>${d.energyConsumption} kWh/year`))
      .on("mouseout", hideTooltip);
  }

  // ---------- Load ----------
  d3.csv("data/Ex6_TVdata_withStar.csv", (d, i) => ({
    id: i,
    brand: d.brand, model: d.model,
    screenSize: +d.screenSize, screenTech: d.screenTech,
    star: +d.star, energyConsumption: +d.energyConsumption
  })).then(data => {
    console.log(data);
    allData = data;
    const techs = ["All", ...new Set(data.map(d => d.screenTech))];

    drawHistogram(data);
    drawScatterplot(data);

    makeButtons("#filters", techs, t => { state.tech = t; updateHistogram(); });
    makeButtons("#size-filters", ["All", "small", "medium", "large"], s => { state.size = s; updateHistogram(); });
    makeButtons("#scatter-filters", techs, t => updateScatterplot(t));
  });
})();
