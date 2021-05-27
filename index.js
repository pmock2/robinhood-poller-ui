import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";
import am4themes_dark from "@amcharts/amcharts4/themes/dark";

am4core.useTheme(am4themes_animated);
am4core.useTheme(am4themes_dark);

let chart = am4core.create("chartdiv", am4charts.XYChart);
chart.cursor = new am4charts.XYCursor();
chart.cursor.behavior = "zoomXY";
chart.legend = new am4charts.Legend();
chart.legend.stroke = '#222222';
chart.legend.fill = '#222222';
chart.legend.labels.template.stroke = "#ffffff";
chart.legend.labels.template.fill = '#222';
chart.legend.labels.template.minWidth = 200;
chart.legend.labels.template.textAlign = 'center';
chart.legend.valueLabels.template.textAlign = 'center';

let valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
valueAxis.renderer.stroke = ('#ffffff');
valueAxis.title.text = "Percent Change";
valueAxis.title.stroke = ('#ffffff');
valueAxis.renderer.grid.template.stroke = ('#ffffff');

let dateAxis = chart.xAxes.push(new am4charts.DateAxis());
dateAxis.title.text = "Time";
dateAxis.title.stroke = ('#ffffff');
dateAxis.renderer.grid.template.location = 0.5;
dateAxis.renderer.labels.template.location = 0.5;
dateAxis.renderer.stroke = ('#ffffff');
dateAxis.renderer.grid.template.stroke = ('#ffffff');


let chartSeries = {};


let socket = new WebSocket('ws://localhost:3012');

socket.addEventListener('open', () => {
    console.log('Connected');
});

socket.addEventListener('close', () => {
    console.log('Connected to Transit closed');
});

socket.addEventListener('error', (err) => {
    console.log(`Connected to Transit closed in error : ${err}`);
});

socket.addEventListener('message', (event) => {
    var message = JSON.parse(event.data);
    console.log(message);

    //if receiving new data
    if (message.id === undefined) {
        let newPoint = {
            'date': new Date(message.payload.time)
        };

        //create the new points percent values
        for (var [symbol, percentChange] of Object.entries(
            message.payload.values
        )) {
            newPoint[symbol] = percentChange.toFixed(2);
        }

        //if we have no data in our chart
        if (chart.data.length === 0) {
            for (var [symbol, percentChange] of Object.entries(
                message.payload.values
            )) {
                let series = new am4charts.LineSeries();
                series.dataFields.valueY = symbol;
                series.name = symbol;
                series.dataFields.dateX = "date";

                switch (symbol) {
                    case 'DOGE':
                        series.stroke = am4core.color('#ecfc03');
                        series.fill = am4core.color('#ecfc03');
                        break;
                    case 'ETC':
                        series.stroke = am4core.color('#03fcd7');
                        series.fill = am4core.color('#03fcd7');
                        break;
                    case 'ETH':
                        series.stroke = am4core.color('#a503fc');
                        series.fill = am4core.color('#a503fc');
                        break;
                    case 'LTC':
                        series.stroke = am4core.color('#73fc03');
                        series.fill = am4core.color('#73fc03');
                        break;
                    case 'BTC':
                        series.stroke = am4core.color('#ff0000');
                        series.fill = am4core.color('#ff0000');
                        break;
                    case 'BCH':
                        series.stroke = am4core.color('#030ffc');
                        series.fill = am4core.color('#030ffc');
                        break;
                    case 'BSV':
                        series.stroke = am4core.color('#fc03d7');
                        series.fill = am4core.color('#fc03d7');
                        break;

                    default:
                        series.stroke = am4core.color('#ffffff');
                        series.fill = am4core.color('#ffffff');
                        break;
                }
                series.strokeWidth = 3;
                series.tooltip.pointerOrientation = "vertical";
                series.tooltipText = `${symbol}: {valueY}%`;

                chartSeries[symbol] = chart.series.push(series);

            }
            chart.data.push(newPoint);
            console.log(chart.data);
        }
        else {
            chart.addData(newPoint, chart.data.length > 1440 ? 1 : 0);
            for (var [symbol, price] of Object.entries(
                message.payload.values
            )) {
                chartSeries[symbol].legendSettings.labelText = `{name}[/] : ${message.payload.values[symbol].toFixed(2)}% ($${message.payload.prices[symbol].toFixed(3)})`;
            }
        }

    }

});
