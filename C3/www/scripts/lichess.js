// This file implements the Lichess API

// Login to Lichess
function lichessLogin() {
    var xhttp = new XMLHttpRequest();
    var url = "http://en.lichess.org/login";
    var params = "username=" + $('#username').val() + "&password=" + $('#password').val();
    xhttp.open("POST", url, true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    // send the proper header information along with the request
    xhttp.setRequestHeader("Accept", "application/vnd.lichess.v1+json");
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            $("#loginPanel").panel("close");
            $("#login-link").hide();
            $("#logout-btn").show();
            console.log(xhttp.responseText);
        }
    };
    xhttp.send(params);
}

// Logout from Lichess
function lichessLogout() {
    var xhttp = new XMLHttpRequest();
    var url = "http://en.lichess.org/logout";
    xhttp.open("GET", url, true);

    // send the proper header information along with the request
    xhttp.setRequestHeader("Accept", "application/vnd.lichess.v1+json");
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            $("#login-link").show();
            $("#logout-btn").hide();
            console.log(xhttp.responseText);
        }
    };
    xhttp.send();
}

// Get Lichess account info including current games
// returns true if logged in, false if "unauthorized"
function getLichessUser() {
    var xhttp = new XMLHttpRequest();
    var url = "http://en.lichess.org/account/info/";
    var bustCache = '?' + new Date().getTime();
    xhttp.open("GET", url + bustCache, true);

    // send the proper header information along with the request
    xhttp.setRequestHeader("Accept", "application/vnd.lichess.v1+json");
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            // status OK --> return true
            return true;
        }
        else if (this.readyState == 4 && this.status != 200) {
            // unauthorized --> return false
            return false;
        }
    };
    xhttp.send();

}

function createGame() {
    if ($('#engine').val() == "lichess") {
        var xhttp = new XMLHttpRequest();
        var url = "http://en.lichess.org/setup/ai";
        var params = "variant=" + $("#variant").val() + "&timeMode=" + $("#timeMode").val() + "&days=2&time=10&increment=0&level=" + $("#level").val() + "&color=" + $("#color").val();
        xhttp.open("POST", url, true);

        xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        // send the proper header information along with the request
        xhttp.setRequestHeader("Accept", "application/vnd.lichess.v1+json");
        xhttp.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 201) {
                gameConnect(JSON.parse(xhttp.responseText).game.id + JSON.parse(xhttp.responseText).player.id);
            }
        };
        xhttp.send(params);
    }
}

function fetchVersion(fullID) {
    var xhttp = new XMLHttpRequest();
    var url = "http://en.lichess.org/" + fullID;
    xhttp.open("GET", url, false);

    // send the proper header information along with the request
    xhttp.setRequestHeader("Accept", "application/vnd.lichess.v1+json");
   
            
        
    
    xhttp.send();
    var version = JSON.parse(xhttp.responseText).player.version;
    console.log(version);
    return version;
}

function fetchSocketUrl(fullID) {
    var xhttp = new XMLHttpRequest();
    var url = "http://en.lichess.org/" + fullID;
    xhttp.open("GET", url, false);

    xhttp.setRequestHeader("Accept", "application/vnd.lichess.v1+json");

            

    xhttp.send();
    var socketURL = JSON.parse(xhttp.responseText).url.socket;
    console.log(socketURL);
    return socketURL;
}

function gameConnect(fullID) {

    window.currentGame = fullID;
    resync = false;

    var versionInit = fetchVersion(currentGame);
    window.version = versionInit;

    var baseUrl = fetchSocketUrl(currentGame); // obtained from game creation API (`url.socket`)
    clientId = Math.random().toString(36).substring(2); // created and stored by the client

    var socketUrl = 'ws://socket.en.lichess.org:9021' + baseUrl + '?sri=' + clientId + '&ran=--ranph--';
    //alert(socketUrl);

    window.awaitingAck = false;


    window.socket = new WebSocket(socketUrl);



    socket.onopen = function () {



        window.pinger = setInterval(function () {

            socket.send(JSON.stringify({
                t: 'p',
                v: version
            }));

            console.log(JSON.stringify({
                t: 'p',
                v: version
            }));

        }, 2000)


    };

    socket.onmessage = function (event) {
   
        console.log(event.data);
        var currEvent = event;
        var eventData = JSON.parse(currEvent.data);
        if (eventData.hasOwnProperty("t")) {

            if (eventData.t != "n") {
                if (awaitingAck && eventData.t != "ack") {
                    sendMove();
                }
                else if (awaitingAck && eventData.t == "ack") {
      
                    awaitingAck = false;
                }
                if (eventData.t == "resync") {
                    resync = true;
                    socket.close();
                    console.log("resync message received!");
                    

                }
                else if (eventData.t == "move") {
                    board.move(eventData.d.uci.substring(0, 2) + "-" + eventData.d.uci.substring(2, 4));
                    bluetoothSerial.write(eventData.d.uci);
                }

 
            }
        }
        if (eventData.hasOwnProperty("v")) {
            version = eventData.v;
        }

    };

    socket.onerror = function () {
        alert('error occurred!');
    };

    socket.onclose = function (event) {
        clearInterval(pinger);
        console.log("socketClosed!");
        if(resync == true)
            gameConnect(currentGame);

    };

}

function sendMove(source, target) {


        var move = {
            t: 'move',
            d: {
                from: source,
                to: target
            }
        };

        socket.send(JSON.stringify(move));
        window.awaitingAck = true;
       

    
}