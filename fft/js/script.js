

function getjobs()
{   
    const sURL = "./api/jobs.json";
    fetch(sURL)
        .then((response) => {
            return response.json();
        })
        .then((myJson) => {
            let sResult = "<table border=\"1\"><tr><th>Job</th><th>Icon</th><th>Description</th><th>Qualifications</th></tr>"
            console.log(myJson);
            myJson.jobs.forEach(async (job) => {
                console.log(job);
                if ((job.job == "Dancer") || (job.job == "Bard")) {
                    sResult = sResult + `<tr><td>${job.job}</td><td><img class="center" src="./img/${job.icon}" alt="${job.job}"></img></td><td>${job.description}</td><td>${job.qualifications}</td></tr>`;
                }
                else{
                    sResult = sResult + `<tr><td>${job.job}</td><td><img src="./img/${job.ficon}" alt="${job.job}"></img><img src="./img/${job.micon}" alt="${job.job}"></img></td><td>${job.description}</td><td>${job.qualifications}</td></tr>`;
                }
            });
            sResult = sResult + "</table>";
            console.log(sResult);
            document.getElementById("jobs").innerHTML = sResult;
        });
}