const fileSystem = require('fs');
const fileReader = require('./generate-key-words.js');

// Cria o JSON das palavras chaves ao executar o index
generateKeyWordsJson();

// Lendo o diretório
function getKeyWordsFromDirectory(directory) {
  const files = fileSystem.readdirSync(directory);

  for (let i=0; i < files.length; i++) {

    const file = `${directory}/${files[i]}`;

    if (isExcludedFile(file)) {
      continue;
    }

    const stats = fileSystem.statSync(file);

    if (stats.isFile()) {

      getKeyWordsFromFile(file);

    } else if(stats.isDirectory()) {
      getKeyWordsFromDirectory(file);
    }
  }
}

function getKeyWordsFromFile(file) {

  if ((/\.(component|service|directive|module)\.ts/).test(file)) {
    fileReader.getClass(file);
  }

  if ((/\.(component|directive)\.ts/).test(file)) {
    fileReader.getSelector(file);
    fileReader.getInput(file);
    fileReader.getOutput(file);
    return;
  }

  if ((/\.css/).test(file)) {
    fileReader.getCss(file);
    return;
  }

  if ((/\.interface\.ts/).test(file)) {
    fileReader.getInterface(file);
    return;
  }

  if ((/\.enum\.ts/).test(file)) {
    fileReader.getEnum(file);
    return;
  }

  if ((/\.pipe\.ts/).test(file)) {
    fileReader.getPipe(file);
    return;
  }
}

function isExcludedFile(file) {
  return (/(\/(node_modules|dist|docs|e2e|tools|samples))|(\.(spec|html|metadata\.json|git|tmp\-dist))/).test(file);
}

function removeKeyWordsJson() {
  const fileNameJson = fileReader.fileNameJson;

  if (fileSystem.existsSync(fileNameJson)) {
    fileSystem.unlinkSync(fileReader.fileNameJson);
  }
}

function generateKeyWordsJson() {
  const thfPath = '../../thf';
  const codeEditorPath = '../../thf-code-editor';
  const cdnCssPath = '../../cdn-thf-core/src/css';

  removeKeyWordsJson();

  getKeyWordsFromDirectory(thfPath);
  getKeyWordsFromDirectory(codeEditorPath);
  getKeyWordsFromDirectory(cdnCssPath);

  fileReader.createFileKeyWordsFinal();
}