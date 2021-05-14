import { StringToDatePipe } from './string-to-date.pipe';

describe('StringToDatePipe', () => {
  it('create an instance', () => {
    const pipe = new StringToDatePipe();
    expect(pipe).toBeTruthy();
  });
});
