import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router'
import DefaultLayout from '../layouts/DefaultLayout.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: DefaultLayout,
    redirect: '/home',
    children: [
      {
        path: 'home',
        name: 'Home',
        component: () => import('../modules/home/views/HomePage.vue'),
        meta: { title: 'nav.home', icon: 'HomeFilled' },
      },
      {
        path: 'markdown',
        name: 'Markdown',
        component: () => import('../modules/markdown/views/MarkdownPage.vue'),
        meta: { title: 'nav.markdown', icon: 'Edit' },
      },
      {
        path: 'richtext',
        name: 'RichText',
        component: () => import('../modules/richtext/views/RichTextPage.vue'),
        meta: { title: 'nav.richtext', icon: 'Document' },
      },
      {
        path: 'text',
        name: 'Text',
        component: () => import('../modules/text/views/TextPage.vue'),
        meta: { title: 'nav.text', icon: 'Tickets' },
      },
      {
        path: 'spreadsheet',
        name: 'Spreadsheet',
        component: () => import('../modules/spreadsheet/views/SpreadsheetPage.vue'),
        meta: { title: 'nav.spreadsheet', icon: 'Grid' },
      },
      {
        path: 'presentation',
        name: 'Presentation',
        component: () => import('../modules/presentation/views/PresentationPage.vue'),
        meta: { title: 'nav.presentation', icon: 'Present' },
      },
      {
        path: 'pdf',
        name: 'PDF',
        component: () => import('../modules/pdf/views/PDFPage.vue'),
        meta: { title: 'nav.pdf', icon: 'Reading' },
      },
      {
        path: 'converter',
        name: 'Converter',
        component: () => import('../modules/converter/views/ConverterPage.vue'),
        meta: { title: 'nav.converter', icon: 'Connection' },
      },
      {
        path: 'ocr',
        name: 'OCR',
        component: () => import('../modules/ocr/views/OCRPage.vue'),
        meta: { title: 'nav.ocr', icon: 'View' },
      },
      {
        path: 'tools',
        name: 'Tools',
        component: () => import('../modules/tools/views/ToolsPage.vue'),
        meta: { title: 'nav.tools', icon: 'Tools' },
      },
      {
        path: 'system',
        name: 'System',
        component: () => import('../modules/system/views/SystemToolsPage.vue'),
        meta: { title: 'nav.system', icon: 'Monitor' },
      },
      {
        path: 'pim',
        name: 'PIM',
        component: () => import('../modules/pim/views/PimPage.vue'),
        meta: { title: 'nav.pim', icon: 'Calendar' },
      },
      {
        path: 'automation',
        name: 'Automation',
        component: () => import('../modules/automation/views/AutomationPage.vue'),
        meta: { title: 'nav.automation', icon: 'VideoPlay' },
      },
      {
        path: 'notes',
        name: 'Notes',
        component: () => import('../modules/notes/views/NotesPage.vue'),
        meta: { title: 'nav.notes', icon: 'Notebook' },
      },
      {
        path: 'settings',
        name: 'Settings',
        component: () => import('../modules/settings/views/SettingsPage.vue'),
        meta: { title: 'nav.settings', icon: 'Setting' },
      },
    ],
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

export default router
