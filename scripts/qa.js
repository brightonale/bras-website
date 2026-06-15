// QA Simulation Script
const http = require('http');

async function delay(ms) {
  return new Promise(res => setTimeout(res, ms));
}

async function runQA() {
  console.log("=== BRAS Full System QA Simulation ===");
  const BASE_URL = 'http://localhost:3000';
  let testUserCookie = '';
  let committeeCookie = '';

  try {
    // 0. Login as existing committee to get committee cookie
    // We'll just create a super admin directly in DB or we can login if one exists
    // But since this is HTTP, we need to login
    console.log("Step 0: Logging in as Committee (Harry)");
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Harry', password: 'password123' }) // Assuming default pass
    });
    
    if (loginRes.ok) {
      const setCookie = loginRes.headers.get('set-cookie');
      if (setCookie) committeeCookie = setCookie.split(';')[0];
    } else {
      console.log("Could not login as Harry, testing unauthenticated paths only or skipping committee steps.");
    }

    // 1. Registration Flow
    console.log("\nStep 1: Register dummy account 'qa_user'");
    const regRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'qa_user', password: 'password123', pin: '9999' })
    });
    const regData = await regRes.json();
    console.log("Register response:", regData);

    const testLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'qa_user', password: 'password123' })
    });
    if (testLoginRes.ok) {
      const setCookie = testLoginRes.headers.get('set-cookie');
      if (setCookie) testUserCookie = setCookie.split(';')[0];
    }
    console.log("Test user logged in. Cookie obtained.");

    // 2. Role Promotion via Committee
    if (committeeCookie) {
      console.log("\nStep 2: Promoting 'qa_user' to Member via Committee");
      const promoteRes = await fetch(`${BASE_URL}/api/committee/users`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Cookie': committeeCookie
        },
        body: JSON.stringify({ name: 'qa_user', action: 'promote' })
      });
      const promoteData = await promoteRes.json();
      console.log("Promote response:", promoteData);
    }

    // 3. Score Saving (Wordle)
    console.log("\nStep 3: Play Wordle and save score");
    const wordleRes = await fetch(`${BASE_URL}/api/wordle/score`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Cookie': testUserCookie
      },
      body: JSON.stringify({ attempts: 3, isWin: true })
    });
    const wordleData = await wordleRes.json();
    console.log("Wordle score response:", wordleData);

    // 4. Matrix Rating
    console.log("\nStep 4: Matrix Rating submission");
    const rateRes = await fetch(`${BASE_URL}/api/rate`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Cookie': testUserCookie
      },
      body: JSON.stringify({ 
        pubName: 'The Basketmakers Arms',
        beerName: 'Sussex Best',
        breweryName: 'Harvey\'s',
        score: 8.5,
        socialId: null // We'll test without active social if none exists
      })
    });
    const rateData = await rateRes.json();
    console.log("Rating response:", rateData);

    console.log("\n=== QA Simulation Complete ===");
  } catch (err) {
    console.error("QA Simulation failed:", err);
  }
}

runQA();
