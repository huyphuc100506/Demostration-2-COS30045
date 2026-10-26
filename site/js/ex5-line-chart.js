(() => {
// 1. Load + format data (column names must match the CSV exactly)
d3.csv("data/ARE_Spot_Prices.csv", d => ({
  year: +d.Year,                              // number, not string
  averagePrice: +d["Average Price (notTas-Snowy)"]
})).then(data => {
  console.log(data);
  drawLineChart(data);
});

const drawLineChart = data => {
  // 2. Size + margins (same as bar chart)
  const width = 1200, height = 600;
  const margin = { top: 80, right: 150, bottom: 50, left: 70 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // 3. Scales (both continuous -> scaleLinear)
  const xScale = d3.scaleLinear()
    .domain(d3.extent(data, d => d.year))     // [1998, 2024]
    .range([0, innerWidth]);

  const yScale = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.averagePrice)])
    .nice()
    .range([innerHeight, 0]);

  // 4. Axes (force integer years)
  const bottomAxis = d3.axisBottom(xScale).tickFormat(d3.format("d"));
  const leftAxis = d3.axisLeft(yScale);

  // 5. SVG + inner chart
  const svg = d3.select("#line-chart")
    .append("div")
      .attr("class", "responsive-svg-container")
    .append("svg")
      .attr("viewBox", `0 0 ${width} ${height}`);

  const innerChart = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  innerChart.append("g")
    .attr("transform", `translate(0, ${innerHeight})`)
    .call(bottomAxis);

  innerChart.append("g")
    .call(leftAxis);

  // axis labels
  svg.append("text")
    .attr("class", "axis-label")
    .attr("x", margin.left)
    .attr("y", margin.top - 30)
    .text("Average Price ($ per MWh)");

  svg.append("text")
    .attr("class", "axis-label")
    .attr("x", margin.left + innerWidth / 2)
    .attr("y", height - 10)
    .attr("text-anchor", "middle")
    .text("Year");

  // 6. Area (optional extra)
  const areaGenerator = d3.area()
    .x(d => xScale(d.year))
    .y0(innerHeight)
    .y1(d => yScale(d.averagePrice));

  innerChart.append("path")
    .attr("class", "area")
    .attr("d", areaGenerator(data));

  // 7. Line: the generator turns data -> path coordinates via the scales
  const lineGenerator = d3.line()
    .x(d => xScale(d.year))
    .y(d => yScale(d.averagePrice));

  innerChart.append("path")
    .attr("class", "line")
    .attr("d", lineGenerator(data));

  // 8. Scatter points
  innerChart.selectAll(".dot")
    .data(data)
    .join("circle")
      .attr("class", "dot")
      .attr("r", 4)
      .attr("cx", d => xScale(d.year))
      .attr("cy", d => yScale(d.averagePrice));

  // 9. Label at the end of the line
  const last = data[data.length - 1];
  innerChart.append("text")
    .attr("class", "line-label")
    .attr("x", xScale(last.year) + 10)
    .attr("y", yScale(last.averagePrice) + 5)
    .text("Average Price");
};
})();
