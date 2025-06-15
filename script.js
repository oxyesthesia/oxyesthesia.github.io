// DECO3100: Information Visualisation Design Studio
// Author: Jack Avery (jave9100)

const unpack = (data, key) => data.map(row => row[key]);

// These are the internal names of my two graphs - the line graph is called 'roomValues' as it originally printed
// multiple rooms data instead of them all averaged into the one data value. When the second graph was introduced, 
// its purpose was to emphasise how often the plants were healthy (or not), hence the percentHappy title.
const roomValues = document.getElementById("masterGraph");
const percentHappy = document.getElementById("percentGraph");

// Here we set the global variables for which metric and which flower is selected, so that the relayouts know 
// which shapes to draw.
let currentMetric = 'Temperature';
let currentFlower = 'Anthurium';

// The dataset being references is an average of about 15 different rooms for each of the 4 values. These are 
// averaged by the date and span one calendar year.
d3.csv("CompleteDataset.csv").then(measurementData => {
    const date = unpack(measurementData, 'Date');
    const tempAve = unpack(measurementData, 'ATemp');
    const humidityAve = unpack(measurementData, 'AHumid');
    const luxAve = unpack(measurementData, 'ALux');
    const CO2Ave = unpack(measurementData, 'ACO2');

    // This data is sourced from (Plants Database - Garden.org, 2019), which is the averaged out requirements for
    // each plant.
    const flowerData = [
        ['Anthurium', 27, 70, 5000, 700],
        ['Azalea', 20, 50, 15000, 700],
        ['Carnation', 18, 50, 60000, 900],
        ['Chrysanthemum', 18, 60, 55000, 1100],
        ['Daisy', 20, 50, 10000, 1500],
        ['Inchplant', 24, 60, 1100, 1100],
        ['Lavender', 22, 30, 25000, 500],
        ['Lily', 24, 50, 6000, 800],
        ['Marigold', 21, 50, 15000, 500],
        ['Orchid', 18, 55, 1250, 400],
        ['Poppy', 18, 50, 1200, 450],
        ['Rose', 21, 55, 25000, 800],
        ['Snake Plant', 20, 50, 250, 400],
        ['Sunflower', 23.5, 50, 100000, 1000],
        ['Swiss Cheese Plant', 29, 70, 4000, 1500],
        ['Tulip', 15, 50, 1500, 700],
    ];

    // This function figures out which values from the flowerData to plug into the shape drawings, dependant on 
    // what the global variables are.
    const getFlowerThreshold = (flowerName, metric) => {
        const flower = flowerData.find(f => f[0] === flowerName);
        const metricIndexMap = {
            'Temperature': 1,
            'Humidity': 2,
            'Light': 3,
            'CO₂': 4
        };
        return flower ? flower[metricIndexMap[metric]] : null;
    };

    // The two createFilled*Trace functions were made with the assistance of ChatGPT, as I wasn't fully across how
    // to draw shapes on top of the Plotly graph itself. I particularly struggled to match the shapes with the
    // mutable lines themselves - and this feature is the main reason why my webpage does not have any animations.
    // The idea to create a clampedY value and map it to the existing data points was of ChatGPT origin.

    // This function draws the shaded green sections on the graph, indicating where values exceed the threshold.
    const createFilledAboveTrace = (x, y, threshold, fillColor) => {
        // this constant reads whether the datapoint is above the threshold line, and if so excludes it.
        const clampedY = y.map(v => Math.max(v, threshold));  
        return {
            x: [...x, ...x.slice().reverse()],
            y: [...clampedY, ...Array(x.length).fill(threshold)],
            fill: 'toself',
            fillcolor: fillColor,
            type: 'scatter',
            mode: 'none',
            showlegend: false,
            hoverinfo: 'skip',
            visible: false
        };
    };

    // Same as above, but for the red sections indicating where values do not exceed the threshold.
    const createFilledBelowTrace = (x, y, threshold, fillColor) => {
        // Same as above, but for below the threshold line.
        const clampedY = y.map(v => Math.min(v, threshold));  
        return {
            x: [...x, ...x.slice().reverse()],
            y: [...clampedY, ...Array(x.length).fill(threshold)],
            fill: 'toself',
            fillcolor: fillColor,
            type: 'scatter',
            mode: 'none',
            showlegend: false,
            hoverinfo: 'skip',
            visible: false
        };
    };

    // These are the constants that call the above functions and paints the sections fo the graph the desired colour, 
    // with each constant only called if their currentMetric is active.
    const filledAboveTemp = createFilledAboveTrace(date, tempAve, getFlowerThreshold(currentFlower, 'Temperature'), 'rgba(103, 230, 103, 0.4)');
    filledAboveTemp.visible = true // Temperature is the default metric selected upon page load, and is therefore visible by default.
    const filledAboveHumidity = createFilledAboveTrace(date, humidityAve, getFlowerThreshold(currentFlower, 'Humidity'), 'rgba(103, 230, 103, 0.4)');
    const filledAboveLux = createFilledAboveTrace(date, luxAve, getFlowerThreshold(currentFlower, 'Light'), 'rgba(103, 230, 103, 0.4)');
    const filledAboveCO2 = createFilledAboveTrace(date, CO2Ave, getFlowerThreshold(currentFlower, 'CO₂'), 'rgba(103, 230, 103, 0.4)');

    const filledBelowTemp = createFilledBelowTrace(date, tempAve, getFlowerThreshold(currentFlower, 'Temperature'), 'rgba(230, 103, 103, 0.53)')
    filledBelowTemp.visible = true // Same as above.
    const filledBelowHumidity = createFilledBelowTrace(date, humidityAve, getFlowerThreshold(currentFlower, 'Humidity'), 'rgba(230, 103, 103, 0.53)')
    const filledBelowLux = createFilledBelowTrace(date, luxAve, getFlowerThreshold(currentFlower, 'Light'), 'rgba(230, 103, 103, 0.53)')
    const filledBelowCO2 = createFilledBelowTrace(date, CO2Ave, getFlowerThreshold(currentFlower, 'CO₂'), 'rgba(230, 103, 103, 0.53)')

    // Here is where our actual data is being drawn on the line graph, as well as hover label handling.
    const averageTemp = {
        x: date,
        y: tempAve,
        name: "Florist Showroom Average Temperature (°C)",
        mode: "lines",
        line: { color: 'rgb(129, 129, 129)' },
        visible: true,
        hovertemplate: "Florist Showroom Temperature: %{y:.1f}°C<extra></extra>",
        hoverlabel: {
            font: {
                color: 'rgb(255, 255, 255)'
            }
        }
    };
    const averageHumidity = {
        x: date,
        y: humidityAve,
        name: "Florist Showroom Average Humidity (%)",
        mode: "lines",
        line: { color: 'rgb(129, 129, 129)' },
        visible: false,
        hovertemplate: "Florist Showroom Humidity: %{y:.0f}%<extra></extra>",
        hoverlabel: {
            font: {
                color: 'rgb(255, 255, 255)'
            }
        }
    };
    const averageLux = {
        x: date,
        y: luxAve,
        name: "Florist Showroom Average Light Level (lux)",
        mode: "lines",
        line: { color: 'rgb(129, 129, 129)' },
        visible: false,
        hovertemplate: "Florist Showroom Light Level: %{y:.0f} lux<extra></extra>",
        hoverlabel: {
            font: {
                color: 'rgb(255, 255, 255)'
            }
        }
    };
    const averageCO2 = {
        x: date,
        y: CO2Ave,
        name: "Florist Showroom Average CO₂ (ppm)",
        mode: "lines",
        line: { color: 'rgb(129, 129, 129)' },
        visible: false,
        hovertemplate: "Florist Showroom CO₂: %{y:.0f} ppm<extra></extra>",
        hoverlabel: {
            font: {
                color: 'rgb(255, 255, 255)'
            }
        }
    };

    // This constant reasserts what the current specified flower and metric selected is, and updates the graph as necessary.
    const initialThreshold = getFlowerThreshold(currentFlower, currentMetric);
    // This constant draws the threshold line, which is pulling data from the array flowerData in the Plotly_buttonclicked 
    // event handler.
    const thresholdLineLegend = {
        x: [null],  // No actual line data needed, as we are already drawing the line dynamically each time from the event handler.
        y: [null],
        mode: 'lines',
        name: `${currentFlower} Average Required Temperature (°C): `,
        line: {
            color: 'rgb(37, 53, 198)',
            width: 3,
            dash: 'dashdot'
        },
        showlegend: true
    };
    // This constant specifies the hover label data, which shows the value the threshold line is set at.
    const thresholdHoverLine = {
        x: date,
        y: Array(date.length).fill(initialThreshold),
        mode: 'lines',
        line: {
            color: 'rgba(37, 53, 198, 0)', // Invisible by default.
            width: 10 // Specifying a large invisible hover area to make it easier for the user/cursor to hit.
        },
        hoverinfo: 'text',
        hoverlabel: {
            bgcolor: 'rgb(37, 53, 198)'
        },
        text: Array(date.length).fill(`${currentFlower} Average: ${initialThreshold}°C`),
        name: '',
        showlegend: false,
        visible: true // Keep visible while hovering over.
    };

    // In the averageData array initialised directly after, we are specifying the consistent array notation for these
    // two values, as we'll always need to print the threshold line and therefore can keep their location in the
    // array stored.
    const thresholdLineLegendIndex = 12;
    const thresholdHoverLineIndex = 13;

    // Compiling all of the aforementioned constants into the one array for ease of information handling. When the 
    // graph is printed, it'll only read the array values that are required, being: the filledBelow*, filledAbove*
    // and average* of the currentMetric, and both threshold* values (which are always printed and their values are
    // stored as mentioned directly above).
    const averageData = [
        filledBelowTemp, filledAboveTemp, averageTemp,
        filledBelowHumidity, filledAboveHumidity, averageHumidity,
        filledBelowLux, filledAboveLux, averageLux,
        filledBelowCO2, filledAboveCO2, averageCO2,
        thresholdLineLegend,
        thresholdHoverLine
    ];

    // This section sets up the Plotly-controlled interaction elements, being the four metric buttons and the flower
    // dropdown. As these are controlled by Plotly and Plotly offers no compatibility for HTML/CSS/JS DOM methods, their
    // aesthetics and functionality that I can control are somewhat limited. As a result, the scrolling of the dropdown
    // menu and the text formatting of the buttons/dropdown are not as pretty as desired, but they do the job.
    const updateMenus = [
        {
            buttons: [
                {
                    label: "Temperature",
                    method: "restyle",
                    args: [{}], // The args will be filled based on the Plotly_buttonclicked event handler.
                    execute: true
                },
                {
                    label: "Humidity",
                    method: "restyle",
                    args: [{}],
                    execute: true
                },
                {
                    label: "Light",
                    method: "restyle",
                    args: [{}],
                    execute: true
                },
                {
                    label: "CO₂",
                    method: "restyle",
                    args: [{}],
                    execute: true
                }
            ],
            direction: 'down',
            showactive: true,
            font: {
                family: 'Inter, sans-serif',
                size: 18,
                color: 'black'
            },
            type: 'buttons',
            x: -0.25,
            xanchor: 'center',
            y: 1,
            yanchor: 'middle',
            pad: { r: 10, t: 10 },
            bgcolor: 'rgb(185, 212, 172)'
        },
        {
            // Now for the dropdown (P.S., if you're struggling to navigate the dropdown menu and keep scrolling the
            // page instead, just click and drag the dropdown, akin to touch controls).
            buttons: flowerData.map(flower => ({
                label: flower[0],
                method: "restyle",
                args: [{}], // Like above, args will default to the Plotly_buttonclick event.
                execute: true
            })),
            direction: 'down',
            showactive: true,
            font: {
                family: 'Inter, sans-serif',
                size: 18,
                color: 'black'
            },
            type: 'dropdown',
            x: -0.25,
            xanchor: 'center',
            y: 0.6,
            yanchor: 'middle',
            pad: { r: 10, t: 10 },
            bgcolor: 'rgb(185, 212, 172)'
        }
    ];

    // Specifying graph titles and layout, which wouldn't be picked up by the CSS file as the Plotly graph generation is
    // handled outside of the scope of CSS.
    const layout = {
        paper_bgcolor: "#eafae5",
        plot_bgcolor: "#eafae5",
        font: {
            family: 'Inter, sans-serif',
        },
        showlegend: true,
        legend: {
            "orientation": 'h',
            y: 1.15
        },
        title: {
            text: "<b>Yearly Average of Florist Showroom Temperature (°C)</b>",
            font: {
                family: "omnes-pro, sans-serif",
            },
        },
        xaxis: { 
            title: { text: 'Average per Day' },
            tickvals: [60, 152, 244, 335],
            ticktext: ['Mar-1', 'Jun-1', 'Sep-1', 'Dec-1']
        },
        yaxis: { title: { text: 'Temperature (°C)' } },
        // This shape is drawing the threshold line.
        shapes: [{
            type: 'line',
            x0: date[0],
            y0: initialThreshold,
            x1: date[date.length - 1],
            y1: initialThreshold,
            line: {
                color: 'rgb(37, 53, 198)',
                width: 3,
                dash: 'dashdot'
            }
        }],
    };

    // Finally drawing the line graph!
    Plotly.newPlot(roomValues, averageData, layout)

    // Plotly allows users to hide certain elements of the graph by clicking on the respective legend element.
    // I don't like that, so I disabled it here (method found on the Plotly library website).
    roomValues.on('plotly_legendclick', function() { return false; }) 

    // Here's where the initialising for the donut graph starts. I'm finding the number of times the data is 
    // above and below the threshold line, and then turning that into a percentage. The first two are creating
    // mathematical values that will draw the donut graph itself.
    const initialAbove = tempAve.filter(v => v > initialThreshold).length;
    const initialBelow = tempAve.length - initialAbove;
    // This constant in particular is stored as a string and is used to print the percentage in the center of
    // the donut graph.
    const initialPercentBelow = ((initialAbove / tempAve.length) * 100).toFixed(1) + '%';

    // Initialising the composition of the donut graph. You will also notice that the updateMenus tag is in this
    // graph, and not the line graph. This wasn't originally the case - as I was initially only going to have one
    // graph, these buttons were located just above the line graph. Introducing the donut graph and having to 
    // make a new page composition for where the graphs would sit, I found the horizontal space next to the donut
    // graph made more sense in storing the buttons. Therefore, I simply kept the button logic where it was in
    // this .js document and just called it down here.
    const pieLayout = {
        title: {
            text: `Percentage of Satisfactory <br>${currentMetric} Level for ${currentFlower}:`,
            x: 0.6,
            xanchor: 'center'
        },
        paper_bgcolor: "rgba(239, 255, 231, 0)",
        showlegend: false,
        margin: {
            t: 80,
            b: 20,
        },
        font: {
            color: '#D6FEA1',
            family: "omnes-pro, sans-serif",
            size: 16,
        },
        annotations: [
            {
              font: {
                size: 40,
                color: '#D6FEA1',
                family: "omnes-pro, sans-serif",
              },
              showarrow: false,
              text: `<b>${initialPercentBelow}</b>`,
              x: 0.5,
              y: 0.5
            }
        ],
        updatemenus: updateMenus
    };

    // Initializing percentGraph, and just saving space by making the data specification within the graph
    // calling. All of the data was already stored in constnats above, and it just felt easier.
    Plotly.newPlot(percentHappy, [{
        values: [initialAbove, initialBelow],
        type: 'pie',
        marker: {
            colors: ['rgba(80, 218, 45, 0.8)', 'rgba(229, 31, 31, 0.8)']
        },
        hole: 0.7,
        hoverinfo: 'none',
        textinfo: 'none',
    }], pieLayout);

    // Here is where my event handler lives. It's an internal event handler that Plotly has, and it was recommended
    // to me to use by ChatGPT. As I needed to redraw things on my graph over and over again, the suggestion to keep
    // all of the changes in a designated section and only call them once a button click was registered ended up
    // being really helpful in remembering what code handled what, especially when commented/labelled correctly.
    percentHappy.on('plotly_buttonclicked', function(eventData) {

        // This scoped constant sets up how I'm able to read what the user has selected with their button choices.
        const label = eventData.button.label;

        // This is a cheat way of setting up a dictionary (haha). Basically, if the button clicked matches a value
        // in this array, it has to be one of the metric values. Therefore, it resets the global variable of
        // currentMetric to the selected button label value. Otherwise, it has to be a flower that was selected from
        // the dropdown menu, and changes the currentFlower global variable instead. Two dictionaries for the price
        // of one!
        const metricOptions = ['Temperature', 'Humidity', 'Light', 'CO₂'];
        if (metricOptions.includes(label)) {
            currentMetric = label;
        } else {
            currentFlower = label;

            // This just changes the image to the currentFlower.
            const flowerImage = document.getElementById("flowerImage");
            flowerImage.src = `${currentFlower}.jpg`;
            flowerImage.alt = currentFlower;
        }

        // Now that we have a new flower/metric, the threshold line values need to be updated.
        const newThreshold = getFlowerThreshold(currentFlower, currentMetric);

        // This changes the y-axis text. I end up using this for more than the y-axis, but this was initialised
        // for the purpose of y-axis changing so I kept the name the same. (And I'm using an actual dictionary
        // this time...)
        const yAxisTitleMap = {
            'Temperature': 'Temperature (°C)',
            'Humidity': 'Humidity (%)',
            'Light': 'Light Level (lux)',
            'CO₂': 'CO₂ Concentration (ppm)'
        };
        const newYAxisTitle = yAxisTitleMap[currentMetric];

        // A copy-paste of the former, but without the prefixes so that they can be appended to the hovered 
        // labels on the threshold line.
        const HoverTitleMap = {
            'Temperature': '°C',
            'Humidity': '%',
            'Light': ' lux',
            'CO₂': ' ppm'
        };
        const newHoverTitle = HoverTitleMap[currentMetric];

        // Now we figure out which data arrays and traces to update the graph with. I'm initialising some
        // empty variables and then filling them with whatever the currentMetric specifies, which is both
        // the direct data from the .csv of that corresponding metric and the starting array value (which will 
        // make sense when I explain it further below).
        let fullData;
        let fillTraceIndex;
        switch (currentMetric) {
            case 'Temperature':
                fullData = tempAve;
                fillTraceIndex = 0;
                break;
            case 'Humidity':
                fullData = humidityAve;
                fillTraceIndex = 3;
                break;
            case 'Light':
                fullData = luxAve;
                fillTraceIndex = 6;
                break;
            case 'CO₂':
                fullData = CO2Ave;
                fillTraceIndex = 9;
                break;
        }

        // Remember that long averageData array I was storing all of the data in earlier? Electric Boogaloo! Here 
        // I'm controlling what elements of that array are to be shown and which ones are to remain hidden. The 
        // roomValues graph is already pulling all of the data into it when it draws it, so now I just have to
        // tell it which ones I want it to actually read.

        // The array is 14 elements long. Element 12 and 13 are related to the threshold and are always shown.
        // The other elements (0-11) are related to the four metrics. 0 is the red space below the threshold
        // line in reference to Temperature, 1 is the green space above, and 2 is the actual Temperature data
        // itself. Rinse and repeat for 3-5 Humidity, 6-8 Light Level and 9-11 CO₂. The switch statement above
        // is determining what the current metric is, and returning an index number that I can use to print
        // the correct information (being fillTraceIndex).
        const visibleArray = new Array(14).fill(false);
        visibleArray[fillTraceIndex] = true;        // filledBelow* trace
        visibleArray[fillTraceIndex + 1] = true;    // filledAbove* trace
        visibleArray[fillTraceIndex + 2] = true;    // *Ave trace
        visibleArray[12] = true; // Threshold line
        visibleArray[13] = true; // Threshold hover data

        // Now we recalculate the values that need to be pushed into the refreshed donut graph.
        const aboveThreshold = fullData.filter(v => v > newThreshold).length;
        const belowThreshold = fullData.length - aboveThreshold;
        const percentAbove = ((aboveThreshold / fullData.length) * 100).toFixed(1) + '%';

        // Here's another part where ChatGPT helped out. It's basically the same thing it did when the red/green
        // shapes were drawn the first time, but formatted to fit the new data.
        const filledBelowY = fullData.map(v => Math.min(v, newThreshold));
        const filledAboveY = fullData.map(v => Math.max(v, newThreshold));
        const reversedX = [...date.slice().reverse()];

        // I call this area the re-do's section, because there are lots of restyles, relayouts and reacts. Annoyingly, 
        // you can't update multiple properties within the same restyle/relayout/react instance, so I've had to do 
        // them all individually. I'll specify what each of them are doing:

        // Updating the values of the red/green shapes. We draw it twice, once for the red section and once for
        // the green.
        Plotly.restyle(roomValues, {
        x: [[...date, ...reversedX]],
        y: [[...filledBelowY, ...Array(date.length).fill(newThreshold)]]
        }, [fillTraceIndex]);
        Plotly.restyle(roomValues, {
        x: [[...date, ...reversedX]],
        y: [[...filledAboveY, ...Array(date.length).fill(newThreshold)]]
        }, [fillTraceIndex + 1]);

        // Reinserting the only visible traces required (filledBelow*, filledAbove, *Ave, the threshold line and
        // the threshold hover label data).
        Plotly.restyle(roomValues, { visible: visibleArray });

        // Redrawing the threshold line with the newly inserted threshold data, as well as the line graph title.
        Plotly.relayout(roomValues, {
        yaxis: { title: { text: newYAxisTitle } },
        shapes: [{
            type: 'line',
            x0: date[0],
            y0: newThreshold,
            x1: date[date.length - 1],
            y1: newThreshold,
            line: { color: 'rgb(37, 53, 198)', width: 3, dash: 'dashdot' }
        }],
        title: "<b>Yearly Average of Florist Showroom " + newYAxisTitle + '</b>',
        });

        // Change the line graph legend text based on the current metric and flower.
        Plotly.restyle(roomValues, {
            name: [`${currentFlower} Average Required ` + newYAxisTitle]
        }, [thresholdLineLegendIndex]);
        Plotly.restyle(roomValues, {
            y: [Array(date.length).fill(newThreshold)],
            text: [Array(date.length).fill(`${currentFlower} Average: ${newThreshold}` + newHoverTitle)]
        }, [thresholdHoverLineIndex]);

        // Updating the donut graph's values and redrawing it using the newly inserted data (I did all of the
        // formatting in the graph initialisation anyways, so I can fit a lot in this one). This is a good 
        // time to mention the different varieties of re-*'s going on - of which, react was one I was not
        // familiar with. A combination of scouring web forums and reading therough the Plotly library suggested
        // I use the react method when redrawing the entire graph in one instance, so I did just that.
        Plotly.react(percentHappy, [{
            values: [aboveThreshold, belowThreshold],
            type: 'pie',
            marker: {
                colors: ['rgba(80, 218, 45, 0.8)', 'rgba(229, 31, 31, 0.8)']
            },
            hole: 0.7,
            hoverinfo: 'none',
            textinfo: 'none'
        }], {
            title: {
                text: `Percentage of Satisfactory <br>${currentMetric} Level for ${currentFlower}:`,
                x: 0.6,
                xanchor: 'center',
            },
            paper_bgcolor: "rgba(239, 255, 231, 0)",
            showlegend: false,
            margin: {
                t: 80,
                b: 20,
            },
            font: {
                color: '#D6FEA1',
                family: "omnes-pro, sans-serif",
                size: 16,
            },
            annotations: [
                {
                    font: { size: 40 },
                    family: "omnes-pro, sans-serif",
                    showarrow: false,
                    text: `<b>${percentAbove}</b>`,
                    x: 0.5,
                    y: 0.5
                }
            ],
            updatemenus: updateMenus
        });
    });
});

// Functionality of the 'Back to Top' button at the bottom of the screen. The two document.* options
// was a suggestion from W3schools.com for web compatibility. This section of the webpage was originally
// going to contain more information, however I found that I didn't have any text that I wanted down here.
// Further, when I deleted this section I didn't like the fact that the line graph was at the very bottom 
// of the webpage, and wanted a bit of a buffer zone for the graphs to breathe on the page. So I just
// added this button partly for fun, but mostly for page layout and visual comms reasons.
function scrollToTop() {
    document.body.scrollTop = 0; // For Safari
    document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
}