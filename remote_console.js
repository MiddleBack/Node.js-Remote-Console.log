/**************
* LICENSE: BSD 
* AUTHOR: Alex Kessinger http://alexkessinger.net @voidfiles
* 
* One File Remote Console.log for node.js
* 
* This should be fairly simple to run, you just need to include 
* the provided debug js in your webpage before you want to use it.
* 
* REQUIREMENTS: node.js 
* 
* once you have node.js installed you can run
* this script from the command line like so
* 
* >>> node remove_console.js
* Server running at http://127.0.0.1:8124/
* 
* Then you can in your app include the following JS file
* 
* http://127.0.0.1:8124/debug.js 
* 
* And then you will be able to call log()
* and see the output in your console
* 
* There is also helper function called catchRemote.
* It accepts a function, which it will immediatly execute.
* If it catches an error it log it remotely.
* 
* >>> catchRemote(function(){ throw("WTF");});
* [ { error: 'WTF' } ]
* 
* If you want you can change the host, and port 
* by passing them as arguments
* 
* 
* >>> node remove_console.js 192.168.1.101 8001
* Server running at http://92.168.1.101:8001/
* 
*/




var http = require('http'),
    url = require('url'),
    sys = require('sys'),
    host = (process.argv[2]) ? process.argv[2] : "127.0.0.1",
    port = (process.argv[3]) ? process.argv[3] : 8124;
   
function parseJson(string){
    try{
        return JSON.parse(string);
    } catch(e){
        return false;
    }
};

function returnDebugJS(ns){
    ns = ns || "window";
    return '\n\
    (function(){ \n\
        var log=function(obj) { \n\
            var str = JSON.stringify(obj); \n\
            var img = document.createElement("img"); \n\
            var url = "http://' + host + ':' + port + '/?console=" + encodeURIComponent(str); \n\
            img.src = url; \n\
        } \n\
        ' + ns + '.log = log; \n\
    })()';    
}

http.createServer(function (req, res) {
    var brokeDownRequest = url.parse(req.url, true);
        json_console = (brokeDownRequest.query && brokeDownRequest.query.console) ?
          parseJson(brokeDownRequest.query.console) :
          "No console passed";
          
    if(req.url.indexOf("/debug.js") === 0){
        var ns = brokeDownRequest.query && brokeDownRequest.query.ns || "";
        res.writeHead(200, {'Content-Type': 'text/javascript'});
        res.end(returnDebugJS(ns));
        return;
    } 
    if(req.url == "/favicon.ico"){
        res.writeHead(200, {'Content-Type': 'image/gif'});
        res.end("");
        return;
    }
    
    res.writeHead(200, {'Content-Type': 'image/jpeg'});
    res.end("");
    console.log(sys.inspect(json_console));
}).listen(port, host);
console.log('Server running at http://'+host+':'+port+'/');