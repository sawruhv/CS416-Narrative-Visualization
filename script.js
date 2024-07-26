const stateIdToPostal = {
    "01": "AL", "02": "AK", "04": "AZ", "05": "AR", "06": "CA", "08": "CO",
    "09": "CT", "10": "DE", "11": "DC", "12": "FL", "13": "GA", "15": "HI",
    "16": "ID", "17": "IL", "18": "IN", "19": "IA", "20": "KS", "21": "KY",
    "22": "LA", "23": "ME", "24": "MD", "25": "MA", "26": "MI", "27": "MN",
    "28": "MS", "29": "MO", "30": "MT", "31": "NE", "32": "NV", "33": "NH",
    "34": "NJ", "35": "NM", "36": "NY", "37": "NC", "38": "ND", "39": "OH",
    "40": "OK", "41": "OR", "42": "PA", "44": "RI", "45": "SC", "46": "SD",
    "47": "TN", "48": "TX", "49": "UT", "50": "VT", "51": "VA", "53": "WA",
    "54": "WV", "55": "WI", "56": "WY", "60": "AS", "66": "GU", "69": "MP",
    "72": "PR", "78": "VI"
};

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

    d3.csv("data/1976-2020-president.csv").then(function(data) {
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
                    const statePostal = stateIdToPostal[d.id];
                    console.log("Processing state:", d.properties.name, "ID:", d.id, "Postal:", statePostal);
                    
                    const state = stateVotes.get(statePostal);
                    console.log("Votes for state:", state);
                    
                    if (!state) return "#ccc";
                    const repVotes = state.REPUBLICAN || 0;
                    const demVotes = state.DEMOCRAT || 0;
                    return repVotes > demVotes ? "red" : "blue";
                })
                .on("mouseover", function(event, d) {
                    const tooltip = d3.select("#tooltip");
                    const statePostal = stateIdToPostal[d.id];
                    const state = stateVotes.get(statePostal);
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
