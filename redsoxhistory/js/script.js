const roster = "./js/roster.json";

function openInNewTab(url) {
    // window.open(url, '_blank');
    window.location.href = url;
  }

function getplayer(stype,sfirstname,slastname,sID)
{   
    const sURL = roster;

    fetch(sURL)
        .then((response) => {
            return response.json();
        })
        .then((myJson) => {

            let myPlayer;
            if (stype == "pitchers"){
                myPlayer = myJson.roster.pitchers.filter((player) => player.firstname == sfirstname && player.lastname == slastname);
                sOutput="<table border=\"1\"><tr><th>Year</th><th>First Name</th><th>Last Name</th><th>Wins</th><th>Losses</th><th>Saves</th><th>ERA</th></tr>"
                myPlayer.forEach((player) => {
                    sOutput += `<tr><td>${player.year}</td><td>${player.firstname}</td><td>${player.lastname}</td><td>${player.W}</td><td>${player.L}</td><td>${player.SV}</td><td>${player.ERA}</td></tr>`;
                });
                sOutput += "</table>";
                document.getElementById(sID).innerHTML = sOutput;
            }
            else{
                myPlayer = myJson.roster.batters.filter((player) => player.firstname == sfirstname && player.lastname == slastname);
                sOutput="<table border=\"1\"><tr><th>Year</th><th>First Name</th><th>Last Name</th><th>Games</th><th>HR</th><th>RBI</th><th>AVG</th></tr>"
                myPlayer.forEach((player) => {
                    sOutput += `<tr><td>${player.year}</td><td>${player.firstname}</td><td>${player.lastname}</td><td>${player.G}</td><td>${player.HR}</td><td>${player.RBI}</td><td>${player.AVG}</td></tr>`;
                });
                sOutput += "</table>";
                document.getElementById(sID).innerHTML = sOutput;
            }
            console.log(myPlayer);

            // document.getElementById(sID).innerHTML = sResult;
        });
}