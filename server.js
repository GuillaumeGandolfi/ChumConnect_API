import app from './app/index.js';
import dotenv from 'dotenv';
dotenv.config();

const port = process.env.PORT || 3001;

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});