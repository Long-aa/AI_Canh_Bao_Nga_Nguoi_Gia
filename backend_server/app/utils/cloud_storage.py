import os
from b2sdk.v2 import InMemoryAccountInfo, B2Api
from dotenv import load_dotenv

load_dotenv()

class B2Storage:
    def __init__(self):
        self.endpoint = os.getenv("B2_ENDPOINT") # Optional
        self.key_id = os.getenv("B2_KEY_ID")
        self.application_key = os.getenv("B2_APPLICATION_KEY")
        self.bucket_name = os.getenv("B2_BUCKET_NAME")
        
        self.info = InMemoryAccountInfo()
        self.b2_api = B2Api(self.info)
        self.bucket = None
        
        if self.key_id and self.application_key:
            try:
                self.b2_api.authorize_account("production", self.key_id, self.application_key)
                self.bucket = self.b2_api.get_bucket_by_name(self.bucket_name)
                print(f"Connected to Backblaze B2 bucket: {self.bucket_name}")
            except Exception as e:
                print(f"Failed to connect to Backblaze B2: {e}")

    def upload_file(self, local_path, remote_name):
        if not self.bucket:
            print("B2 Bucket not initialized. Cannot upload.")
            return None
        
        try:
            print(f"Uploading {local_path} to B2 as {remote_name}...")
            self.bucket.upload_local_file(
                local_file=local_path,
                file_name=remote_name,
            )
            # Generate a public URL (assuming the bucket is public or has a friendly URL)
            # Standard B2 public URL pattern: https://f000.backblazeb2.com/file/bucket-name/file-name
            # Note: The 'f000' part varies. Users usually use a custom domain or the S3 endpoint.
            # For simplicity, we'll return a placeholder or use the S3 compatible URL if possible.
            # Let's try to get the download URL if available.
            return f"https://{self.bucket_name}.s3.us-east-005.backblazeb2.com/{remote_name}" 
        except Exception as e:
            print(f"Error uploading to B2: {e}")
            return None

# Singleton instance
cloud_storage = B2Storage()
