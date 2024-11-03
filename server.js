const express = require('express');
const app = express();
const mysql = require('mysql2');
// Cross Origin Resourse Sharing 
const cors = require('cors');
const dotenv = require('dotenv');

app.use(express.json());
app.use(cors());
dotenv.config();

// Connect to the database
const db = mysql.createConnection(
    {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    }
);

// Check if db connection works
db.connect((err) => {
    // No connection
    if(err) return console.log("Error connecting to the MySQL database.")

    // Yes connected
    console.log("Connected to MySQL successfully as id: ", db.threadId)
})


app.set('view engine', 'ejs')
app.set('views', __dirname + '/views');

//Data is the name of the file inside the views folder
app.get('/patients', (req,res) => {
    // Retrieve all patients data and display their: 'patient_id, first_name, last_name, date_of_birth from patients table
    db.query('SELECT patient_id, first_name, last_name, date_of_birth FROM patients', (err, results) => {
        if(err){
            console.error(err);
            res.status(500).send('Error retrieving data.');
        }
        else {
            // Display the records on the browser
            res.render('patients', {patients: results});
        }
    });
});

// Retrieve and render all providers
app.get('/providers', (req, res) => {
  const query = 'SELECT first_name, last_name, provider_specialty FROM providers';
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).send(err.message);
    }
    res.render('providers', { providers: results });
  });
});

// Render page to search for patients by first name
app.get('/patients/search', (req, res) => {
  const firstName = req.query.first_name;
  const query = 'SELECT patient_id, first_name, last_name, date_of_birth FROM patients WHERE first_name = ?';
  db.query(query, [firstName], (err, results) => {
    if (err) {
      return res.status(500).send(err.message);
    }
    res.render('patientSearch', { patients: results, firstName });
  });
});

// Render page to search for providers by specialty
app.get('/providers/search', (req, res) => {
  const specialty = req.query.provider_specialty;
  const query = 'SELECT first_name, last_name FROM providers WHERE provider_specialty = ?';
  db.query(query, [specialty], (err, results) => {
    if (err) {
      return res.status(500).send(err.message);
    }
    res.render('providerSearch', { providers: results, specialty });
  });
});


app.listen(process.env.PORT, () => {
    console.log(`Server listening on port ${process.env.PORT}`)

    // Send message to the browser
    console.log('Sending message to the browser ...');
    app.get('/', (req, res) => {
        res.send('Server started successfully!')
    });
});
