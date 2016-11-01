$(document).ready(function(){
	
							
					/*Getting the contry names and removing the duplicate names*/
					var countries_duplicates = new Array();
					var uniqueVals= new Array();
					d3.json("./data/tempbycountry.json", function(datao) {
						for (var i=0;i<datao.length;i++) {
							countries_duplicates.push(datao[i].Country);
						}
						$.each(countries_duplicates, function(i, el){
							if($.inArray(el, uniqueVals) === -1) uniqueVals.push(el);
						});
					});

					/*Populating the dropdown with country name*/
					$(function() {
						var availableTags = uniqueVals;
						$( "#tags" ).autocomplete({
						source: availableTags
						});
					});
    
					$("#button1").click(function() {
						temperature_function($("#tags").val());
						energy_function($("#tags").val());
						carbon_function($("#tags").val());
						d3.select("#area1").select("svg").remove();
						d3.select("#area2").select("svg").remove();
						d3.select("#area3").select("svg").remove();
						$("#tohide").hide();
					});

				
                function temperature_function(param) {
                    var country_array = new Array();
                    var countryMatch = param;

                    d3.json("./data/tempbycountry.json", function(datao) {
                        for (var i=0;i<datao.length;i++){
							var country= datao[i].Country;
                            var index=i;
                            var temp_country;
                            var year_country;
                            var object_country;
                            if (country.localeCompare(countryMatch)==0){
                                temp_country = datao[index].Temperature;
                                year_country = datao[index].Year;
                                object_country={temp_object : temp_country,
                                    year_object :year_country,
                                    country_object : country};
                                country_array.push(object_country);
                            }
                        }

                        var only_temp = [];
                        for (var j=0;j<country_array.length;j++){
                            only_temp.push(country_array[j].temp_object);
                        }

                        Array.prototype.max=function () {
                            return Math.max.apply(null,this);
                        };

                        Array.prototype.min=function () {
                            return Math.min.apply(null,this);
                        };
                        var maxTemp=only_temp.max();
                        var minTemp=only_temp.min();
						//remove it from here move to outside
						
                        
                        var lengthScale = d3.scaleQuantize()
                                .domain([minTemp,maxTemp])
                                .range(["#fcbba1","#fc9272","#fb6a4a","#ef3b2c","#cb181d","#a50f15","#67000d"]);

                        var canvas = d3.select("#area1")
                                .append("svg")
                                .attr("width", 440)
                                .attr("height", 440)
                                .append("g")
                                .attr("transform", "translate(180,180)");

                        var group = canvas.append("g")
                                .attr("width", 300)
                                .attr("height", 300)
                                .attr("class", "legendLinear")
                                .attr("transform", "translate(80,20)");

                        //legends
                        var colorScale = d3.scaleQuantize()
                                .range(["#fcbba1","#fc9272","#fb6a4a","#ef3b2c","#cb181d","#a50f15","#67000d"]);
								
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
                                .attr("width", 300)
                                .attr("height", 35)
                                .style("fill", "url(#linear-gradient)")
                                .attr("transform", "rotate(-90)");

                        linearGradient.selectAll("stop")
                                .data( colorScale.range() )
                                .enter().append("stop")
                                .attr("offset", function(d,i) { return i/(colorScale.range().length-1); })
                                .attr("stop-color", function(d) { return d; });

                        //adding text to legends
                        group.append('text')
                                .attr('x', "-49%")
                                .attr('y', "31.5%")
                                .text(minTemp.toFixed(1))
                                .style("font-size","13px")
                                .style("font-weight","bold")
                                .style("font-family", "Georgia");

                        group.append('text')
                                .attr('x', "-49%")
                                .attr('y', "-32.5%")
                                .text(maxTemp.toFixed(1))
                                .style("font-size","13px")
                                .style("font-weight","bold")
                                .style("font-family", "Georgia");

                        group.append('text')
                                .attr('x', "-49%")
                                .attr('y', "38%")
                                .text(" °C")
                                .style("font-size","21px")
                                .style("font-weight","bold")
                                .style("font-family", "Georgia")
                                .style('fill', 'white');
						
						var radius = Math.min(350,350)/2;
                        var arc = d3.arc()
                                .innerRadius(function(d){return(radius -(calc_index(d)*30));})
                                .outerRadius(function(d){return (radius-(calc_index(d)-1)*30);})
                                .startAngle(function(d){return calc_startang(d);})
                                .endAngle(function(d){return (calc_startang(d)+(2*Math.PI/10));});
						
						function retColor(d) {
                            var objtemp = d.temp_object;
                            return lengthScale(objtemp);
						}
                        var path = group.selectAll("path")
                                .data(country_array)
                                .enter()
                                .append("path")
								.attr("class","path")
                                .attr("d", arc)
                                .style("fill",retColor)
                                .on("mouseover",function(d){
										d3.select(this.parentNode.appendChild(this)).transition().duration(300);
															funcmouseovertemp(d)})
                                .on("mouseout", funcmouseouttemp);

						var div = d3.select("body").append("div")
                                .attr("class", "tooltip")
                                .style("opacity", 0);

								
                        function funcmouseovertemp(d)
                        {
							 
                            var pageX = d3.event.pageX;
                            var pageY = d3.event.pageY;
                            div.transition()
                                    .duration(200)
                                    .style("opacity", .9)
                            div.html("Year: "+ getyear(d)+"<br>Avg Temp: " +gettemperature(d).toFixed(2))
                                    .style("left", (190) + "px")
                                    .style("top", (540) + "px");

                        }
                        function funcmouseouttemp(d)
                        {
                            div.transition()
                                    .duration(2)
                                    .style("opacity", 0);
                        }
                    });
                }
				
				function getyear(d) {
                            var obj1=d.year_object;
                            return obj1;
                }

                function gettemperature(d) {
                            var obj=d.temp_object;
                            return obj;
                }
				
				
						
				function calc_index(d) {
                            if(getyear(d) >= 1965 && getyear(d) <= 1974)
                            {
                                var year_val = getyear(d) - 1965;
                                sector_start= year_val*(2*Math.PI)/10;
                                return 5;
                            }
                            else if(getyear(d) >= 1975 && getyear(d) <= 1984)
                            {
                                var year_val = getyear(d) - 1975;
                                sector_start= year_val*(2*Math.PI)/10;
                                return 4;
                            }
                            else if(getyear(d) >= 1985 && getyear(d) <= 1994)
                            {
                                var year_val = getyear(d) - 1985;
                                sector_start= year_val*(2*Math.PI)/10;
                                return 3;
                            }
                            else if(getyear(d) >= 1995 && getyear(d) <= 2004)
                            {
                                var year_val = getyear(d) - 1995;
                                sector_start= year_val*(2*Math.PI)/10;
                                return 2;
                            }
                            else if(getyear(d) >= 2005 && getyear(d) <= 2014)
                            {
                                var year_val = getyear(d) - 2005;
                                sector_start= year_val*(2*Math.PI)/10;
                                return 1;
                            }
                    }
						
					function calc_startang(d)
                        {
                            var cir_index = calc_index(d);
                            function getyear(d) {
                                var obj1=d.year_object;
                                return obj1;
                            }
                            if(cir_index ==5)
                            {
                                var year_val = getyear(d)- 1965;
                                var start_ang = year_val*(2*Math.PI)/10;
                                return start_ang;
                            }
                            else if(cir_index ==4)
                            {
                                var year_val = getyear(d)- 1975;
                                var start_ang = year_val*(2*Math.PI)/10;
                                return start_ang;
                            }
                            else if(cir_index ==3)
                            {
                                var year_val = getyear(d) - 1985;
                                var start_ang = year_val*(2*Math.PI)/10;
                                return start_ang;
                            }
                            else if(cir_index ==2)
                            {
                                var year_val = getyear(d) - 1995;
                                var start_ang = year_val*(2*Math.PI)/10;
                                return start_ang;
                            }
                            else if(cir_index ==1)
                            {
                                var year_val = getyear(d) - 2005;
                                var start_ang = year_val*(2*Math.PI)/10;
                                return start_ang;
                            }
                    }
       
            function energy_function(param) {
                    var country_array = new Array(); //array initialization
                    var countryMatch = param;
                    d3.json("./data/energypercountryperyear.json", function (datao) {
                        for (var i = 0; i < datao.length; i++) {
                            var country = datao[i].Country;
                            var index = i;
                            var energy_country;
                            var year_country;
                            var object_country;
                            if (country.localeCompare(countryMatch) == 0) {
                                energy_country = datao[index].Energy;
                                year_country = datao[index].Year;
                                object_country = {
                                    energy_object: energy_country,
                                    year_object: year_country,
                                    country_object: country
                                };
                                country_array.push(object_country);
                            }
                        }

                        var only_energy = [];
                        for (var j = 0; j < country_array.length; j++) {
                            only_energy.push(country_array[j].energy_object);
                        }
                        Array.prototype.max = function () {
                            return Math.max.apply(null, this);
                        };

                        Array.prototype.min = function () {
                            return Math.min.apply(null, this);
                        };
                        var maxEnergy = only_energy.max();
                        var minEnergy = only_energy.min();

                        var lengthScale = d3.scaleQuantize()
                                .domain([minEnergy, maxEnergy])
                                .range(['#edf8e9', '#c7e9c0', '#a1d99b', '#74c476', '#41ab5d', '#238b45', '#005a32']);

                        
                        var canvas = d3.select("#area2")
                                .append("svg")
                                .attr("width", 440)
                                .attr("height", 440)
                                .append("g")
                                .attr("transform", "translate(180,180)");

                        var group = canvas.append("g")
                                .attr("width", 300)
                                .attr("height", 300)
                                .attr("class", "legendLinear")
                                .attr("transform", "translate(80,20)");

                        //legends
                        var colorScale = d3.scaleQuantize()
                                .range(['#edf8e9', '#c7e9c0', '#a1d99b', '#74c476', '#41ab5d', '#238b45', '#005a32']);
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
                                .attr("width", 300)
                                .attr("height", 35)
                                .style("fill", "url(#linear-gradient)")
                                .attr("transform", "rotate(-90)");

                        linearGradient.selectAll("stop")
                                .data( colorScale.range() )
                                .enter().append("stop")
                                .attr("offset", function(d,i) { return i/(colorScale.range().length-1); })
                                .attr("stop-color", function(d) { return d; });

                        //adding text to legends
                        group.append('text')
                                .attr('x', "-49%")
                                .attr('y', "31.5%")
                                .text(minEnergy.toFixed(0))
                                .style("font-size","13px")
                                .style("font-weight","bold")
                                .style("font-family", "Georgia");

                        group.append('text')
                                .attr('x', "-49%")
                                .attr('y', "-32.5%")
                                .text(maxEnergy.toFixed(0))
                                .style("font-size","13px")
                                .style("font-weight","bold")
                                .style("font-family", "Georgia");

                        group.append('text')
                                .attr('x', "-49%")
                                .attr('y', "38%")
                                .text(" Kg oil")
                                .style("font-size","21px")
                                .style("font-weight","bold")
                                .style("font-family", "Georgia")
                                .style('fill', 'white');


                        var radius = Math.min(350,350)/2;
                        var arc = d3.arc()
                                .innerRadius(function(d){return(radius -(calc_index(d)*30));})
                                .outerRadius(function(d){return (radius-(calc_index(d)-1)*30);})
                                .startAngle(function(d){return calc_startang(d);})
                                .endAngle(function(d){return (calc_startang(d)+(2*Math.PI/10));});
						
						function retColor(d) {
                            var objenergy = d.energy_object;
                            return lengthScale(objenergy);
                        }
						
                        var path = group.selectAll("path")
                                .data(country_array)
                                .enter()
                                .append("path")
								.attr("class","path")
                                .attr("d", arc)
                                .style("fill",retColor)
                                .on("mouseover",function(d){
										d3.select(this.parentNode.appendChild(this)).transition().duration(300);
										funcmouseoverener(d)})
                                .on("mouseout", funcmouseoutener);            
								
						var div = d3.select("body").append("div")
                                .attr("class", "tooltip")
                                .style("opacity", 0);

                        function funcmouseoverener(d) {
                            var pageX = d3.event.pageX;
                            var pageY = d3.event.pageY;
                            div.transition()
                                    .duration(200)
                                    .style("opacity", .9);
                            div.html("Year: " + getyear(d) + "<br>Avg Energy: " + getenergy(d).toFixed(2))
                                    .style("left", (670) + "px")
                                    .style("top", (540) + "px");
                        }

                        function funcmouseoutener(d) {
                            div.transition()
                                    .duration(2)
                                    .style("opacity", 0);
                        }
                    });

                }

            function carbon_function(param) {
                    var country_array = new Array(); //array initialization
                    var countryMatch = param;

                    d3.json("./data/carboncumlativeByYearByCountry.json", function (error, datao) {

                        for (var i = 0; i < datao.length; i++) {
                            var country = datao[i].Country;
                            var index = i;
                            var carbon_country;
                            var year_country;
                            var object_country;
                            if (country.localeCompare(countryMatch) == 0) {
                                carbon_country = datao[index].Carbon;
                                year_country = datao[index].Year;
                                object_country = {
                                    carbon_object: carbon_country,
                                    year_object: year_country,
                                    country_object: country
                                };
                                country_array.push(object_country);
                            }
                        }

                        var only_carbon = [];
                        for (var j = 0; j < country_array.length; j++) {
                            only_carbon.push(country_array[j].carbon_object);
                        }

                        Array.prototype.max = function () {
                            return Math.max.apply(null, this);
                        };

                        Array.prototype.min = function () {
                            return Math.min.apply(null, this);
                        };
                        var maxCarbon = only_carbon.max();
                        var minCarbon = only_carbon.min();

                        var lengthScale = d3.scaleQuantize()
                                .domain([minCarbon, maxCarbon])
                                .range(['#eff3ff', '#c6dbef', '#9ecae1', '#6baed6', '#4292c6', '#2171b5', '#084594']);

                        
                        var canvas = d3.select("#area3")
                                .append("svg")
                                .attr("width", 440)
                                .attr("height", 440)
                                .append("g")
                                .attr("transform", "translate(180,180)");

                        var group = canvas.append("g")
                                .attr("width", 300)
                                .attr("height", 300)
                                .attr("class", "legendLinear")
                                .attr("transform", "translate(80,20)");

                        //legends
                        var colorScale = d3.scaleQuantize()
                                .range(['#eff3ff', '#c6dbef', '#9ecae1', '#6baed6', '#4292c6', '#2171b5', '#084594']);
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
                                .attr("width", 300)
                                .attr("height", 35)
                                .style("fill", "url(#linear-gradient)")
                                .attr("transform", "rotate(-90)");

                        linearGradient.selectAll("stop")
                                .data( colorScale.range() )
                                .enter().append("stop")
                                .attr("offset", function(d,i) { return i/(colorScale.range().length-1); })
                                .attr("stop-color", function(d) { return d; });

                        //adding text to legends
                        group.append('text')
                                .attr('x', "-49%")
                                .attr('y', "31.5%")
                                .text(minCarbon.toFixed(2))
                                .style("font-size","13px")
                                .style("font-weight","bold")
                                .style("font-family", "Georgia");

                        group.append('text')
                                .attr('x', "-49%")
                                .attr('y', "-32.5%")
                                .text(maxCarbon.toFixed(2))
                                .style("font-size","13px")
                                .style("font-weight","bold")
                                .style("font-family", "Georgia");

                        group.append('text')
                                .attr('x', "-50%")
                                .attr('y', "38%")
                                .text("Metric tons")
                                .style("font-size","21px")
                                .style("font-weight","bold")
                                .style("font-family", "Georgia")
                                .style('fill', 'white');

                        var radius = Math.min(350,350)/2;
                        var arc = d3.arc()
                                .innerRadius(function(d){return(radius -(calc_index(d)*30));})
                                .outerRadius(function(d){return (radius-(calc_index(d)-1)*30);})
                                .startAngle(function(d){return calc_startang(d);})
                                .endAngle(function(d){return (calc_startang(d)+(2*Math.PI/10));});

                        
                        function retColor(d) {
                            var objcarbon = d.carbon_object;
                            return lengthScale(objcarbon);
                        }

                        var path = group.selectAll("path")
                                .data(country_array)
                                .enter()
                                .append("path")
								.attr("class","path")
                                .attr("d", arc)
                                .style("fill",retColor)
                                .on("mouseover",function(d){
										d3.select(this.parentNode.appendChild(this)).transition().duration(300);
										funcmouseovercarbon(d)})
                                .on("mouseout", funcmouseoutcarbon);

                        var div = d3.select("body").append("div")
                                .attr("class", "tooltip")
                                .style("opacity", 0);

                        function funcmouseovercarbon(d) {
                            var pageX = d3.event.pageX;
                            var pageY = d3.event.pageY;
                            div.transition()
                                    .duration(200)
                                    .style("opacity", .9);
                            div.html("Year: " + getyear(d) + "<br>Carbon Emissions: " + getcarbon(d).toFixed(2))
                                    .style("left", (1130) + "px")
                                    .style("top", (540) + "px");

                        }
                        function funcmouseoutcarbon(d) {
                            div.transition()
                                    .duration(2)
                                    .style("opacity", 0);
                        }
                    });

                }
				function getcarbon(d) {
                            var obj = d.carbon_object;
                            return obj;
                        }
				function getenergy(d) {
                            var obj = d.energy_object;
                            return obj;
                        }
});						
