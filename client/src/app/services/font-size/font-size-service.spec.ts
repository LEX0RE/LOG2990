import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { DECREASE_ADD_FONT_SIZE, FONT_SIZE, FONT_SIZE_EASEL, INCREASE_FONT_SIZE } from '@app/constants/font-letter';
import { FontSizeService } from '@app/services/font-size/font-size.service';

describe('FontSizeService', () => {
    let service: FontSizeService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [RouterTestingModule.withRoutes([])],
        });
        service = TestBed.inject(FontSizeService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('onClickUp should raise number from fontSize if fontSize is smaller than the max', () => {
        const expectedNumber = 18;

        service.fontSize = expectedNumber + DECREASE_ADD_FONT_SIZE;

        service.onClickUp();
        expect(service.fontSize).toEqual(expectedNumber);
    });

    it('onClickUp should not raise number from fontSize if fontSize is bigger than the max', () => {
        const expectedNumber = FONT_SIZE.max + DECREASE_ADD_FONT_SIZE;

        service.fontSize = expectedNumber;

        service.onClickUp();
        expect(service.fontSize).toEqual(expectedNumber);
    });

    it('onClickDown should decrease number from fontSize if fontSize is bigger than the min', () => {
        const expectedNumber = 18;

        service.fontSize = expectedNumber + INCREASE_FONT_SIZE;

        service.onClickDown();
        expect(service.fontSize).toEqual(expectedNumber);
    });

    it('onClickDown should not decrease number from fontSize if fontSize is smaller than the min', () => {
        const expectedNumber = FONT_SIZE.min + INCREASE_FONT_SIZE;

        service.fontSize = expectedNumber;

        service.onClickDown();
        expect(service.fontSize).toEqual(expectedNumber);
    });

    it('onClickUp should raise number from fontSizeEasel if fontSizeEasel is smaller than the max', () => {
        const expectedNumber = 12;

        service.fontSizeEasel = expectedNumber + DECREASE_ADD_FONT_SIZE;

        service.onClickUp();
        expect(service.fontSizeEasel).toEqual(expectedNumber);
    });

    it('onClickUp should not raise number from fontSizeEasel if fontSizeEasel is bigger than the max', () => {
        const expectedNumber = FONT_SIZE_EASEL.max + DECREASE_ADD_FONT_SIZE;

        service.fontSizeEasel = expectedNumber;

        service.onClickUp();
        expect(service.fontSizeEasel).toEqual(expectedNumber);
    });

    it('onClickDown should decrease number from fontSizeEasel if fontSizeEasel is bigger than the min', () => {
        const expectedNumber = 12;

        service.fontSizeEasel = expectedNumber + INCREASE_FONT_SIZE;

        service.onClickDown();
        expect(service.fontSizeEasel).toEqual(expectedNumber);
    });

    it('onClickDown should not decrease number from fontSizeEasel if fontSizeEasel is smaller than the min', () => {
        const expectedNumber = FONT_SIZE_EASEL.min + INCREASE_FONT_SIZE;

        service.fontSizeEasel = expectedNumber;

        service.onClickDown();
        expect(service.fontSizeEasel).toEqual(expectedNumber);
    });
});
