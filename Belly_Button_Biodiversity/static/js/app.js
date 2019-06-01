function buildMetadata(sample) {
    // @TODO: Complete the following function that builds the metadata panel

    d3.json(`/metadata/${sample}`).then((data) => {
        // Use d3 to select the panel with id of `#sample-metadata`
        let panel = d3.select('#sample-metadata');
        panel.html("");
        // Use `Object.entries` to add each key and value pair to the panel
        // Hint: Inside the loop, you will need to use d3 to append new
        // tags for each key-value in the metadata.
        Object.entries(data).forEach(([key, value]) => {
            let line = panel.append("p");
            line.text(`${key}: ${value}`);
        });
    });

    buildGauge(sample);
}

function buildCharts(sample) {
    // @TODO: Use `d3.json` to fetch the sample data for the plots
    // @TODO: Build a Bubble Chart using the sample data
    d3.json("/samples/" + sample).then((data) => {
        let bubbleData = [{
            x: data["otu_ids"],
            y: data["sample_values"],
            text: data["otu_labels"],
            type: "scatter",
            mode: "markers",
            marker: {
                color: data["otu_ids"],
                size: data["sample_values"],
            },
        }];

        let bubbleLayout = {
            title: `<b>Biodiversity of Sample ${sample}</b>`,
            xaxis: {
                title: "OTU ID",
            },
            yaxis: {
                title: "Value",
                range: [0, Math.max(data["sample_values"])]
            }
        };

        let bubble = document.getElementById("bubble");

        Plotly.newPlot(bubble, bubbleData, bubbleLayout);

        // @TODO: Build a Pie Chart
        // HINT: You will need to use slice() to grab the top 10 sample_values,
        // otu_ids, and labels (10 each).
        // Convert data object into array of objects
        let dataArray = [];

        for (let i = 0; i < data.otu_ids.length; i++) {
            dataArray.push({
                "sample_values": data.sample_values[i],
                "otu_ids": data.otu_ids[i],
                "otu_labels": data.otu_labels[i]
            });
        }

        // Sort array of objects by sample values
        let dataArraySorted = dataArray.sort((a, b) =>
            parseFloat(b.sample_values) - parseFloat(a.sample_values)
        );

        // Prepare data for plot
        let pieData = [{
            labels: dataArraySorted.map(d => d["otu_ids"]).slice(0, 10),
            values: dataArraySorted.map(d => d["sample_values"]).slice(0, 10),
            text: dataArraySorted.map(d => d["otu_labels"]).slice(0, 10),
            type: "pie",
            name: dataArraySorted.map(d => d["otu_ids"]).slice(0, 10),
            "textinfo": "percent",
        }];

        let pieLayout = {
            title: `<b>Top 10 OTU of Sample ${sample}</b>`,
        };

        let pieElement = document.getElementById("pie");

        Plotly.newPlot(pieElement, pieData, pieLayout);
    });
}

function init() {
    // Grab a reference to the dropdown select element
    let selector = d3.select("#selDataset");

    // Use the list of sample names to populate the select options
    d3.json("/names").then((sampleNames) => {
        sampleNames.forEach((sample) => {
            selector
                .append("option")
                .text(sample)
                .property("value", sample);
        });

        // Use the first sample from the list to build the initial plots
        const firstSample = sampleNames[0];
        buildCharts(firstSample);
        buildMetadata(firstSample);
    });
}

function optionChanged(newSample) {
    // Fetch new data each time a new sample is selected
    buildCharts(newSample);
    buildMetadata(newSample);
}

// Initialize the dashboard
init();

//Acknowledgements:  I hired a Wyzant Tutor to help me with this activity.
