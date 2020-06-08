// The code for the chart is wrapped inside a function
// that automatically resizes the chart

// Store width and height parameters
var svgWidth = 960;
var svgHeight = 620;

// Set up margins
var margin = {
  top: 20,
  right: 40,
  bottom: 180,
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

// Initial Params
var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";

// function used for updating x-scale var upon click on axis label
function xScale(healthData, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(healthData, d => d[chosenXAxis]) * 0.8,
    d3.max(healthData, d => d[chosenXAxis]) * 1.2
    ])
    .range([0, width]);

  return xLinearScale;

}

//function used for updating y-scale var upon clicking on axis label
function yScale(healthData, chosenYAxis) {
  //create scales
  var yLinearScale = d3.scaleLinear()
    .domain([d3.min(healthData, d => d[chosenYAxis]) * 0.8,
    d3.max(healthData, d => d[chosenYAxis]) * 1.2])
    .range([height, 0]);

  return yLinearScale;
}

//function used for updating xAxis var upon click on axis label
function renderAxesX(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

//function used for updating yAxis var upon click on axis label
function renderAxesY(newYScale, yAxis) {
  var leftAxis = d3.axisLeft(newYScale);

  yAxis.transition()
    .duration(1000)
    .call(leftAxis);

  return yAxis;
}

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]))
    .attr("cy", data => newYScale(data[chosenYAxis]));

  return circlesGroup;
}

//function used for updating state labels with a transition to new 
function renderText(textGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

  textGroup.transition()
    .duration(1000)
    .attr("x", d => newXScale(d[chosenXAxis]))
    .attr("y", d => newYScale(d[chosenYAxis]));

  return textGroup;
}

//function used to stylize x-axis tooltip values 
function styleX(value, chosenXAxis) {

  //stylize based on variable chosen
  //poverty percentage
  if (chosenXAxis === 'poverty') {
      return `${value}%`;
  }
  //household income in dollars
  else if (chosenXAxis === 'income') {
      return `$${value}`;
  }
  //age (number)
  else {
      return `${value}`;
  }
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

  var xlabel;

  if (chosenXAxis === "poverty") {
    xlabel = "In Poverty (%):";
  }
  else if (chosenXAxis === "age") {
    xlabel = "Age (Median):";
  }
  else {
    xlabel = "Household Income (Median):";
  }

  //select y label
  if (chosenYAxis === 'healthcare') {
    var ylabel = "Lack of Healthcare (%):"
  }
  else if (chosenYAxis === 'obesity') {
    var ylabel = "Obesity:"
  }
  else {
    var ylabel = "Smokers:"
  }

  var toolTip = d3.tip()
    .attr("class", "d3-tip")
    .offset([80, -60])
    .html(function (d) {
      return (`${d.state}<br>${xlabel} ${styleX(d[chosenXAxis])}<br>${ylabel} ${d[chosenYAxis]}%`);
    });

  chartGroup.call(toolTip);

  circlesGroup.on("mouseover", toolTip.show)
      .on("mouseout", toolTip.hide);

  return circlesGroup;
}

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
    data.obesity = +data.obesity;
    data.smokes = +data.smokes;
    data.healthcare = +data.healthcare;
    data.poverty = +data.poverty;
    data.abbr = data.abbr;
    data.income = +data.income;
    data.state = data.state;
  });

  // Create scale functions
  // ==============================
  var xLinearScale = xScale(healthData, chosenXAxis)
    .domain([8.5, d3.max(healthData, d => d[chosenXAxis])])
    .range([0, width]);
  var yLinearScale = yScale(healthData, chosenYAxis)
    .domain([3.5, d3.max(healthData, d => d[chosenYAxis])])
    .range([height, 0]);
    
  // Create axis functions
  // ==============================python -m http.server 8000 --bind 127.0.0.1
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // append x axis
  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  //append y axis
  var yAxis = chartGroup.append("g")
    .classed("y-axis", true)
    .call(leftAxis);

  // Create Circles for scatter plot
  // =======================================
  var circlesGroup = chartGroup.selectAll("circle")
    .data(healthData)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", "13")
    .attr("fill", "blue")
    .attr("opacity", ".4")

  // Append text to circles
  var textGroup = chartGroup.select("g")
    .selectAll("circle")
    .data(healthData)
    .enter()
    .append("text")
    .attr("x", d => xLinearScale(d[chosenXAxis]))
    .attr("y", d => yLinearScale(d[chosenYAxis]))
    .attr("dy", -415)
    .attr("text-anchor", "middle")
    .attr("font-size", "10px")
    .attr("fill", "black")
    .text(d => (d.abbr));

  // Create group for  3 x-axis labels
  var xLabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20 + margin.top})`);

  var povertyLabel = xLabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "poverty") // value to grab for event listener
    .classed("aText", true)
    .classed("active", true)
    .text("In Poverty %");

  var ageLabel = xLabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "age") // value to grab for event listener
    .classed("aText", true)
    .classed("inactive", true)
    .text("Age (Median)");

  var incomeLabel = xLabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 60)
    .attr("value", "income") // value to grab for event listener
    .classed("aText", true)
    .classed("inactive", true)
    .text("Household Income (Median)");

  // Create group for 3 y-axis labels
  var yLabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${0 - margin.left / 4}, ${(height / 2)})`);

  var healthcareLabel = yLabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 0 - 20)
    .attr("dy", "1em")
    .attr("transform", "rotate(-90)")
    .attr("value", "healthcare")
    .classed("aText", true)
    .classed("active", true)
    .text("Lacks Healthcare (%)");

  var smokesLabel = yLabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 0 - 40)
    .attr("dy", "1em")
    .attr("transform", "rotate(-90)")
    .attr("value", "smokes")
    .classed("aText", true)
    .classed("inactive", true)
    .text("Smokers (%)");

  var obesityLabel = yLabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 0 - 60)
    .attr("dy", "1em")
    .attr("transform", "rotate(-90)")
    .attr("value", "obesity")
    .classed("aText", true)
    .classed("inactive", true)
    .text("Obesity (%)");


  // updateToolTip function 
  var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

  // x axis labels event listener
  xLabelsGroup.selectAll("text")
    .on("click", function () {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenXAxis) {

        // replaces chosenXAxis with value
        chosenXAxis = value;

        // console.log(chosenXAxis)

        // functions here found above csv import
        // updates x scale for new data
        xLinearScale = xScale(healthData, chosenXAxis);

        // updates x axis with transition
        xAxis = renderAxesX(xLinearScale, xAxis);

        // updates circles with new x values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

        //update text with new x values
        textGroup = renderText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

        // changes classes to change bold text
        if (chosenXAxis === "poverty") {
          povertyLabel
            .classed("active", true)
            .classed("inactive", false);
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
          incomeLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else if (chosenXAxis === "age") {
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
          ageLabel
            .classed("active", true)
            .classed("inactive", false);
          incomeLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else {
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
          incomeLabel
            .classed("active", true)
            .classed("inactive", false);
        }
      }
    });


//y axis labels event listener
yLabelsGroup.selectAll("text")
  .on("click", function () {
    //get value of selection
    var value = d3.select(this).attr("value");

    //check if value is same as current axis
    if (value != chosenYAxis) {

      //replace chosenYAxis with value
      chosenYAxis = value;

      //update y scale for new data
      yLinearScale = yScale(healthData, chosenYAxis);

      //update x axis with transition
      yAxis = renderAxesY(yLinearScale, yAxis);

      //update circles with new y values
      circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

      //update text with new y values
      textGroup = renderText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis)

      //update tooltips with new info
      circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

      //change classes to change bold text
      if (chosenYAxis === "obesity") {
        obesityLabel
          .classed("active", true)
          .classed("inactive", false);
        smokesLabel
          .classed("active", false)
          .classed("inactive", true);
        healthcareLabel
          .classed("active", false)
          .classed("inactive", true);
      }
      else if (chosenYAxis === "smokes") {
        obesityLabel
          .classed("active", false)
          .classed("inactive", true);
        smokesLabel
          .classed("active", true)
          .classed("inactive", false);
        healthcareLabel
          .classed("active", false)
          .classed("inactive", true);
      }
      else {
        obesityLabel
          .classed("active", false)
          .classed("inactive", true);
        smokesLabel
          .classed("active", false)
          .classed("inactive", true);
        healthcareLabel
          .classed("active", true)
          .classed("inactive", false);
      }
    }
  })};


