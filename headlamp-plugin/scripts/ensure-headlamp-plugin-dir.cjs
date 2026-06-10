const fs = require('fs');
const os = require('os');
const path = require('path');

const packageJson = require('../package.json');

const packageName = packageJson.name.split('/').pop();

function getHeadlampPluginsDir() {
  if (process.platform === 'win32') {
    return path.join(process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming'), 'Headlamp', 'Config', 'plugins');
  }

  if (process.platform === 'darwin') {
    return path.join(os.homedir(), 'Library', 'Application Support', 'Headlamp', 'Config', 'plugins');
  }

  return path.join(process.env.XDG_CONFIG_HOME || path.join(os.homedir(), '.config'), 'Headlamp', 'plugins');
}

const pluginDir = path.join(getHeadlampPluginsDir(), packageName);
fs.mkdirSync(pluginDir, { recursive: true });
console.log(`Headlamp plugin dev directory ready: ${pluginDir}`);
