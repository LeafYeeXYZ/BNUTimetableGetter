/**
 * @fileoverview 一个用于爬取北师大课表信息的爬虫
 * @version 1.0.0
 * @since 2024-03-05
 */

// 引入依赖
import { main } from './function/main.js'
import { env } from './env.js'
import inquirer from 'inquirer';

if (!env.USER_NAME || !env.PASSWORD || !env.DISPLAY_NAME) {
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
}

// 运行爬虫
main(env)
  .then(() => console.log('\n爬取成功:\n图片和网页文件已保存\n您可以在 download 文件夹中查看\n'))
  .catch(e => console.error(`\n爬取失败:\n请检查账号密码是否错误\n以及网络环境是否是校园网\n错误信息:\n${e}\n`))
  .finally(() => {
    console.log('3秒后自动退出')
    setTimeout(() => process.exit(), 3000)
  })
