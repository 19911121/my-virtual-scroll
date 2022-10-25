const glob = require('glob');
const path = require('path');
const rollup = require('rollup');
const rollupTypescript = require('@rollup/plugin-typescript');

const rootPath = './src';

// rollup
const rollupFilePaths = glob.sync(`${rootPath}/**/*.ts`, {});

async function task(cb) {
  try {
    console.log('---------- glup task start');

    await execRollup();

    console.log('---------- glup task end');

    cb();
  }
  catch (error) {
    console.error('task error...', error);
  }
}

async function execRollup() {
  rollupFilePaths.forEach(async (filePath) => {
    const filePathInfo = path.parse(filePath);
    const outputDir = filePathInfo.dir.replace(rootPath, '');
    const outputExt = 'js';
    const outputName = filePathInfo.name;

    const bundle = await rollup.rollup({
      input: filePath,
      plugins: [rollupTypescript()]
    });
  
    await bundle.write({
      file: `./dist/${outputDir}/${outputName}.${outputExt}`,
      format: 'cjs',
      name: outputName,
    });

    await bundle.write({
      file: `./dist/es/${outputDir}/${outputName}.${outputExt}`,
      format: 'esm',
      name: outputName,
    });
  });
}

exports.default = task;
