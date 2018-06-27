const http = require('http')
const ps = require('ps-node')
const psList = require('ps-list')
const url = require('url');
const util = require('util')
const port = 3000
const path = require('path');
const fs = require('fs');
const querystring = require('querystring');

var mimeTypes = {
    "html": "text/html",
    "jpeg": "image/jpeg",
    "jpg": "image/jpeg",
    "png": "image/png",
    "js": "application/javascript",
    "css": "text/css"
};

var notstatic = ["/","/app.js"];

const requestHandler = (request, response) => {
    console.log(request.url)
    var urlp = url.parse(request.url);
    var args = querystring.parse(request.url.split("?")[1]);
    var uri = urlp.pathname;
    var filename = path.join(process.cwd(), uri);
    fs.exists(filename, function(exists) {
        console.log (filename);
        if(!exists || notstatic.includes(uri)) {
            console.log(args);
            var reqtype = "default";
            if(args && args.type && args.type=="api"){
                reqtype = "api"
            }
            if (args && args.kill){
                var pid = args.kill;
                //killproc urlp.search.kill
                ps.kill(pid, function(err){
                    if (err) {
                        console.log(err);
                    } else {
                        console.log('process with pid ',pid,' sucessfuly killed')
                    }
                })
                if (reqtype == "api") 
                    response.end("<script>window.location = '/?type=api';</script>");
                else
                    response.end("<script>window.location = '/';</script>");
                return;
            }
            if (process.platform != 'win32'){
                psList().then(data => {
                    if (reqtype == "api")
                        response.write(JSON.stringify(data));
                    else{
                        response.write('<table><tr><th>PID</th><th>Name</th>')
                        data.forEach((item)=>{
                            response.write(util.format('<tr class="prow"><td>%s</td><td>%s</td><tr>',item.pid,item.name));
                        });
                        response.write('</table><script src="/jquery-3.3.1.min.js"></script><script src="/script.js"></script>')
                    }
                    response.end();
                });
            } else {
                response.write("oh no u windows. die, i mean...")
                response.end("die");
            }
            return;
        }
        var mimeType = mimeTypes[path.extname(filename).split(".")[1]];
        response.setHeader('content-type', mimeType);
        response.writeHead('200', "OK");
        response.end(fs.readFileSync(filename,'utf8'));
    });
}

const server = http.createServer(requestHandler)

server.listen(port, (err) => {
    if (err) {
        return console.log('something bad happened', err)
    }

    console.log(`server is listening on ${port}`)
})