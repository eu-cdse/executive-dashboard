import boto3
import json
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Constants for the script
FILENAME = "codelist.json"
AWS_ACCESS_KEY_ID = os.getenv('S3_ACCESS_KEY_ID')
AWS_SECRET_ACCESS_KEY = os.getenv('S3_ACCESS_KEY')
AWS_BUCKET = os.getenv('S3_BUCKET')
ENDPOINT_URL = os.getenv('S3_URL')

def upload_json_to_s3(filename, bucket, endpoint_url):
    """Uploads a JSON file to an S3 bucket using the provided credentials."""
    # Path to the JSON file
    local_json_path = os.path.join(os.getcwd(), filename)

    # Create an S3 resource object
    s3 = boto3.resource('s3',
                        aws_access_key_id=AWS_ACCESS_KEY_ID,
                        aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
                        endpoint_url=endpoint_url)

    # Read and upload the JSON file
    try:
        with open(local_json_path, 'rb') as json_file:  # Open file as binary to skip encoding
            s3.Bucket(bucket).put_object(Key=filename, Body=json_file)
        print(f"Successfully uploaded {filename} to S3.")
    except FileNotFoundError:
        print(f"Error: The file {filename} does not exist.")
    except Exception as e:
        print(f"An error occurred: {e}")

# Invoke the function to upload file
upload_json_to_s3(FILENAME, AWS_BUCKET, ENDPOINT_URL)
