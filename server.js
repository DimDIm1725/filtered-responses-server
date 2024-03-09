require('dotenv').config();
const express = require('express');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/:formId/filteredResponses', async (req, res) => {
    try {
      const { formId } = req.params;
      const { filters, ...otherParams } = req.query;
  
      // Fetch responses from Fillout's API
      const response = await axios.get(`${process.env.BASE_URL}/forms/${formId}/responses`, {
        headers: { Authorization: `Bearer ${process.env.API_KEY}` },
        params: otherParams,
      });
  
      // Parse the filters
      const filterClauses = filters ? JSON.parse(filters) : [];
  
      // Apply filters
      let filteredResponses = response.data.responses.filter((response) => {
        return filterClauses.every((filter) => {
          const question = response.questions.find(q => q.id === filter.id);
          if (!question) return false;
          switch (filter.condition) {
            case 'equals': return question.value === filter.value;
            case 'does_not_equal': return question.value !== filter.value;
            case 'greater_than': return new Date(question.value) > new Date(filter.value);
            case 'less_than': return new Date(question.value) < new Date(filter.value);
            default: return true;
          }
        });
      });
  
      // Return filtered responses
      res.json({
        responses: filteredResponses,
        totalResponses: filteredResponses.length,
        pageCount: 1, // Adjust based on pagination implementation
      });
    } catch (error) {
      console.error('Error fetching filtered responses:', error);
      res.status(500).send('Internal Server Error');
    }
  });
  