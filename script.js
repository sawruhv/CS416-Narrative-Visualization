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

document.addEventListener("DOMContentLoaded", function() {
    drawUSMap();
});

function drawUSMap() {
    // const width = 975;
    // const height = 610;

    // const svg = d3.select("#map").append("svg")
    //     .attr("width", width)
    //     .attr("height", height);

    // const projection = d3.geoAlbersUsa()
    //     .scale(1300)
    //     .translate([487.5, 305]);

    // const path = d3.geoPath(projection);

    // d3.json("https://d3js.org/us-10m.v1.json").then(us => {
    //     svg.append("g")
    //         .selectAll("path")
    //         .data(topojson.feature(us, us.objects.states).features)
    //         .enter().append("path")
    //         .attr("d", path)
    //         .attr("fill", "none")
    //         .attr("stroke", "#000");

    //     svg.append("path")
    //         .datum(topojson.mesh(us, us.objects.states, (a, b) => a !== b))
    //         .attr("fill", "none")
    //         .attr("stroke", "#fff")
    //         .attr("stroke-linejoin", "round")
    //         .attr("d", path);
    // });
    const us = await d3.json('https://d3js.org/us-10m.v2.json');
    const data = topojson.feature(us, us.objects.states).features;

    const width = 960;
    const height = 600;
    const svg = d3.select('body')
      .append('svg')
      .attr('width', width)
      .attr('height', height);

    const path = d3.geoPath();

    svg.append('g')
      .selectAll('path')
      .data(data)
      .enter()
      .append('path')
      .attr('d', path);
  }
}

drawUSMap();
