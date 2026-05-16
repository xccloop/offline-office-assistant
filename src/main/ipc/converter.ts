import { ipcMain, type IpcMainInvokeEvent } from 'electron'
import * as fs from 'fs'
import * as path from 'path'
import * as crypto from 'crypto'

/**
 * 文件转换 handler
 * 支持: md2html, csv2json, json2csv, xml2json, json2xml, yaml2json, json2yaml
 * 直接返回转换后的文本内容（字符串）
 */
export function registerConverterIpc(): void {
  ipcMain.handle('convert:file', async (_event: IpcMainInvokeEvent, params: {
    filePath: string
    conversion: string
  }): Promise<string> => {
    const { filePath, conversion } = params
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`)
    }

    const content = fs.readFileSync(filePath, 'utf-8')

    switch (conversion) {
      case 'md2html':
        return convertMarkdownToHtml(content)
      case 'csv2json':
        return JSON.stringify(csvToJson(content), null, 2)
      case 'json2csv':
        return jsonToCsv(JSON.parse(content))
      case 'xml2json':
        return xmlToJson(content)
      case 'json2xml':
        return jsonToXml(JSON.parse(content))
      case 'yaml2json':
        return yamlToJson(content)
      case 'json2yaml':
        return jsonToYaml(JSON.parse(content))
      case 'hash_md5': {
        const buffer = fs.readFileSync(filePath)
        return crypto.createHash('md5').update(buffer).digest('hex')
      }
      case 'hash_sha256': {
        const buffer = fs.readFileSync(filePath)
        return crypto.createHash('sha256').update(buffer).digest('hex')
      }
      default:
        throw new Error(`Unknown conversion: ${conversion}`)
    }
  })
}

// ── Converters ──

function convertMarkdownToHtml(md: string): string {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>Converted Document</title>
  <style>
    body { font-family: -apple-system, sans-serif; max-width: 800px; margin: 0 auto; padding: 2rem; line-height: 1.6; }
    h1 { border-bottom: 2px solid #eee; padding-bottom: 0.5rem; }
    h2 { border-bottom: 1px solid #f0f0f0; padding-bottom: 0.3rem; }
    code { background: #f0f0f0; padding: 0.2em 0.4em; border-radius: 3px; font-size: 0.9em; }
    pre { background: #f5f5f5; padding: 1rem; border-radius: 6px; overflow-x: auto; }
    pre code { background: none; padding: 0; }
    li { margin: 0.3em 0; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background: #f5f5f5; }
  </style>
</head>
<body>
${md
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`{3}(\w*)\n([\s\S]*?)`{3}/g, '<pre><code class="language-$1">$2</code></pre>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/^\- (.+)$/gm, '<li>$1</li>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>')
    .replace(/^(.+)$/gm, (line) => {
      if (line.startsWith('<')) return line
      return line ? `<p>${line}</p>` : line
    })}
</body>
</html>`
}

function jsonToCsv(data: any): string {
  const items = Array.isArray(data) ? data : [data]
  if (items.length === 0) return ''
  const keys = Object.keys(items[0])
  const header = keys.join(',')
  const rows = items.map((item: any) =>
    keys.map((k) => {
      const val = String(item[k] ?? '')
      return val.includes(',') || val.includes('"') || val.includes('\n')
        ? `"${val.replace(/"/g, '""')}"`
        : val
    }).join(','),
  )
  return [header, ...rows].join('\n')
}

function csvToJson(csv: string): any[] {
  const lines = csv.trim().split(/\r?\n/)
  if (lines.length < 2) return []
  const headers = parseCsvLine(lines[0])
  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line)
    const obj: any = {}
    headers.forEach((h, i) => { obj[h] = values[i] ?? '' })
    return obj
  })
}

function parseCsvLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        current += ch
      }
    } else {
      if (ch === '"') {
        inQuotes = true
      } else if (ch === ',') {
        result.push(current.trim())
        current = ''
      } else {
        current += ch
      }
    }
  }
  result.push(current.trim())
  return result
}

// ── XML ↔ JSON (纯手写解析，无外部依赖) ──

function xmlToJson(xml: string): string {
  // 简化 XML 解析：处理常见的标签结构
  const cleanXml = xml.replace(/<!--[\s\S]*?-->/g, '').trim()
  const obj = parseXmlNode(cleanXml)
  return JSON.stringify(obj, null, 2)

  function parseXmlNode(str: string): any {
    const tagMatch = str.match(/^<\?xml[^>]*\?>\s*/)
    let content = tagMatch ? str.slice(tagMatch[0].length).trim() : str.trim()

    // 找根元素
    const rootMatch = content.match(/^<(\w+)([^>]*)>([\s\S]*)<\/\1>\s*$/)
    if (!rootMatch) return { _text: content }

    const tagName = rootMatch[1]
    const inner = rootMatch[3].trim()

    // 如果内部还有子元素
    const children: any[] = []
    let rest = inner
    const seen: Map<string, number> = new Map()

    while (rest.length > 0) {
      const childMatch = rest.match(/^<(\w+)([^>]*)>([\s\S]*?)<\/\1>/)
      if (!childMatch) {
        // 纯文本
        if (rest.trim()) {
          children.push({ _text: rest.trim() })
        }
        break
      }
      const childName = childMatch[1]
      const attrs = childMatch[2]
      const childContent = childMatch[3]

      const childObj: any = {}
      // 解析属性
      const attrRegex = /(\w+)="([^"]*)"/g
      let attrMatch
      while ((attrMatch = attrRegex.exec(attrs)) !== null) {
        childObj[`_${attrMatch[1]}`] = attrMatch[2]
      }

      // 递归解析子内容
      const nested = parseXmlNode(`<${childName}>${childContent}</${childName}>`)
      if (nested._text !== undefined && Object.keys(nested).length === 1) {
        childObj._text = nested._text
      } else {
        Object.assign(childObj, nested)
      }
      // 移除 tag name 键
      delete childObj[childName]

      children.push({ _tag: childName, ...childObj })
      rest = rest.slice(childMatch[0].length).trim()

      // 检测重复标签 → 转为数组
      const count = (seen.get(childName) || 0) + 1
      seen.set(childName, count)
    }

    if (children.length === 0 && inner.trim() && !/<[^>]+>/.test(inner)) {
      return { _text: inner.trim() }
    }

    if (children.length === 1 && children[0]._text !== undefined && Object.keys(children[0]).length <= 3) {
      // 简化：单个纯文本子元素
      return { _text: children[0]._text }
    }

    // 去重转为数组
    const merged: any = {}
    for (const { _tag, ...rest } of children) {
      const val = rest
      if (merged[_tag]) {
        if (!Array.isArray(merged[_tag])) {
          merged[_tag] = [merged[_tag]]
        }
        merged[_tag].push(val)
      } else {
        merged[_tag] = val
      }
    }
    return merged
  }
}

function jsonToXml(json: any, rootName = 'root'): string {
  const obj = typeof json === 'string' ? JSON.parse(json) : json
  return `<?xml version="1.0" encoding="UTF-8"?>\n${objToXml(obj, rootName)}`

  function objToXml(data: any, tag: string, indent = ''): string {
    if (Array.isArray(data)) {
      return data.map((item) => objToXml(item, tag, indent)).join('\n')
    }
    if (typeof data !== 'object' || data === null) {
      return `${indent}<${tag}>${escapeXml(String(data))}</${tag}>`
    }
    const keys = Object.keys(data)
    if (keys.length === 0) return `${indent}<${tag} />`
    const inner = keys.map((key) => {
      const val = data[key]
      if (Array.isArray(val)) {
        return val.map((item) => objToXml(item, key, indent + '  ')).join('\n')
      }
      return objToXml(val, key, indent + '  ')
    }).join('\n')
    return `${indent}<${tag}>\n${inner}\n${indent}</${tag}>`
  }
}

function escapeXml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

// ── YAML ↔ JSON (最小化实现，覆盖常见场景) ──

function yamlToJson(yaml: string): string {
  const lines = yaml.split(/\r?\n/)
  const result = parseYamlBlock(lines, 0, 0)
  return JSON.stringify(result.value, null, 2)
}

function parseYamlBlock(lines: string[], startIdx: number, baseIndent: number): { value: any; nextIdx: number } {
  let i = startIdx
  const result: any = {}

  while (i < lines.length) {
    const line = lines[i]
    // 跳过空行和注释
    if (line.trim() === '' || line.trim().startsWith('#')) {
      i++
      continue
    }

    const indent = line.search(/\S/)
    if (indent < baseIndent) break // 缩进回退，离开当前块

    // 检测列表项 (- item)
    if (line.trim().startsWith('- ')) {
      const arr: any[] = []
      const listIndent = indent
      while (i < lines.length) {
        const li = lines[i]
        const liIndent = li.search(/\S/)
        if (liIndent < listIndent) break
        if (!li.trim().startsWith('- ')) { i++; continue }

        const rest = li.trim().slice(2).trim()
        const kvMatch = rest.match(/^(\w[\w\s]*?):\s*(.*)/)
        if (kvMatch) {
          const key = kvMatch[1].trim()
          const val = kvMatch[2].trim()
          if (val === '') {
            // 嵌套对象
            const nested = parseYamlBlock(lines, i + 1, liIndent + 2)
            arr.push({ [key]: nested.value })
            i = nested.nextIdx
          } else {
            arr.push({ [key]: parseYamlValue(val) })
            i++
          }
        } else {
          arr.push(parseYamlValue(rest))
          i++
        }
      }
      return { value: arr, nextIdx: i }
    }

    // KV 对
    const kvMatch = line.match(/^(\w[\w\s]*?):\s*(.*)/)
    if (!kvMatch) { i++; continue }

    const key = kvMatch[1].trim()
    const val = kvMatch[2].trim()

    if (val === '' || val === '|' || val === '>') {
      // 嵌套对象或多行字符串
      if (val === '|' || val === '>') {
        let text = ''
        i++
        while (i < lines.length) {
          const li = lines[i]
          const liIndent = li.search(/\S/)
          if (liIndent <= indent) break
          text += (text ? '\n' : '') + li.trim()
          i++
        }
        result[key] = text
      } else {
        const nested = parseYamlBlock(lines, i + 1, indent + 2)
        result[key] = nested.value
        i = nested.nextIdx
      }
    } else {
      result[key] = parseYamlValue(val)
      i++
    }
  }

  return { value: result, nextIdx: i }
}

function parseYamlValue(val: string): any {
  val = val.replace(/#.*$/, '').trim()
  if (val === 'true' || val === 'yes') return true
  if (val === 'false' || val === 'no') return false
  if (val === 'null' || val === '~') return null
  if (/^-?\d+$/.test(val)) return parseInt(val, 10)
  if (/^-?\d+\.\d+$/.test(val)) return parseFloat(val)
  if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
    return val.slice(1, -1)
  }
  return val
}

function jsonToYaml(json: any): string {
  const obj = typeof json === 'string' ? JSON.parse(json) : json
  return objToYaml(obj, 0)

  function objToYaml(data: any, indent: number): string {
    const pad = '  '.repeat(indent)

    if (data === null || data === undefined) return pad + 'null'
    if (typeof data === 'boolean') return pad + String(data)
    if (typeof data === 'number') return pad + String(data)
    if (typeof data === 'string') {
      if (data.includes('\n')) {
        return pad + '|\n' + data.split('\n').map(l => pad + '  ' + l).join('\n')
      }
      return pad + (data.match(/[:#{}[\],&*?|>'"!%@`]/) ? `"${data}"` : data)
    }
    if (Array.isArray(data)) {
      return data.map((item) => {
        if (typeof item === 'object' && item !== null && !Array.isArray(item)) {
          const entries = Object.entries(item)
          const first = entries[0]
          const firstYaml = objToYaml(first[1], indent + 2).trimStart()
          const rest = entries.slice(1).map(([k, v]) =>
            `${pad}  ${k}: ${objToYaml(v, 0).trim()}`
          ).join('\n')
          return `${pad}- ${first[0]}: ${firstYaml}${rest ? '\n' + rest : ''}`
        }
        return `${pad}- ${objToYaml(item, 0).trimStart()}`
      }).join('\n')
    }
    // Object
    return Object.entries(data).map(([key, val]) => {
      if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
        return `${pad}${key}:\n${objToYaml(val, indent + 1)}`
      }
      if (Array.isArray(val)) {
        if (val.length === 0) return `${pad}${key}: []`
        return `${pad}${key}:\n${objToYaml(val, indent + 1)}`
      }
      return `${pad}${key}: ${objToYaml(val, 0).trimStart()}`
    }).join('\n')
  }
}
