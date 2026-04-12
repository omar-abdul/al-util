# al-util

A CLI tool for **Microsoft Dynamics 365 Business Central** AL developers. `al-util` speeds up your workflow by generating boilerplate AL object files and tracking object IDs across your project — so you can spend less time on scaffolding and more time writing business logic.

---

## Requirements

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- An initialized AL project (must have an `app.json` in the root directory)

---

## Installation

You can run `al-util` directly without installing it globally:

```bash
npx al-util <command>
```

Or install it globally with your package manager of choice:

```bash
# npm
npm install -g al-util

# pnpm
pnpm add -g al-util

# yarn
yarn global add al-util
```

---

## Commands

### `create`

Scaffolds a new AL object file of a given type, assigns it the next available ID from your `app.json` ID ranges, and places it in the appropriate subdirectory.

```bash
npx al-util create --object-type <type> --name <name>
```

**Supported object types:**

| Object Type         | Description                              |
|---------------------|------------------------------------------|
| `table`             | New table                                |
| `tableextension`    | Extension of an existing table           |
| `page`              | New page                                 |
| `pageextension`     | Extension of an existing page            |
| `codeunit`          | New codeunit                             |
| `report`            | New report                               |
| `reportextension`   | Extension of an existing report          |
| `permissionset`     | New permission set                       |
| `enum`              | New enum                                 |
| `enumextension`     | Extension of an existing enum            |
| `query`             | New query                                |

Each generated file is placed in a subdirectory matching its object type (e.g., `Table/`, `Page/`, `Codeunit/`) and is pre-populated with a ready-to-use boilerplate template, including the correct namespace derived from your `app.json` publisher.

**Example output for a table named "Customer Ledger":**

```
Table/Customer-Ledger-Table-50001.al
```

```al
namespace MyPublisher;

table 50001 "Customer Ledger"
{
    DataClassification = CustomerContent;
    Caption = 'Customer Ledger';

    fields
    {
        field(1; "No."; Code[20])
        {
            Caption = 'No.';
            DataClassification = CustomerContent;
        }
    }

    keys
    {
        key(PK; "No.")
        {
            Clustered = true;
        }
    }
}
```

---

### `generate`

Scans all `.al` files in your project and generates an `objects.json` file that maps every object type to its ID and name. This file is used internally by `create` to track used IDs and prevent conflicts.

```bash
npx al-util generate
```

**Example `objects.json` output:**

```json
{
  "tables": {
    "50001": "Customer Ledger"
  },
  "pages": {
    "50001": "Customer Ledger Card"
  },
  "codeunits": {},
  ...
}
```

---

## Project Setup

Before using `al-util`, make sure your AL project is initialized with an `app.json`. The tool reads your publisher name and ID ranges from this file.

A minimal `app.json` looks like:

```json
{
  "publisher": "MyCompany",
  "idRanges": [
    {
      "from": 50000,
      "to": 99999
    }
  ]
}
```

---

## How It Works

1. **`app.json`** — `al-util` reads your publisher and ID ranges from here.
2. **`objects.json`** — tracks all existing object IDs by scanning your `.al` files. Run `generate` to create or refresh it.
3. **`create`** — uses the above to assign the next available ID, generate a boilerplate `.al` file, and save it to the right folder.

---

## License

[MIT](https://opensource.org/licenses/MIT) © [omar-abdul](https://github.com/omar-abdul)
