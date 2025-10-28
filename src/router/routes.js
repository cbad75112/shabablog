
import ResumePage  from "pages/ResumePage.vue"
import CalendarPageNew  from "pages/CalendarPageNew.vue"

const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/HomePage.vue') }, // 首頁
      { path: 'blog', component: () => import('pages/BlogPage.vue') },
      {
        path: '/notes',
        name: 'notes',
        component: () => import('pages/NotesPage.vue')
      }
      ,
      { path: 'calendar',name: 'calendar', component:CalendarPageNew,
      { path: 'tags', component: () => import('pages/TagsPage.vue') },
      { path: 'formatter', component: () => import('pages/CodeFormatterPage.vue') },
      { path: 'work', component: () => import('pages/WorkLinksPage.vue') },
      { path: 'filetrans', component: () => import('pages/FileToolsPage.vue') },
      { path: 'resume', component: ResumePage,
      { path: 'tasks', component: () => import('pages/WorkTasksPage.vuFe') },
      { path: 'about', component: () => import('pages/AboutPage.vue') }
      
    ]
  },

  // 錯誤處理頁面（保留）
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes
