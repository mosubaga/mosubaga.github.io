#### A code in golang that asynchronously unzip a set of zip files

```go
package main

import (
	"archive/zip"
	"fmt"
	"io"
	"os"
	"path/filepath"
)

func main() {
	// list of zip file names
	zipFiles := []string{"file1.zip", "file2.zip", "file3.zip"}

	// channel to communicate with goroutines
	ch := make(chan string)

	// start a goroutine for each zip file
	for _, filename := range zipFiles {
		go func(filename string) {
			err := unzip(filename)
			if err != nil {
				ch <- fmt.Sprintf("%s failed to unzip: %v", filename, err)
			} else {
				ch <- fmt.Sprintf("%s successfully unzipped", filename)
			}
		}(filename)
	}

	// receive messages from goroutines and print them to console
	for i := 0; i < len(zipFiles); i++ {
		fmt.Println(<-ch)
	}
}

// unzip function unzips the given zip file
func unzip(filename string) error {
	zipReader, err := zip.OpenReader(filename)
	if err != nil {
		return err
	}
	defer zipReader.Close()

	for _, file := range zipReader.File {
		err = extractFile(file)
		if err != nil {
			return err
		}
	}

	return nil
}

// extractFile function extracts the given file from zip archive
func extractFile(file *zip.File) error {
	src, err := file.Open()
	if err != nil {
		return err
	}
	defer src.Close()

	dest, err := os.Create(file.Name)
	if err != nil {
		return err
	}
	defer dest.Close()

	_, err = io.Copy(dest, src)
	if err != nil {
		return err
	}

	return nil
}
```

#### A code in Golang accessing to a remote Mysql database and querying a table called "customer_list".

```go
package main

import (
	"database/sql"
	"fmt"
	"log"
	_ "github.com/go-sql-driver/mysql"
)

func main() {
	// Replace the values below with the actual credentials of your MySQL database
	db, err := sql.Open("mysql", "user:password@tcp(hostname:port)/database_name")
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	rows, err := db.Query("SELECT * FROM customer_list")
	if err != nil {
		log.Fatal(err)
	}
	defer rows.Close()

	for rows.Next() {
		var id int
		var name string
		var email string
		if err := rows.Scan(&id, &name, &email); err != nil {
			log.Fatal(err)
		}
		fmt.Printf("id: %d, name: %s, email: %s\n", id, name, email)
	}
	if err := rows.Err(); err != nil {
		log.Fatal(err)
	}
}
```

#### A golang code that concurrently reads  a set of  files from a  directory.

```go
package main

import (
	"fmt"
	"io/ioutil"
	"os"
	"path/filepath"
	"sync"
)

func readFile(filePath string, wg *sync.WaitGroup) {
	defer wg.Done()

	// Read the file
	data, err := ioutil.ReadFile(filePath)
	if err != nil {
		fmt.Printf("Error reading file %s: %s\n", filePath, err)
		return
	}

	// Print the file contents
	fmt.Printf("File %s contents:\n%s\n", filePath, string(data))
}

func main() {
	// Directory path
	dir := "path/to/directory"

	// Read all files in the directory
	files, err := ioutil.ReadDir(dir)
	if err != nil {
		fmt.Printf("Error reading directory: %s\n", err)
		return
	}

	// WaitGroup to wait for all goroutines to finish
	var wg sync.WaitGroup

	// Iterate over the files
	for _, file := range files {
		if file.IsDir() {
			continue // Skip directories
		}

		// Construct the file path
		filePath := filepath.Join(dir, file.Name())

		// Increment the WaitGroup counter
		wg.Add(1)

		// Launch a goroutine to read the file
		go readFile(filePath, &wg)
	}

	// Wait for all goroutines to finish
	wg.Wait()
}
```

#### A golang code that parses JSON where you are unsure of the structure.

```go
package main

import (
	"encoding/json"
	"fmt"
	"log"
)

func main() {
	// Sample JSON data with unknown structure
	jsonData := `{
		"name": "John Doe",
		"age": 30,
		"address": {
			"street": "123 Main St",
			"city": "Anytown",
			"province": "ABC"
		},
		"emails": ["john@example.com", "jdoe@example.com"]
	}`

	// Parse the JSON data into a map
	var data map[string]interface{}
	err := json.Unmarshal([]byte(jsonData), &data)
	if err != nil {
		log.Fatal("Error parsing JSON:", err)
	}

	// Access and print the parsed data dynamically
	fmt.Println("Name:", data["name"])
	fmt.Println("Age:", data["age"])

	address, addressExists := data["address"].(map[string]interface{})
	if addressExists {
		fmt.Println("Street:", address["street"])
		fmt.Println("City:", address["city"])
		fmt.Println("Province:", address["province"])
	}

	emails, emailsExist := data["emails"].([]interface{})
	if emailsExist {
		fmt.Println("Emails:")
		for _, email := range emails {
			fmt.Println("-", email)
		}
	}
}
```