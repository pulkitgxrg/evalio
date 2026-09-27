<div align="center">
 <img alt="evalio" width="200px" height="auto" src="https://raw.githubusercontent.com/pulkitgxrg/evalio/main/evalio.png">
</div>
<p align="center">Exam preparation platform for Chitkara CSE Students</p>
<br>

**Evalio** is an interactive examination platform that helps students practice subject-specific question banks, take practice tests, and track their academic performance.

### Features

- **Curriculum-Based:** Access subjects specific to your academic year.
- **Interactive Testing Engine:** Take custom timed tests categorized by difficulty with an interactive UI.
- **Question Bank:** Dive into specific topics in either **Practice Mode** (with immediate answer feedback) or **Revision Mode** (with correct answers highlighted).
- **Session Tracking:** Don't lose progress if you accidentally close the test—sessions are managed server-side and automatically summarize expired attempts. 
- **Admin Management:** Add users, map curricula by subjects/years, and build tests & question items dynamically.

### Getting Started

#### Prerequisites 
- Node.js (v18+)
- MongoDB connection string
- Redis server instance

#### Environment Setup
Create a `.env` file in both `client/` and `server/` directories using their respective `sample.env` files as templates.

#### Running Locally

**Install dependencies:**
```bash
# In the root, for git hooks
npm install

# In the client folder
cd client
npm install

# In the server folder 
cd ../server
npm install
```

**Start the Development Servers:**
You can run these in two separate terminal tabs:

*Server:*
```bash
cd server
npm start
```

*Client:*
```bash
cd client
npm run dev
```

Your Next.js dashboard will be available on `http://localhost:3000` and the API will listen on your specified `.env` backend port.

### Changelog

Refer to [CHANGELOG](CHANGELOG.md) for version history and updates.

### Contributing

If you're interested in contributing to Evalio, please read our [contributing docs](./CONTRIBUTING.md) before submitting a pull request. Your contributions help us improve and grow. Please feel free to submit pull requests, report issues, or suggest new features. Your feedback and participation are highly valued as we continue to develop and enhance the platform.

### License

Evalio is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
