const fileSystem = require('fs');
const fileNameJson = 'keyWords.json';

// Palavras reservadas no THF que já são fixas
const wordsThfFixed = {
  'thf-ui': 'portinari-ui',
  'thf-theme/': 'style/',
  'thf-theme-default': 'portinari-theme-default',
  'thf-code-editor': 'portinari-code-editor',
  'thf-templates': 'portinari-templates',
  'thf-storage': 'portinari-storage',
  'thf-sync': 'portinari-sync',
  '@totvs': '@portinari',
  'X-Totvs-Screen-Lock': 'X-Portinari-Screen-Lock',
  'X-Totvs-No-Count-Pending-Requests': 'X-Portinari-No-Count-Pending-Requests',
  'X-Totvs-No-Error': 'X-Portinari-No-Error'
}

function getFile(fileName) {
  return fileSystem.readFileSync(fileName, 'utf-8');
}

function getKeyWordsJson(file) {
  try {
    return JSON.parse(getFile(file));
  } catch (e) {
    return {
      'class': {},
      'selector': {},
      'css': {},
    };
  }
}

function getWordsFile(file, sentence) {
  var lines = file.split(/\r?\n/);
  let words = [];

  lines.forEach((line) => {
    if (!sentence || line.includes(sentence)) {
      words = [ ...words, ...line.split(' ')];
    }
  })

  return words;
}

function createKeyWordsClass(words) {
  return words.filter(word => (/Thf/).test(word));
}

function createKeyWordsCss(words) {
  // Regex para pegar as classes css e depois remove os caracteres especiais
  const cssClasses = words
    .filter(word => (/\.thf(-?[_a-zA-Z]+[_a-zA-Z0-9-]*)(?![^\{]*\})/).test(word))
    .map(cssClass => getCleanClass(cssClass));

  return separateCssClassesByDot(cssClasses);
}

function separateCssClassesByDot(cssClasses) {
  return cssClasses.reduce((newClasses, cssClass) => {
    // Pegar a segunda classe que está unida por ".". Ex.: thf-icon.thf-icon-info
    // caso não conter ponto fica ['thf-icon'] e adiciona no array
    const splitedClasses = cssClass.split('.');

    return [...newClasses, ...splitedClasses];
  }, []);
}

// Limpa a palavra da classe que contém outros seletores e caracteres especiais
function getCleanClass(word) {
  const dotFirstRegex = /\./;
  const dirtyRegex = /(\:(.*)|\+|\>|\&|\:not|\,|\{|\)|\()/g;

  return word.replace(dotFirstRegex, '').replace(dirtyRegex, '');
}

function createFileKeyWordsFinal() {
  const keyWordsJson = getKeyWordsJson(fileNameJson);
  const newSelectors = getPathClass(keyWordsJson.class);

  const newKeyWords = {
    ...keyWordsJson.css,
    ...keyWordsJson.class,
    ...keyWordsJson.selector,
    ...newSelectors,
    ...wordsThfFixed
  };

  outputFoundKeyWords(newKeyWords);

  fileSystem.writeFileSync(fileNameJson, JSON.stringify(newKeyWords));
}

function getPathClass(classes) {
  const regexClassNamePatern = /^Thf(.*)(Component|Interface|Enum|Module|Pipe|Service|Directive)$/;
  let newSelectors = {};

  // Pega os nomes das classes para criar o padrão de caminho e incluir no dicionário
  // Ex.: ThfModalComponent -> thf-modal-component
  for (const word in classes) {
    let keyWordClass = word.match(regexClassNamePatern);

    if (keyWordClass && keyWordClass[1]) {
      const { oldKeyWordClass, newKeyWordClass } = transformToDashPath(keyWordClass[1]);

      newSelectors[oldKeyWordClass] = newKeyWordClass;
    }
  }

  return newSelectors;
}

// transforma ThfModalComponent -> thf-modal-component
// e retorna { oldKeyWordClass: 'thf-modal-component', newKeyWordClass: 'po-modal-component' }
function transformToDashPath(keyWordClass) {
  const dashreizeClass = dasherize(keyWordClass);

  const newKeyWordClass = `po-${dashreizeClass}`;
  const oldKeyWordClass = `thf-${dashreizeClass}`;
  
  return { oldKeyWordClass, newKeyWordClass };
}

function dasherize(word){
  return word.replace(/([a-z\xE0-\xFF])([A-Z\xC0\xDF])/g, '$1-$2').toLowerCase();
}

function outputFoundKeyWords(newKeyWords) {
  const keywordsLength = Object.keys(newKeyWords).length;

  console.log(newKeyWords);
  console.log(`\n ########## Found ${keywordsLength} keywords ##########`);
}

function createKeyWordsSelector(words) {
  words = words.filter(word => {
    return (/^'thf/g).test(word) || (/t-/).test(word);
  });

  return words.map(word => {
    word = word.replace(/'/g, '');
    word = word.replace(/,/g, '');
    word = word.replace(/\[/g, '');
    word = word.replace(/\]/g, '');
    word = word.replace(/\@Input\(/g, '');
    word = word.replace(/\@Output\(/g, '');
    word = word.replace(/\)/g, '');
    return word;
  });
}

function writeJson(property, newData) {
  const keyWordsJson = createsMatchingKeyWords(newData, property);

  try {
    fileSystem.writeFileSync(fileNameJson, JSON.stringify(keyWordsJson));

  } catch (e) {
    console.log('Could not create file: ', e);
  }
}

function createsMatchingKeyWords(keyWords, property) {
  const keyWordsJson = getKeyWordsJson(fileNameJson);

  for (const keyWord of keyWords) {
    let wordReplaced = keyWord.replace(/thf/gi, replacePO).replace(/^t\-/, 'p-');

    keyWordsJson[property][keyWord] = wordReplaced;
  }

  return keyWordsJson;
}

function replacePO(thfString) {
  const firstLetter = thfString.charAt(0);
  const isUpperCaseLetter = firstLetter === firstLetter.toUpperCase();

  return isUpperCaseLetter ? 'Po' : 'po';
}

function getCss(fileName) {
  const file = getFile(fileName);
  const words = createKeyWordsCss(getWordsFile(file));
  writeJson('css', words);
}

function getClass(fileName) {
  writeClassKeyWordsBySentence(fileName, 'export class Thf');
}

function getSelector(fileName) {
  writeSelectorKeyWordBySentence(fileName, `selector: `);
}

function getOutput(fileName) {
  writeSelectorKeyWordBySentence(fileName, `@Output(`);
}

function getInput(fileName) {
  writeSelectorKeyWordBySentence(fileName, `@Input(`);
}

function getInterface(fileName) {
  writeClassKeyWordsBySentence(fileName, 'export interface Thf');
}

function getEnum(fileName) {
  writeClassKeyWordsBySentence(fileName, 'export enum Thf');
}

function getPipe(fileName) {
  writeClassKeyWordsBySentence(fileName, 'export class Thf');
  writeSelectorKeyWordBySentence(fileName, 'name: ');
}

function writeSelectorKeyWordBySentence(fileName, sentence) {
  const file = getFile(fileName);
  const words = createKeyWordsSelector(getWordsFile(file, sentence));
  writeJson('selector', words);
}

function writeClassKeyWordsBySentence(fileName, sentence) {
  const file = getFile(fileName);
  const words = createKeyWordsClass(getWordsFile(file, sentence));
  writeJson('class', words);
}

module.exports = {
  getClass,
  getSelector,
  getInterface,
  getEnum,
  getPipe,
  getInput,
  getOutput,
  getCss,
  createFileKeyWordsFinal,
  fileNameJson
}