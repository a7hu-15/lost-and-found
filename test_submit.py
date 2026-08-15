import requests

url = 'http://localhost:8000/api/v1/lost/create'
data = {
    'title': 'Test Item',
    'category': 'Electronics',
    'location': 'Library',
    'lost_date': '2023-10-10',
    'description': 'Lost my laptop.',
    'contact_email': 'test@example.com'
}

response = requests.post(url, data=data)
print(response.status_code)
print(response.text)
