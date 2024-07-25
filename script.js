let currentState = 0;

document.getElementById("nextButton").addEventListener("click", () => {
    currentState = (currentState + 1) % 3;
    updateScene();
});

function updateScene() {
    d3.selectAll(".scene").classed("active", false);
    d3.select("#scene" + (currentState + 1)).classed("active", true);

    if (currentState === 0) {
        createScene1();
    } else if (currentState === 1) {
        createScene2();
    } else if (currentState === 2) {
        createScene3();
    }
}

function createScene1() {
    d3.select("#scene1").html("");
    d3.csv("data/1976-2020-president.csv").then(data => {
        const election2012 = data.filter(d => d.year === "2012");
        createElectionMap("#scene1", election2012, "2012 Election Results");
    });
}

function createScene2() {
    d3.select("#scene2").html("");
    d3.csv("data/1976-2020-president.csv").then(data => {
        const election2016 = data.filter(d => d.year === "2016");
        createElectionMap("#scene2", election2016, "2016 Election Results");
    });
}

function createScene3() {
    d3.select("#scene3").html("");
    d3.csv("data/1976-2020-president.csv").then(data => {
        const election2020 = data.filter(d => d.year === "2020");
        createElectionMap("#scene3", election2020, "2020 Election Results");
    });
}

function createElectionMap(container, data, title) {
    const width = 800;
    const height = 500;

    const svg = d3.select(container).append("svg")
        .attr("width", width)
        .attr("height", height);

    svg.append("text")
        .attr("x", width / 2)
        .attr("y", 30)
        .attr("text-anchor", "middle")
        .style("font-size", "24px")
        .text(title);

    const projection = d3.geoAlbersUsa().scale(1000).translate([width / 2, height / 2]);
    const path = d3.geoPath().projection(projection);

    d3.json("https://d3js.org/us-10m.v1.json").then(us => {
        svg.append("g")
            .selectAll("path")
            .data(topojson.feature(us, us.objects.states).features)
            .enter().append("path")
            .attr("d", path)
            .attr("fill", d => {
                const stateData = data.find(s => s.state_po === d.id);
                if (!stateData) return "#ccc";
                return stateData.party_detailed === "DEMOCRAT" ? "blue" : "red";
            });


        // const annotations = [
        //     // TODO
        // ];

        // const makeAnnotations = d3.annotation()
        //     .annotations(annotations);

        svg.append("g")
            .call(makeAnnotations);
    });
}

updateScene();
