import fetch from 'node-fetch';

const API_URL = 'http://localhost:5000/api/ai';
// Use a fake ObjectId for testing; in real app this comes from auth
const TEST_USER_ID = '65d4f2a1b91e8c001c8e4d2a';

const runTest = async () => {
    console.log('🧪 Starting Robust Session Verification...');

    // 1. Test Validation: Missing Query
    console.log('\nMW: Testing missing query...');
    const resInvalid1 = await fetch(`${API_URL}/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: TEST_USER_ID })
    });
    if (resInvalid1.status === 400) console.log('✅ Correctly rejected missing query.');
    else console.error('❌ Failed to reject missing query:', await resInvalid1.json());

    // 2. Test Validation: Invalid UserID
    console.log('\nMW: Testing invalid userId...');
    const resInvalid2 = await fetch(`${API_URL}/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: 'hello', userId: 'invalid-id' })
    });
    if (resInvalid2.status === 400) console.log('✅ Correctly rejected invalid userId.');
    else console.error('❌ Failed to reject invalid userId:', await resInvalid2.json());

    // 3. Create New Session (Valid)
    console.log('\nMW: Sending valid first message...');
    const res1 = await fetch(`${API_URL}/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            query: 'Suggest a fresh citrus perfume',
            userId: TEST_USER_ID
        })
    });
    const data1 = await res1.json();

    if (!data1.sessionId) throw new Error('Failed to create session');
    console.log('✅ Session Created:', data1.sessionId);

    const sessionId = data1.sessionId;

    // 4. Test Validation: Invalid SessionID
    console.log('\nMW: Testing invalid sessionId...');
    const resInvalid3 = await fetch(`${API_URL}/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: 'hello', sessionId: 'bad-session-id', userId: TEST_USER_ID })
    });
    if (resInvalid3.status === 400) console.log('✅ Correctly rejected invalid sessionId.');
    else console.error('❌ Failed to reject invalid sessionId:', await resInvalid3.json());


    // 5. Continue Session (Valid)
    console.log('\nMW: Sending valid second message...');
    const res2 = await fetch(`${API_URL}/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            query: 'Make it more affordable',
            sessionId: sessionId,
            userId: TEST_USER_ID
        })
    });
    const data2 = await res2.json();

    if (data2.sessionId !== sessionId) throw new Error('Session ID mismatch!');
    console.log('✅ Message added to correct session.');

    console.log('\n🎉 VALIDATION & VERIFICATION SUCCESSFUL!');
};

runTest().catch(console.error);
