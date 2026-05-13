# Cloudinary Delete Function

This function deletes Cloudinary images after the web app removes the last reference to a photo.

Firebase Functions and Secret Manager require the Firebase project to be on the Blaze plan.
After upgrading, configure:

```bash
firebase functions:secrets:set CLOUDINARY_API_SECRET
```

Then add `CLOUDINARY_CLOUD_NAME` and `CLOUDINARY_API_KEY` to the Functions environment, add a Hosting rewrite for `/api/cloudinary/delete-photo` to `deleteCloudinaryPhoto`, deploy functions, and set:

```bash
VITE_CLOUDINARY_DELETE_ENDPOINT=/api/cloudinary/delete-photo
```
