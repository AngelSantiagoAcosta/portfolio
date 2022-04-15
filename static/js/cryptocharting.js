
const crpyto_url = "wss://stream.data.alpaca.markets/v1beta1/crypto";
const socket = new WebSocket(crpyto_url);
const API_KEY = 'PK7N2K5IPN08ZH2OGJEQ'
const SECRET_KEY = 'JvtV75chfpjYwsfIRAxDx4mqs4FYC9BQ3DdRruJ1'
const auth = {"action": "auth", "key": API_KEY , "secret":SECRET_KEY };
const sub = {"action":"subscribe","trades":["ETHUSD"],"quotes":["ETHUSD"],"bars":["ETHUSD"]};

const quotesElement = document.getElementById('quotes')
const tradesElement = document.getElementById('trades')

let currentBar = {};
let trades = [];
let allData = [];
// var tabledata= []

// var table = new Tabulator("#table-data", {
//     height:"311px",
//     columns:[
//     {title:"Name", field:"name"},
//     {title:"Progress", field:"progress", sorter:"number"},
//     {title:"Gender", field:"gender"},
//     {title:"Rating", field:"rating"},
//     {title:"Favourite Color", field:"col"},
//     {title:"Date Of Birth", field:"dob", hozAlign:"center"},
//     ],
// });

// create our chart and then add our attributes/styling
const chart = LightweightCharts.createChart(document.getElementById('chart'),{
    layout: {
		backgroundColor: '#0C1115',
		textColor: '#d1d4dc',
	},
	grid: {
		vertLines: {
			color: 'rgba(42, 46, 57, 0)',
		},
		horzLines: {
			color: 'rgba(42, 46, 57, 0)',
		},
    },
    crosshair:{
        mode: LightweightCharts.CrosshairMode.Magnet,
    },
    priceScale: {
        borderColor: '#cccccc',
    },
    timeScale: {
        borderColor: '#cccccc',
        timeVisible: true,
    },
});
// adding candlestick setting, and then fetching data from last hour to populate chart
var candleSeries = chart.addCandlestickSeries();
//adding SMA 10
var areaSeries = chart.addAreaSeries({
	topColor: '#2A9FD6',
	bottomColor: 'rgba(38,198,218, 0.04)',
	lineColor: 'rgba(38,198,218, 1)',
	lineWidth: 2,
});
var smaLine = chart.addLineSeries({
	color: '#245BA9',
	lineWidth: 2,
    });
var start = new Date(Date.now() -(7200 *1000)).toISOString();
var bars_url= 'https://data.alpaca.markets/v1beta1/crypto/ETHUSD/bars?exchanges=CBSE&timeframe=1Min&start=' + start
fetch(bars_url, {
    headers:{
        "APCA-API-KEY-ID": API_KEY,
        "APCA-API-SECRET-KEY":SECRET_KEY 
    },

    }).then((r) => r.json())
    .then((response)=>{
        console.log(response);
        const data = response.bars.map(bar=> (
        {
            open: bar.o,
            high: bar.h,
            low: bar.l,
            close: bar.c,
            time: Date.parse(bar.t)/1000

        }
        ));
        // tabledata.data = data
    allData = data
    currentBar = data[data.length-1]
    candleSeries.setData(data)
    var smaData = calculateSMA(data, 10);
    
    console.log(smaData)
    smaLine.setData(smaData);
    // areaSeries.setData(smaData);
    });

    // this is the function to calculate SMA
function calculateSMA(data, count){
    var avg = function(data) {
      var sum = 0;
      for (var i = 0; i < data.length; i++) {
         sum += data[i].close;
      }
      return sum / data.length;
    };
    var result = [];
    for (var i=count - 1, len=data.length; i < len; i++){
      var val = avg(data.slice(i - count + 1, i));
      result.push({ time: data[i].time, value: val});
    }
    return result;
  }
  //this function handles rendering the streaming data to the page, and limiting to 10 items
  function create_and_limit(elements,data){
    for(let i = 0; i < data.length; i++){ 
        const el = document.createElement('li');
        el.innerHTML = data[i];
        el.classList.add("button","is-success","is-outlined");

        elements[i].prepend(el);
        
        if(elements[i].childElementCount > 1){
            elements[i].childNodes[1].classList.remove("button","is-success","is-medium","is-outlined");
        }

        if(elements[i].childElementCount > 10){
            elements[i].removeChild(elements[i].childNodes[10]);
        }
    }

  }

socket.onmessage = function(event){
    const data = JSON.parse(event.data);
    const message = data[0]['msg'];


    if (message== 'connected'){
        console.log('do authentication');
        socket.send(JSON.stringify(auth));
    }

    if (message== 'authenticated'){
        console.log('subscribing to data');
        socket.send(JSON.stringify(sub));
    }
    for (var key in data){
        // console.log(key)
        const type = data[key].T;
        if (type == 'q' ){
            console.log('got a quote');;
            console.log(data[key])
            const qtime = document.getElementById("Quote-Time");
            const bidprice = document.getElementById("Quote-BidPrice");
            const askprice = document.getElementById("Quote-AskPrice");
            create_and_limit([qtime,bidprice,askprice],[`<b>${data[key].t}</b>`,`<b>${data[key].bp}</b>`,`<b>${data[key].ap}</b>`]);
        }

        if (type == 't' && data[key].x == 'CBSE'){
            // console.log('got a trade');
            // console.log(data[key]);
            const tradetime = document.getElementById("Trade-Time");
            const tradeprice = document.getElementById("Trade-Price");
            const tradesize = document.getElementById("Trade-Size");
            create_and_limit([tradetime,tradeprice,tradesize],[`<b>${data[key].t}</b>`,`<b>${data[key].p}</b>`,`<b>${data[key].s}</b>`]);

            trades.push(data[key].p);

            var open = trades[0];
            var high = Math.max(...trades);
            var low = Math.min(...trades);
            var close = trades[trades.length-1];

            candleSeries.update({
                time: currentBar.time + 60,
                open: open,
                high: high,
                low: low,
                close: close
            });
           
        }
        //we only want to show FTXU trades/bars
        if (type == 'b' && data[key].x == 'CBSE'){
            // console.log('got a bar');
            // console.log(data[key]);
            var bar = data[key];
            var timestamp = new Date(bar.t).getTime() / 1000;
            currentBar={
                time: timestamp,
                open: bar.o,
                high: bar.h,
                low: bar.l,
                close: bar.c
            }
            candleSeries.update(currentBar);

            // we need to re-calculate SMA 
            allData.push(currentBar);
            var newSMA = calculateSMA(allData, 10);
            smaLine.setData(newSMA);          
            trades = [];
        }
    }

}