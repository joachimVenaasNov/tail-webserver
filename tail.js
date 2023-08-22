const readLastLines = require('read-last-lines')
var http = require('http')

function processText(text){
  processed = text
    .replace(/\[91m/gi,'<span style="color:red">')
    .replace(/\[31m/gi,'<span style="color:red">')
    .replace(/\[92m/gi,'<span style="color:green">')
    .replace(/\[32m/gi,'<span style="color:green">')
    .replace(/\[93m/gi,'<span style="color:yellow">')
    .replace(/\[94m/gi,'<span style="color:blue">')
    .replace(/\[96m/gi,'<span style="color:orange">')
    .replace(/\[0m/gi,'</span>')
  return processed
}

var server = http.createServer((req, res) => {
  if (req.url == '/'){
    console.log("Req")
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
  
    console.log("Write")
    var circle = '🔴'
    res.end(`<html>
      <head>
        <title>Logger</title>
        <meta name="apple-mobile-web-app-status-bar-style" content="black" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#000000">
      </head>
      <body style="background-color:#111;color:#FFF;" onload="getData()">
        <div id="status" style="font-family:'SF UI Display', '-apple-system';font-size:3em;position:fixed;top:0;right:0;width:auto;text-align:center;background-color:#222;padding:15px;"></div>
        <pre id="pre" style="font-size:2em;"></pre>
        <script>
          console.log("Init")
          var lastupdated = new Date(),
              diff = 0,
              firstLoad = false

          function getData(){
            var xhr = new XMLHttpRequest()
            xhr.onreadystatechange = function(){
              if (xhr.readyState == 4 && xhr.status == 200){
                document.getElementById('pre').innerHTML = xhr.responseText + '<span style="color:lightgreen">pi@rpi3</span>:<span style="color:turquoise">~ $</span> ▌'
                lastupdated = new Date()
                console.log("New data")
              }
            }
            xhr.open('GET', '/api', true)
            xhr.timeout = 950
            xhr.send(null)
            diff = new Date() - lastupdated
            console.log(diff)
            if (diff < 1000){
              text = "🔴 LIVE"
            } else {
              text = 'Last updated: '+ Math.round(diff/1000) +'s'
            }
            document.getElementById('status').innerHTML = text
            if(!firstLoad){
              setTimeout(() => window.scrollTo(0, document.body.scrollHeight), 900)
              firstLoad = true
            }
            setTimeout(() => getData(), 1000)
          }
        </script>
      </body>
    </html>`)
    
    
  } else if (req.url == '/api'){
    res.writeHead(200, { 'Content-Type': 'text/text' })
    console.log("Api call")
    readLastLines.read('/home/pi/logg.txt', 60).then((lines) => res.end(processText(lines)))
  }
})

server.listen(5555)
