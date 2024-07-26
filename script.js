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

const electoralVotes = {
    "AL": 9, "AK": 3, "AZ": 11, "AR": 6, "CA": 55, "CO": 9,
    "CT": 7, "DE": 3, "DC": 3, "FL": 29, "GA": 16, "HI": 4,
    "ID": 4, "IL": 20, "IN": 11, "IA": 6, "KS": 6, "KY": 8,
    "LA": 8, "ME": 4, "MD": 10, "MA": 11, "MI": 16, "MN": 10,
    "MS": 6, "MO": 10, "MT": 3, "NE": 5, "NV": 6, "NH": 4,
    "NJ": 14, "NM": 5, "NY": 29, "NC": 15, "ND": 3, "OH": 18,
    "OK": 7, "OR": 7, "PA": 20, "RI": 4, "SC": 9, "SD": 3,
    "TN": 11, "TX": 38, "UT": 6, "VT": 3, "VA": 13, "WA": 12,
    "WV": 5, "WI": 10, "WY": 3, "AS": 0, "GU": 0, "MP": 0,
    "PR": 0, "VI": 0
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

        // updateMap(years[0]);
        const initialYear = "2020";
        updateMap(initialYear);
        d3.select("#year-select").property("value", initialYear);

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

            const demSummary = { totalVotes: 0, electoralVotes: 0, flippedStates: [] };
            const repSummary = { totalVotes: 0, electoralVotes: 0, flippedStates: [] };

            const previousYear = (parseInt(year) - 4).toString();
            const previousYearData = data.filter(d => d.year == previousYear);
            const previousStateVotes = d3.rollup(previousYearData,
                v => ({
                    REPUBLICAN: d3.sum(v.filter(d => d.party_simplified == 'REPUBLICAN'), d => d.candidatevotes),
                    DEMOCRAT: d3.sum(v.filter(d => d.party_simplified == 'DEMOCRAT'), d => d.candidatevotes)
                }),
                d => d.state_po
            );

            svg.selectAll(".state")
                .data(states)
                .join("path")
                .attr("class", "state")
                .attr("d", path)
                .attr("fill", d => {
                    const statePostal = stateIdToPostal[d.id];
                    const state = stateVotes.get(statePostal);

                    // Determine flipped states
                    const previousState = previousStateVotes.get(statePostal);
                    if (previousState) {
                        const previousWinner = previousState.REPUBLICAN > previousState.DEMOCRAT ? "REPUBLICAN" : "DEMOCRAT";
                        const currentWinner = state.REPUBLICAN > state.DEMOCRAT ? "REPUBLICAN" : "DEMOCRAT";
                        if (previousWinner !== currentWinner) {
                            if (currentWinner === "DEMOCRAT") {
                                demSummary.flippedStates.push(d.properties.name);
                            } else {
                                repSummary.flippedStates.push(d.properties.name);
                            }
                        }
                    }

                    if (!state) return "#ccc";
                    const repVotes = state.REPUBLICAN || 0;
                    const demVotes = state.DEMOCRAT || 0;

                    demSummary.totalVotes += demVotes;
                    repSummary.totalVotes += repVotes;
                    if (repVotes > demVotes) {
                        repSummary.electoralVotes += electoralVotes[statePostal];
                    } else {
                        demSummary.electoralVotes += electoralVotes[statePostal];
                    }

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
                    tooltip.html(`State: ${d.properties.name}<br>Electoral Votes: ${electoralVotes[statePostal]}<br>Republican: ${repVotes}<br>Democrat: ${demVotes}`)
                        .style("left", (event.pageX) + "px")
                        .style("top", (event.pageY - 28) + "px");
                })
                .on("mouseout", function() {
                    d3.select("#tooltip").transition().duration(500).style("opacity", 0);
                });

            d3.select("#dem-votes").text(demSummary.totalVotes);
            d3.select("#dem-electoral").text(demSummary.electoralVotes);
            d3.select("#dem-flipped").text(demSummary.flippedStates.length > 0 ? demSummary.flippedStates.join(", ") : "None");

            d3.select("#rep-votes").text(repSummary.totalVotes);
            d3.select("#rep-electoral").text(repSummary.electoralVotes);
            d3.select("#rep-flipped").text(repSummary.flippedStates.length > 0 ? repSummary.flippedStates.join(", ") : "None");
        }
    }).catch(function(error) {
        console.error("Error loading election data:", error);
    });
}).catch(function(error) {
    console.error("Error loading TopoJSON data:", error);
});
