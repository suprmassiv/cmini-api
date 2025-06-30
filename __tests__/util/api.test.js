import { meta } from '@util/api'

describe('meta()', () => {
    test('it should return the correct page count', () => {
        let m = meta([1,2,3,4,5], 1, 1)
        expect(m.totalPages).toBe(5);

        m = meta([1,2,3,4,5,6,7,8,9,10], 1, 25)
        expect(m.totalPages).toBe(1);

        m = meta([1,2,3,4,5,6,7,8,9,10], 1, 4)
        expect(m.totalPages).toBe(3);

        m = meta([1,2,3,4,5,6,7,8,9,10], 10, 4)
        expect(m.totalPages).toBe(3);
    });

    test('it should return the correct hasMore', () => {
        let m = meta([1,2,3,4,5], 1, 1)
        expect(m.hasMore).toBe(true);

        m = meta([1,2,3,4,5,6,7,8,9,10], 1, 25)
        expect(m.hasMore).toBe(false);

        m = meta([1,2,3,4,5,6,7,8,9,10], 1, 4)
        expect(m.hasMore).toBe(true);
    
        m = meta([1,2,3,4,5,6,7,8,9,10], 10, 4)
        expect(m.hasMore).toBe(false);
    });

    test('it should return the correct length', () => {
        let m = meta([1,2,3,4,5], 1, 1)
        expect(m.rows.length).toBe(1);

        m = meta([1,2,3,4,5,6,7,8,9,10], 1, 25)
        expect(m.rows.length).toBe(10);

        m = meta([1,2,3,4,5,6,7,8,9,10], 1, 4)
        expect(m.rows.length).toBe(4);
        
        m = meta([1,2,3,4,5,6,7,8,9,10], 2, 4)
        expect(m.rows.length).toBe(4);

        m = meta([1,2,3,4,5,6,7,8,9,10], 3, 4)
        expect(m.rows.length).toBe(2);

        m = meta([1,2,3,4,5,6,7,8,9,10], 4, 4)
        expect(m.rows.length).toBe(0);
    
        m = meta([1,2,3,4,5,6,7,8,9,10], 10, 4)
        expect(m.rows.length).toBe(0);
    });
})
