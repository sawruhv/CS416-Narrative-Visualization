// let currentState = 0;

// document.getElementById("nextButton").addEventListener("click", () => {
//     currentState = (currentState + 1) % 1; 
//     updateScene();
// });

// function updateScene() {
//     d3.selectAll(".scene").classed("active", false);
//     d3.select("#scene1").classed("active", true);
//     createMapScene("#scene1");
// }

// function createMapScene(container) {
//     d3.select(container).html("");
//     d3.json("https://d3js.org/us-10m.v1.json").then(us => {
//         renderMap(container, us);
//     });
// }

// function renderMap(container, us) {
//     const width = 960;
//     const height = 600;

//     const svg = d3.select(container).append("svg")
//         .attr("width", width)
//         .attr("height", height);

//     const projection = d3.geoAlbersUsa()
//         .scale(1300)
//         .translate([width / 2, height / 2]);

//     const path = d3.geoPath().projection(projection);

//     svg.append("g")
//         .selectAll("path")
//         .data(topojson.feature(us, us.objects.states).features)
//         .enter().append("path")
//         .attr("d", path)
//         .attr("fill", "#ccc")
//         .attr("stroke", "#fff")
//         .attr("stroke-width", "1px");
// }

// updateScene();

const width = 960;
const height = 600;

const svg = d3.select("#map").append("svg")
    .attr("width", width)
    .attr("height", height);

const projection = d3.geoAlbersUsa()
    .scale(1000)
    .translate([width / 2, height / 2]);

const path = d3.geoPath().projection(projection);

d3.json("https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json").then(function(us) {
    const states = topojson.feature(us, us.objects.states).features;

    svg.selectAll(".state")
        .data(states)
        .enter().append("path")
        .attr("class", "state")
        .attr("d", path);
});
