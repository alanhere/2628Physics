5th Year Physics - website guide
================================

This is a simple website you edit by changing plain text files. There is no code to write.

WHAT IS IN THIS FOLDER
index.html, style.css, app.js   The website itself. Please leave these alone.
config.js                       The site title and main colour. Safe to edit.
lessons.txt                     Your lessons. You edit this every day.
notes.txt                       Your guided notes, grouped by topic.
revision.txt                    Revision resources, grouped by topic (Study tab, Revision).
skills.txt                      Maths skills, grouped by topic (Study tab, Maths skills).
sites.txt                       Useful websites (Study tab, Useful sites).
investigations.txt              Your investigations.
demos.txt                       Your demonstrations.
research.txt                    Your research pages.
revision/                       Revision PDFs go in this folder.
skills/                         Maths skills PDFs go in this folder.
photos/                         Your board photos go in this folder.
notes/                          Your guided notes PDFs go in this folder.
README.txt                      This guide.

PART 1 - Put it online (once, about 20 minutes)
1. Go to github.com and create a free account.
2. Click the + at the top right, then New repository. Give it a short name such as physics, choose Public, and click Create repository.
3. On the next page, click the link that says "uploading an existing file".
4. Open this folder on your computer. Select everything inside it, including the photos folder, and drag it onto the page. Wait for the upload to finish, then click Commit changes.
5. Click Settings, then Pages in the left-hand menu. Under "Build and deployment", set Source to "Deploy from a branch". Choose the branch main and the folder / (root), then click Save.
6. Wait a minute or two, then refresh the Pages screen. The address of your site appears at the top. It will look like https://yourusername.github.io/physics/
7. Open that address on your phone to check it, then give it to your students.

Note: free GitHub sites are public. Anyone with the address can see them. That is fine for class notes, but never put student names or marks on the site.

PART 2 - Where your files go
Photos and guided notes live on GitHub, in this site. Homework and solutions stay on Google Drive, so you decide when students can see them.

A. Board photos (on GitHub, from your Mac)
1. Select the photos in Finder. Right-click, choose Quick Actions, then Convert Image.
2. Set Format to JPEG and Image Size to Medium (or Small if you want them even lighter), then click Convert. This also fixes iPhone photos, which are HEIC files. You now have lighter copies next to the originals.
3. Rename them with the date and no spaces, for example 2026-10-08-1.jpg and 2026-10-08-2.jpg.
4. On GitHub, open the photos folder, click Add file, then Upload files, drag the photos in and click Commit changes.
5. On the lesson, write the names on the photos line: photos: 2026-10-08-1.jpg, 2026-10-08-2.jpg
Aim for under 1 MB per photo. A few hundred KB is plenty for a board.

B. Guided notes (on GitHub)
1. Give the PDF a short name with no spaces, such as chapter-7.pdf.
2. Open the notes folder, click Add file, then Upload files, drag the PDF in and click Commit changes.
3. In notes.txt, write: notes: chapter-7.pdf
4. To add the completed version later, upload it under a new name, such as chapter-7-completed.pdf, and add the line: completed: chapter-7-completed.pdf
To link the notes from a lesson, add: notes: Guided notes, chapter 7 | chapter-7.pdf

C. Homework and solutions (on Google Drive)
Set up once:
1. In Drive, make a folder such as Maths Homework.
2. Right-click it, choose Share, and under General access choose Anyone with the link, with the role Viewer. Click Done. Files inside should then be viewable by anyone with their link.
Each time:
1. Upload the file to that folder.
2. Right-click the file, choose Share, then Copy link.
3. Paste the whole link on the homework or solutions line of lessons.txt. Paste a solutions link only when you are ready for students to see it.

Things to check:
- Names must match exactly, including capital letters and the ending. 2026-10-08-1.JPG is not the same as 2026-10-08-1.jpg.
- Everything in the photos and notes folders is public, and so is its history on GitHub. Only put things there that you are happy for anyone to see, and never solutions you want to hold back.
- GitHub sites work best under about 1 GB. At roughly 0.4 MB a photo, three photos a lesson for 180 lessons is about 220 MB, which is fine.
- Photos can also be Google Drive links, if you ever want that. Each photo needs its own link, and its sharing must be Anyone with the link.
- Do not put student names or marks in anything you share this way.

PART 3 - Add a lesson (every day, 3 to 5 minutes)
1. Upload any photos or notes (Part 2), and copy the Drive links for homework and solutions.
2. On the main page of your repository, click lessons.txt, then the pencil icon to edit it.
3. Copy a whole lesson, from its date line to its last line, and paste it underneath. Change the date, title, links and photo names.
4. Click Commit changes, then Commit again. The site updates within about a minute.

Investigations, demonstrations and research work the same way. Edit investigations.txt, demos.txt or research.txt. Each file has a template at the top that you can copy.


GUIDED NOTES LINES (notes.txt)
date        Required. The day you gave the notes out. Sets the order and is not shown.
title       Required.
topic       The heading the notes are grouped under. Use the same spelling each time.
about       One line describing the notes.
notes       The PDF file name from the notes folder, like chapter-7.pdf.
completed   Optional. The file name of the completed version.

LESSON LINES (lessons.txt)
date        Required. Written 2026-10-08.
title       Required. The name of the lesson.
homework    Tonight's homework. Write: what to do | Drive link
photos      Board photo file names, separated by commas, like 2026-10-08-1.jpg
solutions   Drive link to last night's solutions.
q           Optional. One line per question: q: 1 | link
video       Write: title | YouTube link. It plays on the page.
notes       Optional. Write: description | chapter-7.pdf. Adds a Guided notes button.

INVESTIGATION LINES (investigations.txt)
date, title   Required.
aim           One sentence.
equipment     Items separated by semicolons.
method        A line ending with a colon, then one line per step starting with a dash.
photos        Set-up photo names, separated by commas.
table         Column titles separated by |, for example: Extension (cm) | Force (N)
row           One line per row of results, separated by |
graph         Write yes to draw a graph from the table.
fit           origin, line or none. Draws a line of best fit.
conclusion    A few sentences.

REVISION AND MATHS SKILLS LINES (revision.txt and skills.txt)
date, title   Required. The date only sets the order within a topic. It is not shown.
topic         The heading it is grouped under. Use the same spelling each time.
about         One or two sentences.
explain       The idea in words. Repeat the line for more paragraphs.
example       A worked example, one line per step. Repeat the line.
video         title | YouTube link
link          Button label | PDF file name or full link. Repeat the line for more buttons.
              A PDF file name means a file in the revision folder (revision.txt) or the skills folder (skills.txt).

USEFUL SITES LINES (sites.txt)
date, title   Required. The date only sets the order within a heading. It is not shown.
topic         The heading it is listed under, such as Simulations or Practice questions.
about         One line on what the site is good for.
link          Button label | web address. Add a second link line for a second button.

DEMONSTRATION LINES (demos.txt)
date, title   Required.
video         title | YouTube link
photos        Optional.
notice        What to look for. Repeat the line for more paragraphs.
physics       The explanation. Repeat the line for more paragraphs.

RESEARCH LINES (research.txt)
date, title   Required.
question      The question.
found         A paragraph of findings. Repeat the line for more.
sources       title | link. Repeat the line for more.
further       A challenge for students who want to go further.

USEFUL EXTRAS
- Send a student straight to one entry by adding its date to the address, for example
  https://yourusername.github.io/physics/#lessons/2026-10-08
- The newest lesson is marked "new" automatically.
- Only the latest 8 entries show at first. Students tap "Show earlier" to see more, so the page stays short.
- To change the site title, intro or main blue, open config.js and edit the words.

IF SOMETHING LOOKS WRONG
- A red note at the bottom of a page means an entry was skipped. Check it has a title and a date written like 2026-10-08.
- A photo that shows "Photo not uploaded yet" means the file name does not match, or the photo is not in the photos folder yet.
- A video that shows only a link needs a full YouTube address, such as https://www.youtube.com/watch?v=XXXXXXXXXXX or https://youtu.be/XXXXXXXXXXX
- If the site does not change after you commit, wait a minute and refresh. If it still has not changed, check the Actions tab on GitHub for a green tick.
- Made a mistake? On the file, click History, then pick an earlier version to copy back.
