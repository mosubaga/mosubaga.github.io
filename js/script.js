
function showTime() {

  let time = document.getElementById("time")

  let today = new Date(),
      hour = today.getHours(),
      min = today.getMinutes(),
      sec = today.getSeconds();
  
  const amPm = hour >=12 ? "PM" : "AM";
  
  hour = hour %12 || 12;
  
  time.innerHTML = `${hour}<span>:</span>${addZero(min)}<span>:</span>${addZero(sec)} ${amPm}`;
  
  setTimeout(showTime, 1000);
}

function addZero(n) {
  return (parseInt(n,10) < 10 ? "0" : '') + n
}

function getrotktwelve()
{   
    const rotk = "js/rotk12.json";
    let sResult = "<table class='table'><tr><th>Name</th><th>Other</th><th>BAT</th><th>STR</th><th>INT</th><th>POL</th></tr>";
    fetch(rotk)
        .then((response) => {
            return response.json();
        })
        .then((myJson) => {
            // console.log(myJson["characters"]);
            const myChars = myJson["characters"]
            myChars.forEach(async (char) => {
                sResult = sResult + `<tr><td>${char.cNAME}</td><td>${char.cONAME}</td><td>${char.cBAT}</td><td>${char.cWAR}</td><td>${char.cINT}</td><td>${char.cPOL}</td></tr>`;
            });
            document.getElementById("genlist").innerHTML = sResult + "</table>";
        });
}

function getrotkeleven()
{
    const rotk = "js/rotk11.json";
    let sResult = "<table class='table'><tr><th>Name</th><th>BAT</th><th>STR</th><th>INT</th><th>POL</th><th>CHM</th></tr>";
    fetch(rotk)
        .then((response) => {
            return response.json();
        })
        .then((myJson) => {
            // console.log(myJson["characters"]);
            const myChars = myJson["characters"]
            myChars.forEach(async (char) => {
                sResult = sResult + `<tr><td>${char.cNAME}</td></td><td>${char.cBAT}</td><td>${char.cWAR}</td><td>${char.cINT}</td><td>${char.cPOL}</td><td>${char.cCHM}</td></tr>`;
            });
            document.getElementById("genlist").innerHTML = sResult + "</table>";
        });
}

function dispdata()
{
    selectElement = document.querySelector('#version');
    output = selectElement.value;

    if (output === "rotk11") {
        getrotkeleven();
    }
    else if (output === "rotk12"){
        getrotktwelve();
    }
    else {
        alert("No version selected");
    }
}