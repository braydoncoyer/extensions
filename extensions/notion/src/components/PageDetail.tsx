import {
  ActionPanel,
  Color,
  Icon,
  List,
  Detail,
  FormValues,
  ImageLike,
  preferences,
  showToast,
  ToastStyle,
  setLocalStorageItem,
  getLocalStorageItem,
  getApplications,
  closeMainWindow,
  CopyToClipboardAction,
  PasteAction,
  PushAction,
  ImageMask,
  useNavigation,
  Form,
  SubmitFormAction,
} from '@raycast/api'
import { useEffect, useState } from 'react'
import {
  DatabaseView,
  Page,
  DatabaseProperty,
  DatabasePropertyOption,
  PageContent,
  User,
  searchPages,
  queryDatabase,
  fetchDatabaseProperties,
  fetchPageContent,
  notionColorToTintColor,
  patchPage,
  fetchUsers,
  fetchDatabases
} from '../utils/notion'
import {
  storeRecentlyOpenedPage,
  loadRecentlyOpenedPages,
  storeDatabaseView,
  loadDatabaseView,
  storeDatabases,
  loadDatabases,
  storeDatabaseProperties,
  loadDatabaseProperties,
  storeDatabasePages,
  loadDatabasePages,
  storeUsers,
  loadUsers,
} from '../utils/local-storage'
import {
  ActionSetVisibleProperties,
  CreateDatabaseForm,
  DatabaseViewForm,
  DatabaseKanbanView,
  PageListItem,
} from './'
import moment from 'moment'
import open from 'open'







export function PageDetail (props: { page: Page }): JSX.Element {
  
  const page = props.page 
  const pageName = (page.icon_emoji ? page.icon_emoji+' ': '')+(page.title ? page.title : 'Untitled')

  storeRecentlyOpenedPage(page)

  const [pageContent, setPageContent] = useState<PageContent>()
  const [isLoading, setIsLoading] = useState<boolean>(false)


  // Load page content
  useEffect(() => {
    const getPageContent = async () => {
      
      setIsLoading(true)

      const fetchedPageContent =  await fetchPageContent(page.id)

      if(fetchedPageContent && fetchedPageContent.markdown){
        setPageContent(fetchedPageContent)
      }  

      setIsLoading(false)
    }
    getPageContent()
  }, [])

  async function handleOnOpenPage(page: Page) {
    const openIn = preferences.open_in?.value;
    var isNotionInstalled;
    if(!openIn || openIn === 'app'){
      const installedApplications = await getApplications();
      isNotionInstalled = installedApplications.some(function(app) {
        return app.bundleId === 'notion.id';
      })
    }    
    open((isNotionInstalled ?  page.url.replace('https','notion') : page.url))
    await storeRecentlyOpenedPage(page)
    closeMainWindow();
  }

  return (<Detail 
    markdown={`# ${page.title}\n`+ (pageContent ? pageContent.markdown : '*Loading...*')}
    isLoading={isLoading}
    navigationTitle={' →  '+pageName} 
    actions={            
    <ActionPanel>
      <ActionPanel.Section title={(page.title ? page.title : 'Untitled')}>
        <ActionPanel.Item
          title='Open in Notion'
          icon={'notion-logo.png'}
          onAction={function () { handleOnOpenPage(page) }}/>
      </ActionPanel.Section>      
      <ActionPanel.Section>
        <CopyToClipboardAction
          title='Copy Page URL'
          content={page.url}
          shortcut={{ modifiers: ["cmd","shift"], key: "c" }}/>
        <PasteAction
          title='Paste Page URL'
          content={page.url}
          shortcut={{ modifiers: ["cmd","shift"], key: "v" }}/>
      </ActionPanel.Section>        
    </ActionPanel>
    }/>)
}