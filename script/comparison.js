$(document).ready(function(){

  d3.queue()
    .defer(d3.json, "./data/tempbycountry1.json")
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

    // Responsive svg
    let svg = d3.select("body").select("div.main").append("svg")
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("viewBox","0 0 " + Math.min(width,height) + " " + Math.min(width,height))
      .attr("preserveAspectRatio","xMinYMin")

    // Get the range of temperature (on entire dataset)
    let temp = [];
    temperature.forEach(function(t, i) {
      temp.push(t.Temperature);
    });
    console.log(d3.min(temp));
    console.log(d3.max(temp));

    // Sky
    let sky_color = d3.rgb("#b4e6f9");
    //sky_color = sky_color.darker();
    svg.style("background-color", sky_color);

    // sea
    let sea_lvl = Math.floor(height*0.3);
    svg.append("rect")
      .attr("x", 0)
      .attr("y", height-sea_lvl)
      .attr("width", width)
      .attr("height", sea_lvl)
      .attr("fill", "#19bae5");

    // island
    svg.append("rect")
      .attr("x", Math.floor(width*0.1))
      .attr("y", Math.floor(height*0.5))
      .attr("width", Math.floor(width*0.8))
      .attr("height", Math.floor(height*0.5))
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
      let x = Math.floor(width*0.18 + i*width*0.06 + width*0.005);

      // To make it easier, I assume the bounder of each factory takes 4% of
      // each side
      let y = Math.floor(height*0.46);

      let sketch = "M ";
      sketch += x.toString() + "," + y.toString();
      sketch += " L ";
      sketch += x.toString() + "," + (y + Math.floor(height*0.015)).toString();
      sketch += " L ";
      sketch += (x - Math.floor(width*0.005)).toString() + "," + (y + Math.floor(height*0.015)).toString();
      sketch += " L ";
      sketch += (x - Math.floor(width*0.005)).toString() + "," + (y + Math.floor(height*0.045)).toString();
      sketch += " L ";
      sketch += (x + Math.floor(width*0.035)).toString() + "," + (y + Math.floor(height*0.045)).toString();
      sketch += " L ";
      sketch += (x + Math.floor(width*0.035)).toString() + "," + (y + Math.floor(height*0.015)).toString();
      sketch += " L ";
      sketch += (x + Math.floor(width*0.015)).toString() + "," + (y + Math.floor(height*0.015)).toString();
      sketch += " L ";
      sketch += (x + Math.floor(width*0.015)).toString() + "," + y.toString();
      sketch += " L ";
      sketch += (x + Math.floor(width*0.010)).toString() + "," + y.toString();
      sketch += " L ";
      sketch += (x + Math.floor(width*0.010)).toString() + "," + (y + Math.floor(height*0.015)).toString();
      sketch += " L ";
      sketch += (x + Math.floor(width*0.005)).toString() + "," + (y + Math.floor(height*0.015)).toString();
      sketch += " L ";
      sketch += (x + Math.floor(width*0.005)).toString() + "," + y.toString();
      sketch += " L ";
      sketch += x.toString() + "," + y.toString();


      svg.append("path")
        .attr("d", sketch)
        .style("fill", "#000000");
    }

    // time slider

    // buttons

    // year
  }
});