import assert from 'node:assert/strict';
import {test} from 'node:test';
import {JSDOM} from 'jsdom';
const dom=new JSDOM('<!doctype html><html><body></body></html>',{url:'http://localhost'});
Object.assign(globalThis,{window:dom.window,document:dom.window.document,HTMLElement:dom.window.HTMLElement,IS_REACT_ACT_ENVIRONMENT:true});
Object.defineProperty(globalThis,'navigator',{value:dom.window.navigator,configurable:true});
const React=await import('react');
const {render,fireEvent,cleanup}=await import('@testing-library/react');
const module=await import('../.tmp-tests/NumericField.cjs');
const NumericField=module.default.default;
function Harness(){const [value,setValue]=React.useState(0);return React.createElement(NumericField,{label:'HV-',unit:'kV',value,onChange:setValue});}
test('keeps a negative draft until the operator finishes entering the voltage',()=>{
 const view=render(React.createElement(Harness));const input=view.getByRole('textbox');
 fireEvent.focus(input);
 fireEvent.change(input,{target:{value:''}});
 fireEvent.change(input,{target:{value:'-'}});
 assert.equal(input.value,'-','The negative sign must survive React effects before the next keystroke.');
 fireEvent.change(input,{target:{value:'-3'}});fireEvent.blur(input);
 assert.equal(input.value,'-3');cleanup();
});
test('keeps a leading decimal draft and accepts a comma decimal',()=>{
 cleanup();const view=render(React.createElement(Harness));const input=view.getByRole('textbox');
 fireEvent.focus(input);fireEvent.change(input,{target:{value:'.'}});
 assert.equal(input.value,'.');
 fireEvent.change(input,{target:{value:'-,5'}});fireEvent.blur(input);
 assert.equal(input.value,'-0.5');cleanup();
});
test('synchronizes a value supplied externally when the field is not being edited',()=>{
 cleanup();const change=()=>{};const props={label:'HV-',unit:'kV',onChange:change};
 const view=render(React.createElement(NumericField,{...props,value:0}));
 view.rerender(React.createElement(NumericField,{...props,value:-8}));
 assert.equal(view.getByRole('textbox').value,'-8');cleanup();
});
