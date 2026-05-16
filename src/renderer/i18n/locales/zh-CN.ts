export default {
  app: {
    title: '秋徐晨 · 离线办公助手',
  },
  nav: {
    home: '首页',
    markdown: 'Markdown 编辑器',
    richtext: '富文本编辑器',
    text: '纯文本编辑器',
    spreadsheet: '电子表格',
    presentation: '演示文稿',
    pdf: 'PDF 工具',
    converter: '文件转换',
    ocr: 'OCR 识别',
    tools: '辅助工具',
    system: '系统工具',
    pim: '个人信息管理',
    automation: '自动化',
    notes: '笔记',
    settings: '设置',
  },
  common: {
    comingSoon: '功能开发中，敬请期待...',
    save: '保存',
    cancel: '取消',
    confirm: '确认',
    delete: '删除',
    loading: '加载中...',
    close: '关闭',
    copy: '复制',
    clear: '清空',
    copied: '已复制到剪贴板',
    noData: '暂无数据',
    seconds: '秒',
    bytes: '字节',
    characters: '字符',
    words: '词',
    lines: '行',
    paragraphs: '段落',
    enabled: '启用',
    disabled: '禁用',
    reset: '重置',
    browse: '浏览',
    apply: '应用',
    actions: '操作',
    search: '搜索',
    preview: '预览',
    welcome: '欢迎',
    quickAccess: '快捷访问',
    recentActivity: '最近活动',
    noRecentActivity: '暂无最近活动',
    summary: '摘要',
    modules: '个模块',
    status: '状态',
    settings: '设置',
    rename: '重命名',
    encrypt: '加密',
    decrypt: '解密',
    input: '输入',
    output: '输出',
    process: '处理',
    record: '录制',
    stop: '停止',
    play: '播放',
    edit: '编辑',
    run: '运行',
    name: '名称',
    type: '类型',
    size: '大小',
    date: '日期',
    notes: '备注',
    add: '添加',
    remove: '移除',
    filter: '筛选',
    all: '全部',
    none: '无',
    unsaved: '未保存',
  },
  markdown: {
    preview: {
      title: '预览',
    },
    stats: {
      words: '字数',
      chars: '字符',
      lines: '行数',
    },
    toolbar: {
      save: '保存',
      exportHtml: '导出 HTML',
      exportPdf: '导出 PDF',
      bold: '加粗',
      italic: '斜体',
      heading: '标题',
      code: '代码',
      link: '链接',
      image: '图片',
      list: '列表',
      table: '表格',
    },
  },
  richtext: {
    newDoc: '新建文档',
    openFile: '打开文件',
    save: '保存',
    exportHtml: '导出 HTML',
    undo: '撤销',
    redo: '重做',
    bold: '加粗',
    italic: '斜体',
    underline: '下划线',
    strikethrough: '删除线',
    fontSize: '字号',
    textColor: '文字颜色',
    alignLeft: '左对齐',
    alignCenter: '居中对齐',
    alignRight: '右对齐',
    justify: '两端对齐',
    unorderedList: '无序列表',
    orderedList: '有序列表',
    insertLink: '插入链接',
    insertImage: '插入图片',
    insertTable: '插入表格',
    linkUrl: '链接地址',
    linkText: '链接文本',
    imageUrl: '图片地址',
    tableRows: '行数',
    tableCols: '列数',
    clearFormat: '清除格式',
    placeholder: '开始输入...',
    words: '字数',
    chars: '字符数',
  },
  pdf: {
    openFile: '打开 PDF',
    noDocument: '请打开一个 PDF 文件',
    previousPage: '上一页',
    nextPage: '下一页',
    firstPage: '第一页',
    lastPage: '最后一页',
    pageInput: '跳转到页',
    pageOf: '/',
    zoomIn: '放大',
    zoomOut: '缩小',
    zoomReset: '重置缩放',
    zoomFitWidth: '适应宽度',
    zoomFitPage: '适应页面',
    thumbnails: '缩略图',
    toggleThumbnails: '显示/隐藏缩略图',
    fileInfo: '文件信息',
    fileName: '文件名',
    fileSize: '文件大小',
    pages: '页数',
    loadError: '加载 PDF 失败',
    closeDocument: '关闭文档',
    dragTip: '拖拽 PDF 文件到此处',
  },
  text: {
    openFile: '打开文件',
    saveFile: '保存文件',
    undo: '撤销',
    redo: '重做',
    undoTip: '撤销 (Ctrl+Z)',
    redoTip: '重做 (Ctrl+Y)',
    findReplace: '查找替换',
    language: '语言',
    plainText: '纯文本',
    javascript: 'JavaScript',
    typescript: 'TypeScript',
    html: 'HTML',
    css: 'CSS',
    python: 'Python',
    json: 'JSON',
    words: '字数',
    lines: '行数',
    chars: '字符',
    untitled: '未命名',
    placeholder: '在此输入文本或代码...',
    fileOpened: '文件已打开',
    fileSaved: '文件已保存',
    openError: '打开文件失败',
    saveError: '保存文件失败',
    languageSwitched: '已切换语言',
  },
  tools: {
    clipboard: {
      title: '剪贴板历史',
      pasteFromClipboard: '从剪贴板粘贴',
      clear: '清空历史',
      empty: '暂无剪贴板记录',
    },
    colorPicker: {
      title: '颜色选择器',
      pick: '选择颜色',
    },
    charCounter: {
      title: '字符统计',
      input: '在此输入或粘贴文本...',
      characters: '字符数',
      charactersNoSpaces: '字符数（不含空格）',
      words: '词数',
      lines: '行数',
      paragraphs: '段落数',
      bytes: '字节数',
      sentences: '句子数',
    },
    calculator: {
      title: '计算器',
      clear: 'C',
      error: '错误',
    },
    regexTester: {
      title: '正则表达式测试器',
      patternPlaceholder: '输入正则表达式，例如 \\d+',
      testPlaceholder: '输入测试文本...',
      matchCount: '匹配 {count} 项',
      noMatch: '无匹配结果',
    },
    encryption: {
      title: '加密/解密',
      encrypt: '加密',
      decrypt: '解密',
      swap: '交换',
      passwordPlaceholder: '输入密码',
      inputPlaceholder: '输入原文...',
      outputPlaceholder: '输出结果...',
      passwordRequired: '请输入密码',
      error: '操作失败',
    },
    todo: {
      title: '待办事项',
      placeholder: '添加新任务...',
      filterAll: '全部',
      filterActive: '进行中',
      filterDone: '已完成',
      clearDone: '清除已完成',
      empty: '暂无待办事项',
    },
    screenshot: {
      title: '截图工具',
      hint: '截图功能需要 Electron 原生支持',
      hotkeyLabel: '快捷键',
      capture: '开始截图',
      captured: '截图已保存',
      failed: '截图失败',
      copied: '已复制到剪贴板',
      saved: '已保存',
      saveFailed: '保存失败',
      copy: '复制到剪贴板',
      save: '保存到文件',
      history: '截图历史',
      noHistory: '暂无截图记录',
    },
    voiceToText: {
      title: '语音转文字',
      recording: '录音中...',
      idle: '点击按钮开始录音',
      transcript: '转录文本',
      transcriptPlaceholder: '转录结果将显示在这里...',
      history: '转录历史',
      listening: '正在聆听...',
      micDenied: '麦克风权限被拒绝，请在系统设置中允许',
      notSupported: '当前环境不支持语音识别',
      error: '语音识别出错',
    },
  },
  system: {
    title: '系统工具',
    search: {
      title: '文件搜索',
      directory: '搜索目录',
      dirPlaceholder: '选择或输入目录路径',
      pattern: '文件匹配',
      patternPlaceholder: '*.txt, *.js',
      filename: '文件名',
      path: '路径',
      size: '大小',
      modified: '修改时间',
      results: '搜索结果',
      noResults: '未找到匹配文件',
      searching: '搜索中...',
      action: '操作',
    },
    image: {
      title: '图片处理',
      select: '选择图片',
      loadImage: '加载图片',
      noImage: '请先加载一张图片',
      resize: '调整大小',
      width: '宽度',
      height: '高度',
      rotate: '旋转',
      flip: '翻转',
      flipH: '水平翻转',
      flipV: '垂直翻转',
      flipHorizontal: '水平翻转',
      flipVertical: '垂直翻转',
      saveImage: '保存图片',
      info: '图片信息',
      dimensions: '尺寸',
      format: '格式',
      size: '文件大小',
    },
    rename: {
      title: '批量重命名',
      selectFiles: '选择文件',
      noFiles: '请先选择文件',
      findReplace: '查找替换',
      prefixSuffix: '前缀/后缀',
      find: '查找',
      replace: '替换',
      prefix: '添加前缀',
      suffix: '添加后缀',
      numbering: '编号',
      startNum: '起始编号',
      digits: '位数',
      preview: '预览',
      apply: '应用重命名',
      success: '重命名完成',
      error: '重命名失败',
      original: '原名',
      newName: '新名',
      newname: '新名',
    },
    dict: {
      title: '词典查询',
      searchPlaceholder: '输入单词...',
      lookup: '查询',
      result: '查询结果',
      noResult: '未找到结果',
      history: '查询历史',
      definition: '释义',
      example: '示例',
      emptyHint: '输入单词开始查询',
    },
  },
  pim: {
    title: '个人信息管理',
    calendar: {
      title: '日历',
      selectDay: '选择日期查看事件',
      today: '今天',
      addEvent: '添加事件',
      editEvent: '编辑事件',
      eventTitle: '事件标题',
      eventTime: '时间',
      eventDesc: '描述',
      eventDate: '日期',
      eventColor: '颜色',
      noEvents: '当天无事件',
      sun: '日',
      mon: '一',
      tue: '二',
      wed: '三',
      thu: '四',
      fri: '五',
      sat: '六',
    },
    contacts: {
      title: '联系人',
      add: '添加联系人',
      addContact: '添加联系人',
      edit: '编辑联系人',
      editContact: '编辑联系人',
      name: '姓名',
      phone: '电话',
      email: '邮箱',
      address: '地址',
      notes: '备注',
      favorite: '收藏',
      search: '搜索联系人',
      noContacts: '暂无联系人',
      group: '分组',
    },
    stickynotes: {
      title: '便签',
      add: '新增便签',
      addNote: '新增便签',
      deleteNote: '删除便签',
      placeholder: '在此输入...',
      empty: '暂无便签',
      emptyHint: '还没便签，点击添加',
    },
  },
  automation: {
    title: '自动化',
    macro: {
      title: '宏录制',
      record: '录制',
      recording: '录制中...',
      stopped: '已停止',
      stop: '停止录制',
      play: '播放',
      clear: '清除全部',
      save: '保存宏',
      saveMacro: '保存宏',
      load: '加载宏',
      export: '导出',
      macroName: '宏名称',
      name: '名称',
      namePlaceholder: '输入宏名称',
      noActions: '暂无录制的操作',
      savedMacros: '已保存的宏',
      actions: '操作步骤',
      step: '步骤',
      steps: '步骤数',
      action: '动作',
      actionType: '动作类型',
      target: '目标',
      value: '值',
      elapsed: '耗时',
      time: '时间',
      created: '创建时间',
      types: {
        click: '点击',
        type: '输入',
        key: '按键',
        wait: '等待',
      },
    },
    workflow: {
      title: '批量工作流',
      new: '新建工作流',
      newWorkflow: '新建工作流',
      workflowName: '工作流名称',
      namePlaceholder: '输入工作流名称',
      addStep: '添加步骤',
      removeStep: '移除步骤',
      run: '运行',
      runWorkflow: '运行工作流',
      runAll: '全部运行',
      save: '保存',
      saved: '已保存的工作流',
      progress: '进度',
      results: '执行结果',
      noWorkflows: '暂无工作流',
      savedWorkflows: '已保存的工作流',
      selectOrCreate: '选择或创建工作流',
      noSteps: '暂无步骤，点击添加',
      steps: '步骤',
      stepType: '步骤类型',
      selectFiles: '选择文件',
      selectOperation: '选择操作',
      outputDir: '输出目录',
      filePattern: '文件匹配模式',
      operations: {
        convert: '格式转换',
        rename: '批量重命名',
        compress: '压缩',
        copy: '复制',
        delete: '删除',
        resize: '调整大小',
      },
    },
  },
  notes: {
    newNote: '新建笔记',
    searchPlaceholder: '搜索笔记...',
    allTags: '全部标签',
    untitled: '未命名笔记',
    empty: '暂无笔记',
    emptyMessage: '暂无笔记，点击新建',
    titlePlaceholder: '笔记标题',
    edit: '编辑',
    preview: '预览',
    editTags: '编辑标签',
    addTag: '添加标签',
    deleteConfirm: '确定删除这条笔记？',
    contentPlaceholder: '开始写点什么...',
    updated: '更新于',
  },
  settings: {
    title: '设置',
    theme: {
      title: '主题设置',
      light: '亮色',
      dark: '暗色',
      system: '跟随系统',
    },
    language: {
      title: '语言设置',
      zhCN: '简体中文',
      en: 'English',
    },
    editor: {
      title: '编辑器默认设置',
      fontSize: '字体大小',
      tabSize: 'Tab 大小',
      fontFamily: '字体',
    },
    autoSave: {
      title: '自动保存',
      enabled: '启用自动保存',
      interval: '保存间隔',
    },
    about: {
      title: '关于',
      version: '版本',
      description: '为秋徐晨量身打造的全功能离线办公套件，基于 Electron 的跨平台桌面应用。',
      license: '许可证',
      licenseValue: 'MIT License',
    },
    saved: '设置已保存',
  },
  converter: {
    title: '文件转换',
    selectFile: '选择文件',
    sourceFormat: '源格式',
    targetFormat: '目标格式',
    convert: '开始转换',
    converting: '转换中...',
    result: '转换结果',
    copyResult: '复制结果',
    downloadResult: '下载结果',
    noFile: '请先选择一个文件',
    dropFile: '或拖拽文件到此处',
    conversionTypes: {
      md2html: 'Markdown → HTML',
      csv2json: 'CSV → JSON',
      json2csv: 'JSON → CSV',
      xml2json: 'XML → JSON',
      json2xml: 'JSON → XML',
      yaml2json: 'YAML → JSON',
      json2yaml: 'JSON → YAML',
    },
  },
  ocr: {
    title: 'OCR 识别',
    imagePreview: '图片预览',
    dragTip: '点击或拖拽图片到此处',
    supportedFormats: '支持 PNG、JPEG、WebP、BMP、TIFF 格式',
    selectLanguage: '识别语言',
    startOCR: '开始识别',
    recognizing: '识别中...',
    progress: '识别进度',
    initializing: '初始化引擎...',
    loadingCore: '加载 Tesseract 核心...',
    loadingLanguage: '加载语言包...',
    complete: '识别完成',
    error: '识别失败',
    result: '识别结果',
    resultPlaceholder: '识别文本将显示在这里...',
    copyResult: '复制结果',
    copyFailed: '复制失败',
    noImage: '请先选择一张图片',
    invalidFormat: '不支持的图片格式',
    loadError: '加载图片失败',
    languages: {
      eng: '英文',
      chi_sim: '简体中文',
      chi_tra: '繁體中文',
      jpn: '日本語',
      kor: '한국어',
      fra: 'Français',
      deu: 'Deutsch',
      spa: 'Español',
      por: 'Português',
      ita: 'Italiano',
      rus: 'Русский',
      ara: 'العربية',
    },
  },
}
