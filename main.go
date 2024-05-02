package main

import (
	"fmt"
	"os"
	"github.com/playwright-community/playwright-go"
)

var (
	StudentNumber string = "" // 学号
	Password string = "" // 密码
	IsBusy bool = false // 是否需要点击 "继续访问原地址"
)

func main() {
	// 检查学号和密码是否为空
	if StudentNumber == "" || Password == "" {
		fmt.Print("请输入学号: ")
		fmt.Scanln(&StudentNumber)
		fmt.Print("请输入密码: ")
		fmt.Scanln(&Password)
	}
	// 安装浏览器
	fmt.Println("安装浏览器")
	err := playwright.Install()
	if err != nil {
		fmt.Println("安装浏览器失败", err)
		return
	}
	// 创建 Playwright 实例
	pw, err := playwright.Run()
	if err != nil {
		fmt.Println("创建 Playwright 实例失败", err)
		return
	}
	// 创建浏览器实例
	browser, err := pw.Chromium.Launch(playwright.BrowserTypeLaunchOptions{
		Headless: playwright.Bool(false),
	})
	if err != nil {
		fmt.Println("创建浏览器实例失败", err)
		return
	}
	// 创建页面实例
	page, err := browser.NewPage(playwright.BrowserNewPageOptions{
		Viewport: &playwright.Size{
			Width: 2160,
			Height: 1440,
		},
	})
	if err != nil {
		fmt.Println("创建页面实例失败", err)
		return
	}
	// 跳转到登录页面
	_, err = page.Goto("https://cas.bnu.edu.cn/cas/login?service=http%3A%2F%2Fzyfw.bnu.edu.cn%2F")
	if err != nil {
		fmt.Println("跳转到登录页面失败", err)
		return
	}
	// 输入学号
	err = page.Locator("#un").Fill(StudentNumber)
	if err != nil {
		fmt.Println("输入学号失败", err)
		return
	}
	// 输入密码
	err = page.Locator("#pd").Fill(Password)
	if err != nil {
		fmt.Println("输入密码失败", err)
		return
	}
	// 点击登录按钮
	err = page.Locator("#index_login_btn").Click()
	if err != nil {
		fmt.Println("点击登录按钮失败", err)
		return
	}
	// 如果有, 点击 "继续访问原地址"
	if IsBusy {
		err = page.Locator("body > div > div.mid_container > div > div > div > div.select_login_box > div:nth-child(6) > a").Click()
		if err != nil {
			fmt.Println("点击 \"继续访问原地址\" 失败", err)
			return
		}
	}
	// 点击 "网上选课"
	err = page.Locator("li[data-code=\"JW1304\"]").Click()
	if err != nil {
		fmt.Println("点击 \"网上选课\" 失败", err)
		return
	}
	// 获取 iframe
	frameName := "frmDesk"
	iframe := page.Frame(playwright.PageFrameOptions{
		Name: &frameName,
	})
	if iframe == nil {
		fmt.Println("获取 iframe 失败")
		return
	}
	// 点击 "我的课表"
	err = iframe.Locator("#title2135").Click()
	if err != nil {
		fmt.Println("点击 \"我的课表\" 失败", err)
		return
	}
	// 等待加载
	iframe.WaitForLoadState(playwright.FrameWaitForLoadStateOptions{
		State: playwright.LoadStateNetworkidle,
	})
	// 点击 "按课表查看"
	err = iframe.Locator("#cxfs_ewb").Click()
	if err != nil {
		fmt.Println("点击 \"按课表查看\" 失败", err)
		return
	}
	// 点击 "检索"
	err = iframe.Locator("#btnQry").Click()
	if err != nil {
		fmt.Println("点击 \"检索\" 失败", err)
		return
	}
	// 等待加载
	iframe.WaitForTimeout(1000)
	// 截图
	var buf []byte
	buf, err = page.Screenshot()
	if err != nil {
		fmt.Println("截图失败", err)
		return
	}
	// 保存截图
	err = os.WriteFile("screenshot.png", buf, 0644)
	if err != nil {
		fmt.Println("保存截图失败", err)
		return
	}
	// 关闭浏览器
	err = browser.Close()
	if err != nil {
		fmt.Println("关闭浏览器失败", err)
		return
	}
	// 关闭 Playwright 实例
	err = pw.Stop()
	if err != nil {
		fmt.Println("关闭 Playwright 实例失败", err)
		return
	}
	fmt.Println("成功, 按空格键退出")
	fmt.Scanf("%s")
}