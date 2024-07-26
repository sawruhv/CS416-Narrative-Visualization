const width = 960;
const height = 600;

const svg = d3.select("#map").append("svg")
    .attr("width", width)
    .attr("height", height);

const projection = d3.geoAlbersUsa()
    .scale(1300)
    .translate([width / 2, height / 2]);

const path = d3.geoPath().projection(projection);

d3.json("https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json").then(function(us) {
    console.log("TopoJSON data loaded:", us);

    d3.csv("/mnt/data/1976-2020-president.csv").then(function(data) {
        console.log("Election data loaded:", data);

        const states = topojson.feature(us, us.objects.states).features;
        console.log("States data:", states);

        const years = [...new Set(data.map(d => d.year))];
        console.log("Unique years:", years);
        
        const select = d3.select("#year-select");
        select.selectAll("option")
            .data(years)
            .enter()
            .append("option")
            .text(d => d)
            .attr("value", d => d);

        updateMap(years[0]);

        select.on("change", function() {
            const selectedYear = this.value;
            console.log("Year selected:", selectedYear);
            updateMap(selectedYear);
        });

        function updateMap(year) {
            const yearData = data.filter(d => d.year == year);
            console.log("Data for year", year, ":", yearData);

            const stateVotes = d3.rollup(yearData, 
                v => ({
                    REPUBLICAN: d3.sum(v.filter(d => d.party_simplified == 'REPUBLICAN'), d => d.candidatevotes),
                    DEMOCRAT: d3.sum(v.filter(d => d.party_simplified == 'DEMOCRAT'), d => d.candidatevotes)
                }),
                d => d.state_po
            );
            console.log("State votes for year", year, ":", stateVotes);

            svg.selectAll(".state")
                .data(states)
                .join("path")
                .attr("class", "state")
                .attr("d", path)
                .attr("fill", d => {
                    const state = stateVotes.get(d.id);
                    console.log("Processing state:", d.properties.name, "Abbreviation:", d.id, "Votes:", state);
                    if (!state) return "#ccc";
                    const repVotes = state.REPUBLICAN || 0;
                    const demVotes = state.DEMOCRAT || 0;
                    return repVotes > demVotes ? "red" : "blue";
                })
                .on("mouseover", function(event, d) {
                    const tooltip = d3.select("#tooltip");
                    const state = stateVotes.get(d.id);
                    if (!state) return;
                    const repVotes = state.REPUBLICAN || 0;
                    const demVotes = state.DEMOCRAT || 0;
                    tooltip.transition().duration(200).style("opacity", .9);
                    tooltip.html(`State: ${d.properties.name}<br>Republican: ${repVotes}<br>Democrat: ${demVotes}`)
                        .style("left", (event.pageX) + "px")
                        .style("top", (event.pageY - 28) + "px");
                })
                .on("mouseout", function() {
                    d3.select("#tooltip").transition().duration(500).style("opacity", 0);
                });
        }
    }).catch(function(error) {
        console.error("Error loading election data:", error);
    });
}).catch(function(error) {
    console.error("Error loading TopoJSON data:", error);
});
