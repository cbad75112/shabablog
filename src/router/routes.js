import MainLayout from 'layouts/MainLayout.vue'
import HomePage from 'pages/HomePage.vue'
import BlogPage from 'pages/BlogPage.vue'
import NotesPage from 'pages/NotesPage.vue'
import CalendarPage from 'pages/CalendarPageNew.vue'
import TagsPage from 'pages/TagsPage.vue'
import CodeFormatterPage from 'pages/CodeFormatterPage.vue'
import WorkLinksPage from 'pages/WorkLinksPage.vue'
import FileToolsPage from 'pages/FileToolsPage.vue'
import ResumePage from 'pages/ResumePage.vue'
import WorkTasksPage from 'pages/WorkTasksPage.vue'
import AboutPage from 'pages/AboutPage.vue'
import ErrorNotFound from 'pages/ErrorNotFound.vue'

const routes = [
  {
    path: '/',
    component: MainLayout,
    children: [
      { path: '', component: HomePage },
      { path: 'blog', component: BlogPage },
      { path: 'notes', name: 'notes', component: NotesPage },
      { path: 'calendar', name: 'calendar', component: CalendarPage },
      { path: 'tags', component: TagsPage },
      { path: 'formatter', component: CodeFormatterPage },
      { path: 'work', component: WorkLinksPage },
      { path: 'filetrans', component: FileToolsPage },
      { path: 'resume', component: ResumePage },
      { path: 'tasks', component: WorkTasksPage },
      { path: 'about', component: AboutPage }
    ]
  },
  { path: '/:catchAll(.*)*', component: ErrorNotFound }
]

export default routes
