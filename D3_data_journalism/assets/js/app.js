// The code for the chart is wrapped inside a function
// that automatically resizes the chart
function makeResponsive() {

  // Store width and height parameters
  var svgWidth = 960;
  var svgHeight = 500;

  // Set up margins
  var margin = {
    top: 20,
    right: 40,
    bottom: 60,
    left: 100
  };

  // Create width and height parameters based on SVG margins (left and right)

  var width = svgWidth - margin.left - margin.right;
  var height = svgHeight - margin.top - margin.bottom;

  // Create an SVG wrapper, append an SVG group that holds the chart
  // and shift the latter by left and top margins.
  var svg = d3.select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

  var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  // Import Data
  var file = "assets/data/data.csv"

  d3.csv(file).then(successHandler, errorHandler);

  function errorHandler(error) {
    throw err;
  }

  function successHandler(healthData) {
    // Parse Data/Cast as numbers
    // ==============================
    healthData.forEach(function (data) {
      data.age = +data.age;
      data.smokes = +data.smokes;
      data.healthcare = +data.healthcare;
      data.poverty = +data.poverty;
      data.abbr = data.abbr;
      data.income = +data.income;
      data.state = data.state;
    });

    // Create scale functions
    // ==============================
    var xLinearScale = d3.scaleLinear()
      .domain([8.5, d3.max(healthData, d => d.poverty)])
      .range([0, width]);

    var yLinearScale = d3.scaleLinear()
      .domain([3.5, d3.max(healthData, d => d.healthcare)])
      .range([height, 0]);

    // Create axis functions
    // ==============================python -m http.server 8000 --bind 127.0.0.1
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // Append Axes to the chart
    // ==============================
    chartGroup.append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(bottomAxis);

    chartGroup.append("g")
      .call(leftAxis);

    // Initialize toolTip
    // ==============================
    var toolTip = d3
      .tip()
      .attr("class", "d3-tip")
      .offset([80, -60])
      .html(function (d) {
        return (`${d.state}<br>Poverty: ${d.poverty}%<br>Healthcare: ${d.healthcare}%`);
      });

    var vis = chartGroup
      .append('svg')
      .call(toolTip);


    // Create Circles for scatter plot
    // =======================================
    var circlesGroup = chartGroup.selectAll("circle")
      .data(healthData)
      .enter()
      .append("circle")
      .attr("cx", d => xLinearScale(d.poverty))
      .attr("cy", d => yLinearScale(d.healthcare))
      .attr("r", "13")
      .attr("fill", "blue")
      .attr("opacity", ".4")


    // Append text to circles and toolTip

    chartGroup.select("g")
      .selectAll("circle")
      .data(healthData)
      .enter()
      .append("text")
      .attr("x", d => xLinearScale(d.poverty))
      .attr("y", d => yLinearScale(d.healthcare))
      .attr("dy", -415)
      .attr("text-anchor", "middle")
      .attr("font-size", "10px")
      .attr("fill", "black")
      .text(d => (d.abbr))
      

    // Create tooltip in the chart
    // ==============================
    chartGroup.call(toolTip);

    // Create event listeners to show and hide the tooltip
    // ==============================
    circlesGroup.on("mouseover", toolTip.show)
      .on("mouseout", toolTip.hide);

    // Create axes labels
    chartGroup.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left + 40)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .attr("class", "axisText")
      .text("Lacks Healthcare (%)");

    chartGroup.append("text")
      .attr("transform", `translate(${width / 2}, ${height + margin.top + 30})`)
      .attr("class", "axisText")
      .text("In Poverty (%)");
  }
}

// When the browser loads, makeResponsive() is called.
makeResponsive();