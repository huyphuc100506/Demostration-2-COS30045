(() => {
// 1. Load + format data (names must match CSV columns exactly)
d3.csv("data/energy_55inch_by_screen.csv", d => ({
  tech: d.screenTech,
  energy: +d.avgEnergy          // convert string -> number
})).then(data => {
  data.sort((a, b) => b.energy - a.energy);   // high -> low
  console.log(data);
  drawBarChart(data);
});

const drawBarChart = data => {
  // 2. Size + margins
  const width = 1200, height = 600;
  const margin = { top: 80, right: 30, bottom: 50, left: 70 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // 3. SVG container (responsive via viewBox)
  const svg = d3.select("#bar-chart")
    .append("div")
      .attr("class", "responsive-svg-container")
    .append("svg")
      .attr("viewBox", `0 0 ${width} ${height}`);

  // inner chart group, shifted by the margins
  const innerChart = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  // 4. Scales
  const xScale = d3.scaleBand()
    .domain(data.map(d => d.tech))
    .range([0, innerWidth])
    .padding(0.1);

  const yScale = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.energy)])
    .nice()
    .range([innerHeight, 0]);      // upside down: 0 is at the bottom

  // 5. Axes
  const bottomAxis = d3.axisBottom(xScale).tickSize(0).tickPadding(10);
  const leftAxis = d3.axisLeft(yScale);

  innerChart.append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0, ${innerHeight})`)
    .call(bottomAxis);

  innerChart.append("g")
    .attr("class", "y-axis")
    .call(leftAxis);

  // y-axis label
  svg.append("text")
    .attr("class", "axis-label")
    .attr("x", margin.left)
    .attr("y", margin.top - 30)
    .text("Energy Consumption (kWh)");

  // 6. Bars
  innerChart.selectAll(".bar")
    .data(data)
    .join("rect")
      .attr("class", "bar")
      .attr("x", d => xScale(d.tech))
      .attr("y", d => yScale(d.energy))
      .attr("width", xScale.bandwidth())
      .attr("height", d => innerHeight - yScale(d.energy));

  // 7. Value labels on bars
  innerChart.selectAll(".bar-label")
    .data(data)
    .join("text")
      .attr("class", "bar-label")
      .attr("x", d => xScale(d.tech) + xScale.bandwidth() / 2)
      .attr("y", d => yScale(d.energy) - 8)
      .text(d => `${Math.round(d.energy)} kWh`);
};
})();
