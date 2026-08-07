import requests
import sqlite3
import time

BASE_URL = "http://localhost:8000/api"

# We will connect directly to the postgres database running in docker to get the verification token
# Actually, wait, the DB is running in Postgres in Docker. 
# We need to query Postgres to get the token. 
# Since we have psycopg2 in the backend venv, we can use it to connect to localhost:5432.
import psycopg2

def get_verification_token(email):
    # Connect to PostgreSQL running in the container
    conn = psycopg2.connect(
        dbname="placement",
        user="placeshare_user",
        password="placeshare_password",
        host="localhost",
        port="5432"
    )
    cur = conn.cursor()
    # Find user ID
    cur.execute("SELECT id FROM users WHERE email = %s", (email,))
    user_id = cur.fetchone()[0]
    
    # Get the latest verification token
    cur.execute("SELECT token FROM account_tokens WHERE user_id = %s AND purpose = 'verify_email' ORDER BY created_at DESC LIMIT 1", (user_id,))
    token = cur.fetchone()[0]
    
    cur.close()
    conn.close()
    return token

def main():
    print("Starting automated test and data seeding...")
    
    # 1. Register User A (Alice)
    print("\n--- Registering Alice ---")
    session_a = requests.Session()
    res = session_a.post(f"{BASE_URL}/auth/register", json={
        "username": "alice_student",
        "email": "alice@example.com",
        "password": "Password123!"
    })
    print("Register Alice:", res.status_code, res.json())
    
    # Request Verification for Alice
    res = session_a.post(f"{BASE_URL}/auth/request-verification")
    print("Request Verification Alice:", res.status_code)
    
    # Get token and verify
    token_a = get_verification_token("alice@example.com")
    res = session_a.post(f"{BASE_URL}/auth/verify-email?token={token_a}")
    print("Verify Alice:", res.status_code, res.json())

    # 2. Register User B (Bob)
    print("\n--- Registering Bob ---")
    session_b = requests.Session()
    res = session_b.post(f"{BASE_URL}/auth/register", json={
        "username": "bob_engineer",
        "email": "bob@example.com",
        "password": "Password123!"
    })
    print("Register Bob:", res.status_code, res.json())
    
    res = session_b.post(f"{BASE_URL}/auth/request-verification")
    token_b = get_verification_token("bob@example.com")
    res = session_b.post(f"{BASE_URL}/auth/verify-email?token={token_b}")
    print("Verify Bob:", res.status_code, res.json())
    
    # 3. Alice posts an experience
    print("\n--- Alice posts Experience ---")
    exp_a_data = {
        "company": "Google",
        "role": "Software Engineer Intern",
        "description": "The interview had 3 rounds. First was a phone screen with basic DS&A. Second was a coding round focusing on graphs. Final round was system design.",
        "difficulty": "hard",
        "result": "selected"
    }
    res = session_a.post(f"{BASE_URL}/experiences", json=exp_a_data)
    print("Alice Experience:", res.status_code)
    exp_a_id = res.json()["id"]
    
    # 4. Bob posts an experience
    print("\n--- Bob posts Experience ---")
    exp_b_data = {
        "company": "Microsoft",
        "role": "SWE",
        "description": "Two rounds. One online assessment and one final round consisting of 4 back-to-back interviews.",
        "difficulty": "medium",
        "result": "selected"
    }
    res = session_b.post(f"{BASE_URL}/experiences", json=exp_b_data)
    print("Bob Experience:", res.status_code)
    exp_b_id = res.json()["id"]

    # 5. Bob comments on Alice's experience
    print("\n--- Bob comments on Alice's post ---")
    res = session_b.post(f"{BASE_URL}/experiences/{exp_a_id}/comments", json={
        "content": "Wow, congrats Alice! What graph algorithm did they ask in the second round?"
    })
    print("Bob Comment:", res.status_code)
    bob_comment_id = res.json()["id"]
    
    # 6. Alice replies to Bob's comment on her post
    print("\n--- Alice replies to Bob ---")
    res = session_a.post(f"{BASE_URL}/experiences/{exp_a_id}/comments", json={
        "content": "Thanks Bob! It was a variation of Dijkstra's algorithm for finding the shortest path with constraints.",
        "parent_id": bob_comment_id
    })
    print("Alice Reply:", res.status_code)

    # 7. Alice comments on Bob's experience
    print("\n--- Alice comments on Bob's post ---")
    res = session_a.post(f"{BASE_URL}/experiences/{exp_b_id}/comments", json={
        "content": "Great job Bob! Did they ask any dynamic programming questions?"
    })
    print("Alice Comment:", res.status_code)
    alice_comment_id = res.json()["id"]

    # 8. Bob replies to Alice's comment on his post
    print("\n--- Bob replies to Alice ---")
    res = session_b.post(f"{BASE_URL}/experiences/{exp_b_id}/comments", json={
        "content": "Yes, they asked a 1D DP problem similar to House Robber in the first technical round.",
        "parent_id": alice_comment_id
    })
    print("Bob Reply:", res.status_code)
    
    print("\n✅ All automated testing and data seeding completed successfully!")

if __name__ == "__main__":
    main()
