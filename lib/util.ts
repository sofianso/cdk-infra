import * as fs from "fs";
import * as path from "path";
const yaml = require("js-yaml");

export interface IBuildConfig {
  BootstrapQualifier: string;
  CodecommitRepository: string;
  TerminationProtection: boolean;
  StackTags: any;
  AWSRegion: string;
  AccountId: string | number;
  Stacks: any;
  Lambda: any;
}

export function ensureAccountIdLength(
  id: number | string,
  size: number
): string {
  if (String(id).length < size) {
    return String(id).padStart(size, "0");
  }
  return String(id);
}

function ensureStringValue(object: object) {
  let returnObject: any = {};
  for (const [k, v] of Object.entries(object)) {
    if (typeof v === "object") {
      returnObject[k] = ensureStringValue(v);
    } else if (typeof v === "boolean") returnObject[k] = v;
    else {
      returnObject[k] = String(v);
    }
  }
  return returnObject;
}

export class BuildConfig {
  readonly AWS_ACCOUNT_ID_LEN = 12;

  // constructor(private files: string[]) { }

  private readConfigFile(filePath: string) {
    let fileContent = {};
    try {
      fileContent = yaml.load(fs.readFileSync(path.resolve(filePath), "utf8"));
    } catch {
      return fileContent;
    }
    return fileContent;
  }

  private dict_merge<T>(dictionaries: T[]): object {
    let retDictionary = {};
    for (let dictionary of dictionaries) {
      if (
        typeof dictionary === "object" &&
        Object.keys(dictionary).length !== 0
      ) {
        retDictionary = Object.assign(retDictionary, dictionary);
      }
    }
    return retDictionary;
  }

  loadConfigFiles(files: string[]) {
    let retfileContent: any;
    for (let file of files) {
      let fileContent = this.readConfigFile(file);
      retfileContent = this.dict_merge([retfileContent, fileContent]);
    }
    if ("AccountId" in retfileContent) {
      retfileContent.AccountId = ensureAccountIdLength(
        retfileContent.AccountId,
        this.AWS_ACCOUNT_ID_LEN
      );
    }

    return ensureStringValue(retfileContent);
  }
}

//   let retDict: any = {}
//   for (let dict in dictionaries) {
//       for (let k in dictionaries[dict]) {
//         retDict[k] = dictionaries[dict][k]
//       }
//   }
//   if ('AccountId' in retDict) {
//     retDict.AccountId = ensureAccountIdLength(retDict.AccountId, this.AWS_ACCOUNT_ID_LEN)
//   }
//   return retDict
// }
