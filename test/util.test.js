import Utils,{getFromPath,setFromPath} from '../src/util';
import Vue from 'vue';

Utils(Vue);


let base = {}


test('base.nested.object === undefined', () => {
    expect(getFromPath('nested.object', base)).toBe(undefined);
});

test('base.nested.object = 5', () => {
    setFromPath('nested.object', 5, base);
    expect(getFromPath('nested.object', base)).toBe(5);

});


test('base.nested.object.even.deeper = 10', () => {
    setFromPath('nested.object.even.deeper', 10, base);
    expect(getFromPath('nested.object.even.deeper', base)).toBe(10);
    expect(typeof getFromPath('nested.object',base)).toBe('object');
})