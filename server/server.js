const express = require('express');
const cors = require('cors');
require('dotenv').config();



const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors()); 
app.use(express.json())

//ROUTES
const adminRoutes = require('./routes/adminRoutes');

//CONNECTION TIL ROUTES
app.use('/admin', adminRoutes);

app.listen(PORT, () => {
    console.log(`Serveren kører på http://localhost:${PORT}`);
});