// upload.js
import express from 'express';
import multer from 'multer';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import xlsx from 'xlsx';

dotenv.config(); // Load environment variables from .env file

const router = express.Router();

// Multer storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Ensure the 'uploads/' directory exists
        const uploadDir = 'uploads/';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true }); // Create directory if it doesn't exist
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Create a unique filename by prepending a timestamp
        cb(null, Date.now() + '-' + file.originalname);
    },
});

// File filter to allow only specified spreadsheet types
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['.csv', '.xls', '.xlsx'];
    const ext = path.extname(file.originalname).toLowerCase(); // Convert to lowercase for consistent checking
    if (allowedTypes.includes(ext)) {
        cb(null, true); // Accept the file
    } else {
        // Reject the file with an error message
        cb(new Error('Invalid file type. Only .csv, .xls, .xlsx are allowed!'), false);
    }
};

// Initialize Multer upload middleware
const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 }, // Limit file size to 10MB
});

// POST /api/upload route to handle file uploads and analysis
router.post('/upload', upload.single('file'), async (req, res) => {
    let filePath; // Declare filePath here to ensure it's accessible in the finally block for cleanup

    try {
        if (!req.file) {
            // No file was uploaded
            return res.status(400).json({ message: 'No file uploaded!' });
        }

        filePath = path.join('uploads', req.file.filename);
        console.log('File uploaded to:', filePath);

        // Read the uploaded file using xlsx
        const workbook = xlsx.readFile(filePath);
        // Assuming we're interested in the first sheet for analysis
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        // Convert the sheet data to a CSV string. This is generally a good
        // format for sending tabular data to LLMs as it preserves structure.
        const csvData = xlsx.utils.sheet_to_csv(sheet);

        // Construct the prompt for the Gemini API
        // Provide clear instructions and structure for the desired output
        const prompt = `You are a financial analyst specializing in small business data.
        Analyze the following spreadsheet data, provided in CSV format, and identify key trends,
        potential issues, and opportunities. Provide actionable advice and clear recommendations
        for the small business owner.

        --- CSV Data ---
        ${csvData}
        --- End CSV Data ---

        Please structure your analysis into distinct sections:
        1. Executive Summary: A brief overview of the key findings.
        2. Key Financial Metrics & Trends: Highlight important numbers and trends observed in the data.
        3. Strengths and Opportunities: What's working well and where can the business grow?
        4. Weaknesses and Risks: What are the challenges and potential threats?
        5. Actionable Recommendations: Specific steps the business owner can take.
        `;

        console.log("Prompt sent to Gemini (first 500 characters):", prompt.substring(0, 500) + '...');
        // Uncomment the line below for full prompt debugging, but be aware it can be very long
        // console.log("Full prompt:", prompt);

        // Call the Gemini API to generate content
        const geminiRes = await axios.post(
            'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyCxdJ8VnlRcvSQBEPRJ9NEMqcfmr7j0NcQ'
,
            {
                contents: [
                    {
                        parts: [
                            { text: prompt },
                        ],
                    },
                ],
            }
        );

        console.log('Gemini API response status:', geminiRes.status);
        console.log('Gemini API full response data:', JSON.stringify(geminiRes.data, null, 2)); // <--- THIS IS THE CRUCIAL LOG
        console.log('Gemini API Key Loaded (first 5 chars):', process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.substring(0, 5) + '...' : 'NOT LOADED'); // <--- HELPFUL FOR API KEY DEBUGGING

        // Extract the advice from the Gemini API response
        const advice = geminiRes?.data?.candidates?.[0]?.content?.parts?.[0]?.text || 'Gemini did not return advice.';

        console.log('Advice received (first 200 characters):', advice.substring(0, 200) + '...');

        // Send a success response back to the client
        res.status(200).json({
            message: 'File uploaded and analyzed successfully!',
            filename: req.file.filename, // Optionally send back the filename
            advice, // The analysis and advice from Gemini
        });

    } catch (err) {
        console.error('Upload or analysis failed:', err);

        // More detailed error handling for Axios specific errors (e.g., API issues)
        if (axios.isAxiosError(err)) {
            console.error('Axios error details (response data):', err.response?.data || err.message);
            res.status(err.response?.status || 500).json({
                message: 'Gemini API call failed',
                error: err.response?.data || err.message, // Send specific API error details if available
            });
        } else {
            // General error handling for other issues (e.g., file parsing, multer issues)
            res.status(500).json({ message: 'Upload or analysis failed', error: err.message });
        }
    } finally {
        // IMPORTANT: Always delete the uploaded file to prevent disk space issues
        if (filePath && fs.existsSync(filePath)) {
            fs.unlink(filePath, (unlinkErr) => {
                if (unlinkErr) {
                    console.error('Error deleting uploaded file:', unlinkErr);
                } else {
                    console.log('Uploaded file deleted successfully:', filePath);
                }
            });
        }
    }
});

export default router;