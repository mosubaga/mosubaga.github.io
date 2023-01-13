
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

function getdata()
{   
    const rotk = "js/rotk12.json";
    let sResult = "";
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
            document.getElementById("santwelve").innerHTML = sResult;
        });
}