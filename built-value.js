class BuiltValueAttr {
  static nameStr = "Class";
  constructor(k, resultValue) {
    this.k = k;
    this.rs = resultValue;
  }
}
class BuiltValue {
  constructor(jsObject, rootName) {
    this.jsObject = jsObject;
    this.rootName = rootName;
    this.resultObj = {};
    this.makeResultArr(this.jsObject, this.rootName);
    let resultString = this.makeResultString(this.resultObj);
    resultString = this.addHeader(resultString);
    return new String(resultString);
  }

  // 构建一个built_value树
  makeResultArr(data, name) {
    if (_.isObjectLike(data)) {
      if (_.isArray(data)) {
        data = _.first(data);
      }

      let resultObj = this.resultObj;
      name = _.upperFirst(name);
      resultObj[name] = {};
      resultObj[name]["keys"] = [];

      // 遍历 object
      for (let k in data) {
        let v = data[k];
        let type = typeof v;
        if (type === "object") {
          if (_.isNull(v)) {
            let typeObj = this.createType(v);
            resultObj[name]["keys"].push(
              new BuiltValueAttr(k, this.makeBuiltValueAttr(typeObj, k, v))
            );
          } else if (_.isArray(v)) {
            if (_.isEmpty(v)) return alert(`delete empty array: ${k}`);
            let firstv = _.first(v);
            if (_.isArray(firstv))
              return alert(`data error: [ ${JSON.stringify(firstv)}, ...]`);
            if (typeof firstv !== "object") {
              // string, number, boolean
              let typeObj = this.createType(firstv);
              resultObj[name]["keys"].push(
                new BuiltValueAttr(
                  k,
                  this.makeBuiltValueAttr(typeObj, k, v, true)
                )
              );
            } else {
              let dartType = _.upperFirst(k + BuiltValueAttr.nameStr);
              resultObj[name]["keys"].push(
                new BuiltValueAttr(
                  k,
                  this.makeBuiltValueAttr(dartType, k, v, true)
                )
              );
              this.makeResultArr(firstv, k + BuiltValueAttr.nameStr);
            }
          } else if (_.isPlainObject(v)) {
            // object
            let typeObj = _.upperFirst(k + BuiltValueAttr.nameStr);
            resultObj[name]["keys"].push(
              new BuiltValueAttr(k, this.makeBuiltValueAttr(typeObj, k, v))
            );
            this.makeResultArr(v, k + BuiltValueAttr.nameStr);
          }
        } else {
          // string, number, boolean, undefined
          let typeObj = this.createType(v);
          resultObj[name]["keys"].push(
            new BuiltValueAttr(k, this.makeBuiltValueAttr(typeObj, k, v))
          );
        }
      }
    }
  }

  makeResultString(obj) {
    let resultString = ``;
    for (const k in obj) {
      let v = obj[k];

      let attrs = ``;
      for (const key of v.keys.sort()) {
        attrs += key["rs"];
      }

      resultString =
        `
// ${k}
export class ${k} {${attrs}
}` + resultString;
    }
    return resultString;
  }

  // 添加头文件
  addHeader(resultString) {
    let header = `import { ApiModelProperty } from '@nestjs/swagger';`;
    return header + resultString;
  }

  makeBuiltValueAttr(type, k, v, isList = false) {
    let example = v;
    if (type === "String") {
      example = isList ? `['${example}']` : `'${example}'`;
    }

    let isClass = _.endsWith(type, BuiltValueAttr.nameStr);
    let exampleString = isClass ? `` : `example: ${example},`;
    let isArrayString = isList ? `isArray: true,` : ``;
    return `
  
  @ApiModelProperty({
    ${isArrayString}
    type: ${type},
    ${exampleString}
  })
  readonly ${k}: ${type}${isList ? "[]" : ""};`;
  }
  createType(v) {
    let type;
    if (_.isInteger(v)) {
      type = "Number";
    } else if (_.isString(v)) {
      type = "String";
    } else if (_.isBoolean(v)) {
      type = "Boolean";
    } else {
      // 把其它转化为空的字符串
      type = "";
    }
    return type;
  }
}
