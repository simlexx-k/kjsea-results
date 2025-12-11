// app/api/process/route.ts
import { NextRequest, NextResponse } from 'next/server';
import https from 'https';
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

// Helper to perform fetch with optional SSL bypass and retry logic
const fetchWithRetry = async (url: string, options: RequestInit, retries = 3): Promise<Response> => {
    const agent = new https.Agent({ rejectUnauthorized: false });
    const fetchOptions = { ...options, agent };
    for (let attempt = 0; attempt < retries; attempt++) {
        try {
            const response = await fetch(url, fetchOptions);
            if (!response.ok && attempt < retries - 1) {
                await new Promise(res => setTimeout(res, 100 * Math.pow(2, attempt)));
                continue;
            }
            return response;
        } catch (err) {
            if (attempt < retries - 1) {
                await new Promise(res => setTimeout(res, 100 * Math.pow(2, attempt)));
                continue;
            }
            throw err;
        }
    }
    throw new Error('Failed to fetch after retries');
};
interface StudentInput {
    assessmentNumber: string;
    name: string;
}

export async function POST(req: NextRequest) {
    try {
        const { students } = await req.json();

        if (!students || !Array.isArray(students)) {
            return NextResponse.json({ error: 'Invalid input data' }, { status: 400 });
        }

        const results = [];

        // We use a for-loop instead of Promise.all to prevent hammering the server
        // causing a "Too Many Requests" (429) error.
        for (const student of students) {
            const { assessmentNumber, name } = student;

            // Ensure we only send one name as requested
            const queryName = name.trim().split(' ')[0];

            const url = `https://kjsea.knec.ac.ke/api/search?assessmentNumber=${assessmentNumber}&name=${queryName}`;

            try {
                const response = await fetchWithRetry(url, {
                    method: 'GET',
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                        'Accept': 'application/json'
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    // Assuming the API returns the data directly or inside a property.
                    // We spread the data into the result object.
                    results.push({
                        input_assessment: assessmentNumber,
                        input_name: name,
                        status: 'Found',
                        ...data // Flattens the API response into columns
                    });
                } else {
                    results.push({
                        input_assessment: assessmentNumber,
                        input_name: name,
                        status: `Error: ${response.status}`,
                    });
                }
            } catch (error) {
                console.error('Fetch error:', error);
                results.push({
                    input_assessment: assessmentNumber,
                    input_name: name,
                    status: 'Network Error',
                });
            }

            // Optional: Add a small delay (100ms) to be polite to the server
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        return NextResponse.json({ data: results });

    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}