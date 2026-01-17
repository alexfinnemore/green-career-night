import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, role } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

  try {
    const sql = neon(process.env.DATABASE_URL);

    // Create table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS registrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        role TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Insert the registration
    await sql`
      INSERT INTO registrations (name, email, role)
      VALUES (${name}, ${email}, ${role || null})
    `;

    return res.status(200).json({
      success: true,
      message: 'Registration successful! We will contact you soon.'
    });
  } catch (error) {
    console.error('Registration error:', error);

    // Handle duplicate email
    if (error.code === '23505') {
      return res.status(400).json({
        error: 'This email is already registered.'
      });
    }

    return res.status(500).json({
      error: 'Registration failed. Please try again later.'
    });
  }
}
