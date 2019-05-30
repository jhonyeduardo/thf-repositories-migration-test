# PO Migration

Project to migrate internal repositories of THF

## Installation

```bash
npm install
```

## Usage

The command below generates a json file with the keywords to be used in the migration of THF developers.

```bash
npm run keywords
```


The command below migrates THF repositories to PORTINARI.

it will access the `thf`, `thf-cdn-core`, `thf-code-editor`, `thf-tslint`, and `thf-portal` folders, which must be in the same directory as this repository, exemple:

```
|-- thf
|-- thf-cdn-core
|-- thf-code-editor
|-- thf-portal
|-- thf-tslint
|-- thf-repositories-migration
```

```bash
npm run migrate
```

## License
[MIT](https://choosealicense.com/licenses/mit/)