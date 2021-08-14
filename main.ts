import express from "express";
import axios from "axios";

const port: number = 3001;
let app = express();

app.listen(port, (() => console.log(`App started on port ${port}`)));
