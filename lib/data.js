const fs = require('fs/promises');
const path = require('path');

const subjectsDirectory = process.cwd();

function toTitleCase(str) {
  return str.replace(/\w\S*/g, (txt) => {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
}

async function getAllSubjects() {
  try {
    const allFiles = await fs.readdir(subjectsDirectory);
    const subjectFiles = allFiles.filter(
      (file) =>
        file.endsWith('.json') &&
        !['package.json', 'package-lock.json'].includes(file)
    );

    const allSubjectsData = await Promise.all(
      subjectFiles.map(async (fileName) => {
        const slug = fileName.replace(/\.json$/, '');
        const filePath = path.join(subjectsDirectory, fileName);
        const fileContents = await fs.readFile(filePath, 'utf8');
        const data = JSON.parse(fileContents);

        let lessonArray = [];
        const potentialLessons = data[slug];
        if (Array.isArray(potentialLessons)) {
          lessonArray = potentialLessons;
        }

        const description =
          data.description ||
          (data.lessons && data.lessons[0]?.objectives?.[0]) ||
          (lessonArray.length > 0 && lessonArray[0]?.objectives?.[0]) ||
          'Notes and materials for this subject.';

        return {
          slug,
          title: toTitleCase(slug.replace(/-/g, ' ')),
          description: description,
        };
      })
    );

    return allSubjectsData;
  } catch (error) {
    console.error('Error in getAllSubjects:', error);
    return [];
  }
}

async function getSubjectData(slug) {
  const filePath = path.join(subjectsDirectory, `${slug}.json`);

  try {
    const fileContents = await fs.readFile(filePath, 'utf8');
    const data = JSON.parse(fileContents);

    let lessonArray = [];
    const potentialLessons = data[slug];
    if (Array.isArray(potentialLessons)) {
      lessonArray = potentialLessons;
    }

    const description =
      data.description ||
      (data.lessons && data.lessons[0]?.objectives?.[0]) ||
      (lessonArray.length > 0 && lessonArray[0]?.objectives?.[0]) ||
      'Notes and materials for this subject.';

    return {
      slug,
      title: toTitleCase(slug.replace(/-/g, ' ')),
      description: description,
      content: data,
    };
  } catch (error) {
    console.error(`Error reading or parsing subject data for ${slug}:`, error);
    return null;
  }
}

module.exports = {
  getAllSubjects,
  getSubjectData,
};