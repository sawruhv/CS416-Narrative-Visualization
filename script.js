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

const stateFipsToPostal = {
    "01": "AL", "02": "AK", "04": "AZ", "05": "AR", "06": "CA",
    "08": "CO", "09": "CT", "10": "DE", "11": "DC", "12": "FL",
    "13": "GA", "15": "HI", "16": "ID", "17": "IL", "18": "IN",
    "19": "IA", "20": "KS", "21": "KY", "22": "LA", "23": "ME",
    "24": "MD", "25": "MA", "26": "MI", "27": "MN", "28": "MS",
    "29": "MO", "30": "MT", "31": "NE", "32": "NV", "33": "NH",
    "34": "NJ", "35": "NM", "36": "NY", "37": "NC", "38": "ND",
    "39": "OH", "40": "OK", "41": "OR", "42": "PA", "44": "RI",
    "45": "SC", "46": "SD", "47": "TN", "48": "TX", "49": "UT",
    "50": "VT", "51": "VA", "53": "WA", "54": "WV", "55": "WI",
    "56": "WY"
};

function createScene1() {
    d3.select("#scene1").html("");
    d3.csv("data/1976-2020-president.csv").then(data => {
        console.log("Data loaded for 2012:", data);
        const election2012 = data.filter(d => d.year === "2012");
        console.log("Filtered data for 2012:", election2012);
        createElectionMap("#scene1", election2012, "2012 Election Results");
    });
}

function createScene2() {
    d3.select("#scene2").html("");
    d3.csv("data/1976-2020-president.csv").then(data => {
        console.log("Data loaded for 2016:", data);
        const election2016 = data.filter(d => d.year === "2016");
        console.log("Filtered data for 2016:", election2016);
        createElectionMap("#scene2", election2016, "2016 Election Results");
    });
}

function createScene3() {
    d3.select("#scene3").html("");
    d3.csv("data/1976-2020-president.csv").then(data => {
        console.log("Data loaded for 2020:", data);
        const election2020 = data.filter(d => d.year === "2020");
        console.log("Filtered data for 2020:", election2020);
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
        console.log("US map data loaded:", us);
        svg.append("g")
            .selectAll("path")
            .data(topojson.feature(us, us.objects.states).features)
            .enter().append("path")
            .attr("d", path)
            .attr("fill", d => {
                const statePostal = stateFipsToPostal[d.id];
                const stateData = data.find(s => s.state_po === statePostal);
                console.log("State data for", statePostal, ":", stateData);
                if (!stateData) return "#ccc"; // Fallback color for states without data
                return stateData.party_detailed === "DEMOCRAT" ? "blue" : "red";
            });

        // TODO
        const annotations = [
            {
                note: {
                    label: "Example Annotation",
                    title: "Key State"
                },
                x: 100,
                y: 100,
                dy: -30,
                dx: 30
            }
        ];

        const makeAnnotations = d3.annotation()
            .annotations(annotations);

        svg.append("g")
            .call(makeAnnotations);
    });
}

// Initialize the first scene
updateScene();
