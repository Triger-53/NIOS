const express = require('express');
const path = require('path');
const { getAllSubjects, getSubjectData } = require('./lib/data');

const app = express();
const port = 3000;

// Set the view engine to ejs
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Homepage route
app.get('/', async (req, res) => {
  try {
    const subjects = await getAllSubjects();
    res.render('index', { subjects });
  } catch (error) {
    res.status(500).send('Error loading subjects.');
  }
});

// Subjects list page route
app.get('/subjects', async (req, res) => {
  try {
    const subjects = await getAllSubjects();
    res.render('subjects', { subjects });
  } catch (error) {
    res.status(500).send('Error loading subjects.');
  }
});

// Individual subject page route
app.get('/subjects/:slug', async (req, res) => {
  try {
    const slug = req.params.slug;
    const subject = await getSubjectData(slug);
    if (subject) {
      const lessons = subject.content.lessons || subject.content[slug] || [];
      res.render('subject', { subject, lessons });
    } else {
      res.status(404).send('Subject not found.');
    }
  } catch (error) {
    res.status(500).send('Error loading subject data.');
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});