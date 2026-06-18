const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));

// Serve static files from current directory
app.use(express.static(__dirname));

// Endpoint to update data.js
app.post('/api/update', (req, res) => {
  try {
    const updatedData = req.body;
    const fileContent = `const siteData = ${JSON.stringify(updatedData, null, 2)};`;
    fs.writeFileSync(path.join(__dirname, 'data.js'), fileContent, 'utf-8');
    res.json({ success: true, message: 'data.js updated successfully' });
  } catch (err) {
    console.error('Error writing to data.js:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Default route redirects to index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n==================================================`);
  console.log(`🌐 Abhi Result Portal is running locally!`);
  console.log(`👉 Open: http://localhost:${PORT}`);
  console.log(`==================================================\n`);
});
