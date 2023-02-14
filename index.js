"use strict"

const express = require('express');
const bodyParser = require('body-parser');
const Joi = require('joi').extend(require('@joi/date'));
const uuid = require('uuid');

const patientSchema = Joi.object({
    id:Joi.string(),
    patientName: Joi.string().required(),
    patientAddress: Joi.string().required(),
    hospitalName: Joi.string().required(),
    dateOfService: Joi.date().format('MM-DD-YYYY').max('now').required(),
    billAmount: Joi.number().required()
});


const app = express();
app.use(bodyParser.json());

let medicalBills = [];


// Function to validate the schema of provided JSON data
const validatePatient = (patient) => {
  return patientSchema.validate(patient);
}

// GET /items endpoint - returns all the bills present in the array
app.get('/items', (req, res) => {

  res.json(medicalBills);
});

// GET /item/id endpoint - returns the bill of the provided id  if its present
app.get('/item/:id', (req, res) => {
  let id = req.params.id;
  let bill = getBill(id);
  console.log("Bill: ", bill);
  if(!bill) {
    return res.status(404).send();
  }
  return res.status(200).json(bill);
});


//Function to check if the id exists in the array or not
const getBill = (id) => {
  let bills = (medicalBills.filter((bill) => bill.id == id));
  return bills[0];
}

// Put /items endpoint - Updates data of the existing medical bills
app.put('/items',(req,res) =>{

  let newBill = req.body;
  if(validatePatient(newBill).error) 
  {
    
    return res.status(403).send();
  }
  
  const index = medicalBills.findIndex(patient => patient.id === newBill.id);
  if(index == -1) {
    return res.status(404).send();
  }
  if (index !== -1) {
      medicalBills[index] = newBill;
  }
  return res.status(200).json(medicalBills[index]);
});


// POST /items endpoint - populated the data to the array
app.post('/items', (req, res) => {
  const newBill = {
    ...req.body,
    id: uuid.v4()
  };
  try {
    if (validatePatient(newBill).error){

      console.log(validatePatient(newBill).error)
      return res.status(403).send();
    }
    medicalBills.push(newBill);
    res.status(201).json(newBill);
  } catch(e) {
    console.log("Exception when ...",e);
    return res.status(500).send();
  }
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
