#### A node script where you can connect to a remote mysql database via ssh.

```js
const mysql = require('mysql');
const Client = require('ssh2').Client;

// SSH configuration
const sshConfig = {
  host: 'ssh_server_host',
  port: 22,
  username: 'ssh_username',
  privateKey: require('fs').readFileSync('path_to_private_key_file'),
};

// MySQL database configuration
const dbConfig = {
  host: 'mysql_server_host', // Usually 'localhost' for local SSH tunnel
  user: 'mysql_username',
  password: 'mysql_password',
  database: 'mysql_database',
  port: 3306, // Default MySQL port
};

// Create an SSH tunnel
const sshTunnel = new Client();

sshTunnel
  .on('ready', () => {
    // When the SSH tunnel is ready, create a MySQL connection
    const mysqlConnection = mysql.createConnection(dbConfig);

    // Establish the MySQL connection
    mysqlConnection.connect((err) => {
      if (err) {
        console.error('MySQL connection error:', err);
        sshTunnel.end(); // Close the SSH tunnel on error
        return;
      }

      console.log('Connected to MySQL database via SSH tunnel');

      // Use the MySQL connection here

      // Don't forget to close the MySQL and SSH connections when done
      mysqlConnection.end();
      sshTunnel.end();
    });
  })
  .connect(sshConfig);

sshTunnel
  .on('error', (err) => {
    console.error('SSH tunnel error:', err);
  })
  .on('end', () => {
    console.log('SSH tunnel connection closed');
  });
```

#### A script in Node.js to scrape texts from a web page using cheerio and write the content into a text file.

```js
const request = require('request'); // For making HTTP requests
const cheerio = require('cheerio'); // For parsing HTML
const fs = require('fs'); // For file operations

// URL of the web page you want to scrape
const url = 'https://example.com'; // Replace with the target URL

// Make an HTTP GET request to the URL
request(url, (error, response, html) => {
  if (!error && response.statusCode === 200) {
    // Load the HTML content into cheerio
    const $ = cheerio.load(html);

    // Replace 'your_selector' with the appropriate CSS selector for the content you want to scrape
    const scrapedText = $(your_selector).text();

    // Write the scraped text to a text file
    fs.writeFile('scraped_text.txt', scrapedText, (err) => {
      if (err) {
        console.error('Error writing to file:', err);
      } else {
        console.log('Scraped text has been saved to scraped_text.txt');
      }
    });
  } else {
    console.error('Error:', error);
  }
});
```