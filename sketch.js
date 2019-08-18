const l = console.log;
// root name
let classnameInput;

// button
let transformBtn;

// input
let inputElt;

// output
let outputElt;

// select
let selectEle;
let dtoSelectEle;

// editor
let inputMirror;
let outputMirror;

function setup() {
  noCanvas();
  classnameInput = select("#classname");
  inputElt = select("#jsobj").value(objectText);
  transformBtn = select("#transform");
  outputElt = select("#built_value");
  selectEle = select("#select");
  dtoSelectEle = select("#dtoSelect");

  inputMirror = CodeMirror.fromTextArea(inputElt.elt, {
    lineNumbers: true,
    mode: "javascript",
    theme: "dracula"
  });

  outputMirror = CodeMirror.fromTextArea(outputElt.elt, {
    lineNumbers: true,
    mode: "javascript",
    theme: "dracula"
  });

  transformBtn.mouseClicked(transform);
  selectEle.changed(selectChanged);
  dtoSelectEle.changed(dtoSelectChanged);
}

// 点击转换按钮
function transform() {
  let jsObject = getParse();
  let rootName = classnameInput.value().trim();
  let builtValue = new BuiltValue(jsObject, rootName);
  outputMirror.setValue(builtValue.trim());
}

// object string or JSON
function getParse() {
  let selectvalue = selectEle.value().trim();
  let value = inputMirror.getValue().trim();
  let parse;
  if (selectvalue == 1) {
    parse = new Function("return " + value)();
  } else if (selectvalue == 2) {
    parse = JSON.parse(value);
  }
  return parse;
}

function selectChanged() {
  let v = selectEle.value().trim();
  if (v == 1) {
    jsonText = inputMirror.getValue().trim();
    inputMirror.setValue(objectText);
  } else if (v == 2) {
    objectText = inputMirror.getValue().trim();
    inputMirror.setValue(jsonText);
  }
}

function dtoSelectChanged() {
  let v = dtoSelectEle.value().trim();
  BuiltValueAttr.nameStr = v == 1 ? "Class" : "Dto";
}
