const { execSync } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function exec(command, silent = false) {
  try {
    const output = execSync(command, { encoding: 'utf-8' });
    if (!silent) console.log(output);
    return output;
  } catch (error) {
    console.error(`错误: ${error.message}`);
    process.exit(1);
  }
}

function checkGitStatus() {
  try {
    execSync('git rev-parse --git-dir', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function hasChanges() {
  const status = exec('git status --porcelain', true);
  return status.trim().length > 0;
}

console.log('📦 开始部署流程...\n');

// 检查是否是 git 仓库
if (!checkGitStatus()) {
  console.log('❌ 当前目录不是 Git 仓库');
  console.log('请先运行: git init');
  process.exit(1);
}

// 运行构建
console.log('🔨 正在构建...');
exec('node build/scan.js');

// 检查是否有变更
if (!hasChanges()) {
  console.log('\n✅ 没有需要提交的变更');
  process.exit(0);
}

// 显示变更
console.log('\n📝 变更文件:');
exec('git status --short');

// 询问提交信息
rl.question('\n💬 请输入提交信息 (留空使用默认): ', (commitMsg) => {
  rl.close();

  const message = commitMsg.trim() || `更新内容 ${new Date().toLocaleDateString('zh-CN')}`;

  console.log('\n📤 正在提交并推送...');

  // 添加所有变更
  exec('git add .');

  // 提交
  exec(`git commit -m "${message}"`);

  // 推送
  try {
    exec('git push');
    console.log('\n✅ 部署成功！');
    console.log('🌐 GitHub Actions 将自动构建并部署到 Pages');
  } catch (error) {
    console.log('\n⚠️  推送失败，可能需要设置远程仓库');
    console.log('请运行: git remote add origin <你的仓库地址>');
    console.log('然后: git push -u origin main');
  }
});
