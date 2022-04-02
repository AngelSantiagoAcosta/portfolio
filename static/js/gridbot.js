
const crpyto_url = "wss://stream.data.alpaca.markets/v1beta1/crypto";
const socket = new WebSocket(crpyto_url);
const API_KEY = 'PKU77D6YIE642N37CCHP'
const SECRET_KEY = 'REpYMghLSvNExS5nX8hzHdYPhER81JPmu1BVVmk1'
const auth = {"action": "auth", "key": API_KEY , "secret":SECRET_KEY };
const sub = {"action":"subscribe","trades":["ETHUSD"],"quotes":["ETHUSD"],"bars":["ETHUSD"]};

const quotesElement = document.getElementById('quotes')
const tradesElement = document.getElementById('trades')

let currentBar = {};
let trades = [];
let allData = [];

// let chartel = document.getElementsById("chart")
// let width = chartel.offsetWidth;
// let height = chartel.offsetHeight;


// create our chart and then add our attributes/styling
const chart = LightweightCharts.createChart(document.getElementById('chart'),{
    width: 900,
    height: 700,
    layout: {
        backgroundColor:'#ffffff' ,
        textColor: '#000000'
    },
    grid: {
        verticalLines:{
            color: '404040',
        },
        horzLines: {
            color: '#404040',
        },
    },
    crosshair:{
        mode: LightweightCharts.CrosshairMode.Normal,
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
var smaLine = chart.addLineSeries({
	color: 'rgba(4, 111, 232, 1)',
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
    allData = data
    currentBar = data[data.length-1]
    candleSeries.setData(data)
    var smaData = calculateSMA(data, 10);
    
    console.log(smaData)
    smaLine.setData(smaData);
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
            // console.log('got a quote');;
            // console.log(data[key])

            const quoteElement = document.createElement('div');
            quoteElement.className='quotes';
            quoteElement.innerHTML=`<b>${data[key].t}</b> ${data[key].bp} ${data[key].ap}`;
            quotesElement.appendChild(quoteElement);

            var elements = document.getElementsByClassName('quotes')
            if(elements.length > 10)
                quotesElement.removeChild(elements[0]);
        }

        if (type == 't' && data[key].x == 'CBSE'){
            // console.log('got a trade');
            // console.log(data[key]);

            const tradeElement = document.createElement('div');
            tradeElement.className='trades';
            tradeElement.innerHTML=`<b>${data[key].t}</b> ${data[key].p} ${data[key].s}`;
            tradesElement.appendChild(tradeElement);

            var elements = document.getElementsByClassName('trades')
            if(elements.length > 10)
                tradesElement.removeChild(elements[0]);


            trades.push(data[key].p)

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
            })
           

        }
        //we only want to show Coinbase trades/bars
        if (type == 'b' && data[key].x == 'CBSE'){
            console.log('got a bar');
            console.log(data[key]);
            var bar = data[key]
            var timestamp = new Date(bar.t).getTime() / 1000
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
            smaLine.setData(newSMA)            
            trades = [];
        }
    }

}