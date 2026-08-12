import asyncio
import httpx
import time

BASE_URL = "https://127.0.0.1:4444/api/v1"

async def hammer_api(client):
    while True:
        try:
            # We hit the search endpoint to generate CPU load
            headers = {"Host": "cloudfind.local"}
            await client.get(f"{BASE_URL}/lost/search?q=stress&limit=50", headers=headers)
        except Exception:
            pass

async def main():
    print("🚀 Starting HPA Stress Test (simulating high CPU load for 30 seconds)...")
    async with httpx.AsyncClient(verify=False) as client:
        # Spawn 50 concurrent workers hitting the API non-stop
        tasks = [asyncio.create_task(hammer_api(client)) for _ in range(50)]
        await asyncio.sleep(30)
        for task in tasks:
            task.cancel()
        print("\n🛑 Stress test stopped.")

if __name__ == "__main__":
    asyncio.run(main())
