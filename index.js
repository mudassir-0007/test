const nodemailer = require('nodemailer');
const express = require('express');
const bodyParser = require('body-parser');
const jsonServer = require('json-server');
const cors=require("cors")
const app = express();
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
    console.log(recipients.map((bank) => bank.email).join(','),)
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
    const donorMailOptions = {
      from: process.env.email,
      to: req.body.email,
      subject: 'Blood Donation Confirmation',
      text: `Thank you for offering to donate blood. We confirm your donation request and will contact you shortly to proceed with the necessary tests and collection process.  Blood Bank Address: ${recipients[0].address}`,
    };

    transporter.sendMail(donorMailOptions, (error, info) => {
      if (error) {
        console.error('Error sending confirmation email:', error);
      } else {
        console.log('Confirmation email sent to the donor:', info.response);
      }
    });
    
  });
  
  const port = process.env.PORT || 3000;
  server.listen(3001);
app.listen(port, () => {
  console.log('App listening on port ' + port + '!');
});