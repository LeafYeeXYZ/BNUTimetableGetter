/**
 * @fileoverview 一个用于爬取北师大课表信息的爬虫
 * @version 1.1.0
 * @since 2024-03-05
 * @author LeafYeeXYZ
 */

// 引入依赖
import { env } from './env.js'
import inquirer from 'inquirer'
import puppeteer from 'puppeteer'
import fs from 'node:fs'
import path from 'node:path'
// 修复 __dirname
import { fileURLToPath } from 'node:url'
const __dirname = path.dirname(fileURLToPath(import.meta.url))

if (!env.USER_NAME || !env.PASSWORD) {
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'USER_NAME',
      message: '请输入学号',
    },
    {
      type: 'password',
      name: 'PASSWORD',
      message: '请输入数字京师密码',
    },
    {
      type: 'input',
      name: 'DISPLAY_NAME',
      message: '请输入保存的文件名（默认为学号）',
    },
  ])
  env.USER_NAME = answers.USER_NAME
  env.PASSWORD = answers.PASSWORD
  env.DISPLAY_NAME = answers.DISPLAY_NAME || answers.USER_NAME
} else if (!env.DISPLAY_NAME) {
  env.DISPLAY_NAME = env.USER_NAME
}

// 运行爬虫
main(env)
  .then(() => console.log('\n爬取成功:\n图片和网页文件已保存\n您可以在 download 文件夹中查看\n'))
  .catch(e => console.error(`\n爬取失败:\n请检查账号密码是否错误\n以及网络环境是否是校园网\n错误信息:\n${e}\n`))
  .finally(() => {
    console.log('3秒后自动退出')
    setTimeout(() => process.exit(), 3000)
  })

/**
 * 爬取课表并截图和保存 HTML 文件
 * @param {object} env
 * @param {string} env.USER_NAME 学号
 * @param {string} env.PASSWORD 密码
 * @param {string} env.DISPLAY_NAME 文件名
 */
async function main(env) {
  try {
    // 开始爬取
    console.log('开始爬取')

    // 创建浏览器实例
    const browser = await puppeteer.launch({
      defaultViewport: {
        width: 2160,
        height: 1440
      },
      args: ['--window-size=2160,1440']
    })
    console.log('启动浏览器')

    // 打开登陆页面
    const page = await browser.newPage()
    console.log('打开新页面')
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36')
    await page.goto('https://cas.bnu.edu.cn/cas/login?service=http%3A%2F%2Fzyfw.bnu.edu.cn%2F', { waitUntil: 'networkidle2' })
    console.log('打开登陆页面')

    // 输入用户名和密码
    await page.type('#un', env.USER_NAME)
    await page.type('#pd', env.PASSWORD)
    console.log('输入用户名和密码')

    // 点击登录按钮
    await page.click('#index_login_btn')
    // 等待页面加载
    await page.waitForNetworkIdle({ timeout: 60000 })
    console.log('已尝试登陆')

    // 如果有，点击 "继续访问原地址"
    try {
      await page.click('body > div > div.mid_container > div > div > div > div.select_login_box > div:nth-child(6) > a')
      await page.waitForNetworkIdle({ timeout: 60000 })
      console.log('跳转到教务服务系统')
    } catch (e) {}

    // 点击 "网上选课"
    await page.click('li[data-code="JW1304"]')
    // 等待页面加载
    await page.waitForNetworkIdle({ timeout: 60000 })
    console.log('跳转到网上选课')

    // 获取 iframe
    let iframes = page.frames()
    // 获取课表面板的 iframe
    let iframe = iframes.find(iframe => iframe.url().includes('http://zyfw.bnu.edu.cn/frame/menus/SVGJW1304.jsp?menucode=JW1304'))
    // 点击 "我的课表"
    await iframe.click('#title2135')
    // 等待页面加载
    await page.waitForNetworkIdle({ timeout: 60000 })
    console.log('进入我的课表')

    // 重新获取 iframe
    iframes = page.frames()
    // 获取课表面板的 iframe
    iframe = iframes.find(iframe => iframe.url().includes('http://zyfw.bnu.edu.cn/student/xkjg.wdkb.jsp?menucode=JW130418'))
    // 点击 "按课表查看"
    await iframe.click('#theSearchArea > table > tbody > tr > td > label:nth-child(5)')
    // 等待页面加载
    await page.waitForNetworkIdle({ timeout: 60000 })
    // 点击 "检索"
    await iframe.click('#btnQry')
    // 等待页面加载
    await page.waitForNetworkIdle({ timeout: 60000 })
    console.log('按课表查看')
    // 截图
    await page.screenshot({ path: path.resolve(__dirname, './download', `${env.DISPLAY_NAME}.png`) })
    console.log('保存截图')
    // 获取课表信息
    const table = await iframe.childFrames()[0].$eval('body', body => body.innerHTML)
    // 写入文件
    fs.writeFileSync(path.resolve(__dirname, './download', `${env.DISPLAY_NAME}.html`), table)
    console.log('保存课表信息')
    // 关闭浏览器
    await browser.close()
    console.log('关闭浏览器')
  } catch (e) {
    throw new Error(e)
  }
}
