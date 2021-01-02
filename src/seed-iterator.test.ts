import { SeedIterator } from './seed-iterator';

test('SeedIterator.indexToSeed works', () => {
    expect(SeedIterator.indexToSeed(0, 1)).toEqual('a');
    expect(SeedIterator.indexToSeed(1, 1)).toEqual('b');
    expect(SeedIterator.indexToSeed(0, 2)).toEqual('aa');
    expect(SeedIterator.indexToSeed(1, 2)).toEqual('ab');
    expect(SeedIterator.indexToSeed(28, 3)).toEqual('abc');
    expect(SeedIterator.indexToSeed(26**5-1, 5)).toEqual('zzzzz');

    // Default second argument
    expect(SeedIterator.indexToSeed(0)).toEqual('aaaaa');
    expect(SeedIterator.indexToSeed(1)).toEqual('aaaab');
    expect(SeedIterator.indexToSeed(26**5-1)).toEqual('zzzzz');

    // Wrap-around behavior
    expect(SeedIterator.indexToSeed(26**2, 2)).toEqual('aa');
    expect(SeedIterator.indexToSeed(10*26**2 + 28, 2)).toEqual('bc');
    expect(SeedIterator.indexToSeed(123456789)).toEqual('keekb');
});

test('Simple seed iteration works', () => {
    let i = new SeedIterator();
    expect(i.next()).toEqual({value: 'aaaaa', done: false});
    expect(i.next()).toEqual({value: 'aaaab', done: false});
    expect(i.next()).toEqual({value: 'aaaac', done: false});
    i.rewind();
    expect(i.next()).toEqual({value: 'aaaac', done: false});
    expect(i.index()).toEqual(3);

    while(i.index() !== 26) i.next();
    expect(i.next()).toEqual({value: 'aaaba', done: false});

    while(i.index() !== 26**2) i.next();
    expect(i.next()).toEqual({value: 'aabaa', done: false});

    while(i.index() !== 26**3) i.next();
    expect(i.next()).toEqual({value: 'abaaa', done: false});
});

test('Seed iteration halts after 26**5 seeds [SLOW]', () => {
    let i = new SeedIterator();
    for(let j = 0; j < 26**5-2; j++) i.next();
    expect(i.next()).toEqual({value: 'zzzzy', done: false});
    expect(i.next()).toEqual({value: 'zzzzz', done: false});
    i.rewind();
    expect(i.next()).toEqual({value: 'zzzzz', done: false});
    expect(i.next()).toEqual({value: undefined, done: true});
});
