# devbook-api
Restful API for devbook-client  
  
[![made-with-expressjs](https://img.shields.io/badge/made%20with-express-blue)](https://expressjs.com/)  

**Quick Start**:  
```
# Install dependencies for server
npm install

# Run server
npm run dev

# Server runs on http://localhost:5000 unless your environment specifies another port. 
```   

You will need to create a `.env` file in the project root folder and pass in the data in the following format:  
```
MONGODB_URI="mongodb://<username>:<password>@<mongodb_host_url>:<port>/<db_name>"
SECRET="<secret>"
```
where you need to pass in the appropriate data.  
Note that the `SECRET` can be any alphanumeric string of your choice.  
