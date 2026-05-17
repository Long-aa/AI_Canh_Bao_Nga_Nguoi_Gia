import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

class SupabaseStorage:
    def __init__(self):
        self.url = os.getenv("SUPABASE_URL")
        self.key = os.getenv("SUPABASE_KEY")
        self.bucket_name = os.getenv("SUPABASE_BUCKET", "alerts")
        self.client = None
        
        if self.url and self.key:
            try:
                # Initialize Supabase client
                self.client = create_client(self.url, self.key)
                print(f"Connected to Supabase project: {self.url}")
                
                # Check if bucket exists, if not attempt to create it as public
                try:
                    self.client.storage.get_bucket(self.bucket_name)
                except Exception:
                    try:
                        print(f"Bucket '{self.bucket_name}' not found. Attempting to create it as public...")
                        self.client.storage.create_bucket(self.bucket_name, options={"public": True})
                        print(f"Bucket '{self.bucket_name}' created successfully as PUBLIC.")
                    except Exception as create_err:
                        print(f"Could not auto-create bucket: {create_err}")
            except Exception as e:
                print(f"Failed to connect to Supabase: {e}")
        else:
            print("Warning: SUPABASE_URL and SUPABASE_KEY are not configured in environment variables.")

    def upload_file(self, local_path, remote_name):
        if not self.client:
            print("Supabase client not initialized. Cannot upload.")
            return None
        
        try:
            print(f"Uploading {local_path} to Supabase bucket '{self.bucket_name}' as {remote_name}...")
            # Clean remote path to avoid double slashes and leading slashes
            clean_remote_path = remote_name.lstrip('/')
            
            with open(local_path, "rb") as f:
                self.client.storage.from_(self.bucket_name).upload(
                    file=f,
                    path=clean_remote_path,
                    file_options={"cache-control": "3600", "upsert": "true"}
                )
            
            # Generate the public URL
            public_url = self.client.storage.from_(self.bucket_name).get_public_url(clean_remote_path)
            print(f"Uploaded successfully to Supabase: {public_url}")
            return public_url
        except Exception as e:
            print(f"Error uploading to Supabase: {e}")
            return None

# Singleton instance
cloud_storage = SupabaseStorage()
