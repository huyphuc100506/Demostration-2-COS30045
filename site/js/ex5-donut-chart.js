(() => {
// 1. Load + format data
d3.csv("data/tv_size_count.csv", d => ({
  size: d.size,
  count: +d.count
})).then(data => {
  console.log(data);
  drawDonutChart(data);      // no sort: keep small -> medium -> large order
});

const drawDonutChart = data => {
  // 2. Size: radius is based on the shortest side
  const width = 1200, height = 600;
  const padding = 40;
  const radius = Math.min(width, height) / 2 - padding;

  // 3. Colour scale (ordinal = discrete categories -> colours)
  const colourScale = d3.scaleOrdinal()
    .domain(data.map(d => d.size))
    .range(d3.schemeSet2);

  // 4. Angles for each slice (sort(null) keeps table order)
  const pie = d3.pie()
    .value(d => d.count)
    .sort(null);

  // 5. Arc generator (inner radius = 60% of outer -> donut)
  const arcGenerator = d3.arc()
    .innerRadius(radius * 0.6)
    .outerRadius(radius)
    .padAngle(0.01)
    .cornerRadius(4);

  // 6. SVG + group centred in the canvas
  const svg = d3.select("#donut-chart")
    .append("div")
      .attr("class", "responsive-svg-container")
    .append("svg")
      .attr("viewBox", `0 0 ${width} ${height}`);

  const chart = svg.append("g")
    .attr("transform", `translate(${width / 2}, ${height / 2})`);

  // 7. Arcs
  const arcs = chart.selectAll("g.arc")
    .data(pie(data))
    .join("g")
      .attr("class", "arc");

  arcs.append("path")
    .attr("d", arcGenerator)
    .attr("fill", d => colourScale(d.data.size));

  // 8. Labels at the centre of each slice
  const total = d3.sum(data, d => d.count);
  arcs.append("text")
    .attr("class", "donut-label")
    .attr("transform", d => `translate(${arcGenerator.centroid(d)})`)
    .text(d => `${d.data.size} (${Math.round(d.data.count / total * 100)}%)`);
};
})();
