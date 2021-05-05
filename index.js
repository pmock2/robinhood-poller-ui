import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";
import am4themes_dark from "@amcharts/amcharts4/themes/dark";
import ws from 'ws';
import axios from 'axios';

am4core.useTheme(am4themes_animated);
am4core.useTheme(am4themes_dark);

let chart = am4core.create("chartdiv", am4charts.XYChart);
chart.cursor = new am4charts.XYCursor();
chart.cursor.behavior = "zoomXY";
chart.legend = new am4charts.Legend();
chart.legend.stroke = '#ffffff';
chart.legend.fill = '#222222';
chart.legend.labels.template.stroke = "#ffffff";
chart.legend.labels.template.fill = '#222';

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

    if (message.id === undefined) {
        let newPoint = {
            'date': new Date(message.payload.time)
        };

        for (var [symbol, price] of Object.entries(
            message.payload.values
        )) {
            newPoint[symbol] = price;
        }
        if (chart.data.length === 0) {
            for (var [symbol, price] of Object.entries(
                message.payload.values
            )) {
                let series = new am4charts.LineSeries();
                series.dataFields.valueY = symbol;
                series.name = symbol;
                series.dataFields.dateX = "date";
                series.tooltipText = `Series: ${symbol}\nValue: {valueY}`;
                series.stroke = am4core.color('#' + (Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0')); // red
                series.strokeWidth = 3;
                
                //series.tooltipText = "{dateX}: {valueY}";
                series.tooltip.pointerOrientation = "vertical";

                chartSeries[symbol] = chart.series.push(series);

            }
            chart.data.push(newPoint);
            console.log(chart.data);
        }
        else {
            chart.addData(newPoint, chart.data.length > 1440 ? 1 : 0);
        }
    }

});
