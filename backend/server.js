const app = require('./src/app');

const PORT = process.env.PORT; // Cổng

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
