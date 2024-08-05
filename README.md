# Invoice Processing System

This is a front-end and back-end separated system for processing invoices. The project is built using Django for the back-end and React for the front-end.

# Youtube Link
[Watch this YouTube video](https://youtu.be/d_gEXpEqzzs?si=C7J7IeVG1A-fNGrn)

## Table of Contents

- [Project Structure](#project-structure)
- [Installation](#installation)
- [Usage](#usage)
- [Technologies](#technologies)
- [Contribution](#contribution)
- [License](#license)

## Project Structure
```
project
│   README.md
│   .gitignore
|   .DS_Store
|   problems_solutions.md
│
└───InvoiceProcessing/
│   │   Dockerfile
│   │   db.sqlite3
|   |   docker-compose.yml
│   │   manage.py
|   |   requirements.txt
|   |
│   └───invoice/
│       │   models.py
│       │   test.py
│       │   ...
│   
└───front-end/
    │   file021.txt
    │   file022.txt
```
## Installation

### Back-end Installation
1. Clone the repository:
    ```sh
    git clone https://github.com/yourusername/InvoiceProcessing.git

    ```
2. Enter this project
   ```sh
   cd capstone-project-9900f14awellp
   ```
3. Enter the back-end

   ```sh
   cd InvoiceProcessing
   ```
   
4. Use Docker to build image
   ```sh
   docker-compose up --build
   ```

5. Initiate docker image
   ```sh
   docker-compose up
   ```

5. Access API documentation
   http://127.0.0.1:8000/invoice/swagger/


### Front-end Installation (open up another command line terminal )

1. Navigate to the front-end directory:
    ```sh
    cd front-end
    ```

2. Install the dependencies:
    ```sh
    npm install
    ```

3. Start the React development server:
    ```sh
    npm start
    ```

4. Front End Testing
   ```sh
   npm test
   ```
## Usage

1. Ensure the back-end server is running on `http://localhost:8000`.
2. Ensure the front-end server is running on `http://localhost:3000`.
3. Open `http://localhost:3000` in your browser to use the application.


## Technologies

- **Back-end**: Django, Django REST Framework, SQLite
- **Front-end**: React, Redux, Axios
  
## Contribution

1. Fork the repository.
2. Create a new branch (`git checkout -b feature-branch`).
3. Commit your changes (`git commit -am 'Add some feature'`).
4. Push to the branch (`git push origin feature-branch`).
5. Create a new Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
