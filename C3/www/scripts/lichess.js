﻿// This file implements the Lichess API

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