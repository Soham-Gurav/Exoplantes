from google import genai
import os

# 1. Initialize the client with your API key
client = genai.Client(api_key="AIzaSyDKdumXpI0idlYIkLtgP44xTFmdokIRs5s")

# 2. Use the client.models.list() method
# This returns an iterator of model objects
models = client.models.list()

print("Available Models:")
for model in models:
    print(model.name)