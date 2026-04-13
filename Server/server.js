import app from "./src/app.js";
import connectDB from "./src/Config/Db/Db.js";

const PORT = process.env.PORT || 5000;

connectDB();

app.get('/', async (req, res) => {
    res.send('Hello World!');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});