$(document).ready(function(){

  d3.queue()
    .defer(d3.json, "./data/tempbycountry.json")
    .defer(d3.json, "./data/carboncumlativeByYearByCountry.json")
    .defer(d3.json, "./data/energypercountryperyear.json")
    .await(comparison);

  function comparison(error, temperature, carbon, energy) {
    if(error) throw error;

    let width = window.innerWidth,
        height = window.innerHeight;
    
    // Responsive svg
    let svg = d3.select("body").select("div.main").append("svg")
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("viewBox","0 0 " + Math.min(width,height) + " " + Math.min(width,height))
      .attr("preserveAspectRatio","xMinYMin");

    // Get the range of year & temperature
    let year = [];
    let avgtemp = [];
    let numCountry = [];

    temperature.forEach(function(t, i) {
      let yr = t.Year;
      if (year.indexOf(yr) == -1)
        year.push(yr);

      // Check for existences
      if (typeof avgtemp[yr] === "undefined")
        avgtemp[yr] = 0;
      if (typeof numCountry[yr] === "undefined")
        numCountry[yr] = 0;

      // Only count non-zero temperatures
      if (t.Temperature != 0) {
        avgtemp[yr] += t.Temperature;
        numCountry[yr]++;
      }
    });

    // Calculate the average
    avgtemp.forEach(function(t,i) {
      avgtemp[i] = avgtemp[i] / numCountry[i];
    });   

    let year_min = d3.min(year);
    let year_max = d3.max(year);
    let avgtemp_min = d3.min(avgtemp);
    let avgtemp_max = d3.max(avgtemp);

    // Currently selected year. By default, I set it at the lowest year.
    let curr_year = year_min;

    // Scale to convert temperature to color
    let temp2color = d3.scaleLinear()
      .domain([avgtemp_min, avgtemp_max])
      .range([70, 0])
      .clamp(true);

    // Scale to convert temperature to sea level
    let temp2sea = d3.scaleLinear()
      .domain([avgtemp_min, avgtemp_max])
      .range([0.1, 0.4])
      .clamp(true);

    // Get the range of carbon dioxide emission
    let co2 = [];
    carbon.forEach(function(c, i) {
      co2.push(c.Carbon);
    });
    let co2_min = d3.min(co2);
    let co2_max = d3.max(co2);

    // Sky
    let sky = svg.append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", width)
      .attr("height", height)
      .attr("fill", d3.rgb("#b4e6f9"))
      .attr("id", "sky");
    //svg.style("background-color", d3.hsl(temp2color[avgtemp[curr_year]], 0.8, 0.7));

    // sea
    let sea = svg.append("rect")
      .attr("x", 0)
      .attr("y", height*0.7)
      .attr("width", width)
      .attr("height", height*0.3)
      .attr("fill", "#19bae5");

    // island
    svg.append("rect")
      .attr("x", width*0.05)
      .attr("y", height*0.5)
      .attr("width", width*0.9)
      .attr("height", height*0.5)
      .attr("fill", "#845346")
      .attr("id", "island");

    // factories
    for (i=0; i<9; i++) {
      // Each factory takes 4% of the width. Each gap between 2 factories
      // takes 2%. The entire series is 20% far from two sides of the screen.
      //
      // In order to make positional calculation uniform among factories, we
      // suppose that there is a 2% gap before the first factory. Therefore,
      // the left margin is reduced to 18%. In this case, number of factories
      // and number of gaps on the left of each factory are equal. Each added
      // factory needs to move 6% to the right.
      //
      // Also, the left chimney needs to shifted to the right a little bit.
      let x = width*0.18 + i*width*0.06 + width*0.005;

      // To make it easier, I assume the bounder of each factory takes 4% of
      // each side
      let y = height*0.46;

      let sketch = "M ";
      sketch += x.toString() + "," + y.toString();
      sketch += " L ";
      sketch += x.toString() + "," + (y + height*0.015).toString();
      sketch += " L ";
      sketch += (x - width*0.005).toString() + "," + (y + height*0.015).toString();
      sketch += " L ";
      sketch += (x - width*0.005).toString() + "," + (y + height*0.045).toString();
      sketch += " L ";
      sketch += (x + width*0.035).toString() + "," + (y + height*0.045).toString();
      sketch += " L ";
      sketch += (x + width*0.035).toString() + "," + (y + height*0.015).toString();
      sketch += " L ";
      sketch += (x + width*0.015).toString() + "," + (y + height*0.015).toString();
      sketch += " L ";
      sketch += (x + width*0.015).toString() + "," + y.toString();
      sketch += " L ";
      sketch += (x + width*0.010).toString() + "," + y.toString();
      sketch += " L ";
      sketch += (x + width*0.010).toString() + "," + (y + height*0.015).toString();
      sketch += " L ";
      sketch += (x + width*0.005).toString() + "," + (y + height*0.015).toString();
      sketch += " L ";
      sketch += (x + width*0.005).toString() + "," + y.toString();
      sketch += " L ";
      sketch += x.toString() + "," + y.toString();


      svg.append("path")
        .attr("d", sketch)
        .attr("transform", "translate(" + width*0.05 + ",0)")
        .style("fill", "#000000");
    }

    // buttons

    // year title on top
    let year_display = svg.append("text")
      .text(curr_year)
      .attr("id", "year-display")
      .attr("x", width*0.48)
      .attr("y", height*0.05)
      .attr("text-anchor", "middle")
      .attr("alignment-baseline","central")
      .attr("font-size", "20px")
      .attr("fill", "black");

    // time slider
    // Reference: http://bl.ocks.org/d3noob/10632804
    let slider = d3.select("#nRadius");

    let timeScale = d3.scaleLinear()
      .domain([year_min, year_max])
      .range([width*0.1, width*0.9])
      .clamp(true);

    let timeAxis = d3.axisBottom(timeScale)
      .ticks(49);

    let sliderContainer = svg.append("g")
      .attr("class", "slider-container");

    timeAxis(sliderContainer);
    sliderContainer
      .attr("transform", "translate(0," + height*0.89 + ")");

    svg.selectAll(".slider-container text")
      .attr("transform", "translate(" + width*(-0.01) + "," + height*0.02 + ")rotate(-45)");

    // when the input range changes update the circle 
    slider.on("input", function() {
      update(+this.value);
    });

    // Initial starting year
    update(1965);

    // update the elements
    function update(yr) {
      // change sea level
      sea.transition()
        .attr("y", height - height * temp2sea(avgtemp[yr]))
        .attr("height", height * temp2sea(avgtemp[yr]))
        .duration(1000);

      // change sky color
      sky.transition()
        .attr("fill", d3.hsl(temp2color(avgtemp[yr]), 0.8, 0.7))
        .duration(1000);

      curr_year = yr;
      d3.select("#year-display").text(curr_year);
    }
  }
});