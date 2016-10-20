$(document).ready(function(){

  d3.queue()
    .defer(d3.json, "./data/tempbycountry.json")
    //.defer(d3.json, "./data/carbongasByYearByCountry.json")
    //.defer(d3.json, "./data/energyfossilpercountryperyear.json")
    //.defer(d3.json, "./data/carbonSolidByYearByCountry.json")
    //.defer(d3.json, "./data/data.json")
    .await(comparison);

  //function comparison(error, temp, gas, fossil, coal) {
  function comparison(error, temperature) {
    if(error) throw error;

    let width = window.innerWidth,
        height = window.innerHeight;
    console.log(width);

    // Responsive svg
    let svg = d3.select("body").select("div.main").append("svg")
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("viewBox","0 0 " + Math.min(width,height) + " " + Math.min(width,height))
      .attr("preserveAspectRatio","xMinYMin")

    // Get the range of temperature (on entire dataset)
    let year = [];
    temperature.forEach(function(t, i) {
      year.push(t.Year);
    });
    let slider_min = d3.min(year);
    let slider_max = d3.max(year);

    // Sky
    let sky_color = d3.rgb("#b4e6f9");
    //sky_color = sky_color.darker();
    svg.style("background-color", sky_color);

    // sea
    let sea_lvl = height*0.3;
    svg.append("rect")
      .attr("x", 0)
      .attr("y", height - sea_lvl)
      .attr("width", width*1.2)
      .attr("height", sea_lvl)
      .attr("fill", "#19bae5");

    // island
    svg.append("rect")
      .attr("x", width*0.1)
      .attr("y", height*0.5)
      .attr("width", width*0.8)
      .attr("height", height*0.5)
      .attr("fill", "#845346");

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

    // year
    let year_title = svg.append("year_title")
      .attr("x", 10)
      .attr("y", 10)
      .attr("width", "20%")
      .attr("height", "10%")
      .attr("fill", "#ffffff");

    // time slider
    // Reference: https://bl.ocks.org/mbostock/6452972
    let x = d3.scaleLinear()
      .domain([slider_min, slider_max])
      .range([width*0.20, width*0.80])
      .clamp(true);

    let slider = svg.append("g")
      .attr("class", "slider")
      .attr("transform", "translate(0," + height*0.9 + ")");

    slider.append("line")
      .attr("class", "track")
      .attr("x1", x.range()[0])
      .attr("x2", x.range()[1])
    .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
      .attr("class", "track-inset")
    .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
      .attr("class", "track-overlay")
      .call(d3.drag()
          .on("start.interrupt", function() { slider.interrupt(); })
          .on("start drag", function() { hue(x.invert(d3.event.x)); }));

    slider.insert("g", ".track-overlay")
      .attr("class", "ticks")
      .attr("transform", "translate(0," + 18 + ")")
    .selectAll("text")
    .data(x.ticks(20))
    .enter().append("text")
      .attr("x", x)
      .attr("text-anchor", "middle")
      .text(function(d) { return "'" + d%100; });

    var handle = slider.insert("circle", ".track-overlay")
        .attr("class", "handle")
        .attr("r", 9);

    slider.transition() // Gratuitous intro!
        .duration(750)
        .tween("hue", function() {
          var i = d3.interpolate(0, 70);
          return function(t) { hue(i(t)); };
        });

    function hue(h) {
      h = Math.round(h);
      handle.attr("cx", x(h));
      console.log(h, x(h));
      svg.style("background-color", d3.hsl(h, 0.8, 0.8));
    }
  }
});