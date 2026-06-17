# MongoDB seed files

Import tung collection bang `mongoimport`:

```bash
mongoimport --uri "mongodb://127.0.0.1:27017/viecnhanh" --collection users --file users.json --jsonArray
mongoimport --uri "mongodb://127.0.0.1:27017/viecnhanh" --collection employerprofiles --file employerProfiles.json --jsonArray
mongoimport --uri "mongodb://127.0.0.1:27017/viecnhanh" --collection candidateprofiles --file candidateProfiles.json --jsonArray
mongoimport --uri "mongodb://127.0.0.1:27017/viecnhanh" --collection categories --file categories.json --jsonArray
mongoimport --uri "mongodb://127.0.0.1:27017/viecnhanh" --collection jobposts --file jobPosts.json --jsonArray
mongoimport --uri "mongodb://127.0.0.1:27017/viecnhanh" --collection applications --file applications.json --jsonArray
mongoimport --uri "mongodb://127.0.0.1:27017/viecnhanh" --collection orders --file orders.json --jsonArray
mongoimport --uri "mongodb://127.0.0.1:27017/viecnhanh" --collection payments --file payments.json --jsonArray
mongoimport --uri "mongodb://127.0.0.1:27017/viecnhanh" --collection complaints --file complaints.json --jsonArray
mongoimport --uri "mongodb://127.0.0.1:27017/viecnhanh" --collection operationtasks --file operationTasks.json --jsonArray
```
