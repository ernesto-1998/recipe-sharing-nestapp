# Recipe Sharing Platform

## Entities

### User

```json
{
  "_id": "ObjectId",
  "email": "string",
  "username": "string",
  "password": "string",
  "role": "string",
  "privacy": "public | private",
  "profile": {
    "firstname": "string",
    "lastname": "string",
    "biography": "string",
    "avatar": "string",
    "birthDate": "Date",
    "socialNetworks": {
      "instagram": "string",
      "youtube": "string",
      "x": "string",
      "facebook": "string",
    },
    "address": {
      "country": "string",
    },
  },
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### Recipe

```json
{
  "_id": "ObjectId",
  "userId": "ObjectId",
  "title": "string",
  "description": "string",
  "ingredients": [
    {
      "name": "string",
      "quantity": "string",
      "unit": "kg | gr | onz | pound..."
    }
  ],
  "steps": [
    {
      "order": "number",
      "instruction": "string"
    }
  ],
  "prepTime": "number",
  "portions": "number",
  "category": "string",
  "images": ["string"],
  "tags": ["string"],
  "privacy": "public | private",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### Comment

```json
{
  "_id": "ObjectId",
  "recipeId": "ObjectId",
  "userId": "ObjectId",
  "text": "string",
  "rating": "number",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### Favorite

```json
{
  "_id": "ObjectId",
  "userId": "ObjectId",
  "recipeId": "ObjectId",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### Search_History

```json
{
  "_id": "ObjectId",
  "userId": "ObjectId",
  "query": "string",
  "filters": {
    "ingredients": ["string"],
    "category": "string"
  },
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### Report

```json
{
  "_id": "ObjectId",
  "type": "string", // "receipe" or "comment"
  "referenceId": "ObjectId",
  "userId": "ObjectId",
  "reason": "string",
  "status": "string", // "pending" or "resolved"
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

#### Qualification

```json
{
  "_id": "ObjectId",
  "recipeId": "ObjectId",
  "userId": "ObjectId",
  "score": "number", // from 1 to 5
  "createdAt": "Date",
  "updatedAt": "Date"
}
```
