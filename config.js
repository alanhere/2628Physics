/* Site settings. Safe to edit: change the words between the quote marks. */
window.SITE = {
  title: "5th Year Physics",
  intro: "Lessons, notes, study, investigations, demonstrations and research.",
  ink: "#1D3A9C",   /* the main blue. Try another colour code if you want to change it */
  tabs: [
    { id: "lessons",        label: "Lessons",        file: "lessons.txt",        type: "lesson",        noun: "lessons" },
    { id: "notes",          label: "Notes",          file: "notes.txt",          type: "notes",         noun: "notes" },
    { id: "study", label: "Study", type: "study", sections: [
        { id: "revision", label: "Revision",     file: "revision.txt", folder: "revision", linksHeading: "Resources",              noun: "revision resources" },
        { id: "skills",   label: "Maths skills", file: "skills.txt",   folder: "skills",   linksHeading: "Practice and resources", noun: "maths skills" },
        { id: "sites",    label: "Useful sites", file: "sites.txt",    view: "cards",       noun: "useful sites" }
    ] },
    { id: "investigations", label: "Investigations", file: "investigations.txt", type: "investigation", noun: "investigations" },
    { id: "demos",          label: "Demos",          file: "demos.txt",          type: "demo",          noun: "demonstrations" },
    { id: "research",       label: "Research",       file: "research.txt",       type: "research",      noun: "research pages" }
  ]
};
