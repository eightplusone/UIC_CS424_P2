$(document).ready(function(){
	
	let width = window.innerWidth,
		height = window.innerHeight;
	
	var year=1965;
	
    // Responsive svg
    let svg = d3.select("body").select("div.main").append("svg")
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("viewBox","0 0 " + Math.min(width,height) + " " + Math.min(width,height))
      .attr("preserveAspectRatio","xMinYMin");
	  
	var div = d3.select("body").append("div")
                    .attr("class", "tooltip")
                    .style("opacity", 0);  
	  
	function getyear(d)
    {
       return d.year;
    }

    function gettemperature(d)
    {
        return d.temperature;
    }  
	
	function render(year,item){
	    if(item=="Temperature(degree Celcius)")
		{
			rendertemperature(year);	//temperature
		}
		else if(item=="Energy Consumption(Kg of Oil Equivalent per capita)")
		{
			renderenergy(year);	//energy
		}
		else if(item=="Carbon Emissions (Metric Tons per Capita)")
		{
			rendercarbon(year);	//carbon
		}
		else{
			rendertemperature(year);
		}
		
	}
	
	render(1965,"temperature");
	
	function rendertemperature(year){
	 
	 var mineobj = new Array();
     var mineTemp = new Array();		
	 d3.json("./data/tempbycountry.json", function(error,datao) {
        if (error) {  //If error is not null, something went wrong.
            console.log(error);  //Log the error.
        } else {
			//push duration for each data point to be converted into scale
            for (var i = 0; i < datao.length; i++) {
				if(year == datao[i].Year)
				{
					mineTemp.push(parseFloat(datao[i].Temperature));
					mineobj.push(datao[i]);
				}
			}
			
            //to control the length of the bars
            var mintemp = d3.min(mineTemp);
           
            var maxtemp = d3.max(mineTemp);
			
            
            var colorScale = d3.scaleQuantize()
                    .domain([mintemp,maxtemp])
                    .range(["#ffffcc","#ffeda0","#fed976","#feb24c","#fd8d3c","#fc4e2a","#e31a1c","#bd0026","#800026"]);


      var projection = d3.geoMercator();

	     
      var path = d3.geoPath()
					.projection(projection);
					
      var canvas = svg.append("g")
				.attr("id","remodel")
				.attr("width",width)
				.attr("height","80%")
				.attr("transform","translate("+width*0.2+","+height*0.35+")");
				
	    var group = canvas.append("g")
				   .attr("width", 300)
                   .attr("height", 300)
                   .attr("transform", "translate("+width*0.1+","+height*0.2+")");			
				
	var colorScale1 = d3.scaleQuantize()
                             .range(["#ffffcc","#ffeda0","#fed976","#feb24c","#fd8d3c","#fc4e2a","#e31a1c","#bd0026","#800026"]);
								 
                        var defs = group.append("defs");
                        var linearGradient = defs.append("linearGradient")
                                .attr("id", "linear-gradient");
                        linearGradient
                                .attr("x1", "0%")
                                .attr("y1", "0%")
                                .attr("x2", "100%")
                                .attr("y2", "0%");

                        group.append("rect")
                                .attr("x","-33%")
                                .attr("y","-50%")
                                .attr("width", 330)
                                .attr("height", 50)
                                .style("fill", "url(#linear-gradient)")
                                .attr("transform", "rotate(-90)");

                        linearGradient.selectAll("stop")
                                .data( colorScale1.range() )
                                .enter().append("stop")
                                .attr("offset", function(d,i) { return i/(colorScale1.range().length-1); })
                                .attr("stop-color", function(d) { return d; });

                        //adding text to legends
                        group.append('text')
                                .attr('x', "-49%")
                                .attr('y', "31.5%")
                                .text(mintemp.toFixed(2))
                                .style("font-size","13px")
                                .style("font-weight","bold")
                                .style("font-family", "Georgia");

                        group.append('text')
                                .attr('x', "-49%")
                                .attr('y', "-8%")
                                .text(maxtemp.toFixed(2))
                                .style("font-size","13px")
                                .style("font-weight","bold")
                                .style("font-family", "Georgia");

                        group.append('text')
                                .attr('x', "-49%")
                                .attr('y', "38%")
                                .text("°C")
                                .style("font-size","14px")
                                .style("font-weight","bold")
                                .style("font-family", "Georgia")
                                .style('fill', 'white');
				    
				
		d3.json("./data/world_countries.json", function(error,json) {
			if(error)
			{
				console.log(error);
			}
			else{
            //Merge the temperature data and country JSON
            //Loop through once for each temperature data value
			
            for (var i = 0; i < mineobj.length; i++) {
                //Grab state name
                var dataCountry = mineobj[i].Country;
				var year_datao = parseInt(mineobj[i].Year);
				if(year_datao == year){				
					//Grab data value, and convert from string to float
					var dataValue = parseFloat(mineobj[i].Temperature);
					//Find the corresponding country inside the country JSON
					for (var j = 0; j < json.features.length; j++) {
						
						var jsonCountry = json.features[j].properties.name;
						if (dataCountry == jsonCountry) {
                        //Copy the data value into the JSON
							json.features[j].properties.value = dataValue;
							json.features[j].properties.year = year_datao;
							break;
						}
						
					}
				}
			}
			
            //Bind data and create one path per GeoJSON feature
            canvas.selectAll("path")
              .data(json.features)
               .enter()
               .append("path")
			   .attr("class","path")
                    .attr("d", path)
                    .style("fill", function(d) {
                        //Get data value
                        var value = d.properties.value;
						if (value) {
                            //If value exists…
                            return colorScale(value);
                        } else {
                            //If value is undefined…
                            return "#ccc";
                        }
                    })
					
					.on("mouseover",function(d){
										d3.select(this.parentNode.appendChild(this)).transition().duration(300);
										funcmouseover(d)})
                    .on("mouseout", funcmouseout);
					
			 function funcmouseover(d)
            {
                var pageX = d3.event.pageX;
                var pageY = d3.event.pageY;
                div.transition()
                        .duration(200)
                        .style("opacity", .9);
                div.html("Year: "+ d.properties.year+"<br>Avg Temp: " +d.properties.value.toFixed(2)+"<br>Country: "+d.properties.name)
						.style("left", width*0.10)
                        .style("top", height*0.11);
						
            }

            function funcmouseout(d)
            {
                div.transition()
                        .duration(2)
                        .style("opacity", 0);
            }
		
			}});		
      
     
      }
	  });
	  
	  };
	  
 function renderenergy(year_val){
	 var mineobj = new Array();
     var mineTemp = new Array();		
	 d3.json("./data/energypercountryperyear.json", function(error,datao) {
        if (error) {  //If error is not null, something went wrong.
            console.log(error);  //Log the error.
        } else {
			
			//push duration for each data point to be converted into scale
            for (var i = 0; i < datao.length; i++) {
				if(year_val == datao[i].Year)
				{
					//console.log(datao[i].Energy);
					mineTemp.push(parseFloat(datao[i].Energy));
					mineobj.push(datao[i]);
				}
			}
			
            //to control the length of the bars
            var mintemp = d3.min(mineTemp);
			        
            var maxtemp = d3.max(mineTemp);
			           
            var colorScale = d3.scaleQuantize()
                    .domain([mintemp,maxtemp])
                    .range(["#ffffcc","#ffeda0","#fed976","#feb24c","#fd8d3c","#fc4e2a","#e31a1c","#bd0026","#800026"]);


      var projection = d3.geoMercator();

	     
      var path = d3.geoPath()
					.projection(projection);
					
      var canvas = svg.append("g")
				.attr("id","remodel")
				.attr("width",width)
				.attr("height","80%")
				.attr("transform","translate("+width*0.2+","+height*0.35+")");
				
	 var group = canvas.append("g")
				   .attr("width", 300)
                   .attr("height", 300)
                   .attr("class", "legendLinear")
                   .attr("transform", "translate("+width*0.1+","+height*0.2+")");			
				
	var colorScale1 = d3.scaleQuantize()
                             .range(["#ffffcc","#ffeda0","#fed976","#feb24c","#fd8d3c","#fc4e2a","#e31a1c","#bd0026","#800026"]);
								 
                        var defs = group.append("defs");
                        var linearGradient = defs.append("linearGradient")
                                .attr("id", "linear-gradient");
                        linearGradient
                                .attr("x1", "0%")
                                .attr("y1", "0%")
                                .attr("x2", "100%")
                                .attr("y2", "0%");

                        group.append("rect")
                                .attr("x","-33%")
                                .attr("y","-50%")
                                .attr("width", 330)
                                .attr("height", 60)
                                .style("fill", "url(#linear-gradient)")
                                .attr("transform", "rotate(-90)");

                        linearGradient.selectAll("stop")
                                .data( colorScale1.range() )
                                .enter().append("stop")
                                .attr("offset", function(d,i) { return i/(colorScale1.range().length-1); })
                                .attr("stop-color", function(d) { return d; });

                        //adding text to legends
                        group.append('text')
                                .attr('x', "-49%")
                                .attr('y', "31.5%")
                                .text(mintemp.toFixed(2))
                                .style("font-size","13px")
                                .style("font-weight","bold")
                                .style("font-family", "Georgia");

                        group.append('text')
                                .attr('x', "-49%")
                                .attr('y', "-8%")
                                .text(maxtemp.toFixed(2))
                                .style("font-size","13px")
                                .style("font-weight","bold")
                                .style("font-family", "Georgia");

                        group.append('text')
                                .attr('x', "-50%")
                                .attr('y', "38%")
                                .text("Kg Oil Equivalent per Capita")
                                .style("font-size","14px")
                                .style("font-weight","bold")
                                .style("font-family", "Georgia")
                                .style('fill', 'white');
				
				
		d3.json("./data/world_countries.json", function(error,json) {
			if(error)
			{
				console.log(error);
			}
			else{
            //Merge the temperature data and country JSON
            //Loop through once for each temperature data value
			
            for (var i = 0; i < mineobj.length; i++) {
                //Grab state name
                var dataCountry = mineobj[i].Country;
				
				var year_datao = parseInt(mineobj[i].Year);
				
				if(year_datao == year_val){				
					//Grab data value, and convert from string to float
					var dataValue = parseFloat(mineobj[i].Energy);
					console.log(dataCountry+" "+year_datao+" "+dataValue);
					//console.log(dataValue);
					//Find the corresponding country inside the country JSON
					for (var j = 0; j < json.features.length; j++) {
						
						var jsonCountry = json.features[j].properties.name;
						if (dataCountry == jsonCountry) {
                        //Copy the data value into the JSON
							json.features[j].properties.value = dataValue;
							json.features[j].properties.year = year_datao;
							break;
						}
						
					}
				}
			}
			
            //Bind data and create one path per GeoJSON feature
            canvas.selectAll("path")
              .data(json.features)
               .enter()
               .append("path")
			   .attr("class","path")
                    .attr("d", path)
                    .style("fill", function(d) {
                        //Get data value
                        var value = d.properties.value;
						if (value) {
                            //If value exists…
                            return colorScale(value);
                        } else {
                            //If value is undefined…
                            return "#ccc";
                        }
                    })
					
					.on("mouseover",function(d){
							d3.select(this.parentNode.appendChild(this)).transition().duration(300);
							funcmouseover(d)})
                    .on("mouseout", funcmouseout);
					
			 function funcmouseover(d)
            {
                var pageX = d3.event.pageX;
                var pageY = d3.event.pageY;
                div.transition()
                        .duration(200)
                        .style("opacity", .9);
                div.html("Year: "+ d.properties.year+"<br>Energy Consumption: " +parseFloat(d.properties.value)/*.toFixed(2)*/+"<br>Country: "+d.properties.name)
						.style("left", width*0.10)
                        .style("top", height*0.11);
						
            }

            function funcmouseout(d)
            {
                div.transition()
                        .duration(2)
                        .style("opacity", 0);
            }
		
			}});		
      
     
      }
	  });
	  
	  };
	  
	function rendercarbon(year_val){
	
	 var mineobj = new Array();
     var mineTemp = new Array();		
	 d3.json("./data/carboncumlativeByYearByCountry.json", function(error,datao) {
        if (error) {  //If error is not null, something went wrong.
            console.log(error);  //Log the error.
        } else {
			
			//push duration for each data point to be converted into scale
            for (var i = 0; i < datao.length; i++) {
				if(year_val == datao[i].Year)
				{
					mineTemp.push(parseFloat(datao[i].Carbon));
					mineobj.push(datao[i]);
				}
			}
				
            //to control the length of the bars
            var mintemp = d3.min(mineTemp);
			           
            var maxtemp = d3.max(mineTemp);
			            
            var radius = d3.scaleSqrt()
							.domain([mintemp,maxtemp ])
							.range([0, 30]);


      var projection = d3.geoMercator();

	     
      var path = d3.geoPath()
					.projection(projection);
					
      var canvas = svg.append("g")
				.attr("id","remodel")
				.attr("width",width)
				.attr("height","80%")
				.attr("transform","translate("+width*0.2+","+height*0.35+")");
				
	
            
				
		d3.json("./data/world_countries.json", function(error,json) {
			if(error)
			{
				console.log(error);
			}
			else{
            //Merge the temperature data and country JSON
            //Loop through once for each temperature data value
			for (var i = 0; i < mineobj.length; i++) {
                //Grab state name
                var dataCountry = mineobj[i].Country;
				var year_datao = parseInt(mineobj[i].Year);
				if(year_datao == year_val){				
					//Grab data value, and convert from string to float
					var dataValue = parseFloat(mineobj[i].Carbon);
					//Find the corresponding country inside the country JSON
					for (var j = 0; j < json.features.length; j++) {
						var jsonCountry = json.features[j].properties.name;
						if (dataCountry == jsonCountry) {
							//Copy the data value into the JSON
							json.features[j].properties.value = dataValue;
							json.features[j].properties.year = year_datao;
							break;
						}
						
					}
				}
			}
			
            //Bind data and create one path per country JSON feature
			
            canvas.selectAll("path")
					.data(json.features)
					.enter()
					.append("path")
					.attr("class","path")
					.attr("d", path)
					.attr("fill","#aad4dd");
					
            canvas.selectAll("path").each(function(d,i) {  var centroid = path.centroid(d);
                             if(d.properties.name== "USA"){
							 var x= centroid[0]+20;
							 var y = centroid[1]+40;
							 centroid =[x,y];
                             json.features[i].properties.centroid = centroid;
                            }
							else if(d.properties.name== "Norway"){
							 var x= centroid[0]+0;
							 var y = centroid[1]+50;
							 centroid =[x,y];
                             json.features[i].properties.centroid = centroid;
                            }
							else{
								json.features[i].properties.centroid = centroid;
							}
                            });			
					
			canvas.append("g")
					  .attr("id","circleadd")
					  .selectAll("circle")
					  .data(json.features
						 .sort(function(a, b) { return b.properties.value - a.properties.value; }))
					  .enter()
						.append("circle")
						.attr("class","carbon")
						.attr("cx", function (d) {
								return d.properties.centroid[0];
								})
                            .attr("cy", function (d) {
                              return d.properties.centroid[1];
                            })
                            .attr("r", function(d){
										if(d.properties.value){
											return radius(d.properties.value);}
										else{
											return 0;
										}	
										})
                            .attr("fill", "#e33434")
							.attr("fill-opacity",0.5)
							.on("mouseover",function(d){
										d3.select(this.parentNode.appendChild(this)).transition().duration(300);
										funcmouseover(d)})
							.on("mouseout", funcmouseout);
					
			 function funcmouseover(d)
            {
                var pageX = d3.event.pageX;
                var pageY = d3.event.pageY;
                div.transition()
                        .duration(200)
                        .style("opacity", .9);
                div.html("Year: "+ d.properties.year+"<br>Carbon Emissions: " +parseFloat(d.properties.value)/*.toFixed(2)*/+"<br>Country: "+d.properties.name)
						.style("left", width*0.10)
                        .style("top", height*0.11);
						
            }

            function funcmouseout(d)
            {
                div.transition()
                        .duration(2)
                        .style("opacity", 0);
            }
		
			}});		
      
     
      }
	  });
	  
	  };
	  //code for slider
	  var x = d3.scaleLinear()
				.domain([1965, 2012])
				.range([0, width*0.6])
				.clamp(true);
		
	var slider = svg.append("g")			//appended to svg
				.attr("class", "slider")
				.attr("transform", "translate(" + width*0.35 + "," + height*0.95 + ")");

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
					.on("start drag", function() { handle.attr("cx",x(Math.round(x.invert(d3.event.x))));
												   year = Math.round(x.invert(d3.event.x)); 	//= year on the slider
												   d3.select("svg").selectAll("#circleadd").remove();
												   rerender(year); }));			

	slider.insert("g", ".track-overlay")
		.attr("class", "ticks")
		.attr("transform", "translate(0," + 18 + ")")
		.selectAll("text")
		.data(x.ticks())
		.enter().append("text")
		.attr("x", x)
		.attr("text-anchor", "middle")
		.text(function(d) { return d; })
		.attr("fill","white");

	var handle = slider.insert("circle", ".track-overlay")
		.attr("class", "handle")
		.attr("r", 9);
	  
   
    
	

/* Capture user's selection*/
 
  function rerender(x){
		let selectedValue = $("#selectIndicator").find("option:selected").text();
		
		render(x,selectedValue);
	}
	
	$("#selectIndicator").change(function() {
		let selectedValue = $(this).find("option:selected").text();
		d3.select("svg").selectAll("#remodel").remove();
		render(year,selectedValue);
	});

});