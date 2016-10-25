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
    
    /* 
     * Responsive svg 
     */
    let svg = d3.select("body").select("div.main").append("svg")
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("viewBox","0 0 " + Math.min(width,height) + " " + Math.min(width,height))
      .attr("preserveAspectRatio","xMinYMin");

    /* 
     * Get the range of year & temperature
     */
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

    // Currently selected year. By default, I set it at the lowest year.
    let curr_year = year_min;

    // Currently selected indicator. By default, I set it to 1 (co2)
    let indicator_selection = 1;

    /* 
     * Sky
     */
    let sky = svg.append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", width)
      .attr("height", height)
      .attr("fill", d3.rgb("#b4e6f9"))
      .attr("id", "sky");

    /* 
     * Sea
     */
    let sea = svg.append("rect")
      .attr("x", 0)
      .attr("y", height*0.7)
      .attr("width", width)
      .attr("height", height*0.3)
      .attr("fill", "#19bae5");

    /* 
     * Island
     */
    let island = svg.append("rect")
      .attr("x", width*0.05)
      .attr("y", height*0.5)
      .attr("width", width*0.9)
      .attr("height", height*0.5)
      .attr("fill", "#845346")
      .attr("id", "island");

    /* 
     * Factories
     */
    for (i=0; i<10; i++) {
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

    /* 
     * Buttons
     * References: http://www.nikhil-nathwani.com/blog/posts/radio/radio.html
     */
    //text that the radio button will toggle
    var instruction_txt = svg.append("text")
      .attr("id","numberToggle")
      .attr("x", width*0.375)
      .attr("y", height*0.72)
      .attr("fill","#000000")
      .attr("font-size", 20)
      .text("Please select one of the below indicators");

    //container for all buttons
    var allButtons= svg.append("g")
      .attr("id","allButtons");

    //fontawesome button labels
    var labels = ['\uf017','\uf200'];

    //colors for different button states 
    var defaultColor= "#777777";
    var hoverColor= "#19bae5";
    var pressedColor= "#009d9b";

    //groups for each button (which will hold a rect and text)
    var buttonGroups = allButtons.selectAll("g.button")
      .data(labels)
      .enter()
      .append("g")
      .attr("class","button")
      .style("cursor","pointer")
      .on("click",function(d,i) {
          updateButtonColors(d3.select(this), d3.select(this.parentNode))
          //d3.select("#numberToggle").text(i+1)
          indicator_selection = i+1;
          update(curr_year);
      })
      .on("mouseover", function() {
          if (d3.select(this).select("rect").attr("fill") != pressedColor) {
              d3.select(this)
                  .select("rect")
                  .attr("fill",hoverColor);
          }
      })
      .on("mouseout", function() {
          if (d3.select(this).select("rect").attr("fill") != pressedColor) {
              d3.select(this)
                  .select("rect")
                  .attr("fill",defaultColor);
          }
      });

    var bWidth= width*0.10; //button width
    var bHeight= height*0.15; //button height
    var bSpace= width*0.02; //space between buttons
    var x0= width*0.39; //x offset
    var y0= height*0.75; //y offset

    //adding a rect to each toggle button group
    //rx and ry give the rect rounded corner
    buttonGroups.append("rect")
      .attr("class","buttonRect")
      .attr("width",bWidth)
      .attr("height",bHeight)
      .attr("x",function(d,i) {return x0+(bWidth+bSpace)*i;})
      .attr("y",y0)
      .attr("rx",5) //rx and ry give the buttons rounded corners
      .attr("ry",5)
      .attr("fill",defaultColor)

    //adding text to each toggle button group, centered 
    //within the toggle button rect
    buttonGroups.append("text")
      .attr("class","buttonText")
      .attr("font-family","FontAwesome")
      .attr("x",function(d,i) {
          return x0 + (bWidth+bSpace)*i + bWidth/2;
      })
      .attr("y",y0+bHeight/2)
      .attr("text-anchor","middle")
      .attr("dominant-baseline","central")
      .attr("fill","white")
      .text(function(d) {return d;})

    function updateButtonColors(button, parent) {
        parent.selectAll("rect")
                .attr("fill",defaultColor)

        button.select("rect")
                .attr("fill",pressedColor)
    }



    /* 
     * Year title on top
     */
    let year_display = svg.append("text")
      .text(curr_year)
      .attr("id", "year-display")
      .attr("x", width*0.48)
      .attr("y", height*0.05)
      .attr("text-anchor", "middle")
      .attr("alignment-baseline","central")
      .attr("font-size", "20px")
      .attr("fill", "black");

    /* 
     * Time slider
     * Reference: http://bl.ocks.org/d3noob/10632804
     */
    let slider = d3.select("#nRadius");

    let timeScale = d3.scaleLinear()
      .domain([year_min, year_max])
      .range([width*0.105, width*0.895])
      .clamp(true);

    let timeAxis = d3.axisBottom(timeScale)
      .ticks(49);

    let sliderContainer = svg.append("g")
      .attr("class", "slider-container");

    timeAxis(sliderContainer);
    sliderContainer
      .attr("transform", "translate(0," + height*0.925 + ")");

    svg.selectAll(".slider-container text")
      .attr("transform", "translate(" + width*(-0.01) + "," + height*0.02 + ")rotate(-45)")
      .style("fill", "#cccccc");


    svg.selectAll(".slider-container line")
      .style("stroke", "#cccccc");

    // When the input range changes update the circle 
    slider.on("input", function() {
      update(+this.value);
    });

    // Initial starting year
    let top_ten = [];
    let country_names = svg.append("g");
    let bubbles = svg.append("g");
    update(1965);

    // Update elements
    function update(yr) {
      curr_year = yr;

      // Clear old texts
      top_ten = [];
      country_names
        .style("fill-opacity", 1)
        .transition()
        .duration(1000)
        .style("fill-opacity", 0);
      country_names.text("");

      bubbles.selectAll("text").remove();

      // Need to deep copy all circles from bubbles to old_bubbles in order
      // to save the old circles
      // Deep copy references:
      let old_bubbles = svg.append("g");
      bubbles.each(function(){

      });
      bubbles.selectAll("circle").remove();
      old_bubbles.selectAll("circle")
        .transition()
        .attr("transform", "translate(" + (width*Math.random()) + ", 0)")
        .duration(3000);

      // Change sea level
      sea.transition()
        .attr("y", height - height * temp2sea(avgtemp[yr]))
        .attr("height", height * temp2sea(avgtemp[yr]))
        .duration(1000);

      // Change sky color
      sky.transition()
        .attr("fill", d3.hsl(temp2color(avgtemp[yr]), 0.8, 0.7))
        .duration(1000);

      // Change year title
      d3.select("#year-display").text(curr_year);

      if (indicator_selection == 1) {  // carbon dioxide
        let countries = [];

        carbon.forEach(function(country, i) {
          if (country.Year == yr)
            countries.push(country);

          countries.sort(function(a, b) {
            return d3.descending(a.Carbon, b.Carbon);
          });
        });

        for (j=0; j<10; j++) {
          top_ten.push(countries[j]);
        }
      } else {  // energy
        let countries = [];

        energy.forEach(function(country, i) {
          if (country.Year == yr)
            countries.push(country);

          countries.sort(function(a, b) {
            return d3.descending(a.Energy, b.Energy);
          });
        });

        for (j=0; j<10; j++) {
          top_ten.push(countries[j]);
        }
      }

      top_ten.forEach(function(country, i) {
        bubbles.append("circle")
          .attr("cx", 0)
          .attr("cy", 20)
          .attr("r", 30)
          .attr("fill", "#333333")
          .attr("fill-opacity", 0.5)
          .attr("transform", "translate(" + (width*0.25 + width*0.06*i) + "," + height*0.30 + ")");
        
        let value = "";
        // Convert to values to 2 decimal digits
        if (indicator_selection == 1) {  // carbon dioxide
          let val = (Math.round(country.Carbon * 10) / 10).toFixed(2);
          if (val < 10) value = "0";
          value += val;
        } else {  // energy
          let val = (Math.round(country.Energy * 1000) / 1000000).toFixed(2);
          if (val < 10) value = "0";
          value += val;
        }
        bubbles.append("text")
          .text(value)
          .attr("x", width*0.235 + width*0.06*i)
          .attr("y", height*0.33)
          .attr("fill", "#ffffff");

        country_names.append("text")
          .text(country.Country)
          .attr("font-size", 12)
          .style("text-anchor","end") 
          .attr("startOffset","100%")
          .attr("fill", "#cccccc")
          .attr("transform", "translate(" + (width*0.25 + width*0.06*i) + "," + height*0.52 + ")rotate(-45)");

        country_names
          .style("fill-opacity", 0)
          .transition()
          .duration(1000)
          .style("fill-opacity", 1);
        /*
        country_names.transition()
          .attr("x", 20)
          .duration(1000);
        */
      });
    }
  }
});