/**
 * @flow
 */

jest.disableAutomock();

import {buildValueClass, deserialize} from '../types-lib'

describe('types', () => {
    it('generates types', () => {
        const Point = buildValueClass('Point', ['x', 'y']);
        const p = new Point({x: 5, y: 7});
        expect(p.x).toEqual(5);
        expect(p.withX(9).x).toEqual(9);
        expect(p.updateY(y => y - 3).y).toEqual(4);
    });

    it('serializes and deserializes types', () => {
        const Rect = buildValueClass(
            'Rect', ['topLeft', 'bottomRight', 'color', 'depth', 'owner']);
        const Point = buildValueClass('Point', ['x', 'y']);
        const rect = new Rect({
            topLeft: new Point({
                x: 5,
                y: 7,
            }),
            bottomRight: new Point({
                x: 10,
                y: 12,
            }),
            color: 'green',
            depth: 3,
            owner: null,
        });
        const serializedRect = rect.serialize();
        expect(serializedRect).toEqual({
            __SERIALIZED_CLASS: 'Rect',
            topLeft: {
                __SERIALIZED_CLASS: 'Point',
                x: 5,
                y: 7,
            },
            bottomRight: {
                __SERIALIZED_CLASS: 'Point',
                x: 10,
                y: 12,
            },
            color: 'green',
            depth: 3,
            owner: null,
        });
        const rect2 = deserialize(serializedRect);
        expect(rect2.color).toEqual('green');
        expect(rect2.owner).toEqual(null);
        expect(rect2.topLeft.y).toEqual(7);
        expect(rect2.bottomRight.updateX(x => x - 2).x).toEqual(8);
    })
});