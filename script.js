function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

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

            const candidates = {
                REPUBLICAN: yearData.find(d => d.party_simplified == 'REPUBLICAN')?.candidate || "N/A",
                DEMOCRAT: yearData.find(d => d.party_simplified == 'DEMOCRAT')?.candidate || "N/A"
            };

            svg.selectAll(".state")
                .data(states)
                .join("path")
                .attr("class", "state")
                .attr("d", path)
                .attr("fill", d => {
                    const statePostal = stateIdToPostal[d.id];
                    const state = stateVotes.get(statePostal);

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
                    tooltip.html(`State: ${d.properties.name}<br>Electoral Votes: ${electoralVotes[statePostal]}<br>Republican: ${formatNumber(repVotes)}<br>Democrat: ${formatNumber(demVotes)}`)
                        .style("left", (event.pageX) + "px")
                        .style("top", (event.pageY - 28) + "px");
                })
                .on("mouseout", function() {
                    d3.select("#tooltip").transition().duration(500).style("opacity", 0);
                });

            const winner = demSummary.electoralVotes > repSummary.electoralVotes ? "DEMOCRAT" : "REPUBLICAN";
            
            d3.select("#dem-summary h2").text(`Democrat Summary${winner === "DEMOCRAT" ? " (Winner)" : ""}`);
            d3.select("#rep-summary h2").text(`Republican Summary${winner === "REPUBLICAN" ? " (Winner)" : ""}`);

            d3.select("#dem-candidate").text(candidates.DEMOCRAT);
            d3.select("#rep-candidate").text(candidates.REPUBLICAN);

            d3.select("#dem-votes").text(formatNumber(demSummary.totalVotes));
            d3.select("#dem-electoral").text(formatNumber(demSummary.electoralVotes));
            d3.select("#dem-flipped").text(demSummary.flippedStates.length > 0 ? demSummary.flippedStates.join(", ") : "None");

            d3.select("#rep-votes").text(formatNumber(repSummary.totalVotes));
            d3.select("#rep-electoral").text(formatNumber(repSummary.electoralVotes));
            d3.select("#rep-flipped").text(repSummary.flippedStates.length > 0 ? repSummary.flippedStates.join(", ") : "None");
        }
    }).catch(function(error) {
        console.error("Error loading election data:", error);
    });
}).catch(function(error) {
    console.error("Error loading TopoJSON data:", error);
});
