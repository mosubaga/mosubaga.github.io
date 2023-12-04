
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
            document.getElementById("filter").style.visibility="visible";
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
            document.getElementById("filter").style.visibility="visible";
            document.getElementById("reloadbutton").style.visibility="visible";
        });
}


function getrotkfourteen()
{
    const rotk = "js/rotk14.json";
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
            document.getElementById("filter").style.visibility="visible";
            document.getElementById("reloadbutton").style.visibility="visible";
        });
}

function getrotknamco()
{
    const rotk = "js/namco.json";
    let sResult = "<table class='table'><tr><th>Name</th><th>VIT</th><th>STR</th><th>INT</th><th>CHM</th></tr>";
    fetch(rotk)
        .then((response) => {
            return response.json();
        })
        .then((myJson) => {
            // console.log(myJson["characters"]);
            const myChars = myJson["characters"]
            myChars.forEach(async (char) => {
                sResult = sResult + `<tr><td>${char.NAME}</td><td>${char.VIT}</td><td>${char.STR}</td><td>${char.INT}</td><td>${char.CHM}</td></tr>`;
            });
            document.getElementById("genlist").innerHTML = sResult + "</table>";
            document.getElementById("filter").style.visibility="visible";
            document.getElementById("reloadbutton").style.visibility="visible";
        });
}

function filterresult()
{
   const sSelector = ".table > tbody > tr";
   const generals = document.querySelectorAll(sSelector);

   let genindex = 2;
   let advindex = 3;

    const selectVersion = document.querySelector('#version');
    const sVersion = selectVersion.value;

    if (sVersion === "rotk12"){
        genindex = 3;
        advindex = 4;
    }

   const selectElement = document.querySelector('#applyfilter');
   const output =selectElement.value;

    let index = genindex;
    if (output === "advisor") {
        index = advindex;
    }




    for (i = 1; i < generals.length; i++) {
        const gendata = generals[i].children;
        const fnum = parseInt(gendata[index].innerHTML);

        if (fnum < 90) {
            generals[i].remove();

        }
    }
}

function dispdata()
{
    const selectElement = document.querySelector('#version');
    const output = selectElement.value;

    document.querySelector("#applyfilter").value=""

    if (output === "rotk11") {
        getrotkeleven();
    }
    else if (output === "rotk12"){
        getrotktwelve();
    }
    else if (output === "rotk14"){
        getrotkfourteen();
    }
    else if (output === "namco"){
        getrotknamco();
    }
    else {
        alert("No version selected");
    }
}