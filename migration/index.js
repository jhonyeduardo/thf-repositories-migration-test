const fileSystem = require('fs');
const path = require('path');
const fileReader = require('./replace.js');

convertThfRepositories();

// Lendo o diretório
function replaceFiles(directory) {
  const files = fileSystem.readdirSync(directory);

  for (let i=0; i < files.length; i++) {

    // path.step recupera o separador específico do SO
    const file = `${directory}${path.sep}${files[i]}`;

    if((/(\.(gif|jpg|jpeg|tiff|png|ico|git|eot|ttf|woff))|(node_modules|dist)/i).test(file)) {
      continue;
    }

    const stats = fileSystem.statSync(file);

    // Replace nos arquivos
    if(stats.isFile()) {

      fileReader.replacer(file);

    } else if(stats.isDirectory()) {
      replaceFiles(file);
    }

  }
}

function renameFiles(dir, from, to) {

  if((/(\.(git))|(node_modules|dist)/i).test(dir)) {
    return;
  }

  const dirStat = fileSystem.statSync(dir);

  if(dirStat.isFile()) {
    const dirBaseName = path.basename(dir);
    newPath = path.resolve(path.dirname(dir), fileReader.replaceStringThf(dirBaseName));
    fileSystem.renameSync(dir, newPath);
    return;
  }

  fileSystem.readdirSync(dir).forEach(it => {
    const newName = it.replace(from, to)
    const itsPath = path.resolve(dir, it);
    const itsNewPath = path.resolve(dir, newName);
    const itsStat = fileSystem.statSync(itsPath);

    if (it.search(from) > -1) {
      fileSystem.renameSync(itsPath, itsNewPath)
    }

    if (itsStat.isDirectory()) {
      renameFiles(itsNewPath, from, to)
    } 
  })
}

function convertThfRepositories() {
  const thfPath = '../thf';
  const codeEditorPath = '../thf-code-editor';
  const cdnCssPath = '../cdn-thf-core';
  const tslintPath = '../thf-tslint';
  const portalPath = '../thf-portal';

  convertRepository(thfPath);
  convertRepository(codeEditorPath);
  convertRepository(cdnCssPath);
  convertRepository(tslintPath);
  convertRepository(portalPath);
}

function convertRepository(directory) {
    const folderName = directory.substr(3).toUpperCase();

  if (fileSystem.existsSync(directory)) {
    console.log(`\n Initializing the migration of directory: ${folderName}`);

    replaceFiles(directory);
    renameFiles(directory, /thf/, 'po');

    console.log(`\n ${folderName} directory migration completed `);
    console.log('------------------------------------------------');
  }

}
