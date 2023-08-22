const http = require('http')
const fs = require('fs')
const url = require('url')
const child_process = require('child_process')


/** Config *****************************/
const logfile = '/root/lade_logg.txt'
const maxNoOfLines = -300
const port = 5555
/** End of config **********************/


/**
 * Fetch only the part of the log file with the given regexp
 * @param {string} regexp 
 * @returns {Promise<string>} String with the log file content
 */
function grepWithFork(regexp='.*') {
  return new Promise((resolve, reject) => {
    let data = []
    cmd = `egrep '"loggerName":"${regexp}"' ${logfile}`
    child_process.exec(cmd, {maxBuffer: 200000000}, function(err, stdout, stderr) {
      if (err) {
        reject(err)
      } 
      resolve(stdout)
    })
  })
  
}

/**
 * * MAIN
 */
var server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  if (req.url == '/' || req.url.slice(0,2) == '/?'){
    fs.readFile('/root/tail/template.html', 'utf8', (err, htmlContent) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' })
        res.end('Error reading HTML file')
      } else {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
        res.end(htmlContent)
      }
    })
    
  } else if (pathname == '/api'){
    const filter = parsedUrl.query.filter

    const err = parsedUrl.query.error ? parsedUrl.query.error : '0'
    const warn = parsedUrl.query.warn ? parsedUrl.query.warn : '0'
    const info = parsedUrl.query.info ? parsedUrl.query.info : '0'
    const debug = parsedUrl.query.debug ? parsedUrl.query.debug : '0'

    res.writeHead(200, { 'Content-Type': 'text/text; charset=utf-8' })

    grepWithFork()
      .then(content => {
        const lines = content.split('\n')
        let newLines = []
        lines.forEach((line) => {
          try {
            const json = JSON.parse(line)
            if (json.loggerName.includes(filter) || filter === ''){
              if (
                (err === '1' && json.level === 'error') ||
                (warn === '1' && json.level === 'warn') ||
                (info === '1' && json.level === 'info') ||
                (debug === '1' && json.level === 'debug') ||
                (!err && !warn && !info && !debug)
              ){
                newLines.push(line)
              }
            }
          } catch {
            //console.log('Non JSON entry')
          }
        })
        newLines = newLines.slice(maxNoOfLines)
        return newLines.join('\n')
      })
      .then((result) => res.end(result))
      .catch((err) => res.end(`Error reading file ${err}`))
  }
})

server.listen(port)
