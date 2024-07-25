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

document.getElementById("nextButton").addEventListener("click", () => {
    createMapScene("#scene1");
});

function createMapScene(container) {
    d3.select(container).html("");
    d3.json("https://d3js.org/us-10m.v1.json").then(us => {
        console.log("US TopoJSON data:", us); 
        renderMap(container, us);
    });
}

function renderMap(container, us) {
    const width = 960;
    const height = 600;

    const svg = d3.select(container).append("svg")
        .attr("width", width)
        .attr("height", height);

    const projection = d3.geoAlbersUsa()
        .scale(1000)
        .translate([width / 2, height / 2]);

    const path = d3.geoPath().projection(projection);

    const states = topojson.feature(us, us.objects.states).features;
    console.log("States data:", states); 

    svg.append("g")
        .selectAll("path")
        .data(states)
        .enter().append("path")
        .attr("d", path)
        .attr("fill", "#ccc")
        .attr("stroke", "#fff")
        .attr("stroke-width", "1px");

    svg.append("path")
        .datum(topojson.mesh(us, us.objects.states, (a, b) => a !== b))
        .attr("class", "state-borders")
        .attr("d", path)
        .attr("fill", "none")
        .attr("stroke", "#fff")
        .attr("stroke-width", "1.5px");

    console.log("Rendered US map with paths and borders");
}
createMapScene("#scene1");
