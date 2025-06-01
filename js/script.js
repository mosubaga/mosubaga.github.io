
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

function getbooks(publisher,topic,elementid)
{

    const ml_list = new Set(["Fundamentals of Data Engineering", "Hands-On Machine Learning with Scikit-Learn, Keras, and TensorFlow, 3rd Edition","Generative Deep Learning, 2nd Edition", "Hands-On Large Language Models"]);
    const react_list = new Set(["React Cookbook", "Learning React, 2nd Edition", "React: Up & Running, 2nd Edition"]);
    const python_list = new Set(["Python Workout", "Python Concurrency with asyncio", "Deep Learning with Python, Second Edition", "Fluent Python, 2nd Edition", "Python in a Nutshell, 4th Edition", "Introducing Python, 2nd Edition","Robust Python","Learning Python, 6th Edition" ]);
    const javascript_list = new Set(["JavaScript: The Definitive Guide, 7th Edition", "JavaScript Cookbook, 3rd Edition", "JavaScript Everywhere", "Learning JavaScript Design Patterns, 2nd Edition","Gatsby: The Definitive Guide"]);
    const go_list = new Set(["Go in Action", "Go in Practice", "100 Go Mistakes and How to Avoid Them"]);

    let sResult = "<table class='table'><tr><th>Cover</th><th>Title</th><th>Description</th></tr>";

    fetch(`js/${publisher}.json`)
    .then((response) => {
        return response.json();
    })
    .then((myjson) => {

        const mybooks = myjson["results"];

        let setlist = new Set();
        switch(topic) {
            case "Machine_Learning":
                setlist = ml_list;
                break;
            case "Python":
                setlist = python_list;
                break;
            case "React":
                setlist = react_list;
                break;
            case "Javascript":
                setlist = javascript_list;
                break;
            case "Go":
                setlist = go_list;
                break;
            default:
                setlist = python_list;
          }

        const myrecommendations = mybooks.filter(item => setlist.has(item["title"]) && item["topic"] === topic);

        myrecommendations.forEach(book => {

            let description = "No description for this book";
            console.log(book);

            if ("description" in book)
            {
                description = book.description;
            }

            sResult = sResult + `<tr><td><img src="${book.cover_url}"/></td><td class=\"lead\">${book.title}</td><td>${description}</td></tr>`;
        });

        document.getElementById(elementid).innerHTML = sResult + "</table>";

    });
}


function getstrikeouts(){
    const strikeout = "js/strikeouts.json";
    let sResult = "<table class='table'><tr><th>Year</th><th>AL</th><th>NL</th><th>Total</th></tr>";
    fetch(strikeout)
        .then((response) => {
            return response.json();
        })
        .then((myJson) => {
            // console.log(myJson["players"]);
            const myPlayers = myJson;
            myPlayers.forEach(async (player) => {
            sResult = sResult + `<tr><td>${player.YEAR}</td><td>${player.AL}</td><td>${player.NL}</td><td>${player.TOTAL}</td></tr>`;
            });
            document.getElementById("strikeoutlist").innerHTML = sResult + "</table>";
        });

}

function plotPoints() {
    const input = document.getElementById('inputArea').value.trim();
    const lines = input.split('\n');
    const points = [];
    lines.forEach(line => {
        const pair = line.split(',').map(Number);
        if (pair.length === 2 && !isNaN(pair[0]) && !isNaN(pair[1])) {
            points.push({x: pair[0], y: pair[1]});
        }
    });

    // Set up SVG and dimensions
    const svg = d3.select("#chart");
    svg.selectAll("*").remove(); // Clear previous plot

    const width = +svg.attr("width") - 60;
    const height = +svg.attr("height") - 60;
    const margin = {top: 30, right: 30, bottom: 30, left: 40};

    // If no valid points, do nothing
    if (points.length === 0) return;

    // Find min and max
    const xExtent = d3.extent(points, d => d.x);
    const yExtent = d3.extent(points, d => d.y);

    // Scales
    const xScale = d3.scaleLinear()
        .domain([xExtent[0], xExtent[1]])
        .range([margin.left, width + margin.left]);

    const yScale = d3.scaleLinear()
        .domain([yExtent[0], yExtent[1]])
        .range([height + margin.top, margin.top]);

    // Axes
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);

    // Draw axes
    svg.append("g")
        .attr("transform", `translate(0,${height+margin.top})`)
        .call(xAxis);

    svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(yAxis);

    // Draw points
    svg.selectAll(".point")
        .data(points)
        .enter()
        .append("circle")
        .attr("class", "point")
        .attr("cx", d => xScale(d.x))
        .attr("cy", d => yScale(d.y))
        .attr("r", 5);
}