
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
        component: () => import('pages/NotesPage_1141027.vue')
      }
      ,
      { path: 'calendar',name: 'calendar', component: () => import('pages/CalendarPageNew.vue') },
      { path: 'tags', component: () => import('pages/TagsPage.vue') },
      { path: 'formatter', component: () => import('pages/CodeFormatterPage.vue') },
      { path: 'work', component: () => import('pages/WorkLinksPage.vue') },
      { path: 'filetrans', component: () => import('pages/FileToolsPage.vue') },
      { path: 'resume', component: () => import('pages/ResumePage.vue') },
      { path: 'tasks', component: () => import('pages/WorkTasksPage.vue') },
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
