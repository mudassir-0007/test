import React, { useState } from 'react';
import axios from 'axios';

const BloodDonationPage = () => {
  const [bloodGroup, setBloodGroup] = useState('');
  const [rh, setRh] = useState('');
  const [city, setCity] = useState('');
  const [message, setMessage] = useState('');

  const handleRequestBlood = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('/request', {
        blood: bloodGroup,
        rh: rh,
        city: city,
      });

      setMessage(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDonateBlood = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('/donate', {
        blood: bloodGroup,
        rh: rh,
        city: city,
      });

      setMessage(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <h1>Blood Donation</h1>
      <h2>Request Blood</h2>
      <form onSubmit={handleRequestBlood}>
        <label htmlFor="bloodGroup">Blood Group:</label>
        <input
          type="text"
          id="bloodGroup"
          name="bloodGroup"
          placeholder="Blood Group"
          value={bloodGroup}
          onChange={(e) => setBloodGroup(e.target.value)}
          required
        />
        <br />
        <label htmlFor="rh">RH:</label>
        <input
          type="text"
          id="rh"
          name="rh"
          placeholder="RH"
          value={rh}
          onChange={(e) => setRh(e.target.value)}
          required
        />
        <br />
        <label htmlFor="city">City:</label>
        <input
          type="text"
          id="city"
          name="city"
          placeholder="City"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          required
        />
        <br />
        <button type="submit">Request Blood</button>
      </form>

      <h2>Donate Blood</h2>
      <form onSubmit={handleDonateBlood}>
        <label htmlFor="bloodGroup">Blood Group:</label>
        <input
          type="text"
          id="bloodGroup"
          name="bloodGroup"
          placeholder="Blood Group"
          value={bloodGroup}
          onChange={(e) => setBloodGroup(e.target.value)}
          required
        />
        <br />
        <label htmlFor="rh">RH:</label>
        <input
          type="text"
          id="rh"
          name="rh"
          placeholder="RH"
          value={rh}
          onChange={(e) => setRh(e.target.value)}
          required
        />
        <br />
        <label htmlFor="city">City:</label>
        <input
          type="text"
          id="city"
          name="city"
          placeholder="City"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          required
        />
        <br />
        <button type="submit">Donate Blood</button>
      </form>

      {message && <p>{message}</p>}
    </div>
  );
};

export default BloodDonationPage;