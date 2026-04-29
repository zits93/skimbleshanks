import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PassengerSelect } from './PassengerSelect';

describe('PassengerSelect', () => {
    it('should render label and value', () => {
        render(<PassengerSelect label="어른" value={1} onChange={() => {}} />);
        expect(screen.getByText('어른')).toBeDefined();
        expect(screen.getByText('1')).toBeDefined();
    });

    it('should call onChange with incremented value', () => {
        const handleChange = vi.fn();
        render(<PassengerSelect label="어른" value={1} onChange={handleChange} />);
        
        const plusButton = screen.getByText('+');
        fireEvent.click(plusButton);
        
        expect(handleChange).toHaveBeenCalledWith(2);
    });

    it('should call onChange with decremented value but not below 0', () => {
        const handleChange = vi.fn();
        
        // Test decrement from 1 to 0
        const { rerender } = render(<PassengerSelect label="어른" value={1} onChange={handleChange} />);
        const minusButton = screen.getByText('-');
        fireEvent.click(minusButton);
        expect(handleChange).toHaveBeenCalledWith(0);

        // Test decrement from 0 (should not call onChange or at least not with -1)
        handleChange.mockClear();
        rerender(<PassengerSelect label="어른" value={0} onChange={handleChange} />);
        fireEvent.click(minusButton);
        expect(handleChange).not.toHaveBeenCalled();
    });
});
