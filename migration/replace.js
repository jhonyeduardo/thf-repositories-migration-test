const fileSystem = require('fs');

function getFile(fileName) {
  return fileSystem.readFileSync(fileName, 'utf-8');
}

function writeFile(fileName, data) {
  fileSystem.writeFileSync(fileName, data);
}

function replaceFile(file) {
  // encontrar palavras que tenham thf ou t-
  return replaceStringThf(file);
}

function replaceStringThf(string) {
  return string.replace(/(thf)|(\bt\-)|(totvs)/gi, replacePO);
}

function replacePO(thfString) {
  if (thfString.toLowerCase() === 'thf') {

    const firstLetter = thfString.charAt(0);
    const isUpper = word => word === word.toUpperCase();
    const isUpperCaseLetter = isUpper(firstLetter);
    const isUpperCaseWord = isUpper(thfString);

    return isUpperCaseWord ? 'PO' : (isUpperCaseLetter ? 'Po' : 'po');
  }

  if(thfString.toLowerCase() === 't-') {
    return 'p-';
  }

  if (thfString === 'totvs') {
    return 'portinari';
  }

  if (thfString === 'TOTVS') {
    return 'PORTINARI';
  }

  if (thfString === 'Totvs') {
    return 'Portinari';
  }
}

function replacer(fileName) {
  const file = getFile(fileName);

  const replacedDataFile = replaceFile(file)

  writeFile(fileName, replacedDataFile)
}

module.exports = {
  replacer,
  replaceStringThf
}