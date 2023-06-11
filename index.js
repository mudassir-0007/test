const nodemailer = require('nodemailer');
const express = require('express');
const bodyParser = require('body-parser');
const jsonServer = require('json-server');
const cron = require('node-cron');
const cors=require("cors")
const app = express();
const fs = require('fs');
require('dotenv').config()
app.use(bodyParser.json());
app.use(
    bodyParser.urlencoded({
      extended: true,
    })
  );
  const server=jsonServer.create();
  const router = jsonServer.router('data.json');
  const middlewares=jsonServer.defaults();
  const db = router.db;
  server.use(middlewares);
  server.use(router);
  app.use(cors())
app.post('/request', (req, res) => {
    const bloodGroup = req.body.blood.toUpperCase() + req.body.rh;
    const city = req.body.city;
    // console.log(bloodGroup,city);
    const bloodBanks = db.get('bloodBanks').value();
    
    const recipients = bloodBanks.filter(
      (bank) => bank.bloodGroup === bloodGroup && bank.city === city
    );
    // console.log(recipients)
    if (recipients.length === 0) {
      res.send('No blood banks found for the requested blood group in the city.');
      return;
    }
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.email,
          pass: process.env.pass
        }
      });
  // console.log(recipients.map((bank) => bank.email).join(','),)
    const mailOptions = {
      from: process.env.email, 
      to: recipients.map((bank) => bank.email).join(','),
      subject: 'Blood Request',
      text: `Blood Request: ${bloodGroup} blood is urgently needed in ${city}.`,
    };
  
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
        res.send('Failed to send blood request.');
      } else {
        console.log('Email sent:', info.response);
        res.send('Blood request sent successfully.');
      }
    });
  });
  function updateDataFile(data) {
    fs.writeFile('data.json', JSON.stringify(data), (err) => {
      if (err) {
        console.error('Error updating data file:', err);
      } else {
        console.log('Data file updated successfully.');
      }
    });
  }



app.post('/donate', (req, res) => {
  const bloodGroup = req.body.blood.toUpperCase() + req.body.rh;
  const city = req.body.city;

  const bloodBanks = db.get('bloodBanks').value();

  const recipients = bloodBanks.filter(
    (bank) => bank.bloodGroup === bloodGroup && bank.city === city
  );

  if (recipients.length === 0) {
    res.send('No blood banks found for the requested blood group in the city.');
    return;
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.email,
      pass: process.env.pass
    }
  });

  const mailOptions = {
    from: process.env.email,
    to: recipients.map((bank) => bank.email).join(','),
    subject: 'Blood Donation Offer',
    text: `Blood Donation Offer: I am willing to donate ${bloodGroup} blood in ${city}.`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
      res.send('Failed to send blood donation offer.');
    } else {
      console.log('Email sent:', info.response);
      res.send('Blood donation offer sent successfully.');
    }
  });

  const donorData = {
    name: req.body.name,
    email: req.body.email,
    bloodGroup,
    city,
  };

  fs.readFile('data.json', 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading data.json:', err);
      return;
    }

    const jsonData = JSON.parse(data);
    if (!jsonData.donors) {
      jsonData.donors = [];
    }
    jsonData.donors.push(donorData);

    fs.writeFile('data.json', JSON.stringify(jsonData, null, 2), 'utf8', (err) => {
      if (err) {
        console.error('Error writing data.json:', err);
        return;
      }
      console.log('Donor data saved successfully:', donorData);
    });
  });
});


const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.email,
    pass: process.env.pass
  }
});

function sendReminderEmail(donor) {
  const mailOptions = {
    from: process.env.email,
    to: donor.email,
    subject: 'Blood Donation Reminder',
    text: `Dear ${donor.name},\n\nIt's time to donate blood again! Your next blood donation is due. Contact your nearest blood bank to schedule an appointment.\n\nThank you for your continued support and generosity.\n\nBest regards,\nThe Blood Donation Team`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending reminder email:', error);
    } else {
      console.log('Reminder email sent to the donor:', info.response);
    }
  });
}

fs.readFile('data.json', 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading data.json:', err);
    return;
  }

  const jsonData = JSON.parse(data);
  const donors = jsonData.donors || [];

  if (donors.length === 0) {
    console.log('No donors found.');
    return;
  }

  donors.forEach((donor) => {
    sendReminderEmail(donor);
  });
});

cron.schedule('0 0 1 */6 *', () => {
  fs.readFile('data.json', 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading data.json:', err);
      return;
    }

    const jsonData = JSON.parse(data);
    const donors = jsonData.donors || [];

    if (donors.length === 0) {
      console.log('No donors found.');
      return;
    }

    donors.forEach((donor) => {
      sendReminderEmail(donor);
    });
  });
});

  
  
  const port = process.env.PORT || 3000;
  server.listen(3001);
app.listen(port, () => {
  console.log('App listening on port ' + port + '!');
});


