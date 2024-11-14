// Don't sync to github

const fs = require('fs')

const packageJsonPath = './package.json'
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'))

// 获取当前版本号并增加最后一位
const currentVersion = packageJson.version
const newVersion = incrementVersion(currentVersion)
packageJson.version = newVersion

fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2), 'utf-8')

console.log(`Version updated to ${newVersion}`)

function incrementVersion(version) {
  const versionParts = version.split('.') // 分割版本号
  const lastPart = parseInt(versionParts[versionParts.length - 1], 10) // 获取最后一位并转为数字
  versionParts[versionParts.length - 1] = lastPart + 1 // 增加最后一位
  return versionParts.join('.') // 重新组合版本号
}
