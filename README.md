# Semester in Innovation: Designing SFU Mobile - Course Projects
===================================================
3 Separate web projects running on a common Nodejs backend, created and designed by a select group of SFU ComSci, SIAT and Business students during the summer of 2012. The goal of these projects is to develop new applications for learning that fit well into a mobile context.

## Project Descriptions
Accent: A video uploading and tagging service that allows users to tag segments of lecture videos and share these tagged segments with other users.

Engage: An online resource sharing service that enables students to share various web resources such as online news articles.

RealQuestionsRealAnswers: A question and answering site where students can post questions related to courses they are enrolled in and other students or instructors can answer their questions.

## Setup Instructions
below are the instructors for checking out the project and getting it to run on your local machine:
 - checkout the git repository
 - install node packages
  - navigate the root directory of the project and type: "npm install"
 - install, configure and start the required 3 database servers
  - elastic search
  - redis
  - mysql
 - update the config file
  - make a copy of the file config.json.defaults and name it config.json
  - update the settings in the config file to match the settings of the previously installed databases
 - run database creation and test data insertion scripts
  - mysql:
   - to remove any previous mysql tables run: "node database/drop-db.js"
   - to create new mysql tables run: "node database/create-db.js"
   - to insert the test data found in test-data.json run: "node database/insert-data.js"
  - elastic search
   - to remove all and re-insert test data from qs.json simply run: "node database/es-insert.js"
  - redis
   - to insert data run: "node database/dict_to_db.js"
 - at this pointer you are ready to run any of the three servers. Each server has its own run file which can be run with: "node run_<projectname>.js"
 - to view the project open a web browser to: "http://localhost:<project port number>/" (note: the port number of each project is defined in the config.json file)
 
## Helpful Resources:
One resource we found helpful for viewing the contents of a running elastic search server is the follow elastic search browser base UI interface:
* [ES GUI](https://github.com/mobz/elasticsearch-head)