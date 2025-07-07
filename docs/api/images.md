# Image upload documentation.
These routes make a request to the cloudinary API using the NodeJS SDK.

Documentation here:
https://cloudinary.com/documentation/image_upload_api_reference

# PokeDTI endpoints

# POST /images/upload-profile/:id
## Upload a profile image
`https://mish-backend-25-1.onrender.com/images/upload-profile/1`

Response body example:

```json
{
  "message": "Image uploaded successfully",
  "imageUrl": result.secure_url
}
```

Upload an image onto the "profile" folder in cloudinary.
Returns status code `400` on missing file or invalid id format.
Returns status code `201` on success.

# POST /images/upload-dress/:id
## Upload a pokemon dress image
`https://mish-backend-25-1.onrender.com/images/upload-dress/1`

Response body example:

```json
{
  "message": "Dress image uploaded successfully",
  "imageUrl": result.secure_url
}
```

Upload an image onto the "dress" folder in cloudinary.
Returns status code `400` on missing file or invalid id format.
Returns status code `201` on success.
Returns status code `403` if user is not in a lobby.

# DELETE /images/:id
## Delete an image
`https://mish-backend-25-1.onrender.com/images/delete/1`

Response body example:

```json
{
  "message": "Image deleted successfully"
}
```

Deletes an image from the cloudinary cloud.
Returns status code `404` on not found image
Returns status code `204` on success.
