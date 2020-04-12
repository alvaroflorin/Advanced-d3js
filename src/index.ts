import * as d3 from "d3";
import * as topojson from "topojson-client";
const spainjson = require("./spain.json");
import { stats, statsUpdated, ResultEntry } from "./stats";
const d3Composite = require("d3-composite-projections");
import { latLongCommunities } from "./communities";

var colour = d3
  .scaleThreshold<number, string>()
  .domain([0,15,50,100,1000,5000,10000,40000])
  .range([
    "#eeeec3",
    "#e8cd7e",
    "#eda63f",
    "#ef9b30",
    "#f18e22",
    "#f48114",
    "#f67304",
    "#fb5000",
    "#ff0000"
  ]); 
const svg = d3
  .select("body")
  .append("svg")
  .attr("width", 1024)
  .attr("height", 800)
  .attr("style", "background-color: #FBFAF0");

const aProjection = d3Composite
  .geoConicConformalSpain()
  .scale(3300)
  .translate([500, 400]);

const geoPath = d3.geoPath().projection(aProjection);
const geojson = topojson.feature(spainjson, spainjson.objects.ESP_adm1);


document
.getElementById("current")
.addEventListener("click", function handleCurrent() {
  createSvg(statsUpdated);
});
document
.getElementById("initial")
.addEventListener("click", function handleInitial() {
  createSvg(stats);
});

const createSvg=(data:ResultEntry[])=>{
  
  const affectedRadiusScaleQuantile=d3
  .scaleLinear()
  .domain([0,15,50,100,1000,5000,10000,40000])
  .range([5,9,12,15,18,21,25,30,40])


  const calculateRadiusBasedOnAffectedCases = (comunidad: string) => {
    const entry = data.find(item => item.name === comunidad);
  
    return entry ? affectedRadiusScaleQuantile(entry.value) : 0;
  };

  const assignRegionBackgroundColor = (name: string) => {
    const item = data.find(
      item => item.name === name
    );
  
    if (item) {
      console.log(item.value);
    }
    return item ? colour(item.value) : colour(0);
  };

    svg
    .selectAll("path")
    .data(geojson["features"])
    .enter()
    .append("path")
    .attr("class", "community")
    .attr("fill",d=>assignRegionBackgroundColor(d["properties"]["NAME_1"]))
    .attr("d", geoPath as any)
    .merge(svg.selectAll("path") as any)
    .transition()
    .duration(500)
    .attr("fill",d=>assignRegionBackgroundColor(d["properties"]["NAME_1"]))
    ;

    const circles=svg
    .selectAll("circle");
    circles
    .data(latLongCommunities)
    .enter()
    .append("circle")
    .attr("class","affected-marker")
    .attr("r", d=>calculateRadiusBasedOnAffectedCases(d.name))
    .attr("cx",d=> aProjection([d.long,d.lat])[0])
    .attr("cy",d=> aProjection([d.long,d.lat])[1])
    .merge(circles as any)
    .transition()
    .duration(500)
    .attr("r", d=>calculateRadiusBasedOnAffectedCases(d.name))
    ;
};
createSvg(stats);
