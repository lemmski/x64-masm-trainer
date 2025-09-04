// Quick test to verify ML64.exe is available
const { execSync } = require('child_process');

try {
  console.log('Testing ML64.exe availability...');
  const result = execSync('ml64.exe /?', { encoding: 'utf8', stdio: 'pipe' });
  console.log('✅ ML64.exe found and working!');
  console.log('Version info:', result.split('\n')[0]);
} catch (error) {
  console.log('❌ ML64.exe not found in PATH');
  console.log('Please run: %comspec% /k "C:\\Program Files\\Microsoft Visual Studio\\2022\\Community\\VC\\Auxiliary\\Build\\vcvars64.bat"');
  process.exit(1);
}

try {
  console.log('Testing LINK.exe availability...');
  execSync('link.exe /?', { encoding: 'utf8', stdio: 'pipe' });
  console.log('✅ LINK.exe found and working!');
} catch (error) {
  console.log('❌ LINK.exe not found in PATH');
  console.log('Please run: %comspec% /k "C:\\Program Files\\Microsoft Visual Studio\\2022\\Community\\VC\\Auxiliary\\Build\\vcvars64.bat"');
  process.exit(1);
}

console.log('🎉 All assembler tools are available!');
console.log('You can now run: npm run dev');
