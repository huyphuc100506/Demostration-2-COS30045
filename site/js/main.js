// Exercises 4.3–4.7: D3 horizontal bar chart (CSV → bind → scales → labels)
const W = 640, H = 760;
const svg = d3.select("#ex4-chart")
  .append("svg").attr("viewBox", `0 0 ${W} ${H}`).attr("role", "img")
  .attr("aria-label", "Bar chart of TV models per brand");

const xScale = d3.scaleLinear().domain([0, 1200]).range([0, 420]);   // 4.6 linear scale

const drawBarChart = data => {
  const yScale = d3.scaleBand()                                       // 4.6 band scale
    .domain(data.map(d => d.brand)).range([0, H]).padding(0.25);

  const row = svg.selectAll("g").data(data).join("g")                 // 4.5 data binding
    .attr("transform", d => `translate(0,${yScale(d.brand)})`);

  row.append("rect").attr("class", "bar")
    .attr("x", 130).attr("y", 0).attr("height", yScale.bandwidth()).attr("rx", 4)
    .attr("fill", "#0071E3").attr("width", 0)
    .transition().duration(900).delay((d, i) => i * 25)
    .attr("width", d => xScale(d.count));

  row.append("text").text(d => d.brand)                               // 4.7 labels
    .attr("x", 120).attr("y", yScale.bandwidth() / 2).attr("dy", "0.35em")
    .attr("text-anchor", "end").attr("fill", "#1D1D1F").style("font-size", "13px");

  row.append("text").text(d => d.count.toLocaleString())
    .attr("x", d => 130 + xScale(d.count) + 8).attr("y", yScale.bandwidth() / 2)
    .attr("dy", "0.35em").attr("fill", "#86868B").style("font-size", "12px");

  const total = d3.sum(data, d => d.count), top = data[0];
  document.getElementById("stat-brands").textContent = data.length;
  document.getElementById("stat-total").textContent = total.toLocaleString();
  document.getElementById("stat-top").textContent = top.brand;
  document.getElementById("stat-share").textContent = Math.round(top.count / total * 100) + "%";
};

d3.csv("data/exercise4_data.csv", d => ({ brand: d.brand, count: +d.count }))   // 4.4 load CSV
  .then(data => {
    data.sort((a, b) => b.count - a.count);
    console.log(data);
    new IntersectionObserver((e, o) => {
      if (e[0].isIntersecting) { drawBarChart(data); o.disconnect(); }
    }, { threshold: 0.15 }).observe(document.querySelector("#ex4-chart"));
  })
  .catch(err => {
    document.querySelector("#ex4-chart").insertAdjacentHTML("beforeend",
      '<p class="p-4 text-sm text-[#86868B]">Could not load the CSV. Open the page with Live Server rather than directly from disk.</p>');
    console.error(err);
  });

document.querySelectorAll(".reveal").forEach(el =>
  new IntersectionObserver((e, o) => { if (e[0].isIntersecting) { el.classList.add("in"); o.disconnect(); } },
    { threshold: 0.12 }).observe(el));
