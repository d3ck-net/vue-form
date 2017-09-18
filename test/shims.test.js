import shims from '../src/shims';
import Vue from 'vue';

global.Vue = Vue;

let basicComp = new (Vue.extend(shims));

let base = {}

test('base.nested.object === undefined', () => {
    expect(basicComp.getFromPath('nested.object', base)).toBe(undefined);
});

test('base.nested.object = 5', () => {
    basicComp.setFromPath('nested.object', 5, base);
    expect(basicComp.getFromPath('nested.object', base)).toBe(5);

});

//!!!
//override the base.nested.object = 5 ?
//or throw (like it is currently) ?
test('base.nested.object.even.deeper = 10', () => {
    expect(() => {
        basicComp.setFromPath('nested.object.even.deeper', 10, base)
    }).toThrow();
})